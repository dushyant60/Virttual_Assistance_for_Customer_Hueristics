
require('dotenv').config()
const express = require('express')
const axios = require('axios');
const app = express()
const cors = require('cors');
const twilio = require('twilio');
const otpGenerator = require('otp-generator');
// get router
const openaiRouter = require('./routes/openai-gpt')
const azurelanguageRouter = require('./routes/azureai-language') 
const server = require("http").createServer(app);  

// get config
const config = require('./config.json')
const port = config[0].web_port
const speechKey = config[0].speech_subscription_key;
const speechRegion = config[0].speech_region;
const endpoint_id = config[0].speech_custom_endpoint_id_optional;
app.use(cors());
app.use(express.json());
app.use('/openai', openaiRouter);
app.use('/azure/language', azurelanguageRouter);
var https = require('https');
var fs = require('fs');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

// const { Server } = require('ws');

wss.on("connection", function connection(ws) {
  console.log("New Connection Initiated");
  // const audioStream = sdk.AudioInputStream.createPushStream();
  // //  Initialize the SpeechRecognizer
  //  const recognizer = new SpeechRecognizer(speechConfig, audioConfig, audioStream);
  // ws.on("message", function incoming(message) {
  //   const msg = JSON.parse  (message);
  //   switch (msg.event) {
  //     case "connected":
  //       console.log(`A new call has connected.`);
  //       recognizer.recognized = (s, e) => {
  //             if (e.reason === ResultReason.RecognizedSpeech) {
  //               // Send the recognized text to connected WebSocket clients
  //               const transcription = e.result.text;
  //               wss.clients.forEach((client) => {
  //                 if (client !== ws && client.readyState === WebSocket.OPEN) {
  //                   client.send(transcription);
  //                 }
  //               });
  //             }
  //           };
  //           recognizer.startContinuousRecognitionAsync();
  //       break;
  //     case "start":
  //       console.log(`Starting Media Stream ${msg.streamSid}`);
  //       break;
  //     case "media":
  //       console.log(`Receiving Audio...`)
  //       audioStream.write(message);
  //       break;
  //     case "stop":
  //       console.log(`Call Has Ended`);
  //       recognizer.stopContinuousRecognitionAsync();
  //       audioStream.close();
  //       break;
  //   }
  // });
});

app.get("/", (req, res) => res.send("Hello World"));

var options = {
    key: fs.readFileSync("certificate/private.key"),
    cert: fs.readFileSync("certificate/certificate.crt"),
    ca: [
    // fs.readFileSync('path/to/CA_root.crt'),
    fs.readFileSync('certificate/ca_bundle.crt')
    ]
};

app.get('/api/sayhello', (req, res) => {
    const currentDateTime = new Date();    
    res.send('Hello World from the backend root! ' + currentDateTime)
});

app.get('/api/get-speech-token', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    if (speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
        res.status(400).send('You forgot to add your speech key or region to the .env file.');
    } else {
        const headers = { 
            headers: {
                'Ocp-Apim-Subscription-Key': speechKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            console.log(`Speechkey loaded for speech region ${speechRegion}. Getting token`)
            const tokenResponse = await axios.post(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers);
            res.send({ token: tokenResponse.data, region: speechRegion, endpoint_id: endpoint_id });
        } catch (err) {
            res.status(401).send('There was an error authorizing your speech key.');
        }
    }
});

const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;  
const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;   


const twilioClient = twilio(accountSid, authToken);

app.post('/make-call', (req, res) => {
  const { to, from } = req.body;

  twilioClient.calls
    .create({
      url: '  https://0b81-103-101-119-124.ngrok-free.app', // Replace with your TwiML URL
      to:"+919761168730",
      from:"+1 213 947 9842",
    })
    .then(call => {
      console.log(`Call SID: ${call.sid}`);
      res.status(200).json({ message: 'Call initiated successfully' });
    })
    .catch(err => {
      console.error('Error making the call:', err);
      res.status(500).json({ error: 'Error making the call' });
    });
});
const VoiceResponse = require('twilio').twiml.VoiceResponse;
app.post('/twiml', (req, res) => {
  const twiml = new VoiceResponse();

  // Use the <Dial> verb to connect the caller and the callee.
  twiml.dial({
    action: '/call-complete', // URL for call completion (hang up, for example)
  }, '+919761168730');

  res.type('text/xml');
  res.send(twiml.toString());
});

app.post('/call-complete', (req, res) => {
  const twiml = new VoiceResponse();

  // You can add more actions here when the call is completed.

  res.type('text/xml');
  res.send(twiml.toString());
});




// https.createServer(options, function (req, res) {
//     res.writeHead(200);
//     console.log(`Express backend app listening on port ${port}`)
// })

server.listen(port, () => {
  console.log(`Express backend app listening on port ${port}`)
})
app.post('/send-otp', (req, res) => {
    const { phoneNumber } = req.body;
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false }); // Generate a 6-digit numeric OTP
    const message = `Your OTP is: ${otp}`;
  
    twilioClient.messages
      .create({
        body: message,
        from: '+1 985 336 3034',
        to:phoneNumber ,
      })
      .then((message) => {
        console.log(`OTP sent: ${message.sid}`);
        res.json({ success: true, message: 'OTP sent successfully' });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
      });
  });


  app.post("/", (req, res) => {
    res.set("Content-Type", "text/xml");
  
    res.send(`
      <Response>
        <Start>
          <Stream url="wss://${req.headers.host}/"/>
        </Start>
        <Say>I will stream the next 60 seconds of audio through your websocket</Say>
        <Pause length="60" />
      </Response>
    `);
  });