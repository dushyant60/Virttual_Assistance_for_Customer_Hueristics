
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
// import SignUp from './Component/Auth/SignUP';
// import Login from './Component/Auth/Login';

import { Routess } from './routes';
import AzureAdConnection from './AzureAdConnection';
import ChatApp from './Component/TextAnalytics/SummaryDemo';
import Chatbot from './Component/Chatbot/Chatbot';
import LandingPg from './Component/LandingPage/Landingpage';

function App() {
  const email=localStorage.getItem("email")

  return (
    <>
      <Routes>
        {/* <Route path={Routess.Signup} element={<SignUp/>}>
        </Route> */}
        <Route path={Routess.Login} element={<AzureAdConnection/>}>
        </Route>
        {/* {email != null?
       
       (  <> */}
        <Route path={Routess.Home} element={<LandingPg/>}></Route>
          {/* </> )
        :( <Route path={Routess.Login} element={<Login/>}/>)
        
        } */}
      </Routes>
      {/* <Chatbot/> */}
    </>
  );
}

export default App;
