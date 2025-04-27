const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Employee Schema
const employeeSchema = new mongoose.Schema({
  name: String,
  hireDate: Date,
  gender: String, // 'male' or 'female'
  leaves: {
    annual: { balance: Number, used: Number },
    emergency: { balance: Number, used: Number },
    sick: { balance: Number, used: Number },
    paternity: { balance: Number, used: Number },
    maternity: { balance: Number, used: Number },
    familyCare: { balance: Number, used: Number }
  }
});

// Leave Record Schema
const leaveRecordSchema = new mongoose.Schema({
  employeeId: mongoose.Schema.Types.ObjectId,
  type: String,
  startDate: Date,
  endDate: Date,
  status: String, // 'approved', 'pending', 'rejected'
  notes: String
});

const Employee = mongoose.model('Employee', employeeSchema);
const LeaveRecord = mongoose.model('LeaveRecord', leaveRecordSchema);

// Calculate leave balances based on hire date
function calculateLeaveBalances(employee) {
  const now = new Date();
  const hireDate = new Date(employee.hireDate);
  const yearsEmployed = now.getFullYear() - hireDate.getFullYear();
  
  // Annual leave - 30 days per year
  const annualLeave = 30 * (yearsEmployed + 1);
  
  // Other leaves
  const emergencyLeave = 10;
  const sickLeave = 30;
  const paternityLeave = 3;
  const maternityLeave = employee.gender === 'female' ? 60 : 30;
  const familyCareLeave = 10;
  
  return {
    annual: annualLeave - (employee.leaves.annual.used || 0),
    emergency: emergencyLeave - (employee.leaves.emergency.used || 0),
    sick: sickLeave - (employee.leaves.sick.used || 0),
    paternity: paternityLeave - (employee.leaves.paternity.used || 0),
    maternity: maternityLeave - (employee.leaves.maternity.used || 0),
    familyCare: familyCareLeave - (employee.leaves.familyCare.used || 0)
  };
}

// API Endpoints

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get employee details and leave balances
app.get('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const leaveBalances = calculateLeaveBalances(employee);
    const pastLeaves = await LeaveRecord.find({ 
      employeeId: employee._id,
      status: 'approved'
    }).sort({ startDate: -1 });
    
    res.json({
      employee,
      leaveBalances,
      pastLeaves
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new employee
app.post('/api/employees', async (req, res) => {
  const employee = new Employee({
    name: req.body.name,
    hireDate: req.body.hireDate,
    gender: req.body.gender,
    leaves: {
      annual: { balance: 0, used: 0 },
      emergency: { balance: 0, used: 0 },
      sick: { balance: 0, used: 0 },
      paternity: { balance: 0, used: 0 },
      maternity: { balance: 0, used: 0 },
      familyCare: { balance: 0, used: 0 }
    }
  });
  
  try {
    const newEmployee = await employee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
