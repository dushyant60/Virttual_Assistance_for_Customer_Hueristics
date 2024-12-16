import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import {
  PlayCircleFilled,
  SaveAlt,
  SpeakerNotesOutlined,
  QuestionAnswerOutlined,
  FindInPageOutlined,
  CloudCircleOutlined,
  Stop,
  CloudUploadRounded,
} from "@material-ui/icons";
import Sentiment from "sentiment";
import {
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  LineChart,
  ReferenceLine,
  Line, // Import LabelList for displaying scores on the bars
  Label,
  AreaChart,
  XAxis,
  Area,
} from "recharts";
import WaveSurfer from "wavesurfer.js";
import { getTokenOrRefresh, getKeyPhrases } from "../../../token_util";
import { ResultReason } from "microsoft-cognitiveservices-speech-sdk";
import WordCloud from "../agent-call-log/WordCloud";
import axios from "axios";
import CallListButton from "../real-time-call/CallListButton";
import Selectaudio from "./Selectaudio";

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
    fontWeight: "bold",
    fontSize: "14px",
    padding: "10px",
    // color: 'grey'
  },
});

const speechsdk = require("microsoft-cognitiveservices-speech-sdk");
var conversationTranscriber;
const RecordedCallAnalysis = () => {
  const [displayText, setDisplayText] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [displayNLPOutput, setDisplayNLPOutput] = useState("");
  const [realTimeSentimentData, setRealTimeSentimentData] = useState([]);
  const [positiveSentimentData, setPositiveSentimentData] = useState([]);
  const [negativeSentimentData, setNegativeSentimentData] = useState([]);
  const [summary, setSummary] = useState();
  const sentiment = new Sentiment();
  const [startTime, setStartTime] = useState(null);

  const [topicWords, setTopicWords] = useState([]);

  const transcriptRef = useRef(null);
  const entityRef = useRef(null);
  const [moderate, setModerate] = useState();
  const [fileurl, selectedFileUrl] = useState();


  const handleFile = async (file) => {
    try {
      // Fetch the audio file from the URL
      const response = await axios.get(file.url, { responseType: 'arraybuffer' });
      const audioData = response.data;

      // Create a blob from the audio data
      const audioBlob = new Blob([audioData]);

      // Create a proper file object
      const properFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
      selectedFileUrl(properFile)
      if (waveform && properFile) {
            // Load the selected audio file into WaveSurfer
            waveform.load(URL.createObjectURL(properFile));
          }
      // Now you can use properFile for transcription
      transcribeAudio(properFile);
    } catch (error) {
      console.error('Error fetching or transcribing audio:', error);
    }
  };

  const transcribeAudio = async (audioFile) => {
    // Fetch the audio file from the URL
    // const response = await fetch(File.url);
    // const audioData = await response.arrayBuffer(); // Convert audio data to ArrayBuffer
    // const response = await axios.get(File.url, { responseType: 'arraybuffer' });
    // const audioData = response.data;

    // Load the selected audio file into WaveSurfer if waveform is available
    // if (waveform && File.url) {
    //     waveform.load(File.url);
    // }

    // Create Speech SDK components
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
        tokenObj.authToken,
        tokenObj.region
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    // Create AudioConfig from the fetched audio data
    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);

    const recognizer = new speechsdk.SpeechRecognizer(
        speechConfig,
        audioConfig
    );

    recognizer.recognizeOnceAsync((result) => {
        let newDisplayText;
        if (result.reason === ResultReason.RecognizedSpeech) {
            newDisplayText = `RECOGNIZED: Text=${result.text}`;
            //    setDisplayText(newDisplayText);
            // const nlpObj = getKeyPhrases(result.text);
            const sentimentAnalysis = sentiment.analyze(result.text);
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
        } else {
            newDisplayText =
                "ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.";
        }
    });
};

useEffect(() => {
  // Extract topic words from displayNLPOutput and set to state
  const extractedWords = displayNLPOutput
    .split(/\n/)
    .filter((entry) => entry.trim() !== "")
    .map((line) => {
      const keyValuePairs = line.trim().split(/\s+(?=\w+:)/);
      return keyValuePairs.map((keyValuePair) => {
        const [key, value] = keyValuePair.split(":");
        return { text: key, value: value }; // Assuming value is a numerical representation of importance
      });
    })
    .flat();
  setTopicWords(extractedWords);

  // Create display text for the word cloud (optional)
  const textForCloud = extractedWords.map((wordObj) => wordObj.value).join(" ");
  setDisplayText(textForCloud);
}, [displayNLPOutput]);


  let nlpText = "";
  let entityText = "";

  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${seconds}s`;
  };

  useEffect(() => {
    async function checkToken() {
      const tokenRes = await getTokenOrRefresh();
      if (tokenRes.authToken === null) {
        setDisplayText(tokenRes.error);
      }
    }

    checkToken();
  }, []);

  // async function fileChange(event) {
  //   const audioFile = event.target.files[0];
  //   setSelectedFile(audioFile);
  //   const fileInfo = audioFile.name + ` size=${audioFile.size} bytes `;
  //   if (waveform && audioFile) {
  //     // Load the selected audio file into WaveSurfer
  //     waveform.load(URL.createObjectURL(audioFile));
  //   }

  //   setDisplayText(fileInfo);

  //   const tokenObj = await getTokenOrRefresh();
  //   const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
  //     tokenObj.authToken,
  //     tokenObj.region
  //   );
  //   speechConfig.speechRecognitionLanguage = "en-US";
  //   const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);
  //   const recognizer = new speechsdk.SpeechRecognizer(
  //     speechConfig,
  //     audioConfig
  //   );

  //   recognizer.recognizeOnceAsync((result) => {
  //     let newDisplayText;
  //     if (result.reason === ResultReason.RecognizedSpeech) {
  //       newDisplayText = `RECOGNIZED: Text=${result.text}`;
  //       //    setDisplayText(newDisplayText);
  //       // const nlpObj = getKeyPhrases(result.text);
  //       const sentimentAnalysis = sentiment.analyze(result.text);
  //       const sentimentScore = sentimentAnalysis.score;

  //       // Update the real-time sentiment data
  //       setRealTimeSentimentData((prevData) => [...prevData, sentimentScore]);
  //       if (sentimentScore >= 0) {
  //         setPositiveSentimentData((prevData) => [...prevData, sentimentScore]);
  //         setNegativeSentimentData((prevData) => [...prevData, null]); // Set null for negative data
  //       } else {
  //         setPositiveSentimentData((prevData) => [...prevData, null]); // Set null for positive data
  //         setNegativeSentimentData((prevData) => [...prevData, sentimentScore]);
  //       }
  //     } else {
  //       newDisplayText =
  //         "ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.";
  //     }
  //   });
  // }

  const [waveform, setWaveform] = useState(null);
  const [recognizer, setRecognizer] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversationData, setConversationData] = useState([]);

  const conversationRef = useRef(null);
  const question = useRef(null);
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

  useEffect(() => {
    const ws = WaveSurfer.create({
      container: "#waveform-container",
      waveColor: "blue",
      progressColor: "purple",
    });
    setWaveform(ws);

    return () => {
      if (ws) {
        ws.destroy();
      }
    };
  }, []);

  const startTranscriptionFromAudio = async () => {
    // const fileInput = document.getElementById("audio-file");
    // const selectedFile = fileInput.files[0];

    if (!fileurl) {
      return;
    }

    if (waveform) {
      waveform.play();
    }
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(fileurl);
    conversationTranscriber = new speechsdk.ConversationTranscriber(
      speechConfig,
      audioConfig
    );
    const pushStream = speechsdk.AudioInputStream.createPushStream();

    const reader = new FileReader();
    reader.onload = function () {
      const arrayBuffer = reader.result;
      pushStream.write(arrayBuffer);
    };

    reader.readAsArrayBuffer(fileurl);

    conversationTranscriber.sessionStarted = function (s, e) {
      setStartTime(new Date());
    };
    conversationTranscriber.sessionStopped = function (s, e) {
      const totalPositiveSentiment = positiveSentimentData.reduce(
        (sum, score) => sum + (score || 0),
        0
      );
      const totalNegativeSentiment = negativeSentimentData.reduce(
        (sum, score) => sum + (score || 0),
        0
      );
      const totalSegments = realTimeSentimentData.length;

      const averagePositiveSentiment = totalPositiveSentiment / totalSegments;
      const averageNegativeSentiment = totalNegativeSentiment / totalSegments;

      // Display or use these values as needed in your component

      conversationTranscriber.stopTranscribingAsync();
    };
    conversationTranscriber.canceled = function (s, e) {
      conversationTranscriber.stopTranscribingAsync();
    };
    conversationTranscriber.transcribed = async (s, e) => {
      // Calculate the duration in seconds
      const currentTime = new Date();
      const elapsedSeconds = Math.round((currentTime - startTime) / 1000);

      // Format the transcript with "speaker id: content (duration)" format
      const formattedDuration = formatDuration(elapsedSeconds);
      setTranscript(
        (prevTranscript) =>
          prevTranscript +
          e.result.speakerId +
          ": " +
          e.result.text +
          " (" +
          formattedDuration +
          ")" +
          "\n\n"
      );
      updateSpeakerAndSentence(e.result.speakerId, e.result.text);
      setDisplayText((prevTranscript) => prevTranscript + e.result.text);

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
      const nlpObj = await getKeyPhrases(e.result.text);
      const keyPhraseText = JSON.stringify(nlpObj.keyPhrasesExtracted);

      entityText = nlpObj.entityExtracted;

      nlpText += "\n" + entityText;
      setDisplayNLPOutput(nlpText.replace("<br/>", "\n"));
    };

    conversationTranscriber.startTranscribingAsync(
      function () {
        setIsTranscribing(true);
      },
      function (err) {
        console.trace("err - starting transcription: " + err);
      }
    );
  };
  const stopTranscriptionFromAudio = () => {
    if (waveform) {
      waveform.pause();
    }

    if (recognizer) {
      recognizer.stopContinuousRecognitionAsync();
    }
    setIsTranscribing(false);
    conversationTranscriber.stopTranscribingAsync();
    gptCustomPromptCompetion(conversationData);
    moderationCompetion(conversationData);
  };


  const classes = useStyles();
  useEffect(() => {
    if (transcriptRef.current) {
      // Scroll to the bottom of the transcript when displayText changes
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);
  useEffect(() => {
    if (entityRef.current) {
      // Scroll to the bottom of the transcript when displayText changes
      entityRef.current.scrollTop = entityRef.current.scrollHeight;
    }
  }, [displayNLPOutput]);

  const calculateAverage = (data) => {
    if (data.length === 0) {
      return "N/A";
    }

    const total = data.reduce((acc, score) => acc + (score || 0), 0);
    return (total / data.length).toFixed(2);
  };

  const gptCustomPromptCompetion = async (text) => {
    const apiKey = "69a048f7c20648b6be297521cbc9a94c";
    const endpoint =
      "https://openai-vach.openai.azure.com/openai/deployments/openai/completions?api-version=2023-09-15-preview";

    try {
      const response = await axios.post(
        endpoint,
        {
          prompt: `generate the proper sumumary into(20 to 30 words) of the following conversation between two person and don't mention caller agent only short summary without any garbage words or any special characters ${text}`,
          max_tokens: 60,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
        }
      );

      const summary = response.data.choices[0].text;
      setSummary(summary);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const moderationCompetion = async (text) => {
    const apiKey = "69a048f7c20648b6be297521cbc9a94c";
    const endpoint =
      "https://openai-vach.openai.azure.com/openai/deployments/openai/completions?api-version=2023-09-15-preview";

    try {
      const response = await axios.post(
        endpoint,
        {
          prompt: `hightight the moderate content with the categories and score:\n${text} "":"\n\n${text}`,
          max_tokens: 50,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
        }
      );

      const summary = response.data.choices[0].text;
      setModerate(summary);
    } catch (error) {
      console.error("Error:", error);
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
          // height: "86vh"
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={3} md={3}>
                {/* <Box style={{ height: "70vh", display: "flex" }}> */}
                <Box
                  style={{
                    height: "6vh",
                    marginBottom: "12px",
                    background: "white",
                    borderRadius: "10px",
                    padding: "10px",
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, .15)",
                    alignItems: "center",
                    justifyContent: "space-between",
                    display: "flex",
                  }}
                >
                  <Box
                    style={{
                      height: "4.8vh",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                   <Selectaudio onSelectFile={handleFile}/>
                  {/* <Button
                      component="label"
                      role={undefined}
                      variant=""
                      tabIndex={-1}
                      startIcon={<CloudUploadRounded />}
                      style={{
                        width: "60%",
                        height: "100%",
                        backgroundColor: "rgb(22, 123, 245)",
                        color: "White",
                        borderRadius: "10px",
                        marginRight: "10px",
                        fontSize: "11px",
                      }}
                    > */}
                      {/* Upload File
                      <input
                        type="file"
                        accept="audio/*"
                        id="audio-file"
                        // onChange={fileChange}
                        style={{ display: "none" }}
                      />
                    </Button> */}
                    
                    {fileurl && (
                      <IconButton
                        style={{
                          marginRight: "10px",
                          borderRadius: "10px",
                          height: "4.8vh",
                          minWidth: "5vh",
                          fontSize: "14px",
                          display: "Flex",
                          justifyContent: "space-between",
                          background: isTranscribing ? "#FF9973" : "#4CAF50",
                          color: "white",
                          padding: "10px",
                          boxShadow:
                            "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                        }}
                        onClick={
                          isTranscribing
                            ? stopTranscriptionFromAudio
                            : startTranscriptionFromAudio
                        }
                        className={
                          isTranscribing
                            ? classes.stopButton
                            : classes.micButton
                        }
                      >
                        {isTranscribing ? "Pause " : "Play "}
                        {isTranscribing ? <Stop /> : <PlayCircleFilled />}
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Box
                  style={{
                    borderColor: "grey",
                    height: "9vh",
                    overflowY: "auto",
                    marginTop: "6px",
                    background: "white",
                    borderRadius: "15px",
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, .15)",
                  }}
                >
                  <div id="waveform-container"></div>
                </Box>
                <Box
                  style={{
                    height: "65vh",
                    overflowY: "auto",
                    marginTop: "12px",
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, .15)",
                    background: "white",
                    borderRadius: "10px",
                  }}
                >
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#167BF5",
                      color: "white",
                    }}
                  >
                    <QuestionAnswerOutlined style={{ marginLeft: "8px" }} />
                    <Typography className={classes.typo}>
                      Call Report
                    </Typography>
                  </Box>
                  <Divider />
                  <Box style={{ margin: "6px" }}>
                    <Box
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "10px",
                      }}
                    >
                      <Grid contianer spacing={2}>
                        {/* <Grid item xs={12}>
                          {summary && (
                            <>
                              <Typography
                                color="default"
                                variant="h4"
                                component="h2"
                                style={{
                                  fontSize: "15px",
                                  textDecoration: "Bold",
                                }}
                              >
                                Short Summary:
                              </Typography>
                              <Typography color="textSecondary">
                                {summary}
                              </Typography>
                            </>
                          )}
                        </Grid> */}

                        <Box
                          style={{
                            overflowY: "auto",
                            marginTop: "25px",
                            background: "whitesmoke",
                            borderRadius: "10px",
                            padding: "10px",
                          }}
                        >
                          <Grid item xs={12}>
                            {moderate && (
                              <Typography
                                variant="body1"
                                style={{
                                  textAlign: "Center",
                                  marginBottom: "5px",
                                }}
                              >
                                Moderation score:none
                              </Typography>
                            )}
                          </Grid>
                          {moderate && (
                            <Grid item xs={12}>
                              <Typography
                                variant="body1"
                                style={{ textAlign: "center" }}
                              >
                                Avg <span style={{ color: "green" }}>+ve</span>{" "}
                                Sentiment:{" "}
                                {calculateAverage(positiveSentimentData)}
                              </Typography>
                              <Typography
                                variant="body1"
                                style={{ textAlign: "center" }}
                              >
                                Avg <span style={{ color: "red" }}>-ve</span>{" "}
                                Sentiment:{" "}
                                {calculateAverage(negativeSentimentData)}
                              </Typography>
                            </Grid>
                          )}
                        </Box>
                      </Grid>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} lg={9} md={9}>
                <Box>
                  <Box
                    style={{
                      borderColor: "grey",
                      height: "12.5vh",
                      borderRadius: "10px",
                      background: "white",
                      boxShadow:
                        "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, .15)",
                      marginBottom: "12px",
                      paddingTop: "10px",
                    }}
                  >
                    <ResponsiveContainer
                      width="100%"
                      style={{ marginLeft: "-15px" }}
                    >
                      <AreaChart
                        data={realTimeSentimentData.map((_, index) => ({
                          time: `${index + 1}`,
                          uv: positiveSentimentData[index] || 0,
                          pv: negativeSentimentData[index] || 0,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip />
                        <defs>
                          <linearGradient
                            id="splitColor"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#87CEEB"
                              stopOpacity={1}
                            />
                            <stop
                              offset="50%"
                              stopColor="#4682B4"
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor="#1E90FF"
                              stopOpacity={1}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="uv"
                          stroke="green"
                          fill="url(#splitColor)"
                          strokeWidth={2}
                          dot={false}
                          legendType="none"
                        />
                        <Area
                          type="monotone"
                          dataKey="pv"
                          stroke="red"
                          fill="url(#splitColor)"
                          strokeWidth={2}
                          dot={false}
                          legendType="none"
                        />
                        <ReferenceLine
                          y={0}
                          stroke="black"
                          strokeDasharray="3 3"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
                <Box
                  style={{
                    overflowY: "auto",
                    borderRadius: "10px",
                    height: "69.2vh",
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, .15)",
                    background: "white",
                  }}
                  ref={transcriptRef}
                >
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: "sticky",
                      top:0,
                      background: "#167BF5",
                      color: "white",
                    }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginLeft: "4px",
                      }}
                    >
                      <SpeakerNotesOutlined style={{ marginLeft: "8px" }} />
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
                      }}
                    >
                      <SaveAlt />
                    </Box>
                  </Box>

                  <Divider />
                  {conversationData.map((message, index) => {
                    const messageParts = message.split(': "');
                    const messageSpeaker = messageParts[0];
                    const messageContent = messageParts[1];

                    const isAgent = messageSpeaker === "Agent";
                    const isCaller = messageSpeaker === "Caller";

                    return (
                      <Box
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: isAgent
                            ? "flex-end"
                            : isCaller
                            ? "flex-start"
                            : "center",
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
                            width: "22vw",
                            color: isAgent ? "black" : "white",
                          }}
                        >
                          {/* <Typography>
                            {isAgent
                              ? "Agent"
                              : isCaller
                              ? "Caller"
                              : "Speaker"}
                          </Typography> */}
                          <Typography>{`${messageContent.trim().replace(/"$/, '')}`}</Typography>
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
            </Grid>
          </Grid>
          <Grid item xs={12} lg={4} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  style={{
                    borderRadius: "10px",
                    height: "40vh",
                    overflowY: "auto",
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, .15)",
                    marginLeft: "12px",
                    background: "white",
                  }}
                  ref={transcriptRef}
                >
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      top:0,
                      position:"sticky",
                      background: "#167BF5",
                      color: "white",
                    }}
                  >
                    <Box
                      style={{
                        width: "100%",
                        display: "flex",
                        marginLeft: "4px",
                        alignItems: "center",
                      }}
                    >
                      <FindInPageOutlined style={{ marginLeft: "8px" }} />
                      <Typography className={classes.typo}>Topics</Typography>
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
                                <Typography key={kvIndex}>
                                  <strong>{key}:</strong> {value}
                                </Typography>
                              );
                            })}
                            {/* s<br /> Add a line break between key-value pairs */}
                          </div>
                        );
                      })}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} lg={12}>
                <Box
                  style={{
                    borderRadius: "10px",
                    height: "41vh",
                    overflowY: "auto",
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, .15)",
                    marginLeft: "12px",
                    background: "white",
                  }}
                >
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#167BF5",
                      color: "white",
                    }}
                  >
                    <Box
                      style={{
                        width: "100%",
                        display: "flex",
                        marginLeft: "4px",
                        alignItems: "center",
                      }}
                    >
                      <CloudCircleOutlined style={{ marginLeft: "8px" }} />
                      <Typography className={classes.typo}>
                        Word Cloud{" "}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box style={{ margin: "5px" }}>
                    <WordCloud text={displayText} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <CallListButton/>
      </Box>
    </>
  );
};
export default RecordedCallAnalysis;
