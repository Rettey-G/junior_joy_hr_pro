import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Card, CardContent, 
  CircularProgress, Alert, Tab, Tabs, Select, MenuItem,
  FormControl, InputLabel
} from '@mui/material';
import { PictureAsPdf, CloudDownload, BarChart, PieChart, ShowChart } from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'HR Reports',
    },
  },
};

const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('department');
  const [timeframe, setTimeframe] = useState('month');

  // Fetch employees data
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Generate random data for sample reports
  const getRandomData = (count, max) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * max));
  };

  // Department distribution data
  const getDepartmentData = () => {
    const departments = {};
    employees.forEach(employee => {
      if (employee.department) {
        departments[employee.department] = (departments[employee.department] || 0) + 1;
      }
    });
    
    return {
      labels: Object.keys(departments),
      datasets: [
        {
          label: 'Employees by Department',
          data: Object.values(departments),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Salary distribution data
  const getSalaryData = () => {
    const salaryRanges = {
      '<1000': 0,
      '1000-2000': 0,
      '2000-3000': 0,
      '3000-4000': 0,
      '4000-5000': 0,
      '>5000': 0
    };
    
    employees.forEach(employee => {
      const salary = employee.salaryUSD || 0;
      if (salary < 1000) salaryRanges['<1000']++;
      else if (salary < 2000) salaryRanges['1000-2000']++;
      else if (salary < 3000) salaryRanges['2000-3000']++;
      else if (salary < 4000) salaryRanges['3000-4000']++;
      else if (salary < 5000) salaryRanges['4000-5000']++;
      else salaryRanges['>5000']++;
    });
    
    return {
      labels: Object.keys(salaryRanges),
      datasets: [
        {
          label: 'Employees by Salary Range (USD)',
          data: Object.values(salaryRanges),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Employment duration data
  const getEmploymentDurationData = () => {
    const durationRanges = {
      '<1 year': 0,
      '1-2 years': 0,
      '2-5 years': 0,
      '5-10 years': 0,
      '>10 years': 0
    };
    
    const today = new Date();
    
    employees.forEach(employee => {
      if (employee.joinedDate) {
        const joinDate = new Date(employee.joinedDate);
        const years = (today - joinDate) / (1000 * 60 * 60 * 24 * 365);
        
        if (years < 1) durationRanges['<1 year']++;
        else if (years < 2) durationRanges['1-2 years']++;
        else if (years < 5) durationRanges['2-5 years']++;
        else if (years < 10) durationRanges['5-10 years']++;
        else durationRanges['>10 years']++;
      }
    });
    
    return {
      labels: Object.keys(durationRanges),
      datasets: [
        {
          label: 'Employees by Employment Duration',
          data: Object.values(durationRanges),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Headcount trend (monthly)
  const getHeadcountTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Random data for demo
    const hires = getRandomData(12, 5);
    const terminations = getRandomData(12, 3);
    const netChange = hires.map((hire, index) => hire - terminations[index]);
    
    // Calculate cumulative headcount starting with current employee count
    const startingHeadcount = employees.length - netChange.reduce((a, b) => a + b, 0);
    let currentHeadcount = startingHeadcount;
    const headcount = [];
    
    for (let i = 0; i < 12; i++) {
      currentHeadcount += netChange[i];
      headcount.push(currentHeadcount);
    }
    
    return {
      labels: months,
      datasets: [
        {
          type: 'line',
          label: 'Headcount',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 2,
          fill: false,
          data: headcount,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Hires',
          backgroundColor: 'rgb(75, 192, 192)',
          data: hires,
          yAxisID: 'y1',
        },
        {
          type: 'bar',
          label: 'Terminations',
          backgroundColor: 'rgb(255, 99, 132)',
          data: terminations,
          yAxisID: 'y1',
        },
      ],
    };
  };

  // Render charts based on tab value
  const renderChart = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (employees.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <Typography>No employee data available for reports</Typography>
        </Box>
      );
    }
    
    switch (tabValue) {
      case 0: // Dashboard
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" gutterBottom>Department Distribution</Typography>
                <Pie data={getDepartmentData()} options={chartOptions} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" gutterBottom>Salary Distribution</Typography>
                <Bar data={getSalaryData()} options={chartOptions} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Headcount Trend</Typography>
                <Bar data={getHeadcountTrendData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Headcount'
                      }
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      grid: {
                        drawOnChartArea: false,
                      },
                      title: {
                        display: true,
                        text: 'Hires/Terminations'
                      }
                    },
                  },
                }} />
              </Paper>
            </Grid>
          </Grid>
        );
      
      case 1: // Headcount
        return (
          <Paper sx={{ p: 2, height: 500 }}>
            <Typography variant="h6" gutterBottom>Headcount Analysis</Typography>
            <Box sx={{ height: '90%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ height: '60%', mb: 2 }}>
                <Typography variant="subtitle2">Headcount Trend</Typography>
                <Line 
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                      label: 'Headcount',
                      data: getHeadcountTrendData().datasets[0].data,
                      borderColor: 'rgb(54, 162, 235)',
                      backgroundColor: 'rgba(54, 162, 235, 0.5)',
                      tension: 0.1
                    }]
                  }} 
                  options={chartOptions} 
                />
              </Box>
              <Box sx={{ height: '40%' }}>
                <Typography variant="subtitle2">Hires vs Terminations</Typography>
                <Bar 
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                      {
                        label: 'Hires',
                        data: getHeadcountTrendData().datasets[1].data,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      },
                      {
                        label: 'Terminations',
                        data: getHeadcountTrendData().datasets[2].data,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              </Box>
            </Box>
          </Paper>
        );
      
      case 2: // Salary
        return (
          <Paper sx={{ p: 2, height: 500 }}>
            <Typography variant="h6" gutterBottom>Salary Analysis</Typography>
            <Bar data={getSalaryData()} options={chartOptions} />
          </Paper>
        );
      
      case 3: // Employment Duration
        return (
          <Paper sx={{ p: 2, height: 500 }}>
            <Typography variant="h6" gutterBottom>Employment Duration Analysis</Typography>
            <Bar data={getEmploymentDurationData()} options={chartOptions} />
          </Paper>
        );
      
      default:
        return null;
    }
  };

  // Calculate summary statistics
  const getTotalSalary = () => {
    return employees.reduce((sum, emp) => sum + (emp.salaryUSD || 0), 0);
  };
  
  const getAverageSalary = () => {
    return employees.length ? getTotalSalary() / employees.length : 0;
  };
  
  const getAverageTenure = () => {
    const today = new Date();
    let totalDays = 0;
    let count = 0;
    
    employees.forEach(employee => {
      if (employee.joinedDate) {
        const joinDate = new Date(employee.joinedDate);
        totalDays += (today - joinDate) / (1000 * 60 * 60 * 24);
        count++;
      }
    });
    
    return count ? (totalDays / count / 365).toFixed(1) : 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>HR Reports & Analytics</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {/* Report Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="department">Department Analysis</MenuItem>
                <MenuItem value="salary">Salary Analysis</MenuItem>
                <MenuItem value="headcount">Headcount Analysis</MenuItem>
                <MenuItem value="tenure">Tenure Analysis</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                label="Timeframe"
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="quarter">Quarterly</MenuItem>
                <MenuItem value="year">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
              >
                Export as PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudDownload />}
              >
                Export as Excel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Employees
              </Typography>
              <Typography variant="h4">
                {employees.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Salary (USD)
              </Typography>
              <Typography variant="h4">
                ${getTotalSalary().toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Avg. Salary (USD)
              </Typography>
              <Typography variant="h4">
                ${getAverageSalary().toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Avg. Tenure (Years)
              </Typography>
              <Typography variant="h4">
                {getAverageTenure()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Report Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
          <Tab icon={<BarChart />} label="Dashboard" />
          <Tab icon={<ShowChart />} label="Headcount" />
          <Tab icon={<PieChart />} label="Salary" />
          <Tab icon={<BarChart />} label="Employment Duration" />
        </Tabs>
      </Box>
      
      {/* Report Content */}
      {renderChart()}
      
      {/* Generated Report Info */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
        <Typography variant="body2">
          Generated on: {format(new Date(), 'yyyy-MM-dd HH:mm')}
        </Typography>
        <Typography variant="body2">
          Data Source: Junior Joy HR Pro
        </Typography>
      </Box>
    </Box>
  );
};

export default Reports;
