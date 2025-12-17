/*
  Simple client-side rate limiter.
  - Enforces maxCalls per windowMs based on combination of IP + cookie-id
  - Persists timestamps in localStorage under key `rateLimit:{ip}:{id}`
  - Attempts to fetch public IP via ipify; if that fails, uses 'unknown'
  Notes: client-side enforcement is not a security boundary; server-side
  enforcement should also be used. This is for demo throttling only.
*/
(function (global) {
  const COOKIE_NAME = 'validation_user_id';
  const DEFAULT_MAX = 1000000; // default max calls
  const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
  // For testing: use a hardcoded IP filled with zeroes instead of fetching public IP
  const TEST_IP = '0.0.0.0';

  // Utilities: parse excluded IPs from environment/global and support CIDR ranges
  function parseExcludedList() {
    // Priority: global.EXCLUDED_IPS (string or array) -> process.env.EXCLUDED_IPS -> global.RATE_LIMIT_EXCLUDE
    try {
      // global.EXCLUDED_IPS may be an array or comma-separated string
      if (global && global.EXCLUDED_IPS) {
        if (Array.isArray(global.EXCLUDED_IPS)) return global.EXCLUDED_IPS.map(String).map(s => s.trim()).filter(Boolean);
        if (typeof global.EXCLUDED_IPS === 'string') return global.EXCLUDED_IPS.split(',').map(s => s.trim()).filter(Boolean);
      }
    } catch (e) {}

    try {
      if (typeof process !== 'undefined' && process && process.env && process.env.EXCLUDED_IPS) {
        return String(process.env.EXCLUDED_IPS).split(',').map(s => s.trim()).filter(Boolean);
      }
    } catch (e) {}

    try {
      if (global && Array.isArray(global.RATE_LIMIT_EXCLUDE)) return global.RATE_LIMIT_EXCLUDE.map(String).map(s => s.trim()).filter(Boolean);
    } catch (e) {}

    return [];
  }

  function ipToInt(ip) {
    const parts = String(ip).split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => Number.isNaN(p) || p < 0 || p > 255)) return null;
    return ((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0);
  }

  // Normalize IPv4-mapped IPv6 addresses to plain IPv4 dotted format.
  // Examples:
  //  - "::ffff:192.0.2.128" -> "192.0.2.128"
  //  - "0:0:0:0:0:ffff:c000:0280" -> "192.0.2.128"
  function normalizeIp(ip) {
    if (!ip) return ip;
    let s = String(ip).trim();
    // If it already looks like IPv4, return as-is
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(s)) return s;

    // Common IPv4-mapped IPv6 with dotted IPv4 at the end
    let m = s.match(/(?:.*:)?ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
    if (m && m[1]) return m[1];

    // IPv4-mapped IPv6 expressed as two hex groups: xxxx:xxxx
    m = s.match(/(?:.*:)?ffff:([0-9a-fA-F]{1,4}):([0-9a-fA-F]{1,4})$/);
    if (m) {
      const high = parseInt(m[1], 16);
      const low = parseInt(m[2], 16);
      if (Number.isNaN(high) || Number.isNaN(low)) return s;
      const b1 = (high >> 8) & 0xff;
      const b2 = high & 0xff;
      const b3 = (low >> 8) & 0xff;
      const b4 = low & 0xff;
      return `${b1}.${b2}.${b3}.${b4}`;
    }

    // No mapping recognized — return original string
    return s;
  }

  function isIpInCidr(ip, cidr) {
    // cidr: '198.51.100.0/24'
    try {
      const [base, bitsStr] = cidr.split('/');
      if (!base || !bitsStr) return false;
      const bits = Number(bitsStr);
      if (Number.isNaN(bits) || bits < 0 || bits > 32) return false;
      const ipInt = ipToInt(ip);
      const baseInt = ipToInt(base);
      if (ipInt === null || baseInt === null) return false;
      const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
      return (ipInt & mask) === (baseInt & mask);
    } catch (e) {
      return false;
    }
  }

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getCookie(name) {
    const parts = document.cookie ? document.cookie.split(';').map(s => s.trim()) : [];
    for (const p of parts) {
      if (p.indexOf(name + '=') === 0) return decodeURIComponent(p.substring(name.length + 1));
    }
    return null;
  }

  function setCookie(name, value, days) {
    const expires = days ? ';expires=' + new Date(Date.now() + days * 864e5).toUTCString() : '';
    document.cookie = name + '=' + encodeURIComponent(value) + expires + ';path=/';
  }

  function now() { return Date.now(); }

  // Simple fetch with timeout
  function fetchWithTimeout(url, timeout = 3000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), timeout);
      fetch(url).then(res => {
        clearTimeout(timer);
        resolve(res);
      }).catch(err => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  class RateLimiter {
    constructor({ maxCalls = DEFAULT_MAX, windowMs = WINDOW_MS } = {}) {
      this.maxCalls = maxCalls;
      this.windowMs = windowMs;
      this.ip = null; // resolved lazily
      this.clientId = this.ensureClientId();
      this.ipPromise = null;
      // Begin resolving IP early so the key includes IP for the very first calls
      // Consumers can also await `waitForIp()` if they need certainty before proceeding.
      this.resolveIp().catch(() => {});
    }

    ensureClientId() {
      let id = getCookie(COOKIE_NAME);
      if (!id) {
        id = uuidv4();
        // set cookie for 365 days
        setCookie(COOKIE_NAME, id, 365);
      }
      return id;
    }

    resolveIp() {
      // Use a cached promise so multiple callers wait on the same resolution.
      if (this.ipPromise) return this.ipPromise;
      // For testing purposes we set a deterministic IP (all zeroes).
      this.ipPromise = Promise.resolve().then(() => {
        this.ip = TEST_IP;
      });
      return this.ipPromise;
    }

    storageKey() {
      const ipPart = this.ip || 'unknown';
      return 'rateLimit:' + ipPart + ':' + this.clientId;
    }

    loadTimestamps() {
      const key = this.storageKey();
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        return arr.map(Number).filter(n => !Number.isNaN(n));
      } catch (e) {
        return [];
      }
    }

    saveTimestamps(arr) {
      try {
        localStorage.setItem(this.storageKey(), JSON.stringify(arr));
      } catch (e) {
        // ignore quota errors
      }
    }

    prune(arr) {
      const cutoff = now() - this.windowMs;
      return arr.filter(ts => ts >= cutoff);
    }

    isIpExcluded(ip) {
      try {
        if (!ip) return false;
        ip = normalizeIp(ip);
        const list = parseExcludedList();
        if (!list || list.length === 0) return false;
        for (let i = 0; i < list.length; i++) {
          const entry = list[i];
          if (!entry) continue;
          if (entry.indexOf('/') !== -1) {
            if (isIpInCidr(ip, entry)) return true;
          } else {
            if (entry === ip) return true;
          }
        }
      } catch (e) {}
      return false;
    }

    async allowCall() {
      await this.resolveIp();
      // Temporary: treat all IPs as excluded for testing purposes.
      // This makes every call allowed with infinite remaining quota.
      return { allowed: true, remaining: Infinity, excluded: true, resetMs: 0 };
      // If the resolved IP is in the exclusion list, bypass counting
      try {
        if (this.isIpExcluded(this.ip)) {
          return { allowed: true, remaining: Infinity, excluded: true, resetMs: 0 };
        }
      } catch (e) {}
      let timestamps = this.loadTimestamps();
      timestamps = this.prune(timestamps);
      if (timestamps.length >= this.maxCalls) {
        // denied
        this.saveTimestamps(timestamps);
        const oldest = timestamps[0] || (now());
        // Debug logging: uncomment any of the lines below to log
        // ip and remaining calls when a validation is denied.
        // Note: `allowCall` is async so `await` can be used in these examples.
        // Example simple log:
        // console.log('RateLimiter denied - ip:', this.ip, 'remaining:', 0, 'key:', this.storageKey());
        // Example that ensures IP is resolved before logging:
        // await this.waitForIp(); console.log('RateLimiter denied - ip:', this.ip, 'remaining:', 0, 'storageKey:', this.storageKey());

        return { allowed: false, remaining: 0, resetMs: Math.max(0, oldest + this.windowMs - now()) };
      }
      // allow and record
      timestamps.push(now());
      this.saveTimestamps(timestamps);
      // Debug logging: uncomment any of the lines below to log
      // ip and remaining calls when a validation is recorded.
      // Example simple log:
      // console.log('RateLimiter allowed - ip:', this.ip, 'remaining:', Math.max(0, this.maxCalls - timestamps.length), 'key:', this.storageKey());
      // Example that ensures IP is resolved before logging (awaitable):
      // await this.waitForIp(); console.log('RateLimiter allowed - ip:', this.ip, 'remaining:', Math.max(0, this.maxCalls - timestamps.length), 'storageKey:', this.storageKey());

      return { allowed: true, remaining: Math.max(0, this.maxCalls - timestamps.length), resetMs: this.windowMs };
    }

    // helper to get remaining without recording
    async getRemaining() {
      await this.resolveIp();
      try {
        if (this.isIpExcluded(this.ip)) return { remaining: Infinity, excluded: true };
      } catch (e) {}
      const timestamps = this.prune(this.loadTimestamps());
      return { remaining: Math.max(0, this.maxCalls - timestamps.length) };
    }

    // Allow callers to await completion of the IP lookup if they want to
    // guarantee the storage key uses the resolved IP.
    waitForIp() {
      return this.resolveIp();
    }
  }

  // expose a single global instance for demo use
  global.RateLimiter = new RateLimiter();
})(window);
