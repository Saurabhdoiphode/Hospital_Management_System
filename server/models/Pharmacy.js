const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drops', 'other'],
    required: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'unit'
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  reorderLevel: {
    type: Number,
    default: 10
  },
  prescriptionRequired: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['available', 'low-stock', 'out-of-stock', 'expired'],
    default: 'available'
  }
}, {
  timestamps: true
});

const pharmacySaleSchema = new mongoose.Schema({
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  items: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: Number,
    total: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'insurance'],
    required: true
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = {
  Pharmacy: mongoose.model('Pharmacy', pharmacySchema),
  PharmacySale: mongoose.model('PharmacySale', pharmacySaleSchema)
};

