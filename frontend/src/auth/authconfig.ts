import { LogLevel } from "@azure/msal-browser";

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 * ---
 * These also contain the locally hosted version and the the development version, which is hosted separately.
 * If you want to keep testing, I wouldn't remove it.
 */

export const msalConfig = {
    auth: {
        clientId: "67a86d1c-e99b-4b9b-968f-5ac10a21bc5e",
        authority:
            "https://login.microsoftonline.com/a7262e59-1b56-4f5a-a412-6f07181f48ee",
        redirectUri:
            window.location.hostname === "localhost"
                ? "http://localhost:3000/"
                : window.location.hostname === "dev-biddit.netlify.app"
                    ? "https://dev-biddit.netlify.app/"
                    : "https://biddit.app/",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level: any, message: any, containsPii: any) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

export const loginRequest = {
    scopes: ["User.Read"],
};
