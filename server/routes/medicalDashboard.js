const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Diagnosis = require('../models/Diagnosis');
const Treatment = require('../models/Treatment');
const Patient = require('../models/Patient');
const Billing = require('../models/Billing');

const router = express.Router();

// Helper to restrict patient visibility
async function buildPatientFilter(user) {
  if (user.role === 'patient') {
    const patientRecord = await Patient.findOne({ user: user._id });
    if (patientRecord) {
      return { patient: patientRecord._id };
    }
    return { patient: null }; // will return empty
  }
  return {}; // admins / doctors see all
}

// ---------------- Diagnoses ----------------
router.get('/diagnoses', auth, async (req, res) => {
  try {
    const baseFilter = await buildPatientFilter(req.user);
    const diagnoses = await Diagnosis.find(baseFilter)
      .populate({ path: 'patient', populate: { path: 'user', select: 'firstName lastName uniqueId' } })
      .populate('doctor', 'firstName lastName uniqueId')
      .sort({ createdAt: -1 });
    res.json(diagnoses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/diagnoses', [auth, authorize('admin', 'doctor')], async (req, res) => {
  try {
    const { patient, diagnosisCode, diagnosisName, severity, symptoms, notes, diagnosisDate } = req.body;
    if (!patient || !diagnosisCode || !diagnosisName) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    const record = new Diagnosis({
      patient,
      doctor: req.user._id,
      diagnosisCode,
      diagnosisName,
      severity,
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      notes,
      diagnosisDate: diagnosisDate ? new Date(diagnosisDate) : Date.now()
    });
    await record.save();
    const populated = await Diagnosis.findById(record._id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'firstName lastName uniqueId' } })
      .populate('doctor', 'firstName lastName uniqueId');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ---------------- Treatments ----------------
router.get('/treatments', auth, async (req, res) => {
  try {
    const baseFilter = await buildPatientFilter(req.user);
    const treatments = await Treatment.find(baseFilter)
      .populate({ path: 'patient', populate: { path: 'user', select: 'firstName lastName uniqueId' } })
      .populate('doctor', 'firstName lastName uniqueId')
      .populate('diagnosis')
      .sort({ createdAt: -1 });
    res.json(treatments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/treatments', [auth, authorize('admin', 'doctor')], async (req, res) => {
  try {
    const { patient, diagnosis, treatmentType, description, startDate, endDate, status, notes, prescriptionName, prescriptionPrice } = req.body;
    if (!patient || !treatmentType || !description) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    const record = new Treatment({
      patient,
      doctor: req.user._id,
      diagnosis: diagnosis || undefined,
      treatmentType,
      description,
      startDate: startDate ? new Date(startDate) : Date.now(),
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || 'ongoing',
      notes
    });
    await record.save();
    const populated = await Treatment.findById(record._id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'firstName lastName uniqueId' } })
      .populate('doctor', 'firstName lastName uniqueId')
      .populate('diagnosis');

    // Auto-create billing item if prescriptionPrice provided
    const priceNumber = prescriptionPrice !== undefined && prescriptionPrice !== null ? Number(prescriptionPrice) : 0;
    if (!Number.isNaN(priceNumber) && priceNumber > 0) {
      const generateInvoiceNumber = () => `INV-${Date.now().toString().slice(-8)}`;
      const items = [{
        description: `Prescription${prescriptionName ? ` - ${prescriptionName}` : ''}`,
        quantity: 1,
        unitPrice: priceNumber,
        total: priceNumber
      }];
      const subtotal = priceNumber;
      const tax = 0;
      const discount = 0;
      const total = subtotal + tax - discount;
      const bill = new Billing({
        patient,
        doctor: req.user._id,
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items,
        subtotal,
        tax,
        discount,
        total,
        status: 'pending',
        notes: `Auto-generated from treatment ${record._id}`
      });
      await bill.save();
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
