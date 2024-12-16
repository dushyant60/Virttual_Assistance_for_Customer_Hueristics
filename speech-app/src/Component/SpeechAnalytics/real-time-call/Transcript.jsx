import React, { useState, useEffect } from 'react';

function TranscriptComponent() {
  const [ws, setWs] = useState(null);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const newWs = new WebSocket("ws://localhost:3001");
    setWs(newWs);
    // let fullTranscript = "";

    newWs.onopen = () => {
      console.log("WebSocket connected");
    };

  
    newWs.onmessage = (event) => {
      console.log("Received message:", event.data);
      try {
        const message = JSON.parse(event.data);
        if (message.event === "interim-transcription") {
          // Update transcript state with the full received text
          setTranscript(message.text);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      newWs.close();
    };
  }, []);

  return (
    <div>
      <p>{transcript}</p>
    </div>
  );
}

export default TranscriptComponent;
