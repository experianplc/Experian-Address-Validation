var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Request = /** @class */ (function () {
    function Request(instance) {
        this.instance = instance;
    }
    Request.prototype.send = function (authUrl, url, method, callback, data, headers) {
        if (headers === void 0) { headers = []; }
        return __awaiter(this, void 0, void 0, function () {
            var cookie, params, code, resp, dataWrapped;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.currentRequest = new XMLHttpRequest();
                        this.currentRequest.open(method, authUrl, true);
                        this.currentRequest.timeout = 20000; // 5 seconds
                        this.currentRequest.setRequestHeader('auth-token', this.instance.options.token);
                        this.currentRequest.setRequestHeader('Content-Type', 'application/json');
                        this.currentRequest.setRequestHeader('Accept', 'application/json');
                        cookie = this.getCookie("EAVDVSCookie");
                        console.log('cookie: ' + cookie);
                        this.currentRequest.setRequestHeader('EAVDVS', cookie);
                        params = new URLSearchParams(window.location.search);
                        code = params.get("code");
                        console.log(code);
                        console.log('calling server function from request.ts');
                        return [4 /*yield*/, fetch("/api/weather?city=test")];
                    case 1:
                        resp = _a.sent();
                        console.log('finished calling server function from request.ts');
                        if (code != null) {
                            this.currentRequest.setRequestHeader('Bearer-Token', code);
                        }
                        if (method === 'POST') {
                            dataWrapped = {
                                url: url,
                                body: data
                            };
                            data = JSON.stringify(dataWrapped);
                        }
                        // Add additional headers if supplied
                        headers.forEach(function (header) { return _this.currentRequest.setRequestHeader(header.key, header.value); });
                        this.currentRequest.onload = function (xhr) {
                            if (_this.currentRequest.status >= 200 && _this.currentRequest.status < 400) {
                                // Success!
                                var dataWrapped = {
                                    url: url,
                                    body: _this.currentRequest.responseText
                                };
                                var data_1 = JSON.parse(JSON.stringify(dataWrapped));
                                _this.instance.events.trigger('post-search', xhr);
                                callback(JSON.parse(_this.currentRequest.responseText));
                            }
                            else if (_this.currentRequest.status === 429) {
                                _this.instance.searchSpinner.hide();
                                // We reached our target server, but it returned an error
                                document.getElementById('limitexceeded').classList.remove("hidden");
                                document.getElementById('limitexceeded').style.display = "block";
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
                        return [2 /*return*/];
                }
            });
        });
    };
    Request.prototype.getCookie = function (name) {
        var cookies = document.cookie.split("; ");
        for (var _i = 0, cookies_1 = cookies; _i < cookies_1.length; _i++) {
            var cookie = cookies_1[_i];
            var _a = cookie.split("="), key = _a[0], rest = _a.slice(1);
            if (key === name) {
                return decodeURIComponent(rest.join("="));
            }
        }
        return null;
    };
    return Request;
}());
export default Request;
//# sourceMappingURL=request.js.map