import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { CalendarViewDaySharp, ExitToAppOutlined, HelpOutlineOutlined, HomeOutlined, LibraryBooksOutlined, MicNoneRounded, PhoneInTalk, PhoneInTalkOutlined, Settings, Speaker } from '@material-ui/icons';
import DvrIcon from '@material-ui/icons/Dvr';
import { BrowserRouter as Router, Link, useLocation } from 'react-router-dom';
import { Routess } from '../../routes';
import { useTranslation } from 'react-i18next'
import DataPrepare from '../DataPrepare/DataPrepare';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import MainTab from '../SpeechAnalytics/MainTab';
import MonitorTab from '../Monitoring/MonitorTab';
import { Avatar } from '@material-ui/core';
import '../../Styles/sidemenu.scss';

const drawerWidth = 240;
const lightTheme = createTheme({
    palette: {
        type: 'light',
        // Customize other theme properties for the light theme if needed
    },
});

const darkTheme = createTheme({
    palette: {
        type: 'dark',
        // Customize other theme properties for the dark theme if needed
    },
    overrides: {
        MuiTab: {
            textColorInherit: {
                // color: 'white',
            },
        },
    },
});





const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        // background: "#0d152e",
        // background:"linear-gradient(to top, #30cfd0 0%, #330867 100%)",
        width: drawerWidth,
        flexShrink: 0,
        width: "50px",
        whiteSpace: 'nowrap',
        '& .MuiDrawer-paperAnchorDockedLeft': {
            marginTop: '42px',
        },
        '& .MuiDrawer-paper': {
            background: "#001B48"
            // background:"linear-gradient(to top, #30cfd0 0%, #330867 100%)",
        },
        '& .MuiListItem-root.Mui-selected, .MuiListItem-root.Mui-selected:hover': {
            backgroundColor: "#323256",
            borderRadius: "6px",
            width: "auto"
        }
    },
    icon: {
        color: "white",
        fontSize: "18px",
        "& .MuiListItemIcon-root": {
            minWidth: "10px",
        },
        "& .MuiTypography-body1": {
            fontSize: "12px"

        }
    },
    icondiv: {
        "& .MuiListItemIcon-root": {
            minWidth: "37px",
            fontSize: "12px"
        }
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        width: 198
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
            width: 52
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: "0px",
        marginTop: '44px',
    },
    footer: {
        marginTop: '320PX', // Push the footer to the bottom
        // border:"2px solid red"
    },
    sidemenulist: {
        "& .MuiList-padding": {
            paddingTop: "18px"
        }
    }
}));

const SideMenu = () => {
    const classes = useStyles();
    const theme = useTheme();
    const location = useLocation();
    const [open, setOpen] = useState(true);
    const [selectedMenuItem, setSelectedMenuItem] = useState('');
    const [selectedTheme, setSelectedTheme] = useState(localStorage.getItem('selectedTheme') || 'light');
    const { t } = useTranslation();


    useEffect(() => {
        localStorage.setItem('selectedMenuItem', selectedMenuItem);
    }, [selectedMenuItem]);

    useEffect(() => {
        const appTheme = selectedTheme === 'dark' ? darkTheme : lightTheme;
        document.body.style.backgroundColor = appTheme.palette.type === 'dark' ? '#222' : '#f5f1f1';
        localStorage.setItem('selectedTheme', selectedTheme);
    }, [selectedTheme]);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };





    const renderMainbyTabs = [Routess.SpeechAnalytics, Routess.Recorded, Routess.PostCall, Routess.CallSummary].includes(location.pathname);
    const renderMonitorbyTabs = [Routess.CallManagement, Routess.CallLogs, Routess.LogServer].includes(location.pathname);
    return (
        <div className={classes.root}>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
            >
                {/* <div className={classes.toolbar}>
          {open === false ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              style={{padding:"10px"}}
            >
              <MenuIcon className={classes.icon} />
            </IconButton>
          ) : (
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon className={classes.icon} /> : <ChevronLeftIcon className={classes.icon} />}
            </IconButton>
          )}
        </div> */}
                {/* <Divider style={{border:"1px solid #fff"}}/> */}
                <List className={classes.sidemenulist}>
                    {/* <ListItem
                        button
                        component={Link}
                        to={Routess.Home}
                        selected={selectedMenuItem === 'home'}
                        onClick={() => setSelectedMenuItem('home')}
                        className={classes.icondiv}
                    >
                        <ListItemIcon>
                            <HomeOutlined className={classes.icon} />
                        </ListItemIcon>
                        <ListItemText primary={t('home')} className={classes.icon} />
                    </ListItem> */}
                    <ListItem
                        button
                        component={Link}
                        to={Routess.DataPrepare}
                        selected={selectedMenuItem === 'dataPrepare'}
                        onClick={() => setSelectedMenuItem('dataPrepare')}
                        className={classes.icondiv}
                    >
                        <ListItemIcon>
                            <LibraryBooksOutlined className={classes.icon} />
                        </ListItemIcon>
                        <ListItemText primary={t('data-prepare')} className={classes.icon} />
                    </ListItem>
                    <ListItem
                        button
                        component={Link}
                        to={Routess.SpeechAnalytics}
                        selected={selectedMenuItem === 'textAnalytics'}
                        onClick={() => setSelectedMenuItem('textAnalytics')}
                        className={classes.icondiv}
                    >
                        <ListItemIcon>
                            {/* <MicNoneRounded className={classes.icon} /> */}
                            <PhoneInTalkOutlined className={classes.icon} />
                        </ListItemIcon>
                        <ListItemText primary="Call Analysis" className={classes.icon} />
                    </ListItem>
                    <ListItem
                        button
                        component={Link}
                        to={Routess.CallManagement}
                        selected={selectedMenuItem === 'monitoring'}
                        onClick={() => setSelectedMenuItem('monitoring')}
                        className={classes.icondiv}
                    >
                        <ListItemIcon>
                            <DvrIcon className={classes.icon} />
                        </ListItemIcon>
                        <ListItemText primary={t('monitoring')} className={classes.icon} />
                    </ListItem>
                    <ListItem
                        button
                        component={Link}
                        to={Routess.Search}
                        selected={selectedMenuItem === 'search'}
                        onClick={() => setSelectedMenuItem('search')}
                        className={classes.icondiv}
                    >
                        <ListItemIcon>
                            {/* <CalendarViewDay className={classes.icon}/> */}
                            <CalendarViewDaySharp className={classes.icon} />
                        </ListItemIcon>
                        <ListItemText primary="Calender" className={classes.icon} />
                    </ListItem>

                </List>
                <div className={classes.footer}>
                    {/* <div style={{display:'flex',justifyContent:"center",alignItems:"center"}}>
                        <Avatar></Avatar>
                    </div> */}
                    <Divider style={{ border: "2px solid white" }} />
                    <List>
                        <ListItem button className={classes.icondiv}>
                            <ListItemIcon>
                                <HelpOutlineOutlined className={classes.icon} />
                            </ListItemIcon>
                            <ListItemText primary="Help" className={classes.icon} />
                        </ListItem>
                        <ListItem button className={classes.icondiv}>
                            <ListItemIcon>
                                <Settings className={classes.icon} />
                            </ListItemIcon>
                            <ListItemText primary="Settings" className={classes.icon} />
                        </ListItem>

                        <ListItem button className={classes.icondiv}>
                            <ListItemIcon>
                                <ExitToAppOutlined className={classes.icon} />
                            </ListItemIcon>
                            <ListItemText primary="Logout" className={classes.icon} />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
            <main className={classes.content}>
                {/* {location.pathname === Routess.Home && (
          <Dashboard />
        )} */}
                {location.pathname === Routess.DataPrepare && (
                    <DataPrepare />
                )}

                {renderMainbyTabs &&
                    <>
                        <MainTab />
                    </>
                }

                {renderMonitorbyTabs && (
                    <MonitorTab />
                )}
                {/* {location.pathname === Routess.Search && (
          <CustomerPage/>
        )}  */}
            </main>
        </div>
    );
};

export default SideMenu;
