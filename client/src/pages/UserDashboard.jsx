import React, { useEffect, useState } from 'react';
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
  Button,
  Avatar,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { 
  Event,
  Notifications,
  CheckCircle,
  AccessTime,
  AttachMoney,
  People,
  CalendarToday,
  Work,
  AccountBalance,
  Description
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UserDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        // Fetch user data
        const userResponse = await axios.get(`${apiUrl}/api/employees/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userResponse.data);

        // Fetch leave requests
        const leaveResponse = await axios.get(`${apiUrl}/api/leaves?employeeId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLeaveRequests(leaveResponse.data);

        // Fetch notifications (you'll need to implement this endpoint)
        const notificationsResponse = await axios.get(`${apiUrl}/api/notifications/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(notificationsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar 
                src={userData?.image} 
                sx={{ width: 64, height: 64, mr: 2 }}
              >
                {userData?.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1">
                  Welcome, {userData?.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {userData?.designation} - {userData?.department}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {userData?.leaveBalance || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Leave Days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">
                      {userData?.salaryUSD?.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Salary
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Leave Requests */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Leave Requests"
              action={
                <Button 
                  variant="outlined" 
                  size="small"
                  href="/leave"
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {leaveRequests.slice(0, 3).map((request) => (
                  <ListItem key={request._id}>
                    <ListItemIcon>
                      <Event color={request.status === 'approved' ? 'success' : 
                                  request.status === 'rejected' ? 'error' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${request.leaveType} Leave`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}
                          </Typography>
                          <Typography component="span" variant="body2" color="text.secondary">
                            {' • '}{request.status}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
                {leaveRequests.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No leave requests found" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Notifications"
              action={
                <Button 
                  variant="outlined" 
                  size="small"
                >
                  Mark All Read
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {notifications.slice(0, 3).map((notification) => (
                  <ListItem key={notification._id}>
                    <ListItemIcon>
                      <Notifications color={notification.read ? 'disabled' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={notification.message}
                    />
                  </ListItem>
                ))}
                {notifications.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No new notifications" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Quick Actions" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CalendarToday />}
                    href="/leave"
                  >
                    Request Leave
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AccessTime />}
                    href="/time-attendance"
                  >
                    Time Sheet
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AttachMoney />}
                    href="/payroll"
                  >
                    Payroll
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Description />}
                    href="/documents"
                  >
                    Documents
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDashboard; 