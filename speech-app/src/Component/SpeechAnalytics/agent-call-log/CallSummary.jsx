import React, { useState, useEffect } from "react";
import {
  TextField,
  Paper,
  Grid,
  Select,
  MenuItem,
  Box,
  Button,
  Typography,
  TextareaAutosize,
  FormControl,
  makeStyles,
  Avatar,
  Slider,
  Divider,
} from "@material-ui/core";
import jsPDF from "jspdf";
import "../real-time-call/Callrecords.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Rating from "@material-ui/lab/Rating";
import Charts from "../Charts";
import SentimentGraph from "./SentimentGraph";
import DonutChart from "./DonutChart";
import WordCloud from "./WordCloud";
import CallLifecycle from "./CallLifecycle";
import CallListButton from "../real-time-call/CallListButton";
import axios from "axios";


const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  typo: {
    fontWeight: "bold",
    fontSize: "14px",
    marginTop: "10px",
    color: "black",
    // padding: "10px",
  },
}));

const AgentCallSummary = (props) => {
  const classes = useStyles();
  const [callSummary, setCallSummary] = useState(null);
  const [sliderValue1, setSliderValue1] = useState(50); // Initial values
  const [sliderValue2, setSliderValue2] = useState(50);
  const [sliderValue3, setSliderValue3] = useState(50);
  const [value, setValue] = React.useState(2);

  const [transcriptionSummary, setTranscriptionSummary] = useState("");

  //  console.log("props.data",props.data)
  const handleSliderChange1 = (event, newValue) => {
    setSliderValue1(newValue);
  };

  const handleSliderChange2 = (event, newValue) => {
    setSliderValue2(newValue);
  };

  const handleSliderChange3 = (event, newValue) => {
    setSliderValue3(newValue);
  };

  const handleDownloadPDF = () => {
    if (callSummary) {
      const pdfDoc = new jsPDF();

      const pdfContent = `Call Summary
       Customer: ${callSummary.customerName}
       Incoming Calls: ${callSummary.callCount}
       Outgoing Calls: ${callSummary.callCount}
       Topics Discussed: ${callSummary.topics.join(", ")}
       Customer Satisfaction: ${callSummary.customerSatisfaction}
       AI Insights: ${callSummary.aiInsights}
       Avg Sentiment Score: ${callSummary.avgsentiment}
       Moderation Score: ${callSummary.moderation}
       Call Quality: ${callSummary.callQuality}
       Communication Skills: ${callSummary.communicationSkills}
       Call Duration: ${callSummary.callDuration}`;

      pdfDoc.text(pdfContent, 10, 10);
      pdfDoc.save("call_summary.pdf");
    }
  };
  useEffect(() => {
    if (props.data.transcription) {

      const prompt = `You are an AI assistant who will do the below task:
      You will be provided with a call transcription where a user and agent conversation is placed.
      The format of the provided data will be like this:
      ####
      Guest1:{Said Something}, Guest-2: {Said Something}....
      ####
      The Guest1 is Agent and Guest2 is Caller.
      You will have to understand the whole conversation and provide a description of the conversation in simple english terms.
      Ignore any other tags other than Agent and Caller.
      If the description is not possible or the conversation is only one way like only caller is speaking or user is only speaking say "NO DESCRIPTION".
      Do not make your own description stick to the transcription provided below.
      Transcription:
      ####
      \n\n${props.data.transcription}\n\n
      ####`
;
      // Make API call to Azure OpenAI Chat Completion service
      axios.post(
        'https://openai-glam.openai.azure.com/openai/deployments/gpt35-turbo/chat/completions?api-version=2024-02-15-preview',
        {
          messages: [
            {
              role: 'system',
              content: prompt  + ' <<<end of text>>>',
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': '0c7473739bb4409a82ce91a565fa983d',
          }
        }
      )
      .then(response => {
        // Extract summary from API response
         console.log("response",response.data.choices[0].message.content)
        const summary = response.data.choices[0].message.content;
        // Set the summary in the state
        setTranscriptionSummary(summary);
      })
      .catch(error => {
        console.error('Error fetching transcription summary:', error);
      });
    }
  }, [props.data.transcription]);
  

  return (
    <Box style={{ margin: "12px" }}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Box
            style={{
              height: "50vh",
              marginTop: "18px",
              textAlign: "center",
              width: "100%",
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              background: "#ecf5f7a3",
              borderRadius: "15px",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <img
                    className="tlogo"
                    src="/images/call-center-agent.png"
                    alt="Logo"
                    style={{
                      marginLeft: "10px",
                      height: "20vh",
                      width: "20vh",
                      border: "2px solid Blue",
                      borderRadius: "50%",
                    }}
                  />
                  <Typography>Anshu"Agent"</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <Box>
                    <div
                      style={{
                        width: 80,
                        height: 100,
                        margin: "5px",
                      }}
                    >
                      <CircularProgressbar
                        value="10" // Update with the selected timeframe
                        text="10" // Update with the selected timeframe
                        strokeWidth={8}
                        styles={buildStyles({
                          textColor: "darkblue",
                          pathColor: "darkblue",
                          trailColor: "lightblue",
                        })}
                      />
                      <Typography
                        color="textSecondary"
                        gutterBottom
                        style={{ fontSize: "14px", maxWidth: "max-content" }}
                      >
                        Avg.Score
                      </Typography>
                    </div>
                  </Box>
                  <Box>
                    <div
                      style={{
                        width: 80,
                        height: 100,
                        margin: "5px",
                      }}
                    >
                      <CircularProgressbar
                        value="10" // Update with the selected timeframe
                        text="10" // Update with the selected timeframe
                        strokeWidth={8}
                        styles={buildStyles({
                          textColor: "orange",
                          pathColor: "orange",
                          trailColor: "rgb(249 212 175)",
                        })}
                      />
                      <Typography
                        color="textSecondary"
                        gutterBottom
                        style={{ fontSize: "14px" }}
                      >
                        CSAT Score
                      </Typography>
                    </div>
                  </Box>
                  <Box>
                    <div
                      style={{
                        width: 80,
                        height: 100,
                        margin: "5px",
                      }}
                    >
                      <CircularProgressbar
                        value="10" // Update with the selected timeframe
                        text="10" // Update with the selected timeframe
                        strokeWidth={8}
                        styles={buildStyles({
                          textColor: "#056b05",
                          pathColor: "#056b05",
                          trailColor: "#abefab",
                        })}
                      />
                      <Typography
                        color="textSecondary"
                        gutterBottom
                        style={{ fontSize: "14px" }}
                      >
                        Coverage Score
                      </Typography>
                    </div>
                  </Box>
                </Box>
              </Grid>
            
            </Grid>
          </Box>
          <Box
            style={{
              height: "30vh",
              marginTop: "18px",
              width: "100%",
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              background: "#ecf5f7a3",
              borderRadius: "15px",
            }}
          >
            <Box style={{ margin: "15px" }}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Grid item xs={12}>
                    <Typography className={classes.typo}>Sentiment:</Typography>
                    <SentimentGraph
                      positive=" 40"
                      negative=" 30"
                      neutral=" 30"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography className={classes.typo}>Tonality:</Typography>
                  </Grid>
                  <Grid item xs={12} style={{ marginBottom: "12px" }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} container alignItems="center">
                        <Grid
                          item
                          xs={12}
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Avatar />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Typography className={classes.typo}>
                            Agent Tonality:
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid item xs={6} container alignItems="center">
                        <Grid
                          item
                          xs={12}
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Avatar />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Typography className={classes.typo}>
                            Customer Tonality:
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={9}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box
                style={{
                  marginTop: "18px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  className="tlogo"
                  src="/images/call-center-agent.png"
                  alt="Logo"
                  style={{
                    marginLeft: "10px",
                    height: "40px",
                    width: "40px",
                    border: "2px solid Blue",
                    borderRadius: "50%",
                  }}
                />

                <Typography style={{ marginLeft: "8px" }}>Anshu</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography className={classes.typo}>Description</Typography>
                <Typography component="p" variant="body2" color="textsecondary">
                 {transcriptionSummary || "Loading summary..."}
                </Typography>
              </Box>
            </Grid>
            <Divider />
            <Grid item xs={5}>
              <Typography className={classes.typo}>Call Duration</Typography>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  marginTop: "10px",
                  marginBottom: "20px",
                  background: "rgba(236, 245, 247, 0.64)",
                  boxShadow:
                    "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                  borderRadius: "15px",
                }}
              >
                <DonutChart agentTime="40" customerTime="30" silentTime="30" />
              </Box>
            </Grid>
            <Grid item xs={7}>
              <Typography className={classes.typo}>Word Cloud</Typography>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  marginBottom: "20px",
                  marginTop: "10px",
                  background: "rgba(236, 245, 247, 0.64)",
                  boxShadow:
                    "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                  height: "35vh",
                  borderRadius: "15px",
                }}
              >
                <WordCloud
                  text={transcriptionSummary}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              {/* <BoxWithPartitions /> */}
              <Typography className={classes.typo}>Call Lifecycle</Typography>
              <CallLifecycle />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <CallListButton/>
    </Box>
  );
};

export default AgentCallSummary;
