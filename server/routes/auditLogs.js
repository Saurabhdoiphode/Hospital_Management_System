const express = require('express');
const AuditLog = require('../models/AuditLog');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get audit logs (admin only)
router.get('/', [auth, authorize('admin')], async (req, res) => {
  try {
    const { user, resource, action, startDate, endDate, limit = 100 } = req.query;
    const filter = {};

    if (user) filter.user = user;
    if (resource) filter.resource = resource;
    if (action) filter.action = action;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .populate('user', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get logs for specific user
router.get('/user/:userId', [auth, authorize('admin')], async (req, res) => {
  try {
    const logs = await AuditLog.find({ user: req.params.userId })
      .populate('user', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

