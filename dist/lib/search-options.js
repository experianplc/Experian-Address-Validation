export var AddressValidationMode;
(function (AddressValidationMode) {
    AddressValidationMode["AUTOCOMPLETE"] = "autocomplete";
    AddressValidationMode["SINGLELINE"] = "singleline";
    AddressValidationMode["VALIDATE"] = "validate";
})(AddressValidationMode || (AddressValidationMode = {}));
// Default settings
export var defaults = {
    enableWhat3Words: true,
    searchType: AddressValidationMode.AUTOCOMPLETE,
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