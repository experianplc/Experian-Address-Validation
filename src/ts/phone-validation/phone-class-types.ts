export interface PhoneValidationRequest {
  number: string;
  output_format?: string;
  cache_value_days?: number;
  country_iso?: string;
  get_ported_date?: boolean;
  get_disposable_number?: boolean;
  supplementary_live_status?: {
    mobile?: string[];
    landline?: string[];
  };
}

export class PhoneValidationResponse {
    result: {
        number: string;
        validated_phone_number: string;
        formatted_phone_number: string;
        phone_type: string;
        confidence: string;
        ported_date: string;
        disposable_number: string;
    };
    metadata: {
        phone_detail: {
            original_operator_name: string;
            original_network_status: string;
            original_home_network_identity: string;
            original_country_prefix: string;
            original_country_name: string;
            original_country_iso: string;
            operator_name: string;
            network_status: string;
            home_network_identity: string;
            country_prefix: string;
            country_name: string;
            country_iso: string;
            is_ported: string;
            cache_value_days: number;
            date_cached: string;
            email_to_sms_address: string;
            email_to_mms_address: string;
        };
    };
}