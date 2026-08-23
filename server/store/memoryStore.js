const bcrypt = require('bcryptjs');

// Helper to hash password synchronously for seed data
const hashPassword = (plain) => bcrypt.hashSync(plain, 10);

class MemoryStore {
  constructor() {
    this.users = [
      { id: 'u-1', name: 'Dr. Sarah Connor', email: 'admin@hospital.com', password: hashPassword('Admin123'), role: 'admin', department: 'Administration', phone: '+1 555-0101' },
      { id: 'u-2', name: 'Dr. Robert Ford', email: 'doctor@hospital.com', password: hashPassword('Doctor123'), role: 'doctor', department: 'Cardiology', phone: '+1 555-0102', specialization: 'Cardiologist' },
      { id: 'u-3', name: 'Nurse Clara Oswald', email: 'nurse@hospital.com', password: hashPassword('Nurse123'), role: 'nurse', department: 'ICU', phone: '+1 555-0103' },
      { id: 'u-4', name: 'James Gordon', email: 'receptionist@hospital.com', password: hashPassword('Recept123'), role: 'receptionist', department: 'Front Desk', phone: '+1 555-0104' },
      { id: 'u-5', name: 'John Doe', email: 'patient@hospital.com', password: hashPassword('Patient123'), role: 'patient', department: 'N/A', phone: '+1 555-0105' },
      { id: 'u-6', name: 'Dr. Alan Grant', email: 'lab@hospital.com', password: hashPassword('Lab123'), role: 'lab', department: 'Pathology & Diagnostics', phone: '+1 555-0106' },
      { id: 'u-7', name: 'Pharmacist Mary Jane', email: 'pharmacy@hospital.com', password: hashPassword('Pharma123'), role: 'pharmacist', department: 'Medical Pharmacy Store', phone: '+1 555-0107' }
    ];

    this.patients = [
      {
        id: 'p-101',
        name: 'John Doe',
        email: 'patient@hospital.com',
        age: 34,
        gender: 'Male',
        phone: '+1 555-0105',
        address: '123 Health Ave, Metro City',
        bloodGroup: 'O+',
        medicalHistory: ['Hypertension', 'Seasonal Allergies'],
        emergencyContact: { name: 'Jane Doe', relation: 'Spouse', phone: '+1 555-0999' },
        insurance: { provider: 'BlueCross', policyNumber: 'BC-887492' },
        createdAt: new Date().toISOString()
      },
      {
        id: 'p-102',
        name: 'Emily Watson',
        email: 'emily.w@example.com',
        age: 28,
        gender: 'Female',
        phone: '+1 555-0202',
        address: '456 Oak Lane, Metro City',
        bloodGroup: 'A+',
        medicalHistory: ['Asthma'],
        emergencyContact: { name: 'David Watson', relation: 'Father', phone: '+1 555-0888' },
        insurance: { provider: 'Aetna', policyNumber: 'AE-33211' },
        createdAt: new Date().toISOString()
      },
      {
        id: 'p-103',
        name: 'Michael Chang',
        email: 'michael.c@example.com',
        age: 52,
        gender: 'Male',
        phone: '+1 555-0303',
        address: '789 Pine Road, Suburbia',
        bloodGroup: 'B-',
        medicalHistory: ['Type 2 Diabetes'],
        emergencyContact: { name: 'Grace Chang', relation: 'Wife', phone: '+1 555-0777' },
        insurance: { provider: 'UnitedHealth', policyNumber: 'UH-90812' },
        createdAt: new Date().toISOString()
      }
    ];

    this.appointments = [
      {
        id: 'apt-1',
        patientId: 'p-101',
        patientName: 'John Doe',
        doctorId: 'u-2',
        doctorName: 'Dr. Robert Ford',
        date: '2026-08-25',
        time: '10:00 AM',
        type: 'consultation',
        status: 'Scheduled',
        notes: 'Routine cardiac follow-up and ECG check.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'apt-2',
        patientId: 'p-102',
        patientName: 'Emily Watson',
        doctorId: 'u-2',
        doctorName: 'Dr. Robert Ford',
        date: '2026-08-26',
        time: '02:30 PM',
        type: 'checkup',
        status: 'Completed',
        notes: 'General checkup and asthma inhaler review.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'apt-3',
        patientId: 'p-103',
        patientName: 'Michael Chang',
        doctorId: 'u-2',
        doctorName: 'Dr. Robert Ford',
        date: '2026-08-27',
        time: '11:15 AM',
        type: 'follow-up',
        status: 'Scheduled',
        notes: 'Blood glucose level evaluation.',
        createdAt: new Date().toISOString()
      }
    ];

    this.medicalRecords = [
      {
        id: 'mr-1',
        patientId: 'p-101',
        patientName: 'John Doe',
        doctorId: 'u-2',
        doctorName: 'Dr. Robert Ford',
        date: '2026-08-20',
        diagnosis: 'Mild Essential Hypertension',
        symptoms: ['Slight headaches', 'Occasional dizziness'],
        prescriptions: [
          { medicine: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
          { medicine: 'Multivitamin', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' }
        ],
        labResults: [
          { testName: 'Lipid Panel', result: 'Cholesterol 195 mg/dL (Normal)', date: '2026-08-19' },
          { testName: 'ECG', result: 'Normal Sinus Rhythm', date: '2026-08-19' }
        ],
        vitals: { bloodPressure: '130/85', heartRate: '72 bpm', temperature: '98.6 °F', weight: '78 kg', oxygen: '98%' },
        createdAt: new Date().toISOString()
      }
    ];

    this.billing = [
      {
        id: 'inv-1001',
        patientId: 'p-101',
        patientName: 'John Doe',
        invoiceDate: '2026-08-20',
        dueDate: '2026-09-05',
        items: [
          { description: 'Cardiology Consultation', amount: 150 },
          { description: 'ECG Diagnostic Test', amount: 100 },
          { description: 'Lipid Profile Test', amount: 80 }
        ],
        totalAmount: 330,
        paidAmount: 330,
        status: 'Paid',
        paymentMethod: 'Credit Card',
        insuranceClaim: { claimed: true, claimStatus: 'Approved', coveredAmount: 200 },
        createdAt: new Date().toISOString()
      },
      {
        id: 'inv-1002',
        patientId: 'p-102',
        patientName: 'Emily Watson',
        invoiceDate: '2026-08-22',
        dueDate: '2026-09-10',
        items: [
          { description: 'General Checkup', amount: 120 },
          { description: 'Spirometry Asthma Test', amount: 130 }
        ],
        totalAmount: 250,
        paidAmount: 0,
        status: 'Pending',
        paymentMethod: 'Insurance',
        insuranceClaim: { claimed: true, claimStatus: 'Pending', coveredAmount: 0 },
        createdAt: new Date().toISOString()
      }
    ];

    this.inventory = [
      { id: 'inv-1', name: 'Paracetamol 500mg', category: 'Medicine', stockQuantity: 450, minStockAlert: 100, unitPrice: 2.5, supplier: 'PharmaPlus Corp', location: 'Shelf A1' },
      { id: 'inv-2', name: 'Amoxicillin 250mg', category: 'Medicine', stockQuantity: 35, minStockAlert: 50, unitPrice: 8.0, supplier: 'MedSupply Co', location: 'Shelf B3' },
      { id: 'inv-3', name: 'Digital Sphygmomanometer', category: 'Equipment', stockQuantity: 12, minStockAlert: 5, unitPrice: 45.0, supplier: 'BioTech Instruments', location: 'Room 102' },
      { id: 'inv-4', name: 'Surgical Gloves (Box of 100)', category: 'Consumables', stockQuantity: 18, minStockAlert: 20, unitPrice: 15.0, supplier: 'SafeCare Supplies', location: 'Storage Room 2' },
      { id: 'inv-5', name: 'N95 Respirator Masks', category: 'Consumables', stockQuantity: 120, minStockAlert: 40, unitPrice: 3.0, supplier: 'SafeCare Supplies', location: 'Storage Room 1' }
    ];
  }

  generateId(prefix = 'id') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  }
}

const instance = new MemoryStore();
module.exports = instance;
