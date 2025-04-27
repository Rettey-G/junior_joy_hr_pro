const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  defaultDays: {
    type: Number,
    required: true
  },
  description: String,
  genderSpecific: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'all'],
    default: 'all'
  },
  proRated: {
    type: Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('LeaveType', leaveTypeSchema); 