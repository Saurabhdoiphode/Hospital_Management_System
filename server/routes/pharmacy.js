const express = require('express');
const { body, validationResult } = require('express-validator');
const { Pharmacy, PharmacySale } = require('../models/Pharmacy');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all medicines
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { medicineName: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } }
      ];
    }

    const medicines = await Pharmacy.find(filter).sort({ medicineName: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create medicine
router.post('/', [auth, authorize('admin', 'receptionist')], [
  body('medicineName').notEmpty(),
  body('quantity').isNumeric(),
  body('unitPrice').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const medicine = new Pharmacy(req.body);
    
    // Update status based on quantity and expiry
    if (medicine.quantity === 0) {
      medicine.status = 'out-of-stock';
    } else if (medicine.quantity <= medicine.reorderLevel) {
      medicine.status = 'low-stock';
    }
    
    if (medicine.expiryDate && new Date(medicine.expiryDate) < new Date()) {
      medicine.status = 'expired';
    }

    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create sale
router.post('/sale', [auth, authorize('admin', 'receptionist')], [
  body('patient').notEmpty(),
  body('items').isArray().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, discount = 0 } = req.body;
    let totalAmount = 0;

    // Validate and calculate totals
    for (const item of items) {
      const medicine = await Pharmacy.findById(item.medicine);
      if (!medicine) {
        return res.status(404).json({ message: `Medicine ${item.medicine} not found` });
      }
      if (medicine.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${medicine.medicineName}` });
      }
      item.unitPrice = medicine.sellingPrice;
      item.total = item.quantity * item.unitPrice;
      totalAmount += item.total;
    }

    const finalAmount = totalAmount - discount;

    const sale = new PharmacySale({
      ...req.body,
      items,
      totalAmount,
      discount,
      finalAmount,
      soldBy: req.user._id
    });

    await sale.save();

    // Update medicine quantities
    for (const item of items) {
      const medicine = await Pharmacy.findById(item.medicine);
      medicine.quantity -= item.quantity;
      if (medicine.quantity <= medicine.reorderLevel) {
        medicine.status = 'low-stock';
      }
      if (medicine.quantity === 0) {
        medicine.status = 'out-of-stock';
      }
      await medicine.save();
    }

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sales
router.get('/sales', auth, async (req, res) => {
  try {
    const sales = await PharmacySale.find()
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName')
      .populate('soldBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

