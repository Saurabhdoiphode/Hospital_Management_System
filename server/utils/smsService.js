// SMS Service using Twilio (optional)
// Configure Twilio credentials in .env

exports.sendSMS = async (to, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('SMS not configured. Would send:', { to, message });
      return { success: true, message: 'SMS service not configured' };
    }

    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment reminder SMS
exports.sendAppointmentReminderSMS = async (appointment, patient) => {
  const message = `Reminder: Your appointment is on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime} with Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}. Please arrive 15 mins early.`;
  
  return await this.sendSMS(patient.user?.phone, message);
};

