import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
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
  Alert
} from '@mui/material';
import { 
  PeopleOutline, 
  AttachMoney, 
  TrendingUp, 
  Notifications,
  CheckCircle,
  Event
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Initialize socket connection
const socket = io(process.env.REACT_APP_SOCKET_URL);

const Dashboard = () => {
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 42,
    newHires: 5,
    departments: 6,
    averageSalary: 65000
  });

  // Department distribution data for pie chart
  const departmentData = {
    labels: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'],
    datasets: [
      {
        data: [12, 8, 10, 4, 5, 3],
        backgroundColor: [
          '#2196f3',
          '#f44336',
          '#4caf50',
          '#ff9800',
          '#9c27b0',
          '#607d8b'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Monthly hiring data for bar chart
  const hiringData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Hires',
        data: [2, 3, 1, 5, 2, 4],
        backgroundColor: '#2196f3',
      },
    ],
  };

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

  useEffect(() => {
    // Listen for real-time notifications
    socket.on('hrNotification', (data) => {
      setNotification(data.message);
    });

    // Clean up on unmount
    return () => {
      socket.off('hrNotification');
    };
  }, []);

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
                  <Typography variant="body2" color="textSecondary">New Hires</Typography>
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
                <Notifications fontSize="large" style={{ color: '#ff9800' }} />
                <Box ml={2}>
                  <Typography variant="h4">{stats.departments}</Typography>
                  <Typography variant="body2" color="textSecondary">Departments</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Department Distribution</Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Pie data={departmentData} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Monthly Hiring</Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Bar 
                data={hiringData} 
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 }
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
