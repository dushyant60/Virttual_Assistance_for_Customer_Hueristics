import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { DialogActions } from '@material-ui/core';
import AgentCallSummary from './CallSummary';
import SaveIcon from '@material-ui/icons/Save';
import { ArrowBack, ArrowForward, Visibility } from '@material-ui/icons';
import { FaEye } from 'react-icons/fa6';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(0),
    flex: 1,
    textAlign:"left",
    // border:"2px solid red"
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CustomerCallSummary = ({ data, dataList }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSid, setCurrentSid] = useState(null);
  const [callData, setCallData] = useState(null);

  useEffect(() => {
    // Fetch data from getData API
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/getData');
        const fetchedData = response.data;
        // Find the data with matching callSid
        const matchedData = fetchedData.find(item => item.call_sid === data.parent_call_sid);
        // Set the matched data
        setCallData(matchedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [data.callSid]);

  useEffect(() => {
    // Update currentIndex when data prop changes
    const initialIndex = dataList?.findIndex((item) => item.sid === data.sid);
    setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);
    setCurrentSid(data?.sid);
  }, [data, dataList]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBackward = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(newIndex);
    setCurrentSid(dataList[newIndex].sid);
  };

  const handleForward = () => {
    const newIndex = Math.min(currentIndex + 1, dataList.length - 1);
    setCurrentIndex(newIndex);
    setCurrentSid(dataList[newIndex].sid);
  };

  return (
    <div>
      <IconButton variant="outlined" onClick={handleClickOpen} style={{ padding: '1px 6px' }}>
        <FaEye />
      </IconButton>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar} style={{backgroundColor:"#167BF5"}}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Call Summary
            </Typography>
            <Typography>{currentSid}</Typography>
            <IconButton autoFocus color="inherit" onClick={handleBackward}>
              <ArrowBack />
            </IconButton>
            <IconButton autoFocus color="inherit" onClick={handleForward}>
              <ArrowForward />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogActions style={{ }}>
  {callData ? (
    <AgentCallSummary data={callData} />
  ) : (
    <Typography>Loading call summary...</Typography>
  )}
</DialogActions>
      </Dialog>
    </div>
  );
};

export default CustomerCallSummary;
