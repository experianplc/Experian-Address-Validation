//import PhoneValidation from '../ts/phone-validation/phone-validation';

document.addEventListener('DOMContentLoaded', function () {
  const phoneInput = document.getElementById('phone');
  const validateButton = document.getElementById('validate-phone-button');
  const resultContainer = document.getElementById('phone-validation-result');
  const countryDropdown = document.getElementById('country-code');

  // Initialize PhoneValidation with the token
  var options = {
    token: localStorage.getItem('phone-validation-token')
  };

  const phoneValidation = new PhoneValidation(options);

  validateButton.addEventListener('click', function () {
    const phone = phoneInput.value;
    const country_iso = countryDropdown.value;
    const request = {
      number: phone,
      // output_format: "NATIONAL",
      // cache_value_days: 0,
      country_iso: country_iso,
      // get_ported_date: true,
      // get_disposable_number: true,
      // supplementary_live_status: {
      //   mobile: country_iso ? [country_iso] : [],
      //   landline: country_iso === "GBR" ? [country_iso] : []
      // }
    };
    phoneValidation.validatePhone(request);
  });

  // Listen for post-validation event
  phoneValidation.events.on('post-validation', function (result) {
    const resultBody = document.getElementById('phone-validation-result-body');
    resultContainer.classList.remove('hidden');
    resultBody.innerHTML = '';

    // Display main result fields
    const keyMapping = {
      'result.number': 'Input Number',
      'result.validated_phone_number': 'Validated Number',
      'result.formatted_phone_number': 'Formatted Number',
      'result.phone_type': 'Type',
      'result.confidence': 'Confidence',
      'result.ported_date': 'Ported Date',
      'result.disposable_number': 'Disposable'
    };

    const getNestedValue = (obj, path) =>
      path.split('.').reduce((acc, key) => acc && acc[key], obj);

    for (const key in keyMapping) {
      const label = keyMapping[key];
      const value = getNestedValue(result, key);
      if (value !== undefined) {
        const row = document.createElement('tr');
        const labelCell = document.createElement('td');
        labelCell.innerText = label;
        labelCell.style.fontWeight = 'bold';
        const valueCell = document.createElement('td');
        valueCell.innerText = value;
        row.appendChild(labelCell);
        row.appendChild(valueCell);
        resultBody.appendChild(row);
      }
    }

    // Display all metadata fields
    if (result.metadata && result.metadata.phone_detail) {
      const metadata = result.metadata.phone_detail;
      for (const metaKey in metadata) {
        if (Object.prototype.hasOwnProperty.call(metadata, metaKey)) {
          const row = document.createElement('tr');
          const labelCell = document.createElement('td');
          labelCell.innerText = metaKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          labelCell.style.fontWeight = 'bold';
          const valueCell = document.createElement('td');
          valueCell.innerText = metadata[metaKey];
          row.appendChild(labelCell);
          row.appendChild(valueCell);
          resultBody.appendChild(row);
        }
      }
    }
  });

  // Listen for validation-error event
  phoneValidation.events.on('validation-error', function (error) {
    resultContainer.classList.remove('hidden');
    resultContainer.innerText = `Error: ${error}`;
  });
});