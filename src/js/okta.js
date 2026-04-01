const oktaAuth = new OktaAuth({
    issuer: '%OKTA_ISSUER%',
    clientId: '%OKTA_CLIENT_ID%',
    redirectUri: '%OKTA_REDIRECT_URI%',
    responseType: 'code',
    state: 'test',
    pkce: false,
});

async function loginOktaUser() {
    
if (oktaAuth.isLoginRedirect()) {
    return;
  }

  // 2) Already have tokens in storage?
  const tokens = await oktaAuth.tokenManager.getTokens();
  if (tokens?.accessToken && tokens?.idToken) {
    return tokens;
  }

  oktaAuth.token.getWithRedirect();
}

var employeeLoginBtn = document.getElementById('employeelogin');
if (employeeLoginBtn) {
    employeeLoginBtn.addEventListener('click', function() {
        loginOktaUser().then(console.log);
    });
}

(function () {
    // Parse query parameters
    const params = new URLSearchParams(window.location.search);
    const variable = params.get("code");

    if (variable) {

        document.cookie = `EAVDVSCookie=${variable}; path=/;`;
        // Remove query from address bar
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
        window.dispatchEvent(new CustomEvent('validation-token-set', { detail: { token: 'null' } }));
        window.addEventListener("DOMContentLoaded", () => {
        if (window.setTokenForAddressValidation) {
            const result = window.setTokenForAddressValidation("okta");
        } else {
            console.error("Experian script not loaded!");
        }
    });
    }

    
    

})();