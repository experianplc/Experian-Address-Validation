document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('email');
  const validateButton = document.getElementById('validate-email-button');
  const resultContainer = document.getElementById('email-validation-result');

  // Initialize EmailValidation only after token entered
  let emailValidation;
  function initEmailValidation(token) {
    emailValidation = new EmailValidation({ token });
  }

  window.addEventListener('validation-token-set', (e) => {
    initEmailValidation(e.detail.token);
  }, { once: true });

  // Disable validate button until token provided
  validateButton.disabled = true;
  window.addEventListener('validation-token-set', () => {
    validateButton.disabled = false;
  }, { once: true });

  validateButton.addEventListener('click', function () {
    const email = emailInput.value;
    if (!emailValidation) {
      alert('Please enter a token first.');
      return;
    }
    emailValidation.validateEmail(email);
  });

  // Listen for post-validation event (after initialization)
  const attachPostValidation = () => {
    if (!emailValidation) return;
    emailValidation.events.on('post-validation', function (result) {
    const resultBody = document.getElementById('validation-result-body');

    // Remove the hidden class to make the result table visible
    resultContainer.classList.remove('hidden');
    resultBody.innerHTML = '';

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
        labelCell.style.fontWeight = 'bold'; 

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
    });
  };
  window.addEventListener('validation-token-set', attachValidationError, { once: true });

});