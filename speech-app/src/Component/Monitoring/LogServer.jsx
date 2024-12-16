import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@material-ui/core';
import { BlobServiceClient } from '@azure/storage-blob';
import { useTranslation } from 'react-i18next';



const LogServer = () => {
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      const logEntry = { type: 'log', message: formatConsoleOutput(args), timestamp: new Date() };
      setLogs((prevLogs) => [...prevLogs, logEntry]);
      originalConsoleLog(...args);
    };

    console.warn = (...args) => {
      const warnEntry = { type: 'warn', message: formatConsoleOutput(args), timestamp: new Date() };
      setLogs((prevLogs) => [...prevLogs, warnEntry]);
      originalConsoleWarn(...args);
    };

    console.error = (...args) => {
      const errorEntry = { type: 'error', message: formatConsoleOutput(args), timestamp: new Date() };
      setLogs((prevLogs) => [...prevLogs, errorEntry]);
      originalConsoleError(...args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, []);

  const formatConsoleOutput = (args) => {
    return args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
  };
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const storeLogsInBlobContainer = async () => {
    // const connectionString = "DefaultEndpointsProtocol=https;AccountName=ankitmystorage;AccountKey=1IQg6aKaQHcLVa70iiVE8/JNa6nZUQdsM3Y1GnddtMwRFBNAUL6WLHF26nN7AgT6cY6PsEtgtdvg+AStfWqvzQ==;EndpointSuffix=core.windows.net";
    const sasToken = "sp=racwdli&st=2023-08-24T10:56:07Z&se=2023-08-24T18:56:07Z&sv=2022-11-02&sr=c&sig=MQXkPzBvOaHSDPn9k5UGyhrbxKWDTotL7W6hfAdBAEA%3D";
    const containerName = 'glam-logs';

    const logsWithTimestamp = logs.map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    }));

    const logsJson = JSON.stringify(logsWithTimestamp);

    const uploadUrl = `https://ankitmystorage.blob.core.windows.net/?${sasToken}`;
    const blobServiceClient = new BlobServiceClient(uploadUrl);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = `logs-${timestamp}.json`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
      await blockBlobClient.upload(logsJson, logsJson.length);
      console.log('Logs stored in Blob container successfully.');
    } catch (error) {
      console.error('Failed to store logs in Blob container:', error);
    }
  };


  const getColor = (type) => {
    if (type === 'error') {
      return 'red';
    } else if (type === 'warn') {
      return 'yellow';
    } else {
      return 'white';
    }
  };

  const toggleLogsVisibility = () => {
    setShowLogs((prevShowLogs) => !prevShowLogs);
  };

  return (
    <div> 
       <Box style={{display:"flex",alignItems:"center"}}>
        <Button color="primary" onClick={toggleLogsVisibility}>
        {showLogs ? t('hideLogs') : t('showLogs')}
      </Button>
      {showLogs ?
      <Typography>{t('savelogs')}</Typography>
     :"" }
     </Box>
      {showLogs && (
        <div className="console" style={{ backgroundColor: 'black', color: 'white', fontFamily: 'monospace', padding: '10px' }}>
            <span>{timestamp}</span> 
          {logs.map((log, index) => (
            <div key={index} className={log.type} style={{ color: getColor(log.type) }}>
             <span>{log.message}</span>
            </div>
          ))}

          <Button variant="contained" color="primary" onClick={storeLogsInBlobContainer}>
            {t('storeLogs')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogServer;