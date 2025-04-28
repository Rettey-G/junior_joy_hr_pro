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
  email: { type: String },
  address: { type: String },
  employeeType: { type: String, default: 'Full-time' },
  active: { type: Boolean, default: true },
  accountDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    IBAN: { type: String }
  },
  documents: [{
    name: { type: String },
    file: { type: String },
    uploadDate: { type: Date }
  }],
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phoneNumber: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
