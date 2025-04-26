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
  Divider,
  Tooltip,
  Stack
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Visibility, 
  Print, 
  Search, 
  Add, 
  CloudDownload,
  AttachMoney,
  People,
  AccountBalance,
  LocalAtm
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Component for summary cards
const SummaryCard = ({ title, value, icon }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
          {title}
        </Typography>
        <Box sx={{ backgroundColor: 'primary.light', borderRadius: '50%', p: 1, opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const PayrollDetails = () => {
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
  
  // Exchange rate (1 USD = 15.42 MVR)
  const exchangeRate = 15.42;
  
  // Form state for editing with dual currency support
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    department: '',
    designation: '',
    // USD amounts
    basicSalaryUSD: 0,
    allowancesUSD: 0,
    deductionsUSD: 0,
    // MVR amounts
    basicSalaryMVR: 0,
    allowancesMVR: 0,
    deductionsMVR: 0,
    // Banking details
    bankAccountUSD: '',
    bankAccountMVR: '',
    // Service charge
    serviceChargeUSD: 0,
    serviceChargeMVR: 0
  });
  
  // Add state for service charge dialog
  const [serviceChargeDialogOpen, setServiceChargeDialogOpen] = useState(false);
  const [serviceCharge, setServiceCharge] = useState({ usd: 0, mvr: 0 });

  useEffect(() => {
    // Fetch employees when component mounts
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/employees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Use fixed salary data for consistent display with dual currency
        const employeesWithSalary = response.data.map((emp, index) => {
          // Use simplified ID format instead of UUIDs
          const empId = emp.id && emp.id.length > 10 ? `EMP-${100 + index}` : emp.id;
          
          // Generate fixed USD values to ensure consistency
          const basicSalaryUSD = 3000 + (index * 300);
          const allowancesUSD = 500 + (index * 50);
          const deductionsUSD = 100 + (index * 10);
          const overtimeUSD = (index % 5) * 25; // Overtime hours * hourly rate
          const serviceChargeUSD = 100 + (index * 10);
          
          // Calculate MVR values based on exchange rate
          const basicSalaryMVR = Math.round(basicSalaryUSD * exchangeRate);
          const allowancesMVR = Math.round(allowancesUSD * exchangeRate);
          const deductionsMVR = Math.round(deductionsUSD * exchangeRate);
          const overtimeMVR = Math.round(overtimeUSD * exchangeRate);
          const serviceChargeMVR = Math.round(serviceChargeUSD * exchangeRate);
          
          return {
            ...emp,
            id: empId, // Use simpler ID format
            // USD amounts
            basicSalaryUSD,
            allowancesUSD,
            deductionsUSD,
            overtimeUSD,
            serviceChargeUSD,
            // MVR amounts
            basicSalaryMVR,
            allowancesMVR,
            deductionsMVR,
            overtimeMVR,
            serviceChargeMVR,
            // For backward compatibility
            basicSalary: basicSalaryUSD,
            allowances: allowancesUSD,
            deductions: deductionsUSD,
            overtime: Math.floor(Math.random() * 20),
            // Banking details
            bankAccountUSD: `USD-XXXX-${100 + index}`,
            bankAccountMVR: `MVR-XXXX-${100 + index}`,
            bankAccount: `XX-XXXX-${100 + index}`
          };
        });
        
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

  // Calculate net salary for an employee
  const calculateNetSalary = (employee, currency = 'USD') => {
    if (currency === 'USD') {
      return (employee.basicSalaryUSD || 0) + 
        (employee.allowancesUSD || 0) + 
        (employee.serviceChargeUSD || 0) - 
        (employee.deductionsUSD || 0);
    } else {
      return (employee.basicSalaryMVR || 0) + 
        (employee.allowancesMVR || 0) + 
        (employee.serviceChargeMVR || 0) - 
        (employee.deductionsMVR || 0);
    }
  };
  
  // Calculate payroll summary statistics
  const calculateSummary = () => {
    if (!filteredEmployees.length) {
      return {
        totalEmployees: 0,
        totalSalaryUSD: 0,
        totalAllowancesUSD: 0,
        totalDeductionsUSD: 0,
        totalServiceChargeUSD: 0,
        netPayrollUSD: 0,
        totalSalaryMVR: 0,
        totalAllowancesMVR: 0,
        totalDeductionsMVR: 0,
        totalServiceChargeMVR: 0,
        netPayrollMVR: 0
      };
    }
    
    const totalEmployees = filteredEmployees.length;
  
    // USD Totals
    const totalSalaryUSD = filteredEmployees.reduce((sum, emp) => sum + (emp.basicSalaryUSD || 0), 0);
    const totalAllowancesUSD = filteredEmployees.reduce((sum, emp) => sum + (emp.allowancesUSD || 0), 0);
    const totalDeductionsUSD = filteredEmployees.reduce((sum, emp) => sum + (emp.deductionsUSD || 0), 0);
    const totalServiceChargeUSD = filteredEmployees.reduce((sum, emp) => sum + (emp.serviceChargeUSD || 0), 0);
    const netPayrollUSD = totalSalaryUSD + totalAllowancesUSD + totalServiceChargeUSD - totalDeductionsUSD;
  
    // MVR Totals
    const totalSalaryMVR = filteredEmployees.reduce((sum, emp) => sum + (emp.basicSalaryMVR || 0), 0);
    const totalAllowancesMVR = filteredEmployees.reduce((sum, emp) => sum + (emp.allowancesMVR || 0), 0);
    const totalDeductionsMVR = filteredEmployees.reduce((sum, emp) => sum + (emp.deductionsMVR || 0), 0);
    const totalServiceChargeMVR = filteredEmployees.reduce((sum, emp) => sum + (emp.serviceChargeMVR || 0), 0);
    const netPayrollMVR = totalSalaryMVR + totalAllowancesMVR + totalServiceChargeMVR - totalDeductionsMVR;

    return {
      totalEmployees,
      totalSalaryUSD,
      totalAllowancesUSD,
      totalDeductionsUSD,
      totalServiceChargeUSD,
      netPayrollUSD,
      totalSalaryMVR,
      totalAllowancesMVR,
      totalDeductionsMVR,
      totalServiceChargeMVR,
      netPayrollMVR
    };
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle department filter change
  const handleDepartmentFilter = (e) => {
    setSelectedDepartment(e.target.value);
  };
  
  // Handle employee filter change
  const handleEmployeeFilter = (e) => {
    setSelectedEmployee(e.target.value);
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
      // USD amounts
      basicSalaryUSD: employee.basicSalaryUSD || 0,
      allowancesUSD: employee.allowancesUSD || 0,
      deductionsUSD: employee.deductionsUSD || 0,
      serviceChargeUSD: employee.serviceChargeUSD || 0,
      // MVR amounts
      basicSalaryMVR: employee.basicSalaryMVR || 0,
      allowancesMVR: employee.allowancesMVR || 0,
      deductionsMVR: employee.deductionsMVR || 0,
      serviceChargeMVR: employee.serviceChargeMVR || 0,
      // Banking details
      bankAccountUSD: employee.bankAccountUSD || '',
      bankAccountMVR: employee.bankAccountMVR || ''
    });
    setEditDialogOpen(true);
  };

  // Handle form input change with currency conversion
  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    
    // If changing a USD value, also update the MVR value
    if (name.endsWith('USD')) {
      const mvrName = name.replace('USD', 'MVR');
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
        [mvrName]: Math.round((parseFloat(value) || 0) * exchangeRate)
      });
    } 
    // If changing an MVR value, also update the USD value
    else if (name.endsWith('MVR')) {
      const usdName = name.replace('MVR', 'USD');
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
        [usdName]: Math.round((parseFloat(value) || 0) / exchangeRate * 100) / 100
      });
    }
    // For other fields
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle adding a new employee
  const handleAddEmployee = () => {
    setCurrentEmployee(null);
    setFormData({
      id: `EMP-${Math.floor(Math.random() * 10000)}`,
      name: '',
      department: '',
      designation: '',
      basicSalaryUSD: 0,
      allowancesUSD: 0,
      deductionsUSD: 0,
      serviceChargeUSD: 0,
      basicSalaryMVR: 0,
      allowancesMVR: 0,
      deductionsMVR: 0,
      serviceChargeMVR: 0,
      bankAccountUSD: '',
      bankAccountMVR: ''
    });
    setAddDialogOpen(true);
  };

  // Save edited employee data
  const handleSaveEdit = () => {
    const updatedEmployees = employees.map(emp => 
      emp.id === formData.id ? { ...emp, ...formData } : emp
    );
    
    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees);
    setEditDialogOpen(false);
  };

  // Save new employee data
  const handleSaveAdd = () => {
    const newEmployee = { ...formData };
    const updatedEmployees = [...employees, newEmployee];
    
    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees);
    setAddDialogOpen(false);
  };

  // Handle delete employee
  const handleDeleteEmployee = (employee) => {
    setCurrentEmployee(employee);
    setDeleteDialogOpen(true);
  };

  // Confirm delete employee
  const handleConfirmDelete = () => {
    const updatedEmployees = employees.filter(emp => emp.id !== currentEmployee.id);
    
    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees);
    setDeleteDialogOpen(false);
  };

  // View payslip
  const handleViewPayslip = (employee) => {
    setCurrentEmployee(employee);
    setPayslipDialogOpen(true);
  };
  
  // Open service charge dialog
  const handleOpenServiceChargeDialog = () => {
    setServiceChargeDialogOpen(true);
  };

  // Handle service charge distribution
  const handleServiceChargeDistribution = () => {
    if (!employees.length) return;

    const serviceChargePerEmployeeUSD = serviceCharge.usd / employees.length;
    const serviceChargePerEmployeeMVR = serviceCharge.mvr / employees.length;

    // Update all employees with their share of service charge
    const updatedEmployees = employees.map(emp => ({
      ...emp,
      serviceChargeUSD: serviceChargePerEmployeeUSD,
      serviceChargeMVR: serviceChargePerEmployeeMVR
    }));

    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees);
    setServiceChargeDialogOpen(false);
  };

  // Handle service charge input change
  const handleServiceChargeChange = (e) => {
    const { name, value } = e.target;
    if (name === 'usd') {
      setServiceCharge({
        usd: parseFloat(value) || 0,
        mvr: Math.round((parseFloat(value) || 0) * exchangeRate)
      });
    } else {
      setServiceCharge({
        mvr: parseFloat(value) || 0,
        usd: Math.round((parseFloat(value) || 0) / exchangeRate * 100) / 100
      });
    }
  };
  
  // Handle closing all dialogs
  const handleCloseDialogs = () => {
    setViewDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setPayslipDialogOpen(false);
    setAddDialogOpen(false);
    setServiceChargeDialogOpen(false);
  };
  
  // Format currency values
  const formatCurrency = (value, currency = 'USD') => {
    if (currency === 'USD') {
      return `$${value.toFixed(2)}`;
    } else {
      return `MVR ${value.toFixed(2)}`;
    }
  };
  
  // Get summary data
  const summary = calculateSummary();
  const sortedEmployees = [...filteredEmployees].sort((a, b) => a.name?.localeCompare(b.name));

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
      
      {/* Filter section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Search & Filter
          </Typography>
          <Divider />
        </Box>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search by ID, Name or Department"
              placeholder="Type to search..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
                '& .MuiInputBase-input': {
                  padding: '14px 14px',
                  fontSize: '1rem',
                }
              }}
              InputProps={{
                startAdornment: <Search color="primary" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={handleDepartmentFilter}
                label="Department"
                sx={{ 
                  borderRadius: 2,
                  minWidth: '250px'
                }}
                MenuProps={{ PaperProps: { style: { maxHeight: 300, width: 400 } } }}
              >
                <MenuItem value="">All Departments</MenuItem>
                {getDepartments().map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedEmployee}
                onChange={handleEmployeeFilter}
                label="Employee"
                sx={{ 
                  borderRadius: 2,
                  minWidth: '250px',
                  '& .MuiSelect-select': {
                    padding: '14px 14px',
                    fontSize: '1rem',
                    whiteSpace: 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }}
                MenuProps={{ PaperProps: { style: { maxHeight: 300, width: 400 } } }}
              >
                <MenuItem value="">All Employees</MenuItem>
                {employees.map(emp => (
                  <MenuItem key={emp.id || emp.empNo} value={emp.id || emp.empNo} sx={{ whiteSpace: 'normal' }}>{emp.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, flexWrap: 'wrap', gap: 1 }}>
          <Button 
            variant="outlined" 
            color="secondary"
            startIcon={<CloudDownload />} 
            onClick={() => console.log('Export payroll')}
            sx={{ borderRadius: 2 }}
          >
            Export
          </Button>
              
          <Box>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => setServiceChargeDialogOpen(true)}
              sx={{ mr: 1, borderRadius: 2 }}
            >
              Service Charge
            </Button>
                
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />} 
              onClick={handleAddEmployee}
              sx={{ borderRadius: 2 }}
            >
              Add Employee
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Employees" 
            value={summary.totalEmployees}
            icon={<People fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Salary" 
            value={
              <Box>
                <Typography variant="body2">{formatCurrency(summary.totalSalaryUSD)}</Typography>
                <Typography variant="body2" color="text.secondary">{formatCurrency(summary.totalSalaryMVR, 'MVR')}</Typography>
              </Box>
            }
            icon={<AttachMoney fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Allowances" 
            value={
              <Box>
                <Typography variant="body2">{formatCurrency(summary.totalAllowancesUSD)}</Typography>
                <Typography variant="body2" color="text.secondary">{formatCurrency(summary.totalAllowancesMVR, 'MVR')}</Typography>
              </Box>
            }
            icon={<AccountBalance fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Net Payroll" 
            value={
              <Box>
                <Typography variant="body2">{formatCurrency(summary.netPayrollUSD)}</Typography>
                <Typography variant="body2" color="text.secondary">{formatCurrency(summary.netPayrollMVR, 'MVR')}</Typography>
              </Box>
            }
            icon={<AttachMoney fontSize="small" />}
          />
        </Grid>
      </Grid>

      {/* Payroll Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, mb: 3 }}>
        <Table aria-label="payroll table">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Basic Salary (USD)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Basic Salary (MVR)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Allowances (USD)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Allowances (MVR)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Deductions (USD)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Deductions (MVR)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Net Salary (USD)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Net Salary (MVR)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEmployees.map((employee) => {
              const netSalaryUSD = calculateNetSalary(employee, 'USD');
              const netSalaryMVR = calculateNetSalary(employee, 'MVR');
              
              return (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={employee.department || 'N/A'}
                      size="small"
                      sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}
                    />
                  </TableCell>
                  <TableCell>${employee.basicSalaryUSD?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>MVR {employee.basicSalaryMVR?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>${employee.allowancesUSD?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>MVR {employee.allowancesMVR?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>${employee.deductionsUSD?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>MVR {employee.deductionsMVR?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="success.main">
                      ${netSalaryUSD.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="success.main">
                      MVR {netSalaryMVR.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewEmployee(employee)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEditEmployee(employee)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteEmployee(employee)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Payslip">
                      <IconButton size="small" onClick={() => handleViewPayslip(employee)}>
                        <Print fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Employee Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent dividers>
          {currentEmployee && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Employee ID</Typography>
                <Typography variant="body1">{currentEmployee.id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                <Typography variant="body1">{currentEmployee.name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                <Typography variant="body1">{currentEmployee.department}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Designation</Typography>
                <Typography variant="body1">{currentEmployee.designation || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Salary Details</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                  <Typography variant="h6" gutterBottom>USD</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Basic Salary</Typography>
                      <Typography variant="body1">${currentEmployee.basicSalaryUSD?.toFixed(2) || '0.00'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Allowances</Typography>
                      <Typography variant="body1">${currentEmployee.allowancesUSD?.toFixed(2) || '0.00'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Deductions</Typography>
                      <Typography variant="body1">${currentEmployee.deductionsUSD?.toFixed(2) || '0.00'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Service Charge</Typography>
                      <Typography variant="body1">${currentEmployee.serviceChargeUSD?.toFixed(2) || '0.00'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight="bold">Net Salary</Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                          ${calculateNetSalary(currentEmployee, 'USD').toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Bank Account (USD)</Typography>
                      <Typography variant="body1">{currentEmployee.bankAccountUSD || 'Not provided'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                  <Typography variant="h6" gutterBottom>MVR</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Basic Salary</Typography>
                      <Typography variant="body1">MVR {currentEmployee.basicSalaryMVR?.toFixed(2) || '0.00'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Allowances</Typography>
                      <Typography variant="body1">MVR {currentEmployee.allowancesMVR?.toFixed(2) || '0.00'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Deductions</Typography>
                      <Typography variant="body1">MVR {currentEmployee.deductionsMVR?.toFixed(2) || '0.00'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Service Charge</Typography>
                      <Typography variant="body1">MVR {currentEmployee.serviceChargeMVR?.toFixed(2) || '0.00'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight="bold">Net Salary</Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                          MVR {calculateNetSalary(currentEmployee, 'MVR').toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Bank Account (MVR)</Typography>
                      <Typography variant="body1">{currentEmployee.bankAccountMVR || 'Not provided'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<Print />}
            onClick={() => {
              handleCloseDialogs();
              handleViewPayslip(currentEmployee);
            }}
          >
            View Payslip
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee ID"
                name="id"
                value={formData.id}
                disabled
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleFormInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleFormInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleFormInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Salary Details (USD)</Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Basic Salary (USD)"
                name="basicSalaryUSD"
                type="number"
                value={formData.basicSalaryUSD}
                onChange={handleFormInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Allowances (USD)"
                name="allowancesUSD"
                type="number"
                value={formData.allowancesUSD}
                onChange={handleFormInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Deductions (USD)"
                name="deductionsUSD"
                type="number"
                value={formData.deductionsUSD}
                onChange={handleFormInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Account (USD)"
                name="bankAccountUSD"
                value={formData.bankAccountUSD}
                onChange={handleFormInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Salary Details (MVR)</Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Basic Salary (MVR)"
                name="basicSalaryMVR"
                type="number"
                value={formData.basicSalaryMVR}
                onChange={handleFormInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>MVR</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Allowances (MVR)"
                name="allowancesMVR"
                type="number"
                value={formData.allowancesMVR}
                onChange={handleFormInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>MVR</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Deductions (MVR)"
                name="deductionsMVR"
                type="number"
                value={formData.deductionsMVR}
                onChange={handleFormInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>MVR</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Account (MVR)"
                name="bankAccountMVR"
                value={formData.bankAccountMVR}
                onChange={handleFormInputChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee ID"
                name="id"
                value={formData.id}
                disabled
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleFormInputChange}
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
                onChange={handleFormInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleFormInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Salary Details (USD)</Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Basic Salary (USD)"
                name="basicSalaryUSD"
                type="number"
                value={formData.basicSalaryUSD}
                onChange={handleFormInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Allowances (USD)"
                name="allowancesUSD"
                type="number"
                value={formData.allowancesUSD}
                onChange={handleFormInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Deductions (USD)"
                name="deductionsUSD"
                type="number"
                value={formData.deductionsUSD}
                onChange={handleFormInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Account (USD)"
                name="bankAccountUSD"
                value={formData.bankAccountUSD}
                onChange={handleFormInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Salary Details (MVR)</Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Basic Salary (MVR)"
                name="basicSalaryMVR"
                type="number"
                value={formData.basicSalaryMVR}
                onChange={handleFormInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>MVR</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Allowances (MVR)"
                name="allowancesMVR"
                type="number"
                value={formData.allowancesMVR}
                onChange={handleFormInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>MVR</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Deductions (MVR)"
                name="deductionsMVR"
                type="number"
                value={formData.deductionsMVR}
                onChange={handleFormInputChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>MVR</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Account (MVR)"
                name="bankAccountMVR"
                value={formData.bankAccountMVR}
                onChange={handleFormInputChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleSaveAdd} variant="contained" color="primary">Add Employee</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialogs} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete employee {currentEmployee?.name} ({currentEmployee?.id})?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Service Charge Distribution Dialog */}
      <Dialog open={serviceChargeDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Service Charge Distribution</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }} color="textSecondary">
            Enter the total service charge to be distributed equally among {employees.length} employees.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Service Charge (USD)"
                name="usd"
                type="number"
                value={serviceCharge.usd}
                onChange={handleServiceChargeChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Service Charge (MVR)"
                name="mvr"
                type="number"
                value={serviceCharge.mvr}
                onChange={handleServiceChargeChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>MVR</Typography>
                }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Distribution Summary:</Typography>
            <Typography variant="body2">
              Each employee will receive: ${(serviceCharge.usd / employees.length).toFixed(2)} / 
              MVR {(serviceCharge.mvr / employees.length).toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleServiceChargeDistribution} variant="contained" color="primary">Distribute</Button>
        </DialogActions>
      </Dialog>

      {/* Pay Slip Dialog */}
      <Dialog open={payslipDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Pay Slip</Typography>
            <Button
              variant="outlined" 
              startIcon={<Print />}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {currentEmployee && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Junior Joy HR Pro
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Pay Slip for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{currentEmployee.name}</Typography>
                  <Typography variant="body2">{currentEmployee.designation}</Typography>
                  <Typography variant="body2">{currentEmployee.department}</Typography>
                </Grid>
                <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="subtitle2" color="textSecondary">Employee ID</Typography>
                  <Typography variant="body1">{currentEmployee.id}</Typography>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>Pay Period</Typography>
                  <Typography variant="body1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>USD</Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Basic Salary</TableCell>
                          <TableCell align="right">${currentEmployee.basicSalaryUSD?.toFixed(2) || '0.00'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Allowances</TableCell>
                          <TableCell align="right">${currentEmployee.allowancesUSD?.toFixed(2) || '0.00'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Service Charge</TableCell>
                          <TableCell align="right">${currentEmployee.serviceChargeUSD?.toFixed(2) || '0.00'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Deductions</TableCell>
                          <TableCell align="right">-${currentEmployee.deductionsUSD?.toFixed(2) || '0.00'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Net Salary</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ${calculateNetSalary(currentEmployee, 'USD').toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">Bank Account (USD)</Typography>
                      <Typography variant="body2">{currentEmployee.bankAccountUSD || 'Not provided'}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>MVR</Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Basic Salary</TableCell>
                          <TableCell align="right">MVR {currentEmployee.basicSalaryMVR?.toFixed(2) || '0.00'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Allowances</TableCell>
                          <TableCell align="right">MVR {currentEmployee.allowancesMVR?.toFixed(2) || '0.00'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Service Charge</TableCell>
                          <TableCell align="right">MVR {currentEmployee.serviceChargeMVR?.toFixed(2) || '0.00'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Deductions</TableCell>
                          <TableCell align="right">-MVR {currentEmployee.deductionsMVR?.toFixed(2) || '0.00'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Net Salary</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            MVR {calculateNetSalary(currentEmployee, 'MVR').toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">Bank Account (MVR)</Typography>
                      <Typography variant="body2">{currentEmployee.bankAccountMVR || 'Not provided'}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  This is a computer-generated document. No signature is required.
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Junior Joy HR Pro - Happy Teams, Smarter HR
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollDetails;




