export interface AddressSearchOptions {
  enabled: boolean;
  token: string;
  avMode: AddressValidationMode;
  searchType: AddressValidationSearchType;
  maxSuggestions: number;
  language: string;
  location: string;
  useSpinner: boolean;
  countryCode?: string;
  countryCodeMapping?: { [key: string]: string };
  applyFocus: boolean;
  placeholderText: string;
  useAddressEnteredText: string;
  searchAgain: { visible?: boolean, text?: string, link?: HTMLButtonElement };
  formattedAddressContainer: { showHeading: boolean, headingType: string, validatedHeadingText: string, manualHeadingText: string };
  elements: { input?: HTMLInputElement, inputs?: HTMLInputElement[], countryList?: HTMLSelectElement, address_line_1?: HTMLInputElement, address_line_2?: HTMLInputElement, address_line_3?: HTMLInputElement, locality?: HTMLInputElement, region?: HTMLInputElement, postal_code?: HTMLInputElement, country?: HTMLInputElement, formattedAddressContainer?: HTMLElement, lookupButton?: HTMLButtonElement };
}

export enum AddressValidationSearchType {
  AUTOCOMPLETE = 'autocomplete',
  SINGLELINE = 'singleline',
  VALIDATE = 'validate',
}

export enum AddressValidationMode {
  SEARCH = 1,
  WHAT3WORDS,
  UDPRN,
}

export enum AddressValidationLookupKeywords {
  WHAT3WORDS = 'what3words',
  UDPRN = 'udprn',
}

// Default settings
export const defaults = {
  avMode: AddressValidationMode.SEARCH,
  searchType: AddressValidationSearchType.AUTOCOMPLETE,
  input: { placeholderText: 'Start typing an address...', applyFocus: false },
  formattedAddressContainer: { showHeading: false, headingType: 'h3', validatedHeadingText: 'Validated address', manualHeadingText: 'Manual address entered' },
  searchAgain: { visible: true, text: 'Search again' },
  useAddressEnteredText: '<em> - Use address entered or try again...</em>',
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