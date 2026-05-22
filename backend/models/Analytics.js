import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Stored as "YYYY-MM-DD"
    required: true,
  },
  productivityScore: {
    type: Number,
    required: true,
  },
  burnoutProbability: {
    type: Number,
    required: true,
  },
  focusConsistency: {
    type: Number,
    required: true,
  },
  sleepHours: {
    type: Number,
    default: 8,
  },
  stressLevel: {
    type: Number,
    default: 5,
  }
}, {
  timestamps: true,
});

const MongooseAnalytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);

let inMemoryAnalytics = [];

const AnalyticsMock = {
  find: (query) => {
    const userIdStr = query.userId ? query.userId.toString() : '';
    const filtered = inMemoryAnalytics.filter(a => a.userId === userIdStr);
    return {
      then: function (resolve) {
        resolve(filtered);
      }
    };
  },
  findOneAndUpdate: async (filter, updateData, options) => {
    const userIdStr = filter.userId ? filter.userId.toString() : '';
    const dateStr = filter.date;
    
    let index = inMemoryAnalytics.findIndex(a => a.userId === userIdStr && a.date === dateStr);
    let an;
    if (index !== -1) {
      inMemoryAnalytics[index] = {
        ...inMemoryAnalytics[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      an = inMemoryAnalytics[index];
    } else {
      an = {
        _id: Math.random().toString(36).substring(7),
        userId: userIdStr,
        date: dateStr,
        productivityScore: updateData.productivityScore || 0,
        burnoutProbability: updateData.burnoutProbability || 0,
        focusConsistency: updateData.focusConsistency || 100,
        sleepHours: updateData.sleepHours || 8,
        stressLevel: updateData.stressLevel || 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      inMemoryAnalytics.push(an);
    }
    return an;
  }
};

const Analytics = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? AnalyticsMock : MongooseAnalytics;
    if (prop === 'prototype') return activeModel.prototype;
    const value = activeModel[prop];
    if (typeof value === 'function') return value.bind(activeModel);
    return value;
  },
  construct: (target, args) => {
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? AnalyticsMock : MongooseAnalytics;
    return new activeModel(...args);
  }
});

export default Analytics;
