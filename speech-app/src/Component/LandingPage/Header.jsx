import { React, useState, useEffect } from "react";
import "./Home/HomePage.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Menu,
    MenuItem,
    Button,
    Popover,
    Hidden
} from "@material-ui/core";
import { ExitToApp, MoreVert, OpenInNew, Settings } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import { Routess } from "../../routes";
import Setting from "../../Component/Settings";
import { ProfileNavigationCard } from "./ProfileNavigationCard";
import { AuthenticationState } from "react-aad-msal";
import { authProvider } from "../authProvider";
import { AzureAD } from "react-aad-msal";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
// import MobileDrawer from "./MobileView.jsx/MobileSideMenu";

const AlertDialog = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const dispatch = useDispatch(); // Import useDispatch from react-redux

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLogout = async (logoutFunction) => {
        await logoutFunction(); // Trigger logout
        dispatch({ type: "CLEAR_ACCOUNT_INFO" }); // Clear account info from Redux store
        localStorage.removeItem("accountInfo"); // Clear account info from localStorage
        navigate(Routess.Login);
    };
    return (
        <AzureAD provider={authProvider}>
            {({ authenticationState, login, logout, error, accountInfo }) => {
                switch (authenticationState) {
                    case AuthenticationState.Authenticated:
                        return (
                            <div>
                                <span onClick={handleClickOpen}>Logout</span>
                                <Dialog
                                    open={open}
                                    onClose={handleClose}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >
                                    <DialogContent>
                                        <DialogContentText id="alert-dialog-description">
                                            Do you really want to logout?
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleClose} color="primary">
                                            No
                                        </Button>
                                        <Button
                                            onClick={() => handleLogout(logout)}
                                            color="primary"
                                            autoFocus
                                        >
                                            Yes
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </div>
                        );
                    default:
                        return null;
                }
            }}
        </AzureAD>
    );
};
const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        border: "2px solid red",
        "& .MuiAppBar-root": {
            marginTop: "43px",
        },
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    toolbar: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        flexGrow: 1,
        alignSelf: "flex-end",
    },
    topheader: {
        minHeight: "42px",
        // background: '-webkit-linear-gradient(to right, #2B32B2, #1488CC)', /* Chrome 10-25, Safari 5.1-6 */
        backgroundColor: '#001B48',
        // background: 'linear-gradient(to right, #2B32B2, #1488CC)', 
        paddingLeft: "13px",
        //   "& .@media (min-width: 600px) MuiToolbar-regular":{
        //      minHeight:"0px"
        //   }
        // borderBottom: "2px solid #696969",
    },
    userid: {
        // border:"2px solid red",
        width: "100%",
        display: "flex",
        justifyContent: "end",
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        marginLeft: "15px",
    },
    menulist: {
        marginLeft: "15px",
    },
}));
const ITEM_HEIGHT = 30;
export default function Header() {
    const classes = useStyles();
    const [user, setUser] = useState(null)
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const [profileNavigationAnchor, setProfileNavigationAnchor] = useState();
    // const { user } = useAppUser();
    const userImg = user?.imgUrl
        ? user.imgUrl
        : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    const accountInfo = useSelector((state) => state.accountInfo);
    // console.log("hlo",accountInfo)
    return (
        <>
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar className={classes.topheader}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            position: "relative",
                        }}
                    >
                        {/* <Hidden mdUp>
              <MobileDrawer />
            </Hidden> */}
                        <img
                            className="tlogo"
                            src="/images/logo1.png"
                            alt="Logo"
                            style={{
                                height: "auto",
                                width: "60%",
                            }}
                        />
                    </div>
                    <div className={classes.userid}>
                        <Hidden xsDown>
                            <Typography>{accountInfo?.account?.userName}</Typography>
                        </Hidden>
                        <span
                            style={{ cursor: "pointer" }}
                            role="button"
                            // className={styles.me}
                            onClick={(ev) => setProfileNavigationAnchor(ev.currentTarget)}
                        >
                            {/* <img
                src={userImg}
                //src='https://s3-alpha-sig.figma.com/img/8f44/f319/1be25ba42799a83dba0b22effee5178b?Expires=1639958400&Signature=Dg9B-ELXR9gmgTsC6-LkpHh3injbxLk~IotoMqDrdY6MC9ks49CyD~vg2~8PBUY~-fU~fhYhb~xm8QCUltF9MrHHrCzNhu4uLxAaWwLs3xAeIl3hsKkO7-6mTIn8IX2rZidRGmVHVYJPmMqw8NUSoqodSP-Oa15vFrhdGfU7JXxF~poQbQhQxB48kLUu0GVawvW3Ol4XdP~2zxkPEPMZNRb-730hbSlGqRS~jQrtbFx2dYWZGbEqSzytQYDL3whBHO~5EqTmzyB06NARQHTPFCGwa9a-cyHEiycyx4tt3W60LKgTZA52N1ufYSpBfGILgdVMIbfKmY1aB5z3kHq1Ig__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA'
                alt='profile'
              /> */}
                            <Avatar className={classes.small}></Avatar>
                            {/* <div>
                <MdArrowDropDown  style={{height:'25px', width:'20px'}}/>
              </div> */}
                        </span>

                        <Popover
                            elevation={2}
                            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                            transformOrigin={{ vertical: "top", horizontal: "center" }}
                            open={Boolean(profileNavigationAnchor)}
                            anchorEl={profileNavigationAnchor}
                            onClose={() => setProfileNavigationAnchor(undefined)}
                        >
                            <ProfileNavigationCard info={accountInfo} />
                        </Popover>
                        {/* <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleClick}
              style={{ height: "20px", width: "40px", marginLeft: "10px" }}
            >
              <MoreVert style={{ color: "white" }} />
            </IconButton> */}
                        <Menu
                            id="long-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={open}
                            onClose={handleClose}
                            PaperProps={{
                                style: {
                                    maxHeight: ITEM_HEIGHT * 4.5,
                                    width: "20ch",
                                },
                            }}
                        >
                            <MenuItem onClick={handleClose}>
                                <ExitToApp size="small" />{" "}
                                <span className={classes.menulist}>
                                    <AlertDialog />
                                </span>
                            </MenuItem>
                            <MenuItem onClick={handleClose}>
                                <Settings size="small" />{" "}
                                <span className={classes.menulist}>
                                    <Setting />
                                </span>
                            </MenuItem>
                            <MenuItem onClick={handleClose}>
                                <OpenInNew size="small" />{" "}
                                <span className={classes.menulist}>Help & FAQ</span>
                            </MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
        </>
    );
}
