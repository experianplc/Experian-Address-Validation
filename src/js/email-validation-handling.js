document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('email');
  const validateButton = document.getElementById('email-validation-trigger');
  const resultContainer = document.getElementById('email-validation-result');
  
  // Inline error element for empty email input
  let inlineError = document.getElementById('email-validation-error');
  if (!inlineError) {
    inlineError = document.createElement('div');
    inlineError.id = 'email-validation-error';
    inlineError.className = 'validation-inline-error hidden';
    emailInput.insertAdjacentElement('afterend', inlineError);
  }

  // Initialize EmailValidation only after token entered
  let emailValidation;
  function initEmailValidation(token) {
    emailValidation = new EmailValidation({ token });
  }

  window.addEventListener('validation-token-set', (e) => {
    initEmailValidation(e.detail.token);
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

  // Add Enter key support for email input
  if (emailInput) {
    emailInput.addEventListener('keypress', function(event) {
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
      const email = emailInput.value;
    if (!emailValidation) {
      alert('Please enter a token first.');
      return;
    }
    // Empty email check
    if (!email.trim()) {
      inlineError.textContent = 'Please enter an email address before validating.';
      inlineError.classList.remove('hidden');
      inlineError.classList.add('fade-in');
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
          return;
        }
        emailValidation.validateEmail(email);
      }).catch(function () {
        // if rate limiter fails, allow request to proceed
        validateButton.style.opacity = '1';
        validateButton.style.pointerEvents = 'auto';
        emailValidation.validateEmail(email);
      });
      return;
    }
    emailValidation.validateEmail(email);
    });
  }

  // Listen for post-validation event (after initialization)
  const attachPostValidation = () => {
    if (!emailValidation) return;
    emailValidation.events.on('post-validation', function (result) {
    const resultBody = document.getElementById('validation-result-body');

    // Remove the hidden class to make the result table visible
    resultContainer.classList.remove('hidden');
    resultBody.innerHTML = '';
      inlineError.textContent = '';
      inlineError.classList.add('hidden');
      inlineError.classList.remove('fade-in');

    // Ensure content is visible when results are populated
    const contentDiv = resultContainer.querySelector('.content');
    if (contentDiv) {
      contentDiv.style.display = 'block';
    }

    // Map JSON keys to user-friendly labels
    const keyMapping = {
      'result.email': 'Email',
      'result.confidence': 'Status',
      'result.verbose_output': 'Verbose Output',
      'metadata.domain_detail.type': 'Type'
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

        row.appendChild(labelCell);
        row.appendChild(valueCell);
        resultBody.appendChild(row);
      }
    }
    });
  };
  window.addEventListener('validation-token-set', attachPostValidation, { once: true });

  // Listen for validation-error event
  const attachValidationError = () => {
    if (!emailValidation) return;
    emailValidation.events.on('validation-error', function (error) {
      resultContainer.classList.remove('hidden');
      resultContainer.innerText = `Error: ${error}`;
        inlineError.textContent = '';
        inlineError.classList.add('hidden');
        inlineError.classList.remove('fade-in');
    });
  };
  window.addEventListener('validation-token-set', attachValidationError, { once: true });
  
    // Clear inline error while typing
    emailInput.addEventListener('input', () => {
      if (emailInput.value.trim()) {
        inlineError.textContent = '';
        inlineError.classList.add('hidden');
        inlineError.classList.remove('fade-in');
      }
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