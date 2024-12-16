import React, { useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Paper,
  Avatar,
  Select,
  MenuItem,
  Button,
  FormControl,
  makeStyles,
} from "@material-ui/core";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Call, Filter, Message } from "@material-ui/icons";
import CallAnalysisCards from "./CallAnalysisCards";
import TableofDashboard from "./TableofDashboard";
import MonitoringTable from "../Monitoring/MonitoringTable";
import CallLog from "../Monitoring/CallLogs";
import Callbygeography from "../Monitoring/Callbygeography";
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    marginLeft: "5px",
    borderRadius: "12px",
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "none",
      borderWidth: "1px",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "none",
    },
  },

  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));
const Dashboard = () => {
  const classes = useStyles();
  const geoData = [
    { id: 1, lat: 51.505, lon: -0.09, calls: 25, city: "London" },
    { id: 2, lat: 48.8566, lon: 2.3522, calls: 20, city: "Paris" },
    // Add more geographical data as needed
  ];
  // Sample data for the line chart
  const [selectedCallType, setSelectedCallType] = useState("totalCalls");
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [selectedAgent, setSelectedAgent] = useState("Agent1");
  const [filteredGeoData, setFilteredGeoData] = useState(geoData);
  const [selectedLocation, setSelectedLocation] = useState("All Location");

  const [showMonthsGraph, setShowMonthsGraph] = useState(true);

  const handleToggleGraph = () => {
    setShowMonthsGraph(!showMonthsGraph);
  };
  // Performance data for agents
  const agentPerformanceData = {
    Agent1: {
      droppedCalls: 20,
      avgResponseTime: 0.5,
      avgCallResponse: "10%",
    },
    Agent2: {
      droppedCalls: 10,
      avgResponseTime: 0.4,
      avgCallResponse: "15%",
    },
    // Add performance data for more agents
  };

  const callData = {
    week: {
      totalCalls: 100,
      waitingCalls: 50,
      droppedCalls: 20,
    },
    month: {
      totalCalls: 500,
      waitingCalls: 250,
      droppedCalls: 100,
    },
    year: {
      totalCalls: 1200,
      waitingCalls: 600,
      droppedCalls: 300,
    },
  };

  const handleChangeCallType = (event) => {
    setSelectedCallType(event.target.value);
  };

  const handleChangeTimeframe = (event) => {
    setSelectedTimeframe(event.target.value);
  };
  const handleChangeAgent = (event) => {
    setSelectedAgent(event.target.value);
  };
  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };
  const selectedCallData = callData[selectedTimeframe];
  const selectedAgentData = agentPerformanceData[selectedAgent];

  // Function to filter data based on location
  const filterDataByLocation = () => {
    if (selectedLocation === "") {
      // No location selected, show all data
      setFilteredGeoData(geoData);
    } else {
      // Filter data based on the selected location
      const filteredData = geoData.filter(
        (item) => item.city === selectedLocation
      );
      setFilteredGeoData(filteredData);
    }
  };

  const data = [
    { name: "Mon", totalCalls: 30, waitingCalls: 15, droppedCalls: 5 },
    { name: "Tue", totalCalls: 45, waitingCalls: 25, droppedCalls: 10 },
    { name: "Wed", totalCalls: 60, waitingCalls: 35, droppedCalls: 20 },
    { name: "Thu", totalCalls: 75, waitingCalls: 40, droppedCalls: 15 },
    { name: "Fri", totalCalls: 50, waitingCalls: 30, droppedCalls: 10 },
    { name: "Sat", totalCalls: 65, waitingCalls: 50, droppedCalls: 25 },
    { name: "Sun", totalCalls: 80, waitingCalls: 60, droppedCalls: 30 },
  ];

  const dataMonths = [
    { month: "Jan", totalCalls: 300, waitingCalls: 150, droppedCalls: 50 },
    { month: "Feb", totalCalls: 450, waitingCalls: 250, droppedCalls: 100 },
    { month: "Mar", totalCalls: 600, waitingCalls: 350, droppedCalls: 200 },
    // Add data for more months
  ];

  const followUpCallsData = [
    { name: "Mon", followUpCalls: 10 },
    { name: "Tue", followUpCalls: 15 },
    { name: "Wed", followUpCalls: 8 },
    { name: "Thu", followUpCalls: 20 },
    { name: "Fri", followUpCalls: 12 },
    { name: "Sat", followUpCalls: 18 },
    { name: "Sun", followUpCalls: 25 },
  ];

  return (
    <Box style={{ margin: "12px" }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box
                style={{
                  display: "flex",
                  height:"6.2vh",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "5px 8px",
                  // border: "1px solid #ccc",
                  borderRadius: "10px",
                  boxShadow:
                    "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                  backgroundColor: "white",
                  // alignContent:"center"
                }}
              >
                <Typography variant="h7">Call Monitoring:</Typography>

                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FormControl
                    variant="outlined"
                    className={classes.formControl}
                  >
                    <Select
                      value={selectedTimeframe}
                      onChange={handleChangeTimeframe}
                      style={{ height: "28px" }}
                    >
                      <MenuItem onClick={handleToggleGraph} value="month">Month</MenuItem>
                      <MenuItem onClick={handleToggleGraph} value="week">Week</MenuItem>
                      {/* <MenuItem value="year">Year</MenuItem> */}
                    </Select>
                  </FormControl>

                  <FormControl
                    variant="outlined"
                    className={classes.formControl}
                  >
                    <Select
                      value={selectedAgent}
                      onChange={handleChangeAgent}
                      style={{ height: "28px" }}
                    >
                      {Object.keys(agentPerformanceData).map((agentName) => (
                        <MenuItem key={agentName} value={agentName}>
                          {agentName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl
                    variant="outlined"
                    className={classes.formControl}
                  >
                    <Select
                      value={selectedLocation}
                      onChange={handleLocationChange}
                      style={{ height: "28px" }}
                    >
                      <MenuItem value="All Locations">All Locations</MenuItem>
                      <MenuItem value="London">London</MenuItem>
                      <MenuItem value="Paris">Paris</MenuItem>
                      {/* Add more location options */}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <CallAnalysisCards />
            </Grid>
            
            <Grid item xs={12}>
              
              <Box
                style={{
                  height: "48vh",
                  width: "100%",
                  background: "white",
                  borderRadius: "9px",
                  // marginTop:"-25px",
                  boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
                //   background: "white",
                }}
              >
                {/* <CallLog /> */}
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
        <Grid container spacing={2}>
     
  <Grid item xs={12}>
   
    <Box
      style={{
        height: "34.5vh",
        width: "100%",
        background: "white",
        borderRadius: "10px",
        padding:"2%",
        boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)",
        transition: "all 0.3s ease",
        overflow: "hidden",
        position: "relative",
      }}
    >
     
     <div
  style={{
    opacity: showMonthsGraph ? 0 : 1,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    transition: "opacity 0.3s ease",
    padding: "3% 4% 0% 0%"
  }}
>
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart
      width={340}
      height={170}
      data={dataMonths}
      margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Area type="monotone" dataKey="totalCalls" stackId="1" stroke="#8884d8" fill="#8884d8" />
      <Area type="monotone" dataKey="waitingCalls" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
      <Area type="monotone" dataKey="droppedCalls" stackId="1" stroke="#ffc658" fill="#ffc658" />
    </AreaChart>
  </ResponsiveContainer>
</div>


<div
  style={{
    opacity: showMonthsGraph ? 1 : 0,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    transition: "opacity 0.3s ease",
    padding: "3% 4% 0% 0%"
  }}
>
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart width={340} height={170} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Area
        type="monotone"
        dataKey="totalCalls"
        name="Total Calls"
        stroke="#8884d8" fill="#8884d8" 
      />
      <Area
        type="monotone"
        dataKey="waitingCalls"
        name="Waiting Calls"
        stroke="#82ca9d" fill="#82ca9d"
      />
      <Area
        type="monotone"
        dataKey="droppedCalls"
        name="Dropped Calls"
        stroke="#ffc658" fill="#ffc658"
      />
    </AreaChart>
  </ResponsiveContainer>
</div>

      
    </Box>
   
    {/* <button onClick={handleToggleGraph}>Toggle Graph</button> */}
  </Grid>
  
  {/* <Typography style={{ marginBottom: "11px", fontSize: "18px", fontWeight: "bold", fontFamily: "Arial, sans-serif", color: "#333" }}>
    {showMonthsGraph ? "Call by Months" : "Call by Weekday"}
  </Typography> */}

  
    

            {/* <Grid item xs={12}>
              <Typography>Agent Activity</Typography>
            </Grid> */}
            <Grid item xs={12}>
              <Callbygeography />
              {/* <Box
                                style={{
                                    // border: "2px solid blue",
                                    height: "24vh",
                                    width: "100%",
                                    background: "rgb(214, 232, 238)",
                                    borderRadius: "5px",
                                    boxShadow: "rgb(190 186 186) 1px 1px 9px"
                                }}
                            >
                                <BarChart width={700} height={178} data={followUpCallsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <Legend />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="followUpCalls" name="Follow-Up Calls" fill="darkblue" />
                                </BarChart>

                            </Box> */}
            </Grid>
            {/* <Grid item xs={12}>
                            <Typography>Caller List</Typography>
                        </Grid>
                        <Grid item xs={12}>
                             <TableofDashboard/> */}
            {/* <Box
                                style={{
                                    height: "51vh",
                                    width: "100%",
                                    background: "white",
                                    overflowY: "scroll"
                                }}
                            >
                                {callersData.map((caller, index) => (
                                    <Box style={{ display: "flex", height: "11vh", justifyContent: "center", alignItems: "center", margin: "8px", boxShadow: "grey 1px 2px 6px", background: "linear-gradient(65deg,#73cdcd,white)" }} key={index}>
                                        <Avatar style={{ width: "4vw", height: "8vh", marginLeft: "5px" }}></Avatar>
                                        <Box
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                width: "28vw",
                                                marginLeft: "20px",
                                                marginTop: "5px",
                                                marginBottom: "5px"
                                            }}
                                        >
                                            <Box style={{
                                                background:
                                                    caller.status === "Done"
                                                        ? "blue"
                                                        : caller.status === "Waiting"
                                                            ? "red"
                                                            : "grey",
                                                color: "white",
                                                height: "4vh",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                width: "4vw",
                                                borderRadius: "5px"
                                            }}>
                                                <Typography
                                                    variant="body2"

                                                >
                                                    {caller.status}
                                                </Typography>
                                            </Box>
                                            <Typography variant="subtitle1">{caller.name}</Typography>
                                            <Typography variant="body2" component="p" color="textSecondary" style={{ lineHeight: "5px" }}>{caller.address}</Typography>
                                        </Box>
                                        <Box
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                width: "100%",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Typography variant="body2">{caller.date}</Typography>
                                            <Typography variant="body2">{caller.time}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box> */}
            {/* </Grid> */}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;