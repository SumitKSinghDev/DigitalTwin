import DailyLog from '../models/DailyLog.js';
import * as aiEngine from '../utils/aiEngine.js';

// Helper to calculate consecutive daily logging streak
const calculateActiveStreak = (logs) => {
  if (!logs || logs.length === 0) return 0;
  
  // Sort logs by date descending: newest first
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Get today and yesterday dates in local timezone
  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(new Date());
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);
  
  const latestLogDate = sortedLogs[0].date;
  
  // If the latest log is older than yesterday, the streak is currently broken
  if (latestLogDate !== todayStr && latestLogDate !== yesterdayStr) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = new Date(latestLogDate + 'T00:00:00'); // avoid timezone shifts
  
  for (let i = 1; i < sortedLogs.length; i++) {
    const nextLogDate = new Date(sortedLogs[i].date + 'T00:00:00');
    const timeDiff = currentDate - nextLogDate;
    const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      streak++;
      currentDate = nextLogDate;
    } else if (dayDiff > 1) {
      break; // Streak is broken
    }
  }
  
  return streak;
};

// @desc    Get the current digital twin telemetry state & predictions
// @route   GET /api/twin
// @access  Private
export const getTwinState = async (req, res) => {
  try {
    // Retrieve all daily logs for the student sorted chronologically
    const logs = await DailyLog.find({ userId: req.user._id }).sort({ date: 1 });
    
    if (logs.length === 0) {
      return res.json({
        hasData: false,
        productivityScore: 0,
        burnout: { score: 10, level: 'Low', description: 'Energetic & Balanced' },
        consistencyIndex: 100,
        growthPrediction: {
          trend: 'stable',
          projectedProductivity: 50,
          rate: 0,
          forecast: 'Log at least 3 days of study data to activate growth forecasting.'
        },
        recommendations: [
          'Welcome to your student digital twin dashboard! Use the daily log page to record your study hours, stress levels, sleep, and focus score today.'
        ],
        activeStreak: 0,
        twinStatus: 'Balanced',
        logsCount: 0
      });
    }

    const latestLog = logs[logs.length - 1];
    
    // AI Calculations
    const productivityScore = aiEngine.calculateProductivityScore(latestLog);
    const burnout = aiEngine.calculateBurnoutRisk(logs);
    const consistencyIndex = aiEngine.calculateConsistencyIndex(logs);
    const growthPrediction = aiEngine.generateGrowthPrediction(logs);
    const recommendations = aiEngine.generateRecommendations(latestLog, logs);
    const activeStreak = calculateActiveStreak(logs);
    
    // Map Burnout Risk Level to Twin Status String
    let twinStatus = 'Energetic';
    if (burnout.level === 'Critical') {
      twinStatus = 'Burned Out';
    } else if (burnout.level === 'High') {
      twinStatus = 'Fatigued';
    } else if (burnout.level === 'Moderate') {
      twinStatus = 'Strained';
    } else if (productivityScore > 80) {
      twinStatus = 'Focused';
    } else {
      twinStatus = 'Balanced';
    }

    res.json({
      hasData: true,
      productivityScore,
      burnout,
      consistencyIndex,
      growthPrediction,
      recommendations,
      activeStreak,
      twinStatus,
      logsCount: logs.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
