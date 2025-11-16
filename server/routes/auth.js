const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { generateUniqueId } = require('../utils/idGenerator');

const router = require('express').Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(['admin', 'doctor', 'nurse', 'patient', 'receptionist', 'lab'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, role, phone, specialization, licenseNumber, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      specialization,
      licenseNumber,
      department
    });

    // Generate unique ID based on role
    let idType = role; // patient, doctor, etc.
    if (role === 'doctor' && req.body.isEmergency) {
      idType = 'emergency_doctor';
      user.isEmergency = true;
    }
    user.uniqueId = await generateUniqueId(idType, User);

    await user.save();

    // If user is a patient, create patient record
    if (role === 'patient') {
      try {
        const Patient = require('../models/Patient');
        const patientId = `PAT${Date.now().toString().slice(-6)}`;
        // Derive DOB from age if provided
        let dob = req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined;
        if (!dob && req.body.age) {
          const years = parseInt(req.body.age, 10);
          if (!isNaN(years)) {
            const d = new Date();
            d.setFullYear(d.getFullYear() - years);
            dob = d;
          }
        }
        const patient = new Patient({
          user: user._id,
          patientId,
          dateOfBirth: dob || new Date(),
          gender: req.body.gender || 'other',
          bloodGroup: req.body.bloodGroup,
          heightCm: req.body.heightCm,
          weightKg: req.body.weightKg
        });
        await patient.save();
        console.log('Patient record created during registration:', patient._id);
      } catch (patientError) {
        console.error('Error creating patient record:', patientError);
        // Continue anyway - patient record can be created on demand
      }
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        uniqueId: user.uniqueId,
        specialization: user.specialization,
        department: user.department,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        uniqueId: user.uniqueId,
        specialization: user.specialization,
        department: user.department,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If email exists, password reset link has been sent' });
    }

    const PasswordReset = require('../models/PasswordReset');
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    // Delete old tokens for this email
    await PasswordReset.deleteMany({ email });

    // Create new reset token
    const resetToken = new PasswordReset({
      email,
      token,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });

    await resetToken.save();

    // In production, send email with reset link
    // For now, return token (remove in production)
    res.json({ 
      message: 'Password reset link sent to email',
      token: token // Remove this in production, send via email instead
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;
    const PasswordReset = require('../models/PasswordReset');

    const resetToken = await PasswordReset.findOne({ 
      token, 
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findOne({ email: resetToken.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = password;
    await user.save();

    // Mark token as used
    resetToken.used = true;
    await resetToken.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change password (authenticated user)
router.post('/change-password', auth, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

