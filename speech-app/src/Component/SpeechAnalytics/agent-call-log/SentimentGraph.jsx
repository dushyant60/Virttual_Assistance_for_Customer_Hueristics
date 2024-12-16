import React from 'react';
import './sentimentgraph.css'; // Create a CSS file for styling
import { Typography,Box} from '@material-ui/core';
import { SentimentVerySatisfiedOutlined } from '@material-ui/icons';
import { SentimentDissatisfiedOutlined } from '@material-ui/icons';

const SentimentGraph = ({ positive, negative, neutral }) => {
    return (
        <div className="sentiment-graph">
            {/* <div className="bar">
                <div className="segment positive-segment" style={{ width: `${positive}%` }}>
                    Positive
                </div>
                <div className="segment negative-segment" style={{ width: `${negative}%` }}>
                    Negative
                </div>
                <div className="segment neutral-segment" style={{ width: `${neutral}%` }}>
                    Neutral
                </div>
            </div> */}
            <Box className='sentiment'>
                <Box className='sentiment-box'>
                    <Typography>Positive</Typography>
                    <SentimentVerySatisfiedOutlined className='sentiment-icon1'/>
                    <span>{positive}</span>
                </Box>
                <Box className='sentiment-box'>
                    <Typography>Negative</Typography>
                    <SentimentDissatisfiedOutlined  className='sentiment-icon2'/>
                    <span>{negative}</span>
                </Box>
                <Box className='sentiment-box'>
                    <Typography>Neutral</Typography>
                    <SentimentDissatisfiedOutlined  className='sentiment-icon3'/>
                    <span>{neutral}</span>
                </Box>
            </Box>
        </div>
    );
};

export default SentimentGraph;
