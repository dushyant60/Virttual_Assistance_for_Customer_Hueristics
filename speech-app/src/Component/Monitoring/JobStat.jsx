import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Table, TableContainer, TableBody, TableRow, TableCell, Container, Typography, Button, Grid, Box, ButtonGroup } from "@material-ui/core";
import TableChartIcon from '@material-ui/icons/TableChart';
import { InsertChart } from "@material-ui/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { api } from "../../config";

const JobStat = () => {
  const [logs, setLogs] = useState([]);
  const [showTabular, setShowTabular] = useState(true);
  const [showGraphical, setShowGraphical] = useState(false);
  const [showhide, setShowhide] = useState('Tabular Representation');
  const [chartDataPie, setChartDataPie] = useState([]);
  const [theme, setselectedTheme] = useState(localStorage.getItem('selectedTheme') || 'light');
  const [color, setcolor] = useState();
  const [background,setbackground]=useState();
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
    setselectedTheme(localStorage.getItem('selectedTheme') || 'light');
  }, []);

  useEffect(() => {
    // Update the color state based on the theme
    if (theme === 'dark') {
      setcolor('white');
      setbackground('#2b2b2b')
      localStorage.setItem('color', 'white');
    } else {
      setcolor('black');
      setbackground('none')
      localStorage.setItem('color', 'black');
    }
  }, [theme]);


  const fetchData = async () => {
    try {
      const response = await axios.get(`${api}/get-data`);
      const data = response.data;
      const currentDate = new Date();
      const previousDate = new Date();
      previousDate.setDate(currentDate.getDate() - 7); // Set previous date 7 days ago

      const fetchedLogs = data
        .map(item => ({
          usage: {
            prompt_tokens: item.prompttoken,
            completion_tokens: item.completiontoken,
            total_tokens: item.totaltoken,
          },
          data: {
            id: item.prompt_id,
            created: new Date(item.created), // Add the appropriate value if available
            model: item.model,
          },
          status: item.status,
          headers: {
            cacheControl: item.cachecontrol,
            contentType: item.contenttype,
          },
        }))
        .filter(log => {
          // Filter logs based on created date
          if (log.data.created instanceof Date && !isNaN(log.data.created)) {
            return log.data.created >= previousDate && log.data.created <= currentDate;
          }
          return false;
        });


      setLogs(fetchedLogs);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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


  return (
    <>
      <Container component="main" maxWidth="lg" style={{ display: "flex", flexDirection: "column", marginTop: "45px", justifyContent: "center", alignItems: "center" }}>
        <Grid container>
          <Box style={{ display: 'flex', justifyContent: "center", alignItems: "center", width: "100%", margin: "12px" }}>
            <Typography style={{ fontWeight: "bold", marginRight: "12px", width: "100%", textAlign: "center",color }} variant="h6">
              {t('report')}
            </Typography>
            <Box>
              <ButtonGroup aria-label="show-hide">
                <Button
                  variant={showhide === 'Tabular Representation' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setShowhide('Tabular Representation')}
                >
                  <TableChartIcon />
                </Button>
                <Button
                  variant={showhide === 'Graphical Representation' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setShowhide('Graphical Representation')}
                >
                  <InsertChart />
                </Button>
              </ButtonGroup>
            </Box>
          </Box>
          <Grid item xs={12}>
            {showhide === 'Tabular Representation' && (
              <TableContainer style={{ border: "1px solid grey", backgroundColor: background}}>
                <Table>
                  <TableBody>
                    <TableRow >
                      <TableCell style={{color:color }}>
                        <strong>{t('category')}</strong>
                      </TableCell>
                      <TableCell style={{color:color }}>
                        <strong>{t('id')}</strong>
                      </TableCell>
                      <TableCell style={{color:color }}>
                        <strong>{t('created')}</strong>
                      </TableCell>
                      <TableCell style={{color:color }}>
                        <strong>
                          {t('model')}
                        </strong>
                      </TableCell>
                      <TableCell style={{color:color }}>
                        <strong>{t('promt_token')}</strong>
                      </TableCell>
                      <TableCell style={{color:color }}>
                        <strong>{t('completion_token')}</strong>
                      </TableCell>
                      <TableCell style={{color:color }}>
                        <strong>{t('total_token')}</strong>
                      </TableCell>
                      <TableCell style={{color:color }}>
                        <strong>{t('cache')}</strong>
                      </TableCell>
                      <TableCell style={{color:color }}>
                        <strong>{t('content_type')}</strong>
                      </TableCell>
                      <TableCell style={{color:color }}>
                        <strong>{t('status')}</strong>
                      </TableCell>
                    </TableRow>
                    {logs.map(log => (
                      <TableRow key={log.data.id}>
                        <TableCell style={{color:color }}>
                          <strong>Value</strong>
                        </TableCell>
                        <TableCell style={{color:color }}>{log.data.id}</TableCell>
                        <TableCell style={{color:color }}>{log.data.created.toLocaleDateString()}</TableCell>
                        <TableCell style={{color:color }}>{log.data.model}</TableCell>
                        <TableCell style={{color:color }}>{log.usage.prompt_tokens}</TableCell>
                        <TableCell style={{color:color }}>{log.usage.completion_tokens}</TableCell>
                        <TableCell style={{color:color }}>{log.usage.total_tokens}</TableCell>
                        <TableCell style={{color:color }}>{log.headers.cacheControl}</TableCell>
                        <TableCell style={{color:color }}>{log.headers.contentType}</TableCell>
                        <TableCell style={{color:color }}>{log.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {showhide === 'Graphical Representation' && (
              <Container component="main" maxWidth="lg" style={{ marginTop: "45px" }}>
                {/* <Typography variant="h6">Graphical Interface - Line Chart</Typography> */}
                <Grid container >
                <Grid item xs={6}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartDataLine}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis dataKey="cost" yAxisId="left" />
                    <YAxis dataKey="totalTokens" yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cost" name="Cost of Tokens" stroke="#FF8042" yAxisId="left" />
                    <Line type="monotone" dataKey="totalTokens" name="Total Tokens" stroke="#8884d8" yAxisId="right" />
                  </LineChart>
                </ResponsiveContainer>
                </Grid>
                <Grid item xs={6}>
                {/* <Typography variant="h6">Graphical Interface - Bar Chart</Typography> */}
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartDataBar}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalTokens" name="Total Tokens" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
                </Grid>
                <Grid item xs={12}>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={chartDataPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {/* {chartDataPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))} */}
                    </Pie>
                    <Tooltip />
                    {/* <Legend /> */}
                  </PieChart>
                </ResponsiveContainer>
                </Grid>
                </Grid>
              </Container>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default JobStat;
