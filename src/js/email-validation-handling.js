//import { EmailValidation } from '../ts/email-validation/email-validation';


document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.getElementById('email');
    const validateButton = document.getElementById('validate-email-button');
    const resultContainer = document.getElementById('email-validation-result');
  
    // Initialize EmailValidation with the token
    var options = {
      token: localStorage.getItem('email-validation-token')
    }

    const emailValidation = new EmailValidation(options);

    function addToken() {
      address.setToken(document.querySelector('[name="token"]').value);
      document.querySelector('main').classList.remove('inactive');
      document.querySelector('.token-prompt').classList.add('hidden');
  
      // Save the token in localStorage for next time
      if (localStorage) {
          localStorage.setItem('email-validation-token', document.querySelector('[name="token"]').value);
      }
  }
  
    validateButton.addEventListener('click', function () {
        const email = emailInput.value;
        console.log('Validate button clicked. Email:', email); // Debugging log
        emailValidation.validateEmail(email);
    });

    // Listen for post-validation event
    emailValidation.events.on('post-validation', function (result) {
      const resultBody = document.getElementById('validation-result-body');
  
      // Remove the hidden class to make the result table visible
      resultContainer.classList.remove('hidden');
      resultBody.innerHTML = ''; // Clear previous results
    
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
          labelCell.style.fontWeight = 'bold'; // Optional: Make the label bold
    
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