export interface AddressSearchOptions {
  enabled: boolean;
  token: string;
  enrichmentToken: string;
  searchType: AddressValidationMode;
  maxSuggestions: number;
  language: string;
  location: string;
  useSpinner: boolean;
  countryCode?: string;
  countryCodeMapping?: {[key: string]: string};
  applyFocus: boolean;
  placeholderText: string;
  useAddressEnteredText: string;
  searchAgain: {visible?: boolean, text?: string, link?: HTMLButtonElement};
  formattedAddressContainer: {showHeading: boolean, headingType: string, validatedHeadingText: string, manualHeadingText: string};
  elements: {input?: HTMLInputElement, inputs?: HTMLInputElement[], countryList?: HTMLSelectElement, address_line_1?: HTMLInputElement, address_line_2?: HTMLInputElement, address_line_3?: HTMLInputElement, locality?: HTMLInputElement, region?: HTMLInputElement, postal_code?: HTMLInputElement, country?: HTMLInputElement, formattedAddressContainer?: HTMLElement, lookupButton?: HTMLButtonElement};
}

export enum AddressValidationMode {
  AUTOCOMPLETE = 'autocomplete',
  SINGLELINE = 'singleline',
  VALIDATE = 'validate'
}

// Default settings
export const defaults = {
  searchType: AddressValidationMode.AUTOCOMPLETE,
  input: {placeholderText: 'Start typing an address...', applyFocus: false},
  formattedAddressContainer: {showHeading: false, headingType: 'h3', validatedHeadingText: 'Validated address', manualHeadingText: 'Manual address entered'},
  searchAgain: {visible: true, text: 'Search again'},
  useAddressEnteredText: '<em> - Enter address manually or keep typing...</em>',
  useSpinner: false,
  language: 'en',
  addressLineLabels: [
    'address_line_1',
    'address_line_2',
    'address_line_3',
    'locality',
    'region',
    'postal_code',
    'country'
  ]
};