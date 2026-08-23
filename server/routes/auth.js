const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');
const memoryStore = require('../store/memoryStore');
const User = require('../models/User');

const router = express.Router();

// Helper to check if Mongoose is connected
const isMongoConnected = () => require('mongoose').connection.readyState === 1;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, phone, specialization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const assignedRole = role || 'patient';

    if (isMongoConnected()) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
        department: department || 'General',
        phone,
        specialization
      });
      await newUser.save();

      const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '24h' });
      return res.status(201).json({
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, department: newUser.department, phone: newUser.phone }
      });
    } else {
      const existingUser = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = {
        id: memoryStore.generateId('u'),
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
        department: department || 'General',
        phone,
        specialization
      };
      memoryStore.users.push(newUser);

      // If registered as patient, also create a patient profile entry
      if (assignedRole === 'patient') {
        memoryStore.patients.push({
          id: memoryStore.generateId('p'),
          name,
          email,
          age: 30,
          gender: 'Unspecified',
          phone: phone || '+1 555-0000',
          address: 'Default Address',
          bloodGroup: 'O+',
          medicalHistory: [],
          emergencyContact: { name: 'Emergency Contact', relation: 'Relative', phone: phone || '+1 555-0000' },
          insurance: { provider: 'None', policyNumber: 'N/A' },
          createdAt: new Date().toISOString()
        });
      }

      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '24h' });
      return res.status(201).json({
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, department: newUser.department, phone: newUser.phone }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = null;
    let isPasswordValid = false;

    if (isMongoConnected()) {
      user = await User.findOne({ email });
      if (user) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
    } else {
      user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        isPasswordValid = bcrypt.compareSync(password, user.password);
      }
    }

    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        specialization: user.specialization
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    let user = null;
    if (isMongoConnected()) {
      user = await User.findById(req.user.id).select('-password');
    } else {
      user = memoryStore.users.find(u => u.id === req.user.id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
    return res.json(userWithoutPassword);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

module.exports = router;
