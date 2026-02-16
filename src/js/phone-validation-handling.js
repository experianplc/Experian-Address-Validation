document.addEventListener('DOMContentLoaded', function () {
  const phoneInput = document.getElementById('phone');
  const validateButton = document.getElementById('phone-validation-trigger');
  const resultContainer = document.getElementById('phone-validation-result');
  const countryDropdown = document.getElementById('country-code');

  // Inline error element (created once)
  let inlineError = document.getElementById('phone-validation-error');
  if (!inlineError) {
    inlineError = document.createElement('div');
    inlineError.id = 'phone-validation-error';
    inlineError.className = 'validation-inline-error hidden';
    phoneInput.insertAdjacentElement('afterend', inlineError);
  }

  // Initialize PhoneValidation only after token entered
  let phoneValidation;
  function initPhoneValidation(token) {
    phoneValidation = new PhoneValidation({ token });
  }

  window.addEventListener('validation-token-set', (e) => {
    initPhoneValidation(e.detail.token);
  }, { once: true });

  // Enable validation button after token provided
  let isTokenSet = false;
  window.addEventListener('validation-token-set', () => {
    isTokenSet = true;
    if (validateButton) {
      validateButton.style.opacity = '1';
      validateButton.style.pointerEvents = 'auto';
    }
  }, { once: true });

  // Initially disable the button visually
  if (validateButton) {
    validateButton.style.opacity = '0.6';
    validateButton.style.pointerEvents = 'none';
  }

  // Add Enter key support for phone input
  if (phoneInput) {
    phoneInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (validateButton) {
          validateButton.click();
        }
      }
    });
  }

  if (validateButton) {
    validateButton.addEventListener('click', function () {
      if (!isTokenSet) {
        alert('Please enter a token first.');
        return;
      }
      const phone = phoneInput.value;
      const country_iso = countryDropdown.value;
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
      validateButton.style.opacity = '0.6';
      validateButton.style.pointerEvents = 'none';
      window.RateLimiter.allowCall().then(function (res) {
        validateButton.style.opacity = '1';
        validateButton.style.pointerEvents = 'auto';
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
        validateButton.style.opacity = '1';
        validateButton.style.pointerEvents = 'auto';
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
  }

  // Listen for post-validation event
  const attachPostValidation = () => {
    if (!phoneValidation) return;
    phoneValidation.events.on('post-validation', function (result) {
    const resultBody = document.getElementById('phone-validation-result-body');
    resultContainer.classList.remove('hidden');
    resultBody.innerHTML = '';

    // Ensure content is visible when results are populated
    const contentDiv = resultContainer.querySelector('.content');
    if (contentDiv) {
      contentDiv.style.display = 'block';
    }

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

  // Add collapsible functionality to validation result header
  const phoneResultHeader = resultContainer.querySelector('h2');
  if (phoneResultHeader) {
    phoneResultHeader.addEventListener('click', function() {
      const contentDiv = resultContainer.querySelector('.content');
      if (contentDiv) {
        if (contentDiv.style.display === 'none') {
          contentDiv.style.display = 'block';
          phoneResultHeader.classList.remove('collapsed');
        } else {
          contentDiv.style.display = 'none';
          phoneResultHeader.classList.add('collapsed');
        }
      }
    });
  }
});