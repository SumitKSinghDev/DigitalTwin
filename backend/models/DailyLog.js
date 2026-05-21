import mongoose from 'mongoose';
import { DailyLogMock } from '../config/memoryDb.js';

const dailyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Stored as "YYYY-MM-DD" for easy matching and range queries
    required: true,
  },
  studyHours: {
    type: Number,
    required: true,
    min: 0,
    max: 24,
    default: 0,
  },
  focusLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5,
  },
  sleepHours: {
    type: Number,
    required: true,
    min: 0,
    max: 24,
    default: 8,
  },
  stressLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5,
  },
  tasksCompleted: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  tasksTotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Composite unique index
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const MongooseDailyLog = mongoose.models.DailyLog || mongoose.model('DailyLog', dailyLogSchema);

// Dynamic database fallback interceptor
const DailyLog = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? DailyLogMock : MongooseDailyLog;
    if (prop === 'prototype') {
      return activeModel.prototype;
    }
    const value = activeModel[prop];
    if (typeof value === 'function') {
      return value.bind(activeModel);
    }
    return value;
  },
  construct: (target, args) => {
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? DailyLogMock : MongooseDailyLog;
    return new activeModel(...args);
  }
});

export default DailyLog;
