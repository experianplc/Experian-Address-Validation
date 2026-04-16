/* eslint-disable @typescript-eslint/ban-types */
import EventFactory from './event-factory';
import Request from './request';
import { AddAddressesOptions, AddressValidationConfidenceType, AddressValidationLookupKeywords, AddressValidationMode, AddressValidationSearchType, PreferredScriptOptions, defaults } from './search-options';
import { datasetCodes } from './datasets-codes';
import { predefinedFormats } from './predefined-formats';
import { translations } from './translations';
import { EnrichmentDetails, Picklist } from './class-types';
import { enrichmentOutput } from './enrichment-output';
import { regionalGeocodeDescriptions } from './regional-geocodes-description';
var AddressValidation = /** @class */ (function () {
    function AddressValidation(options) {
        var _this = this;
        this.countryDropdown = [];
        this.componentsCollectionMap = new Map();
        this.metadataCollectionMap = new Map();
        this.matchInfoCollectionMap = new Map();
        this.geocodes = new EnrichmentDetails();
        this.cvHousehold = new EnrichmentDetails();
        this.tooltipDescriptionMap = new Map();
        this.premiumLocationInsightMap = new Map();
        this.baseUrl = 'https://api.experianaperture.io/';
        this.datasetsEndpoint = 'address/datasets/v1';
        this.searchEndpoint = 'address/search/v1';
        this.lookupV2Endpoint = 'address/lookup/v2';
        this.validateEndpoint = 'address/validate/v1';
        this.promptsetEndpoint = 'address/promptsets/v1';
        this.stepInEndpoint = 'address/suggestions/stepin/v1';
        this.formatEndpoint = 'address/format/v1';
        this.refineEndpoint = 'address/suggestions/refine/v1';
        this.enrichmentEndpoint = 'enrichment/v2';
        this.abnDataset = 'gb-address-addressbasenames';
        this.poweredByLogo = {
            element: null,
            // Create a "Powered by Experian" footer
            create: function (picklist) {
                var item = {
                    text: "".concat(this.svg, " <em>Powered by Experian</em>"),
                    format: ''
                };
                var listItem = picklist.createListItem(item);
                listItem.classList.add('powered-by-experian');
                picklist.list.parentNode.appendChild(listItem);
                return listItem;
            },
            // Destroy the "Powered by Experian" footer
            destroy: function (picklist) {
                if (this.element) {
                    picklist.list.parentNode.removeChild(this.element);
                    this.element = undefined;
                }
            },
            svg: "<svg class=\"experian-logo\" version=\"1.1\" width=\"18\" height=\"18\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 120 120\" style=\"\" xml:space=\"preserve\" role=\"img\" aria-label=\"Powered by Experian\">\n            <title>Experian logo</title>\n            <g>\n                <path style=\"fill: #0E6EB6\" d=\"M56.1,27h-13c-3.9,0-7-3.1-7-7V7c0-3.9,3.1-7,7-7h13c3.9,0,7,3.1,7,7v13C63.1,23.8,60,27,56.1,27\"></path>\n                <path style=\"fill: #72217B\" d=\"M22.5,56.1H7.9c-4.3,0-7.9-3.5-7.9-7.9V33.6c0-4.3,3.5-7.9,7.9-7.9h14.6c4.3,0,7.9,3.5,7.9,7.9v14.6C30.4,52.6,26.8,56.1,22.5,56.1\"></path>\n                <path style=\"fill: #B12384\" d=\"M21.1,86.4h-8.9c-2.7,0-4.8-2.1-4.8-4.8v-8.9c0-2.7,2.2-4.8,4.8-4.8h8.9c2.7,0,4.8,2.2,4.8,4.8v8.9C25.9,84.3,23.7,86.4,21.1,86.4\"></path>\n                <path style=\"fill: #E72887\" d=\"M45.1,114.7H34.5c-3.1,0-5.7-2.5-5.7-5.7V98.4c0-3.1,2.5-5.7,5.7-5.7h10.6c3.1,0,5.7,2.5,5.7,5.7V109C50.7,112.1,48.2,114.7,45.1,114.7\"></path>\n                <path style=\"fill: #E72887\" d=\"M83.8,32.3h-7.3c-2.2,0-3.9-1.8-3.9-3.9v-7.3c0-2.2,1.8-3.9,3.9-3.9h7.3c2.2,0,3.9,1.8,3.9,3.9v7.3C87.7,30.5,85.9,32.3,83.8,32.3\"></path>\n                <path style=\"fill: #004691\" d=\"M81.7,61.8C81.5,51.1,72,42,60.7,42C49,42,39.6,51.3,39.6,62.9C39.6,74.6,49,84,60.7,84c5.6,0,10.8-2.2,14.6-5.9c0.7-0.7,1.2-1.6,1.2-2.6c0-1.9-1.6-3.5-3.5-3.5c-1.1,0-2,0.7-2.8,1.4c-2.4,2.5-5.9,3.7-9.5,3.7c-7,0-12.7-4.8-13.9-11.5h31.5c0,0,0,0,0.1,0h0.1c0.1,0,0.1,0,0.2,0c0.1,0,0.2,0,0.4-0.1C80.4,65,81.7,63.6,81.7,61.8z M60.7,48.9c6.3,0,11.6,4.1,13.4,9.7H47.3C49.1,53,54.3,48.9,60.7,48.9z\"></path>\n            </g>\n        </svg>"
        };
        this.result = {
            formattedAddressContainer: null,
            lastAddressField: null,
            generateAddressLineRequired: false,
            // Render a Formatted address
            show: function (data) {
                var _a, _b;
                // Hide the inline search spinner
                _this.searchSpinner.hide();
                // Hide the picklist
                _this.picklist.hide();
                // Clear the previous search term
                _this.lastSearchTerm = '';
                // Allow Autocomplete through as it will need to create the additional output fields for the final address.
                // Otherwise, only render the final address if there are results available.
                if (_this.searchType === AddressValidationSearchType.AUTOCOMPLETE
                    || (data.result.address && data.result.confidence !== AddressValidationConfidenceType.NO_MATCHES)) {
                    // Clear search input(s)
                    _this.inputs.forEach(function (input) { return input.value = ''; });
                    // Calculate if we needed to generate the formatted address input fields later
                    _this.result.calculateIfAddressLineGenerationRequired();
                    if (_this.currentDataSet[0] === _this.abnDataset) {
                        var addressLine1 = data.result.address['address_line_1'] ? JSON.stringify(data.result.address['address_line_1'] + ', ') : '';
                        var addressLine2 = data.result.address['address_line_2'] ? JSON.stringify(data.result.address['address_line_2'] + ', ') : '';
                        var addressLine3 = data.result.address['address_line_3'] ? JSON.stringify(data.result.address['address_line_3'] + ', ') : '';
                        var locality = data.result.address['locality'] ? JSON.stringify(data.result.address['locality'] + ', ') : '';
                        var region = data.result.address['region'] ? JSON.stringify(data.result.address['region'] + ', ') : '';
                        var postalCode = data.result.address['postal_code'] ? JSON.stringify(data.result.address['postal_code'] + ', ') : '';
                        var country = data.result.address['country'] ? JSON.stringify(data.result.address['country']) : '';
                        var pickedAddress = addressLine1 + addressLine2 + addressLine3 + locality + region + postalCode + country;
                        _this.inputs[0].value = pickedAddress.replace(/"/g, '');
                        // Extract names from the selected address and populate the "Forename" picklist
                        var names = _this.extractNamesFromAddress(data.result);
                        _this.populateForenamePicklist(names);
                        _this.picklist.container.remove();
                        if ((_this.inputs[1] || _this.inputs[2] || _this.inputs[3]) && !pickedAddress) {
                            _this.picklist.show(data);
                        }
                        _this.searchSpinner.hide();
                        if (_this.options.elements.validateButton) {
                            _this.options.elements.validateButton.addEventListener('click', function (e) {
                                e.preventDefault();
                                _this.populateFormatContainer(data);
                                _this.result.createSearchAgainLink();
                            }, { once: true });
                        }
                    }
                    else {
                        // Get formatted address container element
                        // Only create a container if we're creating inputs. Otherwise the user will have their own container.
                        _this.result.formattedAddressContainer = _this.options.elements.formattedAddressContainer;
                        if (!_this.result.formattedAddressContainer && _this.result.generateAddressLineRequired) {
                            _this.result.createFormattedAddressContainer();
                        }
                        var address = data.result.address;
                        if ((_a = data.result) === null || _a === void 0 ? void 0 : _a.addresses_formatted) {
                            address = data.result.addresses_formatted[0].address;
                        }
                        // Loop over each formatted address component
                        if (address) {
                            for (var i = 0; i < Object.keys(address).length; i++) {
                                var key = Object.keys(address)[i];
                                var addressComponent = address[key];
                                // Bind the address element to the user's address field (or create a new one)
                                _this.result.updateAddressLine(key, addressComponent, 'address-line-input');
                            }
                        }
                        _this.componentsCollectionMap.clear();
                        var components = data.result.components;
                        if (components) {
                            for (var i = 0; i < Object.keys(components).length; i++) {
                                var key = Object.keys(components)[i];
                                _this.componentsCollectionMap.set(key, components[key]);
                            }
                        }
                        _this.metadataCollectionMap.clear();
                        var metadata = data.metadata;
                        if (metadata) {
                            for (var i = 0; i < Object.keys(metadata).length; i++) {
                                var key = Object.keys(metadata)[i];
                                _this.metadataCollectionMap.set(key, metadata[key]);
                            }
                        }
                        _this.matchInfoCollectionMap.clear();
                        var matchInfo = (_b = data === null || data === void 0 ? void 0 : data.result) === null || _b === void 0 ? void 0 : _b.match_info;
                        if (matchInfo) {
                            for (var i = 0; i < Object.keys(matchInfo).length; i++) {
                                var key = Object.keys(matchInfo)[i];
                                _this.matchInfoCollectionMap.set(key, matchInfo[key]);
                            }
                        }
                        // Hide country and address search fields (if they have a 'toggle' class)
                        _this.toggleSearchInputs('hide');
                        // Enable users to search again subsequently
                        _this.hasSearchInputBeenReset = true;
                        // If an address line is also the main search input, set property to false.
                        // This ensures that typing in the field again (after an address has been
                        // returned) will not trigger a new search.
                        if (_this.searchType === AddressValidationSearchType.AUTOCOMPLETE) {
                            for (var element in _this.options.elements) {
                                if (Object.prototype.hasOwnProperty.call(_this.options.elements, element)) {
                                    // Excluding the input itself, does another element match the input field?
                                    if (element !== 'input' && _this.options.elements[element] === _this.inputs[0]) {
                                        _this.hasSearchInputBeenReset = false;
                                        break;
                                    }
                                }
                            }
                        }
                        // Create the 'Search again' link and insert into DOM
                        _this.result.createSearchAgainLink();
                    }
                }
                if (_this.currentDataSet[0] !== _this.abnDataset) {
                    // Fire an event to say we've got the formatted address
                    _this.events.trigger('post-formatting-search', data);
                }
            },
            showLookupV2: function (data) {
                // Hide the inline search spinner
                _this.searchSpinner.hide();
                // Hide the picklist
                _this.picklist.hide();
                // Clear the previous search term
                _this.lastSearchTerm = '';
                // Only render the final address if there are results available.
                if (data.result.addresses_formatted) {
                    // Clear search input(s)
                    _this.inputs.forEach(function (input) { return input.value = ''; });
                    // Calculate if we needed to generate the formatted address input fields later
                    _this.result.calculateIfAddressLineGenerationRequired();
                    // Get formatted address container element
                    // Only create a container if we're creating inputs. Otherwise the user will have their own container.
                    _this.result.formattedAddressContainer = _this.options.elements.formattedAddressContainer;
                    if (!_this.result.formattedAddressContainer && _this.result.generateAddressLineRequired) {
                        _this.result.createFormattedAddressContainer();
                    }
                    // Map some of the custom layout response for Utitly data to the existing address elements. All elements will be shown in validated adress panel.
                    var mappedResponse = {};
                    if (data.result.addresses_formatted[0].address.gas_meters) {
                        mappedResponse = {
                            address_line_1: data.result.addresses_formatted[0].address.gas_meters[0].rel_address_primary_name,
                            address_line_2: data.result.addresses_formatted[0].address.gas_meters[0].rel_address_street1,
                            locality: data.result.addresses_formatted[0].address.gas_meters[0].rel_address_town,
                            postal_code: data.result.addresses_formatted[0].address.gas_meters[0].rel_address_postcode,
                            country: data.result.addresses_formatted[0].address.gas_meters[0].rel_address_country ? data.result.addresses_formatted[0].address.gas_meters[0].rel_address_country : 'United Kingdom',
                        };
                    }
                    else if (data.result.addresses_formatted[0].address.electricity_meters) {
                        mappedResponse = {
                            address_line_1: data.result.addresses_formatted[0].address.electricity_meters[0].address_line_3,
                            address_line_2: data.result.addresses_formatted[0].address.electricity_meters[0].address_line_5,
                            locality: data.result.addresses_formatted[0].address.electricity_meters[0].address_line_8,
                            postal_code: data.result.addresses_formatted[0].address.electricity_meters[0].address_postal_code,
                            country: data.result.addresses_formatted[0].address.electricity_meters[0].address_country ? data.result.addresses_formatted[0].address.electricity_meters[0].address_country : 'United Kingdom',
                        };
                    }
                    for (var i = 0; i < Object.keys(mappedResponse).length; i++) {
                        var key = Object.keys(mappedResponse)[i];
                        var addressComponent = mappedResponse[key];
                        // Bind the address element to the user's address field (or create a new one)
                        _this.result.updateAddressLine(key, addressComponent, 'address-line-input');
                    }
                    // Hide country and address search fields (if they have a 'toggle' class)
                    _this.toggleSearchInputs('hide');
                    // Enable users to search again subsequently
                    _this.hasSearchInputBeenReset = true;
                    // Create the 'Search again' link and insert into DOM
                    _this.result.createSearchAgainLink();
                }
                // Fire an event to say we've got the formatted address
                _this.events.trigger('post-formatting-search', data);
            },
            hide: function () {
                // Delete the formatted address container
                if (_this.result.formattedAddressContainer) {
                    _this.result.formattedAddressContainer.parentNode.removeChild(_this.result.formattedAddressContainer);
                    _this.result.formattedAddressContainer = undefined;
                }
                // Delete the search again link
                if (_this.options.searchAgain.link) {
                    _this.options.searchAgain.link.parentNode.removeChild(_this.options.searchAgain.link);
                    _this.options.searchAgain.link = undefined;
                }
                // Remove previous value from user's result field
                // Loop over their elements
                for (var element in _this.options.elements) {
                    if (Object.prototype.hasOwnProperty.call(_this.options.elements, element)) {
                        // If it matches an "address" element
                        for (var i = 0; i < defaults.addressLineLabels.length; i++) {
                            var label = defaults.addressLineLabels[i];
                            // Only reset the value if it's not an input field
                            if (label === element && _this.options.elements[element] !== _this.inputs[0]) {
                                _this.options.elements[element].value = '';
                                break;
                            }
                        }
                    }
                }
            },
            createAddressLine: {
                // Create an input to store the address line
                input: function (key, value, className) {
                    // Create a wrapper
                    var div = document.createElement('div');
                    div.classList.add(className);
                    // Create the label
                    var label = document.createElement('label');
                    label.innerHTML = key.replace(/([A-Z])/g, ' $1') // Add space before capital Letters
                        .replace(/([0-9])/g, ' $1') // Add space before numbers
                        .replace(/^./, function (str) { return str.toUpperCase(); }); // Make first letter of word a capital letter
                    div.appendChild(label);
                    // Create the input
                    var input = document.createElement('input');
                    input.setAttribute('type', 'text');
                    input.setAttribute('name', key);
                    input.setAttribute('value', value);
                    div.appendChild(input);
                    return div;
                },
                // Create the address line label based on the country and language
                label: function (key) {
                    var label = key;
                    var language = _this.options.language.toLowerCase();
                    var country = _this.currentCountryCode.toLowerCase();
                    if (translations) {
                        try {
                            var translatedLabel = translations[language][country][key];
                            if (translatedLabel) {
                                label = translatedLabel;
                            }
                        }
                        catch (e) {
                            // Translation doesn't exist for key
                        }
                    }
                    return label;
                }
            },
            // Create the formatted address container and inject after the input
            createFormattedAddressContainer: function () {
                var container = document.createElement('div');
                container.classList.add('formatted-address');
                // If Singleline mode is used, then append the formatted address after the last input field, otherwise use the first one
                var position = _this.searchType === AddressValidationSearchType.SINGLELINE ? _this.inputs.length - 1 : 0;
                // Insert the container after the input
                _this.inputs[position].parentNode.insertBefore(container, _this.inputs[position].nextSibling);
                _this.result.formattedAddressContainer = container;
            },
            // Create a heading for the formatted address container
            createHeading: function () {
                // Create a heading for the formatted address
                if (_this.options.formattedAddressContainer.showHeading) {
                    var heading = document.createElement(_this.options.formattedAddressContainer.headingType);
                    heading.innerHTML = _this.options.formattedAddressContainer.validatedHeadingText;
                    _this.result.formattedAddressContainer.appendChild(heading);
                }
            },
            // Update the heading text in the formatted address container
            updateHeading: function (text) {
                //Change the heading text to "Manual address entered"
                if (_this.options.formattedAddressContainer.showHeading) {
                    var heading = _this.result.formattedAddressContainer.querySelector(_this.options.formattedAddressContainer.headingType);
                    heading.innerHTML = text;
                }
            },
            calculateIfAddressLineGenerationRequired: function () {
                _this.result.generateAddressLineRequired = true;
                for (var i = 0; i < defaults.addressLineLabels.length; i++) {
                    var key = defaults.addressLineLabels[i];
                    if (_this.options.elements[key]) {
                        _this.result.generateAddressLineRequired = false;
                        break;
                    }
                }
            },
            updateAddressLine: function (key, addressLineObject, className) {
                // Either append the result to the user's address field or create a new field for them
                if (_this.options.elements[key]) {
                    var addressField = _this.options.elements[key];
                    _this.result.updateLabel(key);
                    var value = addressLineObject;
                    // If a value is already present, prepend a comma and space
                    if (addressField.value && value) {
                        value = ', ' + value;
                    }
                    // Decide what property of the node we need to update. i.e. if it's not a form field, update the innerText.
                    if (addressField.nodeName === 'INPUT' || addressField.nodeName === 'TEXTAREA' || addressField.nodeName === 'SELECT') {
                        addressField.value += value;
                    }
                    else {
                        addressField.innerText += value;
                    }
                    // Store a record of their last address field
                    _this.result.lastAddressField = addressField;
                }
                else if (_this.result.generateAddressLineRequired) {
                    // Create an input to store the address line
                    var label = _this.result.createAddressLine.label(key);
                    var field = _this.result.createAddressLine.input(label, addressLineObject, className);
                    // Insert into DOM
                    _this.result.formattedAddressContainer.appendChild(field);
                }
            },
            // Update the label if translation is present
            updateLabel: function (key) {
                var label = key;
                var language = _this.options.language.toLowerCase();
                var country = _this.currentCountryCode.toLowerCase();
                if (translations) {
                    try {
                        var translatedLabel = translations[language][country][key];
                        if (translatedLabel) {
                            label = translatedLabel;
                            var labels = document.getElementsByTagName('label');
                            for (var i = 0; i < labels.length; i++) {
                                if (labels[i].htmlFor === key) {
                                    labels[i].innerHTML = translatedLabel;
                                }
                            }
                        }
                    }
                    catch (e) {
                        // Translation doesn't exist for key
                    }
                }
                return label;
            },
            // Create the 'Search again' link that resets the search
            createSearchAgainLink: function () {
                if (_this.options.searchAgain.visible) {
                    var existingSearchAgainButton = document.getElementById('search-again-button');
                    if (existingSearchAgainButton) {
                        existingSearchAgainButton.style.visibility = 'block';
                    }
                    else {
                        // Create a new one
                        var link = document.createElement('button');
                        link.type = 'button';
                        link.classList.add('search-again-button');
                        link.id = 'search-again-button';
                        link.innerText = _this.options.searchAgain.text;
                        // Bind event listener
                        link.addEventListener('click', _this.globalReset.bind(_this));
                        // Store a reference to the link element
                        _this.options.searchAgain.link = link;
                        // Insert into the formatted address container
                        if (_this.result.formattedAddressContainer) {
                            _this.result.formattedAddressContainer.appendChild(link);
                        }
                        else if (_this.result.lastAddressField) {
                            // Insert after last address field
                            _this.result.lastAddressField.parentNode.insertBefore(link, _this.result.lastAddressField.nextSibling);
                        }
                    }
                }
            },
            // Write the list of hidden address line inputs to the DOM
            renderInputList: function (inputArray) {
                if (inputArray.length > 0) {
                    for (var i = 0; i < inputArray.length; i++) {
                        _this.result.formattedAddressContainer.appendChild(inputArray[i]);
                    }
                }
            },
            // Decide whether to either show a picklist or a verified result from a Utilities lookup response
            handleUtilitiesLookupResponse: function (data) {
                if (data.result.confidence === AddressValidationConfidenceType.VERIFIED_MATCH) {
                    // If the response contains an address, then use this directly in the result
                    if (data.result.addresses_formatted) {
                        _this.result.showLookupV2(data);
                    }
                }
                else if (data.result.confidence === 'No matches') {
                    // If there are no matches, then allow "use address entered"
                    _this.picklist.handleEmptyPicklist(data);
                }
                // Fire an event to say we've got the formatted address
                _this.events.trigger('post-formatting-search', data);
            },
            // Decide whether to either show a picklist or a verified result from a Validate response
            handleValidateResponse: function (response) {
                if (response.result.confidence === AddressValidationConfidenceType.VERIFIED_MATCH
                    || response.result.confidence === AddressValidationConfidenceType.VERIFIED_STREET
                    || response.result.confidence === AddressValidationConfidenceType.VERIFIED_PLACE
                    || response.result.confidence === AddressValidationConfidenceType.INTERACTION_REQUIRED) {
                    // If the response contains an address, then use this directly in the result
                    if (response.result.address) {
                        _this.result.show(response);
                    }
                    else if (response.result.suggestions) {
                        // If the verified match still contains a suggestion, then we need to format this first
                        _this.format(response.result.suggestions[0].format);
                    }
                }
                else if (response.result.suggestions) {
                    // If the user needs to pick a suggestion, then display the picklist
                    _this.picklist.show(response);
                }
                else if (response.result.confidence === 'No matches') {
                    // If there are no matches, then allow "use address entered"
                    _this.picklist.handleEmptyPicklist(response);
                }
            },
            handleEnrichmentResponse: function (response) {
                var geocodesDetailsMap = _this.geocodes.detailsMap;
                var cvDetailsMap = _this.cvHousehold.detailsMap;
                geocodesDetailsMap.clear();
                cvDetailsMap.clear();
                _this.premiumLocationInsightMap.clear();
                var geocodeResponse;
                var geocodesExpectedAttributes;
                var geocodesExpectedAttributeDescription;
                var cvHouseholdResponse;
                var cvHouseholdExpectedAttributes;
                var cvHouseholdExpectedAttributeDescription;
                if (response.result.aus_regional_geocodes) {
                    _this.geocodes.title = enrichmentOutput.AUS.geocodes_title;
                    geocodeResponse = Object.entries(response.result.aus_regional_geocodes);
                    geocodesExpectedAttributes = new Map(Object.entries(enrichmentOutput.AUS.aus_regional_geocodes));
                    geocodesExpectedAttributeDescription = new Map(Object.entries(regionalGeocodeDescriptions.AUS));
                }
                else if (response.result.nzl_regional_geocodes) {
                    _this.geocodes.title = enrichmentOutput.NZL.geocodes_title;
                    geocodeResponse = Object.entries(response.result.nzl_regional_geocodes);
                    geocodesExpectedAttributes = new Map(Object.entries(enrichmentOutput.NZL.nzl_regional_geocodes));
                }
                else if (response.result.usa_regional_geocodes) {
                    _this.geocodes.title = enrichmentOutput.USA.geocodes_title;
                    geocodeResponse = Object.entries(response.result.usa_regional_geocodes);
                    geocodesExpectedAttributes = new Map(Object.entries(enrichmentOutput.USA.usa_regional_geocodes));
                }
                else if (response.result.uk_location_essential) {
                    _this.geocodes.title = enrichmentOutput.GBR.geocodes_title;
                    geocodeResponse = Object.entries(response.result.uk_location_essential);
                    geocodesExpectedAttributes = new Map(Object.entries(enrichmentOutput.GBR.uk_location_essential));
                }
                else {
                    _this.geocodes.title = enrichmentOutput.GLOBAL.geocodes_title;
                    geocodeResponse = Object.entries(response.result.geocodes);
                    geocodesExpectedAttributes = new Map(Object.entries(enrichmentOutput.GLOBAL.geocodes));
                }
                var premiumLocationInsightResponse = response.result.premium_location_insight;
                if (premiumLocationInsightResponse) {
                    for (var i = 0; i < Object.keys(premiumLocationInsightResponse).length; i++) {
                        var key = Object.keys(premiumLocationInsightResponse)[i];
                        var value = premiumLocationInsightResponse[key];
                        // to skip display unnecessary 0 index in the UI if only 1 array object is returned
                        if (Array.isArray(value) && value.length === 1) {
                            _this.premiumLocationInsightMap.set(key, value[0]);
                            continue;
                        }
                        _this.premiumLocationInsightMap.set(key, value);
                    }
                }
                _this.populateResponseToMap(geocodeResponse, geocodesExpectedAttributes, geocodesExpectedAttributeDescription, geocodesDetailsMap);
                _this.populateResponseToMap(cvHouseholdResponse, cvHouseholdExpectedAttributes, cvHouseholdExpectedAttributeDescription, cvDetailsMap);
                _this.events.trigger('post-enrichment', response);
            }
        };
        this.searchSpinner = {
            show: function () {
                var _a;
                // Return if we're not displaying a spinner
                if (!_this.options.useSpinner) {
                    return;
                }
                // Create the spinner container
                var spinnerContainer = document.createElement('div');
                spinnerContainer.classList.add('loader');
                spinnerContainer.classList.add('loader-inline');
                // Create the spinner
                var spinner = document.createElement('div');
                spinner.classList.add('spinner');
                spinnerContainer.appendChild(spinner);
                // Insert the spinner after the field
                (_a = _this.inputs[0].parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(spinnerContainer, _this.inputs[0].nextSibling);
            },
            hide: function () {
                var _a, _b;
                // Return if we're not displaying a spinner
                if (!_this.options.useSpinner) {
                    return;
                }
                var spinner = (_a = _this.inputs[0].parentNode) === null || _a === void 0 ? void 0 : _a.querySelector('.loader-inline');
                if (spinner) {
                    (_b = _this.inputs[0].parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(spinner);
                }
            }
        };
        this.options = this.mergeDefaultOptions(options);
        this.events = new EventFactory();
        this.setup();
    }
    AddressValidation.prototype.setToken = function (token) {
        this.options.token = token;
        this.setup();
    };
    AddressValidation.prototype.setSearchType = function (searchType) {
        this.searchType = searchType;
        this.globalReset();
        this.setInputs();
        this.events.trigger('post-search-type-change', searchType);
    };
    AddressValidation.prototype.getLookupEnrichmentData = function (key) {
        if (key) {
            var regionalAttributes = {
                geocodes: Object.keys(enrichmentOutput.GLOBAL.geocodes),
                premium_location_insight: [
                    'geocodes',
                    'geocodes_building_xy',
                    'geocodes_access',
                    'time'
                ]
            };
        }
    };
    AddressValidation.prototype.getEnrichmentData = function (data) {
        this.events.trigger('pre-enrichment');
        this.result.handleEnrichmentResponse(data);
    };
    AddressValidation.prototype.getEnrichmentAttributes = function (globalAddressKey) {
        if (globalAddressKey) {
            var regionalAttributes = void 0;
            var premium_location_insight = [
                'geocodes',
                'geocodes_building_xy',
                'geocodes_access',
                'time'
            ];
            if (this.currentCountryCode == 'NZL') {
                regionalAttributes = {
                    nzl_regional_geocodes: Object.keys(enrichmentOutput.NZL.nzl_regional_geocodes),
                    premium_location_insight: premium_location_insight
                };
            }
            else if (this.currentCountryCode == 'AUS') {
                regionalAttributes = {
                    aus_regional_geocodes: Object.keys(enrichmentOutput.AUS.aus_regional_geocodes),
                    premium_location_insight: premium_location_insight
                };
            }
            else if (this.currentCountryCode == 'USA') {
                regionalAttributes = {
                    usa_regional_geocodes: Object.keys(enrichmentOutput.USA.usa_regional_geocodes),
                    premium_location_insight: premium_location_insight
                };
            }
            else if (this.currentCountryCode == 'GBR') {
                regionalAttributes = {
                    uk_location_essential: Object.keys(enrichmentOutput.GBR.uk_location_essential),
                    what3words: Object.keys(enrichmentOutput.GBR.what3words),
                    premium_location_insight: premium_location_insight
                };
            }
            else {
                regionalAttributes = {
                    geocodes: Object.keys(enrichmentOutput.GLOBAL.geocodes),
                    premium_location_insight: premium_location_insight
                };
            }
            return regionalAttributes;
        }
    };
    AddressValidation.prototype.setup = function () {
        var _this = this;
        // Get token and proceed if it's present
        if (this.token) {
            this.hasSearchInputBeenReset = true;
            // Instantiate a new Request class for use when making API calls
            this.request = new Request(this);
            // Set the country list
            this.setCountryList();
            // Set the input fields for this search type
            this.setInputs();
            // Setup a picklist object
            this.createPicklist();
            // Set the default search mode
            this.searchType = AddressValidationSearchType.COMBINED;
            this.avMode = AddressValidationMode.SEARCH;
        }
        else {
            // Trigger a 401 Unauthorized event if a token does not exist
            setTimeout(function () { return _this.events.trigger('request-error-401'); });
        }
    };
    AddressValidation.prototype.getParameter = function (name) {
        name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'), results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };
    Object.defineProperty(AddressValidation.prototype, "token", {
        // Try and get token from the query string if it's not already provided
        get: function () {
            if (!this.options.token) {
                this.options.token = this.getParameter('token');
            }
            return this.options.token;
        },
        enumerable: false,
        configurable: true
    });
    AddressValidation.prototype.mergeDefaultOptions = function (customOptions) {
        var instance = customOptions || {};
        instance.enabled = true;
        this.searchType = instance.searchType || defaults.searchType;
        instance.searchType = instance.searchType || defaults.searchType;
        instance.language = instance.language || defaults.language;
        instance.useSpinner = instance.useSpinner || defaults.useSpinner;
        instance.applyFocus = (typeof instance.applyFocus !== 'undefined') ? instance.applyFocus : defaults.input.applyFocus;
        instance.placeholderText = instance.placeholderText || defaults.input.placeholderText;
        instance.searchAgain = instance.searchAgain || {};
        instance.searchAgain.visible = (typeof instance.searchAgain.visible !== 'undefined') ? instance.searchAgain.visible : defaults.searchAgain.visible;
        instance.searchAgain.text = instance.searchAgain.text || defaults.searchAgain.text;
        instance.formattedAddressContainer = instance.formattedAddressContainer || defaults.formattedAddressContainer;
        instance.formattedAddressContainer.showHeading = (typeof instance.formattedAddressContainer.showHeading !== 'undefined') ? instance.formattedAddressContainer.showHeading : defaults.formattedAddressContainer.showHeading;
        instance.formattedAddressContainer.headingType = instance.formattedAddressContainer.headingType || defaults.formattedAddressContainer.headingType;
        instance.formattedAddressContainer.validatedHeadingText = instance.formattedAddressContainer.validatedHeadingText || defaults.formattedAddressContainer.validatedHeadingText;
        instance.formattedAddressContainer.manualHeadingText = instance.formattedAddressContainer.manualHeadingText || defaults.formattedAddressContainer.manualHeadingText;
        instance.useAddressEnteredText = instance.useAddressEnteredText || defaults.useAddressEnteredText;
        instance.elements = instance.elements || {};
        return instance;
    };
    AddressValidation.prototype.getPromptset = function () {
        var _this = this;
        if (this.currentCountryCode) {
            // Using the country code and the search type, lookup what the relevant dataset code should be
            this.currentDataSet = this.lookupDatasetCodes();
            if (this.currentDataSet) {
                /// Temporary measure until the promptset endpoint supports Autocomplete and Validate
                if (this.searchType === AddressValidationSearchType.AUTOCOMPLETE || this.searchType === AddressValidationSearchType.COMBINED) {
                    var lines_1 = [];
                    lines_1.push({ example: this.options.placeholderText, prompt: 'Address', suggested_input_length: 160 });
                    if (this.currentCountryCode === 'USA' || this.currentCountryCode === 'CAN' || this.currentCountryCode === 'AUS') {
                        lines_1 = [
                            { example: this.options.placeholderText, prompt: 'Address', suggested_input_length: 160 },
                            { prompt: 'Regions to include', suggested_input_length: 160 },
                            { prompt: 'Regions to exclude', suggested_input_length: 160 },
                            { prompt: 'Existence of field', suggested_input_length: 160, dropdown_options: Object.values(AddAddressesOptions) }
                        ];
                    }
                    if (this.currentDataSet[0] === this.abnDataset) {
                        lines_1.push({ example: 'John', prompt: 'Forename', suggested_input_length: 160 }, { example: 'James', prompt: 'Middle Name', suggested_input_length: 160 }, { example: 'Doe', prompt: 'Surname', suggested_input_length: 160 });
                    }
                    setTimeout(function () { return _this.handlePromptsetResult({ result: { lines: lines_1 } }); });
                    return;
                }
                else if (this.searchType === AddressValidationSearchType.VALIDATE) {
                    var lines_2 = [
                        { prompt: 'Address line 1', suggested_input_length: 160 },
                        { prompt: 'Address line 2', suggested_input_length: 160 },
                        { prompt: 'Address line 3', suggested_input_length: 160 },
                        { prompt: this.result.createAddressLine.label('locality'), suggested_input_length: 160 },
                        { prompt: this.result.createAddressLine.label('region'), suggested_input_length: 160 },
                        { prompt: this.result.createAddressLine.label('postal_code'), suggested_input_length: 160 }
                    ];
                    setTimeout(function () { return _this.handlePromptsetResult({ result: { lines: lines_2 } }); });
                    return;
                }
                else if (this.searchType === AddressValidationSearchType.LOOKUPV2) {
                    var tempDatasets_1 = JSON.stringify(this.currentDataSet.map(function (x) { return x.toUpperCase(); }).sort());
                    var lines_3 = [
                        {
                            prompt: 'Lookup type', suggested_input_length: 160,
                            dropdown_options: Object.values(AddressValidationLookupKeywords)
                                .filter(function (type) { return type.dataset.length == 0 || type.dataset.map(function (x) { return JSON.stringify(x.map(function (y) { return y.toUpperCase(); }).sort()); }).some(function (x) { return x == tempDatasets_1; }); })
                        },
                        {
                            prompt: 'Return addresses - if "true" addresses are returned in the response',
                            suggested_input_length: 160, dropdown_options: Object.values(AddAddressesOptions)
                        },
                        { prompt: 'Lookup value', suggested_input_length: 160 }
                    ];
                    if (this.currentDataSet[0] === "jp-address-ea") {
                        lines_3[1] = { prompt: 'Preferred script', suggested_input_length: 160, dropdown_options: Object.values(PreferredScriptOptions) };
                    }
                    if (this.currentDataSet[0] === "gb-additional-electricity" || this.currentDataSet[0] === "gb-additional-gas") {
                        lines_3[0].dropdown_options = lines_3[0].dropdown_options.slice(0, 1);
                    }
                    setTimeout(function () { return _this.handlePromptsetResult({ result: { lines: lines_3 } }); });
                    return;
                }
                var data = {
                    country_iso: this.currentCountryCode,
                    datasets: Array.isArray(this.currentDataSet) ? this.currentDataSet : [this.currentDataSet],
                    search_type: this.searchType,
                    prompt_set: 'optimal'
                };
                this.events.trigger('pre-promptset-check');
                this.request.send(this.baseUrl, this.promptsetEndpoint, 'POST', this.handlePromptsetResult.bind(this), JSON.stringify(data));
                return;
            }
            this.events.trigger('error-display', 'Unsupported search type \'' + this.searchType + '\' for country dataset \'' + this.currentCountryName + '\'.');
        }
    };
    AddressValidation.prototype.lookupDatasetCodes = function () {
        var _this = this;
        var item = datasetCodes.find(function (dataset) {
            return dataset.iso3Code === _this.currentCountryCode
                && dataset.country === _this.currentCountryName
                && dataset.searchTypes.includes(_this.searchType);
        });
        if (item) {
            return item.datasetCodes;
        }
    };
    AddressValidation.prototype.lookupSearchTypes = function (countryCode, countryName) {
        var items = datasetCodes.filter(function (dataset) {
            return dataset.iso3Code === countryCode
                && dataset.country === countryName;
        });
        if (items.length > 0) {
            var searchTypePriorityOrder_1 = Object.values(AddressValidationSearchType);
            return items.flatMap(function (x) { return x.searchTypes; })
                .map(function (y) { return AddressValidationSearchType[y.toUpperCase()]; })
                .sort(function (a, b) { return searchTypePriorityOrder_1.indexOf(a) - searchTypePriorityOrder_1.indexOf(b); });
        }
        return [];
    };
    AddressValidation.prototype.readPredefinedFormats = function () {
        var _this = this;
        var item = predefinedFormats.filter(function (format) {
            return format.countryIso === _this.currentCountryCode;
        });
        if (item) {
            return item;
        }
    };
    AddressValidation.prototype.handlePromptsetResult = function (response) {
        // Remove any currently displayed picklist when the promptset changes
        this.picklist.hide();
        // Trigger a new event to notify subscribers
        this.events.trigger('post-promptset-check', response);
    };
    AddressValidation.prototype.setInputs = function (inputs) {
        if (inputs === void 0) { inputs = this.options.elements.inputs; }
        // If address inputs exist then register these with event listeners, otherwise call the promptset endpoint to retrieve them
        if (inputs) {
            this.registerInputs(inputs);
        }
        else {
            // Make an API call to get the promptset for this country/dataset/engine
            this.getPromptset();
        }
        if (this.searchType !== AddressValidationSearchType.AUTOCOMPLETE && this.searchType !== AddressValidationSearchType.COMBINED) {
            // Bind an event listener on the lookup button
            if (this.options.elements.lookupButton) {
                if (!this.validateEventBound) {
                    this.lookupFn = this.search.bind(this);
                    this.options.elements.lookupButton.addEventListener('click', this.lookupFn);
                    this.validateEventBound = true;
                }
            }
        }
    };
    AddressValidation.prototype.registerInputs = function (inputs) {
        var _this = this;
        // If new inputs have been provided, ensure we update the elements array to capture them
        this.inputs = Array.from(inputs);
        this.inputs.forEach(function (input) {
            // Disable autocomplete on the form fields
            input.setAttribute(AddressValidationSearchType.AUTOCOMPLETE, 'new-password');
            input.setAttribute(AddressValidationSearchType.COMBINED, 'new-password');
            if (_this.searchType === AddressValidationSearchType.AUTOCOMPLETE || _this.searchType === AddressValidationSearchType.COMBINED) {
                // Bind an event listener on the input
                _this.keyUpFn = _this.search.bind(_this);
                input.addEventListener('keyup', _this.keyUpFn);
                _this.checkTabFn = _this.checkTab.bind(_this);
                input.addEventListener('keydown', _this.checkTabFn);
                // Set a placeholder for the input
                //input.setAttribute('placeholder', this.options.placeholderText);
            }
            // Bind an event listener on the input to allow users to traverse up and down the picklist using the keyboard
            input.addEventListener('keyup', _this.handleKeyboardEvent.bind(_this));
        });
        this.countryCodeMapping = this.options.countryCodeMapping || {};
        // Apply focus to the first input
        if (this.options.applyFocus) {
            this.inputs[0].focus();
        }
    };
    AddressValidation.prototype.setCountryList = function () {
        var url = this.baseUrl + this.datasetsEndpoint;
        this.request.send(this.baseUrl, this.datasetsEndpoint, 'GET', this.handleDatasetsResponse.bind(this));
        // Set the initial country code from either the value of a country list HTML element or a static country code
        if (this.options.elements.countryList) {
            this.currentCountryCode = this.options.elements.countryList.value;
            this.currentCountryName = this.options.elements.countryList[this.options.elements.countryList.selectedIndex].label;
            // Listen for when a country is changed and call the promptset endpoint
            this.options.elements.countryList.addEventListener('change', this.handleCountryListChange.bind(this));
        }
        else if (this.options.countryCode) {
            this.currentCountryCode = this.options.countryCode;
        }
        else {
            throw new Error('Please provide a country code or a country list element');
        }
    };
    AddressValidation.prototype.handleDatasetsResponse = function (response) {
        var _this = this;
        var countries = response.result;
        this.countryDropdown = [];
        if (countries && countries.length > 0) {
            for (var _i = 0, countries_1 = countries; _i < countries_1.length; _i++) {
                var country = countries_1[_i];
                var _loop_1 = function (countryDataset) {
                    var item = datasetCodes.find(function (dataset) { return dataset.datasetCodes.length == 1 && dataset.datasetCodes[0] === countryDataset.id; });
                    if (item && !this_1.countryDropdown.find(function (o) { return o.country === item.country; })) {
                        this_1.countryDropdown.push(item);
                    }
                };
                var this_1 = this;
                for (var _a = 0, _b = Object.values(country.datasets); _a < _b.length; _a++) {
                    var countryDataset = _b[_a];
                    _loop_1(countryDataset);
                }
                if (country.valid_combinations) {
                    country.valid_combinations.forEach(function (countryDatasetCombination) {
                        var sorted = countryDatasetCombination.slice().sort();
                        var item = datasetCodes.find(function (dataset) { return Array.isArray(dataset.datasetCodes)
                            && dataset.datasetCodes.length === sorted.length
                            && dataset.datasetCodes.slice().sort().every(function (value, index) { return value === sorted[index]; }); });
                        if (item && !_this.countryDropdown.find(function (o) { return o.country === item.country; })) {
                            _this.countryDropdown.push(item);
                        }
                    });
                }
            }
            this.countryDropdown.sort(function (a, b) { return a.country.localeCompare(b.country); });
            this.events.trigger('post-datasets-update');
        }
    };
    // When a country from the list is changed, update the current country code, call the promptset endpoint again
    AddressValidation.prototype.handleCountryListChange = function () {
        var countryList = this.options.elements.countryList;
        // Parse the value which may contain dataset codes: "ISO3CODE;dataset1,dataset2"
        var selectedValue = countryList.value;
        var valueParts = selectedValue.split(';');
        this.currentCountryCode = valueParts[0];
        // Set the dataset codes if present in the value
        if (valueParts[1]) {
            this.currentDataSet = valueParts[1].split(',');
        }
        else {
            this.currentDataSet = null;
        }
        this.currentCountryName = countryList[countryList.selectedIndex].label;
        this.getPromptset();
        // If supported, keep the same search type as previous search, otherwise select the first one from the array
        // of available search types
        var availableSearchTypes = this.lookupSearchTypes(this.currentCountryCode, this.currentCountryName);
        var isCurrentSearchTypeSupported = false;
        if (this.searchType !== null) {
            isCurrentSearchTypeSupported = availableSearchTypes.indexOf(this.searchType) >= 0 ? true : false;
        }
        if (!isCurrentSearchTypeSupported && availableSearchTypes.length > 0) {
            this.searchType = AddressValidationSearchType[availableSearchTypes[0].toUpperCase()];
            this.setInputs();
            this.events.trigger('post-search-type-change', this.searchType);
        }
        // Set to default search mode
        this.avMode = AddressValidationMode.SEARCH;
        // Trigger a new event to notify subscribers
        this.events.trigger('post-country-list-change', availableSearchTypes, this.searchType);
    };
    AddressValidation.prototype.generateSearchDataForApiCall = function () {
        var _a, _b, _c, _d;
        // If a dataset code hasn't been set yet, try and look it up
        if (!this.currentDataSet) {
            this.currentDataSet = this.lookupDatasetCodes();
        }
        var data;
        if (this.searchType === 'autocomplete' && (this.currentCountryCode === 'USA' || this.currentCountryCode === 'CAN' || this.currentCountryCode === 'AUS')) {
            data = {
                country_iso: this.currentCountryCode,
                components: {
                    unspecified: [this.currentSearchTerm],
                    locality: {
                        region: {
                            must_be: this.mustBe,
                            must_not_be: this.mustNotBe,
                            exists: this.exists
                        }
                    }
                },
                datasets: Array.isArray(this.currentDataSet) ? this.currentDataSet : [this.currentDataSet],
                max_suggestions: (this.options.maxSuggestions || this.picklist.maxSuggestions)
            };
        }
        else {
            data = {
                country_iso: this.currentCountryCode,
                components: { unspecified: [this.currentSearchTerm] },
                datasets: Array.isArray(this.currentDataSet) ? this.currentDataSet : [this.currentDataSet],
                max_suggestions: (this.options.maxSuggestions || this.picklist.maxSuggestions)
            };
        }
        if (this.currentDataSet[0] === this.abnDataset) {
            if (this.inputs[1] || this.inputs[2] || this.inputs[3]) {
                Object.assign(data.components, {
                    unspecified: [((_a = this.inputs[0]) === null || _a === void 0 ? void 0 : _a.value) || ''],
                    names: [{
                            forename: ((_b = this.inputs[1]) === null || _b === void 0 ? void 0 : _b.value) || '',
                            middlename: ((_c = this.inputs[2]) === null || _c === void 0 ? void 0 : _c.value) || '',
                            surname: ((_d = this.inputs[3]) === null || _d === void 0 ? void 0 : _d.value) || ''
                        }]
                });
            }
        }
        if (this.searchType === AddressValidationSearchType.SINGLELINE || this.searchType === AddressValidationSearchType.VALIDATE) {
            data['attributes'] = {};
            data['options'] = [
                {
                    name: 'flatten',
                    Value: 'true'
                },
                {
                    name: 'intensity',
                    Value: 'close'
                },
                {
                    name: 'prompt_set',
                    Value: 'default'
                }
            ];
            if (this.currentDataSet.includes('gb-address')
                || this.currentDataSet.includes('gb-additional-multipleresidence')
                || this.currentDataSet.includes('gb-additional-notyetbuilt')
                || this.currentDataSet.includes('gb-address-addressbase')
                || this.currentDataSet.includes('gb-additional-addressbaseislands')
                || this.currentDataSet.includes('gb-additional-business')
                || this.currentDataSet.includes('gb-additional-electricity')
                || this.currentDataSet.includes('gb-additional-gas')
                || this.currentDataSet.includes('gb-address-streetlevel')
                || this.currentDataSet.includes('gb-additional-businessextended')
                || this.currentDataSet.includes('gb-address-wales')) {
                data['attributes'] = {
                    'uk_location_essential': [
                        'latitude',
                        'longitude',
                        'match_level',
                        'uprn',
                        'x_coordinate',
                        'y_coordinate',
                        'udprn'
                    ]
                };
            }
            else if (this.currentDataSet.includes('us-address')) {
                data['attributes'] = {
                    'usa_regional_geocodes': [
                        'latitude',
                        'longitude',
                        'match_level',
                        'census_tract',
                        'census_block',
                        'core_based_statistical_area',
                        'congressional_district_code',
                        'county_code'
                    ]
                };
            }
            else if (this.currentDataSet.includes('au-address')
                || this.currentDataSet.includes('au-address-gnaf')
                || this.currentDataSet.includes('au-address-datafusion')) {
                data['attributes']['aus_regional_geocodes'] = [
                    'latitude',
                    'longitude',
                    'match_level',
                    'sa1',
                    'meshblock',
                    'lga_code',
                    'lga_name',
                    'street_pid',
                    'locality_pid',
                    'geocode_level_code',
                    'geocode_level_description',
                    'geocode_type_code',
                    'geocode_type_description',
                    'highest_level_longitude',
                    'highest_level_latitude',
                    'highest_level_elevation',
                    'highest_level_planimetric_accuracy',
                    'highest_level_boundary_extent',
                    'highest_level_geocode_reliability_code',
                    'highest_level_geocode_reliability_description',
                    'confidence_level_code',
                    'confidence_level_description',
                    '2021_meshblock_id',
                    '2021_meshblock_code',
                    '2021_meshblock_match_code',
                    '2021_meshblock_match_description',
                    '2016_meshblock_id',
                    '2016_meshblock_code',
                    '2016_meshblock_match_code',
                    '2016_meshblock_match_description',
                    'address_type_code',
                    'primary_address_pid',
                    'address_join_type',
                    'collector_district_id',
                    'collector_district_code',
                    'commonwealth_electoral_boundary_id',
                    'commonwealth_electoral_boundary_name',
                    'statistical_local_area_id',
                    'statistical_local_area_code',
                    'statistical_local_area_name',
                    'state_electoral_boundary_id',
                    'state_electoral_boundary_name',
                    'state_electoral_effective_start',
                    'state_electoral_effective_end',
                    'state_electoral_new_pid',
                    'state_electoral_new_name',
                    'state_electoral_new_effective_start',
                    'state_electoral_new_effective_end',
                    'address_level_longitude',
                    'address_level_latitude',
                    'address_level_elevation',
                    'address_level_planimetric_accuracy',
                    'address_level_boundary_extent',
                    'address_level_geocode_reliability_code',
                    'address_level_geocode_reliability_description',
                    'street_level_longitude',
                    'street_level_latitude',
                    'street_level_planimetric_accuracy',
                    'street_level_boundary_extent',
                    'street_level_geocode_reliability_code',
                    'street_level_geocode_reliability_description',
                    'locality_level_longitude',
                    'locality_level_latitude',
                    'locality_level_planimetric_accuracy',
                    'locality_level_geocode_reliability_code',
                    'locality_level_geocode_reliability_description',
                    'gnaf_legal_parcel_identifier',
                    'locality_class_code'
                ];
            }
            data['attributes']['premium_location_insight'] = [
                'geocodes',
                'geocodes_access',
                'geocodes_building_xy',
                'time'
            ];
            if (this.searchType === AddressValidationSearchType.SINGLELINE) {
                data['options'].push({
                    name: 'search_type',
                    Value: 'singleline'
                });
                delete data['attributes'];
            }
            if (this.searchType === AddressValidationSearchType.VALIDATE) {
                data['layouts'] = ['default'];
                data['layout_format'] = 'default';
            }
        }
        if (this.options.location) {
            data['location'] = this.options.location;
        }
        return JSON.stringify(data);
    };
    AddressValidation.prototype.generateLookupDataForApiCall = function (input, avMode) {
        // If a dataset code hasn't been set yet, try and look it up
        if (!this.currentDataSet) {
            this.currentDataSet = this.lookupDatasetCodes();
        }
        // Set the dataset and layout for the Utilities Proposition. The default country drop down combines gas and electricity.
        // Lookup by MPAN or MPRN requires a single dataset to be targeted instead.
        var datasets = [];
        var layouts = [];
        switch (avMode) {
            case AddressValidationMode.MPAN:
                if (this.currentDataSet.includes('gb-additional-electricity')) {
                    datasets.push('gb-additional-electricity');
                }
                layouts.push('ElectricityUtilityLookup');
                break;
            case AddressValidationMode.MPRN:
                if (this.currentDataSet.includes('gb-additional-gas')) {
                    datasets.push('gb-additional-gas');
                }
                layouts.push('GasUtilityLookup');
                break;
            default:
                datasets = Array.isArray(this.currentDataSet) ? this.currentDataSet : [this.currentDataSet];
        }
        if (this.currentDataSet[0] === "jp-address-ea") {
            this.preferredScript = [this.inputs[1].value];
            if (this.preferredScript.includes("kana") || this.preferredScript.includes("kanji") || this.preferredScript.includes("latin")) {
                this.preferredLanguage = ["ja"];
            }
            var data_1 = {
                country_iso: this.currentCountryCode,
                datasets: datasets,
                max_suggestions: (this.options.maxSuggestionsForLookup || this.picklist.maxSuggestions),
                key: {
                    type: this.generateLookupType(avMode),
                    value: input,
                },
                preferred_language: this.preferredLanguage,
                preferred_script: this.preferredScript,
                layouts: layouts,
            };
            return JSON.stringify(data_1);
        }
        var data = {
            country_iso: this.currentCountryCode,
            datasets: datasets,
            max_suggestions: (this.options.maxSuggestionsForLookup || this.picklist.maxSuggestions),
            key: {
                type: this.generateLookupType(avMode),
                value: input,
            },
            layouts: layouts,
        };
        return JSON.stringify(data);
    };
    AddressValidation.prototype.getWhat3WordsLookupValue = function (input, shouldGetSuggestions) {
        if (input.startsWith('///') && shouldGetSuggestions) {
            input = input.slice(3);
        }
        return input;
    };
    // Allow the keyboard to be used to either traverse up and down the picklist and select an item, or trigger a new search
    AddressValidation.prototype.handleKeyboardEvent = function (event) {
        event.preventDefault();
        // Handle keyboard navigation
        var key = this.getKey(event);
        // If a picklist is populated then trigger its keyup event to select an item
        if (this.picklist.size) {
            if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'Enter') {
                this.picklist.keyup(event);
                return;
            }
        }
        else {
            // Otherwise, enable pressing 'enter' to trigger a new search
            if (key === 'Enter') {
                this.search(event);
                return;
            }
        }
    };
    // Main function to search for an address from an input string
    AddressValidation.prototype.search = function (event) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        event.preventDefault();
        // Fire an event before a search takes place
        this.events.trigger('pre-search');
        var url, headers, callback, data;
        // Reset the search mode to default value
        this.avMode = AddressValidationMode.SEARCH;
        // Grab the country ISO code and (if it is present) the dataset name from the current value of the countryList (format: {countryIsoCode};{dataset})
        var currentCountryInfo = this.countryCodeMapping[this.currentCountryCode] || this.currentCountryCode;
        var countryCodeAndDataset = currentCountryInfo.split(';');
        this.currentCountryCode = countryCodeAndDataset[0];
        if (countryCodeAndDataset[1]) {
            this.currentDataSet = countryCodeAndDataset[1];
        }
        // (Re-)set the property stating whether the search input has been reset.
        // This is needed for instances when the search input is also an address
        // output field. After an address has been returned, you don't want a new
        // search being triggered until the field has been cleared.
        if (this.currentSearchTerm === '') {
            this.hasSearchInputBeenReset = true;
        }
        if (this.searchType === AddressValidationSearchType.AUTOCOMPLETE) {
            // Only process picklist/search logic if the event target is the main input
            if (event.target === this.inputs[0]) {
                this.mustBe = ((_a = this.inputs[1]) === null || _a === void 0 ? void 0 : _a.value)
                    ? this.inputs[1].value.split(/[,;\s]+/).map(function (s) { return s.trim(); }).filter(Boolean)
                    : this.mustBe;
                if (event.type === 'blur' || event.type === 'keyup' || event.key === 'Enter') {
                    this.mustNotBe = ((_b = this.inputs[2]) === null || _b === void 0 ? void 0 : _b.value)
                        ? this.inputs[2].value.split(/[,;\s]+/).map(function (s) { return s.trim(); }).filter(Boolean)
                        : this.mustNotBe;
                }
                this.exists = ((_c = this.inputs[3]) === null || _c === void 0 ? void 0 : _c.value) ? JSON.parse(this.inputs[3].value) : this.exists;
            }
            else {
                // If not typing in the main input, do not show picklist or trigger search
                return;
            }
        }
        // Concatenating the input components depending on search type and dataset to maximize match results
        if (this.searchType === AddressValidationSearchType.AUTOCOMPLETE
            && (this.currentCountryCode === 'USA'
                || this.currentCountryCode === 'CAN'
                || this.currentCountryCode === 'AUS')) {
            this.currentSearchTerm = this.inputs[0].value;
            this.mustBe = ((_d = this.inputs[1]) === null || _d === void 0 ? void 0 : _d.value)
                ? this.inputs[1].value.split(/[,;\s]+/).map(function (s) { return s.trim(); }).filter(Boolean)
                : [];
            this.mustNotBe = ((_e = this.inputs[2]) === null || _e === void 0 ? void 0 : _e.value)
                ? this.inputs[2].value.split(/[,;\s]+/).map(function (s) { return s.trim(); }).filter(Boolean)
                : [];
            this.exists = ((_f = this.inputs[3]) === null || _f === void 0 ? void 0 : _f.value) ? JSON.parse(this.inputs[3].value) : true;
        }
        else {
            var delimiter = this.isInternationalValidation() ? '|' : ',';
            this.currentSearchTerm = this.inputs.map(function (input) { return input.value; }).join(delimiter);
        }
        // Check if searching is permitted
        if (this.canSearch()) {
            // Abort any outstanding requests
            if (this.request.currentRequest) {
                this.request.currentRequest.abort();
            }
        }
        // Determine the search mode from the supplied input when in combined mode.
        if (this.searchType == AddressValidationSearchType.COMBINED) {
            var predefinedFormats_1 = this.readPredefinedFormats();
            predefinedFormats_1.find(function (predefinedItem) {
                if (predefinedItem.format.test(_this.currentSearchTerm.trim())) {
                    _this.avMode = predefinedItem.mode;
                    _this.currentSearchTerm = _this.currentSearchTerm.trim();
                }
            });
        }
        // Store the last search term
        this.lastSearchTerm = this.currentSearchTerm;
        // Determine search mode and search term for key lookups
        if (this.searchType === AddressValidationSearchType.LOOKUPV2) {
            var lookupSearchTerm = this.currentSearchTerm.split(',');
            this.avMode = AddressValidationMode[lookupSearchTerm[0].toUpperCase()];
            this.returnAddresses = lookupSearchTerm[1] === 'true';
            this.currentSearchTerm = lookupSearchTerm[lookupSearchTerm.length - 1].trim();
        }
        // Construct the new Search URL and data
        switch (this.avMode) {
            case AddressValidationMode.WHAT3WORDS: {
                data = this.generateLookupDataForApiCall(this.getWhat3WordsLookupValue(this.currentSearchTerm, true), this.avMode);
                url = this.lookupV2Endpoint;
                headers = [];
                callback = this.picklist.showWhat3Words;
                break;
            }
            case AddressValidationMode.MPAN:
            case AddressValidationMode.MPRN: {
                this.returnAddresses = true;
                data = this.generateLookupDataForApiCall(this.currentSearchTerm, this.avMode);
                url = this.lookupV2Endpoint;
                headers = [{ key: 'Add-FinalAddress', value: true }];
                callback = this.result.handleUtilitiesLookupResponse;
                break;
            }
            case AddressValidationMode.UDPRN:
            case AddressValidationMode.POSTAL_CODE:
            case AddressValidationMode.LOCALITY: {
                // Always return addresses if the combined search type is selected. The form has no toggle to turn this on or off.
                if (this.searchType === AddressValidationSearchType.COMBINED) {
                    this.returnAddresses = true;
                }
                data = this.generateLookupDataForApiCall(this.currentSearchTerm, this.avMode);
                url = this.lookupV2Endpoint;
                headers = [{ key: 'Add-Addresses', value: true }];
                callback = this.picklist.showLookup;
                break;
            }
            default: {
                data = this.generateSearchDataForApiCall();
                url = (this.searchType === AddressValidationSearchType.VALIDATE ? this.validateEndpoint : this.searchEndpoint);
                headers = this.searchType === AddressValidationSearchType.VALIDATE ? [{ key: 'Add-Components', value: true }, { key: 'Add-Metadata', value: true }, { key: 'Add-Enrichment', value: true }, { key: 'Add-ExtraMatchInfo', value: true }] : [];
                callback = this.searchType === AddressValidationSearchType.VALIDATE ? this.result.handleValidateResponse : this.picklist.show;
                break;
            }
        }
        // Initiate new Search request
        console.log('we are trying to post request');
        this.request.send(this.baseUrl, url, 'POST', callback, data, headers);
        console.log('we have successfully posted request');
        if (this.lastSearchTerm !== this.currentSearchTerm) {
            // Clear the picklist if the search term is cleared/empty
            this.picklist.hide();
        }
    };
    // Helper method to return a consistent key name
    AddressValidation.prototype.getKey = function (_a) {
        var key = _a.key;
        switch (key) {
            case 'Down':
            case 'ArrowDown':
                return 'ArrowDown';
            case 'Up':
            case 'ArrowUp':
                return 'ArrowUp';
            case 'Spacebar':
            case ' ':
                return ' ';
            case 'Escape':
            case 'Esc':
                return 'Escape';
            default:
                return key;
        }
    };
    AddressValidation.prototype.canSearch = function () {
        // If searching on this instance is enabled, and
        return (this.options.enabled &&
            // If search term is not empty, and
            this.currentSearchTerm !== '' &&
            // If the search term is at least 4 characters
            this.currentSearchTerm.length > 3 &&
            // If search term is not the same as previous search term, and
            this.lastSearchTerm !== this.currentSearchTerm &&
            // If the country is not empty, and
            this.currentCountryCode &&
            // If search input has been reset (if applicable)
            this.hasSearchInputBeenReset === true);
    };
    AddressValidation.prototype.createPicklist = function () {
        var _this = this;
        // Instantiate a new Picklist class and set the properties below
        this.picklist = new Picklist();
        // Set initial max size
        this.picklist.maxSuggestions = 25;
        // Tab count used for keyboard navigation
        this.picklist.tabCount = -1;
        // Render a picklist of search results
        this.picklist.show = function (items) {
            var _a;
            // Store the picklist items
            console.log('we want to show search response: ');
            _this.picklist.items = items === null || items === void 0 ? void 0 : items.result.suggestions;
            console.log('picklist items: ' + _this.picklist);
            _this.picklist.handleCommonShowPicklistLogic();
            if (((_a = _this.picklist.items) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                // If a picklist needs "refining" then prepend a textbox to allow the user to enter their selection
                if (_this.picklist.refine.isNeeded(items)) {
                    _this.picklist.refine.createInput(items.result.suggestions_prompt, items.result.suggestions_key);
                }
                if (_this.searchType === AddressValidationSearchType.VALIDATE) {
                    _this.picklist.displaySuggestionsHeader();
                }
                // Iterate over and show results
                _this.picklist.items.forEach(function (item) {
                    // Create a new item/row in the picklist
                    var listItem = _this.picklist.createListItem(item);
                    _this.picklist.list.appendChild(listItem);
                    // Listen for selection on this item
                    _this.picklist.listen(listItem);
                });
                if (_this.searchType === AddressValidationSearchType.VALIDATE) {
                    _this.picklist.displayUseAddressEnteredFooter();
                }
                _this.picklist.scrollIntoViewIfNeeded();
            }
            else {
                _this.picklist.handleEmptyPicklist(items);
            }
            // Add a "Powered by Experian" logo to the picklist footer
            _this.poweredByLogo.element = _this.poweredByLogo.element || _this.poweredByLogo.create(_this.picklist);
            // Fire an event after picklist is created
            _this.events.trigger('post-picklist-create', _this.picklist.items);
        };
        this.picklist.showWhat3Words = function (items) {
            var _a;
            // Store the picklist items
            _this.picklist.what3wordsItems = items === null || items === void 0 ? void 0 : items.result.suggestions;
            _this.picklist.handleCommonShowPicklistLogic();
            if (((_a = _this.picklist.what3wordsItems) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                // Iterate over and show results
                _this.picklist.what3wordsItems.forEach(function (item) {
                    // Create a new item/row in the picklist
                    var listItem = _this.picklist.createWhat3WordsListItem(item);
                    _this.picklist.list.appendChild(listItem);
                    // Listen for selection on this item
                    _this.picklist.listen(listItem);
                });
                _this.picklist.scrollIntoViewIfNeeded();
            }
            else {
                _this.picklist.handleEmptyPicklist(items);
            }
            // Add a "Powered by Experian" logo to the picklist footer
            _this.poweredByLogo.element = _this.poweredByLogo.element || _this.poweredByLogo.create(_this.picklist);
            // Fire an event after picklist is created
            _this.events.trigger('post-picklist-create', _this.picklist.items);
        };
        this.picklist.showLookup = function (items) {
            // Store the picklist items
            var addresses = ((items === null || items === void 0 ? void 0 : items.result.addresses.length) == 0 && items.result.suggestions.length > 0) ? items === null || items === void 0 ? void 0 : items.result.suggestions : items === null || items === void 0 ? void 0 : items.result.addresses;
            var picklistItem = _this.returnAddresses ? addresses : items === null || items === void 0 ? void 0 : items.result.suggestions;
            _this.picklist.handleCommonShowPicklistLogic();
            if ((picklistItem === null || picklistItem === void 0 ? void 0 : picklistItem.length) > 0) {
                // Iterate over and show results
                picklistItem.forEach(function (item) {
                    // Create a new item/row in the picklist
                    var lookupItem = ((items === null || items === void 0 ? void 0 : items.result.addresses.length) == 0 && items.result.suggestions.length > 0) ? _this.picklist.createLookupSuggestionListItem(item) : _this.picklist.createLookupListItem(item);
                    var listItem = _this.returnAddresses
                        ? lookupItem : _this.picklist.createLookupSuggestionListItem(item);
                    _this.picklist.list.appendChild(listItem);
                    // Listen for selection on this item
                    _this.picklist.listen(listItem);
                });
                _this.picklist.scrollIntoViewIfNeeded();
            }
            else {
                _this.picklist.handleEmptyPicklist(items);
            }
            // Add a "Powered by Experian" logo to the picklist footer
            _this.poweredByLogo.element = _this.poweredByLogo.element || _this.poweredByLogo.create(_this.picklist);
            // Fire an event after picklist is created
            _this.events.trigger('post-picklist-create', _this.picklist.items);
        };
        this.picklist.handleCommonShowPicklistLogic = function () {
            var _a;
            // Reset any previously selected current item
            _this.picklist.currentItem = null;
            // Update picklist size
            _this.picklist.size = (_a = _this.picklist.items) === null || _a === void 0 ? void 0 : _a.length;
            // Reset the picklist tab count (used for keyboard navigation)
            _this.picklist.resetTabCount();
            // Hide the inline search spinner
            _this.searchSpinner.hide();
            // Get/Create picklist container element
            _this.picklist.list = _this.picklist.list || _this.picklist.createList();
            // Ensure previous results are cleared
            _this.picklist.list.innerHTML = '';
            _this.picklist.useAddressEntered.destroy();
            // Fire an event before picklist is created
            _this.events.trigger('pre-picklist-create', _this.picklist.items);
        };
        // Remove the picklist
        this.picklist.hide = function () {
            // Clear the current picklist item
            _this.picklist.currentItem = null;
            // Remove the "use address entered" option too
            _this.picklist.useAddressEntered.destroy();
            // Remove the "Powered by Experian" logo
            _this.poweredByLogo.destroy(_this.picklist);
            if (_this.inputs) {
                // Remove the class denoting a picklist - if Singleline mode is used, then it is the last input field, otherwise use the first one
                var position = _this.searchType === AddressValidationSearchType.SINGLELINE ? _this.inputs.length - 1 : 0;
                _this.inputs[position].classList.remove('showing-suggestions');
            }
            // Remove the main picklist container
            if (_this.picklist.list) {
                _this.picklist.container.remove();
                _this.picklist.list = undefined;
            }
        };
        this.picklist.handleEmptyPicklist = function (items) {
            var _a;
            // Create a new item/row in the picklist showing "No matches" that allows the "use address entered" option
            _this.picklist.useAddressEntered.element = _this.picklist.useAddressEntered.element || _this.picklist.useAddressEntered.create((_a = items.result) === null || _a === void 0 ? void 0 : _a.confidence);
            _this.picklist.scrollIntoViewIfNeeded();
            // Provide implementing search types with a means of invoking a custom callback
            if (typeof _this.picklist.handleEmptyPicklistCallback === 'function') {
                _this.picklist.handleEmptyPicklistCallback();
            }
        };
        // Prepend a title before the suggestions
        this.picklist.displaySuggestionsHeader = function () {
            var titleDiv = (document.querySelector('.picklist-suggestions-header') || document.createElement('div'));
            titleDiv.classList.add('picklist-suggestions-header');
            titleDiv.innerText = 'Suggestions:';
            _this.picklist.list.parentNode.insertBefore(titleDiv, _this.picklist.list);
        };
        // Append a footer at the bottom of the picklist providing an option to "use address entered"
        this.picklist.displayUseAddressEnteredFooter = function () {
            var containerDiv = document.querySelector('.picklist-use-entered-container') || document.createElement('div');
            containerDiv.classList.add('picklist-use-entered-container');
            _this.picklist.list.parentNode.insertBefore(containerDiv, _this.picklist.list.nextElementSibling);
            var titleDiv = (document.querySelector('.picklist-use-entered-header') || document.createElement('div'));
            titleDiv.classList.add('picklist-use-entered-header');
            titleDiv.innerText = 'Or use address entered:';
            containerDiv.appendChild(titleDiv);
            var itemDiv = (document.querySelector('.picklist-use-entered-option') || document.createElement('div'));
            itemDiv.classList.add('picklist-use-entered-option');
            itemDiv.innerText = _this.currentSearchTerm.replace(/,+/g, ', ');
            itemDiv.addEventListener('click', _this.picklist.useAddressEntered.click);
            containerDiv.appendChild(itemDiv);
        };
        // If the picklist container is out of bounds to the top or bottom, then scroll it into view
        this.picklist.scrollIntoViewIfNeeded = function () {
            var outOfBoundsTop = _this.picklist.container.getBoundingClientRect().top < 0;
            var outOfBoundsBottom = _this.picklist.container.getBoundingClientRect().bottom > window.innerHeight;
            if (outOfBoundsTop || outOfBoundsBottom) {
                _this.picklist.container.scrollIntoView();
            }
        };
        this.picklist.useAddressEntered = {
            element: null,
            // Create a "use address entered" option
            create: function (confidence) {
                var item = {
                    text: "".concat(confidence, " ").concat(_this.options.useAddressEnteredText)
                };
                var listItem = _this.picklist.createListItem(item);
                listItem.classList.add('use-address-entered');
                listItem.setAttribute('title', 'Enter address manually');
                _this.picklist.list = _this.picklist.list || _this.picklist.createList();
                _this.picklist.list.parentNode.insertBefore(listItem, _this.picklist.container.firstChild);
                listItem.addEventListener('click', _this.picklist.useAddressEntered.click);
                return listItem;
            },
            // Destroy the "use address entered" option
            destroy: function () {
                if (_this.picklist.useAddressEntered.element) {
                    _this.picklist.list.parentNode.removeChild(_this.picklist.useAddressEntered.element);
                    _this.picklist.useAddressEntered.element = undefined;
                }
            },
            // Use the address entered as the Formatted address
            click: function () {
                var inputData = {
                    result: {
                        confidence: 'No matches',
                        address: {
                            address_line_1: '',
                            address_line_2: '',
                            address_line_3: '',
                            locality: '',
                            region: '',
                            postal_code: '',
                            country: ''
                        }
                    }
                };
                if (_this.currentSearchTerm) {
                    // Try and split into lines by using comma delimiter
                    var lines = _this.currentSearchTerm.split(',');
                    if (lines[0]) {
                        inputData.result.address.address_line_1 = lines[0];
                    }
                    if (lines[1]) {
                        inputData.result.address.address_line_2 = lines[1];
                    }
                    if (lines[2]) {
                        inputData.result.address.address_line_3 = lines[2];
                    }
                    for (var i = 3; i < lines.length; i++) {
                        inputData.result.address.address_line_3 += lines[i];
                    }
                }
                _this.result.show(inputData);
                _this.result.updateHeading(_this.options.formattedAddressContainer.manualHeadingText);
            },
            // Create and return an address line object with the key as the label
            formatManualAddressLine: function (lines, i) {
                var key = defaults.addressLineLabels[i];
                var lineObject = {};
                lineObject[key] = lines[i] || '';
                return lineObject;
            }
        };
        // Create the picklist list (and container) and inject after the input
        this.picklist.createList = function () {
            // If Singleline mode is used, then append the picklist after the last input field, otherwise use the first one
            var position = _this.searchType === AddressValidationSearchType.SINGLELINE
                || _this.searchType === AddressValidationSearchType.LOOKUPV2 ? _this.inputs.length - 1 : 0;
            var container = document.createElement('div');
            container.classList.add('address-picklist-container');
            _this.picklist.container = container;
            // Insert the picklist container after the input
            _this.inputs[position].parentNode.insertBefore(_this.picklist.container, _this.inputs[position].nextElementSibling);
            var list = document.createElement('div');
            list.classList.add('address-picklist');
            // Append the picklist to the inner wrapper
            _this.picklist.container.appendChild(list);
            if (_this.currentDataSet[0] === _this.abnDataset && (_this.inputs[1] || _this.inputs[2] || _this.inputs[3])) {
                list.style.maxHeight = '32px';
            }
            // Add a class to the input to denote that a picklist with suggestions is being shown
            _this.inputs[position].classList.add('showing-suggestions');
            list.addEventListener('keydown', _this.picklist.checkEnter);
            return list;
        };
        // Create a new picklist item/row
        this.picklist.createListItem = function (item) {
            var row = document.createElement('div');
            var radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'address-picklist-radio';
            radio.value = item.text;
            var label = document.createElement('span');
            label.innerHTML = _this.picklist.addMatchingEmphasis(item);
            row.appendChild(radio);
            row.appendChild(label);
            // Store the Format URL if it exists, otherwise use the global_address_key as a "refinement" property
            if (item.format) {
                row.setAttribute('format', item.format);
            }
            else if (item.global_address_key) {
                row.setAttribute('refine', item.global_address_key);
            }
            return row;
        };
        // Create a new picklist item/row for what3words
        this.picklist.createWhat3WordsListItem = function (item) {
            var row = document.createElement('div');
            var name = document.createElement('div');
            var description = document.createElement('div');
            row.className = 'what3words';
            name.className = 'what3words-name';
            description.className = 'what3words-description';
            name.innerHTML = '///' + item.what3words.name;
            description.innerHTML = item.what3words.description;
            row.appendChild(name);
            row.appendChild(description);
            return row;
        };
        // Create a new picklist item/row for lookup items
        this.picklist.createLookupListItem = function (item) {
            var row = document.createElement('div');
            var radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'address-picklist-radio';
            radio.value = item.text;
            var label = document.createElement('span');
            label.innerHTML = _this.picklist.addMatchingEmphasis(item);
            row.appendChild(radio);
            row.appendChild(label);
            // Store the Format URL if it exists, otherwise use the global_address_key as a "refinement" property
            if (item.format) {
                row.setAttribute('format', item.format);
            }
            else if (item.global_address_key) {
                row.setAttribute('refine', item.global_address_key);
            }
            return row;
        };
        this.picklist.createLookupSuggestionListItem = function (item) {
            var _a, _b, _c, _d;
            var row = document.createElement('div');
            var locality = item.locality;
            var postalCode = item.postal_code;
            var townName = locality.town ? locality.town.name : (_this.currentCountryCode.toLowerCase() === "jpn" && locality.sub_region ? locality.sub_region.name : '');
            var regionName = (_b = (_a = locality.region) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = locality.region) === null || _c === void 0 ? void 0 : _c.code;
            var postalCodeName = (_d = postalCode === null || postalCode === void 0 ? void 0 : postalCode.full_name) !== null && _d !== void 0 ? _d : postalCode === null || postalCode === void 0 ? void 0 : postalCode.primary;
            row.innerHTML = townName + ' ' + regionName + ' ' + postalCodeName;
            row.setAttribute('region_name', regionName);
            row.setAttribute('town_name', locality.town ? locality.town.name : (_this.currentCountryCode.toLowerCase() === "jpn" && locality.sub_region ? locality.sub_region.name : ''));
            row.setAttribute('postal_code_name', postalCodeName);
            row.setAttribute('country', _this.currentCountryCode);
            row.setAttribute('postal_code_key', item.postal_code_key);
            row.setAttribute('locality_key', item.locality_key);
            return row;
        };
        this.picklist.refine = {
            element: null,
            // Returns whether the picklist needs refining. This happens after an item has been "stepped into" but has an unresolvable range.
            // The user is prompted to enter their selection (e.g. building number).
            isNeeded: function (response) {
                return _this.searchType !== AddressValidationSearchType.AUTOCOMPLETE
                    && _this.searchType !== AddressValidationSearchType.COMBINED
                    && (response.result.confidence === AddressValidationConfidenceType.PREMISES_PARTIAL
                        || response.result.confidence === AddressValidationConfidenceType.STREET_PARTIAL
                        || response.result.confidence === AddressValidationConfidenceType.MULTIPLE_MATCHES);
            },
            createInput: function (prompt, key) {
                var row = document.querySelector('.picklist-refinement-box') || document.createElement('div');
                row.classList.add('picklist-refinement-box');
                var input = (document.querySelector('.picklist-refinement-box input') || document.createElement('input'));
                input.setAttribute('type', 'text');
                input.setAttribute('placeholder', prompt);
                input.setAttribute('key', key);
                input.setAttribute(AddressValidationSearchType.AUTOCOMPLETE, 'new-password');
                input.setAttribute(AddressValidationSearchType.COMBINED, 'new-password');
                input.addEventListener('keydown', _this.picklist.refine.enter.bind(_this));
                _this.picklist.refine.element = input;
                var button = (document.querySelector('.picklist-refinement-box button') || document.createElement('button'));
                button.innerText = 'Refine';
                button.addEventListener('click', _this.picklist.refine.enter);
                row.appendChild(input);
                row.appendChild(button);
                _this.picklist.list.parentNode.insertBefore(row, _this.picklist.list);
                input.focus();
            },
            enter: function (event) {
                // Allow a new refinement entry if the enter key was used inside the textbox or the button was clicked
                if ((event instanceof KeyboardEvent && event.key === 'Enter') || event instanceof MouseEvent) {
                    event.preventDefault();
                    // If a picklist item is currently selected, then potentially use this instead of what's in the input field
                    if (_this.picklist.currentItem) {
                        _this.picklist.checkEnter(event);
                        return;
                    }
                    event.stopPropagation();
                    // Take the value from the input field and use this to further refine the address
                    if (_this.picklist.refine.element.value) {
                        var data = JSON.stringify({ refinement: _this.picklist.refine.element.value });
                        var key = _this.picklist.refine.element.getAttribute('key');
                        _this.request.send(_this.baseUrl, "".concat(_this.refineEndpoint, "/").concat(key), 'POST', _this.result.handleValidateResponse, data);
                    }
                }
                else if (_this.picklist.size && event instanceof KeyboardEvent && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter')) {
                    _this.picklist.keyup(event);
                }
            }
        };
        this.picklist.resetTabCount = function () {
            _this.picklist.tabCount = -1;
        };
        // Keyboard navigation
        this.picklist.keyup = function (event) {
            if (!_this.picklist.list) {
                return;
            }
            _this.picklist.checkEnter(event);
            // Get a list of all the addresses in the picklist
            var addresses = _this.picklist.list.querySelectorAll('div');
            var firstAddress;
            var lastAddress;
            // If the picklist is empty, just return
            if (addresses.length === 0) {
                return;
            }
            // Set the tabCount based on previous and direction
            if (event.key === 'ArrowUp') {
                _this.picklist.tabCount--;
            }
            else if (event.key === 'ArrowDown') {
                _this.picklist.tabCount++;
            }
            // Set top and bottom positions and enable wrap-around
            if (_this.picklist.tabCount < 0) {
                _this.picklist.tabCount = addresses.length - 1;
                lastAddress = true;
            }
            if (_this.picklist.tabCount > addresses.length - 1) {
                _this.picklist.tabCount = 0;
                firstAddress = true;
            }
            // Highlight the selected address
            var currentlyHighlighted = addresses[_this.picklist.tabCount];
            // Remove any previously highlighted ones
            var previouslyHighlighted = _this.picklist.list.querySelector('.selected');
            if (previouslyHighlighted) {
                previouslyHighlighted.classList.remove('selected');
                var prevRadio = previouslyHighlighted.querySelector('input[type="radio"]');
                if (prevRadio)
                    prevRadio.checked = false;
            }
            currentlyHighlighted.classList.add('selected');
            var radio = currentlyHighlighted.querySelector('input[type="radio"]');
            if (radio)
                radio.checked = true;
            // Set the currentItem on the picklist to the currently highlighted address
            _this.picklist.currentItem = currentlyHighlighted;
            // Scroll address into view, if required
            var addressListCoords = {
                top: _this.picklist.list.offsetTop,
                bottom: _this.picklist.list.offsetTop + _this.picklist.list.offsetHeight,
                scrollTop: _this.picklist.list.scrollTop,
                selectedTop: currentlyHighlighted.offsetTop,
                selectedBottom: currentlyHighlighted.offsetTop + currentlyHighlighted.offsetHeight,
                scrollAmount: currentlyHighlighted.offsetHeight
            };
            if (firstAddress) {
                _this.picklist.list.scrollTop = 0;
            }
            else if (lastAddress) {
                _this.picklist.list.scrollTop = 999;
            }
            else if (addressListCoords.selectedBottom + addressListCoords.scrollAmount > addressListCoords.bottom) {
                _this.picklist.list.scrollTop = addressListCoords.scrollTop + addressListCoords.scrollAmount;
            }
            else if (addressListCoords.selectedTop - addressListCoords.scrollAmount - addressListCoords.top < addressListCoords.scrollTop) {
                _this.picklist.list.scrollTop = addressListCoords.scrollTop - addressListCoords.scrollAmount;
            }
        };
        // Add emphasis to the picklist items highlighting the match
        this.picklist.addMatchingEmphasis = function (item) {
            var highlights = item.matched || [];
            var label = item.text;
            for (var i = 0; i < highlights.length; i++) {
                var replacement = '<b>' + label.substring(highlights[i][0], highlights[i][1]) + '</b>';
                label = label.substring(0, highlights[i][0]) + replacement + label.substring(highlights[i][1]);
            }
            return label;
        };
        // Listen to a picklist selection
        this.picklist.listen = function (row) {
            row.addEventListener('click', function (e) {
                // Check the radio button when row is clicked
                var radio = row.querySelector('input[type="radio"]');
                if (radio)
                    radio.checked = true;
                _this.picklist.pick(row);
            });
            // Also listen for radio button change
            var radio = row.querySelector('input[type="radio"]');
            if (radio) {
                radio.addEventListener('change', function () {
                    if (radio.checked) {
                        _this.picklist.pick(row);
                    }
                });
            }
        };
        this.picklist.checkEnter = function (event) {
            if (event.key === 'Enter' || event.key === 'Tab') {
                var picklistItem = void 0;
                // If picklist contains 1 address then use this one to format
                if (_this.picklist.size === 1) {
                    picklistItem = _this.picklist.list.querySelectorAll('div')[0];
                } // Else use the currently highlighted one when navigation using keyboard
                else if (_this.picklist.currentItem) {
                    picklistItem = _this.picklist.currentItem;
                }
                if (picklistItem) {
                    _this.picklist.pick(picklistItem);
                }
            }
        };
        // How to handle a picklist selection
        this.picklist.pick = function (item) {
            // Fire an event when an address is picked
            _this.events.trigger('post-picklist-selection', item);
            if (item.classList.contains(AddressValidationLookupKeywords.WHAT3WORDS.key)) {
                var elements = item.getElementsByTagName('div');
                _this.returnAddresses = true;
                _this.lookup(elements[0].innerHTML);
                return;
            }
            if (AddressValidationSearchType.LOOKUPV2 === _this.searchType && !_this.returnAddresses) {
                _this.formatLookupLocalityWithoutAddresses(item);
                return;
            }
            // Get a final address using picklist item unless it needs refinement
            if (item.getAttribute('format')) {
                if (Array.isArray(_this.currentDataSet) && _this.currentDataSet.includes('gb-additional-electricity') || _this.currentDataSet.includes('gb-additional-gas')) {
                    _this.format(item.getAttribute('format'), 'utilities');
                }
                else {
                    _this.format(item.getAttribute('format'));
                }
            }
            else {
                _this.refine(item.getAttribute('refine'));
            }
        };
    };
    /*
      // How to handle a picklist selection with rate limiting
      this.picklist.pick = (item) => {
        // Helper to show a rate-limit message
        const showRateLimitMessage = () => {
          const errorElement = document.querySelector('.error-display');
          if (errorElement) {
            errorElement.classList.remove('hidden');
            const label = errorElement.getElementsByTagName('label')[0];
            if (label) label.innerText = 'You have reached the maximum of 10 validations in 24 hours.';
          } else {
            alert('You have reached the maximum of 10 validations in 24 hours.');
          }
        };
  
        // The actual selection handling logic (moved into a function so we can call it after rate-limit check)
        const handleSelection = () => {
          // Fire an event when an address is picked
          this.events.trigger('post-picklist-selection', item);
  
          if (item.classList.contains(AddressValidationLookupKeywords.WHAT3WORDS.key)) {
            const elements = item.getElementsByTagName('div');
            this.returnAddresses = true;
            this.lookup(elements[0].innerHTML);
            return;
          }
  
          if (AddressValidationSearchType.LOOKUPV2 === this.searchType && !this.returnAddresses) {
            this.formatLookupLocalityWithoutAddresses(item);
            return;
          }
  
          // Get a final address using picklist item unless it needs refinement
          if (item.getAttribute('format')) {
            if (Array.isArray(this.currentDataSet) && this.currentDataSet.includes('gb-additional-electricity') || this.currentDataSet.includes('gb-additional-gas')) {
              this.format(item.getAttribute('format'), 'utilities');
            } else {
              this.format(item.getAttribute('format'));
            }
          } else {
            this.refine(item.getAttribute('refine'));
          }
        };
  
        // Enforce client-side rate limiting for picklist selections if RateLimiter is available
        try {
          const rl = (window as any).RateLimiter;
          if (rl && typeof rl.allowCall === 'function') {
            // disable interaction briefly to avoid duplicate clicks
            try { (item as HTMLElement).setAttribute('aria-disabled', 'true'); } catch (e) {}
            rl.allowCall().then((res: any) => {
              try { (item as HTMLElement).removeAttribute('aria-disabled'); } catch (e) {}
              if (!res || !res.allowed) {
                showRateLimitMessage();
                return;
              }
              handleSelection();
            }).catch(() => {
              try { (item as HTMLElement).removeAttribute('aria-disabled'); } catch (e) {}
              // On error resolving rate limiter, allow the selection to proceed
              handleSelection();
            });
          } else {
            // No rate limiter present — proceed immediately
            handleSelection();
          }
        } catch (e) {
          // Any unexpected error — fallback to normal behaviour
          handleSelection();
        }
      };
    }
      */
    AddressValidation.prototype.formatLookupLocalityWithoutAddresses = function (item) {
        this.result.updateAddressLine('locality', item.getAttribute('town_name'), 'address-line-input');
        this.result.updateAddressLine('region', item.getAttribute('region_name'), 'address-line-input');
        this.result.updateAddressLine('postal_code', item.getAttribute('postal_code_name'), 'address-line-input');
        this.result.updateAddressLine('country', item.getAttribute('country'), 'address-line-input');
        var key = AddressValidationLookupKeywords.POSTAL_CODE.key === this.lookupType ? 'postal_code_key' : 'locality_key';
        // Create the 'Search again' link and insert into DOM
        this.result.createSearchAgainLink();
        this.events.trigger('post-formatting-lookup', item.getAttribute(key), item);
    };
    AddressValidation.prototype.format = function (url, layout) {
        // Trigger an event
        this.events.trigger('pre-formatting-search', url);
        // Hide the searching spinner
        this.searchSpinner.hide();
        var gakForFormat = url.split('/')[6];
        var data = {
            layouts: layout ? [layout] : ['default'],
            layout_format: 'default',
            attributes: this.getEnrichmentAttributes(gakForFormat)
        };
        // Initiate a new Format request
        this.request.send(this.baseUrl, "".concat(this.formatEndpoint, "/").concat(gakForFormat), 'POST', this.result.show, JSON.stringify(data), [{ key: 'Add-Components', value: true }, { key: 'Add-Metadata', value: true }, { key: 'Add-Enrichment', value: true }]);
    };
    AddressValidation.prototype.refine = function (key) {
        // Trigger an event
        this.events.trigger('pre-refinement', key);
        // Hide the searching spinner
        this.searchSpinner.hide();
        // Initiate a new Step-in request using the global address key
        this.request.send(this.baseUrl, "".concat(this.stepInEndpoint, "/").concat(key), 'GET', this.picklist.show);
    };
    AddressValidation.prototype.lookup = function (key) {
        // Trigger an event
        this.events.trigger('pre-lookup', key);
        // Hide the searching spinner
        this.searchSpinner.hide();
        // Get the lookup request
        var lookupV2Request = this.generateLookupDataForApiCall(key, AddressValidationMode.WHAT3WORDS);
        var url = this.lookupV2Endpoint;
        var headers = [{ key: 'Add-Addresses', value: true }];
        var callback = this.picklist.showLookup;
        // Initiate new Search request
        this.request.send(this.baseUrl, url, 'POST', callback, lookupV2Request, headers);
    };
    AddressValidation.prototype.populateFormatContainer = function (data) {
        var _a, _b;
        var address = data.result.address;
        if ((_a = data.result) === null || _a === void 0 ? void 0 : _a.addresses_formatted) {
            address = data.result.addresses_formatted[0].address;
        }
        // Loop over each formatted address component
        if (address) {
            for (var i = 0; i < Object.keys(address).length; i++) {
                var key = Object.keys(address)[i];
                var addressComponent = address[key];
                // Bind the address element to the user's address field (or create a new one)
                this.result.updateAddressLine(key, addressComponent, 'address-line-input');
            }
        }
        this.result.formattedAddressContainer = this.options.elements.formattedAddressContainer;
        if (!this.result.formattedAddressContainer && this.result.generateAddressLineRequired) {
            this.result.createFormattedAddressContainer();
        }
        this.componentsCollectionMap.clear();
        var components = data.result.components;
        if (components) {
            for (var i = 0; i < Object.keys(components).length; i++) {
                var key = Object.keys(components)[i];
                this.componentsCollectionMap.set(key, components[key]);
            }
        }
        this.metadataCollectionMap.clear();
        var metadata = data.metadata;
        if (metadata) {
            for (var i = 0; i < Object.keys(metadata).length; i++) {
                var key = Object.keys(metadata)[i];
                this.metadataCollectionMap.set(key, metadata[key]);
            }
        }
        this.matchInfoCollectionMap.clear();
        var matchInfo = (_b = data === null || data === void 0 ? void 0 : data.result) === null || _b === void 0 ? void 0 : _b.match_info;
        if (matchInfo) {
            for (var i = 0; i < Object.keys(matchInfo).length; i++) {
                var key = Object.keys(matchInfo)[i];
                this.matchInfoCollectionMap.set(key, matchInfo[key]);
            }
        }
        // Hide country and address search fields (if they have a 'toggle' class)
        this.toggleSearchInputs('hide');
        // Enable users to search again subsequently
        this.hasSearchInputBeenReset = true;
        // If an address line is also the main search input, set property to false.
        // This ensures that typing in the field again (after an address has been
        // returned) will not trigger a new search.
        if (this.searchType === AddressValidationSearchType.AUTOCOMPLETE) {
            for (var element in this.options.elements) {
                if (Object.prototype.hasOwnProperty.call(this.options.elements, element)) {
                    // Excluding the input itself, does another element match the input field?
                    if (element !== 'input' && this.options.elements[element] === this.inputs[0]) {
                        this.hasSearchInputBeenReset = false;
                        break;
                    }
                }
            }
        }
        // Fire an event to say we've got the formatted address
        this.events.trigger('post-formatting-search', data);
    };
    AddressValidation.prototype.populateResponseToMap = function (response, expectedAttributes, expectedAttributeDescription, detailsMap) {
        if (response) {
            var _loop_2 = function (key, value) {
                if (!expectedAttributes.has(key)) {
                    return "continue";
                }
                var label = expectedAttributes.get(key);
                if (expectedAttributeDescription && expectedAttributeDescription.has(key)) {
                    var valueObj = expectedAttributeDescription.get(key);
                    var item = Object.values(valueObj).find(function (dataset) { return dataset.id === value; });
                    if (item) {
                        this_2.tooltipDescriptionMap.set(label, item.title);
                    }
                }
                detailsMap.set(label, value);
            };
            var this_2 = this;
            for (var _i = 0, response_1 = response; _i < response_1.length; _i++) {
                var _a = response_1[_i], key = _a[0], value = _a[1];
                _loop_2(key, value);
            }
        }
    };
    AddressValidation.prototype.extractNamesFromAddress = function (item) {
        var names = [];
        if (item.names) {
            item.names.forEach(function (member) {
                var formattedName = member.firstname + ' ' + member.middlename + ' ' + member.surname;
                names.push(formattedName);
            });
        }
        return names;
    };
    AddressValidation.prototype.populateForenamePicklist = function (names) {
        var forenameField = document.querySelector("input[name='Forename']");
        var middlenameField = document.querySelector("input[name='Middle Name']");
        var surnameField = document.querySelector("input[name='Surname']");
        var picklistContainer = document.createElement('div');
        picklistContainer.classList.add('forename-picklist-container');
        if (forenameField && forenameField.parentNode) {
            forenameField.parentNode.querySelectorAll('.forename-picklist-container').forEach(function (el) { return el.remove(); });
        }
        var picklist = document.createElement('div');
        picklist.classList.add('forename-picklist');
        names.forEach(function (name) {
            var cleanedName = name.replace(/\bundefined\b/g, '');
            var listItem = document.createElement('div');
            listItem.classList.add('forename-picklist-item');
            listItem.innerText = cleanedName;
            listItem.addEventListener('click', function () {
                var _a, _b, _c;
                var nameParts = cleanedName.split(' ');
                forenameField.value = (_a = nameParts[0]) !== null && _a !== void 0 ? _a : '';
                middlenameField.value = (_b = nameParts[1]) !== null && _b !== void 0 ? _b : '';
                surnameField.value = (_c = nameParts[2]) !== null && _c !== void 0 ? _c : '';
                picklistContainer.remove();
            });
            picklist.appendChild(listItem);
        });
        picklistContainer.appendChild(picklist);
        forenameField.insertAdjacentElement('afterend', picklistContainer);
    };
    AddressValidation.prototype.checkTab = function (event) {
        var key = this.getKey(event);
        if (key === 'Tab') {
            this.picklist.keyup(event);
            return;
        }
        else if (key === 'Enter') {
            // Prevent an 'Enter' keypress on the input submitting the form
            event.preventDefault();
        }
    };
    // Toggle the "hidden" class to either show or hide the input and country field(s)
    AddressValidation.prototype.toggleSearchInputs = function (state) {
        var _a, _b, _c;
        var modifier = state === 'show' ? 'remove' : 'add';
        (_a = this.options.elements.inputs) === null || _a === void 0 ? void 0 : _a.forEach(function (input) { return input.parentNode.querySelectorAll('.toggle').forEach(function (element) { return element.classList[modifier]('hidden'); }); });
        (_b = this.options.elements.countryList) === null || _b === void 0 ? void 0 : _b.parentNode.querySelectorAll('.toggle').forEach(function (element) { return element.classList[modifier]('hidden'); });
        (_c = this.options.elements.lookupButton) === null || _c === void 0 ? void 0 : _c.parentNode.querySelectorAll('.toggle').forEach(function (element) { return element.classList[modifier]('hidden'); });
    };
    AddressValidation.prototype.globalReset = function (event) {
        if (event) {
            event.preventDefault();
        }
        // Enable searching
        this.options.enabled = true;
        // Hide formatted address
        this.result.hide();
        // Reset search input back
        this.hasSearchInputBeenReset = true;
        // Clear the input field(s)
        this.inputs.forEach(function (input) { return input.value = ''; });
        // Remove the picklist (if present)
        this.picklist.hide();
        // Show search input
        this.toggleSearchInputs('show');
        // Apply focus to input
        this.inputs[0].focus();
        // set AddressValidationMode back to default
        this.avMode = AddressValidationMode.SEARCH;
        // Fire an event after a reset
        this.events.trigger('post-reset');
    };
    AddressValidation.prototype.isInternationalValidation = function () {
        // Return true if the current dataset indicates this is a international data validation call
        if (this.searchType === AddressValidationSearchType.VALIDATE
            && this.currentDataSet.length == 1
            && this.currentDataSet[0].toUpperCase().endsWith('-ED')) {
            return true;
        }
        return false;
    };
    AddressValidation.prototype.generateLookupType = function (avMode) {
        switch (avMode) {
            case AddressValidationMode.WHAT3WORDS:
                return AddressValidationLookupKeywords.WHAT3WORDS.key;
            case AddressValidationMode.UDPRN:
                return AddressValidationLookupKeywords.UDPRN.key;
            case AddressValidationMode.LOCALITY:
                return AddressValidationLookupKeywords.LOCALITY.key;
            case AddressValidationMode.POSTAL_CODE:
                return AddressValidationLookupKeywords.POSTAL_CODE.key;
            case AddressValidationMode.MPAN:
                return AddressValidationLookupKeywords.MPAN.key;
            case AddressValidationMode.MPRN:
                return AddressValidationLookupKeywords.MPRN.key;
        }
    };
    return AddressValidation;
}());
export default AddressValidation;
//# sourceMappingURL=address-search.js.map