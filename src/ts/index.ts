import AddressValidation from './address-search';
import EmailValidation from './email-validation/email-validation';

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