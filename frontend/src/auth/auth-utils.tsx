import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest } from "./authconfig";

export const useAuthService = () => {
    const { instance, accounts } = useMsal();
    const handleLogin = async (redirectUrl = window.location.pathname) => {
        await instance.loginPopup(loginRequest).catch(e => {
            console.error(e);
        });

        await requestToken(redirectUrl);
    };

    const handleLogout = async (redirectUrl: string) => {
        await instance.logout();
        removeToken()
        window.location.href = redirectUrl;
    }

    const isLoggedIn = () => {
        return accounts.length > 0;
    }

    const requestToken = async (redirectUrl = window.location.pathname) => {

        if (accounts.length === 0) return null;

        const accessTokenRequest = {
            scopes: ["https://integration.unisg.ch/api/user_impersonation"],
            account: accounts[0],
        };
        try {
            const accessTokenResponse = await instance.acquireTokenSilent(accessTokenRequest);
            storeToken(accessTokenResponse.accessToken);
            window.location.href = redirectUrl;
        } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
                try {
                    const accessTokenResponse = await instance.acquireTokenPopup(accessTokenRequest);
                    storeToken(accessTokenResponse.accessToken);
                    window.location.href = redirectUrl;
                } catch (popupError) {
                    console.log(popupError);
                }
            } else {
                console.log(error);
            }
        }
    }

    return { handleLogin, handleLogout, isLoggedIn, requestToken };
};

function storeToken(token: string) {
    localStorage.setItem("access_token", token);
}

function removeToken() {
    localStorage.removeItem("access_token");
}

function doesTokenExist() {
    return localStorage.getItem("access_token") !== null;
}

function getToken() {
    return localStorage.getItem("access_token");
}