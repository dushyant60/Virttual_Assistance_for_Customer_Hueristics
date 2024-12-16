import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Divider,
  makeStyles,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  DialogActions,
} from "@material-ui/core";
import { PhoneOutlined, Note, CallMissed, CallReceived, CallMade } from "@material-ui/icons";
import PhoneIcon from "@material-ui/icons/Phone";
import CheckIcon from "@material-ui/icons/Check";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import AlarmOnIcon from "@material-ui/icons/AlarmOn";
import "./Callrecords.css";

// Define custom styles using makeStyles hook
const useStyles = makeStyles((theme) => ({
  typo: {
    fontWeight: "bold",
    fontSize: "14px",
    width: "fix-content",
    marginLeft: "5px",
    textAlign: "center",
    maxWidth: "fit-content",
  },
  headerCell: {
    fontWeight: "bold",
  },
  redBackground: {
    backgroundColor: "red",
    color: "white",
  },
  keyvalue: {
    fontWeight: "900px",
    fontSize: "18px",
  },
  statsContainer: {
    display: 'flex',
    height:"16.2vh",
    flexDirection: 'column',
    justifyContent:"center",
    alignItems: 'center',
    padding: "5px 15px",
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)',
  },
  statsHeader: {
    color: "black",
    textAlign: 'left',
    fontWeight:'400',
    marginBottom:"10px",
    marginLeft:"10px",
    fontSize:"14x",
    display:"none"
  },
  summaryTab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid transparent',
    padding: theme.spacing(2),
    cursor: 'pointer',
    width: "8vw", // Use viewport width instead of viewport height
    height: "13vh",
    borderRadius: "10px",
    backgroundColor: theme.palette.grey[100],
    transition: 'border-color 0.3s ease',
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1), 0 6px 25px rgba(0, 0, 0, 0.20)",

    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: "white",
    },
  },
  summaryIcon: {
    width: "2.3vw", // Adjusted width using viewport width
        marginBottom: theme.spacing(1),
  },
  summaryCount: {
    fontSize: '1vw', // Use viewport width for relative font size
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  summaryText: {
    fontSize: '0.7vw', // Use viewport width for relative font size
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
  
}));

// Define the CallSummaryCard component
const CallSummaryCard = () => {
  const classes = useStyles(); // Use custom styles
  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog open/close
  const [callData, setCallData] = useState([]); // State to store call data
  const [filteredCallData, setFilteredCallData] = useState([]); // State to store filtered call data
  const [selectedTab, setSelectedTab] = useState("Total Calls"); // State to store selected tab

  // Function to open the dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Function to close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Function to fetch Twilio calls
  const fetchTwilioCalls = async () => {
    const twilioAccountSid = "ACe92fe807bd481b5b8ffa392afe1a890f";
    const twilioAuthToken = "0dbf6cd96a6113212fdd766601a741ad";
    const config = {
      headers: {
        Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
      },
    };
  
    // Function to fetch a page of calls
    const fetchPage = async (url) => {
      try {
        const response = await axios.get(url, config);
        return response.data;
      } catch (error) {
        console.error("Error fetching Twilio calls:", error);
        return null;
      }
    };
  
    let allCalls = [];
    let nextPageUri = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`;
  
    // Loop to fetch all pages of calls
    while (nextPageUri) {
      const data = await fetchPage(nextPageUri);
      if (data) {
        // Filter the calls to only include those with a non-empty "to" field
        const validCalls = data.calls.filter(call => call.to !== "" && call.to !== "client:User");
        allCalls = allCalls.concat(validCalls);
        nextPageUri = data.next_page_uri ? `https://api.twilio.com${data.next_page_uri}` : null;
      } else {
        nextPageUri = null;
      }
    }
  
    setCallData(allCalls); // Update state with fetched call data
  };
  
  // Fetch Twilio calls on component mount
  useEffect(() => {
    fetchTwilioCalls();
  }, []);

  // Function to handle tab change
  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
    let filteredCalls = [];

    // Filter calls based on selected tab
    switch (tabName) {
      case "Total Calls":
        filteredCalls = callData;
        break;
      case "Answered Calls":
        filteredCalls = callData.filter(call => call.status === "completed");
        console.log(filteredCalls)
        break;
      case "Reschedule Calls":
        filteredCalls = callData.filter(call => call.status === "no-answer");
        break;
      case "Follow-up Calls":
        filteredCalls = callData.filter(call => call.status === "follow-up");
        break;
      default:
        filteredCalls = callData;
        break;
    }

    setFilteredCallData(filteredCalls); // Update state with filtered call data
    handleOpenDialog(); // Open the dialog
  };

  // Function to get the count of calls for each tab
  const getTabCount = (tabName) => {
    switch (tabName) {
      case "Total Calls":
        return callData.length;
      case "Answered Calls":
        return callData.filter(call => call.status === "completed").length;
      case "Reschedule Calls":
        return callData.filter(call => call.status === "no-answer").length;
      case "Follow-up Calls":
        return callData.filter(call => call.status === "follow-up").length;
      default:
        return 0;
    }
  };

  return (
    <Box className={classes.statsContainer}>
      <Typography variant="p" className={classes.statsHeader}>
        Today's Stats:
      </Typography>

      <Grid container spacing={2} justify="center" style={{display:"flex", justifyContent:"space-evenly",}}>
        <Box className={classes.summaryTab} onClick={() => handleTabChange("Total Calls")}>
          <img src="/images/totalcalls.png" alt="Total Calls" className={classes.summaryIcon} />
          <Typography className={classes.summaryCount}  style={{ color: "#167BF5" }}>{getTabCount("Total Calls")}</Typography>
          <Typography className={classes.summaryText}>Total Calls</Typography>
        </Box>

        <Box className={classes.summaryTab} onClick={() => handleTabChange("Answered Calls")}>
          <img src="/images/answeredcalls.png" alt="Answered Calls" className={classes.summaryIcon} />
          <Typography className={classes.summaryCount}  style={{ color: "#045604" }}>{getTabCount("Answered Calls")}</Typography>
          <Typography className={classes.summaryText}>Answered Calls</Typography>
        </Box>

        <Box className={classes.summaryTab} onClick={() => handleTabChange("Reschedule Calls")}>
          <img src="/images/missedcall.png" alt="Missed Calls" className={classes.summaryIcon} />
          <Typography className={classes.summaryCount}  style={{ color: "Red" }}>{getTabCount("Reschedule Calls")}</Typography>
          <Typography className={classes.summaryText}>Missed Calls</Typography>
        </Box>

        <Box className={classes.summaryTab} onClick={() => handleTabChange("Follow-up Calls")}>
          <img src="/images/followUpCalls.png" alt="Follow-up Calls" className={classes.summaryIcon} />
          <Typography className={classes.summaryCount}  style={{ color: "purple" }}>{getTabCount("Follow-up Calls")}</Typography>
          <Typography className={classes.summaryText}>Follow-up Calls</Typography>
        </Box>

        <Box>
        <Box className={classes.summaryTab} onClick={() => handleTabChange("Reschedule Calls")}>
          <img src="/images/rescheduleCalls.png" alt="Reschedule Calls" className={classes.summaryIcon} />
          <Typography className={classes.summaryCount}  style={{ color: "orange" }}>{getTabCount("Reschedule Calls")}</Typography>
          <Typography className={classes.summaryText}>Reschedule Calls</Typography>
        </Box>
        </Box>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{selectedTab} - {filteredCallData.length}</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Numbers</strong></TableCell>
                <TableCell><strong>Start Time</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCallData.map((call, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {call.direction === 'inbound' ? 
                      <CallReceived color="primary" /> :
                      <CallMade color="secondary" />}
                  </TableCell>
                  <TableCell>
                    {call.direction === 'inbound' ? call.from : call.to} 
                  </TableCell>
                  <TableCell>{call.start_time}</TableCell>
                  <TableCell>{call.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CallSummaryCard;
