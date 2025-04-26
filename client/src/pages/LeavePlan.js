import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Card, CardContent, Divider, CircularProgress, Alert,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl,
  InputLabel, Select
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Add, CalendarMonth } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';

// Leave types with entitlements and rules
const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', entitlement: 30, description: 'Annual leave entitlement based on hire date' },
  { value: 'sick', label: 'Sick Leave', entitlement: 30, description: 'Requires medical certificate' },
  { value: 'emergency', label: 'Emergency Leave', entitlement: 5, description: 'For urgent personal matters' },
  { value: 'maternity', label: 'Maternity Leave', entitlement: 60, description: '60 days for women, 30 days for guests' },
  { value: 'paternity', label: 'Paternity Leave', entitlement: 3, description: '3 days for new fathers' },
  { value: 'family', label: 'Family Care', entitlement: 10, description: 'To care for immediate family members' },
  { value: 'unpaid', label: 'Unpaid Leave', entitlement: 0, description: 'Leave without pay' }
];

const leaveStatus = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

const mockLeaves = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    leaveType: 'annual',
    startDate: '2025-05-01',
    endDate: '2025-05-05',
    days: 5,
    reason: 'Vacation',
    status: 'approved',
    department: 'IT'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    leaveType: 'sick',
    startDate: '2025-05-10',
    endDate: '2025-05-12',
    days: 3,
    reason: 'Fever',
    status: 'approved',
    department: 'HR'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: 'Michael Brown',
    leaveType: 'casual',
    startDate: '2025-05-15',
    endDate: '2025-05-15',
    days: 1,
    reason: 'Personal work',
    status: 'pending',
    department: 'Finance'
  }
];

// Public holidays for 2025 in Maldives
const publicHolidays = [
  { date: '2025-01-01', name: 'New Year\'s Day' },
  { date: '2025-03-01', name: 'First Day of Ramazan' },
  { date: '2025-03-31', name: 'Eid-ul-Fithr' },
  { date: '2025-04-01', name: 'Eid-ul-Fithr Holiday' },
  { date: '2025-04-02', name: 'Eid-ul-Fithr Holiday' },
  { date: '2025-05-01', name: 'International Worker\'s Day' },
  { date: '2025-06-05', name: 'Hajj Day' },
  { date: '2025-06-06', name: 'Eid-ul-Al\'haa' },
  { date: '2025-06-08', name: 'Eid-ul-Al\'haa Holiday' },
  { date: '2025-06-09', name: 'Eid-ul-Al\'haa Holiday' },
  { date: '2025-06-26', name: 'Islamic New Year' },
  { date: '2025-07-26', name: 'Independence Day' },
  { date: '2025-07-27', name: 'Independence Day Holiday' },
  { date: '2025-08-24', name: 'Rabi\' al-awwal' },
  { date: '2025-09-04', name: 'Milad Un Nabi (Mawlid)' },
  { date: '2025-09-24', name: 'The Day Maldives Embraced Islam' },
  { date: '2025-11-03', name: 'Victory Day' },
  { date: '2025-11-11', name: 'Republic Day' },
  { date: '2025-12-25', name: 'Christmas Day' }
];

// Function to calculate leave balance
const calculateLeaveBalance = (employee, leaveType) => {
  // Get leave type definition
  const leaveTypeObj = leaveTypes.find(type => type.value === leaveType);
  if (!leaveTypeObj) return 0;
  
  // Base entitlement
  let entitlement = leaveTypeObj.entitlement;
  
  // For annual leave, pro-rate based on hire date if this is current year
  if (leaveType === 'annual' && employee.joinedDate) {
    const hireDate = new Date(employee.joinedDate);
    const currentYear = new Date().getFullYear();
    const hireYear = hireDate.getFullYear();
    
    if (hireYear === currentYear) {
      // Pro-rate based on month of hire
      const monthsWorked = 12 - hireDate.getMonth();
      entitlement = Math.round((entitlement / 12) * monthsWorked);
    }
  }
  
  // Special case for maternity leave based on gender
  if (leaveType === 'maternity') {
    // Assuming 'gender' field exists in employee data
    entitlement = employee.gender === 'female' ? 60 : 30; // 60 for women, 30 for guests
  }
  
  return entitlement;
};

const LeavePlan = () => {
  const [leaves, setLeaves] = useState(mockLeaves);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    type: ''
  });
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'annual',
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
    status: 'pending'
  });

  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin' || userRole === 'hr';

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  // Fetch real leave data from backend (to be implemented)
  const fetchLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      // Mock data for now
      // In a real implementation, this would be an API call
      setTimeout(() => {
        setLeaves(mockLeaves);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to fetch leave data');
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter leaves based on criteria
  const filteredLeaves = leaves.filter(leave => {
    return (
      (filters.department ? leave.department === filters.department : true) &&
      (filters.status ? leave.status === filters.status : true) &&
      (filters.type ? leave.leaveType === filters.type : true)
    );
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  // Calculate number of days between start and end dates
  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    
    return diffDays;
  };

  // Open dialog for creating or editing leave
  const handleOpenDialog = (leave = null) => {
    if (leave) {
      // Edit mode - populate form with leave data
      setFormData({
        employeeId: leave.employeeId,
        leaveType: leave.leaveType,
        startDate: new Date(leave.startDate),
        endDate: new Date(leave.endDate),
        reason: leave.reason,
        status: leave.status
      });
      setSelectedLeave(leave);
    } else {
      // Create mode - reset form
      setFormData({
        employeeId: employees[0]?.empNo || '',
        leaveType: 'annual',
        startDate: new Date(),
        endDate: new Date(),
        reason: '',
        status: 'pending'
      });
      setSelectedLeave(null);
    }
    setDialogOpen(true);
  };

  // Save leave (create or update)
  const handleSaveLeave = () => {
    // Validate form
    if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }

    // Check that end date is not before start date
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be before start date');
      return;
    }

    // Calculate days
    const days = calculateDays();

    // Get employee name from employee ID
    const employee = employees.find(emp => emp.empNo === formData.employeeId);
    const employeeName = employee ? employee.name : 'Unknown';
    const department = employee ? employee.department : 'Unknown';

    // Create new leave object
    const newLeave = {
      ...formData,
      id: selectedLeave ? selectedLeave.id : Date.now().toString(),
      employeeName,
      department,
      days,
      startDate: format(new Date(formData.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(formData.endDate), 'yyyy-MM-dd')
    };

    // Update leaves array
    if (selectedLeave) {
      // Update existing leave
      setLeaves(prev => prev.map(leave => leave.id === selectedLeave.id ? newLeave : leave));
    } else {
      // Add new leave
      setLeaves(prev => [...prev, newLeave]);
    }

    // Close dialog
    setDialogOpen(false);
    setSelectedLeave(null);
    setError('');
  };

  // Handle status change
  const handleStatusChange = (leave, newStatus) => {
    setLeaves(prev => prev.map(l => 
      l.id === leave.id ? { ...l, status: newStatus } : l
    ));
  };

  // Handle delete leave
  const handleDeleteLeave = (leaveId) => {
    setLeaves(prev => prev.filter(leave => leave.id !== leaveId));
  };

  // Get unique departments for filtering
  const departments = [...new Set(leaves.map(leave => leave.department))];

  // Calculate leave statistics
  const stats = {
    pending: filteredLeaves.filter(leave => leave.status === 'pending').length,
    approved: filteredLeaves.filter(leave => leave.status === 'approved').length,
    rejected: filteredLeaves.filter(leave => leave.status === 'rejected').length,
    total: filteredLeaves.length
  };

  // Calculate leave balances for the selected employee
  const getLeaveBalances = () => {
    if (!selectedEmployee) return {};
    
    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) return {};
    
    const balances = {};
    leaveTypes.forEach(type => {
      // Get entitlement
      const entitlement = calculateLeaveBalance(employee, type.value);
      
      // Calculate used leaves
      const usedLeaves = leaveRecords
        .filter(leave => 
          leave.employeeId === employee.id && 
          leave.leaveType === type.value && 
          leave.status === 'approved'
        )
        .reduce((total, leave) => total + leave.days, 0);
      
      // Calculate balance
      balances[type.value] = {
        entitlement,
        used: usedLeaves,
        remaining: entitlement - usedLeaves
      };
    });
    
    return balances;
  };
  
  // Handle opening the leave balance dialog
  const handleLeaveBalanceDialogOpen = (employeeId) => {
    setSelectedEmployee(employeeId);
    setLeaveBalances(getLeaveBalances());
    setLeaveBalanceDialogOpen(true);
  };
  
  // Handle public holiday dialog
  const handlePublicHolidayDialogOpen = () => {
    setPublicHolidayDialogOpen(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Leave Management</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage leave requests, balances, and holiday schedules
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}
        
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={filters.department}
                  label="Department"
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All Status</MenuItem>
                  {leaveStatus.map((status) => (
                    <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  name="type"
                  value={filters.type}
                  label="Leave Type"
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {leaveTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              {isAdmin && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Add />}
                  fullWidth
                  onClick={() => handleOpenDialog()}
                >
                  Add Leave
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Total Leaves
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.approved}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Rejected
                </Typography>
                <Typography variant="h4" color="error.main">
                  {stats.rejected}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Leave Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Leave Applications
          </Typography>
          <Divider />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="leave table">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    {isAdmin && <TableCell>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.employeeId}</TableCell>
                      <TableCell>{leave.employeeName}</TableCell>
                      <TableCell>{leave.department}</TableCell>
                      <TableCell>
                        {leaveTypes.find(type => type.value === leave.leaveType)?.label || leave.leaveType}
                      </TableCell>
                      <TableCell>{leave.startDate}</TableCell>
                      <TableCell>{leave.endDate}</TableCell>
                      <TableCell>{leave.days}</TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>
                        <Box sx={{ 
                          borderRadius: 1, 
                          px: 1, 
                          py: 0.5, 
                          display: 'inline-block',
                          backgroundColor: 
                            leave.status === 'approved' ? 'success.light' :
                            leave.status === 'rejected' ? 'error.light' : 
                            'warning.light',
                          color: 
                            leave.status === 'approved' ? 'success.dark' :
                            leave.status === 'rejected' ? 'error.dark' : 
                            'warning.dark',
                        }}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </Box>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {leave.status === 'pending' && (
                              <>
                                <Button 
                                  size="small" 
                                  color="success" 
                                  variant="outlined"
                                  onClick={() => handleStatusChange(leave, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="small" 
                                  color="error" 
                                  variant="outlined"
                                  onClick={() => handleStatusChange(leave, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button
                              size="small"
                              color="primary"
                              variant="outlined"
                              onClick={() => handleOpenDialog(leave)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => handleDeleteLeave(leave.id)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
        
        {/* Leave Form Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{selectedLeave ? 'Edit Leave' : 'Add New Leave'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Employee</InputLabel>
                  <Select
                    name="employeeId"
                    value={formData.employeeId}
                    label="Employee"
                    onChange={handleChange}
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee._id} value={employee.empNo}>
                        {employee.name} ({employee.empNo})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    name="leaveType"
                    value={formData.leaveType}
                    label="Leave Type"
                    onChange={handleChange}
                  >
                    {leaveTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  sx={{ width: '100%', mt: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  sx={{ width: '100%', mt: 2 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              
              {isAdmin && selectedLeave && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      label="Status"
                      onChange={handleChange}
                    >
                      {leaveStatus.map((status) => (
                        <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mt: 3, 
                  p: 2, 
                  backgroundColor: 'info.light', 
                  borderRadius: 1 
                }}>
                  <CalendarMonth sx={{ mr: 1 }} />
                  <Typography>
                    Total Days: <strong>{calculateDays()}</strong>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveLeave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
        
        {/* Leave Balance Dialog */}
        <Dialog open={leaveBalanceDialogOpen} onClose={() => setLeaveBalanceDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Leave Balance Details</DialogTitle>
          <DialogContent>
            {selectedEmployee && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {employees.find(emp => emp.id === selectedEmployee)?.name || 'Employee'}
                </Typography>
                
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="center">Entitlement</TableCell>
                        <TableCell align="center">Used</TableCell>
                        <TableCell align="center">Remaining</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaveTypes.map(type => {
                        const balance = leaveBalances[type.value] || { entitlement: 0, used: 0, remaining: 0 };
                        return (
                          <TableRow key={type.value}>
                            <TableCell>{type.label}</TableCell>
                            <TableCell>{type.description}</TableCell>
                            <TableCell align="center">{balance.entitlement}</TableCell>
                            <TableCell align="center">{balance.used}</TableCell>
                            <TableCell align="center">
                              <Typography
                                color={
                                  balance.remaining <= 0 ? 'error.main' :
                                  balance.remaining < 5 ? 'warning.main' : 'success.main'
                                }
                                fontWeight="bold"
                              >
                                {balance.remaining}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>Leave Policies:</Typography>
                  <ul>
                    <li>Annual leave: 30 days per year based on hire date</li>
                    <li>Sick leave: 30 days per year with medical certificate</li>
                    <li>Off days: 4 days per week</li>
                    <li>Maternity leave: 60 days for women, 30 days for guests</li>
                    <li>Paternity leave: 3 days</li>
                    <li>Family care leave: 10 days per year</li>
                    <li>Emergency leave: 5 days per year</li>
                  </ul>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLeaveBalanceDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* Public Holidays Dialog */}
        <Dialog open={publicHolidayDialogOpen} onClose={() => setPublicHolidayDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Public Holidays (2025)</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Day</TableCell>
                    <TableCell>Holiday</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {publicHolidays.map((holiday, index) => {
                    const holidayDate = new Date(holiday.date);
                    return (
                      <TableRow key={index}>
                        <TableCell>{format(holidayDate, 'dd-MMM-yyyy')}</TableCell>
                        <TableCell>{format(holidayDate, 'EEEE')}</TableCell>
                        <TableCell>{holiday.name}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPublicHolidayDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default LeavePlan;
