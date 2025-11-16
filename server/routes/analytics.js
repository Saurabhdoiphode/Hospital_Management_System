const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Billing = require('../models/Billing');
const MedicalRecord = require('../models/MedicalRecord');
const { Inventory } = require('../models/Inventory');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total patients
    const totalPatients = await Patient.countDocuments();

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    // Pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // Total revenue (this month)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = await Billing.aggregate([
      {
        $match: {
          invoiceDate: { $gte: startOfMonth },
          status: { $in: ['paid', 'partial'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          paid: { $sum: { $sum: '$payments.amount' } }
        }
      }
    ]);

    // Low stock items
    const lowStockItems = await Inventory.countDocuments({
      status: 'low-stock'
    });

    // Total doctors
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: true });

    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patient.user', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalPatients,
      todayAppointments,
      pendingAppointments,
      monthlyRevenue: monthlyRevenue[0] || { total: 0, paid: 0 },
      lowStockItems,
      totalDoctors,
      recentAppointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointment statistics
router.get('/appointments', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Appointment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const appointmentTypes = await Appointment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$appointmentType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ statusStats: stats, typeStats: appointmentTypes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get revenue statistics
router.get('/revenue', [auth, authorize('admin', 'receptionist')], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const revenue = await Billing.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$invoiceDate' },
            month: { $month: '$invoiceDate' }
          },
          total: { $sum: '$total' },
          paid: { $sum: { $sum: '$payments.amount' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const statusStats = await Billing.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);

    res.json({ revenue, statusStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get patient statistics
router.get('/patients', auth, async (req, res) => {
  try {
    const genderStats = await Patient.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const bloodGroupStats = await Patient.aggregate([
      {
        $match: { bloodGroup: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ genderStats, bloodGroupStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

