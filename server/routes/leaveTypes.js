const express = require('express');
const router = express.Router();
const LeaveType = require('../models/LeaveType');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const hr = require('../middleware/hr');

// Get all leave types (accessible by all authenticated users)
router.get('/', auth, async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ name: 1 });
    res.json(leaveTypes);
  } catch (error) {
    console.error('Error fetching leave types:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new leave type (HR/Admin only)
router.post('/', [auth, hr], async (req, res) => {
  try {
    const { name, description, defaultDays, carryForward, paid } = req.body;

    // Validate required fields
    if (!name || defaultDays === undefined) {
      return res.status(400).json({ message: 'Name and defaultDays are required' });
    }

    // Check if leave type already exists
    const existingType = await LeaveType.findOne({ name: name.trim() });
    if (existingType) {
      return res.status(400).json({ message: 'Leave type already exists' });
    }

    const leaveType = new LeaveType({
      name: name.trim(),
      description: description?.trim(),
      defaultDays,
      carryForward: carryForward || false,
      paid: paid || false
    });

    await leaveType.save();
    res.status(201).json(leaveType);
  } catch (error) {
    console.error('Error creating leave type:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a leave type (HR/Admin only)
router.put('/:id', [auth, hr], async (req, res) => {
  try {
    const { name, description, defaultDays, carryForward, paid } = req.body;

    // Validate required fields
    if (!name || defaultDays === undefined) {
      return res.status(400).json({ message: 'Name and defaultDays are required' });
    }

    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ message: 'Leave type not found' });
    }

    // Check if new name conflicts with existing leave type
    if (name !== leaveType.name) {
      const existingType = await LeaveType.findOne({ name: name.trim() });
      if (existingType) {
        return res.status(400).json({ message: 'Leave type with this name already exists' });
      }
    }

    leaveType.name = name.trim();
    leaveType.description = description?.trim();
    leaveType.defaultDays = defaultDays;
    leaveType.carryForward = carryForward || false;
    leaveType.paid = paid || false;

    await leaveType.save();
    res.json(leaveType);
  } catch (error) {
    console.error('Error updating leave type:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a leave type (HR/Admin only)
router.delete('/:id', [auth, hr], async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ message: 'Leave type not found' });
    }

    // TODO: Check if there are any active leave requests or balances using this type
    // If yes, prevent deletion or handle appropriately

    await leaveType.deleteOne();
    res.json({ message: 'Leave type deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave type:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 