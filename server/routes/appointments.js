const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all appointments
router.get('/', auth, async (req, res) => {
  try {
    const { status, doctor, patient, date, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (doctor) filter.doctor = doctor;
    if (patient) filter.patient = patient;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Role-based filtering
    if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    } else if (req.user.role === 'patient') {
      const patientRecord = await Patient.findOne({ user: req.user._id });
      if (patientRecord) {
        filter.patient = patientRecord._id;
      } else {
        return res.json([]);
      }
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization department')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single appointment
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('patient.user', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization department');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create appointment
router.post('/', [auth, authorize('admin', 'receptionist', 'patient', 'doctor')], [
  body('patient').notEmpty(),
  body('doctor').notEmpty(),
  body('appointmentDate').isISO8601(),
  body('appointmentTime').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If user is a patient, ensure they can only book for themselves
    if (req.user.role === 'patient') {
      const patientRecord = await Patient.findOne({ user: req.user._id });
      if (!patientRecord) {
        return res.status(404).json({ message: 'Patient record not found' });
      }
      // Ensure the patient ID matches
      if (patientRecord._id.toString() !== req.body.patient.toString()) {
        return res.status(403).json({ message: 'Patients can only book appointments for themselves' });
      }
      // Override patient ID to ensure security
      req.body.patient = patientRecord._id;
    }

    const appointment = new Appointment({
      ...req.body,
      createdBy: req.user._id
    });

    await appointment.save();
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate('patient.user', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization department');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update appointment
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    Object.assign(appointment, req.body);
    await appointment.save();
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate('patient.user', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization department');

    res.json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete appointment
router.delete('/:id', [auth, authorize('admin', 'receptionist')], async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

