const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Discharge = require('../models/Discharge');
const Patient = require('../models/Patient');
const Billing = require('../models/Billing');
const { generatePdf } = require('../utils/pdfGenerator');

const router = express.Router();

async function viewFilter(user) {
  if (user.role === 'patient') {
    const p = await Patient.findOne({ user: user._id });
    if (!p) return { patient: null };
    return { patient: p._id };
  }
  return {};
}

router.get('/', auth, async (req, res) => {
  try {
    const filter = await viewFilter(req.user);
    const list = await Discharge.find(filter)
      .populate({ path: 'patient', populate: { path: 'user', select: 'firstName lastName uniqueId' } })
      .populate('approvedByDoctor', 'firstName lastName')
      .populate('finalizedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.post('/', [auth, authorize('admin', 'doctor', 'nurse', 'receptionist')], async (req, res) => {
  try {
    const { patient, admissionDate, diagnosisSummary, treatmentSummary, labSummary, advice, followUpDate } = req.body;
    if (!patient) return res.status(400).json({ message: 'Patient is required' });
    const doc = new Discharge({
      patient,
      createdBy: req.user._id,
      admissionDate: admissionDate ? new Date(admissionDate) : undefined,
      diagnosisSummary,
      treatmentSummary,
      labSummary,
      advice,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined
    });
    await doc.save();
    const populated = await Discharge.findById(doc._id).populate({ path: 'patient', populate: { path: 'user', select: 'firstName lastName uniqueId' } });
    res.status(201).json(populated);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.post('/:id/approve-doctor', [auth, authorize('doctor', 'admin')], async (req, res) => {
  try {
    const d = await Discharge.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    d.approvedByDoctor = req.user._id;
    d.status = 'doctor_approved';
    await d.save();
    res.json(d);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.post('/:id/finalize', [auth, authorize('admin', 'nurse')], async (req, res) => {
  try {
    const { dischargeDate, packagePrice } = req.body;
    const d = await Discharge.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    d.dischargeDate = dischargeDate ? new Date(dischargeDate) : new Date();
    d.finalizedBy = req.user._id;
    d.status = 'finalized';

    if (packagePrice && Number(packagePrice) > 0) {
      const generateInvoiceNumber = () => `INV-${Date.now().toString().slice(-8)}`;
      const items = [{ description: 'Discharge Summary Package', quantity: 1, unitPrice: Number(packagePrice), total: Number(packagePrice) }];
      const subtotal = Number(packagePrice);
      const bill = new Billing({
        patient: d.patient,
        doctor: undefined,
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items,
        subtotal,
        tax: 0,
        discount: 0,
        total: subtotal,
        status: 'pending',
        notes: `Auto-generated from discharge ${d._id}`
      });
      await bill.save();
      d.bill = bill._id;
    }
    await d.save();
    res.json(d);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const d = await Discharge.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'firstName lastName uniqueId' } })
      .populate('approvedByDoctor', 'firstName lastName')
      .populate('finalizedBy', 'firstName lastName');
    if (!d) return res.status(404).json({ message: 'Not found' });

    const title = 'Discharge Summary';
    const subtitle = `${d.patient?.user?.firstName} ${d.patient?.user?.lastName}`;
    const rows = [
      { Field: 'Admission Date', Value: d.admissionDate ? new Date(d.admissionDate).toDateString() : '-' },
      { Field: 'Discharge Date', Value: d.dischargeDate ? new Date(d.dischargeDate).toDateString() : '-' },
      { Field: 'Diagnosis', Value: d.diagnosisSummary || '-' },
      { Field: 'Treatment', Value: d.treatmentSummary || '-' },
      { Field: 'Lab Summary', Value: d.labSummary || '-' },
      { Field: 'Advice', Value: d.advice || '-' },
      { Field: 'Follow-up', Value: d.followUpDate ? new Date(d.followUpDate).toDateString() : '-' }
    ];
    let fileBuffer;
    try {
      fileBuffer = await generatePdf({ title, subtitle, keyValues: rows, footer: `Approved by: ${d.approvedByDoctor ? d.approvedByDoctor.firstName : '-'} | Finalized by: ${d.finalizedBy ? d.finalizedBy.firstName : '-'}` });
    } catch (e) {
      return res.status(503).json({ message: 'PDF generation not available. Please install pdfkit package.' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=discharge-${d._id}.pdf`);
    return res.send(fileBuffer);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

module.exports = router;
