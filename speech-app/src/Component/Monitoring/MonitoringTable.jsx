import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import "@inovua/reactdatagrid-community/index.css";
import { IconButton, Menu, MenuItem, TableCell,Button, Typography } from "@material-ui/core";
import { Delete, MoreVertOutlined, Refresh as RefreshIcon } from "@material-ui/icons";
import { keys } from "@material-ui/core/styles/createBreakpoints";
import "../DataPrepare/doctable.css";
import CustomerCallSummary from "../SpeechAnalytics/agent-call-log/CustomerCallSummary";
import {  CallReceived, CallMade } from "@material-ui/icons";
import CallRescheduleComponent from "../SpeechAnalytics/Calender";
import './doctable.css'

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

const MonitoringTable = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentData, setCurrentData] = useState([]);
  const { docList } = props;
  const [pageSize, setPageSize] = useState(10);
  const totalItems = docList.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selected, setSelected] = useState({});
  const gridRef = useRef(null);
  const onSelectionChange = useCallback(({ selected }) => {
    setSelected(selected)
    // const keysObj = selected === true ? dataMap : selected;
    // handleDocumentChange((Object.keys(keysObj)))
  }, []);

    // console.log("kl",selected)

    const openRightDrawer = () => {
        setIsDrawerOpen(true);
      };
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
            name: "Call",
            header: "Direction",
            defaultWidth: 80,
            render: ({ data }) => (
              <TableCell>
                {data.direction === "inbound" ? (
                  <CallReceived style={{ color: "red" }} />
                ) : (
                  <CallMade style={{ color: "green" }} />
                )}
              </TableCell>
            ),
          },
        // {
        //     name: "parent_call_sid",
        //     header: "Id",
        //     defaultWidth: 400,
        //     defaultFlex: 1,
        //     filterEditor: "text",
        //   },
          {
            name: "parent_call_sid",
            header: "Agent",
            defaultWidth: 400,
            defaultFlex: 1,
            filterEditor: "text",
            render: ({ data }) => {
              return (
                <TableCell >
                Anshu
                </TableCell>
              );
            },
          },
        {
          name: "to",
          header: "Phone Number",
          defaultWidth: 200,
          resizable: false,
        },
        {
          name: "start_time",
          header: "Date &Time",
          defaultWidth: 200,
          defaultFlex: 1,
        },
        {
            name: "duration",
            header: "Duration",
            defaultWidth: 200,
            defaultFlex: 1,
        },
        {
          name: "status",
          header: "Status",
          minWidth: 100,
          defaultFlex: 1,
          render: ({ data }) => {
            return (
              <TableCell >
                {data.status === "no-answer" ? (
                 <Typography color="primary">Rescheduled</Typography> 
                ) : (
                 
                    data.status
                  
                )}
              </TableCell>
            );
          },
        },
        {
            name: "action",
            header: "Action",
            minWidth: 100,
            defaultFlex: 1,
            resizable: false,
            render: ({ data }) => {
              return (
                <TableCell >
                {data.status === "no-answer" ? (
                  {/* <FullScreenDialog /> */}
                  
                ) : (
                 
                    {/* <FullScreenDialog /> */}
                  
                )}
              </TableCell>
              );
            },
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
        // checkboxColumn
        onSelectionChange={onSelectionChange}
        idProperty="id"
        rowHeight={40}
        handle={ref => gridRef.current = ref ? ref.current : null}
        selected={selected}
        className="data-grid"
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
            {"<"}
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
            {">"}
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
          {/* Selected rows: {selectedDocuments.length} */}
        </div>
      </div>
    </div>
  );
};

export default MonitoringTable;
