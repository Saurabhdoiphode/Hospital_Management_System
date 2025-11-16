const mongoose = require('mongoose');

const TreatmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: { type: mongoose.Schema.Types.ObjectId, ref: 'Diagnosis' }, // optional link to a diagnosis
  treatmentType: { 
    type: String, 
    enum: ['medication', 'therapy', 'surgery', 'physical_therapy', 'lifestyle'], 
    required: true,
    default: 'medication'
  },
  description: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['ongoing', 'completed', 'paused', 'cancelled'], default: 'ongoing' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Treatment', TreatmentSchema);
