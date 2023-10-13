var Request = /** @class */ (function () {
    function Request(instance) {
        this.instance = instance;
    }
    Request.prototype.send = function (url, method, callback, data, headers) {
        var _this = this;
        if (headers === void 0) { headers = []; }
        this.currentRequest = new XMLHttpRequest();
        this.currentRequest.open(method, url, true);
        this.currentRequest.timeout = 5000; // 5 seconds
        this.currentRequest.setRequestHeader('auth-token', this.instance.options.token);
        this.currentRequest.setRequestHeader('Content-Type', 'application/json');
        this.currentRequest.setRequestHeader('Accept', 'application/json');
        // Add additional headers if supplied
        headers.forEach(function (header) { return _this.currentRequest.setRequestHeader(header.key, header.value); });
        this.currentRequest.onload = function (xhr) {
            if (_this.currentRequest.status >= 200 && _this.currentRequest.status < 400) {
                // Success!
                var data_1 = JSON.parse(_this.currentRequest.responseText);
                callback(data_1);
            }
            else {
                // We reached our target server, but it returned an error
                _this.instance.searchSpinner.hide();
                // Fire an event to notify users of a general error
                _this.instance.events.trigger('request-error', xhr);
                // Fire an event for the specific status code
                _this.instance.events.trigger("request-error-".concat(_this.currentRequest.status), xhr);
            }
        };
        this.currentRequest.onerror = function (xhr) {
            // There was a connection error of some sort
            // Hide the inline search spinner
            _this.instance.searchSpinner.hide();
            // Fire an event to notify users of an error
            _this.instance.events.trigger('request-error', xhr);
        };
        this.currentRequest.ontimeout = function (xhr) {
            // There was a connection timeout
            // Hide the inline search spinner
            _this.instance.searchSpinner.hide();
            // Fire an event to notify users of the timeout
            _this.instance.events.trigger('request-timeout', xhr);
        };
        this.currentRequest.send(data);
    };
    return Request;
}());
export default Request;
//# sourceMappingURL=request.js.map