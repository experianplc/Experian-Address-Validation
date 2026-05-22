(function () {
  function relocateMetadataPanel() {
    var leftColumn = document.querySelector('.left-column');
    var resultsColumn = document.querySelector('.results-column');
    if (!leftColumn || !resultsColumn) {
      return;
    }

    var metadata = document.querySelector('.metadata');
    if (!metadata) {
      return;
    }

    var mobile = window.matchMedia('(max-width: 768px)').matches;
    var addressFormPanel = leftColumn.querySelector('.address-form-panel');
    var emailHeaderButton = leftColumn.querySelector('#email-header-button');
    var emailValidationPanel = emailHeaderButton ? emailHeaderButton.parentElement : null;
    var emailValidationResult = document.querySelector('#email-validation-result');
    var phoneValidationResult = document.querySelector('#phone-validation-result');

    if (mobile && addressFormPanel && metadata.parentElement !== leftColumn) {
      addressFormPanel.insertAdjacentElement('afterend', metadata);
    }

    if (mobile && emailValidationPanel && emailValidationResult && emailValidationResult.parentElement !== leftColumn) {
      emailValidationPanel.insertAdjacentElement('afterend', emailValidationResult);
    }

    if (!mobile && metadata.parentElement !== resultsColumn) {
      resultsColumn.insertAdjacentElement('afterbegin', metadata);
    }

    if (!mobile && emailValidationResult && emailValidationResult.parentElement !== resultsColumn) {
      if (metadata && metadata.parentElement === resultsColumn) {
        metadata.insertAdjacentElement('afterend', emailValidationResult);
      } else {
        resultsColumn.insertAdjacentElement('afterbegin', emailValidationResult);
      }
    }

    if (!mobile && phoneValidationResult && phoneValidationResult.parentElement !== resultsColumn) {
      if (emailValidationResult && emailValidationResult.parentElement === resultsColumn) {
        emailValidationResult.insertAdjacentElement('afterend', phoneValidationResult);
      } else if (metadata && metadata.parentElement === resultsColumn) {
        metadata.insertAdjacentElement('afterend', phoneValidationResult);
      } else {
        resultsColumn.insertAdjacentElement('beforeend', phoneValidationResult);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', relocateMetadataPanel);
  } else {
    relocateMetadataPanel();
  }

  window.addEventListener('resize', relocateMetadataPanel);
}());
