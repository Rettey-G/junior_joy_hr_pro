const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');

// Get all leaves for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id })
      .sort({ createdAt: -1 })
      .populate('approvedBy', 'username firstName lastName');
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all leaves (for HR/Admin)
router.get('/all', auth, async (req, res) => {
  try {
    if (!['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const leaves = await Leave.find()
      .sort({ createdAt: -1 })
      .populate('employee', 'username firstName lastName')
      .populate('approvedBy', 'username firstName lastName');
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching all leaves:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new leave request
router.post('/', auth, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const leave = new Leave({
      employee: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update leave status (for HR/Admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (!['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.approvalDate = Date.now();

    await leave.save();
    res.json(leave);
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a leave request (only if pending)
router.delete('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow deletion if the user owns the request or is admin/hr
    if (leave.employee.toString() !== req.user.id && !['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow deletion of pending requests
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete non-pending leave requests' });
    }

    await leave.remove();
    res.json({ message: 'Leave request deleted' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
