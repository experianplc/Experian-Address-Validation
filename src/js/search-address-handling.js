// Set the custom options
var options = {
    searchType: 'combined',
    maxSuggestions: 100,
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
        country: document.querySelector("input[name='validated_country']"),
        lookupButton: document.querySelector("button#find-address-button"),
        validateButton: document.querySelector("button#validate-address-button")
    }
};


// Initialise address validation
var address = new AddressValidation(options);
var addressValidationMap, addressValidationW3wMarker, addressValidationGeoMarker;
var validationSessionStorageKey = 'eav-validation-session';
var signoutButton = document.getElementById('signout-button');

function setAuthUi(isAuthenticated) {
    document.querySelector('main').classList.toggle('inactive', !isAuthenticated);
    document.querySelector('.token-prompt').classList.toggle('hidden', isAuthenticated);
    if (signoutButton) {
        signoutButton.classList.toggle('hidden', !isAuthenticated);
    }
}

function saveValidationSession(addressToken, publishedToken) {
    try {
        window.sessionStorage.setItem(validationSessionStorageKey, JSON.stringify({
            addressToken,
            publishedToken: typeof publishedToken === 'undefined' ? addressToken : publishedToken
        }));
    } catch (error) {
        console.warn('Unable to persist validation session:', error);
    }
}

function readValidationSession() {
    try {
        const rawSession = window.sessionStorage.getItem(validationSessionStorageKey);
        return rawSession ? JSON.parse(rawSession) : null;
    } catch (error) {
        console.warn('Unable to read validation session:', error);
        return null;
    }
}

function clearValidationSession() {
    try {
        window.sessionStorage.removeItem(validationSessionStorageKey);
    } catch (error) {
        console.warn('Unable to clear validation session:', error);
    }
}

function applyAuthenticatedState(addressToken, publishedToken, dispatchTokenEvent = true, persistSession = true) {
    const effectivePublishedToken = typeof publishedToken === 'undefined' ? addressToken : publishedToken;

    setAuthUi(true);
    address.setToken(addressToken);

    if (persistSession) {
        saveValidationSession(addressToken, effectivePublishedToken);
    }

    if (dispatchTokenEvent) {
        publishValidationToken(effectivePublishedToken);
    } else {
        window.__validationToken = effectivePublishedToken;
    }
}

function restoreValidationSession() {
    const session = readValidationSession();
    if (!session || !session.addressToken) {
        return false;
    }

    applyAuthenticatedState(session.addressToken, session.publishedToken, true, false);
    return true;
}

function returnToLoginScreen() {
    clearValidationSession();
    window.__validationToken = undefined;
    if (address && typeof address.reset === 'function') {
        address.reset();
    }
    const tokenInput = document.querySelector('[name="token"]');
    if (tokenInput) {
        tokenInput.value = '';
        tokenInput.classList.remove('input-error');
    }
    setAuthUi(false);
}

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
function publishValidationToken(token) {
    window.__validationToken = token;
    window.dispatchEvent(new CustomEvent('validation-token-set', { detail: { token } }));
}

function addToken() {
    const tokenValue = document.querySelector('[name="token"]').value.trim();
    if (!tokenValue) {
        document.querySelector('[name="token"]').classList.add('input-error');
        return;
    }
    applyAuthenticatedState(tokenValue);
    document.querySelector('.progress-bar').classList.remove('hidden');
}

function setProgress(currentStep, totalSteps) {
    const percent = (currentStep / totalSteps) * 100;
    document.querySelector('.progress').style.width = percent + '%';
}

// Sync phone validation country with address validation country selection
function syncPhoneCountryWithAddress() {
    const addressCountrySelect = document.querySelector('#country-dataset-container select#country');
    const phoneCountrySelect = document.querySelector('#country-code');
    
    if (!addressCountrySelect || !phoneCountrySelect) {
        return;
    }

    const selectedOption = addressCountrySelect.options[addressCountrySelect.selectedIndex];
    if (!selectedOption) {
        return;
    }

    const addressIso3 = selectedOption.getAttribute('data-iso3');
    
    if (!addressIso3) {
        return;
    }

    const matchingPhoneOption = Array.from(phoneCountrySelect.options).find(
        option => option.value === addressIso3
    );

    if (matchingPhoneOption) {
        phoneCountrySelect.value = matchingPhoneOption.value;
        
        const changeEvent = new Event('change');
        phoneCountrySelect.dispatchEvent(changeEvent);
        
        const customTrigger = phoneCountrySelect.parentElement?.querySelector('.custom-select-trigger');
        if (customTrigger) {
            const iso2 = matchingPhoneOption.getAttribute('data-iso');
            const dialingCode = matchingPhoneOption.getAttribute('data-dialing');
            if (iso2 && dialingCode) {
                customTrigger.innerHTML = `<img src="https://flagcdn.com/${iso2.toLowerCase()}.svg" class="country-flag" alt="">${dialingCode}`;
            }
        }
    }
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
    if (!selectElement || !selectElement.parentNode) {
        return;
    }

    // Rebuild safely: remove any previous custom dropdown instance and listeners.
    if (typeof selectElement.__customSelectCleanup === 'function') {
        selectElement.__customSelectCleanup();
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('tabindex', '0');
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-options';
    
    // Store all options for filtering
    const allOptions = [];
    let searchTerm = '';
    
    // Update trigger with selected option
    function updateTrigger() {
        const selected = selectElement.options[selectElement.selectedIndex];
        const iso2Attr = selected.getAttribute('data-iso2') || selected.getAttribute('data-iso');
        const dialingCode = selected.getAttribute('data-dialing');
        
        if (iso2Attr) {
            const iso2 = iso2Attr.toLowerCase();
            // For phone dropdown, show only flag and dialing code in trigger
            if (dialingCode) {
                trigger.innerHTML = `<img src="https://flagcdn.com/${iso2}.svg" class="country-flag" alt="">${dialingCode}`;
            } else {
                // For address dropdown, show flag and full country name
                trigger.innerHTML = `<img src="https://flagcdn.com/${iso2}.svg" class="country-flag" alt="">${selected.text}`;
            }
        } else {
            trigger.innerHTML = selected.text;
        }
    }
    
    // Filter options based on search term
    function filterOptions(term) {
        const searchLower = term.toLowerCase();
        
        if (searchLower === '') {
            return;
        }
        
        // Find first country starting with the typed letter
        const firstMatch = allOptions.find(optionData => {
            const text = optionData.text.toLowerCase();
            return text.startsWith(searchLower);
        });
        
        // Scroll to that country if found
        if (firstMatch) {
            firstMatch.element.scrollIntoView({ block: 'start', behavior: 'auto' });
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
                optionDiv.innerHTML = `<img src="https://flagcdn.com/${iso2}.svg" class="country-flag" alt="">${option.text}`;
            } else {
                optionDiv.innerHTML = option.text;
            }
            optionDiv.dataset.value = option.value;
            
            // Store option data for filtering
            allOptions.push({
                element: optionDiv,
                text: option.text,
                value: option.value
            });
            
            optionDiv.addEventListener('click', () => {
                selectElement.value = option.value;
                selectElement.dispatchEvent(new Event('change'));
                updateTrigger();
                wrapper.classList.remove('open');
                searchTerm = '';
            });
            
            optionsContainer.appendChild(optionDiv);
        }
    });
    
    // Keyboard search functionality
    function handleKeyboardSearch(e) {
        // Only handle letter/number keys when dropdown is open
        if (!wrapper.classList.contains('open')) return;
        
        if (e.key.length === 1 && e.key.match(/[a-z0-9]/i)) {
            e.preventDefault();
            searchTerm = e.key;  // Replace search term with new letter
            filterOptions(searchTerm);
        } else if (e.key === 'Escape') {
            wrapper.classList.remove('open');
            searchTerm = '';
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const firstVisible = allOptions.find(opt => opt.element.style.display !== 'none');
            if (firstVisible) {
                firstVisible.element.click();
            }
        }
    }
    
    trigger.addEventListener('click', () => {
        wrapper.classList.toggle('open');
        if (!wrapper.classList.contains('open')) {
            searchTerm = '';
        }
    });
    
    document.addEventListener('keydown', handleKeyboardSearch);
    
    // Close on click outside
    const handleClickOutside = (e) => {
        if (!wrapper.contains(e.target)) {
            wrapper.classList.remove('open');
            searchTerm = '';
        }
    };

    document.addEventListener('click', handleClickOutside);
    
    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsContainer);
    selectElement.style.display = 'none';
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    
    updateTrigger();
    
    // Update when select changes programmatically
    const changeHandler = () => updateTrigger();
    selectElement.addEventListener('change', changeHandler);

    selectElement.__customSelectCleanup = () => {
        document.removeEventListener('keydown', handleKeyboardSearch);
        document.removeEventListener('click', handleClickOutside);
        selectElement.removeEventListener('change', changeHandler);
        if (wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
        }
        selectElement.style.display = '';
    };
}

// Accept a new token from the token prompt and set this in the AddressValidation class
function guestLogin() {
    setUniqueCookie();
    applyAuthenticatedState('guest', 'null');
}

function setUniqueCookie() {
    const cookies = document.cookie.split("; ");
    var cookieFound = false;
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");
    if (key === 'EAVDVSCookie') {
      cookieFound = true;
    }
  }
  if(cookieFound){
    return;
  }
  const name = 'EAVDVSCookie'; // unique cookie name
  const value = crypto.randomUUID(); // unique cookie name
  const now = new Date();
  now.setTime(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  const expires = "expires=" + now.toUTCString();
  document.cookie = `${name}=${value}; ${expires}; path=/`;

  return name; // in case you want to know what it was
}

// Ensure page starts in unauthenticated state every refresh
setAuthUi(false);
document.querySelector(".formatted-address").classList.add("hidden");
restoreValidationSession();

if (signoutButton) {
    signoutButton.addEventListener('click', returnToLoginScreen);
}

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

    // Determine default country from URL path (/uk, /us, /au) or default to GBR
    const routeSegment = window.location.pathname
        .split('/')
        .filter(Boolean)
        .find(segment => ['uk', 'us', 'au'].includes(segment.toLowerCase()));
    const countryMap = {
        'uk': 'GBR',
        'us': 'USA',
        'au': 'AUS'
    };
    const defaultIso3 = countryMap[routeSegment?.toLowerCase()] || 'GBR';
    
    // Find and select the default country option
    const preferredDatasetByIso3 = {
        'AUS': 'au-address'
    };
    const preferredDataset = preferredDatasetByIso3[defaultIso3];
    const defaultOption = Array.from(countryListElement.options).find(opt => {
        if (opt.getAttribute('data-iso3') !== defaultIso3) {
            return false;
        }

        if (!preferredDataset) {
            return true;
        }

        const datasets = (opt.getAttribute('data-datasets') || '').split(',');
        return datasets.includes(preferredDataset);
    }) || Array.from(countryListElement.options).find(opt => opt.getAttribute('data-iso3') === defaultIso3);
    if (defaultOption) {
        countryListElement.value = defaultOption.value;
    }
    // Trigger the change event to update search types
    const event = new Event('change');
    countryListElement.dispatchEvent(event);
    
    // Create custom dropdown after populating options
    createCustomDropdown(countryListElement);
    
    // Sync phone country with initial address country selection
    syncPhoneCountryWithAddress();

    setProgress(1, 4);
});

// Show the supported search types for the selected country
address.events.on("post-country-list-change", function(supportedSearchTypes, currentSearchType) {
    // Use autocomplete as default search type
    currentSearchType = 'autocomplete';

    // Ensure all show-by-default panels are visible
    document.querySelectorAll('.search-type-selector.show-by-default').forEach(panel => panel.classList.remove('hidden'));

    // Grey out unsupported search types; enable supported ones (typedown has no UI panel)
    const supportedExcludingTypedown = supportedSearchTypes.filter(x => x !== 'typedown');
    document.querySelectorAll('.search-type-selector[data-panel-type]').forEach(panel => {
        const panelType = panel.dataset.panelType;
        const isSupported = supportedExcludingTypedown.indexOf(panelType) >= 0;
        const radioInput = panel.querySelector('input[type="radio"]');
        if (isSupported) {
            panel.classList.remove('search-type-disabled');
            if (radioInput) radioInput.removeAttribute('disabled');
        } else {
            panel.classList.add('search-type-disabled');
            if (radioInput) radioInput.setAttribute('disabled', 'disabled');
        }
    });

    // Toggle which panel should be selected
    document.querySelectorAll('.search-type-selector').forEach(panel => panel.classList.remove('search-type-selected'));
    document.querySelector("label.search-type-selector[data-panel-type='" + currentSearchType + "']").classList.add('search-type-selected');
    radiobtn = document.getElementById(currentSearchType + "-radio");
    radiobtn.checked = true;

    // Sync phone validation country with address validation country
    syncPhoneCountryWithAddress();

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

    // Keep metadata panel visible for all non-error responses (including Validate).
    document.querySelector(".metadata").classList.remove("invisible");

    setProgress(4, 4);
});

address.events.on("post-formatting-lookup", function(key, item) {
    if (address.picklist && typeof address.picklist.hide === 'function') {
        address.picklist.hide();
    }

    const validatedAddressLines = [
        item && item.getAttribute('town_name'),
        item && item.getAttribute('region_name'),
        item && item.getAttribute('postal_code_name'),
        item && item.getAttribute('country')
    ].filter(Boolean);

    document.querySelector(".metadata #delivery-address-key").innerHTML = validatedAddressLines.length ? 'Validated address: ' : '';
    document.querySelector(".metadata #delivery-address-value").innerHTML = validatedAddressLines.join("<br>");
    document.querySelector("#validated-name").classList.add("hidden");

    document.querySelector("#validated-address-info").classList.remove("hidden");
    document.querySelectorAll(".formatted-address").forEach(element => element.classList.remove("hidden"));
    document.querySelector('.promptset').classList.add('hidden');
    // Hide both buttons when results are shown
    document.querySelector("button#find-address-button").classList.add('hidden');
    document.querySelector("button#validate-address-button").classList.add('hidden');

    document.querySelector(".metadata").classList.remove("invisible");

    if (typeof address.getLookupEnrichmentData === 'function') {
        address.getLookupEnrichmentData(key);
    }
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
        const countryDropdown = document.querySelector("#country-dataset-container select#country");
        const currentCountryValue = countryDropdown ? countryDropdown.value.split(';')[0] : '';
        const currentDatasetCodes = countryDropdown && countryDropdown.value.split(';')[1]
            ? countryDropdown.value.split(';')[1].split(',')
            : [];
        const isUkUtilityDataset = currentCountryValue === 'GBR'
            && (currentDatasetCodes.includes('gb-additional-electricity') || currentDatasetCodes.includes('gb-additional-gas'));

        if (lookupType && currentCountryValue === 'GBR' && !isUkUtilityDataset) {
            const lookupTypeOptions = lookupType.getElementsByTagName("option");
            let postalCodeSelected = false;
            for (let i = 0; i < lookupTypeOptions.length; i++) {
                if (lookupTypeOptions[i].value === 'postal_code') {
                    lookupTypeOptions[i].selected = true;
                    postalCodeSelected = true;
                    break;
                }
            }

            if (!postalCodeSelected && lookupTypeOptions.length > 0) {
                lookupTypeOptions[0].selected = true;
            }
        } else if (lookupType) {
            lookupType.getElementsByTagName("option")[0].selected = true;
        }

        let addAddresses = document.getElementById("address-input-1");
        addAddresses.getElementsByTagName("option")[0].selected = true;
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
    returnToLoginScreen();
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

    // Determine conditions for showing filter link and hiding filter fields
    const hasFilterFields = response.result.lines.length > 1;
    const supportedCountries = ['USA', 'CAN', 'AUS'];
    const isAutocompleteSearch = address.searchType === 'autocomplete';
    
    // Get country code from the country dropdown
    const countryDropdown = document.querySelector("#country-dataset-container select#country");
    const currentCountryValue = countryDropdown ? countryDropdown.value.split(';')[0] : '';
    const currentDatasetCodes = countryDropdown && countryDropdown.value.split(';')[1]
        ? countryDropdown.value.split(';')[1].split(',')
        : [];
    const isUkUtilityDataset = currentCountryValue === 'GBR'
        && (currentDatasetCodes.includes('gb-additional-electricity') || currentDatasetCodes.includes('gb-additional-gas'));
    const isSupportedCountry = supportedCountries.includes(currentCountryValue);
    const shouldUseFilters = hasFilterFields && isAutocompleteSearch && isSupportedCountry;

    // Iterate over each new line and create a new label and input
    response.result.lines.forEach((line, idx) => {
        const label = document.createElement("label");
        label.setAttribute("for", `address-input-${idx}`);
        label.innerHTML = line.prompt;

        let input;
        if (line.dropdown_options) {
            input = document.createElement("select");
            input.classList.add("address-input");
            input.setAttribute("id", `address-input-${idx}`);
            line.dropdown_options.forEach((dropdownOption) => {
                const optionElement = document.createElement("option");
                optionElement.setAttribute("value", dropdownOption.key);
                optionElement.innerText = dropdownOption.display;
                if (line.prompt === 'Lookup type' && currentCountryValue === 'GBR' && !isUkUtilityDataset && dropdownOption.key === 'postal_code') {
                    optionElement.selected = true;
                }
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
         
         // Mark filter fields (indices 1-3: regions to include, exclude, field existence) as hidden only when filters are used
         if (shouldUseFilters && idx >= 1 && idx <= 3) {
             label.classList.add('filter-field', 'hidden');
             input.classList.add('filter-field', 'hidden');
         }
         
         document.querySelector('.address-field-inputs').append(label, input);
    });

    // Register the event listeners on the new inputs
    address.setInputs(inputs);

    // Add Filter link if conditions are met
    if (shouldUseFilters) {
        const existingFilterLink = document.querySelector('#toggle-filter-fields');
        if (existingFilterLink) {
            existingFilterLink.remove();
        }

        const filterLink = document.createElement('a');
        filterLink.href = '#';
        filterLink.id = 'toggle-filter-fields';
        filterLink.className = 'filter-fields-link';
        filterLink.textContent = 'Filters';
        document.querySelector('.address-field-inputs').appendChild(filterLink);
    } else {
        const existingFilterLink = document.querySelector('#toggle-filter-fields');
        if (existingFilterLink) {
            existingFilterLink.remove();
        }
    }

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
    // Ignore clicks on disabled (unsupported) search types
    if (e.currentTarget.classList.contains('search-type-disabled')) {
        return;
    }

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

function setTokenForAddressValidation(token, dispatchTokenEvent = true) {
    applyAuthenticatedState(token, token, dispatchTokenEvent);
}

window.setTokenForAddressValidation = setTokenForAddressValidation;
window.returnToLoginScreen = returnToLoginScreen;