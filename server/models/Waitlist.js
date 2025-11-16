const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preferredDate: Date,
  preferredTime: String,
  reason: String,
  priority: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['waiting', 'notified', 'booked', 'cancelled'],
    default: 'waiting'
  },
  notifiedAt: Date,
  bookedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Waitlist', waitlistSchema);

