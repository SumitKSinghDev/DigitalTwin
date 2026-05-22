import DailyLog from '../models/DailyLog.js';
import TwinState from '../models/TwinState.js';
import Analytics from '../models/Analytics.js';
import * as aiEngine from '../utils/aiEngine.js';

// @desc    Create or update a daily log
// @route   POST /api/logs
// @access  Private
export const saveDailyLog = async (req, res) => {
  try {
    const { date, studyHours, focusLevel, sleepHours, stressLevel, tasksCompleted, tasksTotal, notes } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'Date is required (YYYY-MM-DD)' });
    }

    const logData = {
      userId: req.user._id,
      date,
      studyHours: studyHours !== undefined ? Number(studyHours) : 0,
      focusLevel: focusLevel !== undefined ? Number(focusLevel) : 5,
      sleepHours: sleepHours !== undefined ? Number(sleepHours) : 8,
      stressLevel: stressLevel !== undefined ? Number(stressLevel) : 5,
      tasksCompleted: tasksCompleted !== undefined ? Number(tasksCompleted) : 0,
      tasksTotal: tasksTotal !== undefined ? Number(tasksTotal) : 0,
      notes: notes || '',
    };

    // Upsert logic: Update if matches userId + date, create if it doesn't exist
    const log = await DailyLog.findOneAndUpdate(
      { userId: req.user._id, date },
      logData,
      { new: true, upsert: true, runValidators: true }
    );

    // TELEMETRY PIPELINE INTEGRATION
    // Fetch all logs for the user to perform rolling calculations
    const logs = await DailyLog.find({ userId: req.user._id }).sort({ date: 1 });
    
    // Compute current state indices
    const productivityScore = aiEngine.calculateProductivityScore(log);
    const burnout = aiEngine.calculateBurnoutRisk(logs);
    const consistencyIndex = aiEngine.calculateConsistencyIndex(logs);

    // Map Burnout Risk Level to Twin Status String and Color Theme
    let twinStatus = 'Balanced';
    let colorTheme = 'indigo';
    
    if (burnout.level === 'Critical' || burnout.level === 'High') {
      twinStatus = burnout.score > 75 ? 'Burned Out' : 'Fatigued';
      colorTheme = burnout.score > 75 ? 'orange' : 'red';
    } else if (burnout.level === 'Moderate') {
      twinStatus = 'Strained';
      colorTheme = 'orange';
    } else if (productivityScore > 80) {
      twinStatus = 'Focused';
      colorTheme = 'purple';
    } else if (productivityScore > 60) {
      twinStatus = 'Energetic';
      colorTheme = 'blue';
    }

    // 1. Sync TwinState
    await TwinState.findOneAndUpdate(
      { userId: req.user._id },
      {
        twinStatus,
        colorTheme,
        glowIntensity: Math.min(100, Math.max(30, productivityScore)),
      },
      { upsert: true, new: true }
    );

    // 2. Sync Analytics Snapshot
    await Analytics.findOneAndUpdate(
      { userId: req.user._id, date },
      {
        productivityScore,
        burnoutProbability: burnout.score,
        focusConsistency: consistencyIndex,
        sleepHours: log.sleepHours,
        stressLevel: log.stressLevel,
      },
      { upsert: true, new: true }
    );

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all daily logs for the user
// @route   GET /api/logs
// @access  Private
export const getDailyLogs = async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    
    let query = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    let logsQuery = DailyLog.find(query).sort({ date: 1 }); // Sorted chronologically

    if (limit) {
      logsQuery = logsQuery.limit(Number(limit));
    }

    const logs = await logsQuery;
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single daily log by date
// @route   GET /api/logs/:date
// @access  Private
export const getDailyLogByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const log = await DailyLog.findOne({ userId: req.user._id, date });
    
    if (!log) {
      return res.status(404).json({ message: 'No log found for this date' });
    }
    
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a daily log
// @route   DELETE /api/logs/:id
// @access  Private
export const deleteDailyLog = async (req, res) => {
  try {
    const log = await DailyLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!log) {
      return res.status(404).json({ message: 'Log not found or unauthorized' });
    }
    
    res.json({ message: 'Daily log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
