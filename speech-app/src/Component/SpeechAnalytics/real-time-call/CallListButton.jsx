import React, { useState, useEffect } from 'react';
import { Box, Badge } from '@material-ui/core';
import { Phone } from '@material-ui/icons';
import WaitingCallList from './WaitingCallList';
import axios from 'axios';

const CallListButton = () => {
  const [open, setOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // Initialize to 0

  const toggleOpen = () => {
    setOpen(!open);
  };

  const fetchWaitingListCount = async () => {
    try {
      const response = await axios.get('/waiting-list/count');
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error('Error fetching waiting list count:', error);
    }
  };

  useEffect(() => {
    fetchWaitingListCount();
    const interval = setInterval(fetchWaitingListCount, 500000); // Fetch count every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: '50px', right: '50px', zIndex: '1000' }}>
      <Box style={{ cursor: 'pointer', maxWidth: '300px' }} onClick={toggleOpen}>
        <Badge 
          badgeContent={notificationCount} 
          color="secondary" 
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <img
            className="tlogo"
            src="/images/timer.png"
            alt="Waiting Calls"
            style={{
              height: 'auto',
              width: '60px',
            }}
          />
        </Badge>
        {open && <WaitingCallList />}
      </Box>
    </div>
  );
};

export default CallListButton;