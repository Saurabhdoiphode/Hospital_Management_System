#!/usr/bin/env node

/**
 * Test MongoDB Connection
 * Run this to verify if MongoDB Atlas is accessible
 */

const mongoose = require('mongoose');
require('dotenv').config();

console.log('\n========================================');
console.log('MongoDB Connection Test');
console.log('========================================\n');

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

console.log('Testing connection...\n');

// Extract cluster info from URI
const clusterMatch = mongoUri.match(/cluster(\d+)/);
const userMatch = mongoUri.match(/mongodb\+srv:\/\/([^:]+):/);
const cluster = clusterMatch ? `cluster${clusterMatch[1]}` : 'unknown';
const user = userMatch ? userMatch[1] : 'unknown';

console.log(`User: ${user}`);
console.log(`Cluster: ${cluster}`);
console.log('Connecting...\n');

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ MongoDB Connection SUCCESSFUL!\n');
  console.log('Details:');
  console.log(`  Host: ${mongoose.connection.host}`);
  console.log(`  DB: ${mongoose.connection.db.databaseName}`);
  console.log(`  State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
  
  console.log('\n✅ You can now start the server with: npm run server\n');
  mongoose.connection.close();
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB Connection FAILED!\n');
  console.error('Error:', err.message);
  
  // Provide specific help based on error
  if (err.message.includes('whitelisted')) {
    console.error('\n🔴 SOLUTION:');
    console.error('1. Go to: https://www.mongodb.com/cloud/atlas');
    console.error('2. Login and go to your cluster');
    console.error('3. Click "Security" → "Network Access"');
    console.error('4. Click "+ ADD IP ADDRESS"');
    console.error('5. Click "Use Current IP Address"');
    console.error('6. Wait 2-3 minutes and try again\n');
  } else if (err.message.includes('authentication')) {
    console.error('\n🔴 SOLUTION:');
    console.error('1. Check .env file for correct password');
    console.error('2. Go to MongoDB Atlas → Database Users');
    console.error('3. Reset password if needed');
    console.error('4. Update .env with new password\n');
  } else if (err.message.includes('getaddrinfo')) {
    console.error('\n🔴 SOLUTION:');
    console.error('1. Check internet connection');
    console.error('2. Check MongoDB URI spelling in .env');
    console.error('3. Try again in a few minutes\n');
  }
  
  process.exit(1);
});

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});
