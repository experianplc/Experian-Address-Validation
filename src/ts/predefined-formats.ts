import { AddressValidationMode } from "./search-options";

// Needs to be in order of priority for combined search type. LAST format match is used to generate the response.
export const predefinedFormats = [
  {countryIso: 'GBR', minLength: 4, mode: AddressValidationMode.POSTAL_CODE, format: /^[A-Za-z]{1,2}[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{0,2}$/},
  {countryIso: 'GBR', minLength: null, mode: AddressValidationMode.WHAT3WORDS, format: /^\/{0,}(?:[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+|[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3})$/},
  {countryIso: 'GBR', minLength: null, mode: AddressValidationMode.MPAN, format: /^\d{13,21}$/},
  {countryIso: 'GBR', minLength: null, mode: AddressValidationMode.MPRN, format: /^\d{8,10}$/},
  {countryIso: 'GBR', minLength: null, mode: AddressValidationMode.UDPRN, format: /^\d{8}$/},
];
