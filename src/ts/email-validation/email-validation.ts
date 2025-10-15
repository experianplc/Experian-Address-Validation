import EventFactory from '../event-factory';
import Request from '../request';
import { EmailValidateOptions } from './email-validate-options';
import { EmailValidationResponse } from './email-class-types';

export default class EmailValidation {
	public options: EmailValidateOptions;
  private baseUrl = 'https://api.experianaperture.io/';
  private emailValidationV2 = 'email/validate/v2';
  public events: EventFactory;
  public request: Request;

  constructor(options: EmailValidateOptions) {
    this.options = options;
    this.events = new EventFactory();
    this.request = new Request(this); // Pass token to Request instance
  }

  public validateEmail(email: string): void {
    if (!email) {
      this.events.trigger('validation-error', 'Email cannot be empty.');
      return;
    }

    const data = JSON.stringify({ email });

    //this.events.trigger('pre-validation', { email });

    this.request.send(
      this.baseUrl + this.emailValidationV2,
      'POST',
      (response: object) => {
        try {
          const result: EmailValidationResponse = response as EmailValidationResponse;
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
  
  private searchSpinner = {
 	  show: () => {
 	  },

 	  hide: () => {
 	}
  }
}