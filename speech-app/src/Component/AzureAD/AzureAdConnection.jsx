import React from 'react';
import { AzureAD, AuthenticationState } from 'react-aad-msal';
import { useNavigate } from 'react-router-dom';
import { Routess } from '../../routes';
import { authProvider } from './authProvider';
import { Container, Grid, Typography, Button } from '@material-ui/core';
// import backgroundImg from './images/glambackground.jpg'; // Adjust the path accordingly
import "./Component/SpeechAnalytics/App.css";
import { useDispatch } from 'react-redux';

function AzureAdConnection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div className="App" style={{ backgroundImage: `url(images/glambackground.jpg)`, backgroundSize: 'cover', minHeight: '100vh' }}>
      <AzureAD provider={authProvider}>
        {({ authenticationState, login, logout, accountInfo}) => {
          if (authenticationState === AuthenticationState.Authenticated) {
            dispatch({ type: 'SET_ACCOUNT_INFO', payload: accountInfo });
            localStorage.setItem('accountInfo', JSON.stringify(accountInfo));
            navigate(Routess.Home); // Navigate to the Home route
          }

          switch (authenticationState) {
            case AuthenticationState.Unauthenticated:
              return (
                <div className='containerL'>
                  <Container component="main" maxWidth="md">
                    <Grid container direction="column" alignItems="center" spacing={2}>
                      <Grid item>
                        <img style={{ height: "15vh", width: "6vw" }} src='/images/glamlogo.png' alt="Logo" />
                      </Grid>
                      <Grid item>
                        <Typography variant="h5" style={{textShadow:"0px 1px 5px black"}}>VACH</Typography>
                      </Grid>
                      <Grid item>
                        <Button variant="contained" color="primary" onClick={login}>Sign In</Button>
                      </Grid>
                    </Grid>
                  </Container>
                </div>
              );
            // Handle other cases here
            default:
              return null;
          }
        }}
      </AzureAD>
    </div>
  );
}

export default AzureAdConnection;
