const express = require('express');
const { body, validationResult } = require('express-validator');
const { Ward, Admission } = require('../models/Ward');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all wards
router.get('/', auth, async (req, res) => {
  try {
    const wards = await Ward.find()
      .populate('inCharge', 'firstName lastName')
      .populate('beds.currentPatient', 'patientId')
      .populate('beds.currentPatient.user', 'firstName lastName');
    res.json(wards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create ward
router.post('/', [auth, authorize('admin')], [
  body('wardName').notEmpty(),
  body('wardNumber').notEmpty(),
  body('totalBeds').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { totalBeds, ...wardData } = req.body;
    const beds = [];
    
    for (let i = 1; i <= totalBeds; i++) {
      beds.push({
        bedNumber: `${req.body.wardNumber}-${i}`,
        bedType: req.body.bedType || 'general',
        status: 'available'
      });
    }

    const ward = new Ward({
      ...wardData,
      beds,
      availableBeds: totalBeds
    });

    await ward.save();
    res.status(201).json(ward);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available beds
router.get('/available', auth, async (req, res) => {
  try {
    const { bedType, ward } = req.query;
    const filter = { 'beds.status': 'available' };
    
    if (bedType) filter['beds.bedType'] = bedType;
    if (ward) filter._id = ward;

    const wards = await Ward.find(filter);
    const availableBeds = [];
    
    wards.forEach(ward => {
      ward.beds.forEach(bed => {
        if (bed.status === 'available' && (!bedType || bed.bedType === bedType)) {
          availableBeds.push({
            bedId: bed._id,
            bedNumber: bed.bedNumber,
            bedType: bed.bedType,
            wardName: ward.wardName,
            wardId: ward._id
          });
        }
      });
    });

    res.json(availableBeds);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admit patient
router.post('/admit', [auth, authorize('admin', 'receptionist', 'doctor')], [
  body('patient').notEmpty(),
  body('ward').notEmpty(),
  body('bed').notEmpty(),
  body('diagnosis').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ward, bed, ...admissionData } = req.body;
    
    // Check if bed is available
    const wardDoc = await Ward.findById(ward);
    const bedDoc = wardDoc.beds.id(bed);
    
    if (!bedDoc || bedDoc.status !== 'available') {
      return res.status(400).json({ message: 'Bed is not available' });
    }

    // Create admission
    const admission = new Admission({
      ...admissionData,
      ward,
      bed,
      doctor: req.user._id
    });

    await admission.save();

    // Update bed status
    bedDoc.status = 'occupied';
    bedDoc.currentPatient = admissionData.patient;
    wardDoc.availableBeds -= 1;
    await wardDoc.save();

    res.status(201).json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Discharge patient
router.post('/discharge/:id', [auth, authorize('admin', 'receptionist', 'doctor')], [
  body('dischargeSummary').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    admission.dischargeDate = new Date();
    admission.status = 'discharged';
    admission.dischargeSummary = req.body.dischargeSummary;
    await admission.save();

    // Update bed status
    const ward = await Ward.findById(admission.ward);
    const bed = ward.beds.id(admission.bed);
    bed.status = 'available';
    bed.currentPatient = null;
    ward.availableBeds += 1;
    await ward.save();

    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get admissions
router.get('/admissions', auth, async (req, res) => {
  try {
    const { status, patient } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (patient) filter.patient = patient;

    const admissions = await Admission.find(filter)
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName')
      .populate('ward', 'wardName wardNumber')
      .populate('doctor', 'firstName lastName')
      .sort({ admissionDate: -1 });

    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

