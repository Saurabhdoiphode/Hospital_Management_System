const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true,
    trim: true
  },
  testCode: {
    type: String,
    unique: true,
    required: true
  },
  category: {
    type: String,
    enum: ['blood', 'urine', 'imaging', 'pathology', 'radiology', 'other'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // in hours
    default: 24
  },
  sampleType: {
    type: String,
    trim: true
  },
  normalRange: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const labRequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  tests: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sample-collected', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    sampleId: String,
    collectedAt: Date,
    results: {
      values: mongoose.Schema.Types.Mixed,
      notes: String,
      attachments: [String]
    },
    completedAt: Date,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  status: {
    type: String,
    enum: ['pending', 'sample-collected', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  reportUrl: String
}, {
  timestamps: true
});

module.exports = {
  LabTest: mongoose.model('LabTest', labTestSchema),
  LabRequest: mongoose.model('LabRequest', labRequestSchema)
};

