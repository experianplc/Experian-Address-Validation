import EventFactory from '../event-factory';
import Request from '../request';
import { PhoneValidateOptions } from './phone-validate-options';
import { PhoneValidationRequest } from './phone-class-types';
export default class PhoneValidation {
    options: PhoneValidateOptions;
    private baseUrl;
    private phoneValidationV2;
    events: EventFactory;
    request: Request;
    constructor(options: PhoneValidateOptions);
    validatePhone(request: PhoneValidationRequest): void;
}
