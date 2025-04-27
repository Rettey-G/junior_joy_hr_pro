import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const LeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: null,
    endDate: null,
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
    fetchLeaveBalances();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      showSnackbar('Error fetching leave requests', 'error');
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leaves/balances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveBalances(response.data);
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      showSnackbar('Error fetching leave balances', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/leaves', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenDialog(false);
      showSnackbar('Leave request submitted successfully', 'success');
      fetchLeaves();
      fetchLeaveBalances();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      showSnackbar(error.response?.data?.message || 'Error submitting leave request', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      cancelled: 'default',
      forfeited: 'secondary'
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Leave Management</Typography>
            <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
              Request Leave
            </Button>
          </Box>

          {/* Leave Balances */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {leaveBalances.map((balance) => (
              <Grid item xs={12} sm={6} md={4} key={balance._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {balance.leaveType.name}
                    </Typography>
                    <Typography variant="body1">
                      Total Days: {balance.totalDays}
                    </Typography>
                    <Typography variant="body1">
                      Used Days: {balance.usedDays}
                    </Typography>
                    <Typography variant="body1" color="primary">
                      Remaining Days: {balance.remainingDays}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Forfeited Days</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell>{leave.leaveType.name}</TableCell>
                    <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{leave.days}</TableCell>
                    <TableCell>
                      {leave.forfeitedDays > 0 && (
                        <Typography color="error">
                          {leave.forfeitedDays}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{leave.reason}</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status} 
                        color={getStatusColor(leave.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Leave</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Leave Type"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              margin="normal"
              required
            >
              {leaveBalances.map((balance) => (
                <MenuItem 
                  key={balance.leaveType._id} 
                  value={balance.leaveType._id}
                  disabled={balance.remainingDays === 0}
                >
                  {balance.leaveType.name} ({balance.remainingDays} days remaining)
                </MenuItem>
              ))}
            </TextField>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
              />
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => setFormData({ ...formData, endDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LeavePage; 