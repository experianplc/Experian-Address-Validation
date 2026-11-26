(function () {
  function relocateMetadataPanel() {
    var leftColumn = document.querySelector('.left-column');
    var resultsColumn = document.querySelector('.results-column');
    if (!leftColumn || !resultsColumn) {
      return;
    }

    // On desktop, the visual results live inside the Visual/JSON tab panel rather than
    // directly in the results column, so relocation needs to target that container.
    var desktopContainer = resultsColumn.querySelector('.visual-view-panel') || resultsColumn;

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

    if (!mobile && metadata.parentElement !== desktopContainer) {
      desktopContainer.insertAdjacentElement('afterbegin', metadata);
    }

    if (!mobile && emailValidationResult && emailValidationResult.parentElement !== desktopContainer) {
      if (metadata && metadata.parentElement === desktopContainer) {
        metadata.insertAdjacentElement('afterend', emailValidationResult);
      } else {
        desktopContainer.insertAdjacentElement('afterbegin', emailValidationResult);
      }
    }

    if (!mobile && phoneValidationResult && phoneValidationResult.parentElement !== desktopContainer) {
      if (emailValidationResult && emailValidationResult.parentElement === desktopContainer) {
        emailValidationResult.insertAdjacentElement('afterend', phoneValidationResult);
      } else if (metadata && metadata.parentElement === desktopContainer) {
        metadata.insertAdjacentElement('afterend', phoneValidationResult);
      } else {
        desktopContainer.insertAdjacentElement('beforeend', phoneValidationResult);
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
