const mongoose = require('mongoose');

const QueueTokenSchema = new mongoose.Schema({
  department: { type: String, required: true, trim: true },
  tokenNumber: { type: Number, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD for daily reset
  status: { type: String, enum: ['waiting', 'called', 'served', 'skipped'], default: 'waiting' },
  counter: { type: String },
  priority: { type: String, enum: ['normal', 'high'], default: 'normal' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

QueueTokenSchema.index({ department: 1, date: 1, tokenNumber: 1 }, { unique: true });

module.exports = mongoose.model('QueueToken', QueueTokenSchema);
