import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  withStyles,
} from '@material-ui/core';
import { useState } from 'react';
import { useCallback } from 'react';
import EditIcon from '@material-ui/icons/Edit';
import axios from "axios";


const RoundedButton = withStyles({
  root: {
    borderRadius: 32,
  },
})(Button);

export function ProfileNavigationCard(props) {
  const [askingSignOut, setAskingSignout] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const viewProfile = useCallback(() => {
  // //   history.push(Routes.MyProfile);
  // }, [history]);

  const handlerInputChange = (event) => {
    let files = event.target.files;
    console.log(event.target);
    let reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (e) => {
      updateImage(e.target?.result);
    };
  };

  // const img=user?.imgUrl;
  const token = localStorage.getItem("token");
  // const userImg = user?.imgUrl ? user.imgUrl :'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  const updateImage = (files) => {
    const formData = { file: files, name: "name" };
    setIsLoading(true);
    if (token) {
      axios
        .post(`/api/s3/upload`, formData, {
          headers: { Authorization: token },
        }).then(updres => {
          // const updatelogo = { _id:user._id,imgUrl: updres.data};

          axios
            .put("/api/user/image", "updatelogo", {
              headers: { Authorization: token },
            })
            .then((res) => {
              axios
                .get("/api/user/info", { headers: { Authorization: token } })
                .then((res2) => {
                  // dispatch(setCurrentUser(res2.data.user));
                  setIsLoading(false);
                  alert("Profile picture updated Successfully")
                });

            })
            .catch((err) => {
              console.log("err", err.response.data);
              setIsLoading(false);
              alert("Something went wrong!")
            });


        }).catch((err) => {
          console.log("err", err.response.data);
          setIsLoading(false);
          alert.error("Something went wrong!")
        });
    }



  };

  const onSignOut = useCallback(async () => {
    setAskingSignout(false);

    localStorage.removeItem('picture');
    localStorage.removeItem('token');
    localStorage.clear()
    /// unset the user in app state.
    //   dispatch(setCurrentUser(undefined));
    //   dispatch(logOut());
    //   history.replace(Routes.Base);
  }, []);

  // if (!user) {
  //   return <></>;
  // }
  return (
    <Box padding={1}>
      <Box padding={2}>
        <div>
          {/* <img
            //   className={styles.image}
            //   src={userImg}
              alt='profile'
              id="userProfile"
            /> */}
          <Box style={{ height: "10vh", display: "flex", justifyContent: "center", backgroundColor: "#d8d8d8" }}>
            <Typography style={{ marginTop: "12px" }}>Anshu</Typography>
          </Box>
          <Box style={{ position: "absolute", top: "50px", left: "110px" }}>
            <Avatar style={{ backgroundColor: "blue" }} />
          </Box>
          <Box style={{ marginTop: "12px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            {/* <Box> */}
            <Typography style={{ marginTop: "12px" }}>{props.info.name}
              <label htmlFor='select-image' ><EditIcon fontSize='small' style={{ marginTop: "0", marginRight: "0" }} /></label>
            </Typography>

            <Typography>{props?.info?.userName}</Typography>
            {/* </Box> */}
          </Box>
          <input
            type="file"
            name="select-image"
            id="select-image"
            accept="image/png, image/gif, image/jpeg"
            onChange={handlerInputChange}
            style={{ display: "none" }}
          />
        </div>
        {/* <div>
            <Typography variant='h6' >
              user.name
            </Typography>
            <Typography variant='body2' >
             user.role
            </Typography>
          </div> */}
      </Box>
      <Box padding={2} >
        <RoundedButton onClick={() => { document.getElementById("select-image").click() }} color='primary' fullWidth>
          {isLoading ? <CircularProgress /> : 'change your profile picture'}
        </RoundedButton>
      </Box>
      {/* <Box padding={1} className={styles.navigation}>
          <NavLink to='' className={styles.navItem} activeClassName={styles.navItemActive}>
            helpAndSupport
          </NavLink>
        </Box> */}
      <Dialog open={askingSignOut} onClose={() => setAskingSignout(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Exit</DialogTitle>
        <DialogContent>
          <DialogContentText>Please confirm again to exit.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' color='primary' onClick={() => setAskingSignout(false)}>
            Cancel
          </Button>
          <Button variant='contained' color='primary' onClick={onSignOut}>
            Yes, exit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
