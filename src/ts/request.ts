export default class Request {
  instance;
  constructor(instance) {
    this.instance = instance;
  }

  public currentRequest;


  public send(url: string, method: 'GET' | 'POST', callback: (data: object) => void, data?: string, headers: { key: string, value: string | boolean }[] = []): void {
    this.currentRequest = new XMLHttpRequest();
    this.currentRequest.open(method, url, true);
    this.currentRequest.timeout = 10000; // 5 seconds
    this.currentRequest.setRequestHeader('auth-token', this.instance.options.token);
    this.currentRequest.setRequestHeader('Content-Type', 'application/json');
    this.currentRequest.setRequestHeader('Accept', 'application/json');

    // Add additional headers if supplied
    headers.forEach(header => this.currentRequest.setRequestHeader(header.key, header.value));

    this.currentRequest.onload = (xhr) => {
      if (this.currentRequest.status >= 200 && this.currentRequest.status < 400) {
        // Success!
        const data = JSON.parse(this.currentRequest.responseText);
        callback(data);
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
}