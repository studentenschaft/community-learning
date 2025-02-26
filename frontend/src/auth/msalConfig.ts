import { Configuration, PublicClientApplication } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "67a86d1c-e99b-4b9b-968f-5ac10a21bc5e",
    authority: "https://login.microsoftonline.com/a7262e59-1b56-4f5a-a412-6f07181f48ee",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);