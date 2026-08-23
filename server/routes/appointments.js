const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const memoryStore = require('../store/memoryStore');
const Appointment = require('../models/Appointment');

const router = express.Router();
const isMongoConnected = () => require('mongoose').connection.readyState === 1;

// GET /api/appointments - Get all appointments with filters
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, date, doctorId, patientId } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (status) query.status = status;
      if (date) query.date = date;
      if (doctorId) query.doctorId = doctorId;
      if (patientId) query.patientId = patientId;

      const appointments = await Appointment.find(query).sort({ date: 1, time: 1 });
      return res.json(appointments);
    } else {
      let results = [...memoryStore.appointments];
      if (status) results = results.filter(a => a.status === status);
      if (date) results = results.filter(a => a.date === date);
      if (doctorId) results = results.filter(a => a.doctorId === doctorId);
      if (patientId) results = results.filter(a => a.patientId === patientId);

      // If logged in as patient, restrict to own appointments unless admin/doctor/receptionist
      if (req.user.role === 'patient') {
        const patientObj = memoryStore.patients.find(p => p.email === req.user.email);
        if (patientObj) {
          results = results.filter(a => a.patientId === patientObj.id || a.patientName === req.user.name);
        }
      }

      return res.json(results);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// POST /api/appointments - Book new appointment
router.post('/', verifyToken, async (req, res) => {
  try {
    const { patientId, patientName, doctorId, doctorName, date, time, type, notes } = req.body;

    if (!patientName || !doctorName || !date || !time) {
      return res.status(400).json({ message: 'Patient name, doctor name, date, and time are required' });
    }

    if (isMongoConnected()) {
      const newApt = new Appointment({
        patientId: patientId || 'p-gen',
        patientName,
        doctorId: doctorId || 'u-2',
        doctorName,
        date,
        time,
        type: type || 'consultation',
        status: 'Scheduled',
        notes: notes || ''
      });
      await newApt.save();
      return res.status(201).json(newApt);
    } else {
      const newApt = {
        id: memoryStore.generateId('apt'),
        patientId: patientId || 'p-gen',
        patientName,
        doctorId: doctorId || 'u-2',
        doctorName,
        date,
        time,
        type: type || 'consultation',
        status: 'Scheduled',
        notes: notes || '',
        createdAt: new Date().toISOString()
      };
      memoryStore.appointments.unshift(newApt);
      return res.status(201).json(newApt);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
});

// PUT /api/appointments/:id - Update appointment
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Appointment not found' });
      return res.json(updated);
    } else {
      const index = memoryStore.appointments.findIndex(a => a.id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Appointment not found' });
      memoryStore.appointments[index] = { ...memoryStore.appointments[index], ...req.body };
      return res.json(memoryStore.appointments[index]);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
});

// DELETE /api/appointments/:id - Cancel/Delete appointment
router.delete('/:id', verifyToken, authorizeRoles('admin', 'doctor', 'receptionist'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const deleted = await Appointment.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Appointment not found' });
      return res.json({ message: 'Appointment deleted successfully' });
    } else {
      const index = memoryStore.appointments.findIndex(a => a.id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Appointment not found' });
      memoryStore.appointments.splice(index, 1);
      return res.json({ message: 'Appointment deleted successfully' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
});

module.exports = router;
