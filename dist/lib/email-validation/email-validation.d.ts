import EventFactory from '../event-factory';
import Request from '../request';
import { EmailValidateOptions } from './email-validate-options';
export default class EmailValidation {
    options: EmailValidateOptions;
    private baseUrl;
    private emailValidationV2;
    events: EventFactory;
    request: Request;
    constructor(options: EmailValidateOptions);
    validateEmail(email: string): void;
    private searchSpinner;
}
