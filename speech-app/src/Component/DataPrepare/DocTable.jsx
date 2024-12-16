import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import "@inovua/reactdatagrid-community/index.css";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { Delete, MoreVertOutlined, Refresh as RefreshIcon } from "@material-ui/icons";
import { keys } from "@material-ui/core/styles/createBreakpoints";
import "./doctable.css";
import { FaGreaterThan, FaLessThan } from "react-icons/fa";

const ITEM_HEIGHT = 48;

const checkboxColumn = {
  renderCheckbox: (checkboxProps, cellProps) => {
    const { onChange, checked } = checkboxProps;
    const rowData = cellProps.rowData;

    const background = !checked ? "white" : "#7986cb";
    const border =
      checked === false ? "2px solid #7C8792" : "2px solid #7986CB";

    return (
      <div
        style={{
          cursor: "pointer",
          background,
          borderRadius: "20%",
          height: "18px",
          width: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border,
          fontSize: 10,
          color: checked === false ? "inherit" : "Black",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
      >
        {checked === false ? "" : checked === true ? "✔" : "--"}
      </div>
    );
  },
};

const DocTable = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentData, setCurrentData] = useState([]);
  const { docList, selectedDocuments, handleDocumentChange, handleSelectAll, handleDelete } = props;
  const [pageSize, setPageSize] = useState(10);
  const totalItems = docList.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const [selected, setSelected] = useState({});
  const gridRef = useRef(null);
  const onSelectionChange = useCallback(({ selected }) => {
    setSelected(selected)
    const keysObj = selected === true ? dataMap : selected;
    handleDocumentChange((Object.keys(keysObj)))
  }, []);

    // console.log("kl",selected)

  const toArray = (selected, dataMap) => {
    const keysObj = selected === true ? dataMap : selected;
    console.log("krey", (Object.keys(keysObj)).length)
    return Object.keys(keysObj).length
  }

  const dataMap =
    gridRef && gridRef.current && gridRef.current.dataMap
      ? gridRef.current.dataMap
      : null;

  // console.log("hilo",dataMap)
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const [selectedFileName, setSelectedFileName] = useState([]);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const columns = [
    {
      name: "name",
      header: "File Name",
      defaultWidth: 300,
      defaultFlex: 1,
      filterEditor: "text",
    },
    {
      name: "size",
      header: "Size",
      defaultWidth: 200,
      resizable: false,
    },
    {
      name: "type",
      header: "Type",
      defaultWidth: 200,
      defaultFlex: 1,
      // resizable: false,
    },
    {
      name: "date",
      header: "Date",
      minWidth: 100,
      defaultFlex: 1,
    },
    {
      name: "time",
      header: "Time",
      minWidth: 100,
      defaultFlex: 1,
      resizable: false,
      // render: ({ data }) => (
      //   <span style={{ color: data.name ? "lightgreen" : "inherit" }}>

      //     <>
      //       <IconButton
      //         aria-label="more"
      //         aria-controls="long-menu"
      //         aria-haspopup="true"
      //         // onClick={handleClick}
      //       >
      //         <MoreVertOutlined />

      //       </IconButton>
      //       <Menu
      //         id="long-menu"
      //         anchorEl={anchorEl}
      //         keepMounted
      //         open={open}
      //         onClose={handleClose}
      //         PaperProps={{
      //           style: {
      //             maxHeight: ITEM_HEIGHT * 4.5,
      //             width: '20ch',
      //           },
      //         }}
      //       >
      //         <MenuItem>
      //           Delete
      //         </MenuItem>
      //         <MenuItem onClick={handleClose}>
      //           option 1
      //         </MenuItem>
      //         <MenuItem onClick={handleClose}>
      //           option 2
      //         </MenuItem>
      //       </Menu>
      //     </>

      //   </span>
      // ),
    },
  ];


  useEffect(() => {
    const slicedData = docList.slice(startIndex, endIndex);
    setCurrentData(slicedData);
  }, [currentPage, startIndex, endIndex, docList]);

  const handlePageSizeChange = (size) => {
    setCurrentPage(1);
    setPageSize(Number(size));
  };

  const handleRefresh = () => {
    const shuffledData = [...docList].sort(() => Math.random() - 0.5);
    const slicedData = shuffledData.slice(startIndex, endIndex);
    setCurrentData(slicedData);
  };

  return (
    <div className="table-container">
      <ReactDataGrid
        columns={columns}
        dataSource={currentData}
        checkboxColumn
        onSelectionChange={onSelectionChange}
        idProperty="id"
        rowHeight={40}
        handle={ref => gridRef.current = ref ? ref.current : null}
        selected={selected}
        className="datagrid"
      />
      <div className="pagination-controls">
        <div className="pagination-arrows">
          <button
            className="pagination-button"
            onClick={() =>
              setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
            }
            disabled={currentPage === 1}
          >
            <FaLessThan/>
          </button>
          <span style={{ fontSize: "14px", margin: "0 10px" }}>
            Page: {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-button"
            onClick={() =>
              setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <FaGreaterThan/>
          </button>
        </div>
        <div className="results-per-page">
          Results per page:
          <select onChange={(e) => handlePageSizeChange(e.target.value)}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <IconButton
          aria-label="refresh"
          onClick={handleRefresh}
          style={{ padding: '8px', fontSize: '16px' }}
        >
          <RefreshIcon />
        </IconButton>
        <div className="showing-pages">
          Showing {startIndex + 1} - {endIndex} of {totalItems}
          {/* Selected rows: {selectedDocuments.length} */}
        </div>
        <div className="selectedpages">
          {/* Showing {startIndex + 1} - {endIndex} of {totalItems} */}
          Selected rows: {selectedDocuments.length}
        </div>
      </div>
    </div>
  );
};

export default DocTable;
