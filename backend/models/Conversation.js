import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [
    {
      sender: { type: String, enum: ['user', 'assistant', 'twin'], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true,
});

const MongooseConversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

// In offline memory DB, we can just use an in-memory fallback list
let inMemoryConversations = [];

const ConversationMock = {
  find: (query) => {
    const userIdStr = query.userId ? query.userId.toString() : '';
    const filtered = inMemoryConversations.filter(c => c.userId === userIdStr);
    return {
      then: function (resolve) {
        resolve(filtered);
      }
    };
  },
  findOne: async (query) => {
    const userIdStr = query.userId ? query.userId.toString() : '';
    const found = inMemoryConversations.find(c => c.userId === userIdStr);
    if (found) {
      return {
        ...found,
        save: async function() {
          const idx = inMemoryConversations.findIndex(c => c._id === this._id);
          if (idx !== -1) {
            inMemoryConversations[idx] = { ...inMemoryConversations[idx], ...this };
          }
          return this;
        }
      };
    }
    return null;
  },
  create: async (data) => {
    const newConv = {
      _id: Math.random().toString(36).substring(7),
      userId: data.userId ? data.userId.toString() : '',
      messages: data.messages || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      save: async function() {
        const idx = inMemoryConversations.findIndex(c => c._id === this._id);
        if (idx !== -1) {
          inMemoryConversations[idx] = { ...inMemoryConversations[idx], ...this };
        } else {
          inMemoryConversations.push(this);
        }
        return this;
      }
    };
    inMemoryConversations.push(newConv);
    return newConv;
  }
};

const Conversation = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? ConversationMock : MongooseConversation;
    if (prop === 'prototype') return activeModel.prototype;
    const value = activeModel[prop];
    if (typeof value === 'function') return value.bind(activeModel);
    return value;
  },
  construct: (target, args) => {
    const activeModel = process.env.USE_MEMORY_DB === 'true' ? ConversationMock : MongooseConversation;
    return new activeModel(...args);
  }
});

export default Conversation;
