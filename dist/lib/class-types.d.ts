export declare class Picklist {
    items: PicklistItem[];
    currentItem: any;
    list: HTMLDivElement;
    container: HTMLElement;
    size: number;
    maxSuggestions: number;
    show: (items: SearchResponse) => void;
    hide: () => void;
    handleEmptyPicklist: (items: SearchResponse) => void;
    handleEmptyPicklistCallback: () => void;
    refine: Refinement;
    useAddressEntered: UseAddressEntered;
    createList: () => HTMLDivElement;
    createListItem: (item: PicklistItem) => HTMLDivElement;
    tabCount: number;
    resetTabCount: () => void;
    keyup: (event: KeyboardEvent) => void;
    addMatchingEmphasis: (item: any) => string;
    listen: (row: any) => void;
    checkEnter: (event: KeyboardEvent) => void;
    pick: (item: any) => void;
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
    };
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
    isNeeded: (items: PicklistItem[]) => boolean;
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
