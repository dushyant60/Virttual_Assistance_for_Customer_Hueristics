import React, { useEffect, useState } from 'react';
import { Twilio } from 'twilio';
import SimplePeer from 'simple-peer';

const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;  
const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;   

const twilioClient = new Twilio(accountSid, authToken);
const recognition = new window.SpeechRecognition();
const peer = new SimplePeer({ initiator: true });

const LiveCallTranscription = () => {
  const [transcription, setTranscription] = useState('');
  const [callSid, setCallSid] = useState(null);

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setTranscription(transcript);
    peer.send(transcript); // Send the transcription to the server in real-time.
  };

  const startCall = async () => {
    try {
      const callResponse = await initiateTwilioCall();

      setCallSid(callResponse.callSid);

      recognition.start();

      initializeWebRTC();
    } catch (error) {
      console.error(error);
    }
  };

  const initiateTwilioCall = async () => {
    const response = await fetch('/make-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: 'RECIPIENT_PHONE_NUMBER' }),
    });

    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to initiate the call');
    }
  };

  const initializeWebRTC = () => {
    peer.on('data', (data) => {
      // Handle incoming data from the server (not shown here).
      // You can display the received data if needed.
    });

    peer.on('stream', (stream) => {
      // Handle incoming audio stream (not shown here).
      // You can set up WebRTC audio streaming if required.
    });
  };

  useEffect(() => {
    if (callSid) {
      const transcriptionRequest = async () => {
        try {
          const response = await fetch(`/get-transcription?callSid=${callSid}`);
          if (response.ok) {
            const data = await response.json();
            setTranscription(data.transcription);
          }
        } catch (error) {
          console.error(error);
        }
      };

      const transcriptionInterval = setInterval(transcriptionRequest, 2000);

      return () => {
        clearInterval(transcriptionInterval);
      };
    }
  }, [callSid]);

  return (
    <div>
      <h1>Live Call Transcription</h1>
      <button onClick={startCall}>Start Call</button>
      <div>
        <h2>Real-Time Transcription:</h2>
        <div>{transcription}</div>
      </div>
    </div>
  );
};

export default LiveCallTranscription;
