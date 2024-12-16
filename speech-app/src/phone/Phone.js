import React, { useState, useEffect } from "react";  
import Draggable from 'react-draggable';  
import { Device } from "twilio-client";  
import Dialler from "./Dialler";  
import KeypadButton from "./KeypadButton";  
import Incoming from "./Incoming";  
import OnCall from "./OnCall";  
import "./Phone.css";  
import states from "./states";  
import { PhoneOutlined } from "@material-ui/icons";  
import { IconButton } from "@material-ui/core";  
import CloseIcon from "@material-ui/icons/Close";  
  
const Phone = ({ token, onReset }) => {  
  const [state, setState] = useState(states.CONNECTING);  
  const [number, setNumber] = useState("");  
  const [conn, setConn] = useState(null);  
  const [device, setDevice] = useState(null);  
  const [showDialer, setShowDialer] = useState(true);  
  
  useEffect(() => {  
    const device = new Device();  
    device.setup(token, { debug: true });  
  
    device.on("ready", () => {  
      setDevice(device);  
      setState(states.READY);  
      console.log("Device is ready");  
    });  
  
    device.on("connect", (connection) => {  
      setConn(connection);  
      setState(states.ON_CALL);  
      console.log("Connected:", connection);  
  
      connection.on('accept', () => {  
        console.log("Call accepted");  
        const audioElement = connection.getAudioElement();  
        if (audioElement) {  
          audioElement.play();  
        }  
      });  
    });  
  
    device.on("disconnect", () => {  
      setState(states.READY);  
      setConn(null);  
      console.log("Disconnected");  
    });  
  
    device.on("incoming", (connection) => {  
      setState(states.INCOMING);  
      setConn(connection);  
      console.log("Incoming call:", connection);  
    });  
  
    device.on("cancel", () => {  
      setState(states.READY);  
      setConn(null);  
      console.log("Call canceled");  
    });  
  
    device.on("reject", () => {  
      setState(states.READY);  
      setConn(null);  
      console.log("Call rejected");  
    });  
  
    device.on("error", (error) => {  
      console.error("Twilio Device Error:", error);  
    });  
  
    return () => {  
      console.log("Closing and cleaning up Twilio Device...");  
      device.destroy();  
      setDevice(null);  
      setState(states.OFFLINE);  
    };  
  }, [token]);  
  
  const handleHangup = () => {  
    if (device) {  
      device.disconnectAll();  
    }  
  };  
  
  const handleCloseDialer = () => {  
    setShowDialer(false);  
    onReset();  
  };  
  
  const handleCall = () => {  
    if (device) {  
      device.connect({ To: number });  
    }  
  };  
  
  const handleAccept = () => {  
    if (conn) {  
      conn.accept();  
      setState(states.ON_CALL);  
    }  
  };  
  
  const handleReject = () => {  
    if (conn) {  
      conn.reject();  
      setState(states.READY);  
      setConn(null);  
    }  
  };  
  
  useEffect(() => {  
    console.log("Current state:", state); // Log state changes for debugging
  }, [state]);
  
  let render;  
  if (conn) {  
    if (state === states.INCOMING) {  
      render = <Incoming open={true} onAccept={handleAccept} onReject={handleReject} />;  
    } else if (state === states.ON_CALL) {  
      render = <OnCall handleHangup={handleHangup} connection={conn} />;  
    }  
  } else {  
    render = (  
      <>  
        {showDialer && (  
          <Draggable>  
            <div  
              style={{  
                border: "2px solid grey",  
                background: "#001B48",  
                // height: "60vh",  
                width: "24vw",  
                position: "absolute",  
                top: "55px",  
                right: "12px",  
                zIndex: "9999",  
                borderRadius: "15px",  
              }}  
            >  
              <IconButton  
                style={{ position: "absolute", top: 0, right: 0, color: "white" }}  
                onClick={handleCloseDialer}  
              >  
                <CloseIcon />  
              </IconButton>  
              <Dialler number={number} setNumber={setNumber} />  
              <KeypadButton handleClick={handleCall}>  
                <PhoneOutlined style={{ color: "green" }} />  
              </KeypadButton>  
            </div>  
          </Draggable>  
        )}  
      </>  
    );  
  }  
  
  return (  
    <>  
      {render}  
      {/* <CallHandler onCallStatusChange={handleCallStatusChange} />   */}
    </>  
  );  
};  
  
export default Phone;  
