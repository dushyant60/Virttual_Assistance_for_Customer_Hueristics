import { MsalAuthProvider, LoginType } from 'react-aad-msal';

// Msal Configurations
const config = {
  auth: {
    authority: 'https://login.microsoftonline.com/7785f07f-dd97-47c7-83b8-597d86552fdc',
    // clientId:'29531049-3eb0-417a-8655-d6faf4007758', for deployment
    clientId: 'd0570d5a-2931-4649-a930-180410809b1a',
    // redirectUri: 'https://glam.onelogicacom/' for deployemnt
    redirectUri:"http://localhost:3000/"
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true
  }
};

// Authentication Parameters
const authenticationParameters = {
  scopes: [
    'user.read'
  ]
}

// Options
const options = {
  loginType: LoginType.Redirect, // Use uppercase POPUP instead of Popup
  tokenRefreshUri: window.location.origin + '/auth.html'
}

export const authProvider = new MsalAuthProvider(config, authenticationParameters, options);
