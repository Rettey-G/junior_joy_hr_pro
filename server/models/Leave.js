const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employeeId: { 
    type: String, 
    required: true 
  },
  leaveType: { 
    type: String, 
    enum: ['annual', 'sick', 'emergency', 'family', 'unpaid'],
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
    required: true,
    min: 1
  },
  reason: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: String
  },
  comments: {
    type: String
  },
  department: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);
