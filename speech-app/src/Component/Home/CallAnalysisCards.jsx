import React from "react";
import { Box, Typography, Grid } from "@material-ui/core";
import {
  AvTimer,
  CheckCircleOutline,
  Event,
  NotInterested,
  Phone,
  PhoneCallbackOutlined,
  PhoneMissedOutlined,
  Schedule,
  SentimentSatisfied,
} from "@material-ui/icons";

const CallAnalysisCards = () => {
  return (
    <>
      <Box
        style={{
          background: "white",
          height: "26vh",
          width: "100%",
          borderRadius: "10px",
          boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Box style={{ height: "12.5vh", width: "100%", display: "flex", padding:"10px" }}>
          <Box
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              height: "10vh",
              width: "12vw",
              borderRadius: "10px",
              background: "white",
              margin: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding:"5px",
            }}
          >
            <Grid container justify="center">
              <Grid item xs={8}>
                <Typography
                  color="primary"
                  style={{
                    fontWeight: "900",
                    fontSize: "18px",
                    marginLeft: "5px",
                  }}
                >
                  200
                </Typography>
                <Typography style={{ marginLeft: "5px", fontSize: "14px" }}>
                  Total Calls
                </Typography>
              </Grid>
              <Grid item xs={4} style={{ textAlign: "center" }}>
                <Phone color="primary" />
              </Grid>
            </Grid>
          </Box>
          <Box
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              height: "10vh",
              width: "12vw",
              borderRadius: "10px",
              background: "white",
              margin: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding:"5px",
            }}
          >
            <Grid container justify="center">
              <Grid item xs={8}>
                <Typography
                  style={{
                    fontWeight: "900",
                    fontSize: "18px",
                    marginLeft: "5px",
                    color: "green",
                  }}
                >
                  123
                </Typography>
                <Typography
                  style={{
                    width: "max-content",
                    marginLeft: "5px",
                    fontSize: "14px",
                  }}
                >
                  Received Calls
                </Typography>
              </Grid>
              <Grid item xs={4} style={{ textAlign: "center" }}>
                <PhoneCallbackOutlined style={{ color: "green" }} />
              </Grid>
            </Grid>
          </Box>
          <Box
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              height: "10vh",
              width: "12vw",
              borderRadius: "10px",
              background: "white",
              margin: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding:"5px",
            }}
          >
            <Grid container justify="center">
              <Grid item xs={8}>
                <Typography
                  style={{
                    fontWeight: "900",
                    fontSize: "18px",
                    marginLeft: "5px",
                    color: "red",
                  }}
                >
                  23
                </Typography>
                <Typography
                  style={{
                    width: "max-content",
                    marginLeft: "5px",
                    fontSize: "14px",
                  }}
                >
                  Missed Calls
                </Typography>
              </Grid>
              <Grid item xs={4} style={{ textAlign: "center" }}>
                <PhoneMissedOutlined style={{ color: "red" }} />
              </Grid>
            </Grid>
          </Box>
          <Box
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              height: "10vh",
              width: "12vw",
              borderRadius: "10px",
              background: "white",
              margin: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding:"5px",
            }}
          >
            <Grid container justify="center">
              <Grid item xs={8}>
                <Typography
                  style={{
                    fontWeight: "900",
                    fontSize: "18px",
                    marginLeft: "5px",
                    color: "purple",
                  }}
                >
                  15
                </Typography>
                <Typography
                  style={{
                    width: "max-content",
                    marginLeft: "5px",
                    fontSize: "14px",
                  }}
                >
                  Follow-up Calls
                </Typography>
              </Grid>
              <Grid item xs={4} style={{ textAlign: "center" }}>
                <Event />
              </Grid>
            </Grid>
          </Box>
          <Box
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              height: "10vh",
              width: "12vw",
              borderRadius: "10px",
              background: "white",
              margin: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding:"5px",
            }}
          >
            <Grid container justify="center">
              <Grid item xs={8}>
                <Typography
                  style={{
                    fontWeight: "900",
                    fontSize: "18px",
                    marginLeft: "5px",
                    color: "grey",
                  }}
                >
                  23
                </Typography>
                <Typography
                  style={{
                    width: "max-content",
                    marginLeft: "5px",
                    fontSize: "14px",
                  }}
                >
                  Rescheduled Calls
                </Typography>
              </Grid>
              <Grid item xs={4} style={{ textAlign: "center" }}>
                <Schedule />
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box
          style={{
           
            height: "12.5vh",
            width: "100%",
            display: "flex",
            padding:"10px"
          }}
        >
          <Box
            style={{
              height: "10vh",
              boxShadow:
              "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              width: "12vw",
              borderRadius: "10px",
              background: "white",
              margin: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding:"5px",
            }}
          >
            <Grid container justify="center">
              <Grid item xs={8}>
                <Typography
                  color="primary"
                  style={{
                    fontWeight: "900",
                    fontSize: "18px",
                    marginLeft: "5px",
                  }}
                >
                  50
                </Typography>
                <Typography
                  style={{
                    width: "max-content",
                    marginLeft: "5px",
                    fontSize: "14px",
                  }}
                >
                  Moderate Calls
                </Typography>
              </Grid>
              <Grid item xs={4} style={{ textAlign: "center" }}>
                {/* <Phone color="primary" /> */}
              </Grid>
            </Grid>
          </Box>
          <Box
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              height: "10vh",
              width: "12vw",
              borderRadius: "10px",
              background: "white",
              margin: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding:"5px",
            }}
          >
            <Grid container justify="center">
              <Grid item xs={8}>
                <Typography
                  style={{
                    fontWeight: "900",
                    fontSize: "18px",
                    marginLeft: "5px",
                  }}
                >
                  13
                </Typography>
                <Typography
                  style={{
                    width: "max-content",
                    marginLeft: "5px",
                    fontSize: "14px",
                  }}
                >
                  Average Time
                </Typography>
              </Grid>
              <Grid item xs={4} style={{ textAlign: "center" }}>
                <AvTimer />
              </Grid>
            </Grid>
          </Box>
          <Box
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              height: "10vh",
              width: "12vw",
              borderRadius: "10px",
              background: "white",
              margin: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding:"5px",
            }}
            
          >
            <Grid container justify="center">
              <Grid item xs={8}>
                <Typography
                  style={{
                    fontWeight: "900",
                    fontSize: "18px",
                    marginLeft: "5px",
                    color: "#909007",
                  }}
                >
                  23
                </Typography>
                <Typography
                  style={{
                    width: "max-content",
                    marginLeft: "5px",
                    fontSize: "14px",
                  }}
                >
                  Sentimnet Score
                </Typography>
              </Grid>
              <Grid item xs={4} style={{ textAlign: "center" }}>
                <SentimentSatisfied style={{ color: "#909007" }} />
              </Grid>
            </Grid>
          </Box>
          <Box
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              height: "10vh",
              width: "12vw",
              borderRadius: "10px",
              background: "white",
              margin: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding:"5px",
            }}
          >
            <Grid container justify="center">
              <Grid item xs={8}>
                <Typography
                  style={{
                    fontWeight: "900",
                    fontSize: "18px",
                    marginLeft: "5px",
                    color: "purple",
                  }}
                >
                  15
                </Typography>
                <Typography
                  style={{
                    width: "max-content",
                    marginLeft: "5px",
                    fontSize: "14px",
                  }}
                >
                  Completion Score
                </Typography>
              </Grid>
              <Grid item xs={4} style={{ textAlign: "center" }}>
                <CheckCircleOutline />
              </Grid>
            </Grid>
          </Box>
          <Box
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
              height: "10vh",
              width: "12vw",
              borderRadius: "10px",
              background: "white",
              margin: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding:"5px",
            }}
          >
            <Grid container justify="center">
              <Grid item xs={8}>
                <Typography
                  style={{
                    fontWeight: "900",
                    fontSize: "18px",
                    marginLeft: "5px",
                    color: "red",
                  }}
                >
                  3
                </Typography>
                <Typography
                  style={{
                    width: "max-content",
                    marginLeft: "5px",
                    fontSize: "14px",
                  }}
                >
                  Abuse
                </Typography>
              </Grid>
              <Grid item xs={4} style={{ textAlign: "red" }}>
                <NotInterested />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  );
};
export default CallAnalysisCards;