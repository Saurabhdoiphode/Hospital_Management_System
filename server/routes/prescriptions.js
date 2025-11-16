const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Billing = require('../models/Billing');
const { generatePdf } = require('../utils/pdfGenerator');

const router = express.Router();

async function filterForUser(user) {
  if (user.role === 'patient') {
    const patientRecord = await Patient.findOne({ user: user._id });
    if (!patientRecord) return { patient: null };
    return { patient: patientRecord._id };
  }
  if (user.role === 'doctor') {
    return { doctor: user._id };
  }
  return {};
}

// List prescriptions
router.get('/', auth, async (req, res) => {
  try {
    const filter = await filterForUser(req.user);
    const docs = await Prescription.find(filter)
      .populate({ path: 'patient', populate: { path: 'user', select: 'firstName lastName uniqueId' } })
      .populate('doctor', 'firstName lastName uniqueId')
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create prescription with optional auto-billing
router.post('/', [auth, authorize('admin', 'doctor')], async (req, res) => {
  try {
    const { patient, diagnosis, medications = [], advice, followUpDate } = req.body;
    if (!patient || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ message: 'Patient and at least one medication are required' });
    }

    const totalPrice = medications.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
    const pres = new Prescription({
      patient,
      doctor: req.user._id,
      diagnosis: diagnosis || undefined,
      medications,
      advice,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      totalPrice
    });
    await pres.save();

    let billDoc = null;
    if (totalPrice > 0) {
      const generateInvoiceNumber = () => `INV-${Date.now().toString().slice(-8)}`;
      const items = medications.map(m => ({
        description: `Rx: ${m.name} ${m.dosage || ''} ${m.frequency || ''} ${m.duration || ''}`.trim(),
        quantity: 1,
        unitPrice: Number(m.price) || 0,
        total: Number(m.price) || 0
      }));
      const subtotal = items.reduce((s, i) => s + i.total, 0);
      const tax = 0, discount = 0;
      billDoc = new Billing({
        patient,
        doctor: req.user._id,
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items,
        subtotal,
        tax,
        discount,
        total: subtotal,
        status: 'pending',
        notes: `Auto-generated from prescription ${pres._id}`
      });
      await billDoc.save();
      pres.bill = billDoc._id;
      await pres.save();
    }

    const populated = await Prescription.findById(pres._id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'firstName lastName uniqueId' } })
      .populate('doctor', 'firstName lastName uniqueId');
    res.status(201).json({ prescription: populated, bill: billDoc });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Generate/download prescription PDF
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const pres = await Prescription.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'firstName lastName uniqueId' } })
      .populate('doctor', 'firstName lastName uniqueId');
    if (!pres) return res.status(404).json({ message: 'Prescription not found' });

    // Simple PDF content using existing pdf generator util
    const title = 'Medical Prescription';
    const rows = pres.medications.map((m, idx) => ({
      '#': idx + 1,
      Name: m.name,
      Dosage: m.dosage,
      Frequency: m.frequency,
      Duration: m.duration,
      Price: (Number(m.price) || 0).toFixed(2)
    }));

    let fileBuffer;
    try {
      fileBuffer = await generatePdf({
      title,
      subtitle: `${pres.doctor.firstName} ${pres.doctor.lastName} → ${pres.patient.user.firstName} ${pres.patient.user.lastName}`,
      table: { headers: ['#','Name','Dosage','Frequency','Duration','Price'], rows },
      footer: `Advice: ${pres.advice || '-'} | Follow-up: ${pres.followUpDate ? new Date(pres.followUpDate).toDateString() : '-'}`
      });
    } catch (e) {
      return res.status(503).json({ message: 'PDF generation not available. Please install pdfkit package.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=prescription-${pres._id}.pdf`);
    return res.send(fileBuffer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
