const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosisCode: { type: String, required: true, trim: true },
  diagnosisName: { type: String, required: true, trim: true },
  severity: { type: String, enum: ['mild', 'moderate', 'severe', 'critical'], default: 'moderate' },
  symptoms: [{ type: String, trim: true }],
  notes: { type: String },
  diagnosisDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
