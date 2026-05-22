import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import User from './models/User.js';

dotenv.config();

const API_BASE = `http://localhost:${process.env.PORT || 5000}/api`;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runMlIntegrationTests() {
  console.log('\n====================================================');
  console.log('   DIGITAL TWIN: END-TO-END ML SERVICE INTEGRATION  ');
  console.log('====================================================\n');

  // Step 1: Wipe database cleanly or register user
  const email = 'twinmlstudent@gmail.com';
  console.log(`👤 Registering test integration user: ${email}...`);
  
  const registerPayload = {
    name: 'Twin ML Student',
    email: email,
    password: 'password123'
  };

  let token = null;
  
  try {
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload)
    });
    const registerData = await regRes.json();
    
    if (regRes.status !== 201 && regRes.status !== 200) {
      // If user already exists, let's try standard login
      console.log('ℹ️ User might already be registered. Trying direct login...');
    } else {
      console.log('✅ Registration successful. Retrieving OTP...');
      // Extract OTP
      let otpCode = null;
      if (process.env.USE_MEMORY_DB === 'true') {
        const dbData = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
        const user = dbData.users.find(u => u.email.toLowerCase() === email);
        otpCode = user.otpCode;
      } else {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email });
        otpCode = user.otpCode;
        await mongoose.disconnect();
      }
      
      console.log(`🔑 Verification code: ${otpCode}. Sending OTP verification...`);
      const verifyRes = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });
      const verifyData = await verifyRes.json();
      token = verifyData.token;
      console.log('✅ OTP Verified. Session initialized.');
    }
  } catch (error) {
    console.warn(`⚠️ Register/OTP flow returned an issue (e.g. user already verified): ${error.message}`);
  }

  // If we didn't get token from registration, perform classic login
  if (!token) {
    console.log('🔑 Performing classic password login...');
    try {
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      const loginData = await loginRes.json();
      token = loginData.token;
      console.log('✅ Login successful. Session refreshed.');
    } catch (error) {
      console.error(`❌ Login failed: ${error.message}`);
      process.exit(1);
    }
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Step 2: Post 7 days of daily logs (Simulate high study, variable sleep and stress)
  console.log('\n📊 Logging 7 days of telemetry journals to feed the digital twin...');
  const logsToSubmit = [
    { date: '2026-05-15', studyHours: 3.5, focusLevel: 6, sleepHours: 7.8, stressLevel: 4, tasksCompleted: 2, tasksTotal: 3 },
    { date: '2026-05-16', studyHours: 5.0, focusLevel: 7, sleepHours: 7.2, stressLevel: 5, tasksCompleted: 3, tasksTotal: 4 },
    { date: '2026-05-17', studyHours: 4.8, focusLevel: 7, sleepHours: 8.0, stressLevel: 3, tasksCompleted: 4, tasksTotal: 5 },
    { date: '2026-05-18', studyHours: 7.0, focusLevel: 8, sleepHours: 5.5, stressLevel: 6, tasksCompleted: 5, tasksTotal: 6 },
    { date: '2026-05-19', studyHours: 8.5, focusLevel: 9, sleepHours: 4.8, stressLevel: 8, tasksCompleted: 6, tasksTotal: 7 },
    { date: '2026-05-20', studyHours: 9.0, focusLevel: 8, sleepHours: 4.2, stressLevel: 9, tasksCompleted: 5, tasksTotal: 8 },
    { date: '2026-05-21', studyHours: 8.0, focusLevel: 9, sleepHours: 5.0, stressLevel: 8, tasksCompleted: 7, tasksTotal: 8 },
  ];

  for (const log of logsToSubmit) {
    try {
      const logRes = await fetch(`${API_BASE}/logs`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(log)
      });
      if (logRes.ok) {
        console.log(`   -> Saved log for ${log.date} (Study: ${log.studyHours}h, Focus: ${log.focusLevel})`);
      } else {
        const errData = await logRes.json();
        console.error(`   ❌ Failed log for ${log.date}:`, errData.message);
      }
    } catch (error) {
      console.error(`   ❌ Log saving error for ${log.date}:`, error.message);
    }
  }

  // Step 3: Create a Dynamic Objective (Goal)
  console.log('\n🎯 Establishing a dynamic learning objective (Goal)...');
  const goalPayload = {
    title: 'Complete LeetCode 75 Sprint',
    category: 'Career',
    targetValue: 75,
    unit: 'Problems',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 10 days from now
  };

  let goalId = null;
  try {
    const goalRes = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(goalPayload)
    });
    const goalData = await goalRes.json();
    if (goalRes.ok) {
      goalId = goalData._id;
      console.log(`✅ Goal established successfully! (ID: ${goalId})`);
    } else {
      console.error('❌ Goal creation failed:', goalData.message);
    }
  } catch (error) {
    console.error('❌ Goal API failed:', error.message);
  }

  // Increment goal currentValue to give the ML predictor some progress ratios
  if (goalId) {
    console.log('📈 Progressing goal to 35/75 (46.6% completion ratio)...');
    try {
      await fetch(`${API_BASE}/goals/${goalId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ currentValue: 35 })
      });
    } catch (err) {
      console.error('❌ Goal progress update failed:', err.message);
    }
  }

  // Step 4: Retrieve Twin State (Triggers FastAPI Predictions)
  console.log('\n🧠 Triggering FastAPI Digital Twin Telemetry & Predictive Analytics...');
  try {
    const twinRes = await fetch(`${API_BASE}/twin`, {
      method: 'GET',
      headers: authHeaders
    });
    const twinData = await twinRes.json();
    
    console.log('\n----------------------------------------------------');
    console.log('   RETRIEVED DIGITAL TWIN PREDICTIONS FROM FASTAPI  ');
    console.log('----------------------------------------------------');
    console.log(`Productivity Forecast : ${twinData.productivityScore}% (Regression Prediction)`);
    console.log(`Burnout Risk Level    : ${twinData.burnout.level} Risk (Classification Prediction)`);
    console.log(`Burnout Index Score   : ${twinData.burnout.score}%`);
    console.log(`Active streak         : ${twinData.activeStreak} consecutive days`);
    console.log(`Consistency Index     : ${twinData.consistencyIndex}%`);
    console.log(`Twin Status State     : ${twinData.twinStatus}`);
    console.log(`Daily AI Summary      : "${twinData.dailySummary}"`);
    console.log('\nBehavioral Patterns Extracted:');
    twinData.patterns.forEach((pat, i) => {
      console.log(`  [Pattern #${i+1}] ${pat}`);
    });
    console.log('\nReal-Time Actionable Recommendations:');
    twinData.recommendations.forEach((rec, i) => {
      console.log(`  [Rec #${i+1}] ${rec}`);
    });
    console.log('----------------------------------------------------\n');
  } catch (error) {
    console.error('❌ Twin Telemetry Retrieval failed:', error.message);
  }

  // Step 5: Retrieve Goals checklist and inspect Success Probability
  console.log('🔮 Fetching goals checklist with ML-predicted achievement likelihoods...');
  try {
    const goalsRes = await fetch(`${API_BASE}/goals`, {
      method: 'GET',
      headers: authHeaders
    });
    const goalsList = await goalsRes.json();
    
    console.log('\n----------------------------------------------------');
    console.log('   RETRIEVED GOAL SUCCESS PREDICTIONS FROM FASTAPI  ');
    console.log('----------------------------------------------------');
    goalsList.forEach((goal) => {
      console.log(`Goal: "${goal.title}"`);
      console.log(`  Progress: ${goal.currentValue}/${goal.targetValue} ${goal.unit}`);
      console.log(`  ML Predicted Achievement Probability: \x1b[36m\x1b[1m${goal.successProbability}%\x1b[0m`);
    });
    console.log('----------------------------------------------------\n');
  } catch (error) {
    console.error('❌ Goals telemetry fetch failed:', error.message);
  }

  console.log('====================================================');
  console.log('   🎉 ALL END-TO-END ML INTEGRATION TESTS COMPLETED  ');
  console.log('====================================================\n');
  process.exit(0);
}

// Wait for a split second to make sure Express nodemon has completely initialized
setTimeout(runMlIntegrationTests, 1500);
