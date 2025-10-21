document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('email');
  const validateButton = document.getElementById('validate-email-button');
  const resultContainer = document.getElementById('email-validation-result');

  // Initialize EmailValidation with the token
  let emailValidation;

  function initEmailValidation(token) {
    emailValidation = new EmailValidation({ token });
  }

  let token = localStorage.getItem('validation-token');
  if (token) {
    initEmailValidation(token);
  } else {
    token = localStorage.getItem('validation-token');
    initEmailValidation(token);
  }

  validateButton.addEventListener('click', function () {
    const email = emailInput.value;
    emailValidation.validateEmail(email);
  });

  // Listen for post-validation event
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

  // Listen for validation-error event
  emailValidation.events.on('validation-error', function (error) {
    resultContainer.classList.remove('hidden');
    resultContainer.innerText = `Error: ${error}`;
  });

  // Add click event listener to the validate button
  validateButton.addEventListener('click', function () {
    const email = emailInput.value;
    emailValidation.validateEmail(email);
  });
});