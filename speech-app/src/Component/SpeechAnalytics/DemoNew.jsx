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
  PlayCircleFilled,
  PauseCircleFilled,
  SaveAlt,
  SpeakerNotesOutlined,
  QuestionAnswerOutlined,
  FindInPageOutlined,
  AddIcCallOutlined,
  PhoneForwarded,
  PhoneForwardedOutlined,
  MicNoneRounded,
  Stop,
  QuestionAnswerRounded,
  ContactSupportOutlined,
  SentimentSatisfied,
  Report,
  SentimentSatisfiedAltTwoTone,
} from "@material-ui/icons";
import axios from "axios";
import {
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  LineChart,
  ReferenceLine,
  Line, // Import LabelList for displaying scores on the bars
  Label,
} from "recharts";
import WaveSurfer from "wavesurfer.js";
import {
  ResultReason,
  PropertyId,
} from "microsoft-cognitiveservices-speech-sdk";
import Sentiment from "sentiment";
import { getTokenOrRefresh, getKeyPhrases } from "../../token_util";
import CallAgentc from "../../phone/App";
import CallSummaryCard from "./CallsRecords";
import "./Callrecords.css";
import LiveTranscription from "./Transcript";
import WaitingCallList from "./WaitingCallList";

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
  const [displayText, setDisplayText] = useState(
    "READY to start call simulation"
  );
  const [displayNLPOutput, setDisplayNLPOutput] = useState("");
  const [gptCustomPrompt, setGptCustomPrompt] = useState("");
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
  // Create a media recorder to capture audio
  // let mediaRecorder;
  const transcriptRef = useRef(null);

  useEffect(() => {
    async function checkToken() {
      const tokenRes = await getTokenOrRefresh();
      if (tokenRes.authToken === null) {
        setDisplayText("FATAL_ERROR amc: " + tokenRes.error);
      }
    }

    checkToken();
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
    setGptCustomPrompt("");
    setWaveform(null);
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

    conversationTranscriber.sessionStarted = (s, e) => { };
    conversationTranscriber.transcribed = async (s, e) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        // console.log("TRANSCRIBED: Text=" + e.result.text + "Speaker ID=" + e.result.speakerId);
        resultText += `\n${e.result.text}`;
        setDisplayText(resultText);
        gptCustomPromptCompetion(resultText);
        recommandQuestion(resultText);
        updateSpeakerAndSentence(e.result.speakerId, e.result.text);
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

        if (keyPhraseText.length > 15) {
          // nlpText += "\n" + entityText;
          // setDisplayNLPOutput(nlpText.replace("<br/>", "\n"));
        }

        // if (entityText!=="NoEnt") {
        nlpText += "\n" + entityText;
        setDisplayNLPOutput(nlpText.replace("<br/>", "\n"));
        // }
      } else if (e.result.reason === ResultReason.NoMatch) {
        resultText += "\n";
      }
    };
    recognizer.sessionStarted = (s, e) => { };
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
            console.log("hii", pushStream.write(chunk));
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

  const gptCustomPromptCompetion = async (text) => {
    const apiKey = "69a048f7c20648b6be297521cbc9a94c";
    const endpoint =
      "https://openai-vach.openai.azure.com/openai/deployments/openai/completions?api-version=2023-09-15-preview";

    try {
      const response = await axios.post(
        endpoint,
        {
          prompt: `please suggest some answer based in this text "":"\n\n${text}`,
          // prompt: `You are an AI enabled customer call assisstant. Your job is to assisstant the agent who is on a real time call. You have to recommend
          // answers to the agent based on the conversation. The conversation is delimited by "":"\n\n${text}".`,
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
      setGptCustomPrompt(summary);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const [questions, setQuestions] = useState([]);
  const [moderate, setmoderate] = useState([]);

  const recommandQuestion = async (text) => {
    const apiKey = "69a048f7c20648b6be297521cbc9a94c";
    const endpoint =
      "https://openai-vach.openai.azure.com/openai/deployments/openai/completions?api-version=2023-09-15-preview";

    try {
      const response = await axios.post(
        endpoint,
        {
          prompt: `Generate 5 to 7 relevant questions in 5 to 10 words based on the following text:\n\n${text} "only question without adding any other content"`,
          max_tokens: 100,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
        }
      );

      if (response.data.choices && response.data.choices.length > 0) {
        const generatedText = response.data.choices[0].text;
        setQuestions(generatedText);
      } else {
        console.log("No response from the model.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const Moderation = async (text) => {
    const apiKey = "69a048f7c20648b6be297521cbc9a94c";
    const endpoint =
      "https://openai-vach.openai.azure.com/openai/deployments/openai/completions?api-version=2023-09-15-preview";

    try {
      const response = await axios.post(
        endpoint,
        {
          prompt: `generate the score of the moderate:${text}`,
          max_tokens: 100,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
        }
      );

      if (response.data.choices && response.data.choices.length > 0) {
        const generatedText = response.data.choices[0].text;
        setQuestions(generatedText);
      } else {
        console.log("No response from the model.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
  }, [displayNLPOutput]);

  useEffect(() => {
    if (question.current) {
      // Scroll to the bottom of the transcript when displayText changes
      question.current.scrollTop = question.current.scrollHeight;
    }
  }, [questions]);

  const calculateAverageSentiment = (scores) => {
    if (scores.length === 0) {
      return 0;
    }

    const sum = scores.reduce((acc, score) => acc + score, 0);
    return sum / scores.length;
  };

  const averagePositiveSentiment = calculateAverageSentiment(
    positiveSentimentData
  );
  const averageNegativeSentiment = calculateAverageSentiment(
    negativeSentimentData
  );
  const avgSetiment = averagePositiveSentiment + averageNegativeSentiment;
  return (
    <>
      <Box
        style={{
          margin: "10px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // height: "83vh",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} lg={4} md={4}>
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
                      borderRadius: "4px",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <IconButton
                      onClick={() => startRecording()}
                      className={
                        isRecording ? classes.activeMic : classes.micButton
                      }
                    >
                      <MicNoneRounded />
                    </IconButton>
                    {/* <CallAgent/>
                                            {/* <Box style={{ display: "flex" }}>
                                                <CallAgentc onClick={startRecording} />
                                                <Tooltip title="Add call">
                                                    <IconButton style={{ height: "1.5em", background: "blue", width: "1.5em", color: "white", marginRight: "5px" }}>
                                                        <AddIcCallOutlined />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Transfer call">
                                                    <IconButton style={{ height: "1.5em", background: "grey", width: "1.5em", color: "white", marginRight: "5px" }}>
                                                        <PhoneForwardedOutlined />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box> */}
                    <IconButton
                      onClick={stopRecording}
                      className={isRecording ? classes.stopButton : ""}
                      disabled={!isRecording}
                    >
                      <Stop />
                    </IconButton>
                    {recordingstart ? (
                      play ? (
                        <IconButton>
                          <PlayCircleFilled
                            onClick={playAudio}
                          ></PlayCircleFilled>
                        </IconButton>
                      ) : (
                        <IconButton>
                          <PauseCircleFilled
                            onClick={stopAudio}
                          ></PauseCircleFilled>
                        </IconButton>
                      )
                    ) : (
                      ""
                    )}
                  </Box>
                </Box>
                <Box
                  style={{
                    borderColor: "grey",
                    background: "white",
                    height: "11vh",
                    overflowY: "auto",
                    marginTop: "6px",
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                    borderRadius: "10px",
                  }}
                >
                  <div ref={waveformRef}></div>
                </Box>
              </Grid>
              <Grid item xs={12} lg={8} md={8}>
                <CallSummaryCard />
              </Grid>


              {/* Transcript */}

              <Grid item xs={12} lg={8} md={8}>
                <Box
                  style={{
                    overflowY: "auto",
                    borderRadius: "10px",
                    background: "white",
                    marginTop: "11px",
                    height: "62vh",
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
                  <LiveTranscription />
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
                              alignSelf: "end"

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
                            borderRadius: isAgent ? "25px 25px 0px 25px" : isCaller ? "25px 25px 25px 0px" : "25px 25px 25px 0px",
                            height: "auto",
                            margin: "12px",
                            padding: "12px",
                            width: "20vw",
                            color: isAgent ? "black" : "white",
                          }}
                        >
                          <Typography>
                            {isAgent
                              ? "Agent"
                              : isCaller
                                ? "Caller"
                                : "Speaker"}
                          </Typography>
                          <Typography>{`"${messageContent}`}</Typography>
                        </Box>
                        {isAgent && (
                          <img
                            src="/images/call-center-agent.png"
                            alt={isAgent ? "Agent" : "Speaker"}
                            style={{
                              width: "40px",
                              height: "40px",
                              marginRight: "10px",
                              alignSelf: "end"
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Grid>

              <Grid item xs={12} lg={4} md={4}>
                <Box
                  style={{
                    borderRadius: "10px",
                    height: "29.5vh",
                    overflowY: "auto",
                    background: "white",
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                    marginTop: "11px",
                    // width: "22vw"
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
                        display: "flex",
                        marginLeft: "4px",
                        alignItems: "center",
                      }}
                    >
                      <QuestionAnswerOutlined />
                      <Typography className={classes.typo}>
                        Recommended Answer{" "}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box style={{ margin: "5px" }}>
                    <Typography style={{ margin: "10px" }}>
                      {gptCustomPrompt}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  style={{
                    background: "white",
                    height: "31vh",
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
                      }}
                    >
                      {questions && (
                        <Typography
                          style={{ margin: "10px", textAlign: "Left" }}
                        >
                          {questions}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} lg={4} md={4}>

            {/*   */}
            <Box
              style={{
                display: "flex",
                borderRadius: "10px",
                height: "6vh",
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
                    width: "40px",
                    marginRight: "10px"
                  }} />
                <Typography
                  variant="subtitle1"
                  style={{
                    color: "#02457a",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Sentiment Score: {avgSetiment}
                </Typography>
              </Box>
              <Divider />
              <Box style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "24px" }}>📑</span>
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
            </Box>
            {/* Graph */}
            <Box
              style={{
                borderColor: "grey",
                borderRadius: "10px",
                height: "11vh",
                background: "white",
                boxShadow:
                  "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                marginBottom: "11px",
              }}
            >
              <ResponsiveContainer width="100%">
                <LineChart
                  data={realTimeSentimentData.map((_, index) => ({
                    timestamp: `Sample ${index + 1}`,
                    positiveSentiment:
                      positiveSentimentData[index] || 0,
                    negativeSentiment:
                      negativeSentimentData[index] || 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="positiveSentiment"
                    stroke="green"
                    fill="green"
                    strokeWidth={2}
                    dot={false}
                    legendType="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="negativeSentiment"
                    stroke="red"
                    fill="red"
                    strokeWidth={2}
                    dot={false}
                    legendType="none"
                  />
                  <ReferenceLine
                    y={0}
                    stroke="black"
                    strokeDasharray="3 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* TOpics */}
            <Box
              style={{
                borderRadius: "10px",
                height: "35.5vh",
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
                  <Typography className={classes.typo}>
                    Topics{" "}
                  </Typography>
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
                    const keyValuePairs = line
                      .trim()
                      .split(/\s+(?=\w+:)/);

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
      </Box>
    </>
  );
};
export default RealTimeCallAnalys;
