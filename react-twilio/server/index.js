/* eslint-disable default-case */
const config = require("./config");  
const express = require("express");  
const bodyParser = require("body-parser");  
const pino = require("express-pino-logger")();  
const { chatToken, videoToken, voiceToken } = require("./tokens");  
const { VoiceResponse } = require("twilio").twiml;  
const twilio = require('twilio');  
const WebSocket = require("ws");  
const cors = require('cors');  
const sdk = require('microsoft-cognitiveservices-speech-sdk');  
const { BlobServiceClient } = require('@azure/storage-blob');  
const fs = require('fs');  
const axios = require('axios');  
const Buffer = require('buffer').Buffer;  
const dbApp = require("./db");  
const waitingList = [];  
  
  
const app = express();  
  
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());  
app.use(pino);  
  
const server = require("http").createServer(app);  
const wss = new WebSocket.Server({ server });  
  
app.use(cors());  
  
const sendTokenResponse = (token, res) => {  
    res.set("Content-Type", "application/json");  
    res.send(JSON.stringify({ token: token.toJwt() }));  
};  
  
const subscriptionKey = '56789552fd00412fb4cc9407e7a1e8a8';  
const serviceRegion = 'centralindia';  
  
// Add error handling for server  
server.on('error', (error) => {  
    console.error('Server error:', error);  
});  
  
app.get("/api/greeting", (req, res) => {  
    const name = req.query.name || "World";  
    res.setHeader("Content-Type", "application/json");  
    res.send(JSON.stringify({ greeting: `Hello ${name}!` }));  
});  
  
app.get("/chat/token", (req, res) => {  
    const identity = req.query.identity;  
    const token = chatToken(identity, config);  
    sendTokenResponse(token, res);  
});  
  
app.post("/chat/token", (req, res) => {  
    const identity = req.body.identity;  
    const token = chatToken(identity, config);  
    sendTokenResponse(token, res);  
});  
  
app.get("/video/token", (req, res) => {  
    const identity = req.query.identity;  
    const room = req.query.room;  
    const token = videoToken(identity, room, config);  
    sendTokenResponse(token, res);  
});  
  
app.post("/video/token", (req, res) => {  
    const identity = req.body.identity;  
    const room = req.body.room;  
    const token = videoToken(identity, room, config);  
    sendTokenResponse(token, res);  
});  
  
app.get("/voice/token", (req, res) => {  
    const identity = req.query.identity;  
    const token = voiceToken(identity, config);  
    sendTokenResponse(token, res);  
});  
  
app.post("/voice/token", (req, res) => {  
    const identity = req.body.identity;  
    const token = voiceToken(identity, config);  
    sendTokenResponse(token, res);  
});  
let isAgentBusy = false; // Flag to check agent availability  
  
// Route to handle outbound calls  
app.post("/voice/outbound", (req, res) => {  
    const To = req.body.To;  
    const response = new VoiceResponse();  
  
    if (isAgentBusy) {  
        // Agent is busy, respond to the caller and add to waiting list  
        response.say('Our agents are currently busy. We will contact you as soon as possible.');  
        const callId = uuidv4();  
        const callTime = new Date().toISOString();  
        waitingList.push({ id: callId, number: To, time: callTime });  
        notifyAgents();  
    } else {  
        // Agent is available, connect the call  
        isAgentBusy = true;  
        // Stream the call audio  
        const start = response.start();  
        start.stream({  
            name: 'Example Audio Stream',  
            url: 'wss://allowed-termite-wrongly.ngrok-free.app',  
            track: 'both_tracks'  
        });  
        // Record the call  
        const dial = response.dial({  
            callerId: config.twilio.callerId,  
            action: '/recordingComplete',  
            record: 'record-from-answer-dual'  
        });  
        dial.number(To);  
        // Say instructions to the caller  
        response.say('Please start speaking after the beep.');  
    }  
    res.type('text/xml');  
    res.send(response.toString());  
});  
  
  
// Handle incoming calls  
const { v4: uuidv4 } = require('uuid');  
  
app.post("/voice/inbound", (req, res) => {  
    const callerNumber = req.body.From;  
    const callTime = new Date().toISOString();  
    const callId = uuidv4();  
    const response = new VoiceResponse();  
  
    if (isAgentBusy) {  
        // Agent is busy, respond to the caller and add to waiting list  
        response.say('Our agents are currently busy. We will contact you as soon as possible.');  
        waitingList.push({ id: callId, number: callerNumber, time: callTime });  
        notifyAgents();  
    } else {  
        // Agent is available, connect the call  
        isAgentBusy = true;  
  
        // Stream the call audio  
        const start = response.start();  
        start.stream({  
            name: 'Example Audio Stream',  
            url: 'wss://allowed-termite-wrongly.ngrok-free.app',  
            track: 'both_tracks'  
        });  
  
        // Connect the call to a Twilio Client  
        const dial = response.dial({  
            callerId: config.twilio.callerId,  
            record: 'record-from-answer-dual',  
            action: '/recordingComplete',  
        });  
  
        // Connect to the client identity 'User'  
        dial.client('User'); // Ensure this matches the identity in your React app  
    }  
  
    res.type('text/xml');  
    res.send(response.toString());  
});  
  
// Handle callback requests  
app.post("/voice/callback", (req, res) => {  
    if (waitingList.length === 0) {  
        return res.json({ message: 'No numbers in the waiting list.' });  
    }  
  
    const phoneNumber = waitingList.shift(); // Get the first number in the waiting list  
  
    twilioClient.calls.create({  
        url: 'https://allowed-termite-wrongly.ngrok-free.app/voice/outbound',  
        to: phoneNumber,  
        from: config.twilio.callerId  
    }).then(call => {  
        console.log('Call initiated:', call.sid);  
        res.json({ message: 'Callback initiated.', callSid: call.sid });  
    }).catch(error => {  
        console.error('Error initiating callback:', error);  
        res.status(500).json({ error: 'Error initiating callback.' });  
    });  
});  
  
app.get("/voice/waiting-list", (req, res) => {  
    res.json(waitingList);  
});  
app.get("/waiting-list/count", (req, res) => {
    res.json({ count: waitingList.length });
  });   
  
// Remove a number from the waiting list  
app.delete("/voice/waiting-list/:number", (req, res) => {  
    const number = req.params.number;  
    const index = waitingList.indexOf(number);  
  
    if (index !== -1) {  
        waitingList.splice(index, 1);  
        res.json({ message: `Number ${number} removed from the waiting list.` });  
    } else {  
        res.status(404).json({ error: `Number ${number} not found in the waiting list.` });  
    }  
});  
  
// Twilio credentials  
const accountSid = 'ACe92fe807bd481b5b8ffa392afe1a890f';  
const authToken = '0dbf6cd96a6113212fdd766601a741ad';  
const twilioClient = twilio(accountSid, authToken);  
  
// Blob Storage credentials  
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=recordedcall;AccountKey=EuzY+felTjStPJXsBJo0BXyp6KtdovCmjOVYsU8d/ghXcjfQ7BxZh8J+A/HG4+00FeldlMbT6ikB+AStPnBkMQ==;EndpointSuffix=core.windows.net';  
const containerName = 'recorededcall';  
  
// Authenticate with Twilio  
const twilioAuth = {  
    username: accountSid,  
    password: authToken  
};  
  
async function downloadAudioFile(url) {  
    try {  
        const response = await axios.get(url, { auth: twilioAuth, responseType: 'stream' });  
        const audioFilePath = 'audio.wav';  
        const writer = fs.createWriteStream(audioFilePath);  
        response.data.pipe(writer);  
        return new Promise((resolve, reject) => {  
            writer.on('finish', resolve);  
            writer.on('error', reject);  
        });  
    } catch (error) {  
        console.error('Error downloading audio file:', error);  
        throw error;  
    }  
}  
  
async function uploadToBlobStorage(filePath, timestamp) {  
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);  
    const containerClient = blobServiceClient.getContainerClient(containerName);  
    const blobName = `audio_${timestamp}.wav`;  
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);  
    try {  
        const response = await blockBlobClient.uploadFile(filePath);  
        console.log('File uploaded to Azure Blob Storage:', response);  
        return response;  
    } catch (error) {  
        console.error('Error uploading file to Azure Blob Storage:', error.message);  
        throw error;  
    }  
}  
  
async function geturl(url) {  
    try {  
        await downloadAudioFile(url);  
        console.log('Audio file downloaded successfully');  
        const timestamp = Date.now();  
        const uploadResponse = await uploadToBlobStorage('audio.wav', timestamp);  
        console.log('Audio file uploaded to Azure Blob Storage');  
        return uploadResponse;  
    } catch (error) {  
        console.error('An error occurred:', error);  
        throw error;  
    }  
}  
function notifyAgents() {  
    wss.clients.forEach(client => {  
        if (client.readyState === WebSocket.OPEN) {  
            client.send(JSON.stringify({ event: 'waiting-list-update', data: waitingList }));  
        }  
    });  
}  
  
app.post('/recordingComplete', async (req, res) => {  
    try {  
        const recordingUrl = req.body.RecordingUrl;  
        setTimeout(async () => {  
            try {  
                const uploadResponse = await geturl(recordingUrl);  
                res.json({ message: 'Audio file downloaded and uploaded successfully', uploadResponse });  
            } catch (error) {  
                console.error('An error occurred while uploading the audio file:', error);  
                res.status(500).json({ error: 'An error occurred while uploading the audio file' });  
            }  
        }, 5000); // Delay of 5000 milliseconds (5 seconds)
        
            // Set agent availability to false  
            isAgentBusy = false;  
    } catch (error) {  
        console.error('An error occurred in /recordingComplete route:', error);  
        res.status(500).json({ error: 'An error occurred in /recordingComplete route' });  
    }  
});  
  
const muLawDecoder = (muLawByte) => {  
    muLawByte = ~muLawByte & 0xFF;  // Ensure the byte is correctly inverted and remains an 8-bit value  
    const sign = muLawByte & 0x80;  
    const exponent = (muLawByte & 0x70) >> 4;  
    let data = muLawByte & 0x0F;  
    data |= 0x10;  
    data <<= 1;  
    data += 1;  
    data <<= (exponent + 2);  
    data -= 0x84;  
    return sign ? -data : data;  
};  
  
function mulawToPcm(muLawBuffer) {  
    const outBuffer = Buffer.alloc(muLawBuffer.length * 2); // 16-bit PCM data  
    for (let i = 0; i < muLawBuffer.length; i++) {  
        const pcmValue = muLawDecoder(muLawBuffer[i]);  
        outBuffer.writeInt16LE(pcmValue, i * 2);  
    }  
    return outBuffer;  
}  
wss.on("connection", function connection(ws) {  
    console.log("New Connection Initiated");  
    let recognizer;  
    let audioConfig;  
    let pushStream;  
    let conversationTranscriber;  
    let transcriptionTextArray = [];  
    let audioChunks = [];  
    let pcmAudioData = Buffer.alloc(0); // Buffer to hold the PCM audio data  
  
    ws.on("message", async function incoming(message) {  
        const msg = JSON.parse(message);  
        switch (msg.event) {  
            case "connected":  
                console.log(`A new call has connected.`);  
                break;  
            case "start":  
                console.log(`Start transcription`);  
                const pushStreamformat = sdk.AudioStreamFormat.getWaveFormatPCM(8000, 16, 1);  
                pushStream = sdk.AudioInputStream.createPushStream(pushStreamformat);  
                audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);  
                // console.log("AudioConfig initialized:", audioConfig);  
                const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);  
                speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "6000");  
                speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EnableSpeakerDiarization, "true");  
                speechConfig.speechRecognitionLanguage = 'en-US';  
                conversationTranscriber = new sdk.ConversationTranscriber(speechConfig, audioConfig);  
                conversationTranscriber.sessionStarted = (s, e) => {  
                    console.log(`Session started with session ID: ${e.sessionId}`);  
                    ws.send(JSON.stringify({  
                        event: 'session-id',  
                        sessionId: e.sessionId,  
                    }));  
                };  
                conversationTranscriber.transcribed = (s, e) => {  
                    if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {  
                        console.log("TRANSCRIBED: Text=" + e.result.text + " Speaker ID=" + e.result.speakerId);  
                        const formattedTranscription = `${e.result.speakerId}: ${e.result.text}`;  
                        transcriptionTextArray.push(formattedTranscription);  
                        wss.clients.forEach((client) => {  
                            if (client.readyState === WebSocket.OPEN) {  
                                client.send(JSON.stringify({  
                                    event: "interim-transcription",  
                                    text: e.result.text,  
                                    speakerId: e.result.speakerId,  
                                }));  
                            }  
                        });  
                    }  
                };  
                conversationTranscriber.canceled = (s, e) => {  
                    console.log(`CANCELED: Reason=${e.reason}`);  
                    if (e.reason == sdk.CancellationReason.Error) {  
                        console.log(`CANCELED: ErrorCode=${e.errorCode}`);  
                        console.log(`CANCELED: ErrorDetails=${e.errorDetails}`);  
                        console.log("CANCELED: Did you update the key and location/region info?");  
                    }  
                    conversationTranscriber.stopTranscribingAsync();  
                };  
                conversationTranscriber.sessionStopped = (s, e) => {  
                    console.log("\nSession stopped event.");  
                    conversationTranscriber.stopTranscribingAsync();  
                };  
                conversationTranscriber.startTranscribingAsync(() => {  
                    console.log("Continuous Transcription Started");  
                }, err => {  
                    console.trace("Error starting transcription: " + err);  
                    conversationTranscriber.close();  
                    conversationTranscriber = undefined;  
                });  
                break;  
            case "media":  
                if (msg.media && msg.media.payload) {  
                    const audioData = Buffer.from(msg.media.payload, 'base64');  
                    if (!pushStream) {  
                        console.error("Push stream is not initialized.");  
                        break;  
                    }  
                    const pcmData = mulawToPcm(audioData);  
                    pushStream.write(pcmData, null, () => {});  
  
                    // Save the decoded PCM data to a buffer  
                    pcmAudioData = Buffer.concat([pcmAudioData, pcmData]);  
  
                    // Save the audio data to a file for inspection  
                    fs.appendFileSync('received_audio.raw', audioData);  
  
                    audioChunks.push(audioData);  
                } else {  
                    console.error("Received undefined audio payload.");  
                }  
                break;  
            case "stop":  
                console.log(`Call Has Ended`);  
                if (conversationTranscriber) {  
                    conversationTranscriber.stopTranscribingAsync(() => {  
                        console.log("Transcription stopped.");  
                    }, (err) => {  
                        console.error("Error stopping transcription: " + err);  
                    });  
                }  
                const audioBlob = Buffer.concat(audioChunks);  
                const filePath = 'audio_blob.wav';  
                fs.writeFileSync(filePath, audioBlob);  
                const timestamp = Date.now();  
                await uploadToBlobStorage(filePath, timestamp);  
                const transcriptionText = transcriptionTextArray.join(' , ');  
                try {  
                    const data = {  
                        "call_sid": msg.stop.callSid,  
                        "transcription": transcriptionText,  
                        "sentiment": "1.2",  
                    };  
                    await axios.post('http://localhost:3001/api/storeData', data);  
                    console.log("Data stored successfully");  
                } catch (error) {  
                    console.error('An error occurred while storing data:', error.response.data);  
                }  
  
                // Save the PCM audio data to a WAV file for playback  
                const wavHeader = Buffer.alloc(44); // WAV file header  
                const pcmDataSize = pcmAudioData.length;  
                const sampleRate = 8000;  
                const byteRate = sampleRate * 2; // 16-bit mono audio  
                const blockAlign = 2;  
  
                // Write the WAV header  
                wavHeader.write('RIFF', 0); // ChunkID  
                wavHeader.writeUInt32LE(36 + pcmDataSize, 4); // ChunkSize  
                wavHeader.write('WAVE', 8); // Format  
                wavHeader.write('fmt ', 12); // Subchunk1ID  
                wavHeader.writeUInt32LE(16, 16); // Subchunk1Size  
                wavHeader.writeUInt16LE(1, 20); // AudioFormat (PCM)  
                wavHeader.writeUInt16LE(1, 22); // NumChannels  
                wavHeader.writeUInt32LE(sampleRate, 24); // SampleRate  
                wavHeader.writeUInt32LE(byteRate, 28); // ByteRate  
                wavHeader.writeUInt16LE(blockAlign, 32); // BlockAlign  
                wavHeader.writeUInt16LE(16, 34); // BitsPerSample  
                wavHeader.write('data', 36); // Subchunk2ID  
                wavHeader.writeUInt32LE(pcmDataSize, 40); // Subchunk2Size  
  
                const wavFilePath = 'decoded_audio.wav';  
                fs.writeFileSync(wavFilePath, Buffer.concat([wavHeader, pcmAudioData]));  
                console.log(`PCM audio data saved to ${wavFilePath}`);  
  
                break;  
        }  
    });  
  
    ws.on("close", function close() {  
        console.log("Connection closed");  
        if (pushStream) {  
            pushStream.close();  
        }  
        if (conversationTranscriber) {  
            conversationTranscriber.close();  
            conversationTranscriber = undefined;  
        }  
    });  
});  
  
app.use(dbApp);  
  
server.listen(3001, () => console.log("Express server is running on localhost:3001"));  