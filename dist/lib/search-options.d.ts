export interface AddressSearchOptions {
    enabled: boolean;
    token: string;
    enableWhat3Words: boolean;
    searchType: AddressValidationMode;
    maxSuggestions: number;
    language: string;
    location: string;
    useSpinner: boolean;
    countryCode?: string;
    countryCodeMapping?: {
        [key: string]: string;
    };
    applyFocus: boolean;
    placeholderText: string;
    useAddressEnteredText: string;
    searchAgain: {
        visible?: boolean;
        text?: string;
        link?: HTMLButtonElement;
    };
    formattedAddressContainer: {
        showHeading: boolean;
        headingType: string;
        validatedHeadingText: string;
        manualHeadingText: string;
    };
    elements: {
        input?: HTMLInputElement;
        inputs?: HTMLInputElement[];
        countryList?: HTMLSelectElement;
        address_line_1?: HTMLInputElement;
        address_line_2?: HTMLInputElement;
        address_line_3?: HTMLInputElement;
        locality?: HTMLInputElement;
        region?: HTMLInputElement;
        postal_code?: HTMLInputElement;
        country?: HTMLInputElement;
        formattedAddressContainer?: HTMLElement;
        lookupButton?: HTMLButtonElement;
    };
}
export declare enum AddressValidationMode {
    AUTOCOMPLETE = "autocomplete",
    SINGLELINE = "singleline",
    VALIDATE = "validate"
}
export declare const defaults: {
    enableWhat3Words: boolean;
    searchType: AddressValidationMode;
    input: {
        placeholderText: string;
        applyFocus: boolean;
    };
    formattedAddressContainer: {
        showHeading: boolean;
        headingType: string;
        validatedHeadingText: string;
        manualHeadingText: string;
    };
    searchAgain: {
        visible: boolean;
        text: string;
    };
    useAddressEnteredText: string;
    useSpinner: boolean;
    language: string;
    addressLineLabels: string[];
};
