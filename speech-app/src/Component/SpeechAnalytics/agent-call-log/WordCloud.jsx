import React, { useState, useEffect } from 'react';
import ReactWordcloud from 'react-wordcloud';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';

const stopWords = [
  'a', 'an', 'the', 'and', 'in', 'on', 'at', 'to', 'for', 'with', 'as',
  'of', 'by', 'from', 'is', 'it', 'this', 'that', 'which', 'he', 'she', 'what', 'have', 'does', 'did', 'they', 'were', 'and', 'be', 'these', 'where', 'we', 'will'
];

const WordDetails = ({ selectedWord, onClose, open }) => {
  const [wordDetails, setWordDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summarizationPrompt = [
          {
            role: 'system',
            content: `
              Explain this word ${selectedWord.text}
            `,
          },
        ];

        const apiKey = '0c7473739bb4409a82ce91a565fa983d';
        const svcName = 'openai-glam';
        const selectedmodel = 'gpt35-turbo';
        const maxLength = 50;
        const temperature = 0.7;
        const topP = 1;
        const frequencyPenalty = 0;
        const presencePenalty = 0;

        const endpoint = `https://${svcName}.openai.azure.com/openai/deployments/${selectedmodel}/chat/completions?api-version=2023-09-15-preview`;

        const response = await axios.post(
          endpoint,
          {
            messages: summarizationPrompt,
            max_tokens: maxLength,
            temperature: temperature,
            top_p: topP,
            frequency_penalty: frequencyPenalty,
            presence_penalty: presencePenalty,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-key': apiKey,
            },
          }
        );

        const data = response.data;
        setWordDetails(data.choices[0]?.message?.content);
      } catch (error) {
        console.error('Error fetching word details:', error);
      }
    };

    fetchData();
  }, [selectedWord]);

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle style={{ background:"#3f51b5",color:"white",textTransform:"capitalize"}}>{selectedWord.text}</DialogTitle>
      <DialogContent>
        <p>{wordDetails}</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const WordCloud = ({ text }) => {
  const [selectedWord, setSelectedWord] = useState(null);
  const [open, setOpen] = useState(false);

  const handleWordClick = (word) => {
    setSelectedWord(word);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Check if the text is provided and not empty
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return null;
  }

  const words = text.split(' ')
    .filter(word => !stopWords.includes(word))
    .map(word => ({
      text: word,
      value: 1 + Math.floor(Math.random() * 10),
    }));

  const options = {
    rotations: 2,
    rotationAngles: [-90, 0],
  };

  return (
    <div style={{ display: 'flex', alignItems:"center", justifyContent:"center"}}>
      <div>
        <ReactWordcloud words={words} options={options} callbacks={{ onWordClick: handleWordClick }} />
      </div>
      <div style={{ marginLeft: '20px' }}>
        {selectedWord && (
          <WordDetails selectedWord={selectedWord} onClose={handleClose} open={open} />
        )}
      </div>
    </div>
  );
};

export default WordCloud;
