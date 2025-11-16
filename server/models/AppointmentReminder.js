const mongoose = require('mongoose');

const appointmentReminderSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  reminderType: {
    type: String,
    enum: ['email', 'sms', 'both'],
    default: 'both'
  },
  reminderTime: {
    type: Date,
    required: true
  },
  sent: {
    type: Boolean,
    default: false
  },
  sentAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('AppointmentReminder', appointmentReminderSchema);

