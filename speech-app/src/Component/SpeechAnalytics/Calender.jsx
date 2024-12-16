import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  makeStyles
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CalendarIcon from "@material-ui/icons/CalendarToday";

const dummyPhoneNumbers = ["123-456-7890", "555-555-5555", "888-888-8888"];

const useStyles = makeStyles({
  dialogContent: {
    "& .MuiDialogContent-root": {
      padding: "8px 46px"
    }
  }
});

const CallRescheduleComponent = ({ onReschedule }) => {
  const classes = useStyles();
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleReschedule = () => {
    if (!selectedPhoneNumber || !selectedDate || !selectedTime) {
      // Show recommendation message in Snackbar for selecting all information
      setSnackbarMessage("Please select phone number, date, and time for rescheduling.");
      setSnackbarOpen(true);
    } else {
      const rescheduleDateTime = new Date(
        selectedDate.toDateString() + " " + selectedTime
      );
      const now = new Date();
      const timeDifference = rescheduleDateTime - now;
      setCountdown(timeDifference);

      if (onReschedule) {
        onReschedule(selectedPhoneNumber, selectedDate, selectedTime);
        setOpenCalendar(false); // Close the calendar dialog after rescheduling

        // Show success message in Snackbar
        setSnackbarMessage("Call rescheduled successfully!");
        setSnackbarOpen(true);
      }
    }
  };

  const handleClose = () => {
    setOpenCalendar(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpenCalendar(true)} startIcon={ <CalendarIcon style={{fontSize:"15px",marginLeft:"5PX"}} />} style={{textTransform:"capitalize",borderRadius:"15px",background:"rgb(220 180 62)",padding:"1px 6px",color:"white"}} >
        Reschedule
      </Button>
      <Dialog open={openCalendar} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Reschedule Call</DialogTitle>
        <DialogContent  className={classes.dialogContent}>
          <Select
            value={selectedPhoneNumber}
            onChange={(event) => setSelectedPhoneNumber(event.target.value)}
          >
            <MenuItem value="">Select Phone Number</MenuItem>
            {dummyPhoneNumbers.map((number) => (
              <MenuItem key={number} value={number}>
                {number}
              </MenuItem>
            ))}
          </Select>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            minDate={new Date()}
          />
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            style={{marginTop:"5px"}}
          />
          {countdown !== null && (
            <p >
              Countdown:{" "}
              {countdown > 0
                ? new Date(countdown).toLocaleTimeString()
                : "Time has passed"}
            </p>
          )}
          <Button variant="outlined" color="primary" onClick={handleReschedule} style={{textTransform:"capitalize",borderRadius:"15px",background:"white",border:"2px solid blue",padding:"1px 6px",color:"black",marginLeft:"5px",}}>
            Reschedule
          </Button>
          <Button variant="contained" onClick={handleClose} style={{textTransform:"capitalize",borderRadius:"15px",background:"white",border:"2px solid red",padding:"1px 6px",color:"black",marginLeft:"5px"}}>
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity="info"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default CallRescheduleComponent;
