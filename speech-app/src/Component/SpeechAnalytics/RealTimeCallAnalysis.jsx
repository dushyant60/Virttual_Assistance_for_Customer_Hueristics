import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Divider,
    Grid,
    IconButton,
    Typography,
    makeStyles,
} from "@material-ui/core";
import {
    MicNoneRounded,
    PlayCircleFilled,
    PauseCircleFilled,
    SaveAlt,
    ShowChartIcon,
    SpeakerNotesOutlined,
    QuestionAnswerOutlined,
    FindInPageOutlined,
    CloudCircleOutlined,
    Stop,
    GraphicEqSharp,
    AddIcCall,
    AddIcCallOutlined,
} from "@material-ui/icons";
import axios from "axios";
import {
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
    LineChart,
    ReferenceLine,
    Line, // Import LabelList for displaying scores on the bars
    Label
} from "recharts";
import WaveSurfer from 'wavesurfer.js';
import { ResultReason, PropertyId } from "microsoft-cognitiveservices-speech-sdk";
import Sentiment from "sentiment";
import {
    getTokenOrRefresh,
    getKeyPhrases,
    getGPT3CustomPromptCompletion,
    getGPT3Summarize,
    getGPT3ParseExtractInfo,
} from "../../token_util";
import WordCloud from "./WordCloud";
import "react-circular-progressbar/dist/styles.css"; // Import the styles
import { CircularProgressbar } from "react-circular-progressbar";
import CallAgent from "./CallAgent";
import CallAgentc from "../../phone/App";
import Analysis from "./Analysis";
import CustomerList from "./CustomerList";
import CallSummaryCard from "./CallsRecords";
import './Callrecords.css'

const speechsdk = require("microsoft-cognitiveservices-speech-sdk");
var recognizer;
var conversationTranscriber
var synthesizer
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
        fontSize: "16px",
        padding: "10px",
        color: 'grey'
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


const RealTimeCallAnalysis = () => {
    const classes = useStyles();
    const [activeButton, setActiveButton] = useState("One");
    const [displayText, setDisplayText] = useState("READY to start call simulation");
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
    const [play, setplay] = useState(true)
    const [audioChunkSize] = useState(4096);
    const [recordingstart, setrecordingStart] = useState(false)
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
                setConversationData((prevData) => [...prevData, "\n", formattedSentence]);
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
        var convLanguage = 'en-US';

        speechConfig.speechRecognitionLanguage = convLanguage;
        recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        conversationTranscriber = new speechsdk.ConversationTranscriber(speechConfig);
        const pushStream = speechsdk.AudioInputStream.createPushStream();

        audioStreamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        let resultText = "";
        let nlpText = "";
        let entityText = "";
        const wavesurfer = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: 'blue',
            progressColor: 'purple',
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
        setrecordingStart(false)


        conversationTranscriber.sessionStarted = (s, e) => { };
        conversationTranscriber.transcribed = async (s, e) => {
            if (e.result.reason === ResultReason.RecognizedSpeech) {
                // console.log("TRANSCRIBED: Text=" + e.result.text + "Speaker ID=" + e.result.speakerId);
                resultText += `\n${e.result.text}`;
                setDisplayText(resultText);
                gptCustomPromptCompetion(resultText)
                recommandQuestion(resultText)
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

                 // Call the function to get call rescheduling decision
        const rescheduleDecision = await getCallReschedulingDecision(resultText);
        if (rescheduleDecision) {
          console.log("Call rescheduling event should be created.");
          // Add your logic to handle call rescheduling here
        } else {
          console.log("No need to reschedule the call.");
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
                setDisplayNLPOutput(nlpText.replace('<br/>', '\n'));
                // }
            } else if (e.result.reason === ResultReason.NoMatch) {
                resultText += "\n";
            }
        };
        recognizer.sessionStarted = (s, e) => { };
        setrecordingStart(false)
        conversationTranscriber.startTranscribingAsync(
            function () {
                const reader = new FileReader();

                reader.onload = function () {
                    const arrayBuffer = reader.result;

                    // Push audio data in chunks
                    for (let offset = 0; offset < arrayBuffer.byteLength; offset += audioChunkSize) {
                        const chunk = new Uint8Array(arrayBuffer.slice(offset, offset + audioChunkSize));
                        pushStream.write(chunk);
                        console.log("hii", pushStream.write(chunk))
                    }
                };
            },
            function (err) {
                console.trace('err - starting transcription: ' + err);
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
            setplay(false)
        }

    };

    const stopAudio = () => {
        if (waveform) {
            waveform.stop();
            setplay(true)
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
                setQuestions(generatedText)
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
                setQuestions(generatedText)
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

    const averagePositiveSentiment = calculateAverageSentiment(positiveSentimentData);
    const averageNegativeSentiment = calculateAverageSentiment(negativeSentimentData);
    const avgSetiment = averagePositiveSentiment + averageNegativeSentiment;
    return (
        <>
            <Box style={{ margin: "5PX" }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} lg={9} md={9}>
                        <Grid container spacing={1}>
                            <Grid item xs={12} lg={3} md={3}>
                                {/* <Box style={{ height: "70vh", display: "flex" }}> */}
                                <Box>
                                    <Box style={{ boxShadow: "grey 1px 2px 6px", height: "6vh", marginBottom: "12px", background: "white" }}>
                                        <Box style={{ height: "4.8vh", width: "100%", display: 'flex', justifyContent: "center", borderRadius: "4px", alignItems: 'center' }}>
                                            {/* <IconButton onClick={() => startRecording()} className={isRecording ? classes.activeMic : classes.micButton}><MicNoneRounded /></IconButton> */}
                                            {/* <CallAgent/> */}
                                            <CallAgentc />
                                            <IconButton>
                                                <AddIcCallOutlined />
                                            </IconButton>
                                            {/* <IconButton onClick={stopRecording} className={isRecording ? classes.stopButton : ""} disabled={!isRecording}><Stop /></IconButton> */}
                                            {recordingstart ?
                                                (play ?
                                                    (<IconButton><PlayCircleFilled onClick={playAudio}></PlayCircleFilled></IconButton>)
                                                    :
                                                    (<IconButton>
                                                        <PauseCircleFilled onClick={stopAudio}>
                                                        </PauseCircleFilled>
                                                    </IconButton>
                                                    )
                                                ) : ""

                                            }
                                        </Box>
                                    </Box>
                                    <Box style={{
                                        borderColor: "grey", borderRadius: "2px", background: "white", height: "9vh", overflowY: "auto", marginTop: "6px", background: "linear-gradient(45deg, white,#e0e6e7)",
                                        boxShadow: "1px 3px 4px slategrey",
                                    }}>
                                        <div ref={waveformRef}></div>
                                    </Box>
                                    <CustomerList />
                                </Box>
                            </Grid>
                            <Grid item xs={12} lg={6} md={6}>
                                <Box style={{ width: "100%", height: "100%" }}>
                                    <Box style={{ display: "flex", height: "6vh", marginBottom: "12px", boxShadow: "1px 3px 4px slategrey", background: "white", alignItems: "center", justifyContent: "center" }}>
                                        <Typography variant="subtitle1" style={{ color: "grey", marginLeft: "15px" }}>Sentiment Score:{avgSetiment}</Typography>
                                        {/* <Typography variant="subtitle1" style={{ color: "green", marginLeft: "10px" }}>+ve: {averagePositiveSentiment.toFixed(2)}</Typography>
                                        <Typography variant="subtitle1" style={{ color: "red", marginLeft: "12px" }}>-ve: {averageNegativeSentiment.toFixed(2)}</Typography> */}
                                        <Typography variant="subtitle1" style={{ color: "grey", marginLeft: "15px" }}>Moderation Score:0</Typography>
                                    </Box>
                                    <Box style={{ overflowY: "auto", borderRadius: "10px", background: "white", height: "65vh", boxShadow: "1px 3px 4px slategrey" }} ref={conversationRef} >
                                        <Box style={{ display: "flex", alignItems: "center", position: "sticky", boxShadow: "1px 3px 3px grey" }}className="element">
                                            <Box style={{ display: "flex", alignItems: "center", marginLeft: "4px"}}>
                                                <SpeakerNotesOutlined style={{ color: "grey" }} />
                                                <Typography className={classes.typo}>Transcript</Typography>
                                            </Box>
                                            <Box style={{ display: "flex", alignItems: "center", justifyContent: "end", width: "100%", marginRight: "12px" }}>
                                                <SaveAlt />
                                            </Box>
                                        </Box>

                                        <Divider />
                                        {conversationData.map((message, index) => {
                                            const messageParts = message.split(': "');
                                            const messageSpeaker = messageParts[0];
                                            const messageContent = messageParts[1];

                                            const isAgent = messageSpeaker === 'Agent';
                                            const isCaller = messageSpeaker === 'Caller';

                                            return (
                                                <Box key={index} style={{ display: "flex", justifyContent: isAgent ? "flex-end" : (isCaller ? "flex-start" : "center") }}>
                                                    <Box style={{
                                                        boxShadow: "grey 1px 2px 6px",
                                                        background: isAgent ? "whitesmoke" : (isCaller ? "blue" : "green"), // Customize colors as needed.
                                                        borderRadius: "12px",
                                                        height: "auto",
                                                        margin: "12px",
                                                        padding: "12px",
                                                        width: "22vw",
                                                        color: isAgent ? "black" : "white",
                                                    }}>
                                                        <Typography>{isAgent ? 'Agent' : (isCaller ? 'Caller' : 'Speaker')}</Typography>
                                                        <Typography>{`"${messageContent}`}</Typography>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} lg={3} md={3}>
                                <Box style={{
                                    background: "white",
                                    height: "72.5vh",
                                    overflowY: "auto",
                                    background: "white",
                                    boxShadow: "1px 3px 4px slategrey",
                                }} ref={question}>
                                    <Box style={{ display: "flex", alignItems: "center" }} className="element">
                                        <QuestionAnswerOutlined style={{ color: "grey", marginLeft: "5px" }} />
                                        <Typography className={classes.typo}>Recommended Question </Typography>
                                    </Box>
                                    <Divider />
                                    <Box style={{ margin: "6px" }}>
                                        <Box style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            {questions && (
                                                <Typography style={{ margin: "5px", textAlign: "center", textShadow: "grey 1px 2px 6px" }}>{questions}</Typography>
                                            )}
                                        </Box>
                                    </Box>

                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} lg={3} md={3}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Box style={{
                                    borderRadius: "10px",
                                    background: "white",
                                    boxShadow: "1px 3px 4px slategrey",
                                    height: "35.5vh"
                                }}>
                                    <Box style={{ width: "100%", display: "flex", marginLeft: "4px", alignItems: "center" }} className="element">
                                        <QuestionAnswerOutlined style={{ color: "grey" }} />
                                        <Typography className={classes.typo}>Recommended Answer </Typography>
                                    </Box>
                                    <Divider />
                                    <Box style={{ margin: "5px" }}>
                                        <Typography>{gptCustomPrompt}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} lg={12}>
                                <Box style={{
                                    borderRadius: "10px",
                                    height: "36vh",
                                    overflowY: "auto",
                                    background: "white",
                                    boxShadow: "1px 3px 4px slategrey"
                                }}
                                    ref={transcriptRef}>
                                    <Box className="element" style={{ display: "flex", alignItems: "center"}}>
                                        <Box style={{ width: "100%", display: "flex", marginLeft: "4px", alignItems: "center" }}>
                                            <FindInPageOutlined style={{ color: "grey" }} />
                                            <Typography className={classes.typo}>Topics </Typography>
                                        </Box>
                                        <Box style={{ display: "flex", alignItems: "center", justifyContent: "end", width: "80%", marginRight: "12px" }}>
                                            <SaveAlt />
                                        </Box>
                                    </Box>
                                    <Divider />
                                    <Box style={{ margin: "5px" }}>
                                        {displayNLPOutput
                                            .split(/\n/) // Split the text by newline characters
                                            .filter(entry => entry.trim() !== '') // Remove empty lines
                                            .map((line, index) => {
                                                const keyValuePairs = line.trim().split(/\s+(?=\w+:)/);

                                                return (
                                                    <div key={index}>
                                                        {keyValuePairs.map((keyValuePair, kvIndex) => {
                                                            const [key, value] = keyValuePair.split(':');
                                                            return (
                                                                <Typography key={kvIndex}>
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
                    </Grid>
                    <Grid item xs={7} style={{ maxWidth: "56.333333%", }}>
                        <Box>
                            <Box style={{
                                borderColor: "grey",
                                borderRadius: "3px",
                                height: "12.5vh",
                                background: "white",
                                background: "white",
                                boxShadow: "1px 3px 4px slategrey",
                            }}>
                                <ResponsiveContainer width="100%">
                                    <LineChart
                                        data={realTimeSentimentData.map((_, index) => ({
                                            timestamp: `Sample ${index + 1}`,
                                            positiveSentiment: positiveSentimentData[index] || 0, // Provide a default value if negative sentiment data is missing
                                            negativeSentiment: negativeSentimentData[index] || 0, // Provide a default value if negative sentiment data is missing
                                        }))}
                                    >
                                        <YAxis domain={[-10, 10]} />
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
                                        <ReferenceLine y={0} stroke="black" strokeDasharray="3 3" />
                                    </LineChart>
                                </ResponsiveContainer>

                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={5}>
                        <CallSummaryCard />
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}
export default RealTimeCallAnalysis;