const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveType = require('../models/LeaveType');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const hr = require('../middleware/hr');

// Get leave balances for the logged-in user
router.get('/balances', auth, async (req, res) => {
  try {
    const balances = await LeaveBalance.find({ employee: req.user.id })
      .populate('leaveType')
      .sort({ 'leaveType.name': 1 });
    res.json(balances);
  } catch (error) {
    console.error('Error fetching leave balances:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all leaves for the logged-in user
router.get('/my-leaves', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id })
      .sort({ createdAt: -1 })
      .populate('leaveType')
      .populate('approvedBy', 'username firstName lastName');
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all leaves (for HR/Admin)
router.get('/', [auth, hr], async (req, res) => {
  try {
    const leaves = await Leave.find()
      .sort({ createdAt: -1 })
      .populate('employee', 'username firstName lastName')
      .populate('leaveType')
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

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check leave balance before creating request
    const balance = await LeaveBalance.findOne({
      employee: req.user.id,
      leaveType,
      year: new Date().getFullYear()
    });

    if (!balance) {
      return res.status(400).json({ message: 'No leave balance found for this leave type' });
    }

    const leave = new Leave({
      employee: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });

    await leave.save();
    
    // Populate the response
    await leave.populate('leaveType');
    res.status(201).json(leave);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update leave status (for HR/Admin)
router.patch('/:id/status', [auth, hr], async (req, res) => {
  try {
    const { status, comments } = req.body;
    if (!['approved', 'rejected', 'pending', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await Leave.findById(req.params.id)
      .populate('leaveType');
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // If approving, check balance again
    if (status === 'approved') {
      const balance = await LeaveBalance.findOne({
        employee: leave.employee,
        leaveType: leave.leaveType._id,
        year: new Date(leave.startDate).getFullYear()
      });

      if (!balance) {
        return res.status(400).json({ message: 'No leave balance found' });
      }

      if (leave.days > balance.remainingDays) {
        leave.forfeitedDays = leave.days - balance.remainingDays;
        leave.status = 'forfeited';
      } else {
        leave.status = status;
        leave.approvedBy = req.user.id;
        leave.approvalDate = Date.now();
        if (comments) leave.comments = comments;

        // Update balance
        balance.usedDays += leave.days;
        balance.remainingDays -= leave.days;
        await balance.save();
      }
    } else {
      leave.status = status;
      if (comments) leave.comments = comments;
    }

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

    await leave.deleteOne();
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
