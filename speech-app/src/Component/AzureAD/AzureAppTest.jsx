import React from 'react';
import { MsalProvider, MsalAuthenticationTemplate, useMsal } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../../config';

const pca = new PublicClientApplication(msalConfig);

const AuthButton = () => {
  const { instance, accounts } = useMsal();

  const handleLogin = async () => {
    await instance.loginRedirect();
  };

  const handleLogout = () => {
    instance.logoutRedirect({ account: accounts[0] });
  };

  return (
    <div>
      {accounts.length === 0 ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}
    </div>
  );
};

function AzureAppTest() {
  return (
    <MsalProvider instance={pca}>
      <div className="App">
        <header className="App-header">
          <h1>React Azure AD Integration</h1>
          <AuthButton />
        </header>
      </div>
    </MsalProvider>
  );
}

export default AzureAppTest;
