const express = require('express');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all patients
router.get('/', auth, async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('user', 'firstName lastName email phone uniqueId')
      .sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current patient (for logged-in patients)
router.get('/current', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can access this route' });
    }
    
    console.log('Fetching patient for user ID:', req.user._id);
    
    let patient = await Patient.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email phone uniqueId');
    
    // If no patient record exists, create one
    if (!patient) {
      console.log('No patient record found, creating one...');
      const patientId = `PAT${Date.now().toString().slice(-6)}`;
      patient = new Patient({
        user: req.user._id,
        patientId,
        dateOfBirth: new Date(),
        gender: 'other'
      });
      await patient.save();
      await patient.populate('user', 'firstName lastName email phone uniqueId');
      console.log('Patient record created:', patient);
    }
    
    console.log('Returning patient:', patient);
    res.json(patient);
  } catch (error) {
    console.error('Error fetching/creating patient:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single patient
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('user', 'firstName lastName email phone address')
      .populate('medicalHistory.doctor', 'firstName lastName specialization');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create patient
router.post('/', [auth, authorize('admin', 'receptionist')], [
  body('email').isEmail(),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('dateOfBirth').isISO8601(),
  body('gender').isIn(['male', 'female', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, dateOfBirth, gender, bloodGroup, emergencyContact, insurance } = req.body;

    // Create user account
    const user = new User({
      email,
      password: password || 'Patient123',
      firstName,
      lastName,
      phone,
      role: 'patient'
    });
    await user.save();

    // Generate patient ID
    const patientId = `PAT${Date.now().toString().slice(-6)}`;

    const patient = new Patient({
      user: user._id,
      patientId,
      dateOfBirth,
      gender,
      bloodGroup,
      emergencyContact,
      insurance
    });

    await patient.save();
    const populatedPatient = await Patient.findById(patient._id).populate('user', 'firstName lastName email phone');

    res.status(201).json(populatedPatient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update patient
router.put('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const updates = req.body;
    Object.assign(patient, updates);
    await patient.save();

    await patient.populate('user', 'firstName lastName email phone');
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete patient
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await User.findByIdAndUpdate(patient.user, { isActive: false });
    await Patient.findByIdAndDelete(req.params.id);

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

