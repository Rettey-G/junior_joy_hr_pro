import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, MenuItem, FormControl, InputLabel, Select,
  Card, CardContent, Divider, CircularProgress, Alert
} from '@mui/material';
import api from '../services/api';

const PayrollDetails = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  // Fetch employees data
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
      applyFilters(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to employees
  const applyFilters = (employeeData) => {
    let filtered = [...employeeData];
    
    if (filters.department) {
      filtered = filtered.filter(emp => emp.department === filters.department);
    }
    
    setFilteredEmployees(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      applyFilters(employees, newFilters);
      return newFilters;
    });
  };

  // Initialize
  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate payroll details
  const calculatePayroll = (employee) => {
    const basicSalary = employee.salaryUSD || 0;
    const hra = basicSalary * 0.25; // Housing allowance as 25% of basic
    const ta = basicSalary * 0.1; // Transport allowance as 10% of basic
    const otherAllowances = basicSalary * 0.15; // Other allowances as 15% of basic
    
    // Deductions
    const incomeTax = basicSalary * 0.12; // Income tax as 12% of basic
    const providentFund = basicSalary * 0.05; // PF as 5% of basic
    const otherDeductions = basicSalary * 0.03; // Other deductions as 3% of basic
    
    // Totals
    const totalEarnings = basicSalary + hra + ta + otherAllowances;
    const totalDeductions = incomeTax + providentFund + otherDeductions;
    const netPay = totalEarnings - totalDeductions;
    
    return {
      basicSalary,
      hra,
      ta,
      otherAllowances,
      totalEarnings,
      incomeTax,
      providentFund,
      otherDeductions,
      totalDeductions,
      netPay
    };
  };

  // Get unique departments for filtering
  const departments = [...new Set(employees.map(emp => emp.department))];
  
  // Date options for payroll period
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];
  
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Calculate payroll summary statistics
  const calculateSummary = () => {
    if (!filteredEmployees.length) return { totalEmployees: 0, totalSalary: 0, avgSalary: 0 };
    
    const totalEmployees = filteredEmployees.length;
    const totalSalary = filteredEmployees.reduce((sum, emp) => sum + (emp.salaryUSD || 0), 0);
    const avgSalary = totalSalary / totalEmployees;
    
    return { totalEmployees, totalSalary, avgSalary };
  };
  
  const summary = calculateSummary();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Payroll Details</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={filters.department}
                label="Department"
                onChange={handleFilterChange}
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
              <InputLabel>Month</InputLabel>
              <Select
                name="month"
                value={filters.month}
                label="Month"
                onChange={handleFilterChange}
              >
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                name="year"
                value={filters.year}
                label="Year"
                onChange={handleFilterChange}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={() => fetchEmployees()}
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Employees
              </Typography>
              <Typography variant="h4">
                {summary.totalEmployees}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Salary (USD)
              </Typography>
              <Typography variant="h4">
                ${summary.totalSalary.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Average Salary (USD)
              </Typography>
              <Typography variant="h4">
                ${summary.avgSalary.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Payroll Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Payroll for {months.find(m => m.value === filters.month)?.label} {filters.year}
        </Typography>
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="payroll table">
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Basic Salary (USD)</TableCell>
                  <TableCell>HRA</TableCell>
                  <TableCell>TA</TableCell>
                  <TableCell>Other Allowances</TableCell>
                  <TableCell>Total Earnings</TableCell>
                  <TableCell>Income Tax</TableCell>
                  <TableCell>PF</TableCell>
                  <TableCell>Other Deductions</TableCell>
                  <TableCell>Total Deductions</TableCell>
                  <TableCell>Net Pay (USD)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const payroll = calculatePayroll(employee);
                  return (
                    <TableRow key={employee._id}>
                      <TableCell>{employee.empNo}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>${payroll.basicSalary.toFixed(2)}</TableCell>
                      <TableCell>${payroll.hra.toFixed(2)}</TableCell>
                      <TableCell>${payroll.ta.toFixed(2)}</TableCell>
                      <TableCell>${payroll.otherAllowances.toFixed(2)}</TableCell>
                      <TableCell>${payroll.totalEarnings.toFixed(2)}</TableCell>
                      <TableCell>${payroll.incomeTax.toFixed(2)}</TableCell>
                      <TableCell>${payroll.providentFund.toFixed(2)}</TableCell>
                      <TableCell>${payroll.otherDeductions.toFixed(2)}</TableCell>
                      <TableCell>${payroll.totalDeductions.toFixed(2)}</TableCell>
                      <TableCell>
                        <strong>${payroll.netPay.toFixed(2)}</strong>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Export Buttons */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined">Export to PDF</Button>
        <Button variant="outlined">Export to Excel</Button>
      </Box>
    </Box>
  );
};

export default PayrollDetails;
