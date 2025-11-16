/**
 * ID Generator Utility
 * Generates unique IDs for patients, doctors, and emergency doctors
 * Format: DDMMYY + Type + Sequential Number
 * Examples:
 * - Patient: 011224p001 (01-12-24 Patient 001)
 * - Doctor: 011224d001 (01-12-24 Doctor 001)
 * - Emergency Doctor: 011224ed01 (01-12-24 Emergency Doctor 01)
 */

const generateUniqueId = async (type, User = null) => {
  try {
    // Get current date in DDMMYY format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const datePrefix = `${day}${month}${year}`;

    // Determine the type suffix and query
    let typeSuffix = '';
    let filterQuery = {};

    switch (type.toLowerCase()) {
      case 'patient':
        typeSuffix = 'p';
        filterQuery = { role: 'patient' };
        break;
      case 'doctor':
        typeSuffix = 'd';
        filterQuery = { role: 'doctor' };
        break;
      case 'emergency_doctor':
        typeSuffix = 'ed';
        filterQuery = { role: 'doctor', isEmergency: true };
        break;
      default:
        throw new Error('Invalid type: ' + type);
    }

    if (!User) {
      const User = require('../models/User');
    }

    // Find the latest ID for today's date with this type
    const regex = new RegExp(`^${datePrefix}${typeSuffix}(\\d+)$`);
    const existingUsers = await User.find({ 
      uniqueId: regex,
      ...filterQuery 
    }).sort({ uniqueId: -1 }).limit(1);

    let sequenceNumber = 1;
    if (existingUsers.length > 0) {
      const lastId = existingUsers[0].uniqueId;
      const lastSequence = parseInt(lastId.match(regex)[1]);
      sequenceNumber = lastSequence + 1;
    }

    // Format the sequence number with appropriate padding
    let sequenceStr = '';
    if (typeSuffix === 'ed') {
      sequenceStr = String(sequenceNumber).padStart(2, '0');
    } else {
      sequenceStr = String(sequenceNumber).padStart(3, '0');
    }

    const uniqueId = `${datePrefix}${typeSuffix}${sequenceStr}`;
    return uniqueId;
  } catch (error) {
    console.error('Error generating unique ID:', error);
    throw error;
  }
};

module.exports = { generateUniqueId };
