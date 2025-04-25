const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  empNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  idNumber: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'] },
  nationality: { type: String, default: 'Maldivian' },
  cityIsland: { type: String, default: 'hinnavaru' },  // Added city/island field
  dateOfBirth: { type: Date },
  mobileNumber: { type: String },
  workNo: { type: String },
  designation: { type: String },
  department: { type: String },
  workSite: { type: String },  // Removed enum to allow more values
  joinedDate: { type: Date },
  salaryUSD: { type: Number },  // Added USD salary
  salaryMVR: { type: Number },  // Added MVR salary
  image: { type: String },      // Added image field
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
