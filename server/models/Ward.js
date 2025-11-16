const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: true
  },
  bedType: {
    type: String,
    enum: ['general', 'private', 'semi-private', 'icu', 'emergency'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  currentPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  charges: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const wardSchema = new mongoose.Schema({
  wardName: {
    type: String,
    required: true,
    trim: true
  },
  wardNumber: {
    type: String,
    unique: true,
    required: true
  },
  floor: {
    type: Number
  },
  department: {
    type: String,
    trim: true
  },
  beds: [bedSchema],
  totalBeds: {
    type: Number,
    required: true
  },
  availableBeds: {
    type: Number,
    default: function() {
      return this.totalBeds;
    }
  },
  inCharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const admissionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  ward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward',
    required: true
  },
  bed: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  admissionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dischargeDate: Date,
  admissionType: {
    type: String,
    enum: ['emergency', 'routine', 'surgery'],
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['admitted', 'discharged', 'transferred'],
    default: 'admitted'
  },
  dischargeSummary: String,
  charges: {
    roomCharges: Number,
    totalCharges: Number
  }
}, {
  timestamps: true
});

module.exports = {
  Ward: mongoose.model('Ward', wardSchema),
  Admission: mongoose.model('Admission', admissionSchema)
};

