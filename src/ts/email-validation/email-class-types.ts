export class EmailValidationResponse {
    result: {
        confidence: string;
        did_you_mean: string[];
        verbose_output: string;
        email: string;
    };
    metadata: {
        domain_detail: {
            type: string;
        },
        normalized_email: string;
    };
}