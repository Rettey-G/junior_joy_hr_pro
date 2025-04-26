import React, { useState, useEffect, useRef } from 'react';
import allEmployeeData from '../data/allEmployeeData';
import { CSVLink } from 'react-csv';
import { getProfileImageByGender } from '../utils/placeholderImages';

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

  // Fetch employees - now using our comprehensive employee data
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Instead of API fetch, use our local employee data
      // Filter the employee data based on the filters
      let filteredData = [...allEmployeeData];
      
      if (filters.department) {
        filteredData = filteredData.filter(emp => emp.department === filters.department);
      }
      
      if (filters.workSite) {
        filteredData = filteredData.filter(emp => emp.workSite === filters.workSite);
      }
      
      if (filters.nationality) {
        filteredData = filteredData.filter(emp => emp.nationality === filters.nationality);
      }
      
      if (filters.designation) {
        filteredData = filteredData.filter(emp => emp.designation === filters.designation);
      }
      
      // Set the employee data
      setEmployees(filteredData);
      showSnackbar('Employee data updated successfully', 'success');
    } catch (err) {
      setError('Error loading employee data');
      showSnackbar('Error loading employee data', 'error');
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
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result
        });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Handle adding new department
  const handleAddDepartment = () => {
    setNewDepartment('');
    setDepartmentDialog(true);
  };
  
  // Handle saving new department
  const handleSaveDepartment = () => {
    if (newDepartment.trim()) {
      // In a real app, you would save this to the backend
      // For demo, we'll just show a success message
      showSnackbar(`Department "${newDepartment}" added successfully`, 'success');
      setDepartmentDialog(false);
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
      // In a real app, you would save this to the backend
      // For demo, we'll just show a success message
      showSnackbar(`Work Site "${newWorkSite}" added successfully`, 'success');
      setWorkSiteDialog(false);
    } else {
      showSnackbar('Please enter a work site name', 'error');
    }
  };

  // Save employee (create or update) - now working with local data
  const handleSaveEmployee = async () => {
    try {
      const isEditing = !!currentEmployee;
      
      // Create a new employee object with all fields
      const employeeData = {
        ...formData,
        _id: formData.empNo // Use empNo as the ID
      };
      
      if (isEditing) {
        // Update in the list
        setEmployees(employees.map(emp => emp.empNo === currentEmployee.empNo ? employeeData : emp));
        showSnackbar('Employee updated successfully', 'success');
      } else {
        // Generate a new employee number if not provided
        if (!employeeData.empNo) {
          const lastEmpNo = employees.length > 0 
            ? Math.max(...employees.map(e => parseInt(e.empNo.replace('FEM', ''))) || 0)
            : 0;
          employeeData.empNo = `FEM${String(lastEmpNo + 1).padStart(3, '0')}`;
          employeeData._id = employeeData.empNo;
        }
        
        // Add to the list
        setEmployees([...employees, employeeData]);
        showSnackbar('Employee added successfully', 'success');
      }
      
      // In a real app, here you would save to the backend
      // For now we're just working with local data
      
      handleCloseDialog();
    } catch (err) {
      showSnackbar('Error saving employee: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  // Delete employee - now working with local data
  const handleDeleteEmployee = async (empNo) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    
    try {
      // Remove from the local list only
      setEmployees(employees.filter(emp => emp.empNo !== empNo));
      showSnackbar('Employee deleted successfully', 'success');
      
      // In a real app, here you would make the API call to delete from the backend
      // For now we're just working with local data
      
    } catch (err) {
      showSnackbar('Error deleting employee: ' + (err.message || 'Unknown error'), 'error');
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
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
                                onClick={() => handleDeleteEmployee(employee.empNo)}
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
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={imagePreview || (formData.gender === 'Female' ? '/female-placeholder.jpg' : '/male-placeholder.jpg')}
                  sx={{ width: 120, height: 120, mb: 1, border: '2px solid #ccc', boxShadow: '0 3px 5px rgba(0,0,0,0.2)' }}
                />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PhotoCamera />}
                  onClick={triggerFileInput}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: -20,
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    py: 0.5
                  }}
                >
                  Upload
                </Button>
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
