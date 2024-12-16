const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { BlobServiceClient } = require('@azure/storage-blob');

const app = express();
const PORT = process.env.PORT || 3006;

// Twilio credentials
const accountSid = 'ACe92fe807bd481b5b8ffa392afe1a890f';  
const authToken = '0dbf6cd96a6113212fdd766601a741ad';  

// Blob Storage credentials
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=recordedcall;AccountKey=EuzY+felTjStPJXsBJo0BXyp6KtdovCmjOVYsU8d/ghXcjfQ7BxZh8J+A/HG4+00FeldlMbT6ikB+AStPnBkMQ==;EndpointSuffix=core.windows.net';
const containerName = 'recorededcall';

// Authenticate with Twilio
const twilioAuth = {
  username: accountSid,
  password: authToken
};

// Function to download the audio file
async function downloadAudioFile(url) {
  try {
    const response = await axios.get(url, { auth: twilioAuth, responseType: 'stream' });
    const audioFilePath = 'audio.wav'; // You can change the filename if needed
    const writer = fs.createWriteStream(audioFilePath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading audio file:', error);
    throw error;
  }
}

// Function to upload the audio file to Azure Blob Storage
async function uploadToBlobStorage(filePath) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobName = 'audio.wav'; // Name of the blob
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  try {
    const response = await blockBlobClient.uploadFile(filePath);
    console.log('File uploaded to Azure Blob Storage:', response.requestId);
    return response;
  } catch (error) {
    console.error('Error uploading file to Azure Blob Storage:', error.message);
    throw error;
  }
}

// Route to handle the download and upload process
app.get('/download-and-upload', async (req, res) => {
  try {
    // Download audio file from Twilio
    await downloadAudioFile('https://api.twilio.com/2010-04-01/Accounts/ACe92fe807bd481b5b8ffa392afe1a890f/Recordings/0dbf6cd96a6113212fdd766601a741ad');
    console.log('Audio file downloaded successfully');

    // Upload audio file to Azure Blob Storage
    const uploadResponse = await uploadToBlobStorage('audio.wav');
    console.log('Audio file uploaded to Azure Blob Storage');
    
    res.json({ message: 'Audio file downloaded and uploaded successfully', uploadResponse });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
