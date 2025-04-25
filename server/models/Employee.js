const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  empNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  idNumber: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'] },
  nationality: { type: String, default: 'Maldivian' },
  dateOfBirth: { type: Date },
  mobileNumber: { type: String },
  workNo: { type: String },
  designation: { type: String },
  department: { type: String },
  workSite: { type: String, enum: ['Office', 'Express 1', 'Express 3'] },
  joinedDate: { type: Date },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
