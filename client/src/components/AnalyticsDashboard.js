import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  ButtonGroup, 
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import { 
  PeopleOutline, 
  TrendingUp, 
  Business, 
  Public, 
  AttachMoney,
  Wc
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
      // Try to fetch employee data from API first
      let employeeData = [];
      
      try {
        const token = localStorage.getItem('token');
        const employeeResponse = await axios.get(`${apiUrl}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        employeeData = employeeResponse.data;
      } catch (apiError) {
        console.error('Error fetching employees from API:', apiError);
        // Import local data
        const localData = await import('../data/allEmployeeData');
        employeeData = localData.default || [];
      }
      
      if (!employeeData || !employeeData.length) {
        throw new Error('No employee data available');
      }
      
      // Send a message to user about using local data
      setError('API connection unavailable. Using local data for analytics dashboard.');
      
      // Important: we need to calculate and set the analytics data and finish loading
      
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
        },
        salaryMetrics: {
          average: 2000 // Default fallback
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

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // If there's no data at all, show info message
  if (!analyticsData) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No analytics data available. Please check back later.
      </Alert>
    );
  }

  // Chart colors
  const chartColors = [
    '#2196f3', '#4caf50', '#f44336', '#9c27b0', 
    '#ff9800', '#009688', '#673ab7', '#795548'
  ];
  
  const chartBorderColors = chartColors.map(color => color);
  
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
        backgroundColor: chartColors.slice(0, 3),
        borderColor: chartBorderColors.slice(0, 3),
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare department distribution data
  const departmentData = {
    labels: Object.keys(analyticsData.departmentDistribution || {}),
    datasets: [
      {
        label: 'Department Distribution',
        data: Object.values(analyticsData.departmentDistribution || {}),
        backgroundColor: chartColors,
        borderColor: chartBorderColors,
        borderWidth: 1,
      },
    ],
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
        backgroundColor: chartColors,
        borderColor: chartBorderColors,
        borderWidth: 1
      }
    ]
  };
  
  // Prepare worksite distribution data if available
  const worksiteDistribution = {};
  const worksiteData = {
    labels: Object.keys(worksiteDistribution || {}),
    datasets: [
      {
        label: 'Worksite Distribution',
        data: Object.values(worksiteDistribution || {}),
        backgroundColor: chartColors,
        borderColor: chartBorderColors,
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ mb: 4 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h5" component="h2" sx={{ mb: isMobile ? 2 : 0 }}>
          HR Analytics Dashboard
        </Typography>
        <ButtonGroup size="small" aria-label="time period selection">
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
      
      {/* Tabs for different charts */}
      <Paper variant="outlined" sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Gender" />
          <Tab label="Department" />
          <Tab label="Tenure" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Gender Distribution
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                <Doughnut 
                  data={genderData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top'
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Department Distribution
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                <Doughnut 
                  data={departmentData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top'
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Tenure Distribution
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                <Doughnut 
                  data={{
                    labels: [
                      'Less than 1 year',
                      '1-3 years',
                      '3-5 years',
                      'More than 5 years'
                    ],
                    datasets: [
                      {
                        label: 'Tenure Distribution',
                        data: [
                          analyticsData.tenureMetrics?.tenureDistribution?.lessThanOneYear || 0,
                          analyticsData.tenureMetrics?.tenureDistribution?.oneToThreeYears || 0,
                          analyticsData.tenureMetrics?.tenureDistribution?.threeToFiveYears || 0,
                          analyticsData.tenureMetrics?.tenureDistribution?.moreThanFiveYears || 0
                        ],
                        backgroundColor: chartColors.slice(0, 4),
                        borderColor: chartBorderColors.slice(0, 4),
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top'
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AnalyticsDashboard;
