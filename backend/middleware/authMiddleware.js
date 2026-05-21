import mongoose from 'mongoose';
import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode the JWT token
      const decoded = verifyToken(token);

      // Robust check: prevent CastError if the decoded.id is not a valid Mongoose ObjectId and we are not in memory mode
      let user = null;
      if (process.env.USE_MEMORY_DB === 'true' || (decoded && decoded.id && mongoose.Types.ObjectId.isValid(decoded.id))) {
        user = await User.findById(decoded.id).select('-password');
      }

      req.user = user;

      if (!req.user) {
        return res.status(401).json({ message: 'User not found, authorization failed' });
      }

      next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

