const mongoose = require('mongoose');

const LeaveTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Leave type name is required'],
    trim: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  defaultDays: {
    type: Number,
    required: [true, 'Default days are required'],
    min: [0, 'Default days cannot be negative']
  },
  carryForward: {
    type: Boolean,
    default: false
  },
  paid: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add index for faster queries
LeaveTypeSchema.index({ name: 1 });

module.exports = mongoose.model('LeaveType', LeaveTypeSchema); 