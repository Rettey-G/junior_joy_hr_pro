import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Divider, 
  Card, 
  CardContent, 
  ButtonGroup, 
  Button,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Alert,
  alpha
} from '@mui/material';
import { 
  PeopleOutline, 
  AccessTime, 
  TrendingUp, 
  Business, 
  Public, 
  AttachMoney,
  Wc,
  Class,
  Assignment,
  EventNote
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [timePeriod, setTimePeriod] = useState('monthly');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${apiUrl}/api/analytics/latest`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setAnalyticsData(response.data);
          setLoading(false);
        } catch (apiError) {
          console.error('Error fetching analytics from API:', apiError);
          // If API fails, generate analytics from local data
          generateLocalAnalytics();
        }
      } catch (err) {
        console.error('Error in analytics dashboard:', err);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [apiUrl]);
  
  // Generate analytics from local employee data if API fails
  const generateLocalAnalytics = async () => {
    try {
      // Fetch employee data directly
      const token = localStorage.getItem('token');
      const employeeResponse = await axios.get(`${apiUrl}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const employeeData = employeeResponse.data;
      
      if (!employeeData || !employeeData.length) {
        throw new Error('No employee data available');
      }
      
      // Calculate total employees
      const totalEmployees = employeeData.length;
      const activeEmployees = employeeData.filter(emp => emp.active !== false).length;
      
      // Calculate gender distribution
      const genderDistribution = {
        male: employeeData.filter(emp => emp.gender === 'Male').length,
        female: employeeData.filter(emp => emp.gender === 'Female').length,
        other: employeeData.filter(emp => emp.gender !== 'Male' && emp.gender !== 'Female').length
      };
      
      // Calculate department distribution
      const deptMap = new Map();
      employeeData.forEach(emp => {
        if (emp.department) {
          const dept = emp.department;
          deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
        }
      });
      
      const departmentDistribution = Object.fromEntries(deptMap);
      
      // Calculate tenure metrics
      const now = new Date();
      const tenures = employeeData.map(emp => {
        const joinedDate = new Date(emp.joinedDate);
        return Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24)); // Tenure in days
      }).filter(tenure => !isNaN(tenure));
      
      const averageTenure = tenures.length > 0 
        ? tenures.reduce((sum, tenure) => sum + tenure, 0) / tenures.length 
        : 0;
      
      const tenureDistribution = {
        lessThanOneYear: tenures.filter(t => t < 365).length,
        oneToThreeYears: tenures.filter(t => t >= 365 && t < 3 * 365).length,
        threeToFiveYears: tenures.filter(t => t >= 3 * 365 && t < 5 * 365).length,
        moreThanFiveYears: tenures.filter(t => t >= 5 * 365).length
      };
      
      // Calculate nationality distribution
      const nationalityMap = new Map();
      employeeData.forEach(emp => {
        if (emp.nationality) {
          const nationality = emp.nationality;
          nationalityMap.set(nationality, (nationalityMap.get(nationality) || 0) + 1);
        }
      });
      
      const nationalityDistribution = Object.fromEntries(nationalityMap);
      
      // Create analytics object
      const localAnalytics = {
        totalEmployees,
        activeEmployees,
        newHires: Math.floor(totalEmployees * 0.05), // Dummy data (5% of total)
        separations: Math.floor(totalEmployees * 0.02), // Dummy data (2% of total)
        turnoverRate: 0.02, // Dummy data (2%)
        genderDistribution,
        departmentDistribution,
        nationalityDistribution,
        tenureMetrics: {
          averageTenure,
          tenureDistribution
        }
      };
      
      setAnalyticsData(localAnalytics);
      setLoading(false);
    } catch (err) {
      console.error('Error generating local analytics:', err);
      setError('Failed to generate analytics from local data');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!analyticsData) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No analytics data available. Please check back later.
      </Alert>
    );
  }
  
  // Prepare gender distribution data for chart
  const genderData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        label: 'Gender Distribution',
        data: [
          analyticsData.genderDistribution?.male || 0,
          analyticsData.genderDistribution?.female || 0,
          analyticsData.genderDistribution?.other || 0
        ],
        backgroundColor: [
          '#2196f3',
          '#f50057',
          '#ff9800'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare department distribution data for chart
  const departmentLabels = Object.keys(analyticsData.departmentDistribution || {});
  const departmentValues = Object.values(analyticsData.departmentDistribution || {});
  
  const departmentData = {
    labels: departmentLabels,
    datasets: [
      {
        label: 'Department Distribution',
        data: departmentValues,
        backgroundColor: [
          '#4caf50',
          '#f44336',
          '#9c27b0',
          '#3f51b5',
          '#e91e63',
          '#009688',
          '#ff5722',
          '#795548',
          '#607d8b'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare tenure distribution data for chart
  const tenureData = {
    labels: ['< 1 Year', '1-3 Years', '3-5 Years', '> 5 Years'],
    datasets: [
      {
        label: 'Tenure Distribution',
        data: [
          analyticsData.tenureMetrics?.tenureDistribution?.lessThanOneYear || 0,
          analyticsData.tenureMetrics?.tenureDistribution?.oneToThreeYears || 0,
          analyticsData.tenureMetrics?.tenureDistribution?.threeToFiveYears || 0,
          analyticsData.tenureMetrics?.tenureDistribution?.moreThanFiveYears || 0
        ],
        backgroundColor: [
          '#ffeb3b',
          '#ff9800',
          '#f44336',
          '#9c27b0'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare nationality distribution if available
  const nationalityLabels = Object.keys(analyticsData.nationalityDistribution || {});
  const nationalityValues = Object.values(analyticsData.nationalityDistribution || {});
  
  const nationalityData = {
    labels: nationalityLabels,
    datasets: [
      {
        label: 'Nationality Distribution',
        data: nationalityValues,
        backgroundColor: [
          '#2196f3',
          '#4caf50',
          '#f44336',
          '#9c27b0',
          '#ff9800',
          '#009688',
          '#673ab7',
          '#795548'
        ],
        borderWidth: 1
      }
    ]
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h5" component="h2" sx={{ mb: isMobile ? 2 : 0 }}>
          HR Analytics Dashboard
        </Typography>
        
        <ButtonGroup variant="outlined" size="small">
          <Button 
            onClick={() => handleTimePeriodChange('daily')}
            variant={timePeriod === 'daily' ? 'contained' : 'outlined'}
          >
            Daily
          </Button>
          <Button 
            onClick={() => handleTimePeriodChange('weekly')}
            variant={timePeriod === 'weekly' ? 'contained' : 'outlined'}
          >
            Weekly
          </Button>
          <Button 
            onClick={() => handleTimePeriodChange('monthly')}
            variant={timePeriod === 'monthly' ? 'contained' : 'outlined'}
          >
            Monthly
          </Button>
        </ButtonGroup>
      </Box>
      
      {/* Key Metrics */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
        >
          Daily
        </Button>
        <Button 
          onClick={() => handleTimePeriodChange('weekly')}
          variant={timePeriod === 'weekly' ? 'contained' : 'outlined'}
        >
          Weekly
        </Button>
        <Button 
          onClick={() => handleTimePeriodChange('monthly')}
          variant={timePeriod === 'monthly' ? 'contained' : 'outlined'}
        >
          Monthly
        </Button>
      </ButtonGroup>
    </Box>
    
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>Loading analytics...</Typography>
      </Box>
    ) : error ? (
      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
    ) : (
      <>
        {/* Key Metrics */}
        <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <PeopleOutline color="primary" fontSize="large" />
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                {analyticsData.totalEmployees || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                Total Employees
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <TrendingUp color="primary" fontSize="large" />
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                {analyticsData.newHires || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                New Hires (30d)
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <AttachMoney color="success" fontSize="large" />
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                ${analyticsData.salaryMetrics?.average?.toFixed(0) || '2k'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                Avg. Salary
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Business color="primary" fontSize="large" />
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                {Object.keys(analyticsData.departmentDistribution || {}).length || 6}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                Departments
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Distribution Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%', boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="h6">Department Distribution</Typography>
              </Box>
              <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut 
                  data={departmentData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: 10
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%', boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Public fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="h6">Nationality Distribution</Typography>
              </Box>
              <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut 
                  data={nationalityData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: 10
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%', boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Wc fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="h6">Gender Distribution</Typography>
              </Box>
              <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut 
                  data={genderData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: 10
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%', boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="h6">Worksite Distribution</Typography>
              </Box>
              <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut 
                  data={worksiteData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: 10
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </>
    )}
    
    {/* Tabs for different charts */}
    <Paper variant="outlined" sx={{ mb: 4 }}>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        indicatorColor="primary"
        textColor="primary"
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons={isMobile ? "auto" : false}
      >
        <Tab label="Demographics" icon={<Wc />} iconPosition="start" />
        <Tab label="Departments" icon={<Business />} iconPosition="start" />
        <Tab label="Tenure" icon={<AccessTime />} iconPosition="start" />
        <Tab label="Nationality" icon={<Public />} iconPosition="start" />
      </Tabs>
      
      <Box sx={{ p: 3 }}>
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Gender Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Doughnut 
                    data={genderData} 
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Gender Ratio Analysis:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      The gender distribution shows {genderData.datasets[0].data[0] > genderData.datasets[0].data[1] ? 'more male than female' : 'more female than male'} employees. 
                      {genderData.datasets[0].data[0] === genderData.datasets[0].data[1] && 'an equal distribution between male and female employees.'}
                    </Typography>
                    
                    <Typography variant="body2">
                      • Male: {genderData.datasets[0].data[0]} employees ({((genderData.datasets[0].data[0] / analyticsData.totalEmployees) * 100).toFixed(1)}%)
                    </Typography>
                    <Typography variant="body2">
                      • Female: {genderData.datasets[0].data[1]} employees ({((genderData.datasets[0].data[1] / analyticsData.totalEmployees) * 100).toFixed(1)}%)
                    </Typography>
                    {genderData.datasets[0].data[2] > 0 && (
                      <Typography variant="body2">
                        • Other: {genderData.datasets[0].data[2]} employees ({((genderData.datasets[0].data[2] / analyticsData.totalEmployees) * 100).toFixed(1)}%)
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Department Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bar 
                    data={departmentData} 
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Department Breakdown:
                  </Typography>
                  <Box sx={{ maxHeight: 210, overflowY: 'auto' }}>
                    {departmentLabels.map((dept, index) => (
                      <Box key={dept} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          • {dept}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {departmentValues[index]} ({((departmentValues[index] / analyticsData.totalEmployees) * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Tenure Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pie 
                    data={tenureData} 
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Employee Tenure Analysis:
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The average employee tenure is {Math.floor((analyticsData.tenureMetrics?.averageTenure || 0) / 365)} years and {Math.floor(((analyticsData.tenureMetrics?.averageTenure || 0) % 365) / 30)} months.
                  </Typography>
                  
                  <Typography variant="body2">
                    • Less than 1 year: {tenureData.datasets[0].data[0]} employees ({((tenureData.datasets[0].data[0] / analyticsData.totalEmployees) * 100).toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    • 1-3 years: {tenureData.datasets[0].data[1]} employees ({((tenureData.datasets[0].data[1] / analyticsData.totalEmployees) * 100).toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    • 3-5 years: {tenureData.datasets[0].data[2]} employees ({((tenureData.datasets[0].data[2] / analyticsData.totalEmployees) * 100).toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    • More than 5 years: {tenureData.datasets[0].data[3]} employees ({((tenureData.datasets[0].data[3] / analyticsData.totalEmployees) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Nationality Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Doughnut 
                    data={nationalityData} 
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Nationality Breakdown:
                  </Typography>
                  <Box sx={{ maxHeight: 210, overflowY: 'auto' }}>
                    {nationalityLabels.map((nationality, index) => (
                      <Box key={nationality} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          • {nationality}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {nationalityValues[index]} ({((nationalityValues[index] / analyticsData.totalEmployees) * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Paper>
  </Box>
);

export default AnalyticsDashboard;
