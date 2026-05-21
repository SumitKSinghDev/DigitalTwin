import express from 'express';
import { saveDailyLog, getDailyLogs, getDailyLogByDate, deleteDailyLog } from '../controllers/logController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, saveDailyLog)
  .get(protect, getDailyLogs);

router.route('/:date')
  .get(protect, getDailyLogByDate);

router.route('/:id')
  .delete(protect, deleteDailyLog);

export default router;
