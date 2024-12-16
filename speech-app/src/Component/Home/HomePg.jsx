import React from "react";
import "./HomePage.css";
import { Box, Grid, Typography } from "@material-ui/core";
import { Container } from "react-bootstrap";
import DvrIcon from '@material-ui/icons/Dvr';
import { Link } from 'react-router-dom';
import {useTranslation} from 'react-i18next'
import { Routess } from "../../routes";
import { GraphicEqSharp, MicNoneOutlined, RecordVoiceOver } from "@material-ui/icons";

const HomePage = () => {
    const {t} = useTranslation();
    return (
        <>
            <Box style={{ height: "100%", weight: "100%" }}>
                <Container component="main" maxWidth="md" style={{ height: "100%", weight: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                <img style={{ height: "20vh", width: "10vw",margin: "10px"}} src='/images/glamlogo.png' alt="Logo" />
                    <Grid container>
                        <Grid style={{ display: "flex", justifyContent: "center" }} direction="row"
                            item xs={4}>
                            <Box className="box">
                                <Box className="boxContent">
                                    <Link to={Routess.SpeechAnalytics} className="link">
                                        <Box>
                                            <MicNoneOutlined fontSize="large" />
                                        </Box>
                                        <Box>
                                            <Link className="link">Real Time Call Analysis</Link>
                                            {/* <Typography>"{t('summarize-content')}"</Typography> */}
                                        </Box>
                                    </Link>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid style={{ display: "flex", justifyContent: "center" }} item xs={4}>
                            <Box className="box2">
                                <Box className="boxContent">
                                    <Link to={Routess.Recorded} className="link">
                                        <Box>
                                            <RecordVoiceOver fontSize="large" />
                                        </Box>
                                        <Box>
                                            <Link to={Routess.Recorded} className="link">Recorded Call Analysis</Link>
                                            {/* <Typography>"{t('translate-content')}"</Typography> */}
                                        </Box>
                                    </Link>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid style={{ display: "flex", justifyContent: "center" }} item xs={4}>
                            <Box className="box3">
                                <Box className="boxContent">
                                    <Link to={Routess.PostCall} className="link">
                                        <Box>
                                            <GraphicEqSharp fontSize="large" />
                                        </Box>
                                        <Box>
                                            <Link to={Routess.PostCall} className="link">Post Call Analysis</Link>
                                            {/* <Typography>"{t('q&a-content')}"</Typography> */}
                                        </Box>
                                    </Link>
                                </Box>
                            </Box>
                        </Grid>
                        {/* <Grid style={{ display: "flex", justifyContent: "center" }} item xs={4}>
                            <Box className="box4">
                                <Box className="boxContent">
                                    <Link to={Routess.TextInsight} className="link">
                                        <Box>
                                            <DescriptionIcon fontSize="large" />
                                        </Box>
                                        <Box>
                                            <Link to={Routess.TextInsight} className="link">{t('text-insight')}</Link>
                                            <Typography>"{t('textinsight-content')}"</Typography>
                                        </Box>
                                    </Link>
                                </Box>
                            </Box>
                        </Grid> */}
                        {/* <Grid style={{ display: "flex", justifyContent: "center" }} item xs={4}>
                            <Box className="box5">
                                <Box className="boxContent">
                                    <Link to={Routess.ContentModeration} className="link">
                                        <Box>
                                            <SpellcheckIcon fontSize="large" />
                                        </Box>
                                        <Box>
                                            <Link to={Routess.ContentModeration} className="link">{t('moderation')}</Link>
                                            <Typography>"{t('content-moderation')}"</Typography>
                                        </Box>
                                    </Link>
                                </Box>
                            </Box>
                        </Grid> */}
                        <Grid item xs={4}></Grid>
                        <Grid style={{ display: "flex", justifyContent: "center" }} item xs={4}>
                            <Box className="box6">
                                <Box className="boxContent">
                                <Link to={Routess.Monitoring} className="link">
                                    <Box>
                                        <DvrIcon fontSize="large"/>
                                    </Box>
                                    <Box>
                                        <Link to={Routess.Monitoring} className="link">{t('monitoring')}</Link>
                                        {/* <Typography>"{t('monitoring-content')}"</Typography> */}
                                    </Box>
                                </Link>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={4}></Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default HomePage;