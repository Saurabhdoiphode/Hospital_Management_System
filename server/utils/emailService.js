const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email
exports.sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured. Would send:', { to, subject });
      return { success: true, message: 'Email service not configured' };
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment reminder
exports.sendAppointmentReminder = async (appointment, patient) => {
  const subject = 'Appointment Reminder - Hospital Management System';
  const html = `
    <h2>Appointment Reminder</h2>
    <p>Dear ${patient.user?.firstName} ${patient.user?.lastName},</p>
    <p>This is a reminder for your appointment:</p>
    <ul>
      <li><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</li>
      <li><strong>Time:</strong> ${appointment.appointmentTime}</li>
      <li><strong>Doctor:</strong> Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}</li>
    </ul>
    <p>Please arrive 15 minutes before your scheduled time.</p>
    <p>Thank you!</p>
  `;

  return await this.sendEmail(patient.user?.email, subject, html);
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetLink) => {
  const subject = 'Password Reset - Hospital Management System';
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    <p><a href="${resetLink}">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return await this.sendEmail(email, subject, html);
};

