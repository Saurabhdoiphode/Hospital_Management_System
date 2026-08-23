const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  date: { type: String, required: true },
  diagnosis: { type: String, required: true },
  symptoms: [{ type: String }],
  prescriptions: [{
    medicine: { type: String },
    dosage: { type: String },
    frequency: { type: String },
    duration: { type: String }
  }],
  labResults: [{
    testName: { type: String },
    result: { type: String },
    date: { type: String }
  }],
  vitals: {
    bloodPressure: { type: String },
    heartRate: { type: String },
    temperature: { type: String },
    weight: { type: String },
    oxygen: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema);
