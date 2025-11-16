const express = require('express');
const { body, validationResult } = require('express-validator');
const { LabTest, LabRequest } = require('../models/Laboratory');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all lab tests
router.get('/tests', auth, async (req, res) => {
  try {
    const tests = await LabTest.find().sort({ testName: 1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create lab test
router.post('/tests', [auth, authorize('admin', 'lab')], [
  body('testName').notEmpty(),
  body('testCode').notEmpty(),
  body('price').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const test = new LabTest(req.body);
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create lab request
router.post('/requests', [auth, authorize('admin', 'doctor')], [
  body('patient').notEmpty(),
  body('tests').isArray().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = new LabRequest({
      ...req.body,
      doctor: req.user._id
    });

    await request.save();
    const populatedRequest = await LabRequest.findById(request._id)
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName')
      .populate('doctor', 'firstName lastName');

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get lab requests
router.get('/requests', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    } else if (req.user.role === 'patient') {
      // Patients can only see their own lab requests
      const Patient = require('../models/Patient');
      const patientRecord = await Patient.findOne({ user: req.user._id });
      if (patientRecord) {
        filter.patient = patientRecord._id;
      } else {
        return res.json([]);
      }
    }

    const requests = await LabRequest.find(filter)
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('tests.test')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update test results
router.put('/requests/:id/results', [auth, authorize('admin', 'lab')], [
  body('testId').notEmpty(),
  body('results').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = await LabRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    const { testId, results, status = 'completed' } = req.body;
    const test = request.tests.id(testId);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found in request' });
    }

    test.results = results;
    test.status = status;
    test.completedAt = new Date();
    test.performedBy = req.user._id;

    // Update overall request status
    const allCompleted = request.tests.every(t => t.status === 'completed');
    if (allCompleted) {
      request.status = 'completed';
    } else {
      request.status = 'in-progress';
    }

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

