const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const memoryStore = require('../store/memoryStore');
const Patient = require('../models/Patient');

const router = express.Router();
const isMongoConnected = () => require('mongoose').connection.readyState === 1;

// GET /api/patients - Get all patients with search/filter
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, gender, bloodGroup } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
      if (gender) query.gender = gender;
      if (bloodGroup) query.bloodGroup = bloodGroup;

      const patients = await Patient.find(query).sort({ createdAt: -1 });
      return res.json(patients);
    } else {
      let results = [...memoryStore.patients];
      if (search) {
        const s = search.toLowerCase();
        results = results.filter(p => 
          p.name.toLowerCase().includes(s) || 
          p.email.toLowerCase().includes(s) || 
          p.phone.includes(s)
        );
      }
      if (gender) results = results.filter(p => p.gender === gender);
      if (bloodGroup) results = results.filter(p => p.bloodGroup === bloodGroup);
      return res.json(results);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
});

// GET /api/patients/:id - Get patient by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const patient = await Patient.findById(req.params.id);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      return res.json(patient);
    } else {
      const patient = memoryStore.patients.find(p => p.id === req.params.id);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      return res.json(patient);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching patient profile', error: error.message });
  }
});

// POST /api/patients - Create patient
router.post('/', verifyToken, authorizeRoles('admin', 'doctor', 'nurse', 'receptionist'), async (req, res) => {
  try {
    const { name, email, age, gender, phone, address, bloodGroup, medicalHistory, emergencyContact, insurance } = req.body;
    
    if (!name || !age || !gender || !phone) {
      return res.status(400).json({ message: 'Name, age, gender, and phone are required' });
    }

    if (isMongoConnected()) {
      const newPatient = new Patient({
        name,
        email: email || '',
        age,
        gender,
        phone,
        address: address || '',
        bloodGroup: bloodGroup || 'O+',
        medicalHistory: medicalHistory || [],
        emergencyContact: emergencyContact || {},
        insurance: insurance || {}
      });
      await newPatient.save();
      return res.status(201).json(newPatient);
    } else {
      const newPatient = {
        id: memoryStore.generateId('p'),
        name,
        email: email || '',
        age: parseInt(age, 10),
        gender,
        phone,
        address: address || '',
        bloodGroup: bloodGroup || 'O+',
        medicalHistory: medicalHistory || [],
        emergencyContact: emergencyContact || { name: '', relation: '', phone: '' },
        insurance: insurance || { provider: 'None', policyNumber: '' },
        createdAt: new Date().toISOString()
      };
      memoryStore.patients.unshift(newPatient);
      return res.status(201).json(newPatient);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error creating patient record', error: error.message });
  }
});

// PUT /api/patients/:id - Update patient
router.put('/:id', verifyToken, authorizeRoles('admin', 'doctor', 'nurse', 'receptionist'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Patient not found' });
      return res.json(updated);
    } else {
      const index = memoryStore.patients.findIndex(p => p.id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Patient not found' });
      memoryStore.patients[index] = { ...memoryStore.patients[index], ...req.body };
      return res.json(memoryStore.patients[index]);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error updating patient', error: error.message });
  }
});

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const deleted = await Patient.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Patient not found' });
      return res.json({ message: 'Patient deleted successfully' });
    } else {
      const index = memoryStore.patients.findIndex(p => p.id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Patient not found' });
      memoryStore.patients.splice(index, 1);
      return res.json({ message: 'Patient deleted successfully' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting patient', error: error.message });
  }
});

module.exports = router;
