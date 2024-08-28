# Experian Address Validation

[![GitHub version](https://badge.fury.io/gh/experianplc%2FExperian-Address-Validation.svg)](http://badge.fury.io/gh/experianplc%2FExperian-Address-Validation)
[![Build Status](https://travis-ci.org/experianplc%2FExperian-Address-Validation.svg?branch=master)](https://travis-ci.org/experianplc%2FExperian-Address-Validation)

This repository contains sample code for integrating with Experian's Address Validation API. Currently available for over 235 countries and territories.

Check out the [demo](https://experianplc.github.io/Experian-Address-Validation/).

## Usage

#### Prerequisites

- To use the API you need a token (You would have received this from your Experian account manager).

#### Integration

##### Options

After embedding the script tag in your webpage you can customise it by passing settings through to the API using an options object. By default you should at least pass through an `elements` object with the address field input(s) and country list selectors.

As well as this, you should also always provide your token.

```javascript
var options = {
    token: "INSERT_TOKEN",
    elements: {
        inputs: [document.querySelector("input[name='address-input']")],
        countryList: document.querySelector("select")
    }
};
```

If you have your own return fields that you want a final address pasted to, you need to specify these in the `elements` object too.

Additional options that can be passed through include:

| Property name | Description | Default |
|------------|-------------|---------------|
| `token` | Your authentication token. Recommended. | |
| `searchType` | The search type to use | Autocomplete |
| `location` | Latitude and Longitude values in a string separated by a comma (e.g. "40.52,-73.93") | null |
| `language` | The ISO 2 digit language code | "en"|
| `maxSuggestions` | The maximum number of suggestions to return | 25 |
| `input.placeholderText` | The placeholder text for the input | "Start typing an address"|
| `input.applyFocus` | Whether to apply focus to the search field | true|
| `searchAgain.visible` | Whether the 'search again' link is shown | true|
| `searchAgain.text` | The text for the 'search again' link | "Search again"|
| `formattedAddressContainer.showHeading` | Whether to show a "Validated address" heading | false|
| `formattedAddressContainer.headingType` | If a heading is shown, what HTML element to use | H3|
| `formattedAddressContainer.validatedHeadingText` | Heading text for validated addresses | "Validated address"|
| `formattedAddressContainer.manualHeadingText` | Heading text if address entered manually | "Manual address entered"|
| `useSpinner` | Whether to display a spinner while searching | false|
| `addressLineLabels` | An array of 7 labels for the form fields | ["addressLine1", "addressLine2", "addressLine3", "locality", "province", "postalCode", "country"] |

##### Country list

The default sample page contains the full list of supported countries. This list should be amended to include only the countries that your integration supports. A full list of available countries and their ISO codes can also be found with our [API documentation](https://www.edq.com/documentation/apis/address-validate/experian-address-validation/#supported-countries-2).

##### Tokens

> For the purpose of this sample code, the tokens for the live endpoint aren't hardcoded in source control and must be appended to the query as a header parameter or set in the input field on the demo.

To get your token and a free trial, contact us via [www.experian.co.uk/business/enquire](https://www.experian.co.uk/business/enquire)

As mentioned above in [Options](/#options) you should pass your token through as a setting. The sample page in this repo appends it to the query string to avoid hardcoding a token in source control.

##### Invocation

Invoke a new instance by creating a new `AddressValidation` object.

`var address = new AddressValidation(options);`

#### Events

After instantiating a new instance the constructor returns an object that can be used to subscribe to events.

| Event name | Description | Example usage |
|------------|-------------|---------------|
| `pre-search` | Before a typedown search takes place | ```address.events.on("pre-search", function(term){ // ...  });```|
| `pre-promptset-check` | Before a promptset API is called | ```address.events.on("pre-promptset-check", function(){ // ...  });```|
| `post-promptset-check` | After a promptset API was called | ```address.events.on("post-promptset-check", function(data){ // ... });```|
| `pre-picklist-create` | Before a picklist is created | ```address.events.on("pre-picklist-create", function(items){ // ...  });```|
| `post-picklist-create` | After a picklist has been created | ```address.events.on("post-picklist-create", function(items){ // ... });```|
| `post-picklist-selection` | After a picklist item has been selected | ```address.events.on("post-picklist-selection", function(item){ // ... });```|
| `pre-refinement` | Just before a refinement takes place | ```address.events.on("pre-refinement", function(global_address_key){ // ... });```|
| `pre-formatting-search` | Just before the formatting search takes place | ```address.events.on("pre-formatting-search", function(url){ // ... });```|
| `post-formatting-search` | After the formatting search has returned a result | ```address.events.on("post-formatting-search", function(data){ // ... });```|
| `post-reset` | After the demo has been reset | ```address.events.on("post-reset", function(){ // ... });```|
| `post-search-type-change` | After the search type has been changed | ```address.events.on("post-search-type-change", function(searchType){ // ... });```|
| `post-datasets-update` | To populate the authorized country dataset(s) into the country dataset dropdown | ```address.events.on("post-datasets-update", function(){ // ... });```|
| `error-display` | To display error when the selected search type is not supported for the country dataset selected | ```address.events.on("error-display", function (error){ // ... });```|
| `request-timeout` | A timeout occurred during the XMLHttpRequest | ```address.events.on("request-timeout", function(xhr){ // ... });```|
| `request-error` | A generic error occurred initiating the XMLHttpRequest | ```address.events.on("request-error", function(xhr){ // ... });```|
| `request-error-400` | A 400 Bad Request error occurred | ```address.events.on("request-error-400", function(xhr){ // ... });```|
| `request-error-401` | A 401 Unauthorized error occurred (invalid token) | ```address.events.on("request-error-401", function(xhr){ // ... });```|
| `request-error-403` | A 403 Forbidden error occurred | ```address.events.on("request-error-403", function(xhr){ // ... });```|
| `request-error-404` | A 404 Not Found error occurred | ```address.events.on("request-error-404", function(xhr){ // ... });```|

#### Customising labels

By default the API returns the formatted address using a global 7-line layout. This means that the field labels for every country are all the same. These are:

* address_line_1
* address_line_2
* address_line_3
* locality
* region
* postal_code
* country

However, in your integration you might wish to change "locality" to "city" or "postal_code" to "post code", for example.

1. Access the [_translations.js file](/src/ts/translations.js)

2. Add the localised labels to the existing object, following the `language:country:property` pattern. For example:

```JavaScript
en: {
    gbr: {
      locality: "Town/City",
      region: "County",
      postal_code: "Post code"
    }
}
```

Any property you don't override will continue to use the default label.

NB. You can change the language by passing this setting through, as described in [Options](/#options).

#### Returning results

The API returns the formatted address in json format as **7 lines**.

If you **have your own** fields to paste the result to, you must tell the API about your fields.
This is done when integrating the API and specifying your elements. As well as specifying the input and country field, you'd specify your "result" fields. e.g.

```
var countryMap = {"GB": "GBR","AF": "AFG","AX": "ALA","AL": "ALB","DZ": "DZA"};

var options = {
    elements: {
        inputs: [document.querySelector("input[name='address-input']")],
        countryList: document.querySelector("select"),
        countryCodeMapping : countryMap,
        address_line_1: document.querySelector("input[name='address_line_1']"),
        address_line_2: document.querySelector("input[name='address_line_2']"),
        address_line_3: document.querySelector("input[name='address_line_2']"),
        locality: document.querySelector("input[name='locality']"),
        region: document.querySelector("input[name='locality']"),
        postal_code: document.querySelector("input[name='postal_code']")
        country: document.querySelector("input[name='country']")
    }
};
```

A note on the country list: If you need to pass a value for the Datasets parameter to the API in order to specify a non-default dataset for a certain country, the value of the option in the country list should be in the format "{country ISO code};{dataset name}". Please see the [API Reference](https://www.edq.com/documentation/apis/address-validate/experian-address-validation/) for more details on the Datasets API parameter.

Notice how you can return multiple address lines to the same form field.

If you **don't** have your own fields, this sample code creates a new form field for each of the address lines and sets the value accordingly. These form fields are created for you and don't need to be specified in advance.

The form fields are wrapped in a `div` with a class name of "formatted-address".

The `name` attribute for each field is the same as the label discussed in [Customising labels](/#customising-labels). That is, either the default label returned by the API, or a custom key if it's overridden.

#### Components and Metadata

In addition to the 7 address lines. A format request also returns an array of objects containing the individual components that make up the address and a metadata object. Currently the metadata object will return Delivery Point Validation (DPV) information for USA searches.

Components and Metadata are not designed to be returned to the user and instead should be stored separately. This will be specific to your requirements and is not included in the sample code.

More information can be found in the [documentation](https://www.edq.com/documentation/apis/address-validate/experian-address-validation/).

## Development

While you're free to take the JavaScript from the [`dist`](/dist/js/experian-address-validation.js) folder and use this in your website, should you want to contribute to this repo or make modifications to the code, you'll need to compile the new version from the [`src`](/src/ts/).

Make sure Node and npm installed.

- https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

Then:

0. Fork this repo (`https://github.com/experianplc/Experian-Address-Validation`).
0. Run `npm install` to get the configured packages.
0. Run `npm run build` and ensure your changes are built to the output `dist` directory.
0. Push your changes and, when ready, make a pull request for them to be added to master.

## Support

At the time of writing, this sample code is currently supported in Chrome, Firefox, Safari and Edge latest, as well as IE 11.
