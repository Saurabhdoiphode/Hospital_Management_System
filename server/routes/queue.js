const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const QueueToken = require('../models/QueueToken');
const Patient = require('../models/Patient');

const router = express.Router();

const today = () => new Date().toISOString().split('T')[0];

router.get('/', auth, async (req, res) => {
  try {
    const { department, status } = req.query;
    const filter = { date: today() };
    if (department) filter.department = department;
    if (status) filter.status = status;
    const list = await QueueToken.find(filter)
      .populate({ path: 'patient', populate: { path: 'user', select: 'firstName lastName uniqueId' } })
      .sort({ tokenNumber: 1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// Create token (receptionist/admin)
router.post('/', [auth, authorize('admin', 'receptionist')], async (req, res) => {
  try {
    const { department, patient } = req.body;
    if (!department) return res.status(400).json({ message: 'Department required' });
    const d = today();
    const last = await QueueToken.findOne({ department, date: d }).sort({ tokenNumber: -1 });
    const tokenNumber = (last?.tokenNumber || 0) + 1;
    const token = new QueueToken({ department, tokenNumber, date: d, patient: patient || undefined, createdBy: req.user._id });
    await token.save();
    res.status(201).json(token);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// Call next token (department users)
router.post('/call-next', [auth, authorize('admin', 'doctor', 'lab', 'nurse')], async (req, res) => {
  try {
    const { department, counter } = req.body;
    if (!department) return res.status(400).json({ message: 'Department required' });
    const next = await QueueToken.findOneAndUpdate(
      { department, date: today(), status: 'waiting' },
      { status: 'called', counter },
      { sort: { tokenNumber: 1 }, new: true }
    );
    if (!next) return res.status(404).json({ message: 'No waiting tokens' });
    res.json(next);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// Update status (served/skipped)
router.post('/:id/status', [auth, authorize('admin', 'doctor', 'lab', 'nurse')], async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['waiting', 'called', 'served', 'skipped'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const token = await QueueToken.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!token) return res.status(404).json({ message: 'Token not found' });
    res.json(token);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

module.exports = router;
