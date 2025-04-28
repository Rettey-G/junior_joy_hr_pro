const express = require('express');
const router = express.Router();
const EmployeeAnalytics = require('../models/EmployeeAnalytics');
const Employee = require('../models/Employee');
const Training = require('../models/Training');
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');

// GET latest analytics
router.get('/latest', auth, async (req, res) => {
  try {
    // Get the latest analytics record
    const latestAnalytics = await EmployeeAnalytics.findOne().sort({ date: -1 });
    
    if (!latestAnalytics) {
      // If no analytics exist, generate them
      await generateAnalytics();
      const newAnalytics = await EmployeeAnalytics.findOne().sort({ date: -1 });
      return res.status(200).json(newAnalytics);
    }
    
    // If analytics are older than 24 hours, regenerate
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (latestAnalytics.date < oneDayAgo) {
      await generateAnalytics();
      const newAnalytics = await EmployeeAnalytics.findOne().sort({ date: -1 });
      return res.status(200).json(newAnalytics);
    }
    
    return res.status(200).json(latestAnalytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// GET analytics by period
router.get('/:period', auth, async (req, res) => {
  try {
    const { period } = req.params;
    
    if (!['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period specified' });
    }
    
    // Get analytics for the specified period
    const analytics = await EmployeeAnalytics.find({ period }).sort({ date: -1 }).limit(10);
    
    if (analytics.length === 0) {
      return res.status(404).json({ error: 'No analytics found for the specified period' });
    }
    
    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching analytics by period:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Generate analytics data
const generateAnalytics = async () => {
  try {
    // Get all employees
    const employees = await Employee.find({});
    
    // Get training data
    const trainings = await Training.find({});
    
    // Get leave data
    const leaves = await Leave.find({});
    
    // Generate analytics for various periods
    await generatePeriodAnalytics(employees, trainings, leaves, 'daily');
    await generatePeriodAnalytics(employees, trainings, leaves, 'weekly');
    await generatePeriodAnalytics(employees, trainings, leaves, 'monthly');
    
    return true;
  } catch (error) {
    console.error('Error generating analytics:', error);
    return false;
  }
};

// Generate analytics for a specific period
const generatePeriodAnalytics = async (employees, trainings, leaves, period) => {
  // Calculate total employees
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  
  // Calculate gender distribution
  const genderDistribution = {
    male: employees.filter(emp => emp.gender === 'Male').length,
    female: employees.filter(emp => emp.gender === 'Female').length,
    other: employees.filter(emp => emp.gender !== 'Male' && emp.gender !== 'Female').length
  };
  
  // Calculate department distribution
  const departmentDistribution = new Map();
  employees.forEach(emp => {
    if (emp.department) {
      const dept = emp.department;
      departmentDistribution.set(dept, (departmentDistribution.get(dept) || 0) + 1);
    }
  });
  
  // Calculate tenure metrics
  const now = new Date();
  const tenures = employees.map(emp => {
    const joinedDate = new Date(emp.joinedDate);
    return Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24)); // Tenure in days
  }).filter(tenure => !isNaN(tenure));
  
  const averageTenure = tenures.reduce((sum, tenure) => sum + tenure, 0) / tenures.length;
  
  const tenureDistribution = {
    lessThanOneYear: tenures.filter(t => t < 365).length,
    oneToThreeYears: tenures.filter(t => t >= 365 && t < 3 * 365).length,
    threeToFiveYears: tenures.filter(t => t >= 3 * 365 && t < 5 * 365).length,
    moreThanFiveYears: tenures.filter(t => t >= 5 * 365).length
  };
  
  // Calculate salary metrics
  const salaries = employees.map(emp => emp.salaryUSD || 0).filter(salary => salary > 0);
  const averageSalary = salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length;
  const sortedSalaries = [...salaries].sort((a, b) => a - b);
  const medianSalary = sortedSalaries[Math.floor(sortedSalaries.length / 2)];
  
  // Create new analytics document
  const analyticsData = {
    date: new Date(),
    period,
    totalEmployees,
    activeEmployees,
    newHires: 0, // Would require historical data
    separations: 0, // Would require historical data
    turnoverRate: 0, // Would require historical data
    genderDistribution,
    departmentDistribution: Object.fromEntries(departmentDistribution),
    salaryMetrics: {
      average: averageSalary,
      median: medianSalary,
      min: Math.min(...salaries),
      max: Math.max(...salaries)
    },
    tenureMetrics: {
      averageTenure,
      tenureDistribution
    },
    leaveMetrics: {
      totalRequested: leaves.length,
      approved: leaves.filter(leave => leave.status === 'approved').length,
      pending: leaves.filter(leave => leave.status === 'pending').length,
      denied: leaves.filter(leave => leave.status === 'denied').length,
      averageDuration: leaves.reduce((sum, leave) => sum + (leave.days || 0), 0) / leaves.length
    },
    trainingMetrics: {
      totalSessions: trainings.length,
      totalParticipants: trainings.reduce((sum, training) => sum + (training.participants?.length || 0), 0),
      completionRate: 0, // Would require more detailed training data
      averageRating: 0 // Would require rating data
    }
  };
  
  // Save analytics
  const analytics = new EmployeeAnalytics(analyticsData);
  await analytics.save();
  
  return analytics;
};

// Manual trigger to regenerate analytics
router.post('/generate', auth, async (req, res) => {
  try {
    const result = await generateAnalytics();
    if (result) {
      return res.status(200).json({ message: 'Analytics generated successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to generate analytics' });
    }
  } catch (error) {
    console.error('Error triggering analytics generation:', error);
    return res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

router.generateAnalytics = generateAnalytics;
module.exports = router;
