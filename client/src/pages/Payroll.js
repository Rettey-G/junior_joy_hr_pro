import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs
} from '@mui/material';
import {
  AttachMoney,
  DateRange,
  People,
  Payments,
  CalendarMonth,
  AccountBalance,
  ArrowForward,
  Add,
  Edit,
  Delete,
  Print,
  Save,
  LocalAtm
} from '@mui/icons-material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

const Payroll = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payPeriods, setPayPeriods] = useState([]);
  const [currentPayPeriod, setCurrentPayPeriod] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [salaryData, setSalaryData] = useState({});
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [serviceChargeDialogOpen, setServiceChargeDialogOpen] = useState(false);
  const [serviceCharge, setServiceCharge] = useState({ usd: 0, mvr: 0 });
  
  // Current exchange rate MVR to USD (1 USD = 15.42 MVR)
  const exchangeRate = 15.42;
  
  // Mock pay periods for demonstration
  const mockPayPeriods = [
    { id: 'PP202504', name: 'April 2025', startDate: '2025-04-01', endDate: '2025-04-30', status: 'current' },
    { id: 'PP202503', name: 'March 2025', startDate: '2025-03-01', endDate: '2025-03-31', status: 'completed' },
    { id: 'PP202502', name: 'February 2025', startDate: '2025-02-01', endDate: '2025-02-28', status: 'completed' },
    { id: 'PP202501', name: 'January 2025', startDate: '2025-01-01', endDate: '2025-01-31', status: 'completed' },
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employees
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Load pay periods (mock data for demo)
        setPayPeriods(mockPayPeriods);
        setCurrentPayPeriod(mockPayPeriods[0].id);
        
        // Process employee data
        const employeeData = response.data;
        setEmployees(employeeData);
        
        // Extract departments
        const deptSet = new Set();
        employeeData.forEach(emp => {
          if (emp.department) deptSet.add(emp.department);
        });
        setDepartments(Array.from(deptSet));
        
        // Generate salary data with dual currency
        const salaryInfo = generateSalaryData(employeeData, mockPayPeriods[0]);
        setSalaryData(salaryInfo);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payroll data:', err);
        setError('Failed to load payroll data. Using demo data.');
        
        // Use demo data if API fails
        generateDemoData();
        setLoading(false);
      }
    };
    
    fetchData();
  }, [apiUrl]);
  
  // Generate salary data with dual currency support
  const generateSalaryData = (employees, payPeriod) => {
    if (!employees || !employees.length) return {};
    
    // Calculate salary data by department
    const departmentSalaries = {};
    // Department distribution data
    const deptData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#2196f3', '#f44336', '#4caf50', '#ff9800', 
          '#9c27b0', '#607d8b', '#e91e63', '#ffeb3b'
        ],
        borderWidth: 1,
      }],
    };
    
    // Total salary amounts
    let totalUSD = 0;
    let totalMVR = 0;
    
    // Process each employee
    employees.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      const usdSalary = Math.floor(Math.random() * 5000) + 3000;
      const mvrSalary = Math.round(usdSalary * exchangeRate);
      
      // Add to department totals
      if (!departmentSalaries[dept]) {
        departmentSalaries[dept] = { usd: 0, mvr: 0, count: 0 };
      }
      departmentSalaries[dept].usd += usdSalary;
      departmentSalaries[dept].mvr += mvrSalary;
      departmentSalaries[dept].count++;
      
      // Add to totals
      totalUSD += usdSalary;
      totalMVR += mvrSalary;
    });
    
    // Prepare chart data
    Object.keys(departmentSalaries).forEach(dept => {
      deptData.labels.push(dept);
      deptData.datasets[0].data.push(departmentSalaries[dept].usd);
    });
    
    // Prepare monthly trend data (mock for demo)
    const monthlyTrend = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Payroll (USD)',
        data: [150000, 155000, 158000, 162000, 165000, 168000],
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        tension: 0.4,
      }],
    };
    
    return {
      departmentSalaries,
      totalUSD,
      totalMVR,
      employeeCount: employees.length,
      deptChartData: deptData,
      trendChartData: monthlyTrend,
      perEmployeeAvgUSD: totalUSD / employees.length,
      perEmployeeAvgMVR: totalMVR / employees.length
    };
  };
  
  // Use demo data if API fails
  const generateDemoData = () => {
    // Set mock pay periods
    setPayPeriods(mockPayPeriods);
    setCurrentPayPeriod(mockPayPeriods[0].id);
    
    // Set mock departments
    setDepartments(['IT', 'HR', 'Finance', 'Marketing', 'Operations']);
    
    // Set mock salary data
    setSalaryData({
      departmentSalaries: {
        'IT': { usd: 45000, mvr: 693900, count: 10 },
        'HR': { usd: 25000, mvr: 385500, count: 5 },
        'Finance': { usd: 30000, mvr: 462600, count: 6 },
        'Marketing': { usd: 28000, mvr: 431760, count: 7 },
        'Operations': { usd: 42000, mvr: 647640, count: 12 }
      },
      totalUSD: 170000,
      totalMVR: 2621400,
      employeeCount: 40,
      deptChartData: {
        labels: ['IT', 'HR', 'Finance', 'Marketing', 'Operations'],
        datasets: [{
          data: [45000, 25000, 30000, 28000, 42000],
          backgroundColor: ['#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0'],
          borderWidth: 1,
        }],
      },
      trendChartData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Payroll (USD)',
          data: [150000, 155000, 158000, 162000, 165000, 168000],
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          tension: 0.4,
        }],
      },
      perEmployeeAvgUSD: 4250,
      perEmployeeAvgMVR: 65535
    });
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle pay period change
  const handlePayPeriodChange = (event) => {
    setCurrentPayPeriod(event.target.value);
  };
  
  // Handle service charge dialog
  const handleOpenServiceChargeDialog = () => {
    setServiceChargeDialogOpen(true);
  };
  
  const handleCloseServiceChargeDialog = () => {
    setServiceChargeDialogOpen(false);
  };
  
  const handleServiceChargeChange = (currency, value) => {
    setServiceCharge(prev => ({
      ...prev,
      [currency]: parseFloat(value) || 0
    }));
  };
  
  const handleApplyServiceCharge = () => {
    // In a real app, this would send the data to the backend
    // For demo, just show alert
    alert(`Service charge applied: $${serviceCharge.usd} USD / ${serviceCharge.mvr} MVR will be divided among all employees`);
    setServiceChargeDialogOpen(false);
  };
  
  // Go to payroll details
  const handleViewPayrollDetails = () => {
    navigate('/payroll-details');
  };
  
  // Check if loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading payroll data...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 0 }}>
          Payroll Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Pay Period</InputLabel>
            <Select
              value={currentPayPeriod}
              onChange={handlePayPeriodChange}
              label="Pay Period"
              startAdornment={<DateRange sx={{ mr: 1, ml: -0.5 }} />}
            >
              {payPeriods.map(period => (
                <MenuItem key={period.id} value={period.id}>
                  {period.name}
                  {period.status === 'current' && (
                    <Chip 
                      label="Current" 
                      color="primary" 
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleViewPayrollDetails}
            startIcon={<ArrowForward />}
          >
            View Details
          </Button>
        </Box>
      </Box>
      
      {/* Dashboard summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 1, display: 'flex' }}>
                  <AttachMoney sx={{ color: 'white' }} />
                </Box>
                <Box ml={2}>
                  <Typography variant="h5" fontWeight="bold">${salaryData.totalUSD?.toLocaleString()}</Typography>
                  <Typography variant="body2" color="textSecondary">Total USD Payroll</Typography>
                </Box>
              </Box>
            </CardContent>
            <Divider />
            <Box sx={{ p: 1, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" align="center">
                MVR {salaryData.totalMVR?.toLocaleString()}
              </Typography>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box sx={{ p: 1, bgcolor: '#4caf50', borderRadius: 1, display: 'flex' }}>
                  <People sx={{ color: 'white' }} />
                </Box>
                <Box ml={2}>
                  <Typography variant="h5" fontWeight="bold">{salaryData.employeeCount}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Employees</Typography>
                </Box>
              </Box>
            </CardContent>
            <Divider />
            <Box sx={{ p: 1, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" align="center">
                Across {departments.length} departments
              </Typography>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box sx={{ p: 1, bgcolor: '#f44336', borderRadius: 1, display: 'flex' }}>
                  <Payments sx={{ color: 'white' }} />
                </Box>
                <Box ml={2}>
                  <Typography variant="h5" fontWeight="bold">${salaryData.perEmployeeAvgUSD?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
                  <Typography variant="body2" color="textSecondary">Avg per Employee</Typography>
                </Box>
              </Box>
            </CardContent>
            <Divider />
            <Box sx={{ p: 1, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" align="center">
                MVR {salaryData.perEmployeeAvgMVR?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Typography>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box sx={{ p: 1, bgcolor: '#ff9800', borderRadius: 1, display: 'flex' }}>
                  <CalendarMonth sx={{ color: 'white' }} />
                </Box>
                <Box ml={2}>
                  <Typography variant="h5" fontWeight="bold">
                    {payPeriods.find(p => p.id === currentPayPeriod)?.name || 'Current'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Pay Period</Typography>
                </Box>
              </Box>
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                size="small" 
                color="primary" 
                onClick={handleOpenServiceChargeDialog}
                startIcon={<LocalAtm />}
                fullWidth
              >
                Add Service Charge
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Department Overview" />
          <Tab label="Payroll Trend" />
          <Tab label="Department Breakdown" />
        </Tabs>
        
        {/* Department overview tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Department Salary Distribution (USD)</Typography>
                <Box height={300} display="flex" alignItems="center" justifyContent="center">
                  <Pie data={salaryData.deptChartData} />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Department Details</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell align="right">Employees</TableCell>
                        <TableCell align="right">USD Total</TableCell>
                        <TableCell align="right">MVR Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salaryData.departmentSalaries && Object.entries(salaryData.departmentSalaries).map(([dept, data]) => (
                        <TableRow key={dept}>
                          <TableCell>{dept}</TableCell>
                          <TableCell align="right">{data.count}</TableCell>
                          <TableCell align="right">${data.usd.toLocaleString()}</TableCell>
                          <TableCell align="right">{data.mvr.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Payroll trend tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Payroll Trend (Last 6 Months)</Typography>
            <Box height={400} width="100%">
              <Line 
                data={salaryData.trendChartData} 
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Amount (USD)'
                      }
                    }
                  }
                }}
              />
            </Box>
          </Box>
        )}
        
        {/* Department breakdown tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Department Salary Comparison</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Employees</TableCell>
                    <TableCell align="right">Total USD</TableCell>
                    <TableCell align="right">Total MVR</TableCell>
                    <TableCell align="right">Avg USD/Employee</TableCell>
                    <TableCell align="right">Avg MVR/Employee</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaryData.departmentSalaries && Object.entries(salaryData.departmentSalaries).map(([dept, data]) => (
                    <TableRow key={dept}>
                      <TableCell>{dept}</TableCell>
                      <TableCell align="right">{data.count}</TableCell>
                      <TableCell align="right">${data.usd.toLocaleString()}</TableCell>
                      <TableCell align="right">{data.mvr.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        ${(data.usd / data.count).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell align="right">
                        {(data.mvr / data.count).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{salaryData.employeeCount}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>${salaryData.totalUSD?.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{salaryData.totalMVR?.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ${salaryData.perEmployeeAvgUSD?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {salaryData.perEmployeeAvgMVR?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
      
      {/* Call to action */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          size="large"
          onClick={handleViewPayrollDetails}
          startIcon={<ArrowForward />}
          sx={{ px: 4, py: 1.5 }}
        >
          View Detailed Payroll
        </Button>
      </Box>
      
      {/* Service Charge Dialog */}
      <Dialog open={serviceChargeDialogOpen} onClose={handleCloseServiceChargeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Service Charge</DialogTitle>
        <DialogContent dividers>
          <Typography paragraph>
            The service charge will be divided equally among all employees and added to their salary.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="USD Amount"
                type="number"
                value={serviceCharge.usd}
                onChange={(e) => handleServiceChargeChange('usd', e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="MVR Amount"
                type="number"
                value={serviceCharge.mvr}
                onChange={(e) => handleServiceChargeChange('mvr', e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">MVR</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                Per Employee: ${(serviceCharge.usd / salaryData.employeeCount).toFixed(2)} USD / 
                {(serviceCharge.mvr / salaryData.employeeCount).toFixed(2)} MVR
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseServiceChargeDialog}>Cancel</Button>
          <Button 
            onClick={handleApplyServiceCharge} 
            variant="contained" 
            color="primary"
            startIcon={<Save />}
          >
            Apply Service Charge
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Payroll;
