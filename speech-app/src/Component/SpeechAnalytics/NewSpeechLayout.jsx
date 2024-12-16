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
    },
});

const NewSpeechLayout = () => {
    const classes = useStyles();
    const [activeButton, setActiveButton] = useState("One");
    const [value, setValue] = useState("");
    const [displayText, setDisplayText] = useState("READY to start call simulation");
    const [displayNLPOutput, setDisplayNLPOutput] = useState("");
    const [gptSummaryText, setGptSummaryText] = useState("");
    const [gptExtractedInfo, setGptExtractedInfo] = useState("");
    const [gptCustomPrompt, setGptCustomPrompt] = useState("");
    const [gptCustomPrompt2, setGptCustomPrompt2] = useState("");
    const [isMicActive, setIsMicActive] = useState(false);
    const audioStreamRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
    const [realTimeSentimentData, setRealTimeSentimentData] = useState([]);
    const [positiveSentimentData, setPositiveSentimentData] = useState([]);
    const [negativeSentimentData, setNegativeSentimentData] = useState([]);
    const sentiment = new Sentiment();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const [isRecording, setIsRecording] = useState(false);
    const [blobURL, setBlobURL] = useState('');
    const audioInputRef = useRef(null);
    const [conversationData, setConversationData] = useState([]);
    const [waveform, setWaveform] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const waveformRef = useRef(null);
    const [play, setplay] = useState(true)
    const [conversation, setConversation] = useState([]);
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
    console.log("sdk", speechsdk)
    const updateSpeakerAndSentence = (speaker, sentence) => {
        const formattedSentence = `${speaker}: "${sentence}"\n`;

        if (conversationData.length > 0) {
            const lastItem = conversationData[conversationData.length - 1];
            const lastSpeaker = lastItem.split(":")[0];
            if (lastSpeaker !== speaker) {
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

                //   reader.readAsArrayBuffer(selectedFile);
            },
            function (err) {
                console.trace('err - starting transcription: ' + err);
            }
        );
        // recognizer.startContinuousRecognitionAsync();

    };
    const stopRecording = async () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            // recognizer.stopContinuousRecognitionAsync();
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
        const apiKey = "d16b1687d7e74abba454985575c09f1a";
        const endpoint =
            "https://onelogica-azure-openai.openai.azure.com/openai/deployments/azure-gpt-35-turbo/completions?api-version=2022-12-01";

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

    const recommandQuestion = async (text) => {
        const apiKey = "d16b1687d7e74abba454985575c09f1a";
        const endpoint =
            "https://onelogica-azure-openai.openai.azure.com/openai/deployments/azure-gpt-35-turbo/completions?api-version=2022-12-01";

        try {
            const response = await axios.post(
                endpoint,
                {
                    prompt: `Generate relevant questions based on the following text:\n\n${text}`,
                    max_tokens: 100, // Allow for more tokens in the response
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
                // Split the generated text by "Questions:"
                // const questionsPart = generatedText.split("Questions:")[1];
                // if (questionsPart) {
                //     // Split the questions by lines and trim each line
                //     const questionsArray = questionsPart.split("\n").map((line) => line.trim());
                //     // Filter out empty lines
                //     const filteredQuestions = questionsArray.filter((line) => line !== "");
                //     // Join the questions with newline characters to display them on separate lines
                //     const formattedQuestions = filteredQuestions.join("\n");
                //     setQuestions(formattedQuestions); // Set the current question
                //     console.log("Generated Questions:\n", formattedQuestions);
                // } else {
                //     console.log("No questions found in the generated text.");
                // }
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

    return (
        <Box style={{ margin: "10px", padding: "0px" }}>
            <Grid container spacing={1}>
                <Grid item xs={2}>
                    <Box style={{ border: "1px solid #cccccc", borderRadius: "4px", height: "25vh", width: "100%" }}>
                        <Box style={{ height: "20vh", width: "100%" }}>
                            <img src="/images/speekingrobo.webp" height="150vh" width="100%" />
                        </Box>
                        <Box style={{ height: "4.8vh", width: "100%", display: 'flex', justifyContent: "center", background: "white", borderRadius: "4px" }}>
                            <IconButton onClick={() => startRecording()} className={isRecording ? classes.activeMic : classes.micButton}><MicNoneRounded /></IconButton>
                            <IconButton onClick={stopRecording} className={isRecording ? classes.stopButton : ""} disabled={!isRecording}><Stop /></IconButton>
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
                </Grid>
                <Grid item xs={10}>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Box
                                style={{
                                    height: "11.8vh",
                                    width: "100%",
                                    background: "white",
                                    border: "1px solid #cccccc",
                                    borderRadius: "4px",
                                    overflowY: "auto"
                                }}
                            >
                                <div ref={waveformRef}></div>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box
                                style={{
                                    height: "11.8vh",
                                    width: "100%",
                                    background: "white",
                                    border: "1px solid #cccccc",
                                    borderRadius: "4px",
                                }}
                            >
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
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Box style={{ height: "5vh", width: "100%" }}>
                        <ButtonGroup disableElevation variant="contained" color="primary">
                            <Button
                                onClick={() => handleButtonClick("One")}
                                className={activeButton === "One" ? classes.activeMic : ""}
                            // startIcon={<SpeakerNotesOutlined />}
                            >
                                Typescript
                            </Button>
                            <Button
                                onClick={() => handleButtonClick("Two")}
                                className={activeButton === "Two" ? classes.activeMic : ""}
                            // startIcon={<FindInPageOutlined/>}
                            >
                                Entity
                            </Button>
                        </ButtonGroup>
                    </Box>
                </Grid>
                {activeButton === "One" && (
                    <>
                        <Grid item xs={4}>
                            <Box style={{ height: "53vh", width: "100%", background: "white", border: "1px solid #cccccc", borderRadius: "4px", overflowY: "auto" }} ref={conversationRef}>
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Box style={{ display: "flex", alignItems: "center", marginLeft: "4px" }}>
                                        <SpeakerNotesOutlined />
                                        {/* <CustomizedDialogs
                      data={displayText}
                    /> */}
                                        <Typography className={classes.typo}>Transcript</Typography>
                                    </Box>
                                    <Box style={{ display: "flex", alignItems: "center", justifyContent: "end", width: "100%", marginRight: "12px" }}>
                                        <SaveAlt />
                                    </Box>
                                </Box>

                                <Divider />
                                <Box style={{ margin: "5px" }}>
                                    {/* <Typography id="transcriptTextarea">
                                        {displayText}
                                    </Typography> */}
                                    {/* {conversationData.map((line, index) => (
                                        <Typography key={index}>{line}</Typography>
                                    ))} */}
                                    {conversationData.map((line, index) => {
                                        // Split the line into speaker and text
                                        const parts = line.split(":");
                                        if (parts.length === 2) {
                                            const speaker = parts[0].trim();
                                            const text = parts[1].trim();
                                            return (
                                                <div key={index}>
                                                    <span style={{ fontWeight: "bold" }}>{speaker}:</span> {text}
                                                </div>
                                            );
                                        } else {
                                            // If the line doesn't contain both speaker and text, render it as is
                                            return <div key={index}>{line}</div>;
                                        }
                                    })}
                                </Box>
                            </Box>

                        </Grid>
                        <Grid item xs={4}>
                            <Box style={{ border: "2px solid red", height: "53vh", width: "100%", background: "white", border: "1px solid #cccccc", borderRadius: "4px" }}>
                                <Box style={{ width: "100%", display: "flex", marginLeft: "4px", alignItems: "center", }}>
                                    <QuestionAnswerOutlined />
                                    <Typography className={classes.typo}>Recommended Answer </Typography>
                                </Box>
                                <Divider />
                                <Box style={{ margin: "5px" }}>
                                    <Typography>{gptCustomPrompt}</Typography>
                                </Box>

                            </Box>

                        </Grid>
                        <Grid item xs={4}>
                        <Box style={{ height: "53vh", width: "100%", background: "white", border: "1px solid #cccccc", borderRadius: "4px", overflowY: "auto" }} ref={question}>
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <QuestionAnswerOutlined />
                                    <Typography className={classes.typo}>Recommended Question </Typography>
                                </Box>
                                <Divider />
                                <Box style={{ margin: "5px" }}>
                                    {questions && (
                                        <Typography style={{ whiteSpace: "pre-line", border: "1px solid #ececec", borderRadius: "12px", background: "#e7e7e7", padding: "5px,10px" }}>{questions}</Typography>
                                    )}
                                </Box>

                            </Box>
                        </Grid>
                    </>
                )}
                {activeButton === "Two" && (
                    <React.Fragment>
                        <Grid item xs={4}>
                            <Box
                                style={{
                                    height: "53vh",
                                    width: "100%",
                                    background: "white",
                                    border: "1px solid #cccccc",
                                    borderRadius: "4px",
                                    overflowY: "auto"
                                }}
                                ref={transcriptRef}
                            >
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Box style={{ width: "100%", display: "flex", marginLeft: "4px", alignItems: "center" }}>
                                        <FindInPageOutlined />
                                        <Typography className={classes.typo}>Entity Extraction </Typography>
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
                                                    {/* s<br /> Add a line break between key-value pairs */}
                                                </div>
                                            );
                                        })}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box
                                style={{
                                    height: "53vh",
                                    width: "100%",
                                    background: "white",
                                    border: "1px solid #cccccc",
                                    borderRadius: "4px",
                                }}
                            >
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Box style={{ width: "100%", display: "flex", marginLeft: "4px", alignItems: "center", }}>
                                        <CloudCircleOutlined />
                                        <Typography className={classes.typo}>Word Cloud</Typography>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box style={{ margin: "5px", justifyContent: "center", alignItems: "center" }}>
                                    <WordCloud text={displayText} />
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box
                                style={{
                                    height: "53vh",
                                    width: "100%",
                                    background: "white",
                                    border: "1px solid #cccccc",
                                    borderRadius: "4px",
                                }}
                            >
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Box style={{ width: "100%", display: "flex", marginLeft: "4px", alignItems: "center", }}>
                                        <CloudCircleOutlined />
                                        <Typography className={classes.typo}>Analysis</Typography>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box style={{ margin: "5px" }}>
                                    <WordCloud text={displayNLPOutput} />
                                </Box>
                            </Box>
                        </Grid>
                    </React.Fragment>
                )}
            </Grid>
        </Box>
    );
};

export default NewSpeechLayout;