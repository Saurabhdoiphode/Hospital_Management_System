const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const MedicalRecord = require('../models/MedicalRecord');
const { generateBillPDF, generateMedicalRecordPDF } = require('../utils/pdfGenerator');
const { generateAppointmentsExcel, generateBillingExcel } = require('../utils/excelGenerator');
const Patient = require('../models/Patient');
const User = require('../models/User');

const router = express.Router();

// Export appointments to Excel
router.get('/appointments/excel', [auth, authorize('admin', 'receptionist')], async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .sort({ appointmentDate: -1 });

    const workbook = await generateAppointmentsExcel(appointments);
    
    if (!workbook) {
      return res.status(503).json({ message: 'Excel export not available. Please install exceljs package.' });
    }
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=appointments.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error generating Excel', error: error.message });
  }
});

// Export billing to Excel
router.get('/billing/excel', [auth, authorize('admin', 'receptionist')], async (req, res) => {
  try {
    const bills = await Billing.find()
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName')
      .sort({ invoiceDate: -1 });

    const workbook = await generateBillingExcel(bills);
    
    if (!workbook) {
      return res.status(503).json({ message: 'Excel export not available. Please install exceljs package.' });
    }
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=billing.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error generating Excel', error: error.message });
  }
});

// Export bill as PDF
router.get('/billing/:id/pdf', auth, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName email');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Check permissions
    if (req.user.role === 'patient') {
      const patientRecord = await Patient.findOne({ user: req.user._id });
      if (bill.patient._id.toString() !== patientRecord?._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    generateBillPDF(bill, bill.patient, (pdfData) => {
      if (!pdfData || pdfData.toString().includes('PDFKit not installed')) {
        return res.status(503).json({ message: 'PDF generation not available. Please install pdfkit package.' });
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=bill-${bill.invoiceNumber}.pdf`);
      res.send(pdfData);
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
});

// Export medical record as PDF
router.get('/medical-records/:id/pdf', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'patientId')
      .populate('patient.user', 'firstName lastName')
      .populate('doctor', 'firstName lastName');

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    generateMedicalRecordPDF(record, record.patient, record.doctor, (pdfData) => {
      if (!pdfData || pdfData.toString().includes('PDFKit not installed')) {
        return res.status(503).json({ message: 'PDF generation not available. Please install pdfkit package.' });
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=medical-record-${record._id}.pdf`);
      res.send(pdfData);
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
});

module.exports = router;

