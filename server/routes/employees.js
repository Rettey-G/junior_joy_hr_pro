const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const hr = require('../middleware/hr');
const { generateAnalytics } = require('./analytics');

// GET all employees with filtering
router.get('/', auth, async (req, res) => {
  try {
    // Extract filter parameters from query
    const { department, workSite, active } = req.query;
    
    // Build query object
    const query = {};
    if (department) query.department = department;
    if (workSite) query.workSite = workSite;
    if (active !== undefined) query.active = active === 'true';
    
    const employees = await Employee.find(query).sort({ empNo: 1 });
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create employee
router.post('/', [auth, hr], async (req, res) => {
  try {
    // Format dates if they come as strings
    if (req.body.dateOfBirth) {
      req.body.dateOfBirth = new Date(req.body.dateOfBirth);
    }
    if (req.body.joinedDate) {
      req.body.joinedDate = new Date(req.body.joinedDate);
    }
    
    const employee = new Employee(req.body);
    await employee.save();
    await generateAnalytics();
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update employee
router.put('/:id', [auth, hr], async (req, res) => {
  try {
    // Format dates if they come as strings
    if (req.body.dateOfBirth) {
      req.body.dateOfBirth = new Date(req.body.dateOfBirth);
    }
    if (req.body.joinedDate) {
      req.body.joinedDate = new Date(req.body.joinedDate);
    }
    
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    await generateAnalytics();
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE employee
router.delete('/:id', [auth, hr], async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    await generateAnalytics();
    res.json({ message: 'Employee deleted successfully', employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk import employees
router.post('/bulk', [auth, hr], async (req, res) => {
  try {
    const { employees } = req.body;
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ error: 'Invalid employees data' });
    }
    
    // Format dates and prepare data
    const formattedEmployees = employees.map(emp => ({
      ...emp,
      dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth) : undefined,
      joinedDate: emp.joinedDate ? new Date(emp.joinedDate) : undefined
    }));
    
    const result = await Employee.insertMany(formattedEmployees, { ordered: false });
    res.status(201).json({ message: `${result.length} employees imported successfully` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
