export class Picklist {
  items: PicklistItem[];
  what3wordsItems: What3WordsPickList[];
  lookupItems: LookupAddress[];
  currentItem;
  list: HTMLDivElement;
  container: HTMLElement;
  size = 0;
  maxSuggestions = 25;
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
  addMatchingEmphasis: (item) => string;
  listen: (row) => void;
  checkEnter: (event: KeyboardEvent) => void;
  pick: (item) => void;
  scrollIntoViewIfNeeded: () => void;
  displaySuggestionsHeader: () => void;
  displayUseAddressEnteredFooter: () => void;
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
  handleEnrichmentResponse: (response: EnrichmentResponse) => void;
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
    address?: { [key: string]: string };
    components?: AddressComponent;
  },
  metadata? :{
    address_info?: AddressInfo;
    barcode?: { [key: string]: string };
    route_classification?: { [key: string]: string };
    address_classification?: AddressClassification;
    dpv?: { [key: string]: string };
  }
}
export interface AddressInfo {
  sources: string[];
  number_of_households: string;
  just_built_date: string;
  identifier: { [key: string]: string };
}
export interface AddressClassification {
  address_type: { [key: string]: string };
  delivery_type: string;
  is_deliverable: string;
}
export interface LookupW3WResponse {
  result?: {
    more_results_available: boolean;
    suggestions: What3WordsPickList[];
    confidence: string;
  }
}

export interface LookupV2Response {
  result?: {
    more_results_available: boolean;
    confidence: string;
    addresses: LookupAddress[];
  }
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
  description: string
}

export interface PicklistItem {
  text: string;
  format?: string;
  matched?: number[][];
  global_address_key?: string;
  additional_attributes?: { name: string, Value: string }[];
}
export interface AddressComponent {
  language?: string;
  country_name?: string;
  country_iso_3?: string;
  country_iso_2?: string;
  postal_code?: { [key: string]: string };
  delivery_service?: { [key: string]: string };
  secondary_delivery_service?: { [key: string]: string };
  sub_building?: AddressComponentSubBuilding;
  building?: { [key: string]: string };
  organization?: { [key: string]: string };
  street?: { [key: string]: string };
  secondary_street?: { [key: string]: string };
  route_service?: { [key: string]: string };
  locality?: { [key: string]: { [key: string]: string }};
  physical_locality?: { [key: string]: { [key: string]: string }};
  additional_elements?: AddressComponentAdditionalElements;
}
export interface AddressComponentSubBuilding {
  name?: string;
  entrance?: { [key: string]: string };
  floor?: { [key: string]: string };
  door?: { [key: string]: string };
}
export interface AddressComponentAdditionalElements {
  locality?: { sub_region: { [key: string]: string }};
}
export interface EnrichmentResponse {
  result?: {
    aus_regional_geocodes?: { [key: string]: string };
    aus_cv_household?: { [key: string]: string };
    nzl_regional_geocodes?: { [key: string]: string };
    nzl_cv_household?: { [key: string]: string };
    usa_regional_geocodes?: { [key: string]: string };
    global_geocodes?: { [key: string]: string };
    premium_location_insight?: PremiumLocationInsight;
  };
}
export interface PremiumLocationInsight {
  geocodes?: { [key: string]: string };
  geocodes_building_xy?: { [key: string]: string };
  geocodes_access?: { [key: string]: string };
  time?: Time;
}
export interface Time {
  time_zone_id?: string;
  generic?: string;
  standard?: string;
  daylight?: string;
  reference_time?: ReferenceTime;
  time_transition?: TimeTransition;
}
export interface ReferenceTime {
  tag?: string;
  standard_offset?: string;
  daylight_savings?: string;
  sunrise?: string;
  sunset?: string;
}
export interface TimeTransition {
  tag?: string;
  standard_offset?: string;
  daylight_savings?: string;
  utc_start?: string;
  utc_end?: string;
}
export class UseAddressEntered {
  element: HTMLElement;
  create: (confidence: string) => HTMLDivElement;
  destroy: () => void;
  click: () => void;
  formatManualAddressLine: (lines, i) => { [key: string]: string };
}

export class Refinement {
  element: HTMLInputElement;
  isNeeded: (response: SearchResponse) => boolean;
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