import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { format } from 'date-fns';

const LeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: null,
    endDate: null,
    reason: '',
  });
  const [filters, setFilters] = useState({
    status: '',
    leaveType: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, [filters]);

  const fetchLeaves = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.leaveType) queryParams.append('leaveType', filters.leaveType);
      
      const response = await axios.get(`/api/leaves?${queryParams.toString()}`);
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/leaves', {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        days: Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1,
      });
      setLeaves([response.data, ...leaves]);
      setFormData({
        leaveType: '',
        startDate: null,
        endDate: null,
        reason: '',
      });
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      const response = await axios.put(`/api/leaves/${leaveId}`, {
        status: newStatus,
      });
      setLeaves(leaves.map(leave => 
        leave._id === leaveId ? response.data : leave
      ));
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Leave Management
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={filters.leaveType}
                label="Leave Type"
                onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="annual">Annual</MenuItem>
                <MenuItem value="sick">Sick</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
                <MenuItem value="family">Family</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Leave Request Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Submit Leave Request
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={formData.leaveType}
                  label="Leave Type"
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  required
                >
                  <MenuItem value="annual">Annual</MenuItem>
                  <MenuItem value="sick">Sick</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                  <MenuItem value="family">Family</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>

              <TextField
                label="Reason"
                multiline
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />

              <Button type="submit" variant="contained" color="primary">
                Submit Request
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave._id}>
                <TableCell>{leave.leaveType}</TableCell>
                <TableCell>{format(new Date(leave.startDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{leave.days}</TableCell>
                <TableCell>
                  <Typography
                    color={
                      leave.status === 'approved'
                        ? 'success.main'
                        : leave.status === 'rejected'
                        ? 'error.main'
                        : 'warning.main'
                    }
                  >
                    {leave.status}
                  </Typography>
                </TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>
                  {leave.status === 'pending' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedLeave(leave);
                        setOpenDialog(true);
                      }}
                    >
                      Update Status
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Update Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Leave Status</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Update status for {selectedLeave?.leaveType} leave request
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            color="success"
            onClick={() => handleStatusChange(selectedLeave?._id, 'approved')}
          >
            Approve
          </Button>
          <Button
            color="error"
            onClick={() => handleStatusChange(selectedLeave?._id, 'rejected')}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeavePage; 