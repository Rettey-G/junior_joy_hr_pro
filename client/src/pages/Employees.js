import React, { useState, useEffect, useRef } from 'react';
import { CSVLink } from 'react-csv';
import { getProfileImageByGender } from '../utils/placeholderImages';
import api from '../services/api';

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
  Stack,
  Avatar,
  Badge,
  Tooltip,
  CardMedia,
  CardActions
} from '@mui/material';
import { Add, Edit, Delete, FilterList, PhotoCamera, Person, PersonAdd, Visibility, GetApp } from '@mui/icons-material';
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
  const [departmentDialog, setDepartmentDialog] = useState(false);
  const [workSiteDialog, setWorkSiteDialog] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [newWorkSite, setNewWorkSite] = useState('');
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
  
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    workSite: '',
    nationality: '',
    designation: ''
  });

  // Check if user is admin
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user && user.role === 'admin';

  // Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/employees');
      setEmployees(response.data);
      showSnackbar('Employee data updated successfully', 'success');
    } catch (err) {
      setError('Error loading employee data');
      showSnackbar('Error loading employee data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

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
  
  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Image size exceeds 5MB limit', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setFormData(prev => ({
        ...prev,
        image: e.target.result
      }));
      showSnackbar('Image uploaded successfully', 'success');
    };
    reader.onerror = () => {
      showSnackbar('Error reading file', 'error');
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Handle removing the uploaded image
  const handleRemoveImage = () => {
    setImagePreview(null);
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Update form data to remove image
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    showSnackbar('Image removed', 'success');
    setFormData({
      ...formData,
      image: ''
    });
    setImagePreview('');
    showSnackbar('Image removed', 'info');
  };
  
  // Handle adding new department
  const handleAddDepartment = () => {
    setNewDepartment('');
    setDepartmentDialog(true);
  };
  
  // Handle saving new department
  const handleSaveDepartment = () => {
    if (newDepartment.trim()) {
      try {
        // In a real app, you would save this to the backend
        // For now, simulate updating local data by adding to employees array
        const dept = newDepartment.trim();
        
        // Check if department already exists
        if (getDepartments().includes(dept)) {
          showSnackbar(`Department "${dept}" already exists`, 'warning');
          return;
        }
        
        // Simulate adding to database
        // For demo purposes - we'll update an employee to have this department
        if (employees.length > 0) {
          const updatedEmployees = [...employees];
          // Update the first employee with the new department for demonstration
          updatedEmployees[0] = {
            ...updatedEmployees[0],
            department: dept
          };
          setEmployees(updatedEmployees);
        }
        
        showSnackbar(`Department "${dept}" added successfully`, 'success');
        setDepartmentDialog(false);
        setNewDepartment('');
      } catch (err) {
        showSnackbar(`Error adding department: ${err.message}`, 'error');
      }
    } else {
      showSnackbar('Please enter a department name', 'error');
    }
  };
  
  // Handle adding new work site
  const handleAddWorkSite = () => {
    setNewWorkSite('');
    setWorkSiteDialog(true);
  };
  
  // Handle saving new work site
  const handleSaveWorkSite = () => {
    if (newWorkSite.trim()) {
      try {
        // In a real app, you would save this to the backend
        // For now, simulate updating local data by adding to employees array
        const site = newWorkSite.trim();
        
        // Check if site already exists
        if (getWorkSites().includes(site)) {
          showSnackbar(`Work Site "${site}" already exists`, 'warning');
          return;
        }
        
        // Simulate adding to database
        // For demo purposes - we'll update an employee to have this site
        if (employees.length > 0) {
          const updatedEmployees = [...employees];
          // Update the first employee with the new work site for demonstration
          updatedEmployees[0] = {
            ...updatedEmployees[0],
            workSite: site
          };
          setEmployees(updatedEmployees);
        }
        
        showSnackbar(`Work Site "${site}" added successfully`, 'success');
        setWorkSiteDialog(false);
        setNewWorkSite('');
      } catch (err) {
        showSnackbar(`Error adding work site: ${err.message}`, 'error');
      }
    } else {
      showSnackbar('Please enter a work site name', 'error');
    }
  };

  // Add or update employee
  const handleSaveEmployee = async () => {
    try {
      const isEditing = !!currentEmployee;
      if (isEditing) {
        // Update existing employee
        const response = await api.put(`/api/employees/${currentEmployee._id}`, formData);
        setEmployees(employees.map(emp => emp._id === currentEmployee._id ? response.data : emp));
        showSnackbar('Employee updated successfully', 'success');
      } else {
        // Add new employee
        const response = await api.post('/api/employees', formData);
        setEmployees([...employees, response.data]);
        showSnackbar('Employee added successfully', 'success');
      }
      handleCloseDialog();
    } catch (err) {
      showSnackbar(`Error: ${err.response?.data?.error || err.message}`, 'error');
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/api/employees/${id}`);
      setEmployees(employees.filter(emp => emp._id !== id));
      showSnackbar('Employee deleted successfully', 'success');
    } catch (err) {
      showSnackbar('Error deleting employee: ' + (err.response?.data?.error || err.message), 'error');
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
      workSite: '',
      nationality: '',
      designation: ''
    });
  };

  // Get unique departments
  const getDepartments = () => {
    const uniqueDepartments = new Set();
    employees.forEach(employee => {
      if (employee.department) {
        uniqueDepartments.add(employee.department);
      }
    });
    return Array.from(uniqueDepartments).sort();
  };
  
  // Get unique worksites
  const getWorkSites = () => {
    const uniqueWorkSites = new Set();
    employees.forEach(employee => {
      if (employee.workSite) {
        uniqueWorkSites.add(employee.workSite);
      }
    });
    return Array.from(uniqueWorkSites).sort();
  };
  
  // Get unique nationalities
  const getNationalities = () => {
    const uniqueNationalities = new Set();
    employees.forEach(employee => {
      if (employee.nationality) {
        uniqueNationalities.add(employee.nationality);
      }
    });
    return Array.from(uniqueNationalities).sort();
  };

  // Get unique designations
  const getDesignations = () => {
    const uniqueDesignations = new Set();
    employees.forEach(employee => {
      if (employee.designation) {
        uniqueDesignations.add(employee.designation);
      }
    });
    return Array.from(uniqueDesignations).sort();
  };

  // Prepare data for CSV export
  const prepareCsvData = () => {
    return employees.map(emp => ({
      'Emp No': emp.empNo,
      'Name': emp.name,
      'ID Number': emp.idNumber,
      'Gender': emp.gender,
      'Nationality': emp.nationality,
      'Date of Birth': formatDate(emp.dateOfBirth),
      'Mobile Number': emp.mobileNumber,
      'Work Number': emp.workNo,
      'Designation': emp.designation,
      'Department': emp.department,
      'Work Site': emp.workSite,
      'Joined Date': formatDate(emp.joinedDate)
    }));
  };

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

        {/* Filters - Always visible now */}
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
              {filters.department || filters.workSite || filters.nationality || filters.designation ? (
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
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <FormControl fullWidth size="small" margin={isMobile ? "dense" : "normal"} sx={{ minWidth: '200px' }}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department"
                      value={filters.department}
                      label="Department"
                      onChange={handleFilterChange}
                      MenuProps={{ 
                        PaperProps: { sx: { maxHeight: 300 } },
                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                        transformOrigin: { vertical: 'top', horizontal: 'left' }
                      }}
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      {getDepartments().map(dept => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {isAdmin && (
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="secondary"
                      onClick={handleAddDepartment}
                      sx={{ ml: 1, minWidth: '40px', height: isMobile ? '40px' : '40px', mt: isMobile ? '8px' : '16px' }}
                    >
                      <Add fontSize="small" />
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <FormControl fullWidth size="small" margin={isMobile ? "dense" : "normal"} sx={{ minWidth: '200px' }}>
                    <InputLabel>Work Site</InputLabel>
                    <Select
                      name="workSite"
                      value={filters.workSite}
                      label="Work Site"
                      onChange={handleFilterChange}
                      MenuProps={{ 
                        PaperProps: { sx: { maxHeight: 300 } },
                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                        transformOrigin: { vertical: 'top', horizontal: 'left' }
                      }}
                    >
                      <MenuItem value="">All Sites</MenuItem>
                      {getWorkSites().map(site => (
                        <MenuItem key={site} value={site}>{site}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {isAdmin && (
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="secondary"
                      onClick={handleAddWorkSite}
                      sx={{ ml: 1, minWidth: '40px', height: isMobile ? '40px' : '40px', mt: isMobile ? '8px' : '16px' }}
                    >
                      <Add fontSize="small" />
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small" margin={isMobile ? "dense" : "normal"} sx={{ minWidth: '200px' }}>
                  <InputLabel>Nationality</InputLabel>
                  <Select
                    name="nationality"
                    value={filters.nationality}
                    label="Nationality"
                    onChange={handleFilterChange}
                    MenuProps={{ 
                      PaperProps: { sx: { maxHeight: 300 } },
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' }
                    }}
                  >
                    <MenuItem value="">All Nationalities</MenuItem>
                    {getNationalities().map(nationality => (
                      <MenuItem key={nationality} value={nationality}>{nationality}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small" margin={isMobile ? "dense" : "normal"} sx={{ minWidth: '200px' }}>
                  <InputLabel>Designation</InputLabel>
                  <Select
                    name="designation"
                    value={filters.designation}
                    label="Designation"
                    onChange={handleFilterChange}
                    MenuProps={{ 
                      PaperProps: { sx: { maxHeight: 300 } },
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' }
                    }}
                  >
                    <MenuItem value="">All Designations</MenuItem>
                    {getDesignations().map(designation => (
                      <MenuItem key={designation} value={designation}>{designation}</MenuItem>
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
            {(filters.department || filters.workSite || filters.nationality || filters.designation) && (
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
                {filters.nationality && (
                  <Chip 
                    label={`Nationality: ${filters.nationality}`} 
                    size="small" 
                    onDelete={() => handleFilterChange({ target: { name: 'nationality', value: '' } })} 
                  />
                )}
                {filters.designation && (
                  <Chip 
                    label={`Designation: ${filters.designation}`} 
                    size="small" 
                    onDelete={() => handleFilterChange({ target: { name: 'designation', value: '' } })} 
                  />
                )}
              </Box>
            )}
          </Paper>

        {/* Active Filters Indication */}
        {!filterOpen && (filters.department || filters.workSite || filters.nationality || filters.designation) && (
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
            {filters.nationality && (
              <Chip 
                label={`${filters.nationality}`} 
                size="small" 
                color="success"
                variant="outlined"
                onDelete={() => handleFilterChange({ target: { name: 'nationality', value: '' } })} 
              />
            )}
            {filters.designation && (
              <Chip 
                label={`${filters.designation}`} 
                size="small" 
                color="error"
                variant="outlined"
                onDelete={() => handleFilterChange({ target: { name: 'designation', value: '' } })} 
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
        ) : (
          // Card View for both mobile and desktop - Improved layout with equal distribution
          <Grid container spacing={2} justifyContent="center">
            {employees.map((employee) => (
              <Grid item xs={12} sm={6} md={4} xl={3} key={employee.empNo} sx={{ display: 'flex' }}>
                <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: employee.gender === 'Female' ? 'pink' : 'primary.light', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {employee.image ? (
                        <Avatar 
                          src={employee.image} 
                          alt={employee.name} 
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            border: '3px solid white',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }} 
                        />
                      ) : (
                        <Avatar 
                          src={getProfileImageByGender(employee.gender)}
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            bgcolor: employee.gender === 'Female' ? '#ec407a' : '#1976d2', 
                            border: '3px solid white',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          {employee.name.charAt(0)}
                        </Avatar>
                      )}
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="white">{employee.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip size="small" label={employee.empNo} sx={{ backgroundColor: 'white', height: 20, fontSize: '0.7rem' }} />
                          <Chip size="small" label={employee.nationality} sx={{ backgroundColor: 'rgba(255,255,255,0.7)', height: 20, fontSize: '0.7rem' }} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ pb: 1, flexGrow: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main', borderBottom: '1px solid #eee', pb: 0.5 }}>
                        {employee.designation} • {employee.department}
                      </Typography>
                    </Box>
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.paper' }}>
                          <Typography variant="caption" color="textSecondary" display="block">ID Number</Typography>
                          <Typography variant="body2" fontWeight="medium">{employee.idNumber}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.paper' }}>
                          <Typography variant="caption" color="textSecondary" display="block">Work Site</Typography>
                          <Typography variant="body2" fontWeight="medium">{employee.workSite}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.paper' }}>
                          <Typography variant="caption" color="textSecondary" display="block">Mobile</Typography>
                          <Typography variant="body2" fontWeight="medium" noWrap>{employee.mobileNumber || 'N/A'}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.paper' }}>
                          <Typography variant="caption" color="textSecondary" display="block">Joined</Typography>
                          <Typography variant="body2" fontWeight="medium">{formatDate(employee.joinedDate)}</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Divider />
                    
                    <CardActions sx={{ justifyContent: 'space-between', p: 1, bgcolor: '#f8f8f8' }}>
                      <Box>
                        <Chip 
                          variant="outlined" 
                          size="small" 
                          label={formatDate(employee.joinedDate)}
                          sx={{ fontSize: '0.7rem', height: '24px' }} 
                        />
                      </Box>
                      <Box>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(employee)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {isAdmin && (
                          <>
                            <Tooltip title="Edit Employee">
                              <IconButton 
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(employee)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Employee">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteEmployee(employee._id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </CardActions>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
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
        <DialogTitle>{currentEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            {/* Profile Image */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, maxWidth: 350, mx: 'auto', border: '1px dashed #aaa' }}>
                  <Avatar
                    src={imagePreview || formData.image || (formData.gender === 'Female' ? '/female-placeholder.jpg' : '/male-placeholder.jpg')}
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      mb: 2, 
                      mx: 'auto',
                      border: '3px solid #f0f0f0', 
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.85, boxShadow: '0 6px 12px rgba(0,0,0,0.3)' }
                    }}
                    onClick={triggerFileInput}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                      Employee Photo
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PhotoCamera />}
                        onClick={triggerFileInput}
                        size="small"
                        sx={{ px: 2 }}
                      >
                        Upload Image
                      </Button>
                      
                      {(imagePreview || formData.image) && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={handleRemoveImage}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                    
                    <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                      Click to upload from computer or phone camera
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                      Supports JPG, PNG (max 5MB)
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
            
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

      {/* Add Department Dialog */}
      <Dialog open={departmentDialog} onClose={() => setDepartmentDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Department</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Department Name"
            type="text"
            fullWidth
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepartmentDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveDepartment} color="primary" variant="contained">
            Save Department
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Work Site Dialog */}
      <Dialog open={workSiteDialog} onClose={() => setWorkSiteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Work Site</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Work Site Name"
            type="text"
            fullWidth
            value={newWorkSite}
            onChange={(e) => setNewWorkSite(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkSiteDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveWorkSite} color="primary" variant="contained">
            Save Work Site
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer with logo */}
      <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 0, borderTop: '1px solid #eee' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <img src="/juniorjoyhr.jpg" alt="Junior Joy HR Pro" style={{ width: 50, height: 50, borderRadius: '50%' }} />
              <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
                Junior Joy HR Pro
              </Typography>
            </Box>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
              Happy Teams, Smarter HR
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button size="small" color="primary">Dashboard</Button>
              <Button size="small" color="primary">Employees</Button>
              <Button size="small" color="primary">Payroll</Button>
              <Button size="small" color="primary">Training</Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Contact Support
            </Typography>
            <Typography variant="body2" color="textSecondary">
              support@juniorjoyhrpro.com
            </Typography>
            <Typography variant="body2" color="textSecondary">
              +960 7974242
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="textSecondary" align="center" display="block">
              {new Date().getFullYear()} Junior Joy HR Pro. All rights reserved.
            </Typography>
          </Grid>
        </Grid>
      </Paper>

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
