const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Get allowed origins from environment or use defaults
    const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001';
    const allowedOrigins = corsOriginEnv.split(',').map(o => o.trim());
    
    // Allow localhost in development
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168');
    
    if (allowedOrigins.indexOf(origin) !== -1 || isLocalhost) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin} not in allowed list: ${allowedOrigins.join(', ')}`);
      callback(null, true); // Still allow for now to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const state = (mongoose.connection && mongoose.connection.readyState) || 0;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ ok: true, db: states[state] });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/medical-records', require('./routes/medicalRecords'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));
app.use('/api/pharmacy', require('./routes/pharmacy'));
app.use('/api/laboratory', require('./routes/laboratory'));
app.use('/api/wards', require('./routes/wards'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/appointment-features', require('./routes/appointmentFeatures'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/export', require('./routes/export'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/medical-dashboard', require('./routes/medicalDashboard'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/discharge', require('./routes/discharge'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/roster', require('./routes/roster'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management';
console.log('Connecting to MongoDB...');
console.log('MongoDB cluster:', mongoUri.includes('@') ? mongoUri.split('@')[1].split('/')[0] : 'local');

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  retryWrites: true,
  w: 'majority',
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  maxPoolSize: 10,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('\n⚠️  MONGODB ERROR SOLUTION:');
  console.error('1. Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
  console.error('2. Click on "Security" → "Network Access"');
  console.error('3. Add your current IP address or use 0.0.0.0/0 for development');
  console.error('4. Verify database user credentials are correct');
  console.error('5. Check connection string in .env file\n');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io (optional - won't break if it fails)
try {
  const { initializeSocket } = require('./utils/socket');
  initializeSocket(server);
  console.log('Socket.io initialized');
} catch (error) {
  console.warn('Socket.io initialization failed (optional feature):', error.message);
}

