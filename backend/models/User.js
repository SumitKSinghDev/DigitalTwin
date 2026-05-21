import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserMock } from '../config/memoryDb.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    trim: true,
    default: function() { return this.name; }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() { return !this.isGoogleUser; },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otpCode: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  googleId: {
    type: String,
    default: null,
  },
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
  avatarStyle: {
    colorTheme: { type: String, default: 'indigo' },
    styleType: { type: String, default: 'glowing-orb' },
  },
}, {
  timestamps: true,
});

// Hash password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

// Dynamic database fallback interceptor
const User = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? UserMock : MongooseUser;
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
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? UserMock : MongooseUser;
    return new activeModel(...args);
  }
});

export default User;
