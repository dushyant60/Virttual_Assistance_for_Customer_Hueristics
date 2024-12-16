import React, { useState,useEffect } from "react";
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  tablecell: {
    padding: "1px",
    // fontSize: "1.5rem",
     color: 'black', // Set the text color to white
  },
  tablecelldark: {
    padding: "1px",
    // fontSize: "1.5rem",
     color: 'white', // Set the text color to white
  },
  row: {
    "&:hover": {
      backgroundColor: "lightgray",
    },
    cursor: 'pointer', // Add this line to make the row clickable
  },
  hrow: {
    background: "#dbe8ec"
  },
  tableheadcell: {
    fontWeight: "800",
    padding: "3px",
    // color: 'white', // Set the text color to white
  },
  tablecell_dark: {
    padding: "1px",
    backgroundColor: "#2b2b2b", // Set the background color to grey
    color: 'white', // Set the text color to white
  },
});


const ITEM_HEIGHT = 48;

const UploadedDocList = (props) => {
  const classes = useStyles();
  const { docList, selectedDocuments, handleDocumentChange, handleSelectAll, handleDelete } = props;
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 10;
  const [documentRange, setDocumentRange] = useState([0, documentsPerPage]);
  const [theme, setselectedTheme] = useState(localStorage.getItem('selectedTheme') || 'light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('selectedTheme') || 'light';
    setselectedTheme(storedTheme);
  });
  
  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    const selectedDocNames = checked ? docList.map((item) => item.name) : [];
    handleSelectAll(selectedDocNames);
  };

  const handleDocumentClick = (event, fileName) => {
    handleDocumentChange(event, fileName);
    if (selectedDocuments.includes(fileName) && !event.target.checked) {
      setSelectAll(false);
    }
  };

  const handleDeleteSelected = () => {
    const updatedDocList = docList.filter((item) => !selectedDocuments.includes(item.name));
    handleDelete(selectedDocuments); // Perform the delete operation on the backend
    // Update the state with the new docList and clear the selectedDocuments
    handleSelectAll([]); // Clear the selected documents
    setSelectAll(false);
    handleDocumentChange(null, ''); // Clear the selected document in the parent component
  };

  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    const newRange = [...documentRange];
    newRange[0] -= documentsPerPage;
    newRange[1] -= documentsPerPage;
    setDocumentRange(newRange);
  };

  const goToNextPage = () => {
    const newRange = [...documentRange];
    newRange[0] += documentsPerPage;
    newRange[1] += documentsPerPage;
    setDocumentRange(newRange);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { t } = useTranslation();

  const currentDocuments = docList.slice(documentRange[0], documentRange[1]);
  const pageNumbers = Math.ceil(docList.length / documentsPerPage);

  return (
    <TableContainer className={theme === 'dark' ? classes.tablecell_dark : undefined}>
      <div style={{display:"flex",width:"100%",justifyContent:"end"}}>
        {`${documentRange[0] + 1}-${Math.min(documentRange[1], docList.length)} of ${docList.length}`}
        <ArrowLeftIcon onClick={goToPreviousPage} />
        <ArrowRightIcon onClick={goToNextPage} />
      </div>
      <Table className={theme === 'dark' ? classes.tablecell_dark : undefined}>
        <TableHead>
          <TableRow className={classes.hrow}>
            <TableCell className={classes.tableheadcell}>
              <Checkbox
                color="primary"
                checked={selectedDocuments.length === 2 * docList.length || selectedDocuments.length === docList.length}
                onChange={handleSelectAllChange}
              />
              {t('file-name')}
            </TableCell>
            <TableCell className={classes.tableheadcell}>{t('size')}</TableCell>
            <TableCell className={classes.tableheadcell}>{t('type')}</TableCell>
            <TableCell className={classes.tableheadcell}>{t('date')}</TableCell>
            <TableCell className={classes.tableheadcell}>{t('action')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentDocuments.map((item, index) => (
            <TableRow
              className={classes.row}
              key={index}
              onClick={(event) =>
                handleDocumentChange(event, item.name)
              } // Change onChange to onClick
              checked={selectedDocuments.includes(item.name)}
            >
              <TableCell className={theme === 'dark' ? classes.tablecelldark : classes.tablecell}>
                <Checkbox
                  color="primary"
                  checked={selectedDocuments.includes(item.name)}
                  onChange={(event) =>
                    handleDocumentChange(event, item.name)
                  }
                />
                {item.name}
              </TableCell>
              <TableCell className={theme === 'dark' ? classes.tablecelldark : classes.tablecell}>{item.size}</TableCell>
              <TableCell className={theme === 'dark' ? classes.tablecelldark : classes.tablecell}>{item.type}</TableCell>
              <TableCell className={theme === 'dark' ? classes.tablecelldark : classes.tablecell}>{item.date}</TableCell>
              <TableCell className={theme === 'dark' ? classes.tablecelldark : classes.tablecell}>
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                >
                  <MoreVertIcon style={{color:theme==='dark'?'white':'black'}} />
                </IconButton>
                <Menu
                  id="long-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={open}
                  onClose={handleClose}
                  PaperProps={{
                    style: {
                      maxHeight: ITEM_HEIGHT * 4.5,
                      width: '20ch',
                    },
                  }}
                >
                  {/* <MenuItem onClick={() => handleDelete(item.name)}>
                    Delete
                  </MenuItem> */}
                  <MenuItem onClick={handleClose}>
                    option 1
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    option 2
                  </MenuItem>
                </Menu>
                {(selectedDocuments.length > 2) ? ("") : (
                  <>
                    {selectedDocuments.includes(item.name) && (
                      <DeleteForeverIcon
                        onClick={() => handleDelete(item.name)}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* <div>
        {Array.from(Array(pageNumbers).keys()).map((pageNumber) => (
          <button key={pageNumber} onClick={(event) => handlePageChange(event, pageNumber + 1)}>
            {pageNumber + 1}
          </button>
        ))}
      </div> */}
    </TableContainer>
  );
};

export default UploadedDocList;
