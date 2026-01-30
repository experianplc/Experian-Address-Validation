document.addEventListener('DOMContentLoaded', function() {
  // Add collapsible functionality to validation header buttons
  const addressHeaderButton = document.getElementById('address-header-button');
  const emailHeaderButton = document.getElementById('email-header-button');
  const phoneHeaderButton = document.getElementById('phone-header-button');
  const searchTypeHeaderButton = document.getElementById('search-type-header-button');

  const addressContent = document.getElementById('address-validation-content');
  const emailContent = document.getElementById('email-validation-content');
  const phoneContent = document.getElementById('phone-validation-content');
  const searchTypeContent = document.getElementById('search-type-content');

  if (addressHeaderButton && addressContent) {
    addressHeaderButton.addEventListener('click', function() {
      if (addressContent.classList.contains('hidden')) {
        addressContent.classList.remove('hidden');
        addressHeaderButton.classList.remove('collapsed');
      } else {
        addressContent.classList.add('hidden');
        addressHeaderButton.classList.add('collapsed');
      }
    });
  }

  if (emailHeaderButton && emailContent) {
    const emailResultPanel = document.getElementById('email-validation-result');
    emailHeaderButton.addEventListener('click', function() {
      if (emailContent.classList.contains('hidden')) {
        emailContent.classList.remove('hidden');
        emailHeaderButton.classList.remove('collapsed');
        if (emailResultPanel) {
          emailResultPanel.classList.remove('hidden');
        }
      } else {
        emailContent.classList.add('hidden');
        emailHeaderButton.classList.add('collapsed');
        if (emailResultPanel) {
          emailResultPanel.classList.add('hidden');
        }
      }
    });
  }

  if (phoneHeaderButton && phoneContent) {
    const phoneResultPanel = document.getElementById('phone-validation-result');
    phoneHeaderButton.addEventListener('click', function() {
      if (phoneContent.classList.contains('hidden')) {
        phoneContent.classList.remove('hidden');
        phoneHeaderButton.classList.remove('collapsed');
        if (phoneResultPanel) {
          phoneResultPanel.classList.remove('hidden');
        }
      } else {
        phoneContent.classList.add('hidden');
        phoneHeaderButton.classList.add('collapsed');
        if (phoneResultPanel) {
          phoneResultPanel.classList.add('hidden');
        }
      }
    });
  }

  if (searchTypeHeaderButton && searchTypeContent) {
    searchTypeHeaderButton.addEventListener('click', function() {
      if (searchTypeContent.classList.contains('hidden')) {
        searchTypeContent.classList.remove('hidden');
        searchTypeHeaderButton.classList.remove('collapsed');
        const defaultTypes = document.querySelectorAll('.show-by-default');
        defaultTypes.forEach(function(element) {
          element.classList.remove('hidden');
        });
        const otherTypes = document.querySelectorAll('.other-search-types');
        otherTypes.forEach(function(element) {
          element.classList.add('hidden');
        });
      } else {
        searchTypeContent.classList.add('hidden');
        searchTypeHeaderButton.classList.add('collapsed');
      }
    });
  }

  const toggleOtherSearchTypesLink = document.getElementById('toggle-other-search-types');
  if (toggleOtherSearchTypesLink) {
    toggleOtherSearchTypesLink.addEventListener('click', function(e) {
      e.preventDefault();
      const otherTypes = document.querySelectorAll('.other-search-types');
      const isCurrentlyHidden = otherTypes[0] && otherTypes[0].classList.contains('hidden');
      
      otherTypes.forEach(function(element) {
        if (isCurrentlyHidden) {
          element.classList.remove('hidden');
        } else {
          element.classList.add('hidden');
        }
      });
      
      if (isCurrentlyHidden) {
        toggleOtherSearchTypesLink.textContent = 'Hide other search types';
      } else {
        toggleOtherSearchTypesLink.textContent = 'Other search types';
      }
    });
  }
});
