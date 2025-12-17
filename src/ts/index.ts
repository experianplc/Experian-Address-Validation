import '../js/rate-limit.js';
import AddressValidation from './address-search';
import EmailValidation from './email-validation/email-validation';
import PhoneValidation from './phone-validation/phone-validation';

declare global {
  interface Window {
    AddressValidation: any;
  }
}

window.AddressValidation = AddressValidation;

declare global {
  interface Window {
    EmailValidation: typeof EmailValidation;
  }
}

window.EmailValidation = EmailValidation;

declare global {
  interface Window {
    PhoneValidation: typeof PhoneValidation;
  }
}

window.PhoneValidation = PhoneValidation;