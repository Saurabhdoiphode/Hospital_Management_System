const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'lab', 'pharmacist'], 
    default: 'patient' 
  },
  department: { type: String, default: 'General' },
  phone: { type: String },
  specialization: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
