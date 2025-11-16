const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['medicine', 'equipment', 'supplies', 'other'],
    required: true
  },
  itemCode: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'unit'
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  expiryDate: Date,
  reorderLevel: {
    type: Number,
    default: 10
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'expired'],
    default: 'in-stock'
  }
}, {
  timestamps: true
});

const inventoryTransactionSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['purchase', 'sale', 'return', 'adjustment', 'expired'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: Number,
  totalAmount: Number,
  reference: String,
  notes: String,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = {
  Inventory: mongoose.model('Inventory', inventorySchema),
  InventoryTransaction: mongoose.model('InventoryTransaction', inventoryTransactionSchema)
};

