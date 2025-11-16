const express = require('express');
const { body, validationResult } = require('express-validator');
const Staff = require('../models/Staff');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all staff
router.get('/', auth, async (req, res) => {
  try {
    const { department } = req.query;
    const filter = {};
    if (department) filter.department = department;

    const staff = await Staff.find(filter)
      .populate('user', 'firstName lastName email phone specialization')
      .sort({ employeeId: 1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create staff record
router.post('/', [auth, authorize('admin')], [
  body('user').notEmpty(),
  body('designation').notEmpty(),
  body('department').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate employee ID
    const employeeId = `EMP${Date.now().toString().slice(-6)}`;

    const staff = new Staff({
      ...req.body,
      employeeId
    });

    await staff.save();
    const populatedStaff = await Staff.findById(staff._id)
      .populate('user', 'firstName lastName email');
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get staff schedule
router.get('/schedule', auth, async (req, res) => {
  try {
    const { date, department } = req.query;
    const filter = {};
    
    if (department) filter.department = department;

    const staff = await Staff.find(filter)
      .populate('user', 'firstName lastName')
      .select('user shift department employeeId');

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply for leave
router.post('/leave', auth, [
  body('leaveType').isIn(['sick', 'casual', 'emergency', 'vacation', 'other']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find staff record
    const staff = await Staff.findOne({ user: req.user._id });
    if (!staff) {
      return res.status(404).json({ message: 'Staff record not found' });
    }

    const { startDate, endDate } = req.body;
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

    if (days > staff.leaveBalance) {
      return res.status(400).json({ message: 'Insufficient leave balance' });
    }

    const leave = new Leave({
      ...req.body,
      staff: staff._id,
      days
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaves
router.get('/leave', auth, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'admin') {
      // Admin can see all leaves
    } else {
      // Staff can only see their own leaves
      const staff = await Staff.findOne({ user: req.user._id });
      if (staff) {
        filter.staff = staff._id;
      } else {
        return res.json([]);
      }
    }

    const leaves = await Leave.find(filter)
      .populate('staff', 'employeeId')
      .populate('staff.user', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/Reject leave
router.put('/leave/:id', [auth, authorize('admin')], [
  body('status').isIn(['approved', 'rejected'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = req.body.status;
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    leave.comments = req.body.comments;

    if (req.body.status === 'approved') {
      const staff = await Staff.findById(leave.staff);
      staff.leaveBalance -= leave.days;
      await staff.save();
    }

    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

