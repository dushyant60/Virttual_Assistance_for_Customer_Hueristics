import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, } from 'react-router-dom';
import { Suspense } from "react";
import './i18n';
import { Provider } from 'react-redux';
import store,{ persistor } from './Component/Redux/Store/Store';
import 'bootstrap/dist/css/bootstrap.css';
import * as serviceWorker from './phone/serviceWorker';
import LandingPg from './LandingPg';
import Navbar from './TestLms';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Suspense >
        <Provider store={store}>
        {/* <PersistGate loading={null} persistor={persistor}> */}
         {/* <Navbar/> */}
          {/* <CallTranscription/> */}
          <LandingPg/>
          {/* <QnA/> */}
          {/* <ChatApp/> */}
        {/* </PersistGate> */}
        {/* <SendOTP/> */}
        {/* <LiveCallTranscription/> */}
        </Provider>
      </Suspense>
    </Router>
 </React.StrictMode>

);
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
