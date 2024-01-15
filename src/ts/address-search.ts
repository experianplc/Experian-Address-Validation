import EventFactory from './event-factory';
import Request from './request';
import {
  AddressSearchOptions,
  AddressValidationConfidenceType,
  AddressValidationLookupKeywords,
  AddressValidationMode,
  AddressValidationSearchType,
  defaults
} from './search-options';
import {datasetCodes} from './datasets-codes';
import {translations} from './translations';
import {
  AddressValidationResult,
  DatasetsResponse,
  EnrichmentDetails,
  EnrichmentResponse,
  LookupAddress,
  LookupV2Response,
  LookupW3WResponse,
  Picklist,
  PicklistItem,
  PoweredByLogo,
  SearchResponse,
  What3WordsPickList
} from './class-types';
import {enrichmentOutput} from "./enrichment_output";

export default class AddressValidation {
  public options: AddressSearchOptions;
  public searchType: AddressValidationSearchType;
  public avMode: AddressValidationMode;
  public events;
  public request: Request;

  public countryDropdown: {country: string, iso3Code: string, iso2Code: string, datasetCode: string, searchType: string}[] = [];
  public componentsCollectionMap = new Map<string, string>();
  public metadataCollectionMap = new Map<string, string>();
  public geocodes: EnrichmentDetails = new EnrichmentDetails();
  public cvHousehold: EnrichmentDetails = new EnrichmentDetails();
  public premiumLocationInsightMap = new Map<string, string>();

  private baseUrl = 'https://api.experianaperture.io/';
  private datasetsEndpoint = 'address/datasets/v1';
  private searchEndpoint = 'address/search/v1';
  private lookupV2Endpoint = 'address/lookup/v2';
  private validateEndpoint = 'address/validate/v1';
  private promptsetEndpoint = 'address/promptsets/v1';
  private stepInEndpoint = 'address/suggestions/stepin/v1';
  private refineEndpoint = 'address/suggestions/refine/v1';
  private enrichmentEndpoint = 'enrichment/v2';

  private picklist: Picklist;
  private inputs: HTMLInputElement[];
  private lastSearchTerm: string;
  private currentSearchTerm: string;
  private currentCountryCode: string;
  private currentCountryName: string;
  private currentDataSet: string | string[];
  private hasSearchInputBeenReset: boolean;
  private countryCodeMapping;
  private lookupFn;
  private keyUpFn;
  private checkTabFn;

  constructor(options: AddressSearchOptions) {
    this.options = this.mergeDefaultOptions(options);

    this.events = new EventFactory();

    this.setup();
  }

  public setToken(token: string): void {
    this.options.token = token;
    this.setup();
  }

  public setSearchType(searchType: AddressValidationSearchType): void {
    this.searchType = searchType;
    this.globalReset();
    this.setInputs();
    this.events.trigger('post-search-type-change', searchType);
  }

  public getEnrichmentData(globalAddressKey: string) {
    if (globalAddressKey) {
      let regionalAttributes: {};
      let premium_location_insight: {} = [
        "geocodes",
        "geocodes_building_xy",
        "geocodes_access",
        "time"
      ]
      if (this.currentCountryCode == "NZL") {
        regionalAttributes = {
          nzl_regional_geocodes: Object.keys(enrichmentOutput.NZL.nzl_regional_geocodes),
          nzl_cv_household: Object.keys(enrichmentOutput.NZL.nzl_cv_household),
          premium_location_insight
        }
      } else if (this.currentCountryCode == "AUS") {
        regionalAttributes = {
          aus_regional_geocodes: Object.keys(enrichmentOutput.AUS.aus_regional_geocodes),
          aus_cv_household: Object.keys(enrichmentOutput.AUS.aus_cv_household),
          premium_location_insight
        }
      } else if (this.currentCountryCode == "USA") {
        regionalAttributes = {
          usa_regional_geocodes: Object.keys(enrichmentOutput.USA.usa_regional_geocodes),
          premium_location_insight
        }
      } else  if (this.currentCountryCode == "GBR") {
        regionalAttributes = {
          uk_location_essential: Object.keys(enrichmentOutput.GBR.uk_location_essential),
          what3words: Object.keys(enrichmentOutput.GBR.what3words),
          premium_location_insight
        }
      } else {
        regionalAttributes = {
          geocodes: Object.keys(enrichmentOutput.GLOBAL.geocodes),
          premium_location_insight
        }
      }
      let data = {
        country_iso: this.currentCountryCode,
        keys: {
          global_address_key: globalAddressKey
        },
        attributes: regionalAttributes
      }
      this.events.trigger('pre-enrichment');
      this.request.send(this.baseUrl + this.enrichmentEndpoint, 'POST', this.result.handleEnrichmentResponse, JSON.stringify(data));
    }
  }

  private setup(): void {
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
      this.avMode = AddressValidationMode.SEARCH;
    } else {
      // Trigger a 401 Unauthorized event if a token does not exist
      setTimeout(() => this.events.trigger('request-error-401'));
    }
  }

  private getParameter(name): string {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
      results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  // Try and get token from the query string if it's not already provided
  private get token(): string {
    if (!this.options.token) {
      this.options.token = this.getParameter('token');
    }
    return this.options.token;
  }

  private mergeDefaultOptions(customOptions): AddressSearchOptions {
    const instance: AddressSearchOptions = customOptions || {};

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
  }

  private getPromptset(): void {
    if (this.currentCountryCode) {
      // Using the country code and the search type, lookup what the relevant dataset code should be
      this.currentDataSet = this.lookupDatasetCode();
      if (this.currentDataSet) {

        /// Temporary measure until the promptset endpoint supports Autocomplete and Validate
        if (this.searchType === AddressValidationSearchType.AUTOCOMPLETE) {
          setTimeout(() => this.handlePromptsetResult({ result: { lines: [{ example: this.options.placeholderText, prompt: 'Address', suggested_input_length: 160 }] } }));
          return;
        } else if (this.searchType === AddressValidationSearchType.VALIDATE) {
          const lines = [
            { prompt: 'Address line 1', suggested_input_length: 160 },
            { prompt: 'Address line 2', suggested_input_length: 160 },
            { prompt: 'Address line 3', suggested_input_length: 160 },
            { prompt: this.result.createAddressLine.label('locality'), suggested_input_length: 160 },
            { prompt: this.result.createAddressLine.label('region'), suggested_input_length: 160 },
            { prompt: this.result.createAddressLine.label('postal_code'), suggested_input_length: 160 }
          ];
          setTimeout(() => this.handlePromptsetResult({ result: { lines } }));
          return;
        } else if (this.searchType === AddressValidationSearchType.LOOKUPV2) {
          let dropdownItems: {} = 'gb-address' === this.currentDataSet
              ? Object.values(AddressValidationLookupKeywords):
              [AddressValidationLookupKeywords.LOCALITY, AddressValidationLookupKeywords.POSTAL_CODE];
          const lines = [
            {prompt: 'Lookup type', suggested_input_length: 160, dropdown_options: dropdownItems},
            {prompt: 'Lookup value ', suggested_input_length: 160}
          ];
          setTimeout(() => this.handlePromptsetResult({result: {lines}}));
          return;
        }

        const data = {
          country_iso: this.currentCountryCode,
          datasets: Array.isArray(this.currentDataSet) ? this.currentDataSet : [this.currentDataSet],
          search_type: this.searchType,
          prompt_set: 'optimal'
        };
        this.events.trigger('pre-promptset-check');
        this.request.send(this.baseUrl + this.promptsetEndpoint, 'POST', this.handlePromptsetResult.bind(this), JSON.stringify(data));
        return;
      }

      this.events.trigger('error-display', "Unsupported search type '" + this.searchType + "' for country dataset '" + this.currentCountryName + "'.");
    }
  }

  private lookupDatasetCode(): string | string[] {
    const item = datasetCodes.find(dataset =>
        dataset.iso3Code === this.currentCountryCode
        && dataset.country === this.currentCountryName
        && dataset.searchType.includes(this.searchType));
    if (item) {
      return item.datasetCode;
    }
  }

  private handlePromptsetResult(response): void {
    // Remove any currently displayed picklist when the promptset changes
    this.picklist.hide();

    // Trigger a new event to notify subscribers
    this.events.trigger('post-promptset-check', response);
  }

  public setInputs(inputs = this.options.elements.inputs): void {
    // If address inputs exist then register these with event listeners, otherwise call the promptset endpoint to retrieve them
    if (inputs) {
      this.registerInputs(inputs);
    } else {
      // Make an API call to get the promptset for this country/dataset/engine
      this.getPromptset();
    }

    if (this.searchType !== AddressValidationSearchType.AUTOCOMPLETE) {
      // Bind an event listener on the lookup button
      if (this.options.elements.lookupButton) {
        this.lookupFn = this.search.bind(this);
        this.options.elements.lookupButton.addEventListener('click', this.lookupFn);
      }
    }
  }

  private registerInputs(inputs: HTMLInputElement[]) {
    // If new inputs have been provided, ensure we update the elements array to capture them
    this.inputs = Array.from(inputs);

    this.inputs.forEach(input => {
      // Disable autocomplete on the form field
      input.setAttribute('autocomplete', 'new-password');

      if (this.searchType === AddressValidationSearchType.AUTOCOMPLETE) {
        // Bind an event listener on the input
        this.keyUpFn = this.search.bind(this);
        input.addEventListener('keyup', this.keyUpFn);
        this.checkTabFn = this.checkTab.bind(this);
        input.addEventListener('keydown', this.checkTabFn);
        // Set a placeholder for the input
        input.setAttribute('placeholder', this.options.placeholderText);
      }

      // Bind an event listener on the input to allow users to traverse up and down the picklist using the keyboard
      input.addEventListener('keyup', this.handleKeyboardEvent.bind(this));
    });

    this.countryCodeMapping = this.options.countryCodeMapping || {};

    // Apply focus to the first input
    if (this.options.applyFocus) {
      this.inputs[0].focus();
    }
  }

  private setCountryList(): void {
    let url = this.baseUrl + this.datasetsEndpoint;
    this.request.send(url, 'GET', this.handleDatasetsResponse.bind(this));

    // Set the initial country code from either the value of a country list HTML element or a static country code
    if (this.options.elements.countryList) {
      this.currentCountryCode = this.options.elements.countryList.value;
      this.currentCountryName = this.options.elements.countryList[this.options.elements.countryList.selectedIndex].label;

      // Listen for when a country is changed and call the promptset endpoint
      this.options.elements.countryList.addEventListener('change', this.handleCountryListChange.bind(this));
    } else if (this.options.countryCode) {
      this.currentCountryCode = this.options.countryCode;
    } else {
      throw new Error('Please provide a country code or a country list element');
    }
  }

  private handleDatasetsResponse(response: DatasetsResponse): void {
    let countries = response.result;
    this.countryDropdown = [];
    if (countries && countries.length > 0) {
      for (const country of countries) {
        for (const countryDataset of Object.values(country.datasets)) {
          const item = datasetCodes.find(dataset => dataset.datasetCode === countryDataset.id);
          if (item && !this.countryDropdown.find(o => o.country === item.country)) {
            this.countryDropdown.push(item);
          }
        }
      }
      this.countryDropdown.sort((a, b) => a.country.localeCompare(b.country))
      this.events.trigger('post-datasets-update');
    }
  }

  // When a country from the list is changed, update the current country code, call the promptset endpoint again and reset to the default search mode
  private handleCountryListChange(): void {
    let countryList = this.options.elements.countryList;
    this.currentCountryCode = countryList.value;
    this.currentCountryName = countryList[countryList.selectedIndex].label;
    this.getPromptset();
    this.avMode = AddressValidationMode.SEARCH;
  }

  private generateSearchDataForApiCall(): string {
    // If a dataset code hasn't been set yet, try and look it up
    if (!this.currentDataSet) {
      this.currentDataSet = this.lookupDatasetCode();
    }

    const data = {
      country_iso: this.currentCountryCode,
      components: { unspecified: [this.currentSearchTerm] },
      datasets: Array.isArray(this.currentDataSet) ? this.currentDataSet : [this.currentDataSet],
      max_suggestions: (this.options.maxSuggestions || this.picklist.maxSuggestions)
    };

    if (this.searchType === AddressValidationSearchType.SINGLELINE || this.searchType === AddressValidationSearchType.VALIDATE) {
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

      if (this.searchType === AddressValidationSearchType.SINGLELINE) {
        data['options'].push({
          name: 'search_type',
          Value: 'singleline'
        });
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
  }
  
  private generateLookupDataForApiCall(input: string, lookupKeyword: string): string {
    // If a dataset code hasn't been set yet, try and look it up
    if (!this.currentDataSet) {
      this.currentDataSet = this.lookupDatasetCode();
    }

    const data = {
      country_iso: this.currentCountryCode,
      datasets: Array.isArray(this.currentDataSet) ? this.currentDataSet : [this.currentDataSet],
      max_suggestions: (this.options.maxSuggestions || this.picklist.maxSuggestions),
      key: {
        type: lookupKeyword,
        value: input,
      }
    };

    return JSON.stringify(data);
  }

  private getWhat3WordsLookupValue(input: string, shouldGetSuggestions: boolean): string {
    if (input.startsWith('///') && shouldGetSuggestions) {
      input = input.slice(3);
    }

    return input;
  }

  // Allow the keyboard to be used to either traverse up and down the picklist and select an item, or trigger a new search
  private handleKeyboardEvent(event: KeyboardEvent): void {
    event.preventDefault();

    // Handle keyboard navigation
    const key = this.getKey(event);

    // If a picklist is populated then trigger its keyup event to select an item
    if (this.picklist.size) {
      if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'Enter') {
        this.picklist.keyup(event);
        return;
      }
    } else {
      // Otherwise, enable pressing 'enter' to trigger a new search
      if (key === 'Enter') {
        this.search(event);
        return;
      }
    }
  }

  // Main function to search for an address from an input string
  private search(event: KeyboardEvent): void {
    event.preventDefault();

    // Grab the country ISO code and (if it is present) the dataset name from the current value of the countryList (format: {countryIsoCode};{dataset})
    const currentCountryInfo = this.countryCodeMapping[this.currentCountryCode] || this.currentCountryCode;
    const countryCodeAndDataset = currentCountryInfo.split(';');

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

    // Concatenating the input components depending on search type and dataset to maximize match results
    const delimiter = this.isInternationalValidation() ? "|": ",";
    this.currentSearchTerm = this.inputs.map(input => input.value).join(delimiter);

    // Check if searching is permitted
    if (this.canSearch()) {
      // Abort any outstanding requests
      if (this.request.currentRequest) {
        this.request.currentRequest.abort();
      }

      // Fire an event before a search takes place
      this.events.trigger('pre-search', this.currentSearchTerm);

      // Store the last search term
      this.lastSearchTerm = this.currentSearchTerm;

      // Hide and show an inline spinner whilst searching. Hide it first so we don't show 2 spinners by accident.
      this.searchSpinner.hide();
      this.searchSpinner.show();
      let url, headers, callback, data;

      // Construct the new Search URL and data
      switch(this.avMode) {
        case AddressValidationMode.LOOKUPV2: {
          const lookupSeacrhTerm = this.currentSearchTerm.split(',');
          let lookupType = lookupSeacrhTerm[0];
          let lookupValue = lookupSeacrhTerm[1];

          let isWhat3Words = AddressValidationLookupKeywords.WHAT3WORDS.key == lookupType;
          let input = isWhat3Words ? this.getWhat3WordsLookupValue(lookupValue.trim(), true) : lookupValue.trim();

          data = this.generateLookupDataForApiCall(input, lookupType);
          url = this.baseUrl + this.lookupV2Endpoint;
          headers = isWhat3Words ? [] : [{key: 'Add-Addresses', value: true}];
          callback = isWhat3Words ? this.picklist.showWhat3Words : this.picklist.showLookup;
          break;
        }
        default: { 
          data = this.generateSearchDataForApiCall();
          url = this.baseUrl + (this.searchType === AddressValidationSearchType.VALIDATE ? this.validateEndpoint : this.searchEndpoint);
          headers = this.searchType === AddressValidationSearchType.VALIDATE ? [{ key: 'Add-Components', value: true }, { key: 'Add-Metadata', value: true }] : [];
          callback = this.searchType === AddressValidationSearchType.VALIDATE ? this.result.handleValidateResponse : this.picklist.show;
          break; 
        } 
      };

      // Initiate new Search request
      this.request.send(url, 'POST', callback, data, headers);

    } else if (this.lastSearchTerm !== this.currentSearchTerm) {
      // Clear the picklist if the search term is cleared/empty
      this.picklist.hide();
    }
  }

  // Helper method to return a consistent key name
  private getKey({ key }): string {
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
  }

  private canSearch(): boolean {
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
  }

  private poweredByLogo: PoweredByLogo = {
    element: null,
    // Create a "Powered by Experian" footer
    create(picklist) {
      const item = {
        text: `${this.svg} <em>Powered by Experian</em>`,
        format: ''
      };
      const listItem = picklist.createListItem(item);
      listItem.classList.add('powered-by-experian');
      picklist.list.parentNode.appendChild(listItem);
      return listItem;
    },
    // Destroy the "Powered by Experian" footer
    destroy(picklist) {
      if (this.element) {
        picklist.list.parentNode.removeChild(this.element);
        this.element = undefined;
      }
    },
    svg: `<svg class="experian-logo" version="1.1" width="18" height="18" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 120 120" style="" xml:space="preserve" role="img" aria-label="Powered by Experian">
            <title>Experian logo</title>
            <g>
                <path style="fill: #0E6EB6" d="M56.1,27h-13c-3.9,0-7-3.1-7-7V7c0-3.9,3.1-7,7-7h13c3.9,0,7,3.1,7,7v13C63.1,23.8,60,27,56.1,27"></path>
                <path style="fill: #72217B" d="M22.5,56.1H7.9c-4.3,0-7.9-3.5-7.9-7.9V33.6c0-4.3,3.5-7.9,7.9-7.9h14.6c4.3,0,7.9,3.5,7.9,7.9v14.6C30.4,52.6,26.8,56.1,22.5,56.1"></path>
                <path style="fill: #B12384" d="M21.1,86.4h-8.9c-2.7,0-4.8-2.1-4.8-4.8v-8.9c0-2.7,2.2-4.8,4.8-4.8h8.9c2.7,0,4.8,2.2,4.8,4.8v8.9C25.9,84.3,23.7,86.4,21.1,86.4"></path>
                <path style="fill: #E72887" d="M45.1,114.7H34.5c-3.1,0-5.7-2.5-5.7-5.7V98.4c0-3.1,2.5-5.7,5.7-5.7h10.6c3.1,0,5.7,2.5,5.7,5.7V109C50.7,112.1,48.2,114.7,45.1,114.7"></path>
                <path style="fill: #E72887" d="M83.8,32.3h-7.3c-2.2,0-3.9-1.8-3.9-3.9v-7.3c0-2.2,1.8-3.9,3.9-3.9h7.3c2.2,0,3.9,1.8,3.9,3.9v7.3C87.7,30.5,85.9,32.3,83.8,32.3"></path>
                <path style="fill: #004691" d="M81.7,61.8C81.5,51.1,72,42,60.7,42C49,42,39.6,51.3,39.6,62.9C39.6,74.6,49,84,60.7,84c5.6,0,10.8-2.2,14.6-5.9c0.7-0.7,1.2-1.6,1.2-2.6c0-1.9-1.6-3.5-3.5-3.5c-1.1,0-2,0.7-2.8,1.4c-2.4,2.5-5.9,3.7-9.5,3.7c-7,0-12.7-4.8-13.9-11.5h31.5c0,0,0,0,0.1,0h0.1c0.1,0,0.1,0,0.2,0c0.1,0,0.2,0,0.4-0.1C80.4,65,81.7,63.6,81.7,61.8z M60.7,48.9c6.3,0,11.6,4.1,13.4,9.7H47.3C49.1,53,54.3,48.9,60.7,48.9z"></path>
            </g>
        </svg>`
  };

  private createPicklist() {
    // Instantiate a new Picklist class and set the properties below
    this.picklist = new Picklist();

    // Set initial max size
    this.picklist.maxSuggestions = 25;
    // Tab count used for keyboard navigation
    this.picklist.tabCount = -1;
    // Render a picklist of search results

    this.picklist.show = (items: SearchResponse) => {
      // Store the picklist items
      this.picklist.items = items?.result.suggestions;

      this.picklist.handleCommonShowPicklistLogic();

      if (this.picklist.items?.length > 0) {
        // If a picklist needs "refining" then prepend a textbox to allow the user to enter their selection
        if (this.picklist.refine.isNeeded(items)) {
          this.picklist.refine.createInput(items.result.suggestions_prompt, items.result.suggestions_key);
        }

        if (this.searchType === AddressValidationSearchType.VALIDATE) {
          this.picklist.displaySuggestionsHeader();
        }

        // Iterate over and show results
        this.picklist.items.forEach(item => {
          // Create a new item/row in the picklist
          const listItem = this.picklist.createListItem(item);
          this.picklist.list.appendChild(listItem);

          // Listen for selection on this item
          this.picklist.listen(listItem);
        });

        if (this.searchType === AddressValidationSearchType.VALIDATE) {
          this.picklist.displayUseAddressEnteredFooter();
        }

        this.picklist.scrollIntoViewIfNeeded();
      } else {
        this.picklist.handleEmptyPicklist(items);
      }

      // Add a "Powered by Experian" logo to the picklist footer
      this.poweredByLogo.element = this.poweredByLogo.element || this.poweredByLogo.create(this.picklist);

      // Fire an event after picklist is created
      this.events.trigger('post-picklist-create', this.picklist.items);
    };

    this.picklist.showWhat3Words = (items: LookupW3WResponse) => {
      // Store the picklist items
      this.picklist.what3wordsItems = items?.result.suggestions;

      this.picklist.handleCommonShowPicklistLogic();

      if (this.picklist.what3wordsItems?.length > 0) {
        // Iterate over and show results
        this.picklist.what3wordsItems.forEach(item => {
          // Create a new item/row in the picklist
          const listItem = this.picklist.createWhat3WordsListItem(item);
          this.picklist.list.appendChild(listItem);

          // Listen for selection on this item
          this.picklist.listen(listItem);
        });

        this.picklist.scrollIntoViewIfNeeded();
      } else {
        this.picklist.handleEmptyPicklist(items);
      }

      // Add a "Powered by Experian" logo to the picklist footer
      this.poweredByLogo.element = this.poweredByLogo.element || this.poweredByLogo.create(this.picklist);

      // Fire an event after picklist is created
      this.events.trigger('post-picklist-create', this.picklist.items);
    };

    this.picklist.showLookup = (items: LookupV2Response) => {
      // Store the picklist items
      this.picklist.lookupItems = items?.result.addresses;

      this.picklist.handleCommonShowPicklistLogic();

      if (this.picklist.lookupItems?.length > 0) {
        // Iterate over and show results
        this.picklist.lookupItems.forEach(item => {
          // Create a new item/row in the picklist
          const listItem = this.picklist.createLookupListItem(item);
          this.picklist.list.appendChild(listItem);

          // Listen for selection on this item
          this.picklist.listen(listItem);
        });

        this.picklist.scrollIntoViewIfNeeded();
      } else {
        this.picklist.handleEmptyPicklist(items);
      }

      // Add a "Powered by Experian" logo to the picklist footer
      this.poweredByLogo.element = this.poweredByLogo.element || this.poweredByLogo.create(this.picklist);

      // Fire an event after picklist is created
      this.events.trigger('post-picklist-create', this.picklist.items);
    };

    this.picklist.handleCommonShowPicklistLogic = () => {
      // Reset any previously selected current item
      this.picklist.currentItem = null;

      // Update picklist size
      this.picklist.size = this.picklist.items?.length;

      // Reset the picklist tab count (used for keyboard navigation)
      this.picklist.resetTabCount();

      // Hide the inline search spinner
      this.searchSpinner.hide();

      // Get/Create picklist container element
      this.picklist.list = this.picklist.list || this.picklist.createList();

      // Ensure previous results are cleared
      this.picklist.list.innerHTML = '';
      this.picklist.useAddressEntered.destroy();

      // Fire an event before picklist is created
      this.events.trigger('pre-picklist-create', this.picklist.items);
    };

    // Remove the picklist
    this.picklist.hide = () => {
      // Clear the current picklist item
      this.picklist.currentItem = null;
      // Remove the "use address entered" option too
      this.picklist.useAddressEntered.destroy();
      // Remove the "Powered by Experian" logo
      this.poweredByLogo.destroy(this.picklist);

      if (this.inputs) {
        // Remove the class denoting a picklist - if Singleline mode is used, then it is the last input field, otherwise use the first one
        const position = this.searchType === AddressValidationSearchType.SINGLELINE ? this.inputs.length - 1 : 0;
        this.inputs[position].classList.remove('showing-suggestions');
      }

      // Remove the main picklist container
      if (this.picklist.list) {
        this.picklist.container.remove();
        this.picklist.list = undefined;
      }
    };

    this.picklist.handleEmptyPicklist = (items: SearchResponse | LookupW3WResponse | LookupV2Response) => {
      // Create a new item/row in the picklist showing "No matches" that allows the "use address entered" option
      this.picklist.useAddressEntered.element = this.picklist.useAddressEntered.element || this.picklist.useAddressEntered.create(items.result?.confidence);

      this.picklist.scrollIntoViewIfNeeded();

      // Provide implementing search types with a means of invoking a custom callback
      if (typeof this.picklist.handleEmptyPicklistCallback === 'function') {
        this.picklist.handleEmptyPicklistCallback();
      }
    };

    // Prepend a title before the suggestions
    this.picklist.displaySuggestionsHeader = () => {
      const titleDiv = (<HTMLElement>document.querySelector('.picklist-suggestions-header') || document.createElement('div'));
      titleDiv.classList.add('picklist-suggestions-header');
      titleDiv.innerText = 'Suggestions:';
      this.picklist.list.parentNode.insertBefore(titleDiv, this.picklist.list);
    };

    // Append a footer at the bottom of the picklist providing an option to "use address entered"
    this.picklist.displayUseAddressEnteredFooter = () => {
      const containerDiv = document.querySelector('.picklist-use-entered-container') || document.createElement('div');
      containerDiv.classList.add('picklist-use-entered-container');
      this.picklist.list.parentNode.insertBefore(containerDiv, this.picklist.list.nextElementSibling);

      const titleDiv = (<HTMLElement>document.querySelector('.picklist-use-entered-header') || document.createElement('div'));
      titleDiv.classList.add('picklist-use-entered-header');
      titleDiv.innerText = 'Or use address entered:';
      containerDiv.appendChild(titleDiv);

      const itemDiv = (<HTMLElement>document.querySelector('.picklist-use-entered-option') || document.createElement('div'));
      itemDiv.classList.add('picklist-use-entered-option');
      itemDiv.innerText = this.currentSearchTerm.replace(/,+/g, ', ');
      itemDiv.addEventListener('click', this.picklist.useAddressEntered.click);
      containerDiv.appendChild(itemDiv);
    };

    // If the picklist container is out of bounds to the top or bottom, then scroll it into view
    this.picklist.scrollIntoViewIfNeeded = () => {
      const outOfBoundsTop = this.picklist.container.getBoundingClientRect().top < 0;
      const outOfBoundsBottom = this.picklist.container.getBoundingClientRect().bottom > window.innerHeight;

      if (outOfBoundsTop || outOfBoundsBottom) {
        this.picklist.container.scrollIntoView();
      }
    };

    this.picklist.useAddressEntered = {
      element: null,
      // Create a "use address entered" option
      create: (confidence: string) => {
        const item = {
          text: `${confidence} ${this.options.useAddressEnteredText}`
        };
        const listItem = this.picklist.createListItem(item);
        listItem.classList.add('use-address-entered');
        listItem.setAttribute('title', 'Enter address manually');
        this.picklist.list = this.picklist.list || this.picklist.createList();
        this.picklist.list.parentNode.insertBefore(listItem, this.picklist.container.firstChild);
        listItem.addEventListener('click', this.picklist.useAddressEntered.click);
        return listItem;
      },
      // Destroy the "use address entered" option
      destroy: () => {
        if (this.picklist.useAddressEntered.element) {
          this.picklist.list.parentNode.removeChild(this.picklist.useAddressEntered.element);
          this.picklist.useAddressEntered.element = undefined;
        }
      },
      // Use the address entered as the Formatted address
      click: () => {
        const inputData = {
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

        if (this.currentSearchTerm) {
          // Try and split into lines by using comma delimiter
          const lines = this.currentSearchTerm.split(',');
          if (lines[0]) {
            inputData.result.address.address_line_1 = lines[0];
          }
          if (lines[1]) {
            inputData.result.address.address_line_2 = lines[1];
          }
          if (lines[2]) {
            inputData.result.address.address_line_3 = lines[2];
          }
          for (let i = 3; i < lines.length; i++) {
            inputData.result.address.address_line_3 += lines[i];
          }
        }

        this.result.show(inputData);
        this.result.updateHeading(this.options.formattedAddressContainer.manualHeadingText);
      },
      // Create and return an address line object with the key as the label
      formatManualAddressLine: function (lines, i) {
        const key = defaults.addressLineLabels[i];
        const lineObject = {};
        lineObject[key] = lines[i] || '';
        return lineObject;
      }
    };

    // Create the picklist list (and container) and inject after the input
    this.picklist.createList = () => {
      // If Singleline mode is used, then append the picklist after the last input field, otherwise use the first one
      const position = this.searchType === AddressValidationSearchType.SINGLELINE
      || this.searchType === AddressValidationSearchType.LOOKUPV2 ? this.inputs.length - 1 : 0;

      const container = document.createElement('div');
      container.classList.add('address-picklist-container');
      this.picklist.container = container;

      // Insert the picklist container after the input
      this.inputs[position].parentNode.insertBefore(this.picklist.container, this.inputs[position].nextElementSibling);

      const list = document.createElement('div');
      list.classList.add('address-picklist');
      // Append the picklist to the inner wrapper
      this.picklist.container.appendChild(list);

      // Add a class to the input to denote that a picklist with suggestions is being shown
      this.inputs[position].classList.add('showing-suggestions');

      list.addEventListener('keydown', this.picklist.checkEnter);
      return list;
    };

    // Create a new picklist item/row
    this.picklist.createListItem = (item: PicklistItem) => {
      const row = document.createElement('div');
      row.innerHTML = this.picklist.addMatchingEmphasis(item);

      // Store the Format URL if it exists, otherwise use the global_address_key as a "refinement" property
      if (item.format) {
        row.setAttribute('format', item.format);
      } else if (item.global_address_key) {
        row.setAttribute('refine', item.global_address_key);
      }
      return row;
    };

    // Create a new picklist item/row for what3words
    this.picklist.createWhat3WordsListItem = (item: What3WordsPickList) => {
      const row = document.createElement('div');
      const name = document.createElement('div');
      const description = document.createElement('div');

      row.className = AddressValidationLookupKeywords.WHAT3WORDS.key;
      name.className = 'what3Words-name';
      description.className = 'what3Words-description';

      name.innerHTML = '///' + item.what3words.name;
      description.innerHTML = item.what3words.description;

      row.appendChild(name);
      row.appendChild(description);

      return row;
    };


    // Create a new picklist item/row for lookup items
    this.picklist.createLookupListItem = (item: LookupAddress) => {
      const row = document.createElement('div');

      row.innerHTML = item.text;

      // Store the Format URL if it exists, otherwise use the global_address_key as a "refinement" property
      if (item.format) {
        row.setAttribute('format', item.format);
      } else if (item.global_address_key) {
        row.setAttribute('refine', item.global_address_key);
      }
      return row;
    };

    this.picklist.refine = {
      element: null,
      // Returns whether the picklist needs refining. This happens after an item has been "stepped into" but has an unresolvable range.
      // The user is prompted to enter their selection (e.g. building number).
      isNeeded: (response: SearchResponse) => {
        return this.searchType !== AddressValidationSearchType.AUTOCOMPLETE
            && (response.result.confidence === AddressValidationConfidenceType.PREMISES_PARTIAL
            || response.result.confidence === AddressValidationConfidenceType.STREET_PARTIAL
                || response.result.confidence === AddressValidationConfidenceType.MULTIPLE_MATCHES);
      },
      createInput: (prompt: string, key: string) => {
        const row = document.querySelector('.picklist-refinement-box') || document.createElement('div');
        row.classList.add('picklist-refinement-box');

        const input = (<HTMLInputElement>document.querySelector('.picklist-refinement-box input') || document.createElement('input'));
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', prompt);
        input.setAttribute('key', key);
        input.setAttribute('autocomplete', 'new-password');
        input.addEventListener('keydown', this.picklist.refine.enter.bind(this));
        this.picklist.refine.element = input;

        const button = (<HTMLButtonElement>document.querySelector('.picklist-refinement-box button') || document.createElement('button'));
        button.innerText = 'Refine';
        button.addEventListener('click', this.picklist.refine.enter);

        row.appendChild(input);
        row.appendChild(button);
        this.picklist.list.parentNode.insertBefore(row, this.picklist.list);

        input.focus();
      },
      enter: (event: Event) => {
        // Allow a new refinement entry if the enter key was used inside the textbox or the button was clicked
        if ((event instanceof KeyboardEvent && event.key === 'Enter') || event instanceof MouseEvent) {
          event.preventDefault();

          // If a picklist item is currently selected, then potentially use this instead of what's in the input field
          if (this.picklist.currentItem) {
            this.picklist.checkEnter(event as KeyboardEvent);
            return;
          }

          event.stopPropagation();

          // Take the value from the input field and use this to further refine the address
          if (this.picklist.refine.element.value) {
            const data = JSON.stringify({ refinement: this.picklist.refine.element.value });
            const key = this.picklist.refine.element.getAttribute('key');
            this.request.send(`${this.baseUrl}${this.refineEndpoint}/${key}`, 'POST', this.result.handleValidateResponse, data);
          }
        } else if (this.picklist.size && event instanceof KeyboardEvent && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter')) {
          this.picklist.keyup(event);
        }
      }
    };

    this.picklist.resetTabCount = () => {
      this.picklist.tabCount = -1;
    };

    // Keyboard navigation
    this.picklist.keyup = (event: KeyboardEvent) => {
      if (!this.picklist.list) {
        return;
      }

      this.picklist.checkEnter(event);

      // Get a list of all the addresses in the picklist
      const addresses = this.picklist.list.querySelectorAll('div');
      let firstAddress;
      let lastAddress;

      // If the picklist is empty, just return
      if (addresses.length === 0) {
        return;
      }

      // Set the tabCount based on previous and direction
      if (event.key === 'ArrowUp') {
        this.picklist.tabCount--;
      }
      else if (event.key === 'ArrowDown') {
        this.picklist.tabCount++;
      }

      // Set top and bottom positions and enable wrap-around
      if (this.picklist.tabCount < 0) {
        this.picklist.tabCount = addresses.length - 1;
        lastAddress = true;
      }
      if (this.picklist.tabCount > addresses.length - 1) {
        this.picklist.tabCount = 0;
        firstAddress = true;
      }

      // Highlight the selected address
      const currentlyHighlighted = addresses[this.picklist.tabCount];
      // Remove any previously highlighted ones
      const previouslyHighlighted = this.picklist.list.querySelector('.selected');
      if (previouslyHighlighted) {
        previouslyHighlighted.classList.remove('selected');
      }
      currentlyHighlighted.classList.add('selected');
      // Set the currentItem on the picklist to the currently highlighted address
      this.picklist.currentItem = currentlyHighlighted;

      // Scroll address into view, if required
      const addressListCoords = {
        top: this.picklist.list.offsetTop,
        bottom: this.picklist.list.offsetTop + this.picklist.list.offsetHeight,
        scrollTop: this.picklist.list.scrollTop,
        selectedTop: currentlyHighlighted.offsetTop,
        selectedBottom: currentlyHighlighted.offsetTop + currentlyHighlighted.offsetHeight,
        scrollAmount: currentlyHighlighted.offsetHeight
      };
      if (firstAddress) {
        this.picklist.list.scrollTop = 0;
      }
      else if (lastAddress) {
        this.picklist.list.scrollTop = 999;
      }
      else if (addressListCoords.selectedBottom + addressListCoords.scrollAmount > addressListCoords.bottom) {
        this.picklist.list.scrollTop = addressListCoords.scrollTop + addressListCoords.scrollAmount;
      }
      else if (addressListCoords.selectedTop - addressListCoords.scrollAmount - addressListCoords.top < addressListCoords.scrollTop) {
        this.picklist.list.scrollTop = addressListCoords.scrollTop - addressListCoords.scrollAmount;
      }
    };

    // Add emphasis to the picklist items highlighting the match
    this.picklist.addMatchingEmphasis = function (item) {
      const highlights = item.matched || [];
      let label = item.text;
      for (let i = 0; i < highlights.length; i++) {
        const replacement = '<b>' + label.substring(highlights[i][0], highlights[i][1]) + '</b>';
        label = label.substring(0, highlights[i][0]) + replacement + label.substring(highlights[i][1]);
      }

      return label;
    };

    // Listen to a picklist selection
    this.picklist.listen = (row) => {
      row.addEventListener('click', this.picklist.pick.bind(null, row));
    };

    this.picklist.checkEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === 'Tab') {
        let picklistItem;
        // If picklist contains 1 address then use this one to format
        if (this.picklist.size === 1) {
          picklistItem = this.picklist.list.querySelectorAll('div')[0];
        } // Else use the currently highlighted one when navigation using keyboard
        else if (this.picklist.currentItem) {
          picklistItem = this.picklist.currentItem;
        }
        if (picklistItem) {
          this.picklist.pick(picklistItem);
        }
      }
    };

    // How to handle a picklist selection
    this.picklist.pick = (item) => {
      // Fire an event when an address is picked
      this.events.trigger('post-picklist-selection', item);

      if (item.classList.contains(AddressValidationLookupKeywords.WHAT3WORDS.key)){
        const elements = item.getElementsByTagName('div');
        this.lookup(elements[0].innerHTML);
      } else {
        // Get a final address using picklist item unless it needs refinement
        if (item.getAttribute('format')) {
          this.format(item.getAttribute('format'));
        } else {
          this.refine(item.getAttribute('refine'));
        }
      }
    };
  }

  private format(url: string) {
    // Trigger an event
    this.events.trigger('pre-formatting-search', url);

    // Hide the searching spinner
    this.searchSpinner.hide();

    // Initiate a new Format request
    this.request.send(url, 'GET', this.result.show, undefined,
        [{key: 'Add-Components', value: true}, { key: 'Add-Metadata', value: true }/*, {key: 'Add-Components', value: true}*/]);
  }

  private refine(key: string) {
    // Trigger an event
    this.events.trigger('pre-refinement', key);

    // Hide the searching spinner
    this.searchSpinner.hide();

    // Initiate a new Step-in request using the global address key
    this.request.send(`${this.baseUrl}${this.stepInEndpoint}/${key}`, 'GET', this.picklist.show);
  }

  private lookup(key: string) {
    // Trigger an event
    this.events.trigger('pre-lookup', key);

    // Hide the searching spinner
    this.searchSpinner.hide();

    //Get the lookup requet
    const lookupV2Request = this.generateLookupDataForApiCall(key, AddressValidationLookupKeywords.WHAT3WORDS.key);

    const url = this.baseUrl + this.lookupV2Endpoint;
    const headers = [{ key: 'Add-Addresses', value: true }];
    const callback = this.picklist.showLookup;

    // Initiate new Search request
    this.request.send(url, 'POST', callback, lookupV2Request, headers);
  }

  private result: AddressValidationResult = {
    formattedAddressContainer: null,
    lastAddressField: null,
    generateAddressLineRequired: false,
    // Render a Formatted address
    show: (data: SearchResponse) => {
      // Hide the inline search spinner
      this.searchSpinner.hide();

      // Hide the picklist
      this.picklist.hide();

      // Clear the previous search term
      this.lastSearchTerm = '';

      // Allow Autocomplete through as it will need to create the additional output fields for the final address.
      // Otherwise, only render the final address if there are results available.
      if (this.searchType === AddressValidationSearchType.AUTOCOMPLETE
          || (data.result.address && data.result.confidence !== AddressValidationConfidenceType.NO_MATCHES)) {

        // Clear search input(s)
        this.inputs.forEach(input => input.value = '');

        // Calculate if we needed to generate the formatted address input fields later
        this.result.calculateIfAddressLineGenerationRequired();

        // Get formatted address container element
        // Only create a container if we're creating inputs. Otherwise the user will have their own container.
        this.result.formattedAddressContainer = this.options.elements.formattedAddressContainer;
        if (!this.result.formattedAddressContainer && this.result.generateAddressLineRequired) {
          this.result.createFormattedAddressContainer();
        }

        // Loop over each formatted address component
        for (let i = 0; i < Object.keys(data.result.address).length; i++) {
          const key = Object.keys(data.result.address)[i];
          const addressComponent = data.result.address[key];
          // Bind the address element to the user's address field (or create a new one)
          this.result.updateAddressLine(key, addressComponent, 'address-line-input');
        }

        this.componentsCollectionMap.clear();
        let components = data.result.components;
        if (components) {
          for (let i = 0; i < Object.keys(components).length; i++) {
            const key = Object.keys(components)[i];
            this.componentsCollectionMap.set(key, components[key]);
          }
        }

        this.metadataCollectionMap.clear();
        let metadata = data.metadata;
        if (metadata) {
          for (let i = 0; i < Object.keys(metadata).length; i++) {
            const key = Object.keys(metadata)[i];
            this.metadataCollectionMap.set(key, metadata[key]);
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
          for (const element in this.options.elements) {
            if (Object.prototype.hasOwnProperty.call(this.options.elements, element)) {
              // Excluding the input itself, does another element match the input field?
              if (element !== 'input' && this.options.elements[element] === this.inputs[0]) {
                this.hasSearchInputBeenReset = false;
                break;
              }
            }
          }
        }

        // Create the 'Search again' link and insert into DOM
        this.result.createSearchAgainLink();
      }

      // Fire an event to say we've got the formatted address
      this.events.trigger('post-formatting-search', data);
    },
    hide: () => {
      // Delete the formatted address container
      if (this.result.formattedAddressContainer) {
        this.result.formattedAddressContainer.parentNode.removeChild(this.result.formattedAddressContainer);
        this.result.formattedAddressContainer = undefined;
      }
      // Delete the search again link
      if (this.options.searchAgain.link) {
        this.options.searchAgain.link.parentNode.removeChild(this.options.searchAgain.link);
        this.options.searchAgain.link = undefined;
      }
      // Remove previous value from user's result field
      // Loop over their elements
      for (const element in this.options.elements) {
        if (Object.prototype.hasOwnProperty.call(this.options.elements, element)) {
          // If it matches an "address" element
          for (let i = 0; i < defaults.addressLineLabels.length; i++) {
            const label = defaults.addressLineLabels[i];
            // Only reset the value if it's not an input field
            if (label === element && this.options.elements[element] !== this.inputs[0]) {
              this.options.elements[element].value = '';
              break;
            }
          }
        }
      }
    },
    createAddressLine: {
      // Create an input to store the address line
      input: (key: string, value: string, className: string) => {
        // Create a wrapper
        const div = document.createElement('div');
        div.classList.add(className);

        // Create the label
        const label = document.createElement('label');
        label.innerHTML = key.replace(/([A-Z])/g, ' $1') // Add space before capital Letters
          .replace(/([0-9])/g, ' $1') // Add space before numbers
          .replace(/^./, function (str) { return str.toUpperCase(); }); // Make first letter of word a capital letter
        div.appendChild(label);

        // Create the input
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('name', key);
        input.setAttribute('value', value);
        div.appendChild(input);
        return div;
      },
      // Create the address line label based on the country and language
      label: (key: string) => {
        let label = key;
        const language = this.options.language.toLowerCase();
        const country = this.currentCountryCode.toLowerCase();
        if (translations) {
          try {
            const translatedLabel = translations[language][country][key];
            if (translatedLabel) {
              label = translatedLabel;
            }
          } catch (e) {
            // Translation doesn't exist for key
          }
        }
        return label;
      }
    },
    // Create the formatted address container and inject after the input
    createFormattedAddressContainer: () => {
      const container = document.createElement('div');
      container.classList.add('formatted-address');

      // If Singleline mode is used, then append the formatted address after the last input field, otherwise use the first one
      const position = this.searchType === AddressValidationSearchType.SINGLELINE ? this.inputs.length - 1 : 0;

      // Insert the container after the input
      this.inputs[position].parentNode.insertBefore(container, this.inputs[position].nextSibling);
      this.result.formattedAddressContainer = container;
    },
    // Create a heading for the formatted address container
    createHeading: () => {
      // Create a heading for the formatted address
      if (this.options.formattedAddressContainer.showHeading) {
        const heading = document.createElement(this.options.formattedAddressContainer.headingType);
        heading.innerHTML = this.options.formattedAddressContainer.validatedHeadingText;
        this.result.formattedAddressContainer.appendChild(heading);
      }
    },
    // Update the heading text in the formatted address container
    updateHeading: (text) => {
      //Change the heading text to "Manual address entered"
      if (this.options.formattedAddressContainer.showHeading) {
        const heading = this.result.formattedAddressContainer.querySelector(this.options.formattedAddressContainer.headingType);
        heading.innerHTML = text;
      }
    },
    calculateIfAddressLineGenerationRequired: () => {
      this.result.generateAddressLineRequired = true;
      for (let i = 0; i < defaults.addressLineLabels.length; i++) {
        const key = defaults.addressLineLabels[i];
        if (this.options.elements[key]) {
          this.result.generateAddressLineRequired = false;
          break;
        }
      }
    },
    updateAddressLine: (key: string, addressLineObject, className: string) => {
      // Either append the result to the user's address field or create a new field for them
      if (this.options.elements[key]) {
        const addressField = this.options.elements[key];
        this.result.updateLabel(key);
        let value = addressLineObject;
        // If a value is already present, prepend a comma and space
        if (addressField.value && value) {
          value = ', ' + value;
        }
        // Decide what property of the node we need to update. i.e. if it's not a form field, update the innerText.
        if (addressField.nodeName === 'INPUT' || addressField.nodeName === 'TEXTAREA' || addressField.nodeName === 'SELECT') {
          addressField.value += value;
        } else {
          addressField.innerText += value;
        }
        // Store a record of their last address field
        this.result.lastAddressField = addressField;
      } else if (this.result.generateAddressLineRequired) {
        // Create an input to store the address line
        const label = this.result.createAddressLine.label(key);
        const field = this.result.createAddressLine.input(label, addressLineObject, className);
        // Insert into DOM
        this.result.formattedAddressContainer.appendChild(field);
      }
    },
    // Update the label if translation is present
    updateLabel: (key: string) => {
      let label = key;
      const language = this.options.language.toLowerCase();
      const country = this.currentCountryCode.toLowerCase();
      if (translations) {
        try {
          const translatedLabel = translations[language][country][key];
          if (translatedLabel) {
            label = translatedLabel;
            const labels = document.getElementsByTagName('label');
            for (let i = 0; i < labels.length; i++) {
              if (labels[i].htmlFor === key) {
                labels[i].innerHTML = translatedLabel;
              }
            }
          }
        } catch (e) {
          // Translation doesn't exist for key
        }
      }
      return label;
    },
    // Create the 'Search again' link that resets the search
    createSearchAgainLink: () => {
      if (this.options.searchAgain.visible) {
        const link = document.createElement('button');
        link.setAttribute('type', 'button');
        link.classList.add('search-again-button');
        link.innerText = this.options.searchAgain.text;
        // Bind event listener
        link.addEventListener('click', this.globalReset.bind(this));
        // Store a reference to the link element
        this.options.searchAgain.link = link;

        // Insert into the formatted address container
        if (this.result.formattedAddressContainer) {
          this.result.formattedAddressContainer.appendChild(link);
        } else if (this.result.lastAddressField) {
          // Insert after last address field
          this.result.lastAddressField.parentNode.insertBefore(link, this.result.lastAddressField.nextSibling);
        }
      }
    },
    // Write the list of hidden address line inputs to the DOM
    renderInputList: (inputArray) => {
      if (inputArray.length > 0) {
        for (let i = 0; i < inputArray.length; i++) {
          this.result.formattedAddressContainer.appendChild(inputArray[i]);
        }
      }
    },
    // Decide whether to either show a picklist or a verified result from a Validate response
    handleValidateResponse: (response: SearchResponse) => {
      if (response.result.confidence === AddressValidationConfidenceType.VERIFIED_MATCH
          || response.result.confidence === AddressValidationConfidenceType.INTERACTION_REQUIRED) {
        // If the response contains an address, then use this directly in the result
        if (response.result.address) {
          this.result.show(response);
        } else if (response.result.suggestions) {
          // If the verified match still contains a suggestion, then we need to format this first
          this.format(response.result.suggestions[0].format);
        }
      } else if (response.result.suggestions) {
        // If the user needs to pick a suggestion, then display the picklist
        this.picklist.show(response);
      } else if (response.result.confidence === 'No matches') {
        // If there are no matches, then allow "use address entered"
        this.picklist.handleEmptyPicklist(response);
      }
    },

    handleEnrichmentResponse: (response: EnrichmentResponse) => {
      let geocodesDetailsMap = this.geocodes.detailsMap;
      let cvDetailsMap = this.cvHousehold.detailsMap;
      geocodesDetailsMap.clear();
      cvDetailsMap.clear();
      this.premiumLocationInsightMap.clear();

      let geocodeResponse;
      let geocodesExpectedAttributes;
      let cvHouseholdResponse;
      let cvHouseholdExpectedAttributes;

      if (response.result.aus_regional_geocodes) {
        this.geocodes.title = enrichmentOutput.AUS.geocodes_title;
        this.cvHousehold.title = enrichmentOutput.AUS.cv_household_title;
        geocodeResponse = Object.entries(response.result.aus_regional_geocodes);
        geocodesExpectedAttributes = new Map<string, string>(Object.entries(enrichmentOutput.AUS.aus_regional_geocodes));
        cvHouseholdResponse = Object.entries(response.result.aus_cv_household);
        cvHouseholdExpectedAttributes = new Map<string, string>(Object.entries(enrichmentOutput.AUS.aus_cv_household));
      } else if (response.result.nzl_regional_geocodes) {
        this.geocodes.title = enrichmentOutput.NZL.geocodes_title;
        this.cvHousehold.title = enrichmentOutput.NZL.cv_household_title;
        geocodeResponse = Object.entries(response.result.nzl_regional_geocodes);
        geocodesExpectedAttributes = new Map<string, string>(Object.entries(enrichmentOutput.NZL.nzl_regional_geocodes));
        cvHouseholdResponse = Object.entries(response.result.nzl_cv_household);
        cvHouseholdExpectedAttributes = new Map<string, string>(Object.entries(enrichmentOutput.NZL.nzl_cv_household));
      } else if (response.result.usa_regional_geocodes) {
        this.geocodes.title = enrichmentOutput.USA.geocodes_title;
        geocodeResponse = Object.entries(response.result.usa_regional_geocodes);
        geocodesExpectedAttributes = new Map<string, string>(Object.entries(enrichmentOutput.USA.usa_regional_geocodes));
      } else if (response.result.uk_location_essential) {
        this.geocodes.title = enrichmentOutput.GBR.geocodes_title;
        geocodeResponse = Object.entries(response.result.uk_location_essential);
        geocodesExpectedAttributes = new Map<string, string>(Object.entries(enrichmentOutput.GBR.uk_location_essential));
      } else {
        this.geocodes.title = enrichmentOutput.GLOBAL.geocodes_title;
        geocodeResponse = Object.entries(response.result.geocodes);
        geocodesExpectedAttributes = new Map<string, string>(Object.entries(enrichmentOutput.GLOBAL.geocodes));
      }

      let premiumLocationInsightResponse = response.result.premium_location_insight;
      if (premiumLocationInsightResponse) {
        for (let i = 0; i < Object.keys(premiumLocationInsightResponse).length; i++) {
          let key = Object.keys(premiumLocationInsightResponse)[i];
          let value = premiumLocationInsightResponse[key];
          // to skip display unnecessary 0 index in the UI if only 1 array object is returned
          if (Array.isArray(value) && value.length === 1) {
            this.premiumLocationInsightMap.set(key, value[0]);
            continue;
          }
          this.premiumLocationInsightMap.set(key, value);
        }
      }

      for (const [key, value] of geocodeResponse) {
        if(!geocodesExpectedAttributes.has(key)){
          continue;
        }
        geocodesDetailsMap.set(geocodesExpectedAttributes.get(key), value);
      }

      if (cvHouseholdResponse) {
        for (const [key, value] of cvHouseholdResponse) {
          if (!cvHouseholdExpectedAttributes.has(key)) {
            continue;
          }
          cvDetailsMap.set(cvHouseholdExpectedAttributes.get(key), value);
        }
      }
      this.events.trigger('post-enrichment', response);
    }
  };

  private checkTab(event: KeyboardEvent): void {
    const key = this.getKey(event);
    if (key === 'Tab') {
      this.picklist.keyup(event);
      return;
    } else if (key === 'Enter') {
      // Prevent an 'Enter' keypress on the input submitting the form
      event.preventDefault();
    }
  }

  private searchSpinner = {
    show: () => {
      // Return if we're not displaying a spinner
      if (!this.options.useSpinner) {
        return;
      }
      // Create the spinner container
      const spinnerContainer = document.createElement('div');
      spinnerContainer.classList.add('loader');
      spinnerContainer.classList.add('loader-inline');

      // Create the spinner
      const spinner = document.createElement('div');
      spinner.classList.add('spinner');
      spinnerContainer.appendChild(spinner);

      // Insert the spinner after the field
      this.inputs[0].parentNode?.insertBefore(spinnerContainer, this.inputs[0].nextSibling);
    },

    hide: () => {
      // Return if we're not displaying a spinner
      if (!this.options.useSpinner) {
        return;
      }
      const spinner = this.inputs[0].parentNode?.querySelector('.loader-inline');
      if (spinner) {
        this.inputs[0].parentNode?.removeChild(spinner);
      }
    }
  };

  // Toggle the "hidden" class to either show or hide the input and country field(s)
  private toggleSearchInputs(state: 'show' | 'hide') {
    const modifier = state === 'show' ? 'remove' : 'add';
    this.options.elements.inputs?.forEach(input => input.parentNode.querySelectorAll('.toggle').forEach(element => element.classList[modifier]('hidden')));
    this.options.elements.countryList?.parentNode.querySelectorAll('.toggle').forEach(element => element.classList[modifier]('hidden'));
    this.options.elements.lookupButton?.parentNode.querySelectorAll('.toggle').forEach(element => element.classList[modifier]('hidden'));
  }

  private globalReset(event?) {
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
    this.inputs.forEach(input => input.value = '');
    // Remove the picklist (if present)
    this.picklist.hide();
    // Show search input
    this.toggleSearchInputs('show');
    // Apply focus to input
    this.inputs[0].focus();

    // set AddressValidationMode based on the search type selected
    this.avMode = AddressValidationSearchType.LOOKUPV2 === this.searchType
        ? AddressValidationMode.LOOKUPV2 : AddressValidationMode.SEARCH;

    // Fire an event after a reset
    this.events.trigger('post-reset');
  }

  private isInternationalValidation(): boolean {
    // Return true if the current dataset indicates this is a international data validation call
    if (this.searchType === AddressValidationSearchType.VALIDATE
      && !Array.isArray(this.currentDataSet) 
      && this.currentDataSet.toUpperCase().endsWith("-ED")) {
        return true;
    }

    return false;
  }
}
