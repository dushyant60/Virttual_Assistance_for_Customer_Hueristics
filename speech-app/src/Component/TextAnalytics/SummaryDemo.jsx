import React, { useState, useRef, useEffect } from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { Box, TextField, InputAdornment, IconButton, Tooltip, Typography } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import { Close, CloudUploadOutlined } from '@material-ui/icons';
import HomeIcon from '@material-ui/icons/Home';
import './ChatApp.css';
import axios from "axios";

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [documentUrl, setDocumentUrl] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const [model, setModel] = useState("text-davinci-003");
  const [temperature, setTemperature] = useState(0.6);
  const [maxLength, setMaxLength] = useState(100);
  const [topP, setTopP] = useState(1.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [animationStopped, setAnimationStopped] = useState(false);
  const [tags, setTags] = useState(["What to do?", "Another Tag", "Yet Another Tag"]);
  const [extractedQuestions, setExtractedQuestions] = useState([]);

  const stopAnimation = () => {
    setAnimationStopped(true);
  };

  // Add state variable to control the visibility of the greeting bubble
  const [showGreetingBubble, setShowGreetingBubble] = useState(false);

  // Function to show the greeting bubble
  const showGreeting = () => {
    setShowGreetingBubble(true);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY
  });
  const openai = new OpenAIApi(configuration);

  const handleDocumentUpload = async (e) => {
    // ... Existing code ...
  };

  const extractQuestionsFromResponse = (responseText) => {
    const sentences = responseText.split('.');

    // Extract questions from the sentences
    const questions = sentences
      .filter((sentence) => sentence.toLowerCase().includes('questions:'))
      .map((sentence) => {
        // Remove "Questions:" and any leading/trailing spaces from each sentence
        const cleanedSentence = sentence.replace(/Questions:/gi, '').trim();
        return cleanedSentence;
      });
  
    const questionsArray = questions.flatMap((sentence) => {
      // Split each cleaned sentence into an array of questions based on punctuation marks
      return sentence.split(/\s*(?:[.?!,]\s*)+/);
    });
    return questionsArray;
  };

  const sendTagToBot = async (tag) => {
    try {
      // Send the tag as input to the chat bot
      const response = await openai.createCompletion({
        model: model,
        prompt: `generate relevent answer in 10 to 20 words on the basis of the following text and suggest 2 to 3 questions in 5 to 6 words relevant to the answer,here is the text:${tag} and also consider previous response ${messages} "give response in this format "answer:content" question:"content"`,
        temperature: temperature,
        max_tokens: maxLength,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
      });

      const botResponse = response.data.choices[0].text.trim();
      console.log("res",botResponse)
      const sentences = botResponse.split('.');
       
      // Extract questions from the sentences
      const Answer = sentences
      .filter((sentence) => sentence.toLowerCase().includes('answer:'))
      .map((sentence) => {
        // Remove "Questions:" and any leading/trailing spaces from each sentence
        const cleanedSentence = sentence.replace(/Answer:/gi, '').trim();
        return cleanedSentence;
      });
      // Extract questions from the bot's response
      const questions = extractQuestionsFromResponse(botResponse);

      // Remove "Answer" and "Questions" words
      // const cleanedResponse = Answer
      //   .replace(/Answer:/gi, '').trim();

      

      // Update the extracted questions state
      setExtractedQuestions(questions);

      // Add the bot's cleaned answer without questions to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: Answer, isUser: false },
      ]);

      // Return the bot's response so that we can use it for generating more questions if needed
      return botResponse;
    } catch (error) {
      console.error('Bot error:', error);
    }
  };

  const sendMessageToAPI = async (message) => {
    try {
      // Make a POST request to the API endpoint
      const response = await axios.get('https://webApp-Backend-BotId-js3dlele7yvo6.azurewebsites.net/api/messages', {
        message: inputText,
      });

      // Handle the API response here
      const apiResponse = response.data;
       console.log("apiresponse",apiResponse)
      // Add the API response to your chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: apiResponse, isUser: false },
      ]);
    } catch (error) {
      console.error('Error sending message to API:', error);
    }
  };

  const handleTagClick = async (tag) => {
    // Remove the clicked tag from the tags state
    // const updatedTags = tags.filter((t) => t !== tag);
    setTags([]);

    // Add the clicked tag as user input
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: tag, isUser: true },
    ]);

    try {
      // Send the tag as input to the chat bot and get the bot's response
      const botResponse = await sendTagToBot(tag);

      // Ensure that botResponse is defined and is a non-empty string
      if (typeof botResponse === 'string' && botResponse.trim() !== '') {
        // Update the extracted questions state with the new questions from the bot's response
        const newQuestions = extractQuestionsFromResponse(botResponse);
        setExtractedQuestions(newQuestions);
      } else {
        console.error('Bot response is not valid:', botResponse);
      }
    } catch (error) {
      console.error('Error while processing bot response:', error);
    }
  };

  const handleInputtext = async () => {
    if (inputText) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: inputText, isUser: true },
      ]);

      try {
        // Send the user's input to the chat bot and get the bot's response
        await sendMessageToAPI(inputText);
      } catch (error) {
        console.error('Error while processing bot response:', error);
      }

      setInputText('');
    }
  };

  const handleInput = (e) => {
    setInputText(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInputtext();
    }
  };

  const toggleChat = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleRefresh = () => {
    setMessages([]);
    setTags(["What to do?", "Another Tag", "Yet Another Tag"])
  };

  return (
    <div>
      {!isOpen && (
        <Tooltip title="How can I help you">
          <img
            src="/images/chitti.png"
            alt="Chat Icon"
            className="boticon"
            onClick={() => {
              toggleChat();
              showGreeting(); // Show the greeting bubble on chat icon click
            }}
          />
        </Tooltip>
      )}
      {isOpen && (
        <Box className='botstyle'>
          <Box className='botheader'>
            <Typography className='bottext' variant="h6" >
              Ask me
            </Typography>
            <IconButton onClick={toggleChat}>
              <Close style={{ color: "white" }} />
            </IconButton>
          </Box>
          <Box ref={chatContainerRef} className='greetingBox' >
            <Box style={{ display: "flex" }}>
              <img src='/images/chitti.png' height="50px" />
              <Box
                className={`text-bubble ${animationStopped ? 'stopped' : ''}`}
                onAnimationIteration={stopAnimation}
              >
                <p>Hello!</p>
                <p style={{ fontSize: "12px" }}>How can I help you?</p>
              </Box>
            </Box>
            {messages.map((message, index) => (
              <Box key={index} style={{ marginBottom: '10px' }}>
                {message.isUser ? (
                  <Box className='msgbox'>
                    <Box className='userinput'>
                      {message.content}
                    </Box>
                    <img src='/images/avt.png' height="35px" />
                  </Box>
                ) : (
                  <>
                    <Box className='boticonstyling'>
                      <img src="/images/chitti.png" height="50px" alt="Robot" />
                      <Box className='botreply'>
                        {message.content}
                      </Box>
                    </Box>
                    <Box className='botques'>
                      {extractedQuestions.map((question, index) => (
                        <span
                          key={index}
                          className='botquestag'
                          onClick={() => handleTagClick(question)}
                        >
                          {question}
                        </span>
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            ))}
          </Box>
          <Box className='textarea'>
            <Box style={{ margin: "6px" }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className='botquestag'
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </span>
              ))}
            </Box>
            <Box className='textarea2'>
              <HomeIcon className='homeicon' onClick={handleRefresh} />
              <TextField
                className='textfield'
                variant="outlined"
                size="small"
                fullWidth
                type="text"
                value={inputText}
                onChange={handleInput}
                onKeyPress={handleKeyPress}
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      onClick={sendMessageToAPI}
                      style={{ cursor: 'pointer' }}
                    >
                      <SendIcon style={{ color: "#bcbbbb" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <label htmlFor="document-upload">
                <IconButton component="span" className='cloudicon' >
                  <CloudUploadOutlined />
                </IconButton>
              </label>
              <input
                type="file"
                onChange={handleDocumentUpload}
                style={{ display: 'none' }}
                id="document-upload"
              />
            </Box>
          </Box>
          {documentUrl && (
            <Typography className='docs' >
              Document uploaded successfully.{' '}
              <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                View Document
              </a>
            </Typography>
          )}
        </Box>
      )}
    </div>
  );
};

export default ChatApp;
