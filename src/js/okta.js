const oktaAuth = new OktaAuth({
    issuer: '%OKTA_ISSUER%',
    clientId: '%OKTA_CLIENT_ID%',
    redirectUri: '%OKTA_REDIRECT_URI%',
    responseType: 'code',
    state: 'test',
    pkce: false,
});

async function loginOktaUser() {
console.log('login okta user called');
console.log(oktaAuth.tokenManager.get('accessToken'));

    
if (oktaAuth.isLoginRedirect()) {
    console.log('coming from redirect');
    return;
  }

  // 2) Already have tokens in storage?
  console.log('getting tokens from token manager');
  const tokens = await oktaAuth.tokenManager.getTokens();
  if (tokens?.accessToken && tokens?.idToken) {
    console.log('already have tokens');
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
    console.log('check if okta code is set');
    // Parse query parameters
    const params = new URLSearchParams(window.location.search);
    const variable = params.get("code");

    if (variable) {

        console.log('variable is set');
        // Save to cookie (1 day)
        document.cookie = `EAVDVSCookie=${variable}; path=/; max-age=86400`;

        // Remove query from address bar
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
        window.dispatchEvent(new CustomEvent('validation-token-set', { detail: { token: 'null' } }));
        console.log('event dispatched ')
        window.addEventListener("DOMContentLoaded", () => {
        console.log('dom content loaded in okta js')
        if (window.setTokenForAddressValidation) {
            console.log('adding token from okta js');
            const result = window.setTokenForAddressValidation("okta");
            console.log("Experian result:", result);
        } else {
            console.error("Experian script not loaded!");
        }
    });
    }

    
    

})();