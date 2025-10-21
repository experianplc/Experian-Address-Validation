document.addEventListener('DOMContentLoaded', function () {
  const phoneInput = document.getElementById('phone');
  const validateButton = document.getElementById('validate-phone-button');
  const resultContainer = document.getElementById('phone-validation-result');
  const countryDropdown = document.getElementById('country-code');

  // Initialize PhoneValidation with the token
  let phoneValidation;

  function initPhoneValidation(token) {
    phoneValidation = new PhoneValidation({ token });
  }

  let token = localStorage.getItem('validation-token');
  if (token) {
    initPhoneValidation(token);
  } else {
    token = localStorage.getItem('validation-token');
    initPhoneValidation(token);
  }

  validateButton.addEventListener('click', function () {
    const phone = phoneInput.value;
    const country_iso = countryDropdown.value;
    const request = {
      number: phone,
      country_iso: country_iso,
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