document.addEventListener('DOMContentLoaded', function () {
  const phoneInput = document.getElementById('phone');
  const validateButton = document.getElementById('validate-phone-button');
  const resultContainer = document.getElementById('phone-validation-result');
  const countryDropdown = document.getElementById('country-code');

  // Inline error element (created once)
  let inlineError = document.getElementById('phone-validation-error');
  if (!inlineError) {
    inlineError = document.createElement('div');
    inlineError.id = 'phone-validation-error';
    inlineError.className = 'validation-inline-error hidden';
    validateButton.insertAdjacentElement('afterend', inlineError);
  }

  // Initialize PhoneValidation only after token entered
  let phoneValidation;
  function initPhoneValidation(token) {
    phoneValidation = new PhoneValidation({ token });
  }

  window.addEventListener('validation-token-set', (e) => {
    initPhoneValidation(e.detail.token);
  }, { once: true });

  // Disable validate button until token provided
  validateButton.disabled = true;
  window.addEventListener('validation-token-set', () => {
    validateButton.disabled = false;
  }, { once: true });

  validateButton.addEventListener('click', function () {
    const phone = phoneInput.value;
    const country_iso = countryDropdown.value;
    if (!phoneValidation) {
      alert('Please enter a token first.');
      return;
    }
    if (!country_iso) {
      inlineError.textContent = 'Please select a country before validating the phone number.';
      inlineError.classList.remove('hidden');
      inlineError.classList.add('fade-in');
      return;
    } else {
      inlineError.textContent = '';
      inlineError.classList.add('hidden');
      inlineError.classList.remove('fade-in');
    }
    // Rate limit check (client-side). If RateLimiter isn't available, proceed.
    if (window.RateLimiter && typeof window.RateLimiter.allowCall === 'function') {
      // disable button while checking
      validateButton.disabled = true;
      window.RateLimiter.allowCall().then(function (res) {
        validateButton.disabled = false;
        if (!res.allowed) {
          inlineError.textContent = 'You have reached the maximum of 10 validations in 24 hours.';
          inlineError.classList.remove('hidden');
          inlineError.classList.add('fade-in');
          return;
        }
        // allowed -> proceed with request
        const request = {
          number: phone,
          output_format: "NATIONAL",
          cache_value_days: 0,
          country_iso: country_iso,
          get_ported_date: true,
          get_disposable_number: true,
          supplementary_live_status: {
            mobile: country_iso === "USA"? [country_iso] : [],
            landline: country_iso === "GBR" ? [country_iso] : []
          }
        };
        phoneValidation.validatePhone(request);
      }).catch(function () {
        // on error of rate limiter (e.g., IP fetch), proceed to avoid blocking user
        validateButton.disabled = false;
        const request = {
          number: phone,
          output_format: "NATIONAL",
          cache_value_days: 0,
          country_iso: country_iso,
          get_ported_date: true,
          get_disposable_number: true,
          supplementary_live_status: {
            mobile: country_iso === "USA"? [country_iso] : [],
            landline: country_iso === "GBR" ? [country_iso] : []
          }
        };
        phoneValidation.validatePhone(request);
      });
      return;
    }
    const request = {
      number: phone,
      output_format: "NATIONAL",
      cache_value_days: 0,
      country_iso: country_iso,
      get_ported_date: true,
      get_disposable_number: true,
      supplementary_live_status: {
        mobile: country_iso === "USA"? [country_iso] : [],
        landline: country_iso === "GBR" ? [country_iso] : []
      }
    };
    phoneValidation.validatePhone(request);
  });

  // Listen for post-validation event
  const attachPostValidation = () => {
    if (!phoneValidation) return;
    phoneValidation.events.on('post-validation', function (result) {
    const resultBody = document.getElementById('phone-validation-result-body');
    resultContainer.classList.remove('hidden');
    resultBody.innerHTML = '';

    // Display main result fields
    const keyMapping = {
      'result.number': 'Phone Number',
      'result.validated_phone_number': 'Validated Phone Number',
      'result.formatted_phone_number': 'Formatted Phone Number',
      'result.phone_type': 'Type',
      'result.confidence': 'Confidence',
      'result.ported_date': 'Ported Date',
      'result.disposable_number': 'Disposable number'
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
        labelCell.className = 'result-label-cell';
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
          labelCell.className = 'result-label-cell';
          const valueCell = document.createElement('td');
          valueCell.innerText = metadata[metaKey];
          row.appendChild(labelCell);
          row.appendChild(valueCell);
          resultBody.appendChild(row);
        }
      }
    }
    });
  };
  window.addEventListener('validation-token-set', attachPostValidation, { once: true });

  // Listen for validation-error event
  const attachValidationError = () => {
    if (!phoneValidation) return;
    phoneValidation.events.on('validation-error', function (error) {
      resultContainer.classList.remove('hidden');
      resultContainer.innerText = `Error: ${error}`;
      inlineError.textContent = '';
      inlineError.classList.add('hidden');
      inlineError.classList.remove('fade-in');
    });
  };
  window.addEventListener('validation-token-set', attachValidationError, { once: true });

  // Clear error when selecting a country
  countryDropdown.addEventListener('change', () => {
    if (countryDropdown.value) {
      inlineError.textContent = '';
      inlineError.classList.add('hidden');
      inlineError.classList.remove('fade-in');
    }
  });
});