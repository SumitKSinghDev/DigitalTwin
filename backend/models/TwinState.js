import mongoose from 'mongoose';

const twinStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  twinStatus: {
    type: String,
    default: 'Balanced',
  },
  colorTheme: {
    type: String,
    default: 'indigo',
  },
  glowIntensity: {
    type: Number,
    default: 80,
  },
  lastSyncTime: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

const MongooseTwinState = mongoose.models.TwinState || mongoose.model('TwinState', twinStateSchema);

let inMemoryTwinStates = [];

const TwinStateMock = {
  findOne: async (query) => {
    const userIdStr = query.userId ? query.userId.toString() : '';
    const found = inMemoryTwinStates.find(ts => ts.userId === userIdStr);
    if (found) {
      return {
        ...found,
        save: async function() {
          const idx = inMemoryTwinStates.findIndex(ts => ts._id === this._id);
          if (idx !== -1) {
            inMemoryTwinStates[idx] = { ...inMemoryTwinStates[idx], ...this, lastSyncTime: new Date() };
          }
          return this;
        }
      };
    }
    return null;
  },
  findOneAndUpdate: async (filter, updateData, options) => {
    const userIdStr = filter.userId ? filter.userId.toString() : '';
    let tsIndex = inMemoryTwinStates.findIndex(ts => ts.userId === userIdStr);
    
    let ts;
    if (tsIndex !== -1) {
      inMemoryTwinStates[tsIndex] = {
        ...inMemoryTwinStates[tsIndex],
        ...updateData,
        lastSyncTime: new Date(),
        updatedAt: new Date().toISOString()
      };
      ts = inMemoryTwinStates[tsIndex];
    } else {
      ts = {
        _id: Math.random().toString(36).substring(7),
        userId: userIdStr,
        twinStatus: updateData.twinStatus || 'Balanced',
        colorTheme: updateData.colorTheme || 'indigo',
        glowIntensity: updateData.glowIntensity || 80,
        lastSyncTime: new Date(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      inMemoryTwinStates.push(ts);
    }
    return ts;
  }
};

const TwinState = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? TwinStateMock : MongooseTwinState;
    if (prop === 'prototype') return activeModel.prototype;
    const value = activeModel[prop];
    if (typeof value === 'function') return value.bind(activeModel);
    return value;
  },
  construct: (target, args) => {
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? TwinStateMock : MongooseTwinState;
    return new activeModel(...args);
  }
});

export default TwinState;
