// Defined in order of preference
export var AddressValidationSearchType;
(function (AddressValidationSearchType) {
    AddressValidationSearchType["COMBINED"] = "combined";
    AddressValidationSearchType["AUTOCOMPLETE"] = "autocomplete";
    AddressValidationSearchType["VALIDATE"] = "validate";
    AddressValidationSearchType["SINGLELINE"] = "singleline";
    AddressValidationSearchType["TYPEDOWN"] = "typedown";
    AddressValidationSearchType["LOOKUPV2"] = "lookupv2";
})(AddressValidationSearchType || (AddressValidationSearchType = {}));
export var AddressValidationMode;
(function (AddressValidationMode) {
    AddressValidationMode[AddressValidationMode["SEARCH"] = 1] = "SEARCH";
    AddressValidationMode[AddressValidationMode["WHAT3WORDS"] = 2] = "WHAT3WORDS";
    AddressValidationMode[AddressValidationMode["UDPRN"] = 3] = "UDPRN";
    AddressValidationMode[AddressValidationMode["LOCALITY"] = 4] = "LOCALITY";
    AddressValidationMode[AddressValidationMode["POSTAL_CODE"] = 5] = "POSTAL_CODE";
    AddressValidationMode[AddressValidationMode["MPAN"] = 6] = "MPAN";
    AddressValidationMode[AddressValidationMode["MPRN"] = 7] = "MPRN";
})(AddressValidationMode || (AddressValidationMode = {}));
export var AddressValidationLookupKeywords = {
    WHAT3WORDS: { key: "what3words", display: "What3Words", dataset: [["gb-address"], ["gb-additional-multipleresidence"], ["gb-additional-notyetbuilt"], ["gb-additional-notyetbuilt", "gb-additional-multipleresidence"]] },
    UDPRN: { key: "udprn", display: "UDPRN", dataset: [["gb-address"], ["gb-additional-multipleresidence"], ["gb-additional-notyetbuilt"], ["gb-additional-notyetbuilt", "gb-additional-multipleresidence"]] },
    MPAN: { key: "mpan", display: "MPAN", dataset: [["gb-additional-electricity"], ["gb-additional-electricity", "gb-additional-gas"]] },
    MPRN: { key: "mprn", display: "MPRN", dataset: [["gb-additional-gas"], ["gb-additional-electricity", "gb-additional-gas"]] },
    POSTAL_CODE: { key: "postal_code", display: "Postal code", dataset: [] },
    LOCALITY: { key: "locality", display: 'Locality', dataset: [] },
};
export var AddAddressesOptions = {
    TRUE: { key: "true", display: 'True' },
    FALSE: { key: "false", display: "False" }
};
export var PreferredScriptOptions = {
    LATIN: { key: "latin", display: "Latin" },
    KANA: { key: "kana", display: "Kana" },
    KANJI: { key: "kanji", display: "Kanji" }
};
export var AddressValidationConfidenceType;
(function (AddressValidationConfidenceType) {
    AddressValidationConfidenceType["NO_MATCHES"] = "No matches";
    AddressValidationConfidenceType["VERIFIED_MATCH"] = "Verified match";
    AddressValidationConfidenceType["INTERACTION_REQUIRED"] = "Interaction required";
    AddressValidationConfidenceType["PREMISES_PARTIAL"] = "Premises partial";
    AddressValidationConfidenceType["STREET_PARTIAL"] = "Street partial";
    AddressValidationConfidenceType["MULTIPLE_MATCHES"] = "Multiple matches";
    AddressValidationConfidenceType["VERIFIED_STREET"] = "Verified street";
    AddressValidationConfidenceType["VERIFIED_PLACE"] = "Verified place";
})(AddressValidationConfidenceType || (AddressValidationConfidenceType = {}));
// Default settings
export var defaults = {
    avMode: AddressValidationMode.SEARCH,
    searchType: AddressValidationSearchType.COMBINED,
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
//# sourceMappingURL=search-options.js.map