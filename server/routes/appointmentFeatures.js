const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const AppointmentReminder = require('../models/AppointmentReminder');
const Waitlist = require('../models/Waitlist');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get available time slots
router.get('/availability', auth, async (req, res) => {
  try {
    const { doctor, date } = req.query;
    
    if (!doctor || !date) {
      return res.status(400).json({ message: 'Doctor and date are required' });
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get existing appointments for the day
    const appointments = await Appointment.find({
      doctor,
      appointmentDate: { $gte: selectedDate, $lt: nextDay },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    const bookedSlots = appointments.map(apt => apt.appointmentTime);

    // Generate available slots (9 AM to 5 PM, 30-minute intervals)
    const availableSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        if (!bookedSlots.includes(time)) {
          availableSlots.push(time);
        }
      }
    }

    res.json({ availableSlots, bookedSlots });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add to waitlist
router.post('/waitlist', auth, [
  body('doctor').notEmpty(),
  body('preferredDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If patient, get patient record
    let patientId = req.body.patient;
    if (req.user.role === 'patient') {
      const Patient = require('../models/Patient');
      const patientRecord = await Patient.findOne({ user: req.user._id });
      if (patientRecord) {
        patientId = patientRecord._id;
      } else {
        return res.status(404).json({ message: 'Patient record not found' });
      }
    }

    const waitlist = new Waitlist({
      ...req.body,
      patient: patientId
    });

    await waitlist.save();
    res.status(201).json(waitlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get waitlist
router.get('/waitlist', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    }

    const waitlist = await Waitlist.find(filter)
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(waitlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create appointment reminder
router.post('/reminders', [auth, authorize('admin', 'receptionist')], [
  body('appointment').notEmpty(),
  body('reminderTime').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reminder = new AppointmentReminder(req.body);
    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

