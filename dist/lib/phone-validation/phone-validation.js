import EventFactory from '../event-factory';
import Request from '../request';
var PhoneValidation = /** @class */ (function () {
    function PhoneValidation(options) {
        this.baseUrl = 'https://api.experianaperture.io/';
        this.phoneValidationV2 = 'phone/validate/v2';
        this.options = options;
        this.events = new EventFactory();
        this.request = new Request(this);
    }
    PhoneValidation.prototype.validatePhone = function (request) {
        var _this = this;
        var data = JSON.stringify(request);
        this.request.send(this.baseUrl, this.phoneValidationV2, 'POST', function (response) {
            try {
                var result = response;
                _this.events.trigger('post-validation', result);
            }
            catch (error) {
                _this.events.trigger('validation-error', 'Invalid response format.');
            }
        }, data, [
            { key: 'Add-Metadata', value: true }
        ]);
    };
    return PhoneValidation;
}());
export default PhoneValidation;
//# sourceMappingURL=phone-validation.js.map