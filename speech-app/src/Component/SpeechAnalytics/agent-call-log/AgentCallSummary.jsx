import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Paper,
  Button,
  makeStyles,
} from "@material-ui/core";
import axios from "axios";
import LogTable from "./LogTable";

const useStyles = makeStyles((theme) => ({
  root: {},
  formControl: {
    margin: theme.spacing(1),
    minWidth: 100,
  },
  tableCell: {
    fontSize: "12.8px",
    fontWeight: "510",
    marginLeft: "20px",
    padding: "1px",
  },
  search: {
    height: "40px",
    borderRadius: "5px",
    border: "1px solid Black",
    width: "55%",
  },
}));

function AgentCallLog() {
  const classes = useStyles();
  const [call, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCallSummary, setSelectedCallSummary] = useState(null);

  const handleViewSummary = (call) => {
    setSelectedCallSummary(call);
  };

  const closeCallSummary = () => {
    setSelectedCallSummary(null);
  };

  useEffect(() => {
    const fetchTwilioCalls = async () => {
      const twilioAccountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;
      const config = {
        headers: {
          Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        },
      };

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

      while (nextPageUri) {
        const data = await fetchPage(nextPageUri);
        if (data) {
          allCalls = allCalls.concat(data.calls);
          nextPageUri = data.next_page_uri ? `https://api.twilio.com${data.next_page_uri}` : null;
        } else {
          nextPageUri = null;
        }
      }

      setCalls(allCalls);
      setFilteredCalls(allCalls);
      setLoading(false);
    };

    fetchTwilioCalls();
  }, []);

  useEffect(() => {
    const filtered = call.filter((call) => {
      const currentDate = new Date();
      const callDate = new Date(call.start_time);
      if (selectedFilter === "day") {
        return (
          callDate.getDate() === currentDate.getDate() &&
          callDate.getMonth() === currentDate.getMonth() &&
          callDate.getFullYear() === currentDate.getFullYear()
        );
      } else if (selectedFilter === "month") {
        return (
          callDate.getMonth() === currentDate.getMonth() &&
          callDate.getFullYear() === currentDate.getFullYear()
        );
      } else if (selectedFilter === "week") {
        // Implement week filtering logic here
      }
      return true;
    });

    const filteredBySearch = filtered.filter((call) =>
      call.to.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredCalls(filteredBySearch);
  }, [call, searchQuery, selectedFilter]);

  return (
    <>
      <Box
        style={{
          borderRadius: "15px",
          margin: "10px",
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Grid
          container
          spacing={2}
          style={{
            marginTop: "20px",
          }}
        >
          <Grid item xs={6}>
            <Box
              style={{
                display: "flex",
                textAlign: "center",
                alignItems: "center",
                width: "100%",
                marginTop: "20px",
                marginBottom: "5px",
                marginLeft: "14px",
              }}
            >
              <FormControl variant="outlined" className={classes.formControl}>
                <Select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  style={{ height: "40px" }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="day">Day</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                  <MenuItem value="month">Month</MenuItem>
                </Select>
              </FormControl>
              <TextField
                className={classes.search}
                size="small"
                label="Search by Phone Number"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  position: "relative",
                  borderRadius: "5px",
                  border: "0px",
                }}
              />
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={1} style={{ padding: "0px" }}>
          <Grid item xs={12}>
            {loading ? (
              <CircularProgress />
            ) : (
              <LogTable docList={filteredCalls.filter((call) => call.to !== "")} />
            )}
          </Grid>
          <Grid item xs={3}>
            {selectedCallSummary && (
              <Paper style={{ padding: "8px", marginBottom: "16px" }}>
                <Box>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={closeCallSummary}
                  >
                    Close
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default AgentCallLog;
