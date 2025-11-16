const express = require('express');
const { body, validationResult } = require('express-validator');
const Billing = require('../models/Billing');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate invoice number
const generateInvoiceNumber = () => {
  return `INV-${Date.now().toString().slice(-8)}`;
};

// Get all bills
router.get('/', auth, async (req, res) => {
  try {
    const { patient, status } = req.query;
    const filter = {};

    if (patient) filter.patient = patient;
    if (status) filter.status = status;

    // If user is a patient, only show their bills
    if (req.user.role === 'patient') {
      const Patient = require('../models/Patient');
      const patientRecord = await Patient.findOne({ user: req.user._id });
      if (patientRecord) {
        filter.patient = patientRecord._id;
      } else {
        // Patient record doesn't exist, return empty array
        return res.json([]);
      }
    } else if (req.user.role === 'doctor') {
      // Doctors see bills they created/are associated with
      filter.doctor = req.user._id;
    }

    const bills = await Billing.find(filter)
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName email')
      .populate('doctor', 'firstName lastName email')
      .populate('appointment')
      .sort({ invoiceDate: -1 });

    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Billing summary
router.get('/summary', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'patient') {
      const Patient = require('../models/Patient');
      const patientRecord = await Patient.findOne({ user: req.user._id });
      if (!patientRecord) return res.json({ total: 0, byStatus: {} });
      filter.patient = patientRecord._id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    }

    const bills = await Billing.find(filter).select('total status');
    const total = bills.reduce((s, b) => s + (b.total || 0), 0);
    const byStatus = bills.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + (b.total || 0);
      return acc;
    }, {});
    res.json({ total, byStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single bill
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('patient')
      .populate('patient.user', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName email')
      .populate('appointment');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create bill
router.post('/', [auth, authorize('admin', 'receptionist')], [
  body('patient').notEmpty(),
  body('items').isArray().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, tax = 0, discount = 0 } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      item.total = item.quantity * item.unitPrice;
      return sum + item.total;
    }, 0);

    const total = subtotal + tax - discount;

    const bill = new Billing({
      ...req.body,
      doctor: req.body.doctor || undefined,
      invoiceNumber: generateInvoiceNumber(),
      subtotal,
      tax,
      discount,
      total,
      dueDate: req.body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    await bill.save();
    const populatedBill = await Billing.findById(bill._id)
      .populate('patient')
      .populate('patient.user', 'firstName lastName email');

    res.status(201).json(populatedBill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update bill
router.put('/:id', auth, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Recalculate if items changed
    if (req.body.items) {
      const { items, tax = bill.tax, discount = bill.discount } = req.body;
      const subtotal = items.reduce((sum, item) => {
        item.total = item.quantity * item.unitPrice;
        return sum + item.total;
      }, 0);
      req.body.subtotal = subtotal;
      req.body.total = subtotal + tax - discount;
    }

    Object.assign(bill, req.body);
    await bill.save();
    const populatedBill = await Billing.findById(bill._id)
      .populate('patient')
      .populate('patient.user', 'firstName lastName email');

    res.json(populatedBill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add payment - only discharged patients can pay
router.post('/:id/payment', [auth, authorize('admin', 'receptionist')], [
  body('amount').isNumeric().notEmpty(),
  body('paymentMethod').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bill = await Billing.findById(req.params.id).populate('patient');
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Only discharged patients can make payments
    if (!bill.patient || bill.patient.status !== 'discharged') {
      return res.status(403).json({ message: 'Payment only allowed for discharged patients' });
    }

    const payment = {
      amount: req.body.amount,
      paymentDate: new Date(),
      paymentMethod: req.body.paymentMethod,
      transactionId: req.body.transactionId,
      notes: req.body.notes
    };

    bill.payments.push(payment);

    // Calculate total paid
    const totalPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0);

    // Guard: do not allow overpayment
    const remainingBefore = bill.total - (totalPaid - payment.amount);
    if (payment.amount > remainingBefore + 1e-6) {
      // revert last push
      bill.payments.pop();
      return res.status(400).json({ message: 'Payment exceeds remaining balance' });
    }

    // Update status
    if (totalPaid >= bill.total) {
      bill.status = 'paid';
    } else if (totalPaid > 0) {
      bill.status = 'partial';
    }

    bill.paymentMethod = req.body.paymentMethod;
    await bill.save();

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete bill
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    await Billing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

