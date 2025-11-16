const mongoose = require('mongoose');

const DischargeSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedByDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  admissionDate: { type: Date },
  dischargeDate: { type: Date },
  diagnosisSummary: { type: String },
  treatmentSummary: { type: String },
  labSummary: { type: String },
  advice: { type: String },
  followUpDate: { type: Date },
  status: { type: String, enum: ['draft', 'doctor_approved', 'finalized'], default: 'draft' },
  bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Billing' }
}, { timestamps: true });

module.exports = mongoose.model('Discharge', DischargeSchema);
