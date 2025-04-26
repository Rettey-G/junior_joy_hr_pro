const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Schema definitions
const EmployeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String },
  gender: { type: String },
  nationality: { type: String },
  dateOfBirth: { type: Date },
  address: { type: String },
  department: { type: String },
  designation: { type: String },
  workSite: { type: String },
  employeeType: { type: String },
  joinDate: { type: Date },
  salary: { type: Number },
  image: { type: String },
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

const TrainerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  specialization: { type: String },
  contact: { type: String },
  email: { type: String },
  company: { type: String },
  experience: { type: Number },
  rating: { type: Number }
}, { timestamps: true });

const TrainingProgramSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  duration: { type: Number },
  targetAudience: { type: String },
  objectives: [String],
  materialUrl: { type: String }
}, { timestamps: true });

const TrainingSessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  programId: { type: String, required: true },
  trainerId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String },
  maxParticipants: { type: Number },
  status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], default: 'Scheduled' },
  participants: [{
    employeeId: { type: String },
    status: { type: String, enum: ['Registered', 'Attended', 'Completed', 'No-Show'], default: 'Registered' }
  }],
  feedback: [{
    employeeId: { type: String },
    rating: { type: Number },
    comments: { type: String },
    submittedDate: { type: Date }
  }]
}, { timestamps: true });

const LeaveTypeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  daysPerYear: { type: Number },
  isPaid: { type: Boolean, default: true },
  accrual: { type: String, enum: ['Annual', 'Monthly', 'OneTime'], default: 'Annual' },
  carryOver: { type: Boolean, default: false },
  maxCarryOver: { type: Number },
  requiresApproval: { type: Boolean, default: true },
  documents: { type: Boolean, default: false }
}, { timestamps: true });

const LeaveRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  leaveTypeId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
  approvedBy: { type: String },
  approvedDate: { type: Date },
  documents: [{ 
    name: { type: String },
    file: { type: String },
    uploadDate: { type: Date }
  }],
  comments: [{
    user: { type: String },
    text: { type: String },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Define models
const Employee = mongoose.model('Employee', EmployeeSchema);
const Trainer = mongoose.model('Trainer', TrainerSchema);
const TrainingProgram = mongoose.model('TrainingProgram', TrainingProgramSchema);
const TrainingSession = mongoose.model('TrainingSession', TrainingSessionSchema);
const LeaveType = mongoose.model('LeaveType', LeaveTypeSchema);
const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);

// Sample data will be populated in a separate script
console.log('Database schemas defined successfully');

module.exports = {
  Employee,
  Trainer,
  TrainingProgram,
  TrainingSession,
  LeaveType,
  LeaveRequest,
  mongoose,
  MONGODB_URI
};
