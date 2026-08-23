const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const memoryStore = require('../store/memoryStore');
const Billing = require('../models/Billing');

const router = express.Router();
const isMongoConnected = () => require('mongoose').connection.readyState === 1;

// GET /api/billing - Get all invoices
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, patientId } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (status) query.status = status;
      if (patientId) query.patientId = patientId;

      const bills = await Billing.find(query).sort({ createdAt: -1 });
      return res.json(bills);
    } else {
      let results = [...memoryStore.billing];
      if (status) results = results.filter(b => b.status === status);
      if (patientId) results = results.filter(b => b.patientId === patientId);

      if (req.user.role === 'patient') {
        const patientObj = memoryStore.patients.find(p => p.email === req.user.email);
        if (patientObj) {
          results = results.filter(b => b.patientId === patientObj.id || b.patientName === req.user.name);
        }
      }
      return res.json(results);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
});

// POST /api/billing - Generate new invoice
router.post('/', verifyToken, authorizeRoles('admin', 'receptionist'), async (req, res) => {
  try {
    const { patientId, patientName, items, paymentMethod, insuranceClaim } = req.body;

    if (!patientName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Patient name and at least one line item are required' });
    }

    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (isMongoConnected()) {
      const invoice = new Billing({
        patientId: patientId || 'p-101',
        patientName,
        invoiceDate: today,
        dueDate,
        items,
        totalAmount,
        paidAmount: 0,
        status: 'Pending',
        paymentMethod: paymentMethod || 'Cash',
        insuranceClaim: insuranceClaim || { claimed: false, claimStatus: 'N/A', coveredAmount: 0 }
      });
      await invoice.save();
      return res.status(201).json(invoice);
    } else {
      const invoice = {
        id: memoryStore.generateId('inv'),
        patientId: patientId || 'p-101',
        patientName,
        invoiceDate: today,
        dueDate,
        items,
        totalAmount,
        paidAmount: 0,
        status: 'Pending',
        paymentMethod: paymentMethod || 'Cash',
        insuranceClaim: insuranceClaim || { claimed: false, claimStatus: 'N/A', coveredAmount: 0 },
        createdAt: new Date().toISOString()
      };
      memoryStore.billing.unshift(invoice);
      return res.status(201).json(invoice);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error generating invoice', error: error.message });
  }
});

// POST /api/billing/:id/payment - Record payment
router.post('/:id/payment', verifyToken, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (isMongoConnected()) {
      const bill = await Billing.findById(req.params.id);
      if (!bill) return res.status(404).json({ message: 'Invoice not found' });

      const paid = bill.paidAmount + (parseFloat(amount) || bill.totalAmount);
      bill.paidAmount = paid;
      bill.paymentMethod = paymentMethod || bill.paymentMethod;
      bill.status = paid >= bill.totalAmount ? 'Paid' : 'Partial';

      await bill.save();
      return res.json(bill);
    } else {
      const bill = memoryStore.billing.find(b => b.id === req.params.id);
      if (!bill) return res.status(404).json({ message: 'Invoice not found' });

      const payVal = parseFloat(amount) || (bill.totalAmount - bill.paidAmount);
      bill.paidAmount += payVal;
      bill.paymentMethod = paymentMethod || bill.paymentMethod;
      bill.status = bill.paidAmount >= bill.totalAmount ? 'Paid' : 'Partial';

      return res.json(bill);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error recording payment', error: error.message });
  }
});

module.exports = router;
