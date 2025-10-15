import EmailValidation from './email-validation/email-validation';
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
