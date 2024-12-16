import React, { useState } from "react";
import KeypadButton from "./KeypadButton";
import useLoudness from "./hooks/useLoudness";
import useMuteWarning from "./hooks/useMuteWarning";
import "./OnCall.css";
import { Phone, VolumeMuteOutlined, VolumeOff } from "@material-ui/icons";
import Draggable from "react-draggable";

const OnCall = ({ handleHangup, connection, onHangup: refreshApp }) => {
  const [muted, setMuted] = useState(false);
  const [running, setRunning, loudness] = useLoudness();
  const [showMuteWarning] = useMuteWarning(loudness, running);

  const handleMute = () => {
    setMuted(!muted);
    setRunning(!muted);
  };

  const muteWarning = (
    <p className="warning">Are you speaking? You are on mute!</p>
  );

  return (
    <>
      {showMuteWarning && muteWarning}
      <Draggable>
        <div className="call">
          <div className="call-options">
            <KeypadButton handleClick={handleMute} color={muted ? "grey" : ""}>
              {muted ? <VolumeOff /> : <VolumeMuteOutlined />}
            </KeypadButton>
          </div>
          <div className="hang-up">
            <KeypadButton handleClick={handleHangup}>
              <Phone style={{ color: "red" }} />
            </KeypadButton>
          </div>
        </div>
      </Draggable>
    </>
  );
};

export default OnCall;
