const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to calculate days
leaveSchema.pre('save', async function(next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days
    this.days = diffDays;
  }
  next();
});

// Validation middleware to check leave balance
leaveSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('status')) {
    const LeaveBalance = mongoose.model('LeaveBalance');
    const currentYear = new Date().getFullYear();
    
    const balance = await LeaveBalance.findOne({
      employee: this.employee,
      leaveType: this.leaveType,
      year: currentYear
    });

    if (!balance) {
      throw new Error('No leave balance found for this leave type');
    }

    if (this.status === 'approved' && this.days > balance.remainingDays) {
      throw new Error('Insufficient leave balance');
    }
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);
