let oktaAuth;

function getOktaAuthClient() {
    if (!oktaAuth) {
        oktaAuth = new OktaAuth({
            issuer: '%OKTA_ISSUER%',
            clientId: '%OKTA_CLIENT_ID%',
            redirectUri: '%OKTA_REDIRECT_URI%',
            responseType: 'code',
            state: 'test',
            pkce: false,
        });
    }

    return oktaAuth;
}

async function loginOktaUser() {
    try {
        const client = getOktaAuthClient();

        if (client.isLoginRedirect()) {
            return;
        }

        const tokens = await client.tokenManager.getTokens();
        if (tokens?.accessToken && tokens?.idToken) {
            return tokens;
        }

        client.token.getWithRedirect();
    } catch (error) {
        console.error('Okta login initialization failed:', error);
    }
}

var employeeLoginBtn = document.getElementById('employeelogin');
if (employeeLoginBtn) {
    employeeLoginBtn.addEventListener('click', function(event) {
        event.preventDefault();
        loginOktaUser().then(console.log);
    });
}

window.loginOktaUser = loginOktaUser;

(function () {
    // Parse query parameters
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
        return;
    }

    document.cookie = `EAVDVSCookie=${code}; path=/;`;
    // Remove query from address bar
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    const applyOktaToken = () => {
        if (window.setTokenForAddressValidation) {
            window.setTokenForAddressValidation("okta");
            return true;
        } else {
            console.error("Experian script not loaded!");
            return false;
        }
    };

    const applyOktaTokenWithRetry = () => {
        if (applyOktaToken()) {
            return;
        }

        let attempts = 0;
        const maxAttempts = 20;
        const retryDelayMs = 50;

        const retryId = window.setInterval(() => {
            attempts += 1;
            if (applyOktaToken() || attempts >= maxAttempts) {
                window.clearInterval(retryId);
                if (attempts >= maxAttempts) {
                    // Fallback: still notify listeners so email/phone buttons can be enabled.
                    window.__validationToken = 'okta';
                    window.dispatchEvent(new CustomEvent('validation-token-set', { detail: { token: 'okta' } }));
                }
            }
        }, retryDelayMs);
    };

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', applyOktaTokenWithRetry, { once: true });
    } else {
        applyOktaTokenWithRetry();
    }

})();