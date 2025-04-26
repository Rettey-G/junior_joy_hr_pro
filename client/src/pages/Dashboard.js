import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
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
  CircularProgress,
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
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
    labels: ['Office', 'Express 1', 'Express 3'],
    datasets: [{
      data: [15, 10, 5],
      backgroundColor: ['#4caf50', '#ff9800', '#2196f3'],
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

  // Get current user data
  useEffect(() => {
    const fetchCurrentUser = () => {
      // Get user data from localStorage
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setCurrentUser(parsedUser);
        } catch (err) {
          console.error('Error parsing user data:', err);
          // If no valid user data, use fallback
          setCurrentUser({
            name: 'Junior Joy HR Admin',
            role: localStorage.getItem('userRole') || 'admin',
            lastLogin: new Date().toLocaleDateString(),
            avatar: '/juniorjoyhr.jpg'
          });
        }
      } else {
        // Set default user if none found
        setCurrentUser({
          name: 'Junior Joy HR Admin',
          role: localStorage.getItem('userRole') || 'admin',
          lastLogin: new Date().toLocaleDateString(),
          avatar: '/juniorjoyhr.jpg'
        });
      }
    };
    
    fetchCurrentUser();
  }, []);

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
        // Create demo data based on our DB schema
        const demoEmployees = [
          { 
            empNo: 'EMP001', 
            name: 'John Doe', 
            idNumber: 'A1234567',
            gender: 'Male',
            nationality: 'American',
            department: 'Engineering',
            designation: 'Senior Developer',
            workSite: 'Headquarters',
            joinedDate: '2020-01-15',
            salaryUSD: 95000,
            salaryMVR: 1463000,
            active: true
          },
          { 
            empNo: 'EMP002', 
            name: 'Alice Smith', 
            idNumber: 'B2345678',
            gender: 'Female',
            nationality: 'Canadian',
            department: 'Marketing',
            designation: 'Marketing Manager',
            workSite: 'Branch Office',
            joinedDate: '2019-03-10',
            salaryUSD: 85000,
            salaryMVR: 1308900,
            active: true
          },
          { 
            empNo: 'EMP003', 
            name: 'Michael Johnson', 
            idNumber: 'C3456789',
            gender: 'Male',
            nationality: 'British',
            department: 'Finance',
            designation: 'Financial Analyst',
            workSite: 'Headquarters',
            joinedDate: '2021-06-05',
            salaryUSD: 80000,
            salaryMVR: 1232000,
            active: true
          },
          { 
            empNo: 'EMP004', 
            name: 'Emily Wang', 
            idNumber: 'D4567890',
            gender: 'Female',
            nationality: 'Chinese',
            department: 'HR',
            designation: 'HR Manager',
            workSite: 'Headquarters',
            joinedDate: '2018-08-20',
            salaryUSD: 78000,
            salaryMVR: 1201200,
            active: true
          },
          { 
            empNo: 'EMP005', 
            name: 'Ahmed Sinaz', 
            idNumber: 'A132309',
            gender: 'Male',
            nationality: 'Maldivian',
            department: 'Admin',
            designation: 'Managing Director',
            workSite: 'Office',
            joinedDate: '2011-03-21',
            salaryUSD: 120000,
            salaryMVR: 1848000,
            active: true
          }
        ];
        
        // Use the demo data for calculations
        calculateStats(demoEmployees);
        generateDistributionData(demoEmployees);
        generateTurnoverData(demoEmployees);
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
      const joinedDate = emp.joinedDate ? new Date(emp.joinedDate) : null;
      return joinedDate && joinedDate >= thirtyDaysAgo;
    }).length;
    
    // Calculate unique departments
    const uniqueDepartments = new Set();
    employees.forEach(emp => {
      if (emp.department) uniqueDepartments.add(emp.department);
    });
    
    // Calculate average salary
    const salaries = employees.map(emp => Number(emp.salaryUSD) || 0).filter(sal => sal > 0);
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
      const worksite = emp.workSite || emp.worksite || emp.location || 'Main Office';
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
      const worksite = emp.workSite || emp.worksite || emp.location || 'Main Office';
      if (!worksites[worksite]) {
        worksites[worksite] = {
          total: 0,
          turnover: 0
        };
      }
      worksites[worksite].total++;
      
      // Counting employees who have left or are inactive as turnover
      if (emp.active === false || emp.status === 'Inactive' || emp.endDate) {
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
  const generateDemoData = () => {
    setStats({
      totalEmployees: 35,
      newHires: 4,
      averageSalary: 4200,
      departments: 5
    });
    
    setDepartmentData({
      labels: ['Operations', 'Admin', 'Engineering', 'Finance', 'Sales & Marketing'],
      datasets: [{
        data: [15, 7, 8, 5, 3],
        backgroundColor: ['#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0'],
        borderWidth: 1,
      }],
    });
    
    setNationalityData({
      labels: ['Maldivian', 'Bangladeshi', 'Sri Lankan', 'Indian'],
      datasets: [{
        data: [20, 8, 5, 2],
        backgroundColor: ['#4caf50', '#2196f3', '#f44336', '#ff9800'],
        borderWidth: 1,
      }],
    });
    
    setGenderData({
      labels: ['Male', 'Female'],
      datasets: [{
        data: [25, 10],
        backgroundColor: ['#2196f3', '#e91e63'],
        borderWidth: 1,
      }],
    });
    
    setWorksiteData({
      labels: ['Office', 'Express 1', 'Express 3'],
      datasets: [{
        data: [15, 10, 5],
        backgroundColor: ['#4caf50', '#ff9800', '#2196f3'],
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant={isMobile ? "body1" : "h6"} sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: isMobile ? 2 : 4, mb: isMobile ? 2 : 4 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 2, mx: isMobile ? 0 : 2 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ px: isMobile ? 1 : 0 }}>
        HR Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 2 : 4, px: isMobile ? 1 : 0 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Box display="flex" alignItems="center">
                <PeopleOutline fontSize={isMobile ? "medium" : "large"} color="primary" />
                <Box ml={isMobile ? 1 : 2}>
                  <Typography variant={isMobile ? "h5" : "h4"}>{stats.totalEmployees}</Typography>
                  <Typography variant="body2" color="textSecondary" noWrap={isMobile}>Total Employees</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Box display="flex" alignItems="center">
                <TrendingUp fontSize={isMobile ? "medium" : "large"} color="secondary" />
                <Box ml={isMobile ? 1 : 2}>
                  <Typography variant={isMobile ? "h5" : "h4"}>{stats.newHires}</Typography>
                  <Typography variant="body2" color="textSecondary" noWrap={isMobile}>New Hires (30d)</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Box display="flex" alignItems="center">
                <AttachMoney fontSize={isMobile ? "medium" : "large"} style={{ color: '#4caf50' }} />
                <Box ml={isMobile ? 1 : 2}>
                  <Typography variant={isMobile ? "h5" : "h4"}>${(stats.averageSalary/1000).toFixed(0)}k</Typography>
                  <Typography variant="body2" color="textSecondary" noWrap={isMobile}>Avg. Salary</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Box display="flex" alignItems="center">
                <Business fontSize={isMobile ? "medium" : "large"} style={{ color: '#ff9800' }} />
                <Box ml={isMobile ? 1 : 2}>
                  <Typography variant={isMobile ? "h5" : "h4"}>{stats.departments}</Typography>
                  <Typography variant="body2" color="textSecondary" noWrap={isMobile}>Departments</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Distribution Charts */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 2 : 4, px: isMobile ? 1 : 0 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center">
                <Business fontSize="small" sx={{ mr: 1 }} />
                Department Distribution
              </Box>
            </Typography>
            <Box height={isMobile ? 220 : 300} display="flex" alignItems="center" justifyContent="center">
              <Pie 
                data={departmentData} 
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { boxWidth: isMobile ? 10 : 12, font: { size: isMobile ? 10 : 12 } }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center">
                <Public fontSize="small" sx={{ mr: 1 }} />
                Nationality Distribution
              </Box>
            </Typography>
            <Box height={isMobile ? 220 : 300} display="flex" alignItems="center" justifyContent="center">
              <Pie 
                data={nationalityData} 
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { boxWidth: isMobile ? 10 : 12, font: { size: isMobile ? 10 : 12 } }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 2 : 4, px: isMobile ? 1 : 0 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center">
                <Wc fontSize="small" sx={{ mr: 1 }} />
                Gender Distribution
              </Box>
            </Typography>
            <Box height={isMobile ? 220 : 300} display="flex" alignItems="center" justifyContent="center">
              <Pie 
                data={genderData} 
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  cutout: '25%',
                  radius: '90%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      display: true,
                      labels: { 
                        boxWidth: isMobile ? 10 : 15, 
                        padding: 15,
                        font: { size: isMobile ? 10 : 12, weight: 'bold' } 
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((value / total) * 100);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center">
                <TransferWithinAStation fontSize="small" sx={{ mr: 1 }} />
                Worksite Distribution
              </Box>
            </Typography>
            <Box height={isMobile ? 220 : 300} display="flex" alignItems="center" justifyContent="center">  
              <Pie 
                data={worksiteData} 
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  cutout: '25%',
                  radius: '90%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      display: true,
                      labels: { 
                        boxWidth: isMobile ? 10 : 15, 
                        padding: 15,
                        font: { size: isMobile ? 10 : 12, weight: 'bold' } 
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((value / total) * 100);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Turnover Chart */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 2 : 4, px: isMobile ? 1 : 0 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center">
                <TrendingUp fontSize="small" sx={{ mr: 1 }} />
                Turnover Rate by Worksite
              </Box>
            </Typography>
            <Box height={isMobile ? 240 : 300} display="flex" alignItems="center" justifyContent="center">
              <Bar 
                data={turnoverData} 
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: !isMobile,
                        text: 'Rate (%)'
                      },
                      ticks: {
                        font: { size: isMobile ? 10 : 12 }
                      }
                    },
                    x: {
                      ticks: {
                        font: { size: isMobile ? 10 : 12 }
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: !isMobile,
                      position: 'top'
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Activity and Events */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 2 : 4, px: isMobile ? 1 : 0 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ height: '100%' }}>
            <CardHeader 
              title="Recent Activities" 
              titleTypographyProps={{ variant: isMobile ? 'subtitle1' : 'h6' }} 
              sx={{ p: isMobile ? 1.5 : 2 }}
            />
            <Divider />
            <List dense={isMobile}>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemIcon>
                    <Notifications color="primary" fontSize={isMobile ? "small" : "medium"} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={activity.text} 
                    secondary={activity.date} 
                    primaryTypographyProps={{ 
                      variant: isMobile ? 'body2' : 'body1',
                      noWrap: isMobile
                    }}
                    secondaryTypographyProps={{ 
                      variant: isMobile ? 'caption' : 'body2' 
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ height: '100%' }}>
            <CardHeader 
              title="Upcoming Events" 
              titleTypographyProps={{ variant: isMobile ? 'subtitle1' : 'h6' }} 
              sx={{ p: isMobile ? 1.5 : 2 }}
            />
            <Divider />
            <List dense={isMobile}>
              {upcomingEvents.map((event) => (
                <ListItem key={event.id}>
                  <ListItemIcon>
                    <Event color="secondary" fontSize={isMobile ? "small" : "medium"} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={event.text} 
                    secondary={event.date} 
                    primaryTypographyProps={{ 
                      variant: isMobile ? 'body2' : 'body1',
                      noWrap: isMobile
                    }}
                    secondaryTypographyProps={{ 
                      variant: isMobile ? 'caption' : 'body2' 
                    }}
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
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="info" onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      </Snackbar>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard data...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : (
        <>
          {/* New Analytics Dashboard */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Dashboard
            </Typography>
          </Box>
          
          {/* User Welcome Section */}
          <Paper 
            elevation={3} 
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              background: 'linear-gradient(to right, #3a7bd5, #00d2ff)',
              color: 'white',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box 
                component="img"
                src={currentUser?.avatar || '/juniorjoyhr.jpg'}
                alt="User Avatar"
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  border: '3px solid white',
                  objectFit: 'cover',
                  backgroundColor: 'white'
                }}
              />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Welcome back, {currentUser?.name.split(' ')[0] || 'User'}
                </Typography>
                <Typography variant="body1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                  Role: {currentUser?.role || 'Admin'} | Last login: {currentUser?.lastLogin || 'Today'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
              <Paper sx={{ px: 2, py: 1, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <Notifications />
                <Typography variant="body2">3 New Notifications</Typography>
              </Paper>
              <Paper sx={{ px: 2, py: 1, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <Event />
                <Typography variant="body2">2 Upcoming Events</Typography>
              </Paper>
            </Box>
          </Paper>
          
          {/* Analytics Dashboard */}
          <AnalyticsDashboard />

          {/* Stats Cards */}
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50', mt: 4 }}>
            Dashboard Overview
          </Typography>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
