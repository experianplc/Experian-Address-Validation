document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('email');
  const validateButton = document.getElementById('email-validate-button');
  const resultContainer = document.getElementById('email-validation-result');
  
  // Inline error element for empty email input
  let inlineError = document.getElementById('email-validation-error');
  if (!inlineError) {
    inlineError = document.createElement('div');
    inlineError.id = 'email-validation-error';
    inlineError.className = 'validation-inline-error hidden';
    emailInput.insertAdjacentElement('afterend', inlineError);
  }

  // Suggestion dropdown for "did you mean"
  let suggestionDropdown = document.getElementById('email-suggestion-dropdown');
  if (!suggestionDropdown) {
    suggestionDropdown = document.createElement('div');
    suggestionDropdown.id = 'email-suggestion-dropdown';
    suggestionDropdown.className = 'email-suggestions hidden';
    emailInput.insertAdjacentElement('afterend', suggestionDropdown);
  }

  let responseIndicator = document.getElementById('email-response-indicator');
  if (!responseIndicator) {
    responseIndicator = document.createElement('div');
    responseIndicator.id = 'email-response-indicator';
    responseIndicator.className = 'validation-response-indicator hidden';
    suggestionDropdown.insertAdjacentElement('afterend', responseIndicator);
  }

  const setResponseIndicator = (message, tone) => {
    responseIndicator.classList.remove('hidden', 'is-success', 'is-warning', 'is-error', 'is-info');
    responseIndicator.classList.add(`is-${tone}`);
    responseIndicator.textContent = message;
  };

  const clearResponseIndicator = () => {
    responseIndicator.textContent = '';
    responseIndicator.classList.add('hidden');
    responseIndicator.classList.remove('is-success', 'is-warning', 'is-error', 'is-info');
  };

  // Initialize EmailValidation only after token entered
  let emailValidation;
  let isTokenSet = false;
  let postValidationAttached = false;
  let validationErrorAttached = false;

  function initEmailValidation(token) {
    emailValidation = new EmailValidation({ token });
  }

  // Initially disable the button visually
  if (validateButton) {
    validateButton.style.opacity = '0.6';
    validateButton.style.pointerEvents = 'none';
  }

  let lastValidationTriggerAt = 0;
  const triggerEmailValidation = () => {
    if (!validateButton || !isTokenSet) {
      return;
    }

    const now = Date.now();
    if (now - lastValidationTriggerAt < 250) {
      return;
    }

    lastValidationTriggerAt = now;
    validateButton.click();
  };

  // Add Enter key and blur support for email input validation
  if (emailInput) {
    emailInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        emailInput.blur();
        triggerEmailValidation();
      }
    });

    emailInput.addEventListener('blur', function() {
      triggerEmailValidation();
    });
    
    // Reset progress bar when user focuses on email input
    emailInput.addEventListener('focus', function() {
      if (isTokenSet && typeof setProgress === 'function') {
        setProgress(1, 2);
      }
    });
  }

  if (validateButton) {
    validateButton.addEventListener('click', function () {
      const email = emailInput.value;
    // Empty email check
    if (!email.trim()) {
      inlineError.textContent = 'Please enter an email address before validating.';
      inlineError.classList.remove('hidden');
      inlineError.classList.add('fade-in');
      clearResponseIndicator();
      return;
    } else {
      inlineError.textContent = '';
      inlineError.classList.add('hidden');
      inlineError.classList.remove('fade-in');
    }
    // Rate limit check
    if (window.RateLimiter && typeof window.RateLimiter.allowCall === 'function') {
      validateButton.style.opacity = '0.6';
      validateButton.style.pointerEvents = 'none';
      window.RateLimiter.allowCall().then(function (res) {
        validateButton.style.opacity = '1';
        validateButton.style.pointerEvents = 'auto';
        if (!res.allowed) {
          inlineError.textContent = 'You have reached the maximum of 10 validations in 24 hours.';
          inlineError.classList.remove('hidden');
          inlineError.classList.add('fade-in');
          setResponseIndicator('Validation blocked: daily limit reached.', 'error');
          return;
        }
        setResponseIndicator('Validating email...', 'info');
        emailValidation.validateEmail(email);
      }).catch(function () {
        // if rate limiter fails, allow request to proceed
        validateButton.style.opacity = '1';
        validateButton.style.pointerEvents = 'auto';
        setResponseIndicator('Validating email...', 'info');
        emailValidation.validateEmail(email);
      });
      return;
    }
    setResponseIndicator('Validating email...', 'info');
    emailValidation.validateEmail(email);
    });
  }

  // Listen for post-validation event (after initialization)
  const attachPostValidation = () => {
    if (!emailValidation || postValidationAttached) return;
    postValidationAttached = true;
    emailValidation.events.on('post-validation', function (result) {
    if (typeof setValidatedAddressInfoContentVisible === 'function') {
      setValidatedAddressInfoContentVisible(false);
    }
    const phoneResult = document.querySelector('#phone-validation-result');
    if (phoneResult) {
      const phoneContent = phoneResult.querySelector('.content');
      if (phoneContent) {
        phoneContent.style.display = 'none';
      }
    }

    const resultBody = document.getElementById('validation-result-body');

    // Remove the hidden class to make the result table visible
    resultContainer.classList.remove('hidden');
    resultBody.innerHTML = '';
      inlineError.textContent = '';
      inlineError.classList.add('hidden');
      inlineError.classList.remove('fade-in');

    const confidence = (result.result && result.result.confidence) || 'Unknown';
    const confidenceText = String(confidence).toLowerCase();
    const indicatorTone = confidenceText.includes('unverified') || confidenceText.includes('invalid') || confidenceText.includes('failed')
      ? 'error'
      : confidenceText.includes('verified') || confidenceText.includes('valid')
        ? 'success'
        : confidenceText.includes('risky') || confidenceText.includes('unknown')
          ? 'warning'
          : 'info';
    setResponseIndicator(`Email status: ${confidence}`, indicatorTone);

    // Handle "did you mean" suggestions
    if (result.result && result.result.did_you_mean && result.result.did_you_mean.length > 0) {
      suggestionDropdown.innerHTML = '';
      suggestionDropdown.classList.remove('hidden');
      
      result.result.did_you_mean.forEach(function(suggestion) {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = 'Did you mean: ' + suggestion;
        suggestionItem.style.cursor = 'pointer';
        suggestionItem.addEventListener('click', function() {
          emailInput.value = suggestion;
          suggestionDropdown.classList.add('hidden');
          suggestionDropdown.innerHTML = '';
        });
        suggestionDropdown.appendChild(suggestionItem);
      });
    } else {
      suggestionDropdown.classList.add('hidden');
      suggestionDropdown.innerHTML = '';
    }

    // Ensure content is visible when results are populated
    const contentDiv = resultContainer.querySelector('.content');
    if (contentDiv) {
      contentDiv.style.display = 'block';
    }

    // Update progress bar to complete
    if (typeof setProgress === 'function') {
      setProgress(2, 2);
    }

    // Map JSON keys to user-friendly labels
    const keyMapping = {
      'result.email': 'Email',
      'result.confidence': 'Status',
      'result.verbose_output': 'Verbose Output',
      'metadata.domain_detail.type': 'Type'
    };

    const definitionMapping = {
      verified: 'Mailbox exists, is reachable, and not known to be illegitimate or disposable.',
      mailboxDisabled: 'The user mailbox has been disabled.',
      mailboxDoesNotExist: 'The user mailbox does not exist at this domain.',
      mailboxFull: 'The user mailbox is full.',
      syntaxFailure: 'The syntax of the email address is incorrect.',
      unreachable: 'The domain is not responding to validation requests or does not have any active mail servers.',
      unresolvable: 'The domain cannot be resolved.',
      illegitimate: 'Seed, spamtrap, black hole, technical role account or inactive domain.',
      roleAccount: 'Role accounts such as support@, sales@, info@.',
      typoDomain: 'The domain was close to a common domain and although it exists, it is highly unlikely to be correct.',
      localPartSpamTrap: 'Known local portions of the email address that may indicate spam traps.',
      profanity: 'The email address contains profanity.',
      disposable: 'Belongs to a disposable email address provider.',
      unknown: "The address doesn't appear to be nefarious (as far as we know), but we can't determine if it is deliverable or not.",
      timeout: 'The request timed out due to the host domain not responding in time.',
      acceptAll: 'The domain is accept-all, so the username cannot be validated.',
      relayDenied: 'The result was validated at the incorrect mail exchanger.'
    };

    // Helper function to get nested values
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((acc, key) => acc && acc[key], obj);
    };

    // Add rows for each key-value pair
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
        if (label === 'Status') {
          valueCell.classList.add('result-value-alert');
        }

        row.appendChild(labelCell);
        row.appendChild(valueCell);
        resultBody.appendChild(row);
      }
    }

    const verboseOutput = String((result.result && result.result.verbose_output) || '').trim();
    if (verboseOutput) {
      const definitionRow = document.createElement('tr');

      const definitionLabelCell = document.createElement('td');
      definitionLabelCell.innerText = 'Definition';
      definitionLabelCell.className = 'result-label-cell';

      const definitionCell = document.createElement('td');
      definitionCell.innerText = definitionMapping[verboseOutput] || verboseOutput;

      definitionRow.appendChild(definitionLabelCell);
      definitionRow.appendChild(definitionCell);
      resultBody.appendChild(definitionRow);
    }
    });
  };

  // Listen for validation-error event
  const attachValidationError = () => {
    if (!emailValidation || validationErrorAttached) return;
    validationErrorAttached = true;
    emailValidation.events.on('validation-error', function (error) {
      resultContainer.classList.remove('hidden');
      resultContainer.innerText = `Error: ${error}`;
        inlineError.textContent = '';
        inlineError.classList.add('hidden');
        inlineError.classList.remove('fade-in');
        setResponseIndicator('Email validation failed. Please try again.', 'error');
    });
  };

  const applyValidationToken = (token) => {
    initEmailValidation(token);
    isTokenSet = true;
    if (validateButton) {
      validateButton.style.opacity = '1';
      validateButton.style.pointerEvents = 'auto';
    }
    attachPostValidation();
    attachValidationError();
  };

  window.addEventListener('validation-token-set', (e) => {
    applyValidationToken(e.detail.token);
  });

  // Bootstrap from current token state in case the token event fired before this module initialized.
  if (window.__validationToken !== undefined && window.__validationToken !== null) {
    applyValidationToken(window.__validationToken);
  }
  
    // Clear inline error while typing
    emailInput.addEventListener('input', () => {
      if (emailInput.value.trim()) {
        inlineError.textContent = '';
        inlineError.classList.add('hidden');
        inlineError.classList.remove('fade-in');
      }
      clearResponseIndicator();
      // Also clear suggestions when user starts typing again
      suggestionDropdown.classList.add('hidden');
      suggestionDropdown.innerHTML = '';
    });

    // Add collapsible functionality to validation result header
    const emailResultHeader = resultContainer.querySelector('h2');
    if (emailResultHeader) {
      emailResultHeader.addEventListener('click', function() {
        const contentDiv = resultContainer.querySelector('.content');
        if (contentDiv) {
          if (contentDiv.style.display === 'none') {
            contentDiv.style.display = 'block';
            emailResultHeader.classList.remove('collapsed');
          } else {
            contentDiv.style.display = 'none';
            emailResultHeader.classList.add('collapsed');
          }
        }
      });
    }

});