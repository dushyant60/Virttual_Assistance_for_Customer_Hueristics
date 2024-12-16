import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Typography,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import {
  SaveAlt,
  SpeakerNotesOutlined,
  FindInPageOutlined,
  AddIcCallOutlined,
  PhoneForwardedOutlined,
  ContactSupportOutlined,
  QuestionAnswer,
} from "@material-ui/icons";
import axios from "axios";
import {
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  XAxis,
  Area,
} from "recharts";
import WaveSurfer from "wavesurfer.js";
import {
  ResultReason,
  PropertyId,
} from "microsoft-cognitiveservices-speech-sdk";
import Sentiment from "sentiment";
import { getTokenOrRefresh, getKeyPhrases } from "../../../token_util";
import CallAgentc from "../../../phone/App";
import CallSummaryCard from "./CallsRecords";
import CallListButton from "./CallListButton";

const speechsdk = require("microsoft-cognitiveservices-speech-sdk");
var recognizer;
var conversationTranscriber;
var synthesizer;
const useStyles = makeStyles({
  micButton: {
    color: "green",
    "&:hover": {
      color: "darkgreen",
    },
  },
  activeMic: {
    backgroundColor: "darkgreen",
    color: "white",
  },
  stopButton: {
    color: "red",
    "&:hover": {
      color: "darkred",
    },
  },
  typo: {
    // textAlign: "center",
    fontWeight: "300",
    fontSize: "14px",
    padding: "10px",
    // color: 'grey'
  },
  analysisBox: {
    border: "2px solid red",
    height: "23vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  circleContainer: {
    width: "150px",
    height: "150px",
    position: "relative",
  },
  circle: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: "10px solid #ccc", // Rim color
    position: "absolute",
  },
  circleFill: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
    position: "absolute",
  },
  circleValue: {
    fontSize: "24px",
    fontWeight: "bold",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
});



const RealTimeCallAnalys = () => {
  const classes = useStyles();
  const [activeButton, setActiveButton] = useState("One");
  const [ws, setWs] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [displayText, setDisplayText] = useState(
    "READY to start call simulation"
  );
  const [displayNLPOutput, setDisplayNLPOutput] = useState("");
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [moderate, setmoderate] = useState([]);
  const audioStreamRef = useRef(null);
  const [realTimeSentimentData, setRealTimeSentimentData] = useState([]);
  const [positiveSentimentData, setPositiveSentimentData] = useState([]);
  const [negativeSentimentData, setNegativeSentimentData] = useState([]);
  const sentiment = new Sentiment();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const [isRecording, setIsRecording] = useState(false);
  const [conversationData, setConversationData] = useState([]);
  const [waveform, setWaveform] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const waveformRef = useRef(null);
  const [play, setplay] = useState(true);
  const [audioChunkSize] = useState(4096);
  const [recordingstart, setrecordingStart] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");

  const answersRef = useRef(null); // Create a ref for the recommended answers container


  const transcriptRef = useRef(null);

  const connectWebSocket = () => {
    const newWs = new WebSocket("ws://localhost:3001");
    let guest2TextBuffer = "";
    let entityText = "";
    let nlpText = "";
    setWs(newWs);

    newWs.onopen = () => {
      console.log("WebSocket connected");
    };

    newWs.onmessage = async (event) => {
      console.log("Received message:", event.data);
      try {
        const message = JSON.parse(event.data);
        if (message.event === "interim-transcription") {
          // Update transcript state with the full received text
          setTranscript(message.text);
          console.log("transcript latest", message.text); 
          if (message.speakerId === "Guest-2") {
            // Append the current line of text to the buffer
            guest2TextBuffer += `${message.text}\n`;

            // Generate response based on the accumulated text
            recommendedAnswer(guest2TextBuffer.trim(), "Guest-2");
            recommandQuestion(guest2TextBuffer.trim(), "Guest-2");
          }
          // If the speaker ID changes and the buffer is not empty, generate response based on the accumulated text
          else if (guest2TextBuffer.trim() !== "") {
            recommendedAnswer(guest2TextBuffer.trim(), "Guest-2");
            recommandQuestion(guest2TextBuffer.trim(), "Guest-2");
          }
          updateSpeakerAndSentence(message.speakerId, message.text);
          const sentimentAnalysis = sentiment.analyze(message.text);
          const sentimentScore = sentimentAnalysis.score;
          setRealTimeSentimentData((prevData) => [...prevData, sentimentScore]);
          if (sentimentScore >= 0) {
            setPositiveSentimentData((prevData) => [
              ...prevData,
              sentimentScore,
            ]);
            setNegativeSentimentData((prevData) => [...prevData, null]); // Set null for negative data
          } else {
            setPositiveSentimentData((prevData) => [...prevData, null]); // Set null for positive data
            setNegativeSentimentData((prevData) => [
              ...prevData,
              sentimentScore,
            ]);
          }
           // Async operation for NLP processing
           const nlpObj = await getKeyPhrases(message.text);
           entityText = nlpObj.entityExtracted;
  
           // if (entityText !== "NoEnt") {
           nlpText += "\n" + entityText;
           setDisplayNLPOutput(nlpText.replace("<br/>", "\n"));
           // }
          
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
  };

  useEffect(() => {
    const initWebSocket = async () => {
      connectWebSocket();
    };
 
    initWebSocket();
 
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);


  const conversationRef = useRef(null);
  const question = useRef(null);

  // ...
  const updateSpeakerAndSentence = (speaker, sentence) => {
    let formattedSpeaker = speaker;

    // Map speaker names to desired labels
    if (speaker === "Guest-1") {
      formattedSpeaker = "Agent";
    } else if (speaker === "Guest-2") {
      formattedSpeaker = "Caller";
    } else if (speaker === "Unknown") {
      formattedSpeaker = "Speaker";
    }

    const formattedSentence = `${formattedSpeaker}: "${sentence}"\n`;

    if (conversationData.length > 0) {
      const lastItem = conversationData[conversationData.length - 1];
      const lastSpeaker = lastItem.split(":")[0];
      if (lastSpeaker !== formattedSpeaker) {
        setConversationData((prevData) => [
          ...prevData,
          "\n",
          formattedSentence,
        ]);
      } else {
        setConversationData((prevData) => [...prevData, formattedSentence]);
      }
    } else {
      setConversationData((prevData) => [...prevData, formattedSentence]);
    }
  };

  const startRecording = async () => {
    setAnswers("");
    setWaveform("");
    setQuestions("");
    setAudioBlob("");
    setDisplayNLPOutput("");
    setDisplayText("");
    setConversationData([]);
    setNegativeSentimentData("");
    setPositiveSentimentData("");
    if (waveform) {
      waveform.destroy();
    }

    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );

    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    var convLanguage = "en-US";

    speechConfig.speechRecognitionLanguage = convLanguage;
    recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    conversationTranscriber = new speechsdk.ConversationTranscriber(
      speechConfig
    );
    const pushStream = speechsdk.AudioInputStream.createPushStream();

    audioStreamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    let resultText = "";
    let nlpText = "";
    let entityText = "";
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "blue",
      progressColor: "purple",
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setAudioBlob(event.data);
      }
    };

    recorder.onstop = () => {
      setIsRecording(false);
      if (wavesurfer.isPlaying()) {
        wavesurfer.stop();
      }
    };
    
    recorder.start();
    setIsRecording(true);
    setMediaRecorder(recorder);
    setWaveform(wavesurfer);
    setrecordingStart(false);

    conversationTranscriber.sessionStarted = (s, e) => {};

    let guest2TextBuffer = ""; // Buffer to accumulate "Guest-2" speaker text
    conversationTranscriber.transcribed = async (s, e) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        // console.log("TRANSCRIBED: Text=" + e.result.text + "Speaker ID=" + e.result.speakerId);
        resultText += `\n${e.result.text}`;
        setDisplayText(resultText);

        console.log("transcript", resultText);

        if (e.result.speakerId === "Guest-2") {
          // Append the current line of text to the buffer
          guest2TextBuffer += `${e.result.text}\n`;

          // Generate response based on the accumulated text
          recommendedAnswer(guest2TextBuffer.trim(), "Guest-2");
          recommandQuestion(guest2TextBuffer.trim(), "Guest-2");
        }
        // If the speaker ID changes and the buffer is not empty, generate response based on the accumulated text
        else if (guest2TextBuffer.trim() !== "") {
          recommendedAnswer(guest2TextBuffer.trim(), "Guest-2");
          recommandQuestion(guest2TextBuffer.trim(), "Guest-2");
        }
        // console.log("resultTextForQuestion", resultText);

        updateSpeakerAndSentence(e.result.speakerId, e.result.text);

        // console.log("speakerID", e.result.speakerId);
        // console.log("speakerText", e.result.text);
        const sentimentAnalysis = sentiment.analyze(e.result.text);
        const sentimentScore = sentimentAnalysis.score;
        // Update the real-time sentiment data
        setRealTimeSentimentData((prevData) => [...prevData, sentimentScore]);
        if (sentimentScore >= 0) {
          setPositiveSentimentData((prevData) => [...prevData, sentimentScore]);
          setNegativeSentimentData((prevData) => [...prevData, null]); // Set null for negative data
        } else {
          setPositiveSentimentData((prevData) => [...prevData, null]); // Set null for positive data
          setNegativeSentimentData((prevData) => [...prevData, sentimentScore]);
        }
        

        const nlpObj = await getKeyPhrases(resultText);

        entityText = nlpObj.entityExtracted;


        // if (entityText!=="NoEnt") {
        nlpText += "\n" + entityText;
        setDisplayNLPOutput(nlpText.replace("<br/>", "\n"));
        // }
      } else if (e.result.reason === ResultReason.NoMatch) {
        resultText += "\n";
      }
    };

    // console.log("Result", resultText);
    recognizer.sessionStarted = (s, e) => {};
    setrecordingStart(false);
    conversationTranscriber.startTranscribingAsync(
      function () {
        const reader = new FileReader();

        reader.onload = function () {
          const arrayBuffer = reader.result;

          // Push audio data in chunks
          for (
            let offset = 0;
            offset < arrayBuffer.byteLength;
            offset += audioChunkSize
          ) {
            const chunk = new Uint8Array(
              arrayBuffer.slice(offset, offset + audioChunkSize)
            );
            pushStream.write(chunk);
            // console.log("hii", pushStream.write(chunk));
          }
        };
      },
      function (err) {
        console.trace("err - starting transcription: " + err);
      }
    );
  };
  const stopRecording = async () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      conversationTranscriber.stopTranscribingAsync();
      setrecordingStart(true);
      // setIsRecording(false)
    }
  };

  const playAudio = () => {
    if (waveform) {
      waveform.play();
      setplay(false);
    }
  };

  const stopAudio = () => {
    if (waveform) {
      waveform.stop();
      setplay(true);
    }
  };

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  const  recommendedAnswer= async (text, speakerId) => {
 
    let apiKey,svcName
         apiKey ="fdb12bb67a764cd2b74676dd5afa58d3";
         svcName ="azureopenaiol"
   
    const apiEndpoint = `https://azureopenaiol.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2023-09-15-preview`;
    console.log("id",speakerId)
    try {
      if (speakerId === "Guest-2") {
      const response = await axios.post(
        apiEndpoint,
        {
          messages: [
            {
              role: 'system',
              content:`Caller's input:\n\n${text}\n\nProvide relevant response`,
            },
          ],
          // temperature,
          // top_p: topP,
          // frequency_penalty: frequencyPenalty,
          // presence_penalty: presencePenalty,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
        }
      );
      console.log("ans",response)
       const summary = response.data.choices[0].message.content
       setAnswers((prevAnswers) => [...prevAnswers, summary]);
   
    }
   } catch (error) {
      console.error("Error:", error);
    }
 
};
 
  // Caller's input:\n\n${text}\n\nProvide relevant 2 to 3 questions only:
 
const recommandQuestion = async (text) => {
 
      let apiKey,svcName
           apiKey ="fdb12bb67a764cd2b74676dd5afa58d3";
           svcName ="azureopenaiol"
     
      const apiEndpoint = `https://azureopenaiol.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2023-09-15-preview`;
     
      try {
        const response = await axios.post(
          apiEndpoint,
          {
            messages: [
              {
                role: 'system',
                content:`Caller's input:\n\n${text}\n\nProvide relevant 2 to 3 questions only:`,
              },
            ],
            // temperature,
            // top_p: topP,
            // frequency_penalty: frequencyPenalty,
            // presence_penalty: presencePenalty,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "api-key": apiKey,
            },
          }
        );
     
        if (response.data.choices && response.data.choices.length > 0) {
          const generatedQuestions = response.data.choices.map(
            (choice) => choice.message.content
          );
          setQuestions((prevQuestions) => [
            ...prevQuestions,
            ...generatedQuestions,
          ]);
        } else {
          console.log("No response from the model.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
 
  };
  
  // console.log("Data", conversationData);

  // const Moderation = async (text) => {
  //   const apiKey = "69a048f7c20648b6be297521cbc9a94c";
  //   const endpoint =
  //     "https://openai-vach.openai.azure.com/openai/deployments/openai/completions?api-version=2023-09-15-preview";

  //   try {
  //     const response = await axios.post(
  //       endpoint,
  //       {
  //         prompt: `generate the score of the moderate:${text}`,
  //         max_tokens: 100,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           "api-key": apiKey,
  //         },
  //       }
  //     );

  //     if (response.data.choices && response.data.choices.length > 0) {
  //       const generatedText = response.data.choices[0].text;
  //       setQuestions(generatedText);
  //     } else {
  //       console.log("No response from the model.");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  useEffect(() => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);

      if (waveform) {
        waveform.load(audioUrl);
      }

      return () => {
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [audioBlob, waveform]);
  useEffect(() => {
    if (conversationRef.current) {
      // Scroll to the bottom of the transcript when displayText changes
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversationData]);

  useEffect(() => {
    if (transcriptRef.current) {
      // Scroll to the bottom of the transcript when displayText changes
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    if (question.current) {
      // Scroll to the bottom of the transcript when displayText changes
      question.current.scrollTop = question.current.scrollHeight;
    }
  }, [questions]);

  useEffect(() => {
    if (answersRef.current) {
      // Scroll to the bottom of the recommended answers when answers state changes
      answersRef.current.scrollTop = answersRef.current.scrollHeight;
    }
  }, [answers]);

  const calculateAverageSentiment = (scores) => {
    if (scores.length === 0) {
      return 0;
    }

    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;
    return parseFloat(average.toFixed(2)); // Rounds to two decimal places and converts to float
  };

  const averagePositiveSentiment = calculateAverageSentiment(
    positiveSentimentData
  );
  const averageNegativeSentiment = calculateAverageSentiment(
    negativeSentimentData
  );
  const avgSetiment = parseFloat(averagePositiveSentiment + averageNegativeSentiment).toFixed(2);
  const handleRetrieveRecording = async () => {
    try {
      const response = await axios.get("http://localhost:3001/recording");
      setAudioUrl(response.data);
    } catch (error) {
      console.error("Error retrieving recording:", error);
    }
  };
  return (
    <>
      <Box
        style={{
          margin: "10px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // height: "86vh",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} lg={9} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} lg={3} md={3}>
                <Box
                  style={{
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, .15)",
                    height: "6vh",
                    marginBottom: "12px",
                    background: "white",
                    borderRadius: "10px",
                  }}
                >
                  <Box
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      borderRadius: "2px",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <Box style={{ display: "flex" }}>
                      <CallAgentc onClick={startRecording} />

                      <Tooltip title="Add call">
                        <IconButton
                          style={{
                            height: "1.5em",
                            background: "blue",
                            width: "1.5em",
                            color: "white",
                            marginRight: "5px",
                          }}
                        >
                          <AddIcCallOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Transfer call">
                        <IconButton
                          style={{
                            height: "1.5em",
                            background: "grey",
                            width: "1.5em",
                            color: "white",
                            marginRight: "5px",
                          }}
                        >
                          <PhoneForwardedOutlined />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                <Box
                  style={{
                    borderColor: "grey",
                    background: "white",
                    height: "9vh",
                    overflowY: "auto",
                    // marginTop: "6px",
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                    borderRadius: "10px",
                  }}
                >
                  {audioUrl && (
                    <div>
                      <audio controls>
                        <source src={audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  <div ref={waveformRef}></div>
                </Box>
              </Grid>
              <Grid item xs={12} lg={9} md={9}>
                <CallSummaryCard />
              </Grid>

              {/* Transcript */}

              <Grid item xs={12} lg={7} md={7}>
                <Box
                  style={{
                    overflowY: "auto",
                    borderRadius: "10px",
                    background: "white",
                    // marginTop: "11px",
                    height: "64vh",
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                  }}
                  ref={conversationRef}
                >
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: "sticky",
                      top: "0",
                      background: "#167BF5",
                    }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginLeft: "4px",
                        color: "white",
                      }}
                    >
                      <SpeakerNotesOutlined />
                      <Typography className={classes.typo}>
                        Transcript
                      </Typography>
                    </Box>
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "end",
                        width: "100%",
                        marginRight: "12px",
                        color: "white",
                      }}
                    >
                      <SaveAlt />
                    </Box>
                  </Box>

                  <Divider />
                  {/* <Transcription /> */}
                  {/* <LiveTranscription /> */}
                  {/* <TranscriptComponent /> */}

                  {/* Iterate over conversationData to render conversation transcript */}
                  {conversationData.map((message, index) => {
                    const messageParts = message.split(': "');
                    const messageSpeaker = messageParts[0];
                    const messageContent = messageParts[1];

                    // Check if both messageSpeaker and messageContent are not empty
                    if (
                      !messageSpeaker ||
                      !messageContent ||
                      messageContent.trim() === ""
                    ) {
                      return null; // Skip rendering if either speaker or content is empty
                    }

                    const isAgent = messageSpeaker === "Agent";
                    const isCaller = messageSpeaker === "Caller";

                    return (
                      <Box
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: isAgent ? "flex-end" : "flex-start",
                        }}
                      >
                        {isCaller && (
                          <img
                            src="/images/phone.png"
                            alt={isCaller ? "Caller" : "Speaker"}
                            style={{
                              width: "40px",
                              height: "40px",
                              marginLeft: "10px",
                              alignSelf: "end",
                            }}
                          />
                        )}
                        <Box
                          style={{
                            boxShadow:
                              "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                            background: isAgent
                              ? "whitesmoke"
                              : isCaller
                              ? "rgb(62, 152, 211)"
                              : "#008B8B",
                            borderRadius: isAgent
                              ? "25px 25px 0px 25px"
                              : isCaller
                              ? "25px 25px 25px 0px"
                              : "25px 25px 25px 0px",
                            height: "auto",
                            margin: "12px",
                            padding: "12px",
                            width: "20vw",
                            color: isAgent ? "black" : "white",
                          }}
                        >
                          <Typography>{`${messageContent
                            .trim()
                            .replace(/"$/, "")}`}</Typography>
                        </Box>
                        {isAgent && (
                          <img
                            src="/images/call-center-agent.png"
                            alt={isAgent ? "Agent" : "Speaker"}
                            style={{
                              width: "40px",
                              height: "40px",
                              marginRight: "10px",
                              alignSelf: "end",
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Grid>

              <Grid item xs={12} lg={5} md={5}>
              <Box
          style={{
            background: "white",
            height: "30.8vh",
            overflowY: "auto",
            boxShadow:
              "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
            borderRadius: "10px",
            // marginTop: "11px",
          }}
          ref={answersRef} // Attach the ref to the recommended answers container
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              position: "sticky",
              top: 0,
              background: "#167BF5",
              color: "white",
            }}
          >
            <QuestionAnswer style={{ marginLeft: "5px" }} />
            <Typography className={classes.typo}>
              Recommended Answers
            </Typography>
          </Box>
          <Divider />
          <Box style={{ margin: "6px" }}>
            {Array.isArray(answers) &&
              answers.map((answer, index) => (
                <Box
                  key={index}
                  style={{
                    marginBottom: "20px",
                    maxWidth: "600px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{
                      textAlign: "center",
                      marginBottom: "10px",
                    }}
                  >
                    Answer {index + 1}
                  </Typography>
                  <Typography variant="body1">{answer}</Typography>
                </Box>
              ))}
          </Box>
        </Box>


                <Box
                  style={{
                    background: "white",
                    height: "32vh",
                    overflowY: "auto",
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                    borderRadius: "10px",
                    marginTop: "11px",
                  }}
                  ref={question}
                >
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: "sticky",
                      top: 0,
                      background: "#167BF5",
                      color: "white",
                    }}
                  >
                    <ContactSupportOutlined style={{ marginLeft: "5px" }} />
                    <Typography className={classes.typo}>
                      Recommended Question{" "}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box style={{ margin: "6px" }}>
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      {Array.isArray(questions) &&
                        questions.map((questionGroup, index) => (
                          <div
                            key={index}
                            style={{
                              marginBottom: "20px",
                              maxWidth: "600px",
                              border: "1px solid #ccc",
                              borderRadius: "8px",
                              padding: "20px",
                            }}
                          >
                            <Typography
                              variant="h6"
                              style={{
                                textAlign: "center",
                                marginBottom: "10px",
                              }}
                            >
                              Task {index + 1}
                            </Typography>
                            <div style={{ marginBottom: "10px" }}>
                              {questionGroup
                                .split("\n")
                                .filter((question) => question.trim() !== "")
                                .map((question, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      marginBottom: "10px",
                                      paddingLeft: "20px",
                                    }}
                                  >
                                    <Typography variant="body1">
                                      {question.trim()}
                                    </Typography>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} lg={3} md={3}>
            {/*   */}
            <Box
              style={{
                display: "flex",
                borderRadius: "10px",
                height: "16.5vh",
                marginBottom: "12px",
                boxShadow:
                  "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                background: "white",
                alignItems: "center",
                justifyContent: "space-evenly",
                padding: "0 15px",
              }}
            >
              <Box style={{ display: "flex", alignItems: "center" }}>
                <img
                  className="tlogo"
                  src="/images/sentiment-analysis.png"
                  alt="Logo"
                  style={{
                    height: "auto",
                    width: "70px",
                    marginRight: "20px",
                  }}
                />
                <Typography
                  variant="subtitle1"
                  style={{
                    color: "#02457a",
                    fontSize: "15px",
                    fontWeight: "500",
                  }}
                >
                  Sentiment Score: {avgSetiment}
                </Typography>
              </Box>
            </Box>

            {/* <Box
              style={{
                display: "flex",
                borderRadius: "10px",
                height: "7.5vh",
                marginBottom: "15px",
                boxShadow:
                  "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                background: "white",
                alignItems: "center",
                justifyContent: "space-evenly",
                padding: "0 15px",
              }}
            >
              <Box style={{ display: "flex", alignItems: "center" }}>
                <img
                  className="tlogo"
                  src="/images/ModerationScore.png"
                  alt="Logo"
                  style={{
                    height: "auto",
                    width: "40px",
                    marginRight: "10px",
                  }}
                />
                <Typography
                  variant="subtitle1"
                  style={{
                    color: "#02457a",
                    fontSize: "14px",
                  }}
                >
                  Moderation Score: 0
                </Typography>
              </Box>
            </Box> */}
            {/* Graph */}
            <Box
              style={{
                borderColor: "grey",
                borderRadius: "10px",
                height: "30.6vh",
                background: "white",
                boxShadow:
                  "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                marginBottom: "11px",
                padding: "10px",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  width={500}
                  height={400}
                  data={[
                    {
                      time: "1",
                      uv: positiveSentimentData[0] || 0,
                      pv: negativeSentimentData[0] || 0,
                    },
                    {
                      time: "2",
                      uv: positiveSentimentData[1] || 0,
                      pv: negativeSentimentData[1] || 0,
                    },
                    {
                      time: "3",
                      uv: positiveSentimentData[2] || 0,
                      pv: negativeSentimentData[2] || 0,
                    },
                    {
                      time: "4",
                      uv: positiveSentimentData[3] || 0,
                      pv: negativeSentimentData[3] || 0,
                    },
                    {
                      time: "5",
                      uv: positiveSentimentData[4] || 0,
                      pv: negativeSentimentData[4] || 0,
                    },
                  ]}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <defs>
                    <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="green" stopOpacity={1} />
                      <stop offset="50%" stopColor="yellow" stopOpacity={1} />
                      <stop offset="100%" stopColor="red" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="uv"
                    stroke="#000"
                    fill="url(#splitColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>

            {/* TOpics */}
            <Box
              style={{
                borderRadius: "10px",
                height: "32vh",
                overflowY: "auto",
                background: "white",
                boxShadow:
                  "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                marginTop: "11px",
                // width: "22vw"
              }}
              ref={transcriptRef}
            >
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  position: "sticky",
                  top: "0",
                  background: "#167BF5",
                  color: "white",
                }}
              >
                <Box
                  style={{
                    display: "flex",
                    marginLeft: "4px",
                    alignItems: "center",
                  }}
                >
                  <FindInPageOutlined />
                  <Typography className={classes.typo}>Topics </Typography>
                </Box>
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                    width: "80%",
                    marginRight: "12px",
                  }}
                >
                  <SaveAlt />
                </Box>
              </Box>
              <Divider />
              <Box style={{ margin: "5px" }}>
                {displayNLPOutput
                  .split(/\n/) // Split the text by newline characters
                  .filter((entry) => entry.trim() !== "") // Remove empty lines
                  .map((line, index) => {
                    const keyValuePairs = line.trim().split(/\s+(?=\w+:)/);

                    return (
                      <div key={index}>
                        {keyValuePairs.map((keyValuePair, kvIndex) => {
                          const [key, value] = keyValuePair.split(":");
                          return (
                            <Typography
                              key={kvIndex}
                              style={{ margin: "10px" }}
                            >
                              <strong>{key}:</strong> {value}
                            </Typography>
                          );
                        })}
                      </div>
                    );
                  })}
              </Box>
            </Box>
          </Grid>
        </Grid>
        <CallListButton />
      </Box>
    </>
  );
};
export default RealTimeCallAnalys;
