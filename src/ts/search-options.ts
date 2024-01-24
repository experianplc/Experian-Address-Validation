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
  LOOKUPV2 = 'lookupv2'
}

export enum AddressValidationMode {
  SEARCH = 1,
  LOOKUPV2,
}

export const AddressValidationLookupKeywords = {
  LOCALITY: {key: "locality", display: 'Locality'},
  POSTAL_CODE: {key: "postal_code", display: "Postal code"},
  UDPRN: {key: "udprn", display: "UDPRN"},
  WHAT3WORDS: {key: "what3words", display: "what3words"},
}

export const AddAddressesOptions = {
  TRUE: {key: "true", display: 'True'},
  FALSE: {key: "false", display: "False"}
}

export enum AddressValidationConfidenceType {
  NO_MATCHES = 'No matches',
  VERIFIED_MATCH = 'Verified match',
  INTERACTION_REQUIRED = 'Interaction required',
  PREMISES_PARTIAL = 'Premises partial',
  STREET_PARTIAL = 'Street partial',
  MULTIPLE_MATCHES = 'Multiple matches'
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