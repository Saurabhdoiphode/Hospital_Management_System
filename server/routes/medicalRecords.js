const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const memoryStore = require('../store/memoryStore');
const MedicalRecord = require('../models/MedicalRecord');

const router = express.Router();
const isMongoConnected = () => require('mongoose').connection.readyState === 1;

// GET /api/medical-records - Get all medical records
router.get('/', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (patientId) query.patientId = patientId;
      const records = await MedicalRecord.find(query).sort({ createdAt: -1 });
      return res.json(records);
    } else {
      let results = [...memoryStore.medicalRecords];
      if (patientId) results = results.filter(m => m.patientId === patientId);

      // Patient role can only see own records
      if (req.user.role === 'patient') {
        const patientObj = memoryStore.patients.find(p => p.email === req.user.email);
        if (patientObj) {
          results = results.filter(m => m.patientId === patientObj.id || m.patientName === req.user.name);
        }
      }
      return res.json(results);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching medical records', error: error.message });
  }
});

// POST /api/medical-records - Create new medical record
router.post('/', verifyToken, authorizeRoles('admin', 'doctor', 'nurse', 'lab', 'pharmacist'), async (req, res) => {
  try {
    const { patientId, patientName, diagnosis, symptoms, prescriptions, labResults, vitals } = req.body;

    if (!patientName || !diagnosis) {
      return res.status(400).json({ message: 'Patient name and diagnosis are required' });
    }

    if (isMongoConnected()) {
      const record = new MedicalRecord({
        patientId: patientId || 'p-101',
        patientName,
        doctorId: req.user.id,
        doctorName: req.user.name || 'Dr. Assigned',
        date: new Date().toISOString().split('T')[0],
        diagnosis,
        symptoms: symptoms || [],
        prescriptions: prescriptions || [],
        labResults: labResults || [],
        vitals: vitals || {}
      });
      await record.save();
      return res.status(201).json(record);
    } else {
      const record = {
        id: memoryStore.generateId('mr'),
        patientId: patientId || 'p-101',
        patientName,
        doctorId: req.user.id,
        doctorName: req.user.name || 'Dr. Assigned',
        date: new Date().toISOString().split('T')[0],
        diagnosis,
        symptoms: symptoms || [],
        prescriptions: prescriptions || [],
        labResults: labResults || [],
        vitals: vitals || { bloodPressure: '120/80', heartRate: '75 bpm', temperature: '98.6 °F', weight: '70 kg', oxygen: '99%' },
        createdAt: new Date().toISOString()
      };
      memoryStore.medicalRecords.unshift(record);
      return res.status(201).json(record);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error creating medical record', error: error.message });
  }
});

// PUT /api/medical-records/:id - Update record
router.put('/:id', verifyToken, authorizeRoles('admin', 'doctor', 'nurse', 'lab', 'pharmacist'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const updated = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Record not found' });
      return res.json(updated);
    } else {
      const index = memoryStore.medicalRecords.findIndex(m => m.id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Record not found' });
      memoryStore.medicalRecords[index] = { ...memoryStore.medicalRecords[index], ...req.body };
      return res.json(memoryStore.medicalRecords[index]);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error updating medical record', error: error.message });
  }
});

module.exports = router;
