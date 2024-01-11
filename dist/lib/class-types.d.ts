export declare class Picklist {
    items: PicklistItem[];
    what3wordsItems: What3WordsPickList[];
    lookupItems: LookupAddress[];
    currentItem: any;
    list: HTMLDivElement;
    container: HTMLElement;
    size: number;
    maxSuggestions: number;
    show: (items: SearchResponse) => void;
    showWhat3Words: (items: LookupW3WResponse) => void;
    showLookup: (items: LookupV2Response) => void;
    hide: () => void;
    handleEmptyPicklist: (items: SearchResponse | LookupW3WResponse | LookupV2Response) => void;
    handleEmptyPicklistCallback: () => void;
    handleCommonShowPicklistLogic: () => void;
    refine: Refinement;
    useAddressEntered: UseAddressEntered;
    createList: () => HTMLDivElement;
    createListItem: (item: PicklistItem) => HTMLDivElement;
    createLookupListItem: (item: LookupAddress) => HTMLDivElement;
    createWhat3WordsListItem: (item: What3WordsPickList) => HTMLDivElement;
    tabCount: number;
    resetTabCount: () => void;
    keyup: (event: KeyboardEvent) => void;
    addMatchingEmphasis: (item: any) => string;
    listen: (row: any) => void;
    checkEnter: (event: KeyboardEvent) => void;
    pick: (item: any) => void;
    scrollIntoViewIfNeeded: () => void;
    displaySuggestionsHeader: () => void;
    displayUseAddressEnteredFooter: () => void;
}
export declare class AddressValidationResult {
    formattedAddressContainer: any;
    lastAddressField: any;
    generateAddressLineRequired: boolean;
    show: (data: any) => void;
    hide: () => void;
    createAddressLine: CreateAddressLine;
    createFormattedAddressContainer: () => void;
    createHeading: () => void;
    updateHeading: (text: string) => void;
    calculateIfAddressLineGenerationRequired: () => void;
    updateAddressLine: (key: string, addressLineObject: any, className: string) => void;
    updateLabel: (key: string) => string;
    createSearchAgainLink: () => void;
    renderInputList: (inputArray: any) => void;
    handleValidateResponse: (response: SearchResponse) => void;
    handleEnrichmentResponse: (response: EnrichmentResponse) => void;
}
declare class CreateAddressLine {
    input: (key: string, value: string, className: string) => HTMLDivElement;
    label: (key: string) => string;
}
export interface SearchResponse {
    result?: {
        suggestions: PicklistItem[];
        suggestions_prompt?: string;
        suggestions_key?: string;
        confidence: string;
        address?: {
            [key: string]: string;
        };
        components?: {
            [key: string]: string;
        };
    };
    metadata?: {
        [key: string]: string;
    };
}
export interface LookupW3WResponse {
    result?: {
        more_results_available: boolean;
        suggestions: What3WordsPickList[];
        confidence: string;
    };
}
export interface LookupV2Response {
    result?: {
        more_results_available: boolean;
        confidence: string;
        addresses: LookupAddress[];
    };
}
export interface LookupAddress {
    text: string;
    global_address_key: string;
    format: string;
}
export interface What3WordsPickList {
    what3words: What3WordsSuggestion;
}
export interface What3WordsSuggestion {
    name: string;
    description: string;
}
export interface PicklistItem {
    text: string;
    format?: string;
    matched?: number[][];
    global_address_key?: string;
    additional_attributes?: {
        name: string;
        Value: string;
    }[];
}
export declare class EnrichmentDetails {
    title: string;
    detailsMap: Map<string, string>;
}
export interface EnrichmentResponse {
    result?: {
        aus_regional_geocodes?: {
            [key: string]: string;
        };
        aus_cv_household?: {
            [key: string]: string;
        };
        nzl_regional_geocodes?: {
            [key: string]: string;
        };
        nzl_cv_household?: {
            [key: string]: string;
        };
        usa_regional_geocodes?: {
            [key: string]: string;
        };
        uk_location_essential?: {
            [key: string]: string;
        };
        what3words?: What3Words;
        geocodes?: {
            [key: string]: string;
        };
        premium_location_insight?: {
            [key: string]: string;
        };
    };
}
export interface What3Words {
    latitude?: string;
    longitude?: string;
    name?: string;
    description?: string;
}
export interface DatasetsResponse {
    result?: DatasetsCountryResult[];
}
export interface DatasetsCountryResult {
    country_iso_3?: string;
    country_name?: string;
    datasets?: Dataset[];
}
export interface Dataset {
    id?: string;
    name?: string;
}
export declare class UseAddressEntered {
    element: HTMLElement;
    create: (confidence: string) => HTMLDivElement;
    destroy: () => void;
    click: () => void;
    formatManualAddressLine: (lines: any, i: any) => {
        [key: string]: string;
    };
}
export declare class Refinement {
    element: HTMLInputElement;
    isNeeded: (response: SearchResponse) => boolean;
    createInput: (prompt: string, key: string) => void;
    enter: (event: Event) => void;
}
export declare class SearchSpinner {
    show: () => void;
    hide: () => void;
}
export declare class PoweredByLogo {
    element: HTMLElement;
    create: (picklist: any) => HTMLDivElement;
    destroy: (picklist: any) => void;
    svg: string;
}
export {};
