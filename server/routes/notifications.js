const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { read, limit = 50 } = req.query;
    const filter = { recipient: req.user._id };
    
    if (read !== undefined) {
      filter.read = read === 'true';
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create notification
// Admins can notify: all users, specific user, or by role via recipientRole
// Non-admin users can: notify admins (recipientRole:'admin') or a specific user
router.post('/', [auth], [
  body('title').notEmpty(),
  body('message').notEmpty(),
  body('type').isIn(['info', 'success', 'warning', 'error', 'alert']),
  body('category').isIn(['appointment', 'billing', 'lab', 'medical', 'system', 'alert', 'general'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipient, recipientRole, title, message, notes, type, category, priority, actionUrl } = req.body;

    // Non-admin users restrictions
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin) {
      if (recipient === 'all' || (recipientRole && recipientRole !== 'admin')) {
        return res.status(403).json({ message: 'Not authorized to broadcast notifications' });
      }
    }

    // Admin: to all users
    if (recipient === 'all') {
      const users = await User.find({ isActive: true });
      const bulk = users.map(u => ({
        recipient: u._id,
        sender: req.user._id,
        title, message, notes, type, category,
        priority: priority || 'medium', actionUrl
      }));
      await Notification.insertMany(bulk);
      return res.json({ message: `Notification sent to ${users.length} users`, count: users.length });
    }

    // Admin: to role
    if (isAdmin && recipientRole) {
      const users = await User.find({ isActive: true, role: recipientRole });
      const bulk = users.map(u => ({
        recipient: u._id,
        sender: req.user._id,
        title, message, notes, type, category,
        priority: priority || 'medium', actionUrl
      }));
      await Notification.insertMany(bulk);
      return res.json({ message: `Notification sent to ${users.length} ${recipientRole}(s)`, count: users.length });
    }

    // Non-admin: to admins via recipientRole=admin
    if (!isAdmin && recipientRole === 'admin') {
      const users = await User.find({ isActive: true, role: 'admin' });
      const bulk = users.map(u => ({
        recipient: u._id,
        sender: req.user._id,
        title, message, notes, type, category,
        priority: priority || 'medium', actionUrl
      }));
      await Notification.insertMany(bulk);
      return res.json({ message: `Notification sent to admins (${users.length})`, count: users.length });
    }

    // Specific user
    if (recipient && recipient !== 'all') {
      const notification = new Notification({
        recipient,
        sender: req.user._id,
        title, message, notes, type, category,
        priority: priority || 'medium', actionUrl
      });
      await notification.save();
      return res.status(201).json(notification);
    }

    return res.status(400).json({ message: 'Invalid target for notification' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Grouped notifications by category for current user
router.get('/grouped/by-category', auth, async (req, res) => {
  try {
    const docs = await Notification.aggregate([
      { $match: { recipient: req.user._id } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$category', items: { $push: { _id: '$_id', title: '$title', message: '$message', notes: '$notes', type: '$type', createdAt: '$createdAt', read: '$read' } }, count: { $sum: 1 }, unread: { $sum: { $cond: ['$read', 0, 1] } } } },
      { $project: { category: '$_id', items: 1, count: 1, unread: 1, _id: 0 } },
      { $sort: { category: 1 } }
    ]);
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

