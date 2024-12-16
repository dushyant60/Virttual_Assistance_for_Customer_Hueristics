import React, { useState, useEffect } from "react";
import { Box, Divider, makeStyles, Typography, Button } from "@material-ui/core";
import { GraphicEqSharp, Event } from "@material-ui/icons";
import "react-circular-progressbar/dist/styles.css";
import { CircularProgressbar } from "react-circular-progressbar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const useStyles = makeStyles({
    typo: {
      fontWeight: "bold",
      fontSize: "16px",
      padding: "10px",
      color: "grey",
    },
    calendarButton: {
      display: "flex",
      alignItems: "center",
    },
    calendarContainer: {
      position: "absolute",
      zIndex: 1,
    },
    reminder: {
      margin: "10px",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
  });

const Analysis = () => {
    const classes = useStyles();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const followUpCalls = 10;
    const [showCalendar, setShowCalendar] = useState(false);
    const [reminders, setReminders] = useState([]);
  
    const handleDateChange = (date) => {
      setSelectedDate(date);
    };
  
    // Mock data for follow-up calls (replace with your data)
    const followUpCallData = [
      { date: new Date(2023, 10, 16, 14, 45), description: "Follow-up call 1" },
      { date: new Date(2023, 9, 19, 15, 30), description: "Follow-up call 2" },
      // Add more follow-up calls with date and description
    ];
  
    useEffect(() => {
      // Calculate reminders for follow-up calls 15 minutes before they occur
      const now = new Date();
      const upcomingReminders = followUpCallData.filter((call) => {
        const timeDiff = call.date - now;
        return timeDiff > 0 && timeDiff <= 15 * 60 * 1000; // 15 minutes in milliseconds
      });
      setReminders(upcomingReminders);
    }, []);
  
  return (
    <>
      <Box style={{ width: "100%", display: "flex", marginLeft: "4px", alignItems: "center" }}>
        <GraphicEqSharp style={{ color: "grey" }} />
        <Typography className={classes.typo}>Analysis </Typography>
        <Typography variant="body2">
              Total Follow-up Calls: {followUpCalls}
            </Typography>
      
      </Box>
      <Divider />

      <div style={{ display: "flex", justifyContent: "space-around", marginTop: "5px", flexWrap: "wrap" }}>
        <div style={{ width: 100, height: 100 }}>
          <CircularProgressbar
            value={20}
            text={`${20}%`}
            strokeWidth={10}
            style={{ height: "10px" }}
            styles={{
              path: {
                stroke: "green",
              },
              text: {
                fill: "black",
              },
              width: "70%",
            }}
          />
          <p style={{ width: "max-content" }}>Total Calls</p>
        </div>

        <div style={{ width: 100, height: 100 }}>
          <CircularProgressbar
            value={10}
            text={`${10}%`}
            strokeWidth={10}
            styles={{
              path: {
                stroke: "orange",
              },
              text: {
                fill: "black",
              },
              width: "70%",
            }}
          />
          <p style={{width:"max-content"}}>Answered Calls</p>
        </div>

        <div style={{ width: 100, height: 100 }}>
          <CircularProgressbar
            value={5}
            text={`${5}%`}
            strokeWidth={10}
            styles={{
              path: {
                stroke: "#ff0000",
              },
              text: {
                fill: "black",
              },
              width: "70%",
            }}
          />
          <p style={{ width: "max-content" }}>Dropped Calls</p>
        </div>
      </div>

    </>
  );
};

export default Analysis;
