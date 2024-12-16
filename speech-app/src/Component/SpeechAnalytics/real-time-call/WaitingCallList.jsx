import React, { useState, useEffect } from "react";  
import {  
    Box,  
    Typography,  
    Avatar,  
    IconButton,  
    Paper,  
    TextField,  
    Button,  
    Divider,  
    Tooltip,  
} from "@material-ui/core";  
import {  
    Event,  
    Phone,  
    AccessTime,  
    AccessAlarm,  
    PhoneOutlined,  
    PhoneForwardedOutlined,  
} from "@material-ui/icons";  
import Calendar from "react-calendar";  
import "react-calendar/dist/Calendar.css";  
import './Callrecords.css';  
import axios from 'axios';  
  
const WaitingCallList = () => {  
    const [waitingCalls, setWaitingCalls] = useState([]);  
    const [showCalendar, setShowCalendar] = useState(false);  
    const [selectedCaller, setSelectedCaller] = useState(null);  
    const [selectedDate, setSelectedDate] = useState(new Date());  
    const [selectedTime, setSelectedTime] = useState("10:00"); // Default time  
    const [remainingTimes, setRemainingTimes] = useState({}); // Track remaining times for each caller  
    const [confirmationMessage, setConfirmationMessage] = useState(null);  
  
    useEffect(() => {  
        // Fetch initial waiting calls data  
        const fetchWaitingCalls = async () => {  
            try {  
                const response = await axios.get('http://localhost:3001/voice/waiting-list');  
                setWaitingCalls(response.data);  
            } catch (error) {  
                console.error('Error fetching waiting calls:', error);  
            }  
        };  
  
        fetchWaitingCalls();  
  
        // Set up WebSocket connection  
        const ws = new WebSocket('ws://localhost:3001');  
        ws.onmessage = (event) => {  
            const message = JSON.parse(event.data);  
            if (message.event === 'waiting-list-update') {  
                setWaitingCalls(message.data);  
            }  
        };  
  
        return () => {  
            ws.close();  
        };  
    }, []);  
  
    const getStatusColor = (status) => {  
        switch (status) {  
            case "queue":  
                return "green";  
            case "Dropped":  
                return "red";  
            case "Waiting":  
                return "blue";  
            default:  
                return "grey";  
        }  
    };  
  
    const rescheduleCall = (callerName) => {  
        // Handle rescheduling logic here using selectedDate and selectedTime  
        console.log(`Rescheduling call for ${callerName} on ${selectedDate} at ${selectedTime}`);  
        // Calculate and set the remaining time based on the time difference  
        const now = new Date();  
        const selectedDateTime = new Date(selectedDate);  
        const selectedTimeArray = selectedTime.split(":");  
        selectedDateTime.setHours(selectedTimeArray[0]);  
        selectedDateTime.setMinutes(selectedTimeArray[1]);  
        const timeDifference = selectedDateTime - now;  
        // Update the remaining time for the selected caller  
        setRemainingTimes((prevRemainingTimes) => ({  
            ...prevRemainingTimes,  
            [callerName]: Math.floor(timeDifference / 1000),  
        }));  
        // Show a confirmation message  
        setConfirmationMessage(`Call for ${callerName} has been rescheduled for ${selectedDate} at ${selectedTime}`);  
    };  
  
    const closeCalendar = () => {  
        setShowCalendar(false);  
        setSelectedCaller(null);  
        setConfirmationMessage(null); // Clear the confirmation message  
    };  
  
    useEffect(() => {  
        // Reduce remaining time for all callers with each tick  
        const interval = setInterval(() => {  
            setRemainingTimes((prevRemainingTimes) => {  
                const updatedRemainingTimes = { ...prevRemainingTimes };  
                for (const callerName in updatedRemainingTimes) {  
                    updatedRemainingTimes[callerName] = Math.max(  
                        0,  
                        updatedRemainingTimes[callerName] - 1  
                    );  
                }  
                return updatedRemainingTimes;  
            });  
        }, 1000);  
        return () => clearInterval(interval);  
    }, []);  
  
    const formatTime = (seconds) => {  
        const minutes = Math.floor(seconds / 60);  
        const secondsLeft = seconds % 60;  
        return `${minutes.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`;  
    };  
  
    const formatCallTime = (time) => {
        const date = new Date(time);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    };

    return (  
        <Box  
            style={{  
                height: "62.4vh",  
                width: "100%",  
                background: "white",  
                marginTop: "11px",  
                overflowY: "auto",  
                borderRadius: "10px",  
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",  
            }}  
        >  
            <Box style={{ display: "flex", alignItems: "center", position: "sticky", top: "0", zIndex: "999", background: "#167BF5", color: "white" }}>  
                <PhoneOutlined style={{ marginLeft: "4px" }} />  
                <Typography style={{  
                    fontSize: "14px",  
                    padding: "10px",  
                }}>Waiting Calls </Typography>  
            </Box>  
            <Divider />  
            {waitingCalls.map((call, index) => (  
                <Paper  
                    style={{  
                        display: "flex",  
                        height: "8vh",  
                        justifyContent: "center",  
                        alignItems: "center",  
                        margin: "12px",  
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",  
                        borderRadius: "10px"  
                    }}  
                    className="caller"  
                    key={index}  
                >  
                    <Box  
                        style={{  
                            display: "flex",  
                            flexDirection: "column",  
                            width: "28vw",  
                            marginLeft: "30px",  
                            alignItems: "flex-start"  
                        }}  
                    >  
                        <Typography variant="subtitle1" style={{ fontSize: "18px", color: "slategrey" }}>{call.number}</Typography>  
                        <Typography  
                            variant="body2"  
                            component="p"  
                            color="textSecondary"  
                            style={{ lineHeight: "5px", fontSize: "12px" }}  
                        >  
                            <span><PhoneForwardedOutlined style={{ fontSize: "14px" }}></PhoneForwardedOutlined>   </span>{formatCallTime(call.time)}  
                        </Typography>  
                    </Box>  
                    <Box  
                        style={{  
                            display: "flex",  
                            flexDirection: "column",  
                            width: "100%",  
                            alignItems: "center",  
                        }}  
                    >  
                        <Box style={{ display: "flex" }}>  
                            <Tooltip title="Answer call">  
                                <IconButton style={{ borderRadius: "50%", backgroundColor: "#DDF1FF", padding: "8px", border: "1px solid green" }}>  
                                    <Phone style={{ color: "green" }} />  
                                </IconButton>  
                            </Tooltip>  
                        </Box>  
                    </Box>  
                </Paper>  
            ))}  
        </Box>  
    );  
};  
  
export default WaitingCallList;
