import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.resolve('db.json');

// Ensure DB file exists
const readDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], logs: [], goals: [] }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return { users: [], logs: [], goals: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// Unique ID Generator
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Helper to map user properties and attach save method
const mapUserResult = (user) => {
  if (!user) return null;
  return {
    ...user,
    name: user.name || user.username || '',
    username: user.username || user.name || '',
    isVerified: user.isVerified !== undefined ? user.isVerified : false,
    otpCode: user.otpCode || null,
    otpExpires: user.otpExpires || null,
    googleId: user.googleId || null,
    isGoogleUser: user.isGoogleUser || false,
    isOnboarded: user.isOnboarded !== undefined ? user.isOnboarded : false,
    onboardingData: user.onboardingData || {
      studyGoals: '',
      preferredStudyTiming: '',
      sleepTargets: 8,
      academicInterests: '',
      burnoutSensitivity: 'Medium',
      productivityStyle: '',
    },
    twinPersonality: user.twinPersonality || {
      archetype: '',
      strengths: [],
      weaknesses: [],
    },
    matchPassword: async function (enteredPassword) {
      if (!this.password) return false;
      return await bcrypt.compare(enteredPassword, this.password);
    },
    save: async function () {
      const activeDb = readDB();
      activeDb.users = activeDb.users.map(u => {
        if (u._id === this._id) {
          return {
            ...u,
            name: this.name,
            username: this.username,
            email: this.email,
            password: this.password,
            isVerified: this.isVerified,
            otpCode: this.otpCode,
            otpExpires: this.otpExpires,
            googleId: this.googleId,
            isGoogleUser: this.isGoogleUser,
            avatarStyle: this.avatarStyle,
            isOnboarded: this.isOnboarded,
            onboardingData: this.onboardingData,
            twinPersonality: this.twinPersonality,
            updatedAt: new Date().toISOString()
          };
        }
        return u;
      });
      writeDB(activeDb);
      return this;
    }
  };
};

// User Mock Methods
export const UserMock = {
  findOne: (query) => {
    const db = readDB();
    const user = db.users.find(u => {
      // Handle $or query
      if (query.$or) {
        return query.$or.some(q => {
          if (q.email) {
            const emailVal = typeof q.email === 'string' ? q.email.toLowerCase() : '';
            return (u.email && u.email.toLowerCase() === emailVal) || (u.username && u.username.toLowerCase() === emailVal);
          }
          if (q.username) {
            const userVal = typeof q.username === 'string' ? q.username.toLowerCase() : '';
            return (u.username && u.username.toLowerCase() === userVal) || (u.email && u.email.toLowerCase() === userVal);
          }
          return false;
        });
      }
      if (query.email) return u.email && u.email.toLowerCase() === query.email.toLowerCase();
      if (query.username) return u.username && u.username.toLowerCase() === query.username.toLowerCase();
      if (query.googleId) return u.googleId === query.googleId;
      return false;
    });

    const result = mapUserResult(user);

    const queryObj = {
      select: function () { return this; },
      then: function (resolve) {
        resolve(result);
        return Promise.resolve(result);
      }
    };

    return queryObj;
  },

  create: async (data) => {
    const db = readDB();
    let hashedPassword = null;
    if (!data.isGoogleUser && data.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(data.password, salt);
    }

    const nameVal = data.name || data.username || '';
    const usernameVal = data.username || data.name || '';

    const newUser = {
      _id: generateId(),
      name: nameVal,
      username: usernameVal,
      email: data.email,
      password: hashedPassword,
      isVerified: data.isVerified !== undefined ? data.isVerified : false,
      otpCode: data.otpCode || null,
      otpExpires: data.otpExpires || null,
      googleId: data.googleId || null,
      isGoogleUser: data.isGoogleUser || false,
      avatarStyle: data.avatarStyle || { colorTheme: 'indigo', styleType: 'glowing-orb' },
      isOnboarded: data.isOnboarded !== undefined ? data.isOnboarded : false,
      onboardingData: data.onboardingData || {
        studyGoals: '',
        preferredStudyTiming: '',
        sleepTargets: 8,
        academicInterests: '',
        burnoutSensitivity: 'Medium',
        productivityStyle: '',
      },
      twinPersonality: data.twinPersonality || {
        archetype: '',
        strengths: [],
        weaknesses: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    return mapUserResult(newUser);
  },

  findById: (id) => {
    const db = readDB();
    const userStr = id ? id.toString() : '';
    const user = db.users.find(u => u._id === userStr);
    
    const result = mapUserResult(user);

    const queryObj = {
      select: function () { return this; },
      then: function (resolve) {
        resolve(result);
        return Promise.resolve(result);
      }
    };

    return queryObj;
  }
};

// DailyLog Mock Methods
export const DailyLogMock = {
  findOneAndUpdate: async (filter, updateData, options) => {
    const db = readDB();
    const userIdStr = filter.userId ? filter.userId.toString() : '';
    const dateStr = filter.date;

    let logIndex = db.logs.findIndex(l => l.userId === userIdStr && l.date === dateStr);
    
    let log;
    if (logIndex !== -1) {
      // Update
      db.logs[logIndex] = {
        ...db.logs[logIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      log = db.logs[logIndex];
    } else {
      // Insert (Upsert)
      log = {
        _id: generateId(),
        userId: userIdStr,
        date: dateStr,
        studyHours: updateData.studyHours || 0,
        focusLevel: updateData.focusLevel || 5,
        sleepHours: updateData.sleepHours || 8,
        stressLevel: updateData.stressLevel || 5,
        tasksCompleted: updateData.tasksCompleted || 0,
        tasksTotal: updateData.tasksTotal || 0,
        notes: updateData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.logs.push(log);
    }
    
    writeDB(db);
    return log;
  },

  find: (query) => {
    const db = readDB();
    const userIdStr = query.userId ? query.userId.toString() : '';
    
    let filtered = db.logs.filter(l => l.userId === userIdStr);
    
    // Sort logic
    const sort = () => {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      return filtered;
    };

    return {
      sort: function () {
        const sorted = sort();
        return {
          limit: function (num) {
            return sorted.slice(-num);
          },
          then: function (resolve) {
            resolve(sorted);
          }
        };
      },
      then: function (resolve) {
        resolve(filtered);
      }
    };
  },

  findOne: async (query) => {
    const db = readDB();
    const userIdStr = query.userId ? query.userId.toString() : '';
    const dateStr = query.date;

    const log = db.logs.find(l => l.userId === userIdStr && l.date === dateStr);
    return log || null;
  },

  findOneAndDelete: async (query) => {
    const db = readDB();
    const userIdStr = query.userId ? query.userId.toString() : '';
    const logIdStr = query._id;

    const logIndex = db.logs.findIndex(l => l._id === logIdStr && l.userId === userIdStr);
    if (logIndex !== -1) {
      const deleted = db.logs[logIndex];
      db.logs.splice(logIndex, 1);
      writeDB(db);
      return deleted;
    }
    return null;
  }
};

// Goal Mock Methods
export const GoalMock = {
  create: async (data) => {
    const db = readDB();
    
    const newGoal = {
      _id: generateId(),
      userId: data.userId ? data.userId.toString() : '',
      title: data.title,
      category: data.category || 'Study',
      targetValue: Number(data.targetValue),
      currentValue: 0,
      unit: data.unit || 'Hours',
      deadline: new Date(data.deadline).toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.goals.push(newGoal);
    writeDB(db);
    return newGoal;
  },

  find: (query) => {
    const db = readDB();
    const userIdStr = query.userId ? query.userId.toString() : '';
    
    let filtered = db.goals.filter(g => g.userId === userIdStr);
    
    if (query.status) {
      filtered = filtered.filter(g => g.status === query.status);
    }

    // Sort by deadline
    filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    return {
      sort: function () {
        return this;
      },
      then: function (resolve) {
        resolve(filtered);
      }
    };
  },

  findOne: async (query) => {
    const db = readDB();
    const goalIdStr = query._id;
    const userIdStr = query.userId ? query.userId.toString() : '';

    const goal = db.goals.find(g => g._id === goalIdStr && g.userId === userIdStr);
    if (goal) {
      return {
        ...goal,
        save: async function () {
          const activeDb = readDB();
          activeDb.goals = activeDb.goals.map(g => {
            if (g._id === this._id) {
              return {
                ...g,
                title: this.title,
                category: this.category,
                targetValue: this.targetValue,
                unit: this.unit,
                deadline: this.deadline,
                currentValue: this.currentValue,
                status: this.status,
                updatedAt: new Date().toISOString()
              };
            }
            return g;
          });
          writeDB(activeDb);
          return this;
        }
      };
    }
    return null;
  },

  findOneAndDelete: async (query) => {
    const db = readDB();
    const goalIdStr = query._id;
    const userIdStr = query.userId ? query.userId.toString() : '';

    const goalIndex = db.goals.findIndex(g => g._id === goalIdStr && g.userId === userIdStr);
    if (goalIndex !== -1) {
      const deleted = db.goals[goalIndex];
      db.goals.splice(goalIndex, 1);
      writeDB(db);
      return deleted;
    }
    return null;
  }
};
