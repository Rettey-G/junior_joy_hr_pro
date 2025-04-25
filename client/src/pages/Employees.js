import React, { useState, useEffect } from 'react';

import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, FilterList } from '@mui/icons-material';
import { format } from 'date-fns';

const Employees = () => {
  // States
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [formData, setFormData] = useState({
    empNo: '',
    name: '',
    idNumber: '',
    gender: 'Male',
    nationality: 'Maldivian',
    dateOfBirth: '',
    mobileNumber: '',
    workNo: '',
    designation: '',
    department: '',
    workSite: 'Office',
    joinedDate: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    workSite: ''
  });

  // Check if user is admin
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user && user.role === 'admin';

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      let url = `${process.env.REACT_APP_API_URL}/api/employees`;
      
      // Add filters if present
      const queryParams = [];
      if (filters.department) queryParams.push(`department=${filters.department}`);
      if (filters.workSite) queryParams.push(`workSite=${filters.workSite}`);
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  // Handle dialog open/close
  const handleOpenDialog = (employee = null) => {
    if (employee) {
      // Edit mode - format dates for the form
      const formattedEmployee = {
        ...employee,
        dateOfBirth: employee.dateOfBirth ? format(new Date(employee.dateOfBirth), 'yyyy-MM-dd') : '',
        joinedDate: employee.joinedDate ? format(new Date(employee.joinedDate), 'yyyy-MM-dd') : ''
      };
      setCurrentEmployee(employee);
      setFormData(formattedEmployee);
    } else {
      // Add mode
      setCurrentEmployee(null);
      setFormData({
        empNo: '',
        name: '',
        idNumber: '',
        gender: 'Male',
        nationality: 'Maldivian',
        dateOfBirth: '',
        mobileNumber: '',
        workNo: '',
        designation: '',
        department: '',
        workSite: 'Office',
        joinedDate: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Save employee (create or update)
  const handleSaveEmployee = async () => {
    try {
      const isEditing = !!currentEmployee;
      const url = isEditing 
        ? `${process.env.REACT_APP_API_URL}/api/employees/${currentEmployee._id}`
        : `${process.env.REACT_APP_API_URL}/api/employees`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save employee');
      }
      
      const savedEmployee = await response.json();
      
      if (isEditing) {
        // Update in the list
        setEmployees(employees.map(emp => emp._id === savedEmployee._id ? savedEmployee : emp));
        showSnackbar('Employee updated successfully', 'success');
      } else {
        // Add to the list
        setEmployees([...employees, savedEmployee]);
        showSnackbar('Employee added successfully', 'success');
      }
      
      handleCloseDialog();
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }
      
      // Remove from the list
      setEmployees(employees.filter(emp => emp._id !== id));
      showSnackbar('Employee deleted successfully', 'success');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  // Snackbar helpers
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd-MMM-yy');
    } catch (e) {
      return dateString;
    }
  };

  // Toggle filter panel
  const toggleFilters = () => {
    setFilterOpen(!filterOpen);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      department: '',
      workSite: ''
    });
  };

  // Get unique departments for filter dropdown
  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean).sort();
  const workSites = ['Office', 'Express 1', 'Express 3'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2" gutterBottom>
            Employee Management
          </Typography>
          <Box>
            <IconButton onClick={toggleFilters} color="primary" sx={{ mr: 1 }}>
              <FilterList />
            </IconButton>
            {isAdmin && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Add Employee
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters */}
        {filterOpen && (
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Filters</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={filters.department}
                    label="Department"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Work Site</InputLabel>
                  <Select
                    name="workSite"
                    value={filters.workSite}
                    label="Work Site"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Sites</MenuItem>
                    {workSites.map(site => (
                      <MenuItem key={site} value={site}>{site}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button 
                  variant="outlined" 
                  onClick={resetFilters}
                  size="small"
                >
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Employees Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>EMP NO</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>ID Number</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Work Site</TableCell>
                  <TableCell>Joined Date</TableCell>
                  {isAdmin && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 9 : 8} align="center">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell>{employee.empNo}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.idNumber}</TableCell>
                      <TableCell>{employee.gender}</TableCell>
                      <TableCell>{employee.designation}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.workSite}</TableCell>
                      <TableCell>{formatDate(employee.joinedDate)}</TableCell>
                      {isAdmin && (
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDialog(employee)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteEmployee(employee._id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee Number"
                name="empNo"
                value={formData.empNo}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ID Number"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  onChange={handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Work Phone Number"
                name="workNo"
                value={formData.workNo}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Work Site</InputLabel>
                <Select
                  name="workSite"
                  value={formData.workSite}
                  label="Work Site"
                  onChange={handleChange}
                >
                  <MenuItem value="Office">Office</MenuItem>
                  <MenuItem value="Express 1">Express 1</MenuItem>
                  <MenuItem value="Express 3">Express 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Joined Date"
                name="joinedDate"
                type="date"
                value={formData.joinedDate}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveEmployee} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Employees;
