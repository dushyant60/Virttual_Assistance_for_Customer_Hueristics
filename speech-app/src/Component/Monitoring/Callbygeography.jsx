import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Table, TableContainer, TableBody, TableRow, TableCell, Container, Typography, Button, Grid, Box, ButtonGroup } from "@material-ui/core";
import TableChartIcon from '@material-ui/icons/TableChart';
import { InsertChart, RoomOutlined } from "@material-ui/icons";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, TablePagination } from 'recharts';
import { useTranslation } from 'react-i18next';
import { api } from "../../config";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart, Bar, ResponsiveContainer,
} from "recharts";



const Callbygeography = () => {
    const [logs, setLogs] = useState([]);
    const [showTabular, setShowTabular] = useState(true);
    const [showGraphical, setShowGraphical] = useState(false);
    const [showhide, setShowhide] = useState('Tabular Representation');
    const [chartDataPie, setChartDataPie] = useState([]);
    const [theme, setselectedTheme] = useState(localStorage.getItem('selectedTheme') || 'light');
    const [color, setcolor] = useState();
    const [background, setbackground] = useState();
    const { t } = useTranslation();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);






    const handleTabularClick = () => {
        setShowTabular(true);
        setShowGraphical(false);
    };

    const handleGraphicalClick = () => {
        setShowTabular(false);
        setShowGraphical(true);
    };

    const [chartDataLine, setChartDataLine] = useState([]);
    const [chartDataBar, setChartDataBar] = useState([]);
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#F9BF3B", "#0088AA"];
    const costPerToken = 0.05;

    useEffect(() => {
        // Update chartDataLine and chartDataBar whenever logs change
        const chartDataLine = logs.map(log => ({
            date: log.data.created.toLocaleDateString(),
            totalTokens: log.usage.total_tokens,
            cost: log.usage.total_tokens * costPerToken, // Calculate the cost by multiplying totalTokens with costPerToken
        }));
        setChartDataLine(chartDataLine);

        setChartDataLine(chartDataLine);

        const chartDataBar = logs.map(log => ({
            model: log.data.model, // Modify this to use the appropriate property for your BarChart
            totalTokens: log.usage.total_tokens,
        }));

        setChartDataBar(chartDataBar);

        const totalTokensSum = chartDataBar.reduce((sum, data) => sum + data.totalTokens, 0);
        const chartDataPie = chartDataBar.map((data, index) => ({
            name: data.model,
            value: (data.totalTokens / totalTokensSum) * 100,
            fill: COLORS[index % COLORS.length], // Assign a color to each segment
        }));
        setChartDataPie(chartDataPie);
    }, [logs]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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
        <>
            {/* <Container component="main" maxWidth="lg" style={{ display: "flex", flexDirection: "column", marginTop: "10px", justifyContent: "center", alignItems: "center" }}> */}
                <Grid container>
                {/* <Box style={{ display: 'flex', width: "100%", margin: "12px" }}>
                        <Box>
                            <ButtonGroup aria-label="show-hide">
                                <Button
                                    variant={showhide === 'Tabular Representation' ? 'contained' : 'outlined'}
                                    color="primary"
                                    onClick={() => setShowhide('Tabular Representation')}
                                >
                                      <InsertChart />
                                </Button>
                                <Button
                                    variant={showhide === 'Graphical Representation' ? 'contained' : 'outlined'}
                                    color="primary"
                                    onClick={() => setShowhide('Graphical Representation')}
                                >
                                  
                                    <RoomOutlined/>
                                </Button>
                            </ButtonGroup>
                        </Box>
                    </Box> */}
                    <Grid item xs={12}>
                        {showhide === 'Tabular Representation' && (
                          <Box
                          style={{
                            // border: "2px solid blue",
                            height: "47.5vh",
                            width: "100%",
                            background: "white",
                            borderRadius: "10px",
                            boxShadow: "rgb(190 186 186) 1px 1px 9px",
                            padding: "3% 4% 0% 0%"
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart width={680} height={278} data={followUpCallsData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <Legend />
                              <YAxis />
                              <Tooltip />
                              <Bar
                                dataKey="followUpCalls"
                                name="Follow-Up Calls"
                                fill="url(#colorGradient)"
                              />
                              <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#3f51b5" stopOpacity={0.2} />
                                </linearGradient>
                              </defs>
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                        )}
                        {showhide === 'Graphical Representation' && (
                            <Box
                                style={{
                                    // border: "2px solid blue",
                                    height: "47.5vh",
                                    width: "100%",
                                    background: "white",
                                    borderRadius: "10px",
                                    boxShadow: "rgb(190 186 186) 1px 1px 9px"
                                }}
                            >
                            </Box>
                        )}
                    </Grid>
                </Grid>
            {/* </Container> */}

        </>
    );
};

export default Callbygeography;