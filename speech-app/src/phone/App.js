import React, { useState } from "react";  
import "./App.css";  
import Phone from "./Phone";  
import { PhoneOutlined } from "@material-ui/icons";  
import { IconButton } from "@material-ui/core";  
  
const App = () => {  
  const [token, setToken] = useState(null);  
  const [clicked, setClicked] = useState(false);  
  const identity = "User"; // Ensure this matches the identity used in the server  
  
  const handleClick = () => {  
    setClicked(true);  
    fetch(`/voice/token?identity=${encodeURIComponent(identity)}`)  
      .then(response => response.json())  
      .then(({ token }) => setToken(token))  
      .catch(error => {  
        console.error('Error fetching token:', error);  
        setClicked(false);  
      });  
  };  
  
  const handleReset = () => {  
    setToken(null);  
    setClicked(false);  
  };  
  
  return (  
    <div className="app">  
      <main>  
        {!clicked && (  
          <IconButton  
            onClick={handleClick}  
            style={{  
              height: "1.5em",  
              background: "green",  
              width: "1.5em",  
              color: "white",  
              marginRight: "5px"  
            }}  
          >  
            <PhoneOutlined />  
          </IconButton>  
        )}  
        {token ? <Phone token={token} onReset={handleReset} /> : ""}  
      </main>  
    </div>  
  );  
};  
  
export default App;  
