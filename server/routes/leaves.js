const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');

// GET all leave requests with optional filtering
router.get('/', auth, async (req, res) => {
  try {
    // Extract filter parameters from query
    const { employeeId, status, leaveType, department } = req.query;
    
    // Build query object
    const query = {};
    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (department) query.department = department;
    
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET leave request by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create leave request
router.post('/', auth, async (req, res) => {
  try {
    // Format dates if they come as strings
    if (req.body.startDate) {
      req.body.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate) {
      req.body.endDate = new Date(req.body.endDate);
    }
    
    const leave = new Leave(req.body);
    await leave.save();
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update leave request (e.g., approve/reject)
router.put('/:id', auth, async (req, res) => {
  try {
    // Format dates if they come as strings
    if (req.body.startDate) {
      req.body.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate) {
      req.body.endDate = new Date(req.body.endDate);
    }
    
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    res.json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE leave request
router.delete('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    res.json({ message: 'Leave request deleted successfully', leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
