const mongoose = require('mongoose');

const RosterSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['doctor','nurse','lab','receptionist','admin'], required: true },
  department: { type: String },
  date: { type: String, required: true }, // YYYY-MM-DD
  shift: { type: String, enum: ['morning','evening','night'], required: true },
  notes: { type: String }
}, { timestamps: true });

RosterSchema.index({ staff: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Roster', RosterSchema);
