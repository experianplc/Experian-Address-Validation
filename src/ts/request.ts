export default class Request {
  instance;
  private static readonly SAFE_COOKIE_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;
  private static readonly SAFE_COOKIE_VALUE_PATTERN = /^[A-Za-z0-9._~+/=-]+$/;
  private static readonly MAX_COOKIE_VALUE_LENGTH = 512;
  private static readonly SAFE_BEARER_TOKEN_PATTERN = /^[A-Za-z0-9._~+/=-]+$/;
  private static readonly MAX_BEARER_TOKEN_LENGTH = 2048;
private static readonly UNSAFE_HTML_CHARS_PATTERN = /[<>"`&]/g;
  private static readonly CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F]/g;

  constructor(instance) {
    this.instance = instance;
  }

  public currentRequest;

  // Snapshot of the most recent API call, used to power the "JSON" view in the demo UI.
  // Only the non-sensitive, business-level headers are kept (auth tokens/cookies are never stored here).
  public lastRequestInfo: { url: string; method: string; headers: Record<string, string | boolean>; body: unknown } | null = null;
  public lastResponseInfo: unknown = null;

  public abort(): void {
    if (this.currentRequest && this.currentRequest.readyState !== XMLHttpRequest.DONE) {
      this.currentRequest.abort();
    }
  }

  public send(authUrl: string, url: string, method: 'GET' | 'POST', callback: (data: object) => void, data?: string, headers: { key: string, value: string | boolean }[] = []): void {
    this.currentRequest = new XMLHttpRequest();
    this.lastRequestInfo = {
      url,
      method,
      headers: headers.reduce((safeHeaders, header) => {
        safeHeaders[header.key] = header.value;
        return safeHeaders;
      }, {} as Record<string, string | boolean>),
      body: this.safeParseJson(data || '') ?? data ?? null
    };
    if(authUrl.includes("auth/request"))
    {
      this.currentRequest.open(method, authUrl, true);
    }
    else
    {
      const githubDemoURL = authUrl + url;
      this.currentRequest.open(method, githubDemoURL, true);
    }
    this.currentRequest.timeout = 20000; // 5 seconds
    this.currentRequest.setRequestHeader('auth-token', this.instance.options.token);
    this.currentRequest.setRequestHeader('Content-Type', 'application/json');
    this.currentRequest.setRequestHeader('Accept', 'application/json');
    var cookie = this.getCookie("EAVDVSCookie");
    if(cookie != null){
      this.currentRequest.setRequestHeader('EAVDVS', cookie);
    }
    const params = new URLSearchParams(window.location.search);
    const code = this.sanitizeBearerToken(params.get("code"));
    if(code != null)
    {
      this.currentRequest.setRequestHeader('Bearer-Token', code);
    }

    if((method === 'POST') && (authUrl.includes("auth/request"))){
      const dataWrapped = {
        url: url,
        body: data
      };
      data = JSON.stringify(dataWrapped);
    }
    // Add additional headers if supplied
    headers.forEach(header => this.currentRequest.setRequestHeader(header.key, header.value));

    this.currentRequest.onload = (xhr) => {
      if (this.currentRequest.status >= 200 && this.currentRequest.status < 400) {
        // Success!
        const parsedResponse = this.safeParseJson(this.currentRequest.responseText);
        if (!parsedResponse) {
          this.instance.events.trigger('request-error', xhr);
          this.instance.events.trigger('request-error-invalid-json', xhr);
          return;
        }

        const safeResponse = this.sanitizeResponsePayload(parsedResponse);
        this.lastResponseInfo = safeResponse;
        this.instance.events.trigger('post-search', xhr);

        if (
          safeResponse &&
          typeof safeResponse === 'object' &&
          'error' in safeResponse
        ) {
          this.instance.searchSpinner.hide();
          this.instance.events.trigger('request-error', xhr);
          this.instance.events.trigger('request-error-api', safeResponse.error);
          return;
        }

        callback(safeResponse);
      } else if(this.currentRequest.status === 429) {
        this.instance.searchSpinner.hide();

        // We reached our target server, but it returned an error
        document.getElementById('limitexceeded').classList.remove("hidden");
        document.getElementById('limitexceeded').style.display = "block";
      } else {
        // We reached our target server, but it returned an error
        this.instance.searchSpinner.hide();
        this.lastResponseInfo = { error: true, status: this.currentRequest.status };

        // Fire an event to notify users of a general error
        this.instance.events.trigger('request-error', xhr);
        // Fire an event for the specific status code
        this.instance.events.trigger(`request-error-${this.currentRequest.status}`, xhr);
      }
    };

    this.currentRequest.onerror = (xhr) => {
      // There was a connection error of some sort
      // Hide the inline search spinner
      this.instance.searchSpinner.hide();

      // Fire an event to notify users of an error
      this.instance.events.trigger('request-error', xhr);
    };

    this.currentRequest.ontimeout = (xhr) => {
      // There was a connection timeout
      // Hide the inline search spinner
      this.instance.searchSpinner.hide();

      // Fire an event to notify users of the timeout
      this.instance.events.trigger('request-timeout', xhr);
    };

    this.currentRequest.onabort = () => {
      // Request was aborted (e.g. superseded by a newer keystroke)
      // Hide the inline search spinner so it doesn't get stuck
      this.instance.searchSpinner.hide();
    };

    this.currentRequest.send(data);
  }

  private sanitizeCookieValue(value: string): string | null {
    const normalized = value.trim();

    if (!normalized || normalized.length > Request.MAX_COOKIE_VALUE_LENGTH) {
      return null;
    }

    if (!Request.SAFE_COOKIE_VALUE_PATTERN.test(normalized)) {
      return null;
    }

    return normalized;
  }

  private sanitizeBearerToken(token: string | null): string | null {
    if (!token) {
      return null;
    }

    const normalized = token.trim();

    if (!normalized || normalized.length > Request.MAX_BEARER_TOKEN_LENGTH) {
      return null;
    }

    if (!Request.SAFE_BEARER_TOKEN_PATTERN.test(normalized)) {
      return null;
    }

    return normalized;
  }

  private safeParseJson(value: string): object | null {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return null;
    }
  }

  private sanitizeString(value: string): string {
    // Remove characters commonly used to inject executable markup or break out of attributes.
    return value
      .replace(Request.CONTROL_CHARS_PATTERN, '')
      .replace(Request.UNSAFE_HTML_CHARS_PATTERN, '');
  }

  private sanitizeResponsePayload(payload: any): any {
    if (typeof payload === 'string') {
      return this.sanitizeString(payload);
    }

    if (Array.isArray(payload)) {
      return payload.map(item => this.sanitizeResponsePayload(item));
    }

    if (payload && typeof payload === 'object') {
      const safeObject = {};
      Object.keys(payload).forEach((key) => {
        if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
          return;
        }
        safeObject[key] = this.sanitizeResponsePayload(payload[key]);
      });
      return safeObject;
    }

    return payload;
  }

  getCookie(name: string): string | null {
    if (!Request.SAFE_COOKIE_NAME_PATTERN.test(name)) {
      return null;
    }

    if (!document.cookie) {
      return null;
    }

    const escapedName = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const cookiePattern = new RegExp('(?:^|;\\s*)' + escapedName + '=([^;]*)');
    const cookieMatch = cookiePattern.exec(document.cookie);

    if (!cookieMatch || cookieMatch.length < 2) {
      return null;
    }

    try {
      return this.sanitizeCookieValue(decodeURIComponent(cookieMatch[1]));
    } catch (_error) {
      return null;
    }
  }
}