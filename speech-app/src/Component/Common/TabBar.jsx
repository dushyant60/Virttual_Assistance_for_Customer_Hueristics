// CommonTabBar.js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },

  tabs: {
    "& .MuiTab-textColorInherit": {
      color: "black",
      opacity: "1"
    },
    minHeight: "0px",
    fontWeight: '400',
    color: "black",
    fontSize: "14px",
    textTransform: "capitalize",
    opacity: "1",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)", // Add a subtle box shadow
    transition: "box-shadow 0.3s ease-in-out", // Add a smooth transition
    "&:hover": {
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)", // Increase shadow on hover for a pop-up effect
    },
    "& .MuiTab-wrapper": {
      display: "flex",
      flexDirection: "row",
      "& .MuiTab-labelIcon": {
        marginBottom: "none"
      }
    },
  },
  
  
  icon: {
    fontSize: "16px",
    marginBottom: "0px",
    marginRight: "2px"
  },
  activeTab: {
    backgroundColor:"#167BF5",
    color: 'white', // Text color for active tab
    fontWeight: '600', // Font weight for active tab text
    borderRadius: '3px', // Add rounded corners to the active tab
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Add a subtle shadow to the active tab
    padding: '5px 10px', // Add padding to the active tab for better
    // fontSize:"16px"
  },
  tabList: {
    background: 'white',
    borderRadius:"10px",
    backdropFilter: 'blur(90px)',
    minHeight: '28px',
    boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.4)',
    margin: "8px",
    "& .MuiTabs-indicator":{
      background:"none"
    },
    
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

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

function TabBar({ tabs, defaultTab }) {
  const classes = useStyles();
  const location = useLocation();
  const { t } = useTranslation();
  const [value, setValue] = React.useState(defaultTab || 0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const tabValue = tabs.findIndex((tab) => tab.to === location.pathname);
    setValue(tabValue !== -1 ? tabValue : 0);
  }, [location, tabs]);

  return (
    <div className={classes.root}>
      <Tabs
        className={classes.tabList}
        value={value}
        onChange={handleChange}
        aria-label="simple tabs example"
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            className={`${classes.tabs} ${value === index ? classes.activeTab : ''}`}
            icon={React.cloneElement(tab.icon, { className: classes.icon })}
            component={Link}
            to={tab.to}
            label={t(tab.label)}
            {...a11yProps(index)}
          />
        ))}
      </Tabs>
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.component}
        </TabPanel>
      ))}
    </div>
  );
}

TabBar.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      component: PropTypes.node.isRequired,
    })
  ).isRequired,
  defaultTab: PropTypes.number,
};

export default TabBar;
