const express = require('express');
const router = express.Router();
// Using mock database instead of MongoDB model

// GET all employees
router.get('/', (req, res) => {
  try {
    // Access the global mock database
    const employees = global.db.employees;
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET employee by ID
router.get('/:id', (req, res) => {
  try {
    const employee = global.db.findEmployee(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create employee
router.post('/', (req, res) => {
  try {
    const newEmployee = global.db.addEmployee(req.body);
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update employee
router.put('/:id', (req, res) => {
  try {
    const employee = global.db.updateEmployee(req.params.id, req.body);
    if (!employee) return res.status(404).json({ error: 'Not found' });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE employee
router.delete('/:id', (req, res) => {
  try {
    const employee = global.db.deleteEmployee(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Not found' });
    res.json({ msg: 'Deleted', employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
