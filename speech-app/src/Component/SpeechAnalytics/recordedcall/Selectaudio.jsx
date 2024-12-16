import React, { useState, useEffect } from 'react';
import {
  Checkbox,
  ListItemText,
  MenuItem,
  Popover,
  Button,
  makeStyles,
} from '@material-ui/core';
import { getBlobsInContainer } from '../../DataPrepare/azure-storage-blob';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: '7px',
    border: '2px solid white',
    fontSize: '12px',
    color: 'black',
    borderRadius: '15px',
    backgroundColor: 'white',
    padding: '2.5px 12px',
  },
  popover: {
    '& .MuiPaper-root': {
      width: '300px',
      maxHeight: '50%',
      overflowY: 'auto',
      overflowX: 'auto',
    },
  },
  menuItem: {
    padding: '2px 8px',
    border: '1px solid #ccc',
    '& .MuiCheckbox-root': {
      fontSize: '12px',
      padding: '6px',
      width: '18px',
      height: '18px',
    },
    '& .MuiTypography-body1': {
      fontSize: '12px',
    },
    '&:hover': {
      backgroundColor: 'lightgrey',
    },
  },
}));

const Selectaudio = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [blobList, setBlobList] = useState([]);
  const { t } = useTranslation();
  const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1 hr
  useEffect(() => {
    async function fetchBlobs() {
      const cachedBlobs = localStorage.getItem('cachedBlobs');
      const cacheTimestamp = localStorage.getItem('cacheTimestamp');
      const currentTime = new Date().getTime();

      if (cachedBlobs && cacheTimestamp && (currentTime - cacheTimestamp) < CACHE_EXPIRY_TIME) {
        const parsedBlobs = JSON.parse(cachedBlobs);
        const filteredBlobs = filterBlobsForPage(parsedBlobs);
        setBlobList(filteredBlobs);
      } else {
        const fetchedBlobs = await getBlobsInContainer();
        localStorage.setItem('cachedBlobs', JSON.stringify(fetchedBlobs));
        localStorage.setItem('cacheTimestamp', currentTime.toString());
        const filteredBlobs = filterBlobsForPage(fetchedBlobs);
        setBlobList(filteredBlobs);
      }
    }

    fetchBlobs();

    const intervalId = setInterval(fetchBlobs, CACHE_EXPIRY_TIME);
    return () => clearInterval(intervalId);
  }, []);

  const getCurrentPageURL = () => {
    return window.location.pathname;
  };

  const filterBlobsForPage = (blobs) => {
    const currentPageURL = getCurrentPageURL();
    const excludedExtensions = ['.pptx', '.doc', '.txt', '.xls', '.xlsx', '.ppt', '.csv'];
    const excludedLocations = ['summary', 'text-insight', 'moderation'];

    if (
      currentPageURL.includes('/app/textanalysis/summary') ||
      currentPageURL.includes('/app/textanalysis/Moderation') ||
      currentPageURL.includes('/app/textanalysis/textinsight')
    ) {
      return blobs.filter((blob) => {
        const fileExtension = blob.name.split('.').pop().toLowerCase();
        const fileLocation = blob.location;

        return (
          !excludedExtensions.includes(`.${fileExtension}`) &&
          !excludedLocations.includes(fileLocation)
        );
      });
    } else {
      return blobs;
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionToggle = (option) => {
    const newSelectedOption = option.name;

    setSelectedOptions([newSelectedOption]);

    if (newSelectedOption) {
      props.onSelectFile(option);
      localStorage.removeItem('cachedURL');
    } else {
      props.onSelectFile(null);
    }

    handleClose();
  };

  const open = Boolean(anchorEl);
  const classes = useStyles();

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredBlobList = blobList.filter((blob) => {
    return blob.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <Button
        style={{ background: 'white' }}
        variant='outlined'
        className={classes.button}
        onClick={handleOpen}
      >
        {t('select-document')}
      </Button>
      <Popover
        className={classes.popover}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ margin: '8px', padding: '8px', width: '-webkit-fill-available' }}
            className={classes.searchInput}
          />
        </div>
        {filteredBlobList.map((option) => (
          <MenuItem
            key={option.name}
            className={classes.menuItem}
            onClick={() => handleOptionToggle(option)}
          >
            <Checkbox checked={selectedOptions.includes(option.name)} />
            <ListItemText primary={option.name} />
          </MenuItem>
        ))}
      </Popover>
    </div>
  );
};

export default Selectaudio;
