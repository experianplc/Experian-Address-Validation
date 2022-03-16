export class Picklist {
  items: PicklistItem[];
  currentItem;
  list: HTMLDivElement;
  container: HTMLElement;
  size = 0;
  maxSuggestions = 25;
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
  addMatchingEmphasis: (item) => string;
  listen: (row) => void;
  checkEnter: (event: KeyboardEvent) => void;
  pick: (item) => void;
}

export class AddressValidationResult {
  formattedAddressContainer;
  lastAddressField;
  generateAddressLineRequired: boolean;
  show: (data) => void;
  hide: () => void;
  createAddressLine: CreateAddressLine;
  createFormattedAddressContainer: () => void;
  createHeading: () => void;
  updateHeading: (text: string) => void;
  calculateIfAddressLineGenerationRequired: () => void;
  updateAddressLine: (key: string, addressLineObject, className: string) => void;
  updateLabel: (key: string) => string;
  createSearchAgainLink: () => void;
  renderInputList: (inputArray) => void;
  handleValidateResponse: (response: SearchResponse) => void;
}

class CreateAddressLine {
  input: (key: string, value: string, className: string) => HTMLDivElement;
  label: (key: string) => string;
}

export interface SearchResponse {
  result?: {
    suggestions: PicklistItem[];
    suggestions_prompt?: string;
    suggestions_key?: string;
    confidence: string;
    address?: {[key: string]: string};
  }
}

export interface PicklistItem {
  text: string;
  format?: string;
  matched?: number[][];
  global_address_key?: string;
  additional_attributes?: {name: string, Value: string}[];
}

export class UseAddressEntered {
  element: HTMLElement;
  create: (confidence: string) => HTMLDivElement;
  destroy: () => void;
  click: () => void;
  formatManualAddressLine: (lines, i) => {[key: string]: string};
}

export class Refinement {
  element: HTMLInputElement;
  isNeeded: (items: PicklistItem[]) => boolean;
  createInput: (prompt: string, key: string) => void;
  enter: (event: Event) => void;
}

export class SearchSpinner {
  show: () => void;
  hide: () => void;
}

export class PoweredByLogo {
  element: HTMLElement;
  create: (picklist) => HTMLDivElement;
  destroy: (picklist) => void;
  svg: string;
}