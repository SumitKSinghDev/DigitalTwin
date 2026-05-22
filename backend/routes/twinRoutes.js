import express from 'express';
import { getTwinState, handleTwinChat } from '../controllers/twinController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTwinState);
router.post('/chat', protect, handleTwinChat);

export default router;
