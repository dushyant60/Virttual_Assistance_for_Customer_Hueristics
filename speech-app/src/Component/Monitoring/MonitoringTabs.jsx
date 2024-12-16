import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import LogServer from './LogServer';
import JobStat from './JobStat';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import Dashboard from '../Home/Dashboard';
import CallLog from './CallLogs';



function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const { t } = useTranslation();
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    // backgroundColor: theme.palette.background.paper,
  },
  tabList: {
    borderBottom: '1px solid #e8e8e8',
    "& .PrivateTabIndicator-colorSecondary-7": {
      background: "#05053c",
    },

    height: "5vh",
    '& .MuiTabs-root': {
      height: "41px"
    },
    // backgroundColor: "#cecece",
    // background: "#afc9df",
    background:"linear-gradient(to top, #30cfd0 0%, #330867 100%)",
  },
  tabs: {
    color: "white",
  '& .MuiTab-wrapper': {
    // background: 'cadetblue',
    // boxShadow: '1px 3px 6px grey',
    // color: 'aliceblue',
    textTransform: "capitalize",
    fontSize:"14px"
  }
  },
  
  

}));

export default function MonitoringTab() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs className={classes.tabList} value={value} onChange={handleChange} aria-label="simple tabs example">
        <Tab className={classes.tabs} label="Call Management" {...a11yProps(0)} />
        <Tab className={classes.tabs} label="Call Logs" {...a11yProps(1)} />
        <Tab className={classes.tabs} label="Log Server" {...a11yProps(2)} />

      </Tabs>
      <TabPanel value={value} index={0}>
        <Dashboard/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <CallLog/>
      </TabPanel>
      <TabPanel value={value} index={2}>
       <LogServer/>
      </TabPanel>
    </div>
  );
}
