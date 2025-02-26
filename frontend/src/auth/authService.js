import * as msal from "@azure/msal-browser";

const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_AD_TENANT_ID}`,
        redirectUri: process.env.REACT_APP_AZURE_AD_REDIRECT_URI,
    },
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

export const login = async () => {
    const loginRequest = {
        scopes: ["User.Read"],
    };

    try {
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        return loginResponse;
    } catch (error) {
        console.error(error);
        throw new Error("Login failed");
    }
};

export const logout = () => {
    msalInstance.logout();
};

export const getAccessToken = async () => {
    const account = msalInstance.getAllAccounts()[0];
    if (!account) {
        throw new Error("No account found");
    }

    const tokenRequest = {
        scopes: ["User.Read"],
        account: account,
    };

    try {
        const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
        return tokenResponse.accessToken;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to acquire access token");
    }
};
