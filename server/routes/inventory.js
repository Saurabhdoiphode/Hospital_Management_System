const express = require('express');
const { body, validationResult } = require('express-validator');
const { Inventory, InventoryTransaction } = require('../models/Inventory');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, lowStock } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (lowStock === 'true') {
      filter.quantity = { $lte: '$reorderLevel' };
    }

    const items = await Inventory.find(filter).sort({ itemName: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single inventory item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create inventory item
router.post('/', [auth, authorize('admin', 'receptionist')], [
  body('itemName').notEmpty(),
  body('category').isIn(['medicine', 'equipment', 'supplies', 'other']),
  body('quantity').isNumeric(),
  body('unitPrice').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate item code
    const itemCode = `INV-${Date.now().toString().slice(-8)}`;

    const item = new Inventory({
      ...req.body,
      itemCode
    });

    // Update status based on quantity
    if (item.quantity === 0) {
      item.status = 'out-of-stock';
    } else if (item.quantity <= item.reorderLevel) {
      item.status = 'low-stock';
    }

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update inventory item
router.put('/:id', [auth, authorize('admin', 'receptionist')], async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    Object.assign(item, req.body);

    // Update status based on quantity
    if (item.quantity === 0) {
      item.status = 'out-of-stock';
    } else if (item.quantity <= item.reorderLevel) {
      item.status = 'low-stock';
    } else {
      item.status = 'in-stock';
    }

    // Check expiry
    if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
      item.status = 'expired';
    }

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete inventory item
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transactions
router.get('/transactions/all', auth, async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find()
      .populate('item', 'itemName itemCode')
      .populate('performedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create transaction
router.post('/transactions', [auth, authorize('admin', 'receptionist')], [
  body('item').notEmpty(),
  body('transactionType').isIn(['purchase', 'sale', 'return', 'adjustment', 'expired']),
  body('quantity').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Inventory.findById(req.body.item);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const { transactionType, quantity, unitPrice } = req.body;
    let newQuantity = item.quantity;

    // Update quantity based on transaction type
    if (transactionType === 'purchase' || transactionType === 'return') {
      newQuantity += quantity;
    } else if (transactionType === 'sale' || transactionType === 'expired') {
      newQuantity -= quantity;
      if (newQuantity < 0) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
    } else if (transactionType === 'adjustment') {
      newQuantity = quantity;
    }

    // Create transaction
    const transaction = new InventoryTransaction({
      ...req.body,
      unitPrice: unitPrice || item.unitPrice,
      totalAmount: (unitPrice || item.unitPrice) * Math.abs(quantity),
      performedBy: req.user._id
    });

    await transaction.save();

    // Update inventory
    item.quantity = newQuantity;
    if (item.quantity === 0) {
      item.status = 'out-of-stock';
    } else if (item.quantity <= item.reorderLevel) {
      item.status = 'low-stock';
    } else {
      item.status = 'in-stock';
    }

    await item.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

