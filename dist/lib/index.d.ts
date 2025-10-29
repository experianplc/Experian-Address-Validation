import EmailValidation from './email-validation/email-validation';
import PhoneValidation from './phone-validation/phone-validation';
declare global {
    interface Window {
        AddressValidation: any;
    }
}
declare global {
    interface Window {
        EmailValidation: typeof EmailValidation;
    }
}
declare global {
    interface Window {
        PhoneValidation: typeof PhoneValidation;
    }
}
