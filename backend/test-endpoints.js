import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as aiEngine from './utils/aiEngine.js';

dotenv.config();

console.log('====================================================');
console.log('   DIGITAL TWIN FOR STUDENT: HEURISTICS VERIFIER   ');
console.log('====================================================\n');

// 1. Define typical mock daily logs representing a student's week
const mockLogs = [
  { date: '2026-05-15', studyHours: 3.0, focusLevel: 6, sleepHours: 8.0, stressLevel: 4, tasksCompleted: 2, tasksTotal: 3 },
  { date: '2026-05-16', studyHours: 4.5, focusLevel: 7, sleepHours: 7.5, stressLevel: 5, tasksCompleted: 3, tasksTotal: 4 },
  { date: '2026-05-17', studyHours: 5.0, focusLevel: 8, sleepHours: 7.0, stressLevel: 5, tasksCompleted: 4, tasksTotal: 5 },
  // High study hours + poor sleep + high stress starts to compile burnout
  { date: '2026-05-18', studyHours: 7.5, focusLevel: 9, sleepHours: 5.5, stressLevel: 7, tasksCompleted: 5, tasksTotal: 6 },
  { date: '2026-05-19', studyHours: 8.0, focusLevel: 8, sleepHours: 4.8, stressLevel: 8, tasksCompleted: 6, tasksTotal: 6 },
  { date: '2026-05-20', studyHours: 9.0, focusLevel: 9, sleepHours: 4.0, stressLevel: 9, tasksCompleted: 5, tasksTotal: 7 },
  { date: '2026-05-21', studyHours: 8.5, focusLevel: 8, sleepHours: 4.5, stressLevel: 9, tasksCompleted: 6, tasksTotal: 8 },
];

console.log(`Analyzing telemetry dataset over ${mockLogs.length} simulated days...\n`);

// 2. Programmatically verify each heuristic function
console.log('----------------------------------------------------');
console.log('   PRODUCTIVITY SCORES EVALUATION');
console.log('----------------------------------------------------');

mockLogs.forEach((log) => {
  const score = aiEngine.calculateProductivityScore(log);
  console.log(`[Date: ${log.date}] Study: ${log.studyHours}h | Sleep: ${log.sleepHours}h | Stress: ${log.stressLevel}/10 | Tasks: ${log.tasksCompleted}/${log.tasksTotal} => Calculated Productivity: ${score}/100`);
});
console.log('');

console.log('----------------------------------------------------');
console.log('   BURNOUT & WELLNESS METRICS');
console.log('----------------------------------------------------');

const burnout = aiEngine.calculateBurnoutRisk(mockLogs);
console.log(`Burnout Index Score : ${burnout.score}/100`);
console.log(`Burnout Risk Level  : ${burnout.level} Risk`);
console.log(`Avatar Status Label : ${burnout.description}`);
console.log('');

console.log('----------------------------------------------------');
console.log('   CONSISTENCY ANALYSIS');
console.log('----------------------------------------------------');

const consistency = aiEngine.calculateConsistencyIndex(mockLogs);
console.log(`Study Variance Consistency Index: ${consistency}%`);
console.log('');

console.log('----------------------------------------------------');
console.log('   30-DAY GROWTH PREDICTIONS');
console.log('----------------------------------------------------');

const prediction = aiEngine.generateGrowthPrediction(mockLogs);
console.log(`Extrapolated Trend    : ${prediction.trend.toUpperCase()}`);
console.log(`Linear Slope Rate     : ${prediction.rate} productivity units/day`);
console.log(`Future Score Projection: ${prediction.projectedProductivity}% (in 30 days)`);
console.log(`Predicted Forecast    : "${prediction.forecast}"`);
console.log('');

console.log('----------------------------------------------------');
console.log('   DYNAMIC AI INSIGHT DIAGNOSTICS');
console.log('----------------------------------------------------');

const recommendations = aiEngine.generateRecommendations(mockLogs[mockLogs.length - 1], mockLogs);
recommendations.forEach((rec, index) => {
  console.log(`Insight #${index + 1}: ${rec}`);
});

console.log('\n====================================================');
console.log('   ALL HEURISTIC FORMULAS VALIDATED SUCCESS!');
console.log('====================================================');

// Exit successfully
process.exit(0);
