import EventFactory from '../event-factory';
import Request from '../request';
import { PhoneValidateOptions } from './phone-validate-options';
import { PhoneValidationRequest } from './phone-class-types';
import { PhoneValidationResponse } from './phone-class-types';

export default class PhoneValidation {
  public options: PhoneValidateOptions;
  private baseUrl = 'https://api.experianaperture.io/';
  private phoneValidationV2 = 'phone/validate/v2';
  public events: EventFactory;
  public request: Request;
  private validationGeneration = 0;

  constructor(options: PhoneValidateOptions) {
    this.options = options;
    this.events = new EventFactory();
    this.request = new Request(this);
  }

  public validatePhone(request: PhoneValidationRequest): void {
    const validationGeneration = ++this.validationGeneration;
    const data = JSON.stringify(request);

    this.request.send(
      this.baseUrl, this.phoneValidationV2,
      'POST',
      (response: object) => {
        if (validationGeneration !== this.validationGeneration) {
          return;
        }

        try {
          const result: PhoneValidationResponse = response as PhoneValidationResponse;
          this.events.trigger('post-validation', result);
        } catch (error) {
          this.events.trigger('validation-error', 'Invalid response format.');
        }
      },
      data,
      [
        { key: 'Add-Metadata', value: true }
      ]
    );
  }

  public reset(): void {
    this.validationGeneration++;
    this.request.abort();
  }
}
