import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
    Button,
    Grid,
    Typography,
    Select,
    FormControl,
    InputLabel,
    Divider,
} from '@material-ui/core';
import { createTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import { Settings } from '@material-ui/icons';
import i18next from "i18next";
import {useTranslation} from 'react-i18next'

const useStyles = makeStyles({
    dialog: {
        "& .MuiDialog-paper": {
            width: "74vw",
            height: "50vh",
            maxWidth: "600px"
        }
    },
    select: {
        minWidth: 150,
    },
});

const lightTheme = createTheme({
    palette: {
        type: 'light',
    },
});

const darkTheme = createTheme({
    palette: {
        type: 'dark',
    },
});

const systemTheme = createTheme({
    palette: {
        type: 'light', // Set the default type to light
    },
});

const Setting = () => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('selectedTheme') || 'light');
    const [language,setLanguage]=useState("en")
    const handleClick=(e)=>{
        setLanguage(e.target.value)
        i18next.changeLanguage(e.target.value)
    }
    const {t} = useTranslation();
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleThemeChange = (event) => {
        const newTheme = event.target.value;
        setTheme(newTheme);
    };

    useEffect(() => {
        // Apply the selected theme to the entire app
        const appTheme = theme === 'dark' ? darkTheme : theme === 'system' ? systemTheme : lightTheme;
        document.body.style.backgroundColor = appTheme.palette.type === 'dark' ? 'black' : '#E8F2FA';

        // Update the local storage value immediately after changing the theme
        localStorage.setItem('selectedTheme', theme);
    }, [theme]);
   
    const navigate = useNavigate();
        
    return (
        <ThemeProvider theme={theme === 'dark' ? darkTheme : theme === 'system' ? systemTheme : lightTheme}>
            <div>
                <span onClick={handleClickOpen}>Setting</span>
                <Dialog
                    className={classes.dialog}
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                > 
                    <DialogTitle id="alert-dialog-title">Settings</DialogTitle>
                    <DialogContent dividers>
                        <DialogContentText id="alert-dialog-description">
                            <Grid container spacing={1}>
                                <Grid item xs={4}>
                                    <Typography style={{ display: "flex" }}><Settings />{t('general')}</Typography>
                                    {/* <Typography style={{ display: "flex" }}><Settings />language</Typography> */}
                                </Grid>
                                <Grid item xs={8} >
                                    <Grid container style={{ display: "flex", justifyContent: 'center' }}>
                                        <Grid item xs={6} >
                                            <InputLabel id="theme-select-label">{t('theme')}</InputLabel>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.select}>
                                                <Select
                                                    labelId="theme-select-label"
                                                    id="theme-select"
                                                    value={theme}
                                                    onChange={handleThemeChange}
                                                >
                                                    <MenuItem value="light">{t('light') }</MenuItem>
                                                    <MenuItem value="dark">{t('dark')}</MenuItem>
                                                    <MenuItem value="system">{t('system')} </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {/* <Divider /> */}
                                    </Grid>
                                    <Grid container style={{ display: "flex", justifyContent: 'center',marginTop:"25px" }}>
                                        <Grid item xs={6} >
                                            <InputLabel id="theme-select-label">{t('language')}</InputLabel>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.select}>
                                                <Select
                                                    labelId="theme-select-label"
                                                    id="theme-select"
                                                    value={language}
                                                    onChange={(e)=> handleClick(e)}
                                                >
                                                    <MenuItem value={'en'}>English </MenuItem>
                                                    <MenuItem value={'hi'}>Hindi</MenuItem>
                                                    <MenuItem value={'ko'}>Korean</MenuItem>
                                                    <MenuItem value={'chi'}>Chinese</MenuItem>
                                                    <MenuItem value={'fre'}>French</MenuItem>
                                                    <MenuItem value={'iti'}>Itallian</MenuItem>
                                                    <MenuItem value={'kan'}>Kannad</MenuItem>
                                                    <MenuItem value={'mar'}>Marathi</MenuItem>
                                                    <MenuItem value={'pun'}>Punjabi</MenuItem>
                                                    <MenuItem value={'spa'}>Spanish</MenuItem>
                                                    <MenuItem value={'tel'}>Telagu</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {/* <Divider /> */}
                                    </Grid>
                                </Grid>
                                
                            </Grid>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            {t('close')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </ThemeProvider>
    );
};

export default Setting;
