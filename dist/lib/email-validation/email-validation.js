import EventFactory from '../event-factory';
import Request from '../request';
var EmailValidation = /** @class */ (function () {
    function EmailValidation(options) {
        this.baseUrl = 'https://api.experianaperture.io/';
        this.emailValidationV2 = 'email/validate/v2';
        this.options = options;
        this.events = new EventFactory();
        this.request = new Request(this);
    }
    EmailValidation.prototype.validateEmail = function (email) {
        var _this = this;
        var data = JSON.stringify({ email: email });
        this.request.send(this.baseUrl, this.emailValidationV2, 'POST', function (response) {
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
    return EmailValidation;
}());
export default EmailValidation;
//# sourceMappingURL=email-validation.js.map