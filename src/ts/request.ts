export default class Request {
  instance;
  constructor(instance) {
    this.instance = instance;
  }

  public currentRequest;


  public send(authUrl: string, url: string, method: 'GET' | 'POST', callback: (data: object) => void, data?: string, headers: { key: string, value: string | boolean }[] = []): void {
    this.currentRequest = new XMLHttpRequest();
    if(authUrl.includes("demo"))
    {
      this.currentRequest.open(method, authUrl, true);
    }
    else
    {
      const githubDemoURL = authUrl + url;
      console.log(githubDemoURL);
      this.currentRequest.open(method, githubDemoURL, true);
    }
    this.currentRequest.timeout = 20000; // 5 seconds
    this.currentRequest.setRequestHeader('auth-token', this.instance.options.token);
    this.currentRequest.setRequestHeader('Content-Type', 'application/json');
    this.currentRequest.setRequestHeader('Accept', 'application/json');
    var cookie = this.getCookie("EAVDVSCookie");
    if(cookie != null){
      console.log('cookie: ' + cookie);
      this.currentRequest.setRequestHeader('EAVDVS', cookie);
    }
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    console.log(code);
    if(code != null)
    {
      this.currentRequest.setRequestHeader('Bearer-Token', code);
    }

    if((method === 'POST') && (authUrl.includes("demo"))){
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
        const dataWrapped = {
          url: url,
          body: this.currentRequest.responseText
        };
        this.instance.events.trigger('post-search', xhr);
        callback(JSON.parse(this.currentRequest.responseText));
      } else if(this.currentRequest.status === 429) {
        this.instance.searchSpinner.hide();

        // We reached our target server, but it returned an error
        document.getElementById('limitexceeded').classList.remove("hidden");
        document.getElementById('limitexceeded').style.display = "block";
      } else {
        // We reached our target server, but it returned an error
        this.instance.searchSpinner.hide();

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

    this.currentRequest.send(data);
  }

  getCookie(name: string): string | null {
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}
}