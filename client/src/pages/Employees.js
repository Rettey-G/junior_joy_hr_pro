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
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import { Add, Edit, Delete, FilterList } from '@mui/icons-material';
import { format } from 'date-fns';

const Employees = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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
    cityIsland: 'hinnavaru',
    dateOfBirth: '',
    mobileNumber: '',
    workNo: '',
    designation: '',
    department: '',
    workSite: 'Office',
    joinedDate: '',
    salaryUSD: 0,
    salaryMVR: 0,
    image: ''
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Box sx={{ px: isMobile ? 1 : 3, mt: isMobile ? 2 : 4, mb: isMobile ? 2 : 4 }}>
      <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
        <Box 
          display="flex" 
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent={isMobile ? 'center' : 'space-between'} 
          alignItems={isMobile ? 'stretch' : 'center'} 
          mb={isMobile ? 2 : 3}
          gap={isMobile ? 2 : 0}
        >
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h2" 
            gutterBottom={!isMobile}
            align={isMobile ? "center" : "left"}
          >
            Employee Management
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: isMobile ? 'space-between' : 'flex-end',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            <IconButton onClick={toggleFilters} color="primary" sx={{ mr: 1 }}>
              <FilterList />
            </IconButton>
            {isAdmin && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={!isMobile && <Add />}
                size={isMobile ? "small" : "medium"}
                onClick={() => handleOpenDialog()}
                fullWidth={isMobile}
                sx={{ ml: isMobile ? 0 : 1 }}
              >
                {isMobile ? <Add /> : "Add Employee"}
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters */}
        {filterOpen && (
          <Paper elevation={2} sx={{ p: isMobile ? 1.5 : 2, mb: isMobile ? 2 : 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1
            }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom={!isMobile}>
                Filters
              </Typography>
              {filters.department || filters.workSite ? (
                <Chip 
                  label="Clear All" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  onClick={resetFilters} 
                />
              ) : null}
            </Box>
            
            <Grid container spacing={isMobile ? 1 : 2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" margin={isMobile ? "dense" : "normal"}>
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
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" margin={isMobile ? "dense" : "normal"}>
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
              {!isMobile && (
                <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button 
                    variant="outlined" 
                    onClick={resetFilters}
                    size="small"
                  >
                    Reset Filters
                  </Button>
                </Grid>
              )}
            </Grid>
            
            {/* Applied filters */}
            {(filters.department || filters.workSite) && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters.department && (
                  <Chip 
                    label={`Department: ${filters.department}`} 
                    size="small" 
                    onDelete={() => handleFilterChange({ target: { name: 'department', value: '' } })} 
                  />
                )}
                {filters.workSite && (
                  <Chip 
                    label={`Work Site: ${filters.workSite}`} 
                    size="small" 
                    onDelete={() => handleFilterChange({ target: { name: 'workSite', value: '' } })} 
                  />
                )}
              </Box>
            )}
          </Paper>
        )}

        {/* Active Filters Indication */}
        {!filterOpen && (filters.department || filters.workSite) && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" sx={{ mr: 1, alignSelf: 'center' }}>
              Active filters:
            </Typography>
            {filters.department && (
              <Chip 
                label={`${filters.department}`} 
                size="small" 
                color="primary"
                variant="outlined"
                onDelete={() => handleFilterChange({ target: { name: 'department', value: '' } })} 
              />
            )}
            {filters.workSite && (
              <Chip 
                label={`${filters.workSite}`} 
                size="small" 
                color="secondary"
                variant="outlined"
                onDelete={() => handleFilterChange({ target: { name: 'workSite', value: '' } })} 
              />
            )}
          </Box>
        )}
        
        {/* Employees Table or Cards */}
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : employees.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">No employees found</Typography>
          </Paper>
        ) : isMobile ? (
          // Mobile Card View
          <Stack spacing={2}>
            {employees.map((employee) => (
              <Card key={employee._id} elevation={2}>
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{employee.name}</Typography>
                    <Chip size="small" label={employee.empNo} color="primary" variant="outlined" />
                  </Box>
                  <Divider sx={{ mb: 1.5 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">ID Number</Typography>
                      <Typography variant="body2">{employee.idNumber}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Designation</Typography>
                      <Typography variant="body2" noWrap>{employee.designation}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Department</Typography>
                      <Typography variant="body2" noWrap>{employee.department}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Work Site</Typography>
                      <Typography variant="body2">{employee.workSite}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Salary (USD)</Typography>
                      <Typography variant="body2">${employee.salaryUSD || 0}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Salary (MVR)</Typography>
                      <Typography variant="body2">{employee.salaryMVR || 0} MVR</Typography>
                    </Grid>
                  </Grid>
                  
                  {isAdmin && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
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
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          // Desktop Table View
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }} size={isTablet ? "small" : "medium"}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>EMP NO</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>ID Number</TableCell>
                  {!isTablet && <TableCell>Gender</TableCell>}
                  <TableCell>Designation</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Work Site</TableCell>
                  <TableCell>Salary (USD)</TableCell>
                  {!isTablet && <TableCell>Salary (MVR)</TableCell>}
                  {!isTablet && <TableCell>Joined Date</TableCell>}
                  {isAdmin && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id} hover>
                    <TableCell>{employee.empNo}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.idNumber}</TableCell>
                    {!isTablet && <TableCell>{employee.gender}</TableCell>}
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.workSite}</TableCell>
                    <TableCell>${employee.salaryUSD || 0}</TableCell>
                    {!isTablet && <TableCell>{employee.salaryMVR || 0} MVR</TableCell>}
                    {!isTablet && <TableCell>{formatDate(employee.joinedDate)}</TableCell>}
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Employee Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ px: isMobile ? 2 : 3, py: isMobile ? 1.5 : 2 }}>
          {currentEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent dividers sx={{ px: isMobile ? 2 : 3 }}>
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
                label="City/Island"
                name="cityIsland"
                value={formData.cityIsland}
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
              <TextField
                fullWidth
                label="Work Site"
                name="workSite"
                value={formData.workSite}
                onChange={handleChange}
                margin="normal"
                required
              />
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Salary (USD)"
                name="salaryUSD"
                type="number"
                value={formData.salaryUSD}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Salary (MVR)"
                name="salaryMVR"
                type="number"
                value={formData.salaryMVR}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  endAdornment: <span style={{ marginLeft: 8 }}>MVR</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                label="Image URL"
                name="image"
                value={formData.image}
                onChange={handleChange}
                margin="normal"
                helperText="Enter URL for employee photo (optional)"
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
        anchorOrigin={{
          vertical: isMobile ? 'top' : 'bottom',
          horizontal: isMobile ? 'center' : 'right'
        }}
        sx={{ width: isMobile ? '90%' : 'auto' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Employees;
