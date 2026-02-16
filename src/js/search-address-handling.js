// Set the custom options
var options = {
    searchType: 'combined',
    maxSuggestions: 10,
    maxSuggestionsForLookup: 1000,
    useSpinner: false,
    elements: {
    countryList: document.querySelector("#country-dataset-container select#country"),
        address_line_1: document.querySelector("input[name='address_line_1']"),
        address_line_2: document.querySelector("input[name='address_line_2']"),
        address_line_3: document.querySelector("input[name='address_line_2']"),
        locality: document.querySelector("input[name='locality']"),
        region: document.querySelector("input[name='region']"),
        postal_code: document.querySelector("input[name='postal_code']"),
        country: document.querySelector("input[name='country']"),
        lookupButton: document.querySelector("button#find-address-button"),
        validateButton: document.querySelector("button#validate-address-button")
    }
};


// Initialise address validation
var address = new AddressValidation(options);
var addressValidationMap, addressValidationW3wMarker, addressValidationGeoMarker;

// Centralized function to control button visibility based on search type
function updateButtonVisibility() {
    const findButton = document.querySelector("button#find-address-button");
    const validateButton = document.querySelector("button#validate-address-button");
    
    if (address.searchType === "validate" || address.searchType === "singleline" || address.searchType === "lookupv2") {
        findButton.classList.remove('hidden');
        validateButton.classList.add('hidden');
    } else if (address.searchType === "autocomplete") {
        const forenameInput = document.querySelector("input[name='Forename']");
        if (forenameInput) {
            findButton.classList.add('hidden');
            validateButton.classList.remove('hidden');
        } else {
            findButton.classList.add('hidden');
            validateButton.classList.add('hidden');
        }
    } else {
        findButton.classList.add('hidden');
        validateButton.classList.add('hidden');
    }
}

// Show country dataset dropdown only after user chooses to validate an address
var showDatasetBtn = document.getElementById('show-dataset-button');
if (showDatasetBtn) {
    showDatasetBtn.addEventListener('click', function() {
        var container = document.getElementById('country-dataset-container');
        var trigger = document.getElementById('dataset-trigger');
        if (container && trigger) {
            container.classList.remove('hidden');
            trigger.classList.add('hidden');
        }
    });
}

// Accept a new token from the token prompt and set this in the AddressValidation class
function addToken() {
    const tokenValue = document.querySelector('[name="token"]').value.trim();
    if (!tokenValue) {
        document.querySelector('[name="token"]').classList.add('input-error');
        return;
    }
    address.setToken(tokenValue);
    document.querySelector('main').classList.remove('inactive');
    document.querySelector('.token-prompt').classList.add('hidden');
    // Dispatch a custom event so other validation modules can initialize
    window.dispatchEvent(new CustomEvent('validation-token-set', { detail: { token: tokenValue } }));
}

function setProgress(currentStep, totalSteps) {
    const percent = (currentStep / totalSteps) * 100;
    document.querySelector('.progress').style.width = percent + '%';
}

// Initialize phone country dropdown with flags on page load
document.addEventListener('DOMContentLoaded', function() {
    const phoneCountrySelect = document.querySelector('#country-code');
    if (phoneCountrySelect) {
        createCustomDropdown(phoneCountrySelect);
    }
});

// Simplified custom dropdown for country flags
function createCustomDropdown(selectElement) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-options';
    
    // Update trigger with selected option
    function updateTrigger() {
        const selected = selectElement.options[selectElement.selectedIndex];
        const iso2Attr = selected.getAttribute('data-iso2') || selected.getAttribute('data-iso');
        const dialingCode = selected.getAttribute('data-dialing');
        
        if (iso2Attr) {
            const iso2 = iso2Attr.toLowerCase();
            // For phone dropdown, show only flag and dialing code in trigger
            if (dialingCode) {
                trigger.innerHTML = `<img src="https://flagcdn.com/20x15/${iso2}.png" class="country-flag" alt="">${dialingCode}`;
            } else {
                // For address dropdown, show flag and full country name
                trigger.innerHTML = `<img src="https://flagcdn.com/20x15/${iso2}.png" class="country-flag" alt="">${selected.text}`;
            }
        } else {
            trigger.innerHTML = selected.text;
        }
    }
    
    // Populate options
    Array.from(selectElement.options).forEach(option => {
        if (option.value) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'custom-option';
            const iso2Attr = option.getAttribute('data-iso2') || option.getAttribute('data-iso');
            if (iso2Attr) {
                const iso2 = iso2Attr.toLowerCase();
                optionDiv.innerHTML = `<img src="https://flagcdn.com/20x15/${iso2}.png" class="country-flag" alt="">${option.text}`;
            } else {
                optionDiv.innerHTML = option.text;
            }
            optionDiv.dataset.value = option.value;
            
            optionDiv.addEventListener('click', () => {
                selectElement.value = option.value;
                selectElement.dispatchEvent(new Event('change'));
                updateTrigger();
                wrapper.classList.remove('open');
            });
            
            optionsContainer.appendChild(optionDiv);
        }
    });
    
    trigger.addEventListener('click', () => wrapper.classList.toggle('open'));
    
    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
    });
    
    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsContainer);
    selectElement.style.display = 'none';
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    
    updateTrigger();
    
    // Update when select changes programmatically
    selectElement.addEventListener('change', updateTrigger);
}

// Ensure page starts in unauthenticated state every refresh
document.querySelector('main').classList.add('inactive');
document.querySelector('.token-prompt').classList.remove('hidden');

// populate the country dataset dropdown with the authorized country datasets
address.events.on("post-datasets-update", function() {
    let countryListElement = options.elements.countryList;
    let optionElements = countryListElement.getElementsByTagName("option")
    Array.from(optionElements).filter(option => option.innerText !== 'Please select').forEach(option => option.remove())

    let countries = address.countryDropdown;
    for (const country of countries) {
        const optionElement = document.createElement("option");
        // Create unique value by combining iso3Code with dataset codes
        const uniqueValue = country.iso3Code + ';' + country.datasetCodes.join(',');
        optionElement.setAttribute("value", uniqueValue);
        optionElement.setAttribute("data-iso2", country.iso2Code);
        optionElement.setAttribute("data-iso3", country.iso3Code);
        optionElement.setAttribute("data-datasets", country.datasetCodes.join(','));
        optionElement.innerText = country.country;
        countryListElement.append(optionElement);
    }

    // Set United Kingdom as default selection after populating
    // Find the first GBR option (there may be multiple)
    const gbrOption = Array.from(countryListElement.options).find(opt => opt.getAttribute('data-iso3') === 'GBR');
    if (gbrOption) {
        countryListElement.value = gbrOption.value;
    }
    // Trigger the change event to update search types
    const event = new Event('change');
    countryListElement.dispatchEvent(event);
    
    // Create custom dropdown after populating options
    createCustomDropdown(countryListElement);

    setProgress(1, 4);
});

// Show the supported search types for the selected country
address.events.on("post-country-list-change", function(supportedSearchTypes, currentSearchType) {
    // Use autocomplete as default search type
    currentSearchType = 'autocomplete';
    
    // Reset all search types to hidden
    document.querySelectorAll('.search-type-selector').forEach(panel => panel.classList.add('hidden'));
    document.querySelectorAll('label[data-panel-type]').forEach(label => label.classList.add('hidden'));

    // Show search types available for the selected country, but only show-by-default ones
    // Other search types remain hidden until user clicks "Other search types" link
    supportedSearchTypes.filter(x => x != 'typedown').forEach(searchType => {
        document.querySelectorAll("label[data-panel-type~='" + searchType + "'].show-by-default").forEach(panel => panel.classList.remove('hidden'));
    });

    // Toggle which panel should be selected
    document.querySelectorAll('.search-type-selector').forEach(panel => panel.classList.remove('search-type-selected'));
    document.querySelector("label.search-type-selector[data-panel-type='" + currentSearchType + "']").classList.add('search-type-selected');
    radiobtn = document.getElementById(currentSearchType + "-radio");
    radiobtn.checked = true;

    setProgress(2, 4);
});

// Show the large spinner while we're searching for the formatted address
address.events.on("pre-formatting-search", function() {
    if (!(address.searchType === 'autocomplete' && address.inputs.length === 4))
    {
        document.querySelector(".loader").classList.remove("hidden");
    }

    setProgress(3, 4);
});

// Show the large spinner while we're searching for the formatted address
address.events.on("pre-search", function() {document.querySelector(".loader").classList.remove("hidden");});

// Hide the large spinner when a result is found
address.events.on("post-formatting-search", function(data) {
    document.querySelector(".loader").classList.add("hidden");
    document.querySelector("#validated-address-info").classList.remove("hidden");

    if ((data.result.confidence !== "No matches" || address.searchType === 'combined' || address.searchType === 'autocomplete') && !data.result.names) {
        // Show the formatted address fields
        document.querySelector(".formatted-address").classList.remove("hidden");
        document.querySelectorAll(".formatted-address .hidden").forEach(element => element.classList.remove("hidden"));
        // Hide the promptset as we have now captured the address
        document.querySelector('.promptset').classList.add('hidden');
        // Hide both buttons when results are shown
        document.querySelector("button#find-address-button").classList.add('hidden');
        document.querySelector("button#validate-address-button").classList.add('hidden');
        document.querySelector("#validated-name").classList.add("hidden");
    } else if (data.result.names) {
        document.querySelector(".formatted-address").classList.remove("hidden");
        document.querySelectorAll(".formatted-address .hidden").forEach(element => element.classList.remove("hidden"));
        // Hide the promptset as we have now captured the address
        document.querySelector('.promptset').classList.add('hidden');
        // Hide both buttons when results are shown
        document.querySelector("button#find-address-button").classList.add('hidden');
        document.querySelector("button#validate-address-button").classList.add('hidden');
    }

    // Populate the metadata section with more details about this address
    populateMetadata(data);

    setProgress(4, 4);
});

address.events.on("post-formatting-lookup", function(key, item) {
    document.querySelector("#validated-address-info").classList.add("hidden");
    document.querySelectorAll(".formatted-address").forEach(element => element.classList.remove("hidden"));
    document.querySelector('.promptset').classList.add('hidden');
    // Hide both buttons when results are shown
    document.querySelector("button#find-address-button").classList.add('hidden');
    document.querySelector("button#validate-address-button").classList.add('hidden');

    // Populate the metadata section with more details about this address
    address.getLookupEnrichmentData(key);
    document.querySelector(".metadata").classList.remove("invisible");
});

// Hide the formatted address container again upon reset
address.events.on("post-reset", function() {
    document.querySelector(".formatted-address").classList.add("hidden");
    
    try {
        resetMetadata();
    } catch(e) {
        // Ignore metadata reset errors
    }
    
    document.querySelector('.promptset').classList.remove('hidden');
    
    // Expand the Address collapsible panel
    const addressContent = document.getElementById('address-validation-content');
    const addressButton = document.getElementById('address-header-button');
    if (addressContent && addressButton) {
        addressContent.classList.remove('hidden');
        addressButton.classList.remove('collapsed');
    }
    
    const findButton = document.querySelector("button#find-address-button");
    const validateButton = document.querySelector("button#validate-address-button");
    
    findButton.classList.remove('hidden');
    validateButton.classList.remove('hidden');
    
    updateButtonVisibility();
    // to reset the Lookup type dropdown selected value
    if (address.searchType === "lookupv2") {
        let lookupType = document.getElementById("address-input-0");
        lookupType.getElementsByTagName("option")[0].selected = "true";

        let addAddresses = document.getElementById("address-input-1");
        addAddresses.getElementsByTagName("option")[0].selected = "true";
    }
});

// Hide the loader if the request results in a 400 Bad Request error
address.events.on("request-error", function() {
    document.querySelector(".loader").classList.add("hidden");
});

address.events.on("post-search", function() {
    document.querySelector(".loader").classList.add("hidden");
});

// Prompt for a token if the request is unauthorised (token is invalid or missing)
address.events.on("request-error-401", function() {
    document.querySelector('main').classList.add('inactive');
    document.querySelector('.token-prompt').classList.remove('hidden');
});

// When the promptset is changed, update the form fields accordingly
address.events.on("post-promptset-check", function(response) {
    const inputs = [];
    let errorElement = document.querySelector('.error-display');
    if (!errorElement.classList.contains("hidden")) {
        errorElement.classList.add('hidden');
        document.querySelector('.promptset').classList.remove('hidden');
    }
    // Clear any previous address input form fields
    document.querySelector('.address-field-inputs').innerHTML = "";
    document.querySelector('.forename-field-inputs').innerHTML = "";

    // Iterate over each new line and create a new label and input
    response.result.lines.forEach((line, idx) => {
        const label = document.createElement("label");
        label.setAttribute("for", `address-input-${idx}`);
        label.innerText = line.prompt;

        let input;
        if (line.dropdown_options) {
            input = document.createElement("select");
            input.classList.add("address-input");
            input.setAttribute("id", `address-input-${idx}`);
            line.dropdown_options.forEach((dropdownOption) => {
                const optionElement = document.createElement("option");
                optionElement.setAttribute("value", dropdownOption.key);
                optionElement.innerText = dropdownOption.display;
                input.append(optionElement);
            });
        } else {
            input = document.createElement("input");
            input.classList.add("address-input");
            input.setAttribute("type", "text");
            input.setAttribute("id", `address-input-${idx}`);

            // Set the "name" attribute for the "Forename" field
            if (line.prompt === "Forename") {
                input.setAttribute("name", "Forename");
            } else if (line.prompt === "Middle Name") {
                input.setAttribute("name", "Middle Name");
            } else if (line.prompt === "Surname") {
                input.setAttribute("name", "Surname");
            }

            if (line.suggested_input_length) {
                input.setAttribute("size", line.suggested_input_length);
            }

            if (line.example) {
                input.setAttribute("placeholder", line.example);
            }
        }
         inputs.push(input);
         
         document.querySelector('.address-field-inputs').append(label, input);
    });

    // Register the event listeners on the new inputs
    address.setInputs(inputs);

    updateButtonVisibility();
});

// To display error when unsupported search type is selected
address.events.on("error-display", function (error) {
    document.querySelector('.promptset').classList.add('hidden');
    resetMetadata();
    document.querySelectorAll('.formatted-address').forEach(element => element.classList.add('hidden'));

    let errorElement = document.querySelector('.error-display');
    errorElement.classList.remove('hidden');

    const labelElement = errorElement.getElementsByTagName('label')[0];
    labelElement.innerText = error;
});

/* Demo specific code */
// Allow the user to change the search type
document.querySelectorAll('.search-type-selector').forEach(panel => panel.addEventListener('click', togglePanel));

function togglePanel(e) {
    // Toggle which panel should be selected
    document.querySelectorAll('.search-type-selector').forEach(panel => panel.classList.remove('search-type-selected'));
    e.currentTarget.classList.add('search-type-selected');

    address.setSearchType(e.currentTarget.dataset.panelType);
}

// Client-side rate limit enforcement for demo: block clicks when over limit
function attachRateLimitToButton(buttonId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener('click', function (e) {
        // If this click was programmatically re-dispatched after allowance, allow it
        if (btn.dataset.rlBypass === '1') {
            // remove bypass flag and allow normal handling
            delete btn.dataset.rlBypass;
            return;
        }
        // prevent default action until rate-limiter check completes
        e.preventDefault();
        e.stopImmediatePropagation();
        if (window.RateLimiter && typeof window.RateLimiter.allowCall === 'function') {
            // show temporary disabled state
            const prevDisabled = btn.disabled;
            btn.disabled = true;
            window.RateLimiter.allowCall().then(function (res) {
                btn.disabled = prevDisabled;
                if (!res.allowed) {
                    // show an error in the page if possible
                    const errorElement = document.querySelector('.error-display');
                    if (errorElement) {
                        errorElement.classList.remove('hidden');
                        const label = errorElement.getElementsByTagName('label')[0];
                        if (label) label.innerText = 'You have reached the maximum of 10 validations in 24 hours.';
                    } else {
                        alert('You have reached the maximum of 10 validations in 24 hours.');
                    }
                    return;
                }
                // allowed -> re-dispatch the click but mark as bypass
                btn.dataset.rlBypass = '1';
                btn.click();
            }).catch(function () {
                // on error, allow the action to proceed
                btn.disabled = prevDisabled;
                btn.dataset.rlBypass = '1';
                btn.click();
            });
        } else {
            // no rate limiter -> proceed
            btn.dataset.rlBypass = '1';
            btn.click();
        }
    }, true);
}