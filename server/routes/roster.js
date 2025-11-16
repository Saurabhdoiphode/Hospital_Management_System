const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Roster = require('../models/Roster');

const router = express.Router();

// List by date range
router.get('/', auth, async (req, res) => {
  try {
    const { start, end, role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (start && end) {
      filter.date = { $gte: start, $lte: end };
    }
    const items = await Roster.find(filter).populate('staff', 'firstName lastName email').sort({ date: 1, shift: 1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// Create shift (admin/nurse)
router.post('/', [auth, authorize('admin','nurse')], async (req, res) => {
  try {
    const { staff, role, department, date, shift, notes } = req.body;
    if (!staff || !role || !date || !shift) return res.status(400).json({ message: 'Missing fields' });
    const doc = new Roster({ staff, role, department, date, shift, notes });
    await doc.save();
    const populated = await Roster.findById(doc._id).populate('staff','firstName lastName email');
    res.status(201).json(populated);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Shift already exists for staff/date' });
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// Update/replace shift
router.put('/:id', [auth, authorize('admin','nurse')], async (req, res) => {
  try {
    const updated = await Roster.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('staff','firstName lastName email');
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// Delete shift
router.delete('/:id', [auth, authorize('admin','nurse')], async (req, res) => {
  try {
    await Roster.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

module.exports = router;
