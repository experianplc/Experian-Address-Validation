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
  }
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
export interface EnrichmentResponse {
  result?: {
    aus_regional_geocodes?: AUSRegionalGeocodes;
    aus_cv_household?: AUSCVHousehold;
    nzl_regional_geocodes?: NZLRegionalGeocodes;
    nzl_cv_household?: NZLCVHousehold;
    usa_regional_geocodes?: USARegionalGeocodes;
    global_geocodes?: Geocodes;
    premium_location_insight?: PremiumLocationInsight;
  };
}
export interface AUSRegionalGeocodes {
  latitude?: number;
  longitude?: number;
  match_level?: string;
  sa1?: string;
  meshblock?: string;
  lga_code?: string;
  lga_name?: string;
  street_pid?: string;
  locality_pid?: string;
  geocode_level_code?: string;
  geocode_level_description?: string;
  geocode_type_code?: string;
  geocode_type_description?: string;
  highest_level_longitude?: number;
  highest_level_latitude?: number;
  highest_level_elevation?: string;
  highest_level_planimetric_accuracy?: string;
  highest_level_boundary_extent?: string;
  highest_level_geocode_reliability_code?: string;
  highest_level_geocode_reliability_description?: string;
  confidence_level_code?: string;
  confidence_level_description?: string;
  "2021_meshblock_id"?: string;
  "2021_meshblock_code"?: string;
  "2021_meshblock_match_code"?: string;
  "2021_meshblock_match_description"?: string;
  "2016_meshblock_id"?: string;
  "2016_meshblock_code"?: string;
  "2016_meshblock_match_code"?: string;
  "2016_meshblock_match_description"?: string;
  address_type_code?: string;
  primary_address_pid?: string;
  address_join_type?: string;
  collector_district_id?: string;
  collector_district_code?: string;
  commonwealth_electoral_boundary_id?: string;
  commonwealth_electoral_boundary_name?: string;
  statistical_local_area_id?: string;
  statistical_local_area_code?: string;
  statistical_local_area_name?: string;
  state_electoral_boundary_id?: string;
  state_electoral_boundary_name?: string;
  state_electoral_effective_start?: string;
  state_electoral_effective_end?: string;
  state_electoral_new_pid?: string;
  state_electoral_new_name?: string;
  state_electoral_new_effective_start?: string;
  state_electoral_new_effective_end?: string;
  address_level_longitude?: number;
  address_level_latitude?: number;
  address_level_elevation?: string;
  address_level_planimetric_accuracy?: string;
  address_level_boundary_extent?: string;
  address_level_geocode_reliability_code?: string;
  address_level_geocode_reliability_description?: string;
  street_level_longitude?: number;
  street_level_latitude?: number;
  street_level_planimetric_accuracy?: string;
  street_level_boundary_extent?: string;
  street_level_geocode_reliability_code?: string;
  street_level_geocode_reliability_description?: string;
  locality_level_longitude?: number;
  locality_level_latitude?: number;
  locality_level_planimetric_accuracy?: string;
  locality_level_geocode_reliability_code?: string;
  locality_level_geocode_reliability_description?: string;
  gnaf_legal_parcel_identifier?: string;
  locality_class_code?: string;
}
export interface AUSCVHousehold {
  address?: string;
  adults_at_address_code?: string;
  adults_at_address_description?: string;
  affluence_code?: string;
  affluence_description?: string;
  channel_preference?: string;
  channel_preference_description?: string;
  children_at_address_code_0_10_years?: string;
  children_at_address_code_11_18_years?: string;
  children_at_address_description_0_10_years?: string;
  children_at_address_description_11_18_years?: string;
  credit_demand_code?: string;
  credit_demand_description?: string;
  gnaf_latitude?: number;
  gnaf_longitude?: number;
  gnaf_pid?: string;
  head_of_household_age_code?: string;
  head_of_household_age_description?: string;
  hin?: string;
  household_composition_code?: string;
  household_composition_description?: string;
  household_income_code?: string;
  household_income_description?: string;
  length_of_residence_code?: string;
  length_of_residence_description?: string;
  lifestage_code?: string;
  lifestage_description?: string;
  local_government_area_code?: string;
  local_government_area_name?: string;
  meshblock?: string;
  mosaic_group?: string;
  mosaic_segment?: string;
  mosaic_type?: string;
  postcode?: string;
  residential_flag?: string;
  risk_insight_code?: string;
  risk_insight_description?: string;
  sa1?: string;
  state?: string;
  suburb?: string;
  mosaic_factor1_percentile?: string;
  mosaic_factor1_score?: string;
  mosaic_factor2_percentile?: string;
  mosaic_factor2_score?: string;
  mosaic_factor3_percentile?: string;
  mosaic_factor3_score?: string;
  mosaic_factor4_percentile?: string;
  mosaic_factor4_score?: string;
  mosaic_factor5_percentile?: string;
  mosaic_factor5_score?: string;
}
export interface NZLRegionalGeocodes {
  front_of_property_nztm_x_coordinate?: number;
  front_of_property_nztm_y_coordinate?: number;
  centroid_of_property_nztm_x_coordinate?: number;
  centroid_of_property_nztm_y_coordinate?: number;
  front_of_property_latitude?: number;
  front_of_property_longitude?: number;
  centroid_of_property_latitude?: number;
  centroid_of_property_longitude?: number;
  linz_parcel_id?: string;
  property_purpose_type?: string;
  addressable?: string;
  mesh_block_code?: string;
  territorial_authority_code?: string;
  territorial_authority_name?: string;
  regional_council_code?: string;
  regional_council_name?: string;
  general_electorate_code?: string;
  general_electorate_name?: string;
  maori_electorate_code?: string;
  maori_electorate_name?: string;
  match_level?: string;
}
export interface NZLCVHousehold {
  adults_at_address?: string;
  children_at_address?: string;
  head_of_household_age?: string;
  head_of_household_lifestage?: string;
  household_composition?: string;
  mosaic_group?: string;
  mosaic_segment?: string;
  mosaic_type_group?: string;
}
export interface USARegionalGeocodes {
  latitude?: number;
  longitude?: number;
  match_level?: string;
  census_tract?: string;
  census_block?: string;
  core_based_statistical_area?: string;
  congressional_district_code?: string;
  county_code?: string;
}
export interface Geocodes {
  latitude?: number;
  longitude?: number;
  match_level?: string;
}
export interface PremiumLocationInsight {
  geocodes?: Geocodes;
  geocodes_building_xy?: GeocodesBuildingXY;
  geocodes_access?: GeocodesAccess;
  time?: Time;
}
export interface GeocodesBuildingXY {
  x_coordinate?: number;
  y_coordinate?: number;
}
export interface GeocodesAccess {
  latitude?: number;
  longitude?: number;
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