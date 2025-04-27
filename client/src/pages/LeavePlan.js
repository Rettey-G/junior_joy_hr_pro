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
  { value: 'annual', label: 'Annual Leave', entitlement: 30, description: 'Standard annual leave for all employees. Entitlement is 30 days per year for full-time staff and pro-rated for new joiners based on start date. Cannot be carried forward to next year.' },
  { value: 'sick', label: 'Sick Leave', entitlement: 30, description: 'For health-related absences. Medical certificate required for leaves longer than 2 days. Unlimited paid sick leave for hospitalization.' },
  { value: 'emergency', label: 'Emergency Leave', entitlement: 5, description: 'For urgent personal matters requiring immediate attention. Limited to 5 days per year. Management approval required.' },
  { value: 'maternity', label: 'Maternity Leave', entitlement: 60, description: '60 days paid leave for female employees. Can be extended by up to 30 additional days unpaid. Must apply at least 30 days prior to expected delivery date.' },
  { value: 'paternity', label: 'Paternity Leave', entitlement: 3, description: '3 days paid leave for new fathers. Must be taken within 30 days of child\'s birth. Birth certificate required upon return.' },
  { value: 'family', label: 'Family Care', entitlement: 10, description: 'To care for immediate family members during illness or emergency. Supporting documentation required. Maximum 10 days per year.' },
  { value: 'unpaid', label: 'Unpaid Leave', entitlement: 0, description: 'Leave without pay for extended absences. Requires department head and HR approval. Benefits suspended during unpaid leave period.' }
];

const leaveStatus = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

// This will be replaced by actual data from MongoDB
const initialLeaves = [];


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

// Function to calculate leave balance with more accurate calculation
const calculateLeaveBalance = (employee, leaveType, leaveRecords) => {
  // Get leave type definition
  const leaveTypeObj = leaveTypes.find(type => type.value === leaveType);
  if (!leaveTypeObj) return { entitlement: 0, used: 0, remaining: 0 };
  
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
    entitlement = employee.gender === 'female' ? 60 : 0; // 60 for women, 0 for men
  }

  // Special case for paternity leave based on gender
  if (leaveType === 'paternity') {
    // Only men get paternity leave
    entitlement = employee.gender === 'male' ? 3 : 0;
  }
  
  // Calculate used leave days for this type
  const approvedLeaves = leaveRecords.filter(leave => 
    leave.employeeId === employee.id && 
    leave.leaveType === leaveType && 
    leave.status === 'approved'
  );
  
  const usedDays = approvedLeaves.reduce((total, leave) => total + leave.days, 0);
  
  // Calculate pending leave days (these are not deducted yet but good to show)
  const pendingLeaves = leaveRecords.filter(leave => 
    leave.employeeId === employee.id && 
    leave.leaveType === leaveType && 
    leave.status === 'pending'
  );
  
  const pendingDays = pendingLeaves.reduce((total, leave) => total + leave.days, 0);
  
  return {
    entitlement,
    used: usedDays,
    pending: pendingDays,
    remaining: entitlement - usedDays
  };
};

const LeavePlan = () => {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [leaveRecords, setLeaveRecords] = useState(initialLeaves); // For balance calculation
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [leaveBalances, setLeaveBalances] = useState({});
  const [currentView, setCurrentView] = useState('calendar'); // 'calendar' or 'list'
  const [leaveBalanceDialogOpen, setLeaveBalanceDialogOpen] = useState(false);
  const [publicHolidayDialogOpen, setPublicHolidayDialogOpen] = useState(false);
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

  // Fetch employees data and leave records
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      
      // Fetch employees from MongoDB
      const employeesResponse = await api.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(employeesResponse.data);
      
      // Fetch actual leave records from MongoDB
      try {
        const leaveResponse = await api.get('/api/leaverequests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // If we have real leave data, use it
        if (leaveResponse.data && leaveResponse.data.length > 0) {
          const formattedLeaveData = leaveResponse.data.map(leave => {
            const employee = employeesResponse.data.find(emp => 
              emp.id === leave.employeeId || emp.empNo === leave.employeeId
            );
            
            return {
              ...leave,
              employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee',
              department: employee ? employee.department : 'Unknown Department'
            };
          });
          
          setLeaves(formattedLeaveData);
          setLeaveRecords(formattedLeaveData);
        } else {
          // Generate placeholder leave records using real employees
          const generatedLeaves = [];
          
          // Use the first 5 real employees to create sample leave records
          for (let i = 0; i < Math.min(5, employeesResponse.data.length); i++) {
            const emp = employeesResponse.data[i];
            const leaveTypes = ['annual', 'sick', 'emergency', 'family', 'unpaid'];
            const statuses = ['approved', 'pending', 'rejected'];
            
            generatedLeaves.push({
              id: `L${i+1}`,
              employeeId: emp.id || emp.empNo,
              employeeName: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`,
              leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
              startDate: `2025-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
              endDate: `2025-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
              days: Math.floor(Math.random() * 5) + 1,
              reason: ['Vacation', 'Family Event', 'Medical Appointment', 'Personal Work'][Math.floor(Math.random() * 4)],
              status: statuses[Math.floor(Math.random() * statuses.length)],
              department: emp.department || 'General'
            });
          }
          
          setLeaves(generatedLeaves);
          setLeaveRecords(generatedLeaves);
        }
      } catch (leaveError) {
        console.error('Error fetching leave data:', leaveError);
        // Generate sample data using real employees as fallback
        const generatedLeaves = employeesResponse.data.slice(0, 5).map((emp, index) => ({
          id: `L${index+1}`,
          employeeId: emp.id || emp.empNo,
          employeeName: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`,
          leaveType: ['annual', 'sick', 'emergency'][index % 3],
          startDate: `2025-05-${index+1}`,
          endDate: `2025-05-${index+3}`,
          days: Math.floor(Math.random() * 5) + 1,
          reason: ['Vacation', 'Medical', 'Personal'][index % 3],
          status: ['approved', 'pending', 'rejected'][index % 3],
          department: emp.department || 'General'
        }));
        
        setLeaves(generatedLeaves);
        setLeaveRecords(generatedLeaves);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
    // Auto-select logged-in employee for non-admin/HR users
    if (!isAdmin) {
      const empNo = localStorage.getItem('empNo');
      if (empNo) setSelectedEmployee(empNo);
    }
  }, []);

  // Fetch real leave data from backend (to be implemented)
  const fetchLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      // Apply filters to the existing leave records
      const filteredLeaves = leaveRecords.filter(leave => {
        if (filters.department && leave.department !== filters.department) return false;
        if (filters.status && leave.status !== filters.status) return false;
        if (filters.type && leave.leaveType !== filters.type) return false;
        return true;
      });
      
      // Update leaves with filtered data
      setLeaves(filteredLeaves);
      setLoading(false);
    } catch (err) {
      setError('Failed to filter leave data');
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchLeaves();
    fetchData(); // Use fetchData instead of fetchEmployees
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
  

  // Calculate leave statistics with improved filtering
  const stats = {
    pending: filteredLeaves.filter(leave => leave.status === 'pending').length,
    approved: filteredLeaves.filter(leave => leave.status === 'approved').length,
    rejected: filteredLeaves.filter(leave => leave.status === 'rejected').length,
    total: filteredLeaves.length,
    // Add stats by leave type
    byType: leaveTypes.reduce((acc, type) => {
      acc[type.value] = filteredLeaves.filter(leave => leave.leaveType === type.value).length;
      return acc;
    }, {})
  };

  // This comment replaces the removed handleLeaveBalanceDialogClose function which was unused
  
  // Handle public holiday dialog
  const handlePublicHolidayDialogOpen = () => {
    setPublicHolidayDialogOpen(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>Leave Management</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Manage leave requests and view leave balances
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 1, sm: 0 } }}>
            {/* Summary statistics badges */}
            <Paper sx={{ px: 2, py: 1, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
              <Typography variant="body2"><strong>{stats.total}</strong> Total</Typography>
            </Paper>
            <Paper sx={{ px: 2, py: 1, bgcolor: 'warning.light', color: 'warning.contrastText', borderRadius: 2 }}>
              <Typography variant="body2"><strong>{stats.pending}</strong> Pending</Typography>
            </Paper>
            <Paper sx={{ px: 2, py: 1, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 2 }}>
              <Typography variant="body2"><strong>{stats.approved}</strong> Approved</Typography>
            </Paper>
          </Box>
        </Box>
        
        {/* Employee selection and leave balance - improved mobile responsiveness */}
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary.main">
                Select Employee to View/Apply for Leave
              </Typography>
              <FormControl fullWidth size="large" variant="outlined">
                <InputLabel>Employee Name</InputLabel>
                <Select
  MenuProps={{
    PaperProps: {
      style: {
        maxHeight: 250,
        minWidth: 220,
      },
    },
  }}
                  value={selectedEmployee}
                  label="Employee Name"
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderRadius: 2 }
                    }
                  }}
                  onChange={(e) => {
                    setSelectedEmployee(e.target.value);
                    if (e.target.value) {
                      // Calculate and show leave balances for selected employee with improved calculation
                      const employee = employees.find(emp => emp.id === e.target.value);
                      if (employee) {
                        // Calculate accurate balances for each leave type
                        const balances = {};
                        leaveTypes.forEach(type => {
                          balances[type.value] = calculateLeaveBalance(employee, type.value, leaveRecords);
                        });
                        setLeaveBalances(balances);
                      }
                    }
                  }}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      },
                    },
                  }}
                  disabled={loading || employees.length === 0}
                  sx={{ minWidth: 300 }}
                >
                  <MenuItem value="">
                    <em>Select an employee</em>
                  </MenuItem>
                  {employees.map(employee => (
                    <MenuItem key={employee.id} value={employee.id}>
                      <strong>{employee.id}</strong> - {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2, justifyContent: { xs: 'space-between', md: 'center' }, alignItems: { xs: 'center', md: 'flex-end' }, mt: { xs: 2, md: 0 } }}>
              <Button 
                variant="outlined" 
                startIcon={<CalendarMonth />}
                onClick={() => handlePublicHolidayDialogOpen()}
                sx={{ width: { xs: '48%', md: '220px' }, height: '45px', borderRadius: 2 }}
                size="large"
              >
                PUBLIC HOLIDAYS
              </Button>
              
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Add />}
                onClick={() => {
                  setFormData({
                    ...formData,
                    employeeId: selectedEmployee
                  });
                  setDialogOpen(true);
                }}
                disabled={!selectedEmployee}
                sx={{ 
                  width: { xs: '48%', md: '220px' }, 
                  height: '45px', 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: 2
                }}
                size="large"
              >
                APPLY FOR LEAVE
              </Button>
            </Grid>
          </Grid>
          
          {/* Leave balance display with improved visual presentation */}
          {selectedEmployee && Object.keys(leaveBalances).length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  Leave Balance for {employees.find(emp => emp.id === selectedEmployee)?.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant={currentView === 'calendar' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentView('calendar')}
                    startIcon={<CalendarMonth />}
                  >
                    Calendar
                  </Button>
                  <Button 
                    variant={currentView === 'list' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentView('list')}
                    startIcon={<CalendarMonth />}
                  >
                    List
                  </Button>
                </Box>
              </Box>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {leaveTypes.map(type => {
                  const balance = leaveBalances[type.value] || { entitlement: 0, used: 0, pending: 0, remaining: 0 };
                  // Skip leave types with zero entitlement (not applicable to this employee)
                  if (balance.entitlement === 0) return null;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={type.value}>
                      <Paper 
                        elevation={3} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: balance.remaining <= 0 ? 'error.main' : 
                                      balance.remaining < 5 ? 'warning.main' : 'success.main',
                          bgcolor: balance.remaining <= 0 ? 'rgba(211, 47, 47, 0.1)' : 
                                  balance.remaining < 5 ? 'rgba(237, 108, 2, 0.1)' : 'rgba(46, 125, 50, 0.1)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                          {type.label}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 1 }}>
                          <Typography variant="h3" fontWeight="bold" color={balance.remaining <= 0 ? 'error.main' : 
                                           balance.remaining < 5 ? 'warning.main' : 'success.main'}>
                            {balance.remaining}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            days<br/>remaining
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>{balance.used}</strong> used
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>{balance.entitlement}</strong> total
                          </Typography>
                        </Box>
                        {balance.pending > 0 && (
                          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                            <strong>{balance.pending}</strong> days pending approval
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}
        
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ minWidth: '220px' }}>
                <InputLabel>Department</InputLabel>
                <Select
  MenuProps={{
    PaperProps: {
      style: {
        maxHeight: 250,
        minWidth: 220,
      },
    },
  }}
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
              <FormControl fullWidth sx={{ minWidth: '220px' }}>
                <InputLabel>Status</InputLabel>
                <Select
  MenuProps={{
    PaperProps: {
      style: {
        maxHeight: 250,
        minWidth: 220,
      },
    },
  }}
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
              <FormControl fullWidth sx={{ minWidth: '220px' }}>
                <InputLabel>Leave Type</InputLabel>
                <Select
  MenuProps={{
    PaperProps: {
      style: {
        maxHeight: 250,
        minWidth: 220,
      },
    },
  }}
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
               {/* Always show for employees, only for admins if isAdmin */}
              {(isAdmin || selectedEmployee) && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Add />}
                  fullWidth
                  onClick={() => handleOpenDialog()}
                >
                  {isAdmin ? 'Add Leave' : 'Apply for Leave'}
                </Button>
              )}
              {/* Show View Leave Balance button for employees */}
              {!isAdmin && selectedEmployee && (
                <Button
                  variant="contained"
                  color="info"
                  fullWidth
                  sx={{ mt: 2, fontWeight: 'bold', fontSize: '1rem' }}
                  onClick={() => setLeaveBalanceDialogOpen(true)}
                >
                  View Leave Balance
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
  MenuProps={{
    PaperProps: {
      style: {
        maxHeight: 250,
        minWidth: 220,
      },
    },
  }}
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
  MenuProps={{
    PaperProps: {
      style: {
        maxHeight: 250,
        minWidth: 220,
      },
    },
  }}
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
  MenuProps={{
    PaperProps: {
      style: {
        maxHeight: 250,
        minWidth: 220,
      },
    },
  }}
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
