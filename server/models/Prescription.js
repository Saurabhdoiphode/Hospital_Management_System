const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String },
  price: { type: Number, default: 0 }
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: { type: mongoose.Schema.Types.ObjectId, ref: 'Diagnosis' },
  medications: { type: [MedicationSchema], default: [] },
  advice: { type: String },
  followUpDate: { type: Date },
  totalPrice: { type: Number, default: 0 },
  bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Billing' }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
