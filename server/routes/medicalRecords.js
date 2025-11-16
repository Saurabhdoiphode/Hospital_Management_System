const express = require('express');
const { body, validationResult } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all medical records
router.get('/', auth, async (req, res) => {
  try {
    const { patient } = req.query;
    const filter = {};

    if (patient) filter.patient = patient;

    // Role-based filtering
    if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    }

    const records = await MedicalRecord.find(filter)
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment')
      .sort({ visitDate: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single medical record
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient')
      .populate('patient.user', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization department')
      .populate('appointment');

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create medical record
router.post('/', [auth, authorize('doctor', 'admin', 'lab')], [
  body('patient').notEmpty(),
  body('diagnosis').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const record = new MedicalRecord({
      ...req.body,
      doctor: req.user._id
    });

    await record.save();
    const populatedRecord = await MedicalRecord.findById(record._id)
      .populate('patient')
      .populate('patient.user', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization');

    res.status(201).json(populatedRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update medical record
router.put('/:id', [auth, authorize('doctor', 'admin', 'lab')], async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    Object.assign(record, req.body);
    await record.save();
    const populatedRecord = await MedicalRecord.findById(record._id)
      .populate('patient')
      .populate('patient.user', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization');

    res.json(populatedRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete medical record
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

