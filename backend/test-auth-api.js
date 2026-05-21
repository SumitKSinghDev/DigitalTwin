import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import User from './models/User.js';

dotenv.config();

const API_BASE = `http://localhost:${process.env.PORT || 5000}/api/auth`;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('\n====================================================');
  console.log('   DIGITAL TWIN: PROGRAMMATIC AUTH SUITE VERIFIER   ');
  console.log('====================================================\n');

  // Step 1: Wipe database cleanly
  console.log('🔄 Wiping database for test baseline...');
  try {
    const resetRes = await fetch(`${API_BASE}/reset-database`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const resetData = await resetRes.json();
    console.log(`✅ Database Wipe Result: ${resetData.message}\n`);
  } catch (error) {
    console.error(`❌ Database wipe failed: ${error.message}`);
    process.exit(1);
  }

  // Step 2: Register a new user
  console.log('👤 Registering custom user: Test Student (teststudent@gmail.com)...');
  const registerPayload = {
    name: 'Test Student',
    email: 'teststudent@gmail.com',
    password: 'password123'
  };

  let registerData;
  try {
    const regRes = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload)
    });
    registerData = await regRes.json();
    console.log(`✅ Registration Response status: ${regRes.status}`);
    console.log(`✅ Received Payload:`, JSON.stringify(registerData, null, 2));
    
    if (regRes.status !== 201 && regRes.status !== 200) {
      console.error('❌ Failed registration status constraint!');
      process.exit(1);
    }
    if (!registerData.otpRequired) {
      console.error('❌ Expected otpRequired parameter missing!');
      process.exit(1);
    }
    console.log('   -> OTP requested by server. Verification flow active.\n');
  } catch (error) {
    console.error(`❌ Registration API failed: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Retrieve OTP from Database
  console.log('🔑 Retrieving verification code from active database...');
  let otpCode = null;
  
  if (process.env.USE_MEMORY_DB === 'true') {
    console.log('   [Mode: Local db.json Fallback]');
    try {
      const dbData = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
      const user = dbData.users.find(u => u.email.toLowerCase() === 'teststudent@gmail.com');
      if (!user) {
        console.error('❌ Test user was not saved in db.json!');
        process.exit(1);
      }
      otpCode = user.otpCode;
    } catch (e) {
      console.error(`❌ Failed to read db.json: ${e.message}`);
      process.exit(1);
    }
  } else {
    console.log('   [Mode: MongoDB Atlas Cloud]');
    try {
      await mongoose.connect(process.env.MONGO_URI);
      const user = await User.findOne({ email: 'teststudent@gmail.com' });
      if (!user) {
        console.error('❌ Test user was not found in MongoDB!');
        await mongoose.disconnect();
        process.exit(1);
      }
      otpCode = user.otpCode;
      await mongoose.disconnect();
    } catch (e) {
      console.error(`❌ Failed to query MongoDB Atlas: ${e.message}`);
      process.exit(1);
    }
  }

  console.log(`✅ Successfully extracted verification OTP code: \x1b[36m\x1b[1m${otpCode}\x1b[0m\n`);

  // Step 4: Verify OTP
  console.log('🛡️ Posting verification OTP code back to server...');
  try {
    const verifyRes = await fetch(`${API_BASE}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teststudent@gmail.com',
        otp: otpCode
      })
    });
    const verifyData = await verifyRes.json();
    console.log(`✅ Verification Response status: ${verifyRes.status}`);
    console.log(`✅ Verification Session Data:`, JSON.stringify(verifyData, null, 2));

    if (verifyRes.status !== 200) {
      console.error('❌ Failed OTP verification status constraint!');
      process.exit(1);
    }
    if (!verifyData.token) {
      console.error('❌ Expected JWT Session Token missing in verified payload!');
      process.exit(1);
    }
    console.log('   -> Account verified. JWT session initialized.\n');
  } catch (error) {
    console.error(`❌ Verification API failed: ${error.message}`);
    process.exit(1);
  }

  // Step 5: Test standard Login
  console.log('🔑 Testing standard password login flow...');
  try {
    const loginRes = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teststudent@gmail.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log(`✅ Login Response status: ${loginRes.status}`);
    console.log(`✅ Login Session Data:`, JSON.stringify(loginData, null, 2));

    if (loginRes.status !== 200) {
      console.error('❌ Failed standard credentials login constraint!');
      process.exit(1);
    }
    if (!loginData.token) {
      console.error('❌ Expected JWT session token missing in login payload!');
      process.exit(1);
    }
    console.log('   -> Login validated. JWT session refreshed.\n');
  } catch (error) {
    console.error(`❌ Login API failed: ${error.message}`);
    process.exit(1);
  }

  console.log('====================================================');
  console.log('   🛡️ ALL SECURITY AUTH VERIFICATION CHECKS PASSED  ');
  console.log('====================================================\n');
  process.exit(0);
}

// Give Nodemon a split second to apply hot-reloads before starting test runs
setTimeout(runTests, 1500);
