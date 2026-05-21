import mongoose from 'mongoose';
import { GoalMock } from '../config/memoryDb.js';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Study', 'Project', 'Wellness', 'Career', 'Other'],
    default: 'Study',
  },
  targetValue: {
    type: Number,
    required: true,
    min: 0.1,
  },
  currentValue: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    default: 'Hours',
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const MongooseGoal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);

// Dynamic database fallback interceptor
const Goal = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? GoalMock : MongooseGoal;
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
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? GoalMock : MongooseGoal;
    return new activeModel(...args);
  }
});

export default Goal;
