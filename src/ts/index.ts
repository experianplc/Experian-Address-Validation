import AddressValidation from './address-search';

declare global {
  interface Window {
    AddressValidation: any;
  }
}

window.AddressValidation = AddressValidation;