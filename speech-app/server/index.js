const WebSocket = require("ws");
const http = require("http");
const { AudioConfig, SpeechConfig, AudioInputStream, SpeechRecognizer } = require("microsoft-cognitiveservices-speech-sdk");

const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

// Azure Speech Service configuration
const speechConfig = SpeechConfig.fromSubscription("YOUR_AZURE_SUBSCRIPTION_KEY", "YOUR_AZURE_SERVICE_REGION");
const audioConfig = AudioConfig.fromStreamInput(new AudioInputStream());

wss.on("connection", (ws) => {
  console.log("WebSocket connection established with client");

  ws.on("message", (audioData) => {
    const audioStream = AudioInputStream.createPushStream();
    audioStream.write(audioData);

    // Initialize a SpeechRecognizer
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnce(audioStream)
      .then((result) => {
        if (result.reason === ResultReason.RecognizedSpeech) {
          const transcribedText = result.text;
          console.log("Transcribed Text:", transcribedText);

          // Send the transcription back to the client
          ws.send(transcribedText);
        } else {
          console.error("Transcription error:", result.reason);
        }
      })
      .catch((error) => {
        console.error("Transcription error:", error);
      });
  });
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

server.listen(3001, () => {
  console.log("Transcription server is running on port 3001");
});
