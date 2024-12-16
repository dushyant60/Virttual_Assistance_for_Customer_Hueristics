import React, { useState, useEffect } from "react";
import {
  Box,
  Divider,
  makeStyles,
  Typography,
  Button,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  Container,
  Select,
  MenuItem,
  FormControl,
  TablePagination,
  TextField,
  Paper,
  TableContainer
} from "@material-ui/core";
import { Delete, CallReceived, CallMade, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon, FontDownloadRounded, FontDownloadOutlined, CloudDownloadRounded } from "@material-ui/icons";
import { CSVLink } from "react-csv";
import axios from "axios";
import MonitoringTable from "./MonitoringTable";
import { FaDownLeftAndUpRightToCenter } from "react-icons/fa6";

const useStyles = makeStyles((theme) => ({
  root: {},
  statBlock: {
    background: "#f0f0f0",
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    textAlign: "center",
  },
  tableHeader: {
    fontWeight: "bold",
    marginLeft: "10px",
    background: "#adadad",
    lineHeight: "2.5rem",
    fontSize: "14px",
    padding: "8px 15px", // Increase padding
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  completedRow: {
    // backgroundColor: "rgba(76, 175, 80, 0.4)",
    borderRadius: "8px",
    padding: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  failedRow: {
    // backgroundColor: "rgba(244, 67, 54, 0.7)",
    borderRadius: "8px",
    padding: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  noAnswerRow: {
    // backgroundColor: "rgba(255, 87, 51, 0.4)",
    borderRadius: "8px",
    padding: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 100,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  tableCell: {
    fontSize: "12.8px",
    fontWeight: "510",
    marginLeft: "20px",
    padding: "1px"
  },
  pagination: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    borderRadius: "5px",
    // border: "1px solid Black",
    // height: "40px",
    // border: "1px solid lightgrey",
  },
  search: {
    // marginTop: theme.spacing(1),
    height: "40px", // Updated the height for better visibility
    borderRadius: "5px",
    border: "1px solid Black",
    width: "55%",
  },
  summaryContainer: {
    marginLeft: "10px", // Adjust the margin to shift the table to the left
    display: "none", // Hide the summary container by default
  },
  showSummary: {
    display: "block", // Show the summary container when a summary is available
  },
}));
function CallLog() {
  const classes = useStyles();


  const [call, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filteredCalls, setFilteredCalls] = useState(call);
  const [agent, setSelectAgent] = useState("agent1");
  const [selectedCallSummary, setSelectedCallSummary] = useState(null);


  const handleViewSummary = (call) => {
    setSelectedCallSummary(call); // Set the selected call summary
  };

  // Function to close the call summary
  const closeCallSummary = () => {
    setSelectedCallSummary(null); // Reset the selected call summary
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
const twilioAccountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;  
const twilioAuthToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;  

    const config = {
      headers: {
        Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
      },
    };

    // Make an API request to Twilio to fetch call log details
    axios
      .get(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`,
        config
      )
      .then((response) => {
        // Assuming the response data is an array of call log details
        setCalls(response.data.calls);
        setFilteredCalls(response.data.calls);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching call log details:", error);
        setLoading(false);
      });
  }, []);

  // ... Total calls, answered calls, missed calls, and failed calls calculations ...

  useEffect(() => {
    // Update filteredCalls whenever call or searchQuery changes
    const filtered = call.filter((call) => {
      // Apply filter based on selectedFilter
      const currentDate = new Date();
      const callDate = new Date(call.start_time);
      if (selectedFilter === "day") {
        return (
          callDate.getDate() === currentDate.getDate() &&
          callDate.getMonth() === currentDate.getMonth() &&
          callDate.getFullYear() === currentDate.getFullYear()
        );
      } else if (selectedFilter === "month") {
        return (
          callDate.getMonth() === currentDate.getMonth() &&
          callDate.getFullYear() === currentDate.getFullYear()
        );
      } else if (selectedFilter === "week") {
        // Implement week filtering logic here
      }
      return true;
    });

    // Apply search filter
    const filteredBySearch = filtered.filter((call) =>
      call.to.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredCalls(filteredBySearch);
  }, [call, searchQuery, selectedFilter]);

  // Handle pagination page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleHeaderClick = (field) => {
    if (sortField === field) {
      toggleSortDirection();
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const sortData = () => {
    const sortedCalls = filteredCallsWithPhoneNumbers.slice();
    sortedCalls.sort((a, b) => {
      const valueA = a[sortField] || ""; // Handle undefined or missing values
      const valueB = b[sortField] || ""; // Handle undefined or missing values

      if (sortDirection === "asc") {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
    return sortedCalls;
  };



  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredCallsWithPhoneNumbers = filteredCalls.filter((call) => call.to !== "");

  return (
    <>

        <Grid
          // container
          spacing={1}
          style={{
            // boxShadow: "1px 2px 7px grey",
            // backdropFilter: "blur(15px)",
            // backgroundColor: "rgba(255, 255, 255, 0.3)",
            // marginTop: "30px",
            // marginBottom: "5px",
            // marginLeft: "15px",
            // margin: "0px",
            // width: "99.7%",
            // borderRadius: "10px",
          }}
        >
          {/* <Grid item xs={6}>
            <Box
              style={{
                display: "flex",
                textAlign: "center",
                alignItems: "center",
                width: "100%",
              }}
            >

              <FormControl variant="outlined" className={classes.formControl}>
                <Select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  style={{ height: "40px" }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="day">Day</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                  <MenuItem value="month">Month</MenuItem>
                </Select>
              </FormControl>

              <TextField
                className={classes.search}
                size="small"
                label="Search by Phone Number"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  position: "relative",
                  borderRadius: "5px",
                  border: "0px",
                }}
              />
            </Box>
          </Grid> */}
          {/* <Grid item xs={12}> */}
              
         
            {/* <div className={classes.pagination}>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredCallsWithPhoneNumbers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                SelectProps={{
                  style: {
                    border: "1px solid #ccc", // Add a border to the select component
                    borderRadius: "5px",
                    padding: "5px",
                  },
                }}
              />
            </div> */}
          {/* </Grid> */}
          {/* <Grid item xs={6} style={{ textAlign: "right" }}>
            <CSVLink data={filteredCalls} filename={"call_log.csv"}>
              <Button variant="outlined" color="primary">
                Export
              </Button>
            </CSVLink>
          </Grid> */}
        </Grid>
        {/* </Container>
      <Container component="main" maxWidth="lg" style={{ marginTop: "18px" }}> */}
        <Grid container style={{ padding: "0px" }}>
          <Grid item xs={12}>
            {loading ? (
              <CircularProgress style={{position:"absolute", 
              top:"72%", left:"32%"}} />
            ) : (
              <MonitoringTable docList={sortData()
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}/>
              /* <TableContainer
                component={Paper}
                style={{
                  boxShadow:
                    "0 4px 10px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.2)",
                  marginTop: "10px",
                  borderRadius: "15px",
                  backdropFilter: "blur(15px)",
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <Table
                  style={{
                    boxShadow:
                      "0 4px 10px rgba(0, 0, 0, 0.4), 0 6px 20px rgba(0, 0, 0, 0.2)", // A larger and more noticeable shadow
                    borderRadius: "10px", // Rounded corners
                    // padding: "20px", // Increased padding for spacing
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell className={classes.tableHeader}></TableCell>
                      <SortableHeader
                        field="id"
                        label="Id"
                        onClick={handleHeaderClick}
                        sortField={sortField}
                        sortDirection={sortDirection}
                      />
                      <SortableHeader
                        field="from"
                        label="Phone Number"
                        onClick={handleHeaderClick}
                        sortField={sortField}
                        sortDirection={sortDirection}
                      />
                      <SortableHeader
                        field="start_time"
                        label="Call Date & Time"
                        onClick={handleHeaderClick}
                        sortField={sortField}
                        sortDirection={sortDirection}
                      />
                      <SortableHeader
                        field="duration"
                        label="Duration"
                        onClick={handleHeaderClick}
                        sortField={sortField}
                        sortDirection={sortDirection}
                      />
                      <SortableHeader
                        field="status"
                        label="Status"
                        onClick={handleHeaderClick}
                        sortField={sortField}
                        sortDirection={sortDirection}
                      />
                      <SortableHeader
                        field="agentName"
                        label="Call Attend By"
                        onClick={handleHeaderClick}
                        sortField={sortField}
                        sortDirection={sortDirection}
                      />
                      <TableCell className={classes.tableHeader}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortData()
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((call, index) => (
                        <TableRow
                          key={index}
                          className={
                            call.status === "completed"
                              ? classes.completedRow
                              : call.status === "failed"
                                ? classes.failedRow
                                : call.status === "no-answer"
                                  ? classes.noAnswerRow
                                  : ""
                          }
                        >
                          {call.to !== "" && (
                            <>
                              <TableCell>
                                {call.direction === "inbound" ? (
                                  <CallReceived style={{ color: "red" }} />
                                ) : (
                                  <CallMade style={{ color: "green" }} />
                                )}
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {call.phone_number_sid || call.parent_call_sid}
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {call.direction === "inbound" ? call.from : call.to}
                              </TableCell>
                              <TableCell className={classes.tableCell}>{call.start_time}</TableCell>
                              <TableCell className={classes.tableCell}>{call.duration}</TableCell>
                              <TableCell className={classes.tableCell}>{call.status}</TableCell>
                              <TableCell className={classes.tableCell}>Agent Name</TableCell>
                              {call.status === "no-answer" ? (
                                <TableCell className={classes.tableCell}>
                                  NAN
                                </TableCell>
                              ) : (
                                <TableCell className={classes.tableCell}>
                                  <Button
                                    variant="outlined"
                                    color="primary"
                                    style={{ textTransform: "capitalize" }}
                                  >
                                    View Summary
                                  </Button>
                                </TableCell>
                              )}
                            </>
                          )}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer> */
            )}
          </Grid>
          {/* <Grid item xs={3}>
            {selectedCallSummary && (
              <Paper style={{ padding: "8px", marginBottom: "16px" }}>
                <Typography variant="h6">Call Summary</Typography>
                <Typography>Call Date: {selectedCallSummary.start_time}</Typography>
                <Typography>Status: {selectedCallSummary.status}</Typography>
                <Box>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={closeCallSummary}
                  >
                    Close
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid> */}
          <CSVLink data={filteredCalls} filename={"call_log.csv"} className={classes.pagination} style={{textDecoration:"none",display:"flex", justifyContent:"end", padding:"0 10px", alignContent:"Center", alignItems:"center", color:"black",}}>
          {/* <Typography>Call Details:</Typography> */}
          <Button
  // variant="outlined"
  color="primary"
  style={{
    textTransform: "capitalize",
    borderRadius: "8px",
    padding: "3px 10px",
    // border: "2px solid blue",
    // marginRight: "20px",
    fontFamily: "Arial, sans-serif",
    fontSize: "10px",
    fontWeight: "bold",
    letterSpacing: "0.5px",
    background: "#167BF5",
    color:"white",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.3s, color 0.3s",
  }}
>
<CloudDownloadRounded style={{marginRight:"4px", fontSize:"14px"}}/> 
   Export
</Button>
            </CSVLink>
        </Grid>

    </>
  );
}

function SortableHeader({ field, label, onClick, sortField, sortDirection }) {

  const classes = useStyles();
  return (
    <TableCell
      className={`${classes.tableHeader} ${classes.sortableHeader}`}
      onClick={() => onClick(field)}
    >
      {label}
      <div className={`sort-icon ${classes.sortIcon}`}>
        {field === sortField ? (
          sortDirection === "asc" ? (
            <ArrowUpwardIcon />
          ) : (
            <ArrowDownwardIcon />
          )
        ) : null}
      </div>
    </TableCell>
  );
}

export default CallLog;