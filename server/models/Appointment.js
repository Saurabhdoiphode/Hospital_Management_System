const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['consultation', 'follow-up', 'checkup', 'emergency', 'surgery'], 
    default: 'consultation' 
  },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Completed', 'Cancelled'], 
    default: 'Scheduled' 
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
