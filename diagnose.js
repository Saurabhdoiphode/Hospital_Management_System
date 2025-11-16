#!/usr/bin/env node

/**
 * Hospital Management System - Server Diagnostic Tool
 * Run this to check if your server will work before starting
 */

const http = require('http');
const https = require('https');

console.log('\n========================================');
console.log('Hospital Management System - Diagnostics');
console.log('========================================\n');

// Check Node version
const nodeVersion = process.version;
console.log(`✓ Node.js Version: ${nodeVersion}`);

// Check environment
const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI ? '✓ Set' : '✗ NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? '✓ Set' : '✗ NOT SET',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'Not set (using defaults)'
};

console.log('\n--- Environment Variables ---');
Object.entries(env).forEach(([key, value]) => {
  if (value === '✓ Set' || value === '✗ NOT SET') {
    console.log(`${key}: ${value}`);
  } else {
    console.log(`${key}: ${value}`);
  }
});

// Check if ports are available
console.log('\n--- Port Availability ---');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`✗ Port ${port}: IN USE (close other apps using this port)`);
        resolve(false);
      } else {
        console.log(`? Port ${port}: Error - ${err.message}`);
        resolve(false);
      }
    });
    server.once('listening', () => {
      console.log(`✓ Port ${port}: Available`);
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function runDiagnostics() {
  const port5000 = await checkPort(5000);
  const port3000 = await checkPort(3000);

  // Check MongoDB connection
  console.log('\n--- MongoDB Connection ---');
  if (process.env.MONGODB_URI) {
    console.log('✓ MongoDB URI is configured');
    console.log(`  Database: hospital-management`);
  } else {
    console.log('✗ MongoDB URI not configured in .env');
  }

  // Summary
  console.log('\n--- Diagnostics Summary ---');
  let ready = true;

  if (!port5000) {
    console.log('⚠ Port 5000 is in use. Try:');
    console.log('  - Close other apps using port 5000');
    console.log('  - Or change PORT in .env file');
    ready = false;
  }

  if (!port3000) {
    console.log('⚠ Port 3000 is in use. Try:');
    console.log('  - Close other React apps');
    console.log('  - Or create .env in client folder with: PORT=3001');
    ready = false;
  }

  if (!process.env.MONGODB_URI) {
    console.log('⚠ MongoDB URI not set in .env - server will fail to connect');
    ready = false;
  }

  if (ready) {
    console.log('\n✓ All checks passed! Your system should be ready to run.');
    console.log('\nNext steps:');
    console.log('1. Terminal 1: npm run server');
    console.log('2. Terminal 2: cd client && npm start');
    console.log('3. Open: http://localhost:3000');
  } else {
    console.log('\n✗ Some issues found. Please fix them before starting.');
  }

  console.log('\n========================================\n');
}

runDiagnostics().catch(console.error);
