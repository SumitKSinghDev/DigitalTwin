import express from 'express';
import {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  googleLogin,
  getUserProfile,
  updateAvatarStyle,
  resetDatabase
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/google', googleLogin);
router.post('/reset-database', resetDatabase);
router.get('/profile', protect, getUserProfile);
router.put('/avatar', protect, updateAvatarStyle);

export default router;
