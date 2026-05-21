import express from 'express';
import { getTwinState } from '../controllers/twinController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTwinState);

export default router;
