import React, { useState, useEffect } from 'react';  
import './DataPrepare.css';  
import { Button, Checkbox, makeStyles, ButtonGroup, Snackbar, Container, TextField, InputAdornment } from '@material-ui/core';  
import CloudUploadIcon from '@material-ui/icons/CloudUpload';  
import uploadFileToBlob, { isStorageConfigured, getBlobsInContainer, deleteBlobFromContainer } from './azure-storage-blob';  
import { FaTrashAlt } from "react-icons/fa";  
import { useTranslation } from 'react-i18next';  
import RefreshIcon from '@material-ui/icons/Refresh';  
import { Search } from '@material-ui/icons';  
import DocTable from './DocTable';  
import ConfirmationDialog from './CinfirmationDialog';  
import { getCache, setCache } from './cacheutils';  
  
const storageConfigured = isStorageConfigured();  
  
const useStyles = makeStyles((theme) => ({  
  container: {  
    marginTop: '15px',  
    backgroundColor: 'rgba(255, 255, 255, 0.95)',  
    boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)', // Lighten the shadow  
    borderRadius: '15px',  
    display: 'flex',  
    flexDirection: 'row', // Align items vertically  
    alignItems: 'center', // Center horizontally  
    [theme.breakpoints.down('xs')]: {  
      display: 'flex',  
      flexWrap: "wrap"  
    },  
  },  
  container1: {  
    marginTop: '15px',  
    backgroundColor: 'rgba(255, 255, 255, 0.95)',  
    boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)', // Lighten the shadow  
    borderRadius: '15px',  
  },  
  btnContainer: {  
    display: 'flex',  
    justifyContent: 'center', // Center buttons horizontally  
    margin: '10px 0', // Add space at the top and bottom  
  },  
  button: {  
    margin: '0 10px',  
    borderRadius: "10px",  
    fontSize: "12px", // Smaller font size for the button text  
    paddingLeft: "15px",  
    paddingRight: "15px", // Adjust padding as needed  
    [theme.breakpoints.down('md')]: {  
      width: '100%',  
    },  
  },  
  searchField: {  
    width: '35%',  
    marginLeft: '30vh', // Add space between search field and buttons  
    [theme.breakpoints.down('md')]: {  
      width: '50%',  
      marginLeft: '5px',  // On medium screens, switch to 2 columns  
    },  
    [theme.breakpoints.down('xs')]: {  
      width: '100%',  
      marginLeft: '5px',  
      marginBottom: "5px"  // On medium screens, switch to 2 columns  
    },  
  },  
  snackbar: {  
    marginTop: '8px', // Adjust snackbar spacing  
  },  
  dcontainer: {  
    [theme.breakpoints.down('sm')]: {  
      //  marginTop: "50px" // On medium screens, switch to 2 columns  
    },  
  }  
}));  
  
const DataPrepare = () => {  
  const classes = useStyles();  
  const [selectAll, setSelectAll] = useState(false);  
  const [selectedDocuments, setSelectedDocuments] = useState([]);  
  const [openSnackbar, setOpenSnackbar] = useState(false);  
  const [blobList, setBlobList] = useState([]);  
  const [docList, setDocList] = useState();  
  const [fileSelected, setFileSelected] = useState([]);  
  const [fileUploaded, setFileUploaded] = useState('');  
  const [uploading, setUploading] = useState(false);  
  const [inputKey, setInputKey] = useState(Math.random().toString(36));  
  const { t } = useTranslation();  
  const [searchQuery, setSearchQuery] = useState('');  
  const [searchResults, setSearchResults] = useState([]);  
  const [isLoading, setIsLoading] = useState(false);  
  const [open, setOpen] = React.useState(false);  
  const [successMessage, setSuccessMessage] = React.useState('');  
  const cacheKey = 'blobListCache'; // common cache key  
  
  const handleClickOpen = () => {  
    setOpen(true);  
  };  
  
  const handleClose = () => {  
    setSelectedDocuments([]);  
    setOpen(false);  
  };  
  
  // *** GET FILES IN CONTAINER ***  
  useEffect(() => {  
    const fetchData = async () => {  
      setIsLoading(true);  
      const cachedData = getCache(cacheKey);  
      if (cachedData) {  
        setBlobList(cachedData);  
        setIsLoading(false);  
      }  
  
      const freshData = await getBlobsInContainer();  
      setBlobList(freshData);  
      setCache(cacheKey, freshData);  
      setIsLoading(false);  
    };  
  
    fetchData();  
  }, [fileUploaded]);  
  
  useEffect(() => {  
    const filteredDocs = blobList.filter((doc) =>  
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())  
    );  
    setSearchResults(filteredDocs);  
  }, [blobList, searchQuery]);  
  
  const onFileChange = (event) => {  
    const files = event.target.files;  
    setFileSelected(Array.from(files));  
  };  
  
  const onFileUpload = async () => {  
    if (fileSelected && fileSelected.length > 0) {  
      setUploading(true);  
      for (const file of fileSelected) {  
        await uploadFileToBlob(file);  
      }  
      setFileSelected([]);  
      setFileUploaded(fileSelected[fileSelected.length - 1]);  
      setUploading(false);  
      setInputKey(Math.random().toString(36));  
      setOpenSnackbar(true);  
    } else {  
      console.error("No files selected.");  
    }  
  };  
  
  const handleSelectAll = () => {  
    if (!selectAll) {  
      const allFileNames = blobList.map((item) => item.name);  
      setSelectedDocuments(allFileNames);  
    } else {  
      setSelectedDocuments([]);  
    }  
    setSelectAll((prevSelectAll) => !prevSelectAll);  
  };  
  
  const handleDocumentChange = (fileName) => {  
    setSelectedDocuments(fileName);  
  };  
  
  const handleDelete = async (documentName) => {  
    const updatedDocList = blobList.filter((item) => item.name !== documentName);  
    setBlobList(updatedDocList);  
    await deleteBlobFromContainer(documentName);  
    setSelectedDocuments((prevSelected) =>  
      prevSelected.filter((item) => item !== documentName)  
    );  
  };  
  
  const handleDeleteAll = async () => {  
    handleClose();  
    const selectedDocNames = selectedDocuments.slice();  
    setSelectedDocuments([]);  
    setSelectAll(false);  
    for (const docName of selectedDocNames) {  
      await deleteBlobFromContainer(docName);  
    }  
    const updatedDocList = blobList.filter((item) => !selectedDocNames.includes(item.id));  
    setBlobList(updatedDocList);  
    setSuccessMessage('Audio deleted successfully!');  
    setOpenSnackbar(true); // Show the Snackbar  
    // Refresh the table  
    handleRefresh();  
  };  
  
  const handleRefresh = async () => {  
    setIsLoading(true);  
    const freshData = await getBlobsInContainer();  
    setBlobList(freshData);  
    setCache(cacheKey, freshData);  
    setIsLoading(false);  
  };  
  
  const handleSearch = (event) => {  
    const query = event.target.value;  
    setSearchQuery(query);  
    const filteredDocs = blobList.filter((doc) =>  
      doc.name.toLowerCase().includes(query.toLowerCase())  
    );  
    setSearchResults(filteredDocs);  
  };  
  
  const handleOpenSnackbar = () => {  
    setOpenSnackbar(true);  
  };  
  
  const handleCloseSnackbar = () => {  
    setOpenSnackbar(false);  
    setSuccessMessage(''); // Reset the success message after Snackbar closes  
  };  
  
  // Background sync to update cache periodically  
  useEffect(() => {  
    const interval = setInterval(async () => {  
      const freshData = await getBlobsInContainer();  
      setBlobList(freshData);  
      setCache(cacheKey, freshData);  
    }, 300000); // Sync every 5 minutes  
  
    return () => clearInterval(interval);  
  }, []);  
  
  return (  
    <div className="dcontainer">  
      <Container component="main" maxWidth="lg" className={classes.container}>  
        <div className={classes.btnContainer}>  
          <div>  
            <TextField  
              variant="outlined"  
              size="small"  
              type="file"  
              id="browseField"  
              multiple  
              onChange={onFileChange}  
              key={inputKey || ''}  
              inputProps={{  
                multiple: true,  
                // accept: '.doc, .docx, .pdf, .csv, .txt, .xls, .xlsx, .ppt, .pptx'  
              }}  
            />  
          </div>  
          <Snackbar  
            open={openSnackbar}  
            autoHideDuration={5000} // Set the duration to 5 seconds  
            onClose={handleCloseSnackbar}  
            message={successMessage || "File uploaded successfully!"}  
          />  
          <Button  
            size="small"  
            startIcon={<CloudUploadIcon style={{ fontSize: '1.2rem' }} />}  
            id="uploadBtn"  
            disabled={fileSelected.length === 0}  
            onClick={onFileUpload}  
            variant="contained"  
            color="primary"  
            className={classes.button}  
            style={{  
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',  
            }}  
          >  
            {uploading ? "Uploading..." : t('upload')}  
          </Button>  
          <Button  
            color="secondary"  
            size="small"  
            id="deleteBtn"  
            disabled={selectedDocuments.length <= 0}  
            onClick={handleClickOpen}  
            variant="contained"  
            startIcon={<FaTrashAlt style={{ fontSize: '0.9rem' }} />}  
            className={classes.button}  
            style={{  
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',  
            }}  
          >  
            {t('delete')}  
          </Button>  
          <Button  
            variant="contained"  
            color="default"  
            size="small"  
            startIcon={<RefreshIcon />}  
            id="refreshBtn"  
            onClick={handleRefresh}  
            className={classes.button}  
            style={{  
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',  
            }}  
          >  
            {t('refresh')}  
          </Button>  
        </div>  
        <div className={classes.searchField}>  
          <TextField  
            type="text"  
            size="small"  
            placeholder={t('searchdocs')}  
            variant="outlined"  
            fullWidth  
            value={searchQuery}  
            onChange={handleSearch}  
            InputProps={{  
              endAdornment: (  
                <InputAdornment position="end">  
                  <Search />  
                </InputAdornment>  
              ),  
            }}  
          />  
        </div>  
      </Container>  
      <Container component="main" maxWidth="lg" className={classes.container1} style={{  
        paddingLeft: "0px",  
        paddingRight: "0px",  
      }}>  
        {isLoading ? (  
          <div>{t('loading')}</div>  
        ) : (  
          <>  
            <DocTable  
              docList={searchQuery ? searchResults : blobList}  
              selectedDocuments={selectedDocuments}  
              handleDocumentChange={handleDocumentChange}  
              handleSelectAll={handleSelectAll}  
              handleDelete={handleDelete}  
            />  
          </>  
        )}  
      </Container>  
      <ConfirmationDialog open={open} handleClose={handleClose} handleAgree={handleDeleteAll} />  
    </div>  
  );  
};  
  
export default DataPrepare;  
