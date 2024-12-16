export const api=process.env.REACT_APP_API

// authConfig.js

export const msalConfig = {
    auth: {
      clientId: 'd0570d5a-2931-4649-a930-180410809b1a',
      authority: 'https://login.microsoftonline.com/common/',
      redirectUri: 'http://localhost:3000', // Redirect URL after login
    },
    cache: {
      cacheLocation: 'localStorage', // Use 'sessionStorage' if needed
      storeAuthStateInCookie: false,
    },
  };
  