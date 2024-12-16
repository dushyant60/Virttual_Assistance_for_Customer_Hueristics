import React, { useState, useEffect } from "react";
import { w3cwebsocket as WebSocketClient } from "websocket";

const Transcription = () => {
  const [transcriptions, setTranscriptions] = useState([]);

  useEffect(() => {
    const client = new WebSocketClient("ws://localhost:8080"); // Use the correct WebSocket server URL

    client.onopen = () => {
      console.log("WebSocket connection established");
      return () => {
        client.close();
      };
    };

    client.onmessage = (message) => {
      const data = JSON.parse(message.data);

      // Check for text property instead of "event"
      if (data.text) {
        setTranscriptions((prevTranscriptions) => [
          ...prevTranscriptions,
          data.text,
        ]);
      }
    };

    client.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      client.close();
    };
  }, []);

  return (
    <div>
      <h1>Real-time Transcription</h1>
      <div>
        <ul>
          {transcriptions.map((transcription, index) => (
            <li key={index}>{transcription}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Transcription;
