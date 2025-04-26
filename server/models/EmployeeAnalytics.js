const mongoose = require('mongoose');

const employeeAnalyticsSchema = new mongoose.Schema({
  // Time periods
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true
  },
  
  // General metrics
  totalEmployees: {
    type: Number,
    required: true
  },
  activeEmployees: Number,
  newHires: Number,
  separations: Number,
  turnoverRate: Number,
  
  // Demographics
  genderDistribution: {
    male: Number,
    female: Number,
    other: Number
  },
  
  // Department metrics
  departmentDistribution: {
    type: Map,
    of: Number
  },
  
  // Salary metrics
  salaryMetrics: {
    average: Number,
    median: Number,
    min: Number, 
    max: Number
  },
  
  // Tenure metrics
  tenureMetrics: {
    averageTenure: Number, // in days
    tenureDistribution: {
      lessThanOneYear: Number,
      oneToThreeYears: Number,
      threeToFiveYears: Number,
      moreThanFiveYears: Number
    }
  },
  
  // Leave metrics
  leaveMetrics: {
    totalRequested: Number,
    approved: Number,
    pending: Number,
    denied: Number,
    averageDuration: Number
  },
  
  // Training metrics
  trainingMetrics: {
    totalSessions: Number,
    totalParticipants: Number,
    completionRate: Number,
    averageRating: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeAnalytics', employeeAnalyticsSchema);
