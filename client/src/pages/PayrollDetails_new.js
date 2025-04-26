import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Visibility, 
  Print, 
  Search, 
  Add, 
  CloudDownload
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PayrollDetails = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [payslipDialogOpen, setPayslipDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    department: '',
    designation: '',
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    bankAccount: ''
  });

  useEffect(() => {
    // Fetch employees when component mounts
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/employees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Add mock salary data for display
        const employeesWithSalary = response.data.map(emp => ({
          ...emp,
          basicSalary: Math.floor(Math.random() * 5000) + 3000,
          allowances: Math.floor(Math.random() * 1000) + 500,
          deductions: Math.floor(Math.random() * 300) + 100,
          overtime: Math.floor(Math.random() * 20),
          bankAccount: `XX-XXXX-${Math.floor(Math.random() * 10000)}`
        }));
        
        setEmployees(employeesWithSalary);
        setFilteredEmployees(employeesWithSalary);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch employee data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);
  
  // Filter employees based on search term and department
  useEffect(() => {
    let filtered = employees;
    
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDepartment) {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }
    
    if (selectedEmployee) {
      filtered = filtered.filter(emp => emp.id === selectedEmployee);
    }
    
    setFilteredEmployees(filtered);
  }, [searchTerm, selectedDepartment, selectedEmployee, employees]);
  
  // Get unique departments for filtering
  const getDepartments = () => {
    const departments = new Set();
    employees.forEach(emp => {
      if (emp.department) departments.add(emp.department);
    });
    return Array.from(departments);
  };

  // Handle viewing employee details
  const handleViewEmployee = (employee) => {
    setCurrentEmployee(employee);
    setViewDialogOpen(true);
  };

  // Handle editing employee
  const handleEditEmployee = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      id: employee.id,
      name: employee.name,
      department: employee.department,
      designation: employee.designation,
      basicSalary: employee.basicSalary,
      allowances: employee.allowances,
      deductions: employee.deductions,
      bankAccount: employee.bankAccount
    });
    setEditDialogOpen(true);
  };

  // Handle deleting employee
  const handleDeleteEmployee = (employee) => {
    setCurrentEmployee(employee);
    setDeleteDialogOpen(true);
  };

  // Handle showing pay slip
  const handleShowPayslip = (employee) => {
    setCurrentEmployee(employee);
    setPayslipDialogOpen(true);
  };

  // Handle adding new employee
  const handleAddEmployee = () => {
    setFormData({
      id: '',
      name: '',
      department: '',
      designation: '',
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
      bankAccount: ''
    });
    setAddDialogOpen(true);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'basicSalary' || name === 'allowances' || name === 'deductions' 
        ? parseFloat(value) 
        : value
    }));
  };

  // Handle save (edit or add)
  const handleSaveEmployee = async () => {
    try {
      // In a real app, you would save to the backend here
      if (formData.id) {
        // Editing existing employee
        const updatedEmployees = employees.map(emp => 
          emp.id === formData.id ? { ...emp, ...formData } : emp
        );
        setEmployees(updatedEmployees);
        setEditDialogOpen(false);
      } else {
        // Adding new employee
        const newEmployee = {
          ...formData,
          id: `EMP${Date.now().toString().substr(-6)}`, // Generate a temporary ID
        };
        setEmployees(prev => [...prev, newEmployee]);
        setAddDialogOpen(false);
      }
    } catch (err) {
      console.error('Error saving employee data:', err);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    // In a real app, you would delete from the backend here
    const updatedEmployees = employees.filter(emp => emp.id !== currentEmployee.id);
    setEmployees(updatedEmployees);
    setDeleteDialogOpen(false);
  };

  // Calculate net salary
  const calculateNetSalary = (employee) => {
    return employee.basicSalary + employee.allowances - employee.deductions;
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle department filter
  const handleDepartmentFilter = (e) => {
    setSelectedDepartment(e.target.value);
  };

  // Handle employee filter
  const handleEmployeeFilter = (e) => {
    setSelectedEmployee(e.target.value);
  };

  // Close all dialogs
  const handleCloseDialogs = () => {
    setViewDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setPayslipDialogOpen(false);
    setAddDialogOpen(false);
    setCurrentEmployee(null);
  };
  
  // Calculate payroll summary statistics
  const calculateSummary = () => {
    if (!filteredEmployees.length) return { total: 0, average: 0, highest: 0, lowest: 0 };
    
    const netSalaries = filteredEmployees.map(emp => calculateNetSalary(emp));
    return {
      total: netSalaries.reduce((sum, salary) => sum + salary, 0),
      average: netSalaries.reduce((sum, salary) => sum + salary, 0) / netSalaries.length,
      highest: Math.max(...netSalaries),
      lowest: Math.min(...netSalaries)
    };
  };

  const summary = calculateSummary();

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading payroll data...</Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
        Payroll Details
      </Typography>
      
      {/* Filters and controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search by name or ID"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={handleDepartmentFilter}
                label="Department"
              >
                <MenuItem value="">All Departments</MenuItem>
                {getDepartments().map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedEmployee}
                onChange={handleEmployeeFilter}
                label="Employee"
              >
                <MenuItem value="">All Employees</MenuItem>
                {employees.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddEmployee}
              size="large"
            >
              Add Employee
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Salary</Typography>
              <Typography variant="h5">${summary.total.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Average Salary</Typography>
              <Typography variant="h5">${summary.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Highest Salary</Typography>
              <Typography variant="h5">${summary.highest.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Lowest Salary</Typography>
              <Typography variant="h5">${summary.lowest.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Employees table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Basic Salary</TableCell>
                <TableCell>Allowances</TableCell>
                <TableCell>Deductions</TableCell>
                <TableCell>Net Salary</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => {
                  const netSalary = calculateNetSalary(employee);
                  return (
                    <TableRow key={employee.id} hover>
                      <TableCell>{employee.id}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>
                        <Chip label={employee.department} size="small" />
                      </TableCell>
                      <TableCell>${employee.basicSalary.toLocaleString()}</TableCell>
                      <TableCell>${employee.allowances.toLocaleString()}</TableCell>
                      <TableCell>${employee.deductions.toLocaleString()}</TableCell>
                      <TableCell>${netSalary.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewEmployee(employee)}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleEditEmployee(employee)}
                          title="Edit"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteEmployee(employee)}
                          title="Delete"
                        >
                          <Delete />
                        </IconButton>
                        <IconButton
                          color="success"
                          onClick={() => handleShowPayslip(employee)}
                          title="View Pay Slip"
                        >
                          <Print />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No employees found matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Employee Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent dividers>
          {currentEmployee && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">ID</Typography>
                <Typography variant="body1" gutterBottom>{currentEmployee.id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Name</Typography>
                <Typography variant="body1" gutterBottom>{currentEmployee.name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Department</Typography>
                <Typography variant="body1" gutterBottom>{currentEmployee.department}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Designation</Typography>
                <Typography variant="body1" gutterBottom>{currentEmployee.designation}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Salary Information</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Basic Salary</Typography>
                <Typography variant="body1" gutterBottom>
                  ${currentEmployee.basicSalary.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Allowances</Typography>
                <Typography variant="body1" gutterBottom>
                  ${currentEmployee.allowances.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Deductions</Typography>
                <Typography variant="body1" gutterBottom>
                  ${currentEmployee.deductions.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Net Salary</Typography>
                <Typography variant="body1" gutterBottom>
                  ${calculateNetSalary(currentEmployee).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Bank Account</Typography>
                <Typography variant="body1" gutterBottom>{currentEmployee.bankAccount}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Bank Account"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Salary Information</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Basic Salary"
                name="basicSalary"
                type="number"
                value={formData.basicSalary}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Allowances"
                name="allowances"
                type="number"
                value={formData.allowances}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Deductions"
                name="deductions"
                type="number"
                value={formData.deductions}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleSaveEmployee} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Bank Account"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Salary Information</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Basic Salary"
                name="basicSalary"
                type="number"
                value={formData.basicSalary}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                InputProps={{ startAdornment: '$' }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Allowances"
                name="allowances"
                type="number"
                value={formData.allowances}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Deductions"
                name="deductions"
                type="number"
                value={formData.deductions}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleSaveEmployee} variant="contained" color="primary">
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete employee: <strong>{currentEmployee?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pay Slip Dialog */}
      <Dialog open={payslipDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Pay Slip</Typography>
            <Button
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={() => alert('Download functionality would be implemented here')}
            >
              Download
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {currentEmployee && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" gutterBottom>JUNIOR JOY HR PRO</Typography>
                <Typography variant="subtitle1">Employee Pay Slip</Typography>
                <Typography variant="body2">For the month of {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Typography>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Employee ID</Typography>
                  <Typography variant="body1" gutterBottom>{currentEmployee.id}</Typography>
                  
                  <Typography variant="subtitle2">Employee Name</Typography>
                  <Typography variant="body1" gutterBottom>{currentEmployee.name}</Typography>
                  
                  <Typography variant="subtitle2">Department</Typography>
                  <Typography variant="body1" gutterBottom>{currentEmployee.department}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Designation</Typography>
                  <Typography variant="body1" gutterBottom>{currentEmployee.designation}</Typography>
                  
                  <Typography variant="subtitle2">Bank Account</Typography>
                  <Typography variant="body1" gutterBottom>{currentEmployee.bankAccount}</Typography>
                  
                  <Typography variant="subtitle2">Payment Date</Typography>
                  <Typography variant="body1" gutterBottom>{new Date().toLocaleDateString()}</Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Earnings</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Basic Salary</Typography>
                    <Typography>${currentEmployee.basicSalary.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Allowances</Typography>
                    <Typography>${currentEmployee.allowances.toLocaleString()}</Typography>
                  </Box>
                  {currentEmployee.overtime > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Overtime ({currentEmployee.overtime} hours)</Typography>
                      <Typography>${(currentEmployee.overtime * 25).toLocaleString()}</Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Deductions</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tax</Typography>
                    <Typography>${currentEmployee.deductions.toLocaleString()}</Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Net Salary</Typography>
                <Typography variant="h6">${calculateNetSalary(currentEmployee).toLocaleString()}</Typography>
              </Box>
              
              <Box sx={{ mt: 4, fontStyle: 'italic', textAlign: 'center' }}>
                <Typography variant="body2">This is a computer-generated pay slip and does not require a signature.</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Close</Button>
          <Button
            startIcon={<Print />}
            variant="contained"
            onClick={() => window.print()}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollDetails;
