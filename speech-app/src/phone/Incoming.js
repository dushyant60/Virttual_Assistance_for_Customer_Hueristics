import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, makeStyles } from '@material-ui/core';

// Define custom styles using makeStyles hook
const useStyles = makeStyles((theme) => ({
  dialog: {
    borderRadius: '10px',
    padding: theme.spacing(2),
  },
  title: {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    padding: theme.spacing(2),
    borderRadius: '10px 10px 0 0',
  },
  content: {
    padding: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
  },
  button: {
    width: '45%',
  },
}));

const Incoming = ({ open, onAccept, onReject }) => {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={onReject} classes={{ paper: classes.dialog }}>
      <DialogTitle className={classes.title}>Incoming Call</DialogTitle>
      <DialogContent className={classes.content}>
        <DialogContentText>You have an incoming call.</DialogContentText>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button
          onClick={onReject}
          variant="contained"
          color="secondary"
          className={classes.button}
        >
          Reject
        </Button>
        <Button
          onClick={onAccept}
          variant="contained"
          color="primary"
          className={classes.button}
          autoFocus
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Incoming;
