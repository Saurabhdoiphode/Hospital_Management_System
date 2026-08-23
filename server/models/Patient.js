const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  bloodGroup: { type: String },
  medicalHistory: [{ type: String }],
  emergencyContact: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String }
  },
  insurance: {
    provider: { type: String },
    policyNumber: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
