import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Card, CardContent, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl,
  InputLabel, Select, Chip, Alert, CircularProgress, Tabs, Tab
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Add, Edit, AccessTime, HourglassEmpty, TimerOff, 
  WorkOff, EventBusy, CalendarToday, FilterList 
} from '@mui/icons-material';
import { format, isWeekend, parseISO, addDays } from 'date-fns';
import api from '../services/api';

// Status chips with colors
const statusChips = {
  present: { label: 'Present', color: 'success' },
  absent: { label: 'Absent', color: 'error' },
  leave: { label: 'On Leave', color: 'warning' },
  holiday: { label: 'Holiday', color: 'primary' },
  weekend: { label: 'Weekend', color: 'secondary' },
  late: { label: 'Late', color: 'warning' },
  overtime: { label: 'Overtime', color: 'info' }
};

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

// Function to check if a date is a public holiday
const isPublicHoliday = (date) => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  return publicHolidays.some(holiday => holiday.date === formattedDate);
};

// Function to get holiday name
const getHolidayName = (date) => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const holiday = publicHolidays.find(h => h.date === formattedDate);
  return holiday ? holiday.name : '';
};

const TimeAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recordDetails, setRecordDetails] = useState({
    employeeId: '',
    date: new Date(),
    checkIn: '',
    checkOut: '',
    status: 'present',
    notes: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [filterDepartment, setFilterDepartment] = useState('');

  // Mock data for attendance records (would be replaced with API calls)
  const generateMockAttendanceData = useCallback(() => {
    // Check if employees array is empty
    if (!employees || employees.length === 0) {
      return [];
    }
    
    // Generate data only once with stable results
    const records = [];
    const today = new Date();
    const seed = 12345; // Fixed seed for random number generation
    
    // Simple deterministic random function
    const seededRandom = (max, min = 0) => {
      const x = Math.sin(seed + records.length) * 10000;
      return min + (Math.abs(x - Math.floor(x)) * (max - min));
    };
    
    // Generate attendance records for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, -i);
      
      employees.forEach(employee => {
        // Skip weekends and holidays
        if (isWeekend(date) || isPublicHoliday(date)) {
          const status = isWeekend(date) ? 'weekend' : 'holiday';
          records.push({
            id: `${employee.id}-${format(date, 'yyyy-MM-dd')}`,
            employeeId: employee.id,
            employeeName: employee.name || 'Employee',
            department: employee.department || 'Department',
            date: format(date, 'yyyy-MM-dd'),
            checkIn: null,
            checkOut: null,
            status: status,
            notes: isWeekend(date) ? 'Weekend off' : `Holiday: ${getHolidayName(date)}`,
            hoursWorked: 0,
            overtimeHours: 0
          });
          return;
        }
        
        // Deterministically assign statuses
        const statuses = ['present', 'present', 'present', 'present', 'late', 'absent', 'leave'];
        const randomIndex = Math.floor(seededRandom(statuses.length));
        const randomStatus = statuses[randomIndex];
        
        let checkIn = null;
        let checkOut = null;
        let hoursWorked = 0;
        let overtimeHours = 0;
        let notes = '';
        
        // For present and late statuses, generate check-in/out times
        if (randomStatus === 'present' || randomStatus === 'late') {
          // Standard working hours: 9 AM to 5 PM
          const baseCheckIn = randomStatus === 'present' ? 9 : 9 + (seededRandom(2));
          checkIn = `${Math.floor(baseCheckIn)}:${seededRandom(1) > 0.5 ? '30' : '00'}`;
          
          // Check-out between 5 PM and 7 PM
          const baseCheckOut = 17 + (seededRandom(2));
          checkOut = `${Math.floor(baseCheckOut)}:${seededRandom(1) > 0.5 ? '30' : '00'}`;
          
          // Calculate hours worked and overtime
          hoursWorked = parseFloat((baseCheckOut - baseCheckIn).toFixed(1));
          overtimeHours = Math.max(0, parseFloat((hoursWorked - 8).toFixed(1)));
          
          notes = randomStatus === 'late' ? 'Employee arrived late' : '';
        } else if (randomStatus === 'leave') {
          // Assign leave types
          const leaveTypes = ['Annual Leave', 'Sick Leave', 'Emergency Leave', 'Family Care'];
          notes = leaveTypes[Math.floor(seededRandom(leaveTypes.length))];
        } else if (randomStatus === 'absent') {
          notes = 'Unexcused absence';
        }
        
        records.push({
          id: `${employee.id}-${format(date, 'yyyy-MM-dd')}`,
          employeeId: employee.id,
          employeeName: employee.name || 'Employee',
          department: employee.department || 'Department',
          date: format(date, 'yyyy-MM-dd'),
          checkIn: checkIn,
          checkOut: checkOut,
          status: randomStatus,
          notes: notes,
          hoursWorked: hoursWorked,
          overtimeHours: overtimeHours
        });
      });
    }
    
    return records;
  }, []); // No dependencies to prevent regeneration

  // Fetch employee data - run only once
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount
    
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/employees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Only update state if component is still mounted
        if (isMounted) {
          setEmployees(response.data);
          
          // Generate attendance data immediately, no timeout needed
          const mockData = generateMockAttendanceData();
          setAttendanceRecords(mockData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch employee data');
          console.error(err);
          setLoading(false);
        }
      }
    };
    
    fetchEmployees();
    
    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - load once on mount

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle dialog open/close
  const handleDialogOpen = (record = null) => {
    if (record) {
      setRecordDetails({
        employeeId: record.employeeId,
        date: parseISO(record.date),
        checkIn: record.checkIn || '',
        checkOut: record.checkOut || '',
        status: record.status,
        notes: record.notes || ''
      });
    } else {
      setRecordDetails({
        employeeId: selectedEmployee || '',
        date: selectedDate,
        checkIn: '',
        checkOut: '',
        status: 'present',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Handle record save
  const handleSaveRecord = () => {
    // In a real app, this would call an API endpoint
    console.log('Saving record:', recordDetails);
    
    // Update the local state with the new/updated record
    const formattedDate = format(recordDetails.date, 'yyyy-MM-dd');
    const employee = employees.find(emp => emp.id === recordDetails.employeeId);
    
    if (!employee) {
      setError('Employee not found');
      return;
    }
    
    // Calculate hours worked and overtime
    let hoursWorked = 0;
    let overtimeHours = 0;
    
    if (recordDetails.checkIn && recordDetails.checkOut && recordDetails.status === 'present') {
      const [checkInHour, checkInMinute] = recordDetails.checkIn.split(':').map(Number);
      const [checkOutHour, checkOutMinute] = recordDetails.checkOut.split(':').map(Number);
      
      hoursWorked = parseFloat((
        (checkOutHour + checkOutMinute / 60) - 
        (checkInHour + checkInMinute / 60)
      ).toFixed(1));
      
      overtimeHours = Math.max(0, parseFloat((hoursWorked - 8).toFixed(1)));
    }
    
    const newRecord = {
      id: `${recordDetails.employeeId}-${formattedDate}`,
      employeeId: recordDetails.employeeId,
      employeeName: employee.name,
      department: employee.department,
      date: formattedDate,
      checkIn: recordDetails.checkIn,
      checkOut: recordDetails.checkOut,
      status: recordDetails.status,
      notes: recordDetails.notes,
      hoursWorked: hoursWorked,
      overtimeHours: overtimeHours
    };
    
    // Check if the record already exists
    const existingRecordIndex = attendanceRecords.findIndex(
      record => record.id === newRecord.id
    );
    
    if (existingRecordIndex !== -1) {
      // Update existing record
      const updatedRecords = [...attendanceRecords];
      updatedRecords[existingRecordIndex] = newRecord;
      setAttendanceRecords(updatedRecords);
    } else {
      // Add new record
      setAttendanceRecords([newRecord, ...attendanceRecords]);
    }
    
    setDialogOpen(false);
  };

  // Filter records based on selected filters
  const getFilteredRecords = () => {
    return attendanceRecords.filter(record => {
      // Filter by department if selected
      if (filterDepartment && record.department !== filterDepartment) {
        return false;
      }
      
      // Filter by tab value
      if (tabValue === 1 && !['present', 'late'].includes(record.status)) {
        return false; // Attendance tab - show only present/late
      } else if (tabValue === 2 && record.status !== 'absent') {
        return false; // Absences tab
      } else if (tabValue === 3 && record.status !== 'leave') {
        return false; // Leaves tab
      } else if (tabValue === 4 && !['weekend', 'holiday'].includes(record.status)) {
        return false; // Off days tab
      } else if (tabValue === 5 && record.overtimeHours <= 0) {
        return false; // Overtime tab
      }
      
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (newest first)
  };

  // Get attendance summary statistics
  const getAttendanceSummary = () => {
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const leaveCount = attendanceRecords.filter(r => r.status === 'leave').length;
    const holidayCount = attendanceRecords.filter(r => r.status === 'holiday' || r.status === 'weekend').length;
    
    const totalWorkingDays = presentCount + lateCount + absentCount + leaveCount;
    const attendanceRate = totalWorkingDays > 0 
      ? Math.round(((presentCount + lateCount) / totalWorkingDays) * 100) 
      : 0;
    
    const totalHoursWorked = attendanceRecords.reduce((sum, record) => sum + record.hoursWorked, 0);
    const totalOvertimeHours = attendanceRecords.reduce((sum, record) => sum + record.overtimeHours, 0);
    
    return {
      presentCount,
      lateCount,
      absentCount,
      leaveCount,
      holidayCount,
      attendanceRate,
      totalHoursWorked,
      totalOvertimeHours
    };
  };

  // Get unique departments for filtering
  const getDepartments = () => {
    const departments = new Set();
    employees.forEach(emp => {
      if (emp.department) departments.add(emp.department);
    });
    return Array.from(departments);
  };

  // Get summary statistics
  const summary = getAttendanceSummary();
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Time & Attendance Management</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Attendance Rate
                  </Typography>
                  <Typography variant="h4">
                    {summary.attendanceRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Total Hours Worked
                  </Typography>
                  <Typography variant="h4">
                    {summary.totalHoursWorked.toFixed(1)}h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Overtime Hours
                  </Typography>
                  <Typography variant="h4">
                    {summary.totalOvertimeHours.toFixed(1)}h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Absences
                  </Typography>
                  <Typography variant="h4">
                    {summary.absentCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={selectedEmployee}
                    label="Employee"
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                  >
                    <MenuItem value="">All Employees</MenuItem>
                    {employees.map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filterDepartment}
                    label="Department"
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {getDepartments().map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleDialogOpen()}
                  >
                    Add Record
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                  >
                    Reset Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="All Records" icon={<CalendarToday />} iconPosition="start" />
              <Tab label="Attendance" icon={<AccessTime />} iconPosition="start" />
              <Tab label="Absences" icon={<WorkOff />} iconPosition="start" />
              <Tab label="Leaves" icon={<EventBusy />} iconPosition="start" />
              <Tab label="Off Days" icon={<TimerOff />} iconPosition="start" />
              <Tab label="Overtime" icon={<HourglassEmpty />} iconPosition="start" />
            </Tabs>
            
            {/* Tab Panels */}
            <Box sx={{ p: 2 }}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Employee</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                      <TableCell>Hours</TableCell>
                      <TableCell>Overtime</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredRecords().map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{record.employeeName}</TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell>{record.checkIn || '-'}</TableCell>
                        <TableCell>{record.checkOut || '-'}</TableCell>
                        <TableCell>{record.hoursWorked > 0 ? `${record.hoursWorked.toFixed(1)}h` : '-'}</TableCell>
                        <TableCell>{record.overtimeHours > 0 ? `${record.overtimeHours.toFixed(1)}h` : '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusChips[record.status]?.label || record.status}
                            color={statusChips[record.status]?.color || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{record.notes || '-'}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleDialogOpen(record)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </>
      )}
      
      {/* Add/Edit Record Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {recordDetails.id ? 'Edit Attendance Record' : 'Add Attendance Record'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={recordDetails.employeeId}
                  label="Employee"
                  onChange={(e) => setRecordDetails({...recordDetails, employeeId: e.target.value})}
                >
                  {employees.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={recordDetails.date}
                  onChange={(newDate) => setRecordDetails({...recordDetails, date: newDate})}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Check In Time (HH:MM)"
                value={recordDetails.checkIn}
                onChange={(e) => setRecordDetails({...recordDetails, checkIn: e.target.value})}
                placeholder="09:00"
                fullWidth
                disabled={['weekend', 'holiday', 'absent', 'leave'].includes(recordDetails.status)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Check Out Time (HH:MM)"
                value={recordDetails.checkOut}
                onChange={(e) => setRecordDetails({...recordDetails, checkOut: e.target.value})}
                placeholder="17:00"
                fullWidth
                disabled={['weekend', 'holiday', 'absent', 'leave'].includes(recordDetails.status)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={recordDetails.status}
                  label="Status"
                  onChange={(e) => setRecordDetails({...recordDetails, status: e.target.value})}
                >
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="leave">On Leave</MenuItem>
                  <MenuItem value="holiday">Holiday</MenuItem>
                  <MenuItem value="weekend">Weekend</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={recordDetails.notes}
                onChange={(e) => setRecordDetails({...recordDetails, notes: e.target.value})}
                multiline
                rows={2}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveRecord} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeAttendance;
