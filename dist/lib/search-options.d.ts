export interface AddressSearchOptions {
    enabled: boolean;
    token: string;
    avMode: AddressValidationMode;
    searchType: AddressValidationSearchType;
    maxSuggestions: number;
    maxSuggestionsForLookup: number;
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
        validateButton?: HTMLButtonElement;
    };
}
export declare enum AddressValidationSearchType {
    COMBINED = "combined",
    AUTOCOMPLETE = "autocomplete",
    VALIDATE = "validate",
    SINGLELINE = "singleline",
    TYPEDOWN = "typedown",
    LOOKUPV2 = "lookupv2"
}
export declare enum AddressValidationMode {
    SEARCH = 1,
    WHAT3WORDS = 2,
    UDPRN = 3,
    LOCALITY = 4,
    POSTAL_CODE = 5,
    MPAN = 6,
    MPRN = 7
}
export declare const AddressValidationLookupKeywords: {
    WHAT3WORDS: {
        key: string;
        display: string;
        dataset: string[][];
    };
    UDPRN: {
        key: string;
        display: string;
        dataset: string[][];
    };
    MPAN: {
        key: string;
        display: string;
        dataset: string[][];
    };
    MPRN: {
        key: string;
        display: string;
        dataset: string[][];
    };
    POSTAL_CODE: {
        key: string;
        display: string;
        dataset: any[];
    };
    LOCALITY: {
        key: string;
        display: string;
        dataset: any[];
    };
};
export declare const AddAddressesOptions: {
    TRUE: {
        key: string;
        display: string;
    };
    FALSE: {
        key: string;
        display: string;
    };
};
export declare const PreferredScriptOptions: {
    LATIN: {
        key: string;
        display: string;
    };
    KANA: {
        key: string;
        display: string;
    };
    KANJI: {
        key: string;
        display: string;
    };
};
export declare enum AddressValidationConfidenceType {
    NO_MATCHES = "No matches",
    VERIFIED_MATCH = "Verified match",
    INTERACTION_REQUIRED = "Interaction required",
    PREMISES_PARTIAL = "Premises partial",
    STREET_PARTIAL = "Street partial",
    MULTIPLE_MATCHES = "Multiple matches"
}
export declare const defaults: {
    avMode: AddressValidationMode;
    searchType: AddressValidationSearchType;
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
