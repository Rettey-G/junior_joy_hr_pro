import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  PeopleOutline, 
  AttachMoney, 
  TrendingUp, 
  Notifications,
  CheckCircle,
  Event,
  Business,
  Public,
  Wc,
  TransferWithinAStation
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

// Initialize socket connection
const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newHires: 0,
    departments: 0,
    averageSalary: 0
  });

  // Distribution data states
  const [departmentData, setDepartmentData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderWidth: 1,
    }],
  });

  const [nationalityData, setNationalityData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderWidth: 1,
    }],
  });

  const [genderData, setGenderData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderWidth: 1,
    }],
  });

  const [worksiteData, setWorksiteData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderWidth: 1,
    }],
  });

  // Turnover data
  const [turnoverData, setTurnoverData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Turnover Rate',
        data: [],
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        tension: 0.4,
      },
    ],
  });

  // Recent activities
  const recentActivities = [
    { id: 1, text: 'New employee onboarded', date: '2 hours ago' },
    { id: 2, text: 'Payroll processed', date: '1 day ago' },
    { id: 3, text: 'Performance review scheduled', date: '2 days ago' },
    { id: 4, text: 'Training completed', date: '3 days ago' },
  ];

  // Upcoming events
  const upcomingEvents = [
    { id: 1, text: 'Team Building', date: 'Tomorrow' },
    { id: 2, text: 'Quarterly Review', date: 'Next Week' },
    { id: 3, text: 'Benefits Enrollment', date: 'May 15' },
  ];

  // Fetch employee data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const employees = response.data;
        
        // Calculate stats
        calculateStats(employees);
        
        // Generate distribution data
        generateDistributionData(employees);
        
        // Generate turnover data
        generateTurnoverData(employees);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to fetch employee data. Using demo data instead.');
        
        // Use demo data if API fails
        useDemoData();
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
    
    // Listen for real-time notifications
    socket.on('hrNotification', (data) => {
      setNotification(data.message);
      // Refresh data when notification is received
      fetchEmployeeData();
    });

    // Clean up on unmount
    return () => {
      socket.off('hrNotification');
    };
  }, [apiUrl]);
  
  // Calculate statistics from employee data
  const calculateStats = (employees) => {
    if (!employees || !employees.length) return;
    
    // Current date for calculating new hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Calculate new hires in last 30 days
    const newHires = employees.filter(emp => {
      const hireDate = emp.hireDate ? new Date(emp.hireDate) : null;
      return hireDate && hireDate >= thirtyDaysAgo;
    }).length;
    
    // Calculate unique departments
    const uniqueDepartments = new Set();
    employees.forEach(emp => {
      if (emp.department) uniqueDepartments.add(emp.department);
    });
    
    // Calculate average salary
    const salaries = employees.map(emp => Number(emp.salary) || 0).filter(sal => sal > 0);
    const avgSalary = salaries.length ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 0;
    
    setStats({
      totalEmployees: employees.length,
      newHires,
      departments: uniqueDepartments.size,
      averageSalary: avgSalary
    });
  };
  
  // Generate distribution data for charts
  const generateDistributionData = (employees) => {
    if (!employees || !employees.length) return;
    
    // Department distribution
    const deptCount = {};
    employees.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });
    
    // Sort departments by count
    const sortedDepts = Object.entries(deptCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8); // Take top 8 departments
    
    setDepartmentData({
      labels: sortedDepts.map(d => d[0]),
      datasets: [{
        data: sortedDepts.map(d => d[1]),
        backgroundColor: [
          '#2196f3', '#f44336', '#4caf50', '#ff9800', 
          '#9c27b0', '#607d8b', '#e91e63', '#ffeb3b'
        ],
        borderWidth: 1,
      }],
    });
    
    // Nationality distribution
    const nationalityCount = {};
    employees.forEach(emp => {
      const nationality = emp.nationality || 'Unspecified';
      nationalityCount[nationality] = (nationalityCount[nationality] || 0) + 1;
    });
    
    const sortedNationalities = Object.entries(nationalityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6); // Take top 6 nationalities
    
    setNationalityData({
      labels: sortedNationalities.map(n => n[0]),
      datasets: [{
        data: sortedNationalities.map(n => n[1]),
        backgroundColor: [
          '#4caf50', '#2196f3', '#f44336', '#ff9800', 
          '#9c27b0', '#607d8b'
        ],
        borderWidth: 1,
      }],
    });
    
    // Gender distribution
    const genderCount = {};
    employees.forEach(emp => {
      const gender = emp.gender || 'Unspecified';
      genderCount[gender] = (genderCount[gender] || 0) + 1;
    });
    
    setGenderData({
      labels: Object.keys(genderCount),
      datasets: [{
        data: Object.values(genderCount),
        backgroundColor: [
          '#2196f3', '#e91e63', '#9c27b0'
        ],
        borderWidth: 1,
      }],
    });
    
    // Worksite distribution
    const worksiteCount = {};
    employees.forEach(emp => {
      const worksite = emp.worksite || emp.location || 'Main Office';
      worksiteCount[worksite] = (worksiteCount[worksite] || 0) + 1;
    });
    
    const sortedWorksites = Object.entries(worksiteCount)
      .sort((a, b) => b[1] - a[1]);
    
    setWorksiteData({
      labels: sortedWorksites.map(w => w[0]),
      datasets: [{
        data: sortedWorksites.map(w => w[1]),
        backgroundColor: [
          '#ff9800', '#4caf50', '#2196f3', '#f44336', 
          '#9c27b0', '#607d8b', '#e91e63', '#ffeb3b'
        ],
        borderWidth: 1,
      }],
    });
  };
  
  // Generate turnover data
  const generateTurnoverData = (employees) => {
    if (!employees || !employees.length) return;
    
    // Group by worksite for turnover analysis
    const worksites = {};
    employees.forEach(emp => {
      const worksite = emp.worksite || emp.location || 'Main Office';
      if (!worksites[worksite]) {
        worksites[worksite] = {
          total: 0,
          turnover: 0
        };
      }
      worksites[worksite].total++;
      
      // Counting employees who have left or are inactive as turnover
      if (emp.status === 'Inactive' || emp.endDate) {
        worksites[worksite].turnover++;
      }
    });
    
    // Calculate turnover rate for each worksite
    const labels = [];
    const data = [];
    
    Object.entries(worksites).forEach(([site, stats]) => {
      if (stats.total > 0) {
        labels.push(site);
        const rate = (stats.turnover / stats.total) * 100;
        data.push(rate.toFixed(1));
      }
    });
    
    setTurnoverData({
      labels,
      datasets: [{
        label: 'Turnover Rate (%)',
        data,
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        tension: 0.4,
      }],
    });
  };
  
  // Use demo data if API fails
  const useDemoData = () => {
    // Set demo stats
    setStats({
      totalEmployees: 42,
      newHires: 5,
      departments: 6,
      averageSalary: 65000
    });
    
    // Set demo department data
    setDepartmentData({
      labels: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'],
      datasets: [{
        data: [12, 8, 10, 4, 5, 3],
        backgroundColor: [
          '#2196f3', '#f44336', '#4caf50', '#ff9800', 
          '#9c27b0', '#607d8b'
        ],
        borderWidth: 1,
      }],
    });
    
    // Set demo nationality data
    setNationalityData({
      labels: ['Thai', 'American', 'Chinese', 'Indian', 'Japanese', 'Other'],
      datasets: [{
        data: [18, 8, 6, 4, 3, 3],
        backgroundColor: [
          '#4caf50', '#2196f3', '#f44336', '#ff9800', 
          '#9c27b0', '#607d8b'
        ],
        borderWidth: 1,
      }],
    });
    
    // Set demo gender data
    setGenderData({
      labels: ['Male', 'Female', 'Non-binary'],
      datasets: [{
        data: [24, 16, 2],
        backgroundColor: [
          '#2196f3', '#e91e63', '#9c27b0'
        ],
        borderWidth: 1,
      }],
    });
    
    // Set demo worksite data
    setWorksiteData({
      labels: ['Main Office', 'Branch A', 'Branch B', 'Remote'],
      datasets: [{
        data: [20, 10, 7, 5],
        backgroundColor: [
          '#ff9800', '#4caf50', '#2196f3', '#f44336'
        ],
        borderWidth: 1,
      }],
    });
    
    // Set demo turnover data
    setTurnoverData({
      labels: ['Main Office', 'Branch A', 'Branch B', 'Remote'],
      datasets: [{
        label: 'Turnover Rate (%)',
        data: [5.2, 8.7, 4.3, 2.1],
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        tension: 0.4,
      }],
    });
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Display loading state
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom>
        HR Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleOutline fontSize="large" color="primary" />
                <Box ml={2}>
                  <Typography variant="h4">{stats.totalEmployees}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Employees</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp fontSize="large" color="secondary" />
                <Box ml={2}>
                  <Typography variant="h4">{stats.newHires}</Typography>
                  <Typography variant="body2" color="textSecondary">New Hires (30d)</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney fontSize="large" style={{ color: '#4caf50' }} />
                <Box ml={2}>
                  <Typography variant="h4">${(stats.averageSalary/1000).toFixed(0)}k</Typography>
                  <Typography variant="body2" color="textSecondary">Avg. Salary</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Business fontSize="large" style={{ color: '#ff9800' }} />
                <Box ml={2}>
                  <Typography variant="h4">{stats.departments}</Typography>
                  <Typography variant="body2" color="textSecondary">Departments</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Distribution Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center">
                <Business fontSize="small" sx={{ mr: 1 }} />
                Department Distribution
              </Box>
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Pie data={departmentData} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center">
                <Public fontSize="small" sx={{ mr: 1 }} />
                Nationality Distribution
              </Box>
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Pie data={nationalityData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center">
                <Wc fontSize="small" sx={{ mr: 1 }} />
                Gender Distribution
              </Box>
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Pie data={genderData} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center">
                <TransferWithinAStation fontSize="small" sx={{ mr: 1 }} />
                Worksite Distribution
              </Box>
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Pie data={worksiteData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Turnover Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Turnover by Worksite (%)</Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Line 
                data={turnoverData} 
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Turnover Rate (%)'
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Activity and Events */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <CardHeader title="Recent Activities" />
            <Divider />
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={activity.text} 
                    secondary={activity.date} 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <CardHeader title="Upcoming Events" />
            <Divider />
            <List>
              {upcomingEvents.map((event) => (
                <ListItem key={event.id}>
                  <ListItemIcon>
                    <Event color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={event.text} 
                    secondary={event.date} 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Notification */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity="info">
          {notification}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
