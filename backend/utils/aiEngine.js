// Heuristic formulas for Student Digital Twin

export const calculateProductivityScore = (log) => {
  if (!log) return 0;
  
  // Normalise study hours: target 6 hours = 100%
  const studyHoursNorm = Math.min((log.studyHours / 6) * 100, 100);
  
  // Focus level is 1-10, scale it to 100
  const focusNorm = log.focusLevel * 10;
  
  // Task completion percentage
  let taskCompletionNorm = 0;
  if (log.tasksTotal > 0) {
    taskCompletionNorm = (log.tasksCompleted / log.tasksTotal) * 100;
  } else {
    // If no tasks log, default to focus norm to prevent penalty
    taskCompletionNorm = focusNorm;
  }
  
  // Base weighted score
  // 40% study hours, 30% focus level, 30% task completion
  let score = (0.4 * studyHoursNorm) + (0.3 * focusNorm) + (0.3 * taskCompletionNorm);
  
  // Sleep penalties (cognitive cost of sleep deprivation)
  if (log.sleepHours < 5) {
    score -= (5 - log.sleepHours) * 8; // penalty up to 24 points
  }
  
  // Stress penalties
  if (log.stressLevel > 7) {
    score -= (log.stressLevel - 7) * 8; // penalty up to 24 points
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const calculateBurnoutRisk = (logs) => {
  if (!logs || logs.length === 0) {
    return { score: 10, level: 'Low', description: 'Energetic & Balanced' };
  }
  
  // Take last 7 logs (or all if fewer)
  const recentLogs = logs.slice(-7);
  const avgStress = recentLogs.reduce((acc, log) => acc + log.stressLevel, 0) / recentLogs.length;
  const avgSleep = recentLogs.reduce((acc, log) => acc + log.sleepHours, 0) / recentLogs.length;
  const avgStudy = recentLogs.reduce((acc, log) => acc + log.studyHours, 0) / recentLogs.length;
  
  // Calculate Study Intensity
  // High study hours (>7) + high focus level (>8) increase intensity
  const studyIntensity = recentLogs.reduce((acc, log) => {
    let intensity = log.studyHours;
    if (log.focusLevel > 7) intensity += 2;
    return acc + intensity;
  }, 0) / recentLogs.length;
  
  // Burnout Heuristic:
  // Stress has 6x weight, study intensity has 4x weight, sleep has a negative buffer (-5x)
  let burnoutIndex = (avgStress * 6) + (studyIntensity * 4) - (avgSleep * 5);
  
  // Offset to scale the index logically to 0 - 100
  burnoutIndex = Math.max(0, Math.min(100, Math.round(burnoutIndex + 25)));
  
  let level = 'Low';
  let description = 'Energetic & Balanced';
  
  if (burnoutIndex > 75) {
    level = 'Critical';
    description = 'Burnout Warning - System Crash Looming';
  } else if (burnoutIndex > 55) {
    level = 'High';
    description = 'Fatigued & Sleep Deprived';
  } else if (burnoutIndex > 30) {
    level = 'Moderate';
    description = 'Focused & Strained';
  }
  
  return {
    score: burnoutIndex,
    level,
    description
  };
};

export const calculateConsistencyIndex = (logs) => {
  if (!logs || logs.length < 2) return 100; // default highly consistent if starting
  
  const recentLogs = logs.slice(-7);
  const studyHours = recentLogs.map(log => log.studyHours);
  
  // Calculate standard deviation of study hours
  const mean = studyHours.reduce((acc, val) => acc + val, 0) / studyHours.length;
  const variance = studyHours.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / studyHours.length;
  const stdDev = Math.sqrt(variance);
  
  // Map standard deviation to a 0-100 scale
  // Standard deviation of 0 means perfect consistency (100)
  // Standard deviation of 4 or higher indicates highly erratic logging (0)
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - (stdDev * 25))));
  
  return consistencyScore;
};

export const generateGrowthPrediction = (logs) => {
  if (!logs || logs.length < 3) {
    return {
      trend: 'stable',
      projectedProductivity: 65,
      rate: 0,
      forecast: 'Log your activity for 3 days to generate personalized growth predictions.'
    };
  }
  
  const recentLogs = logs.slice(-14);
  const data = recentLogs.map((log, index) => ({
    x: index + 1,
    y: calculateProductivityScore(log)
  }));
  
  // Linear regression: y = mx + c
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += data[i].x;
    sumY += data[i].y;
    sumXY += data[i].x * data[i].y;
    sumXX += data[i].x * data[i].x;
  }
  
  const numerator = (n * sumXY) - (sumX * sumY);
  const denominator = (n * sumXX) - (sumX * sumX);
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = (sumY - (slope * sumX)) / n;
  
  // Project next 30 days
  const currentProjected = Math.round(slope * n + intercept);
  const futureProjected = Math.round(slope * (n + 30) + intercept);
  const clampedFuture = Math.max(10, Math.min(100, futureProjected));
  const diff = clampedFuture - currentProjected;
  
  let trend = 'stable';
  let forecast = '';
  if (diff > 5) {
    trend = 'improving';
    forecast = `Your study patterns show positive growth. If you maintain this course, your cognitive retention and productivity index are projected to expand by ${diff}% over the next month.`;
  } else if (diff < -5) {
    trend = 'declining';
    forecast = `Alert: We detect a downward slip in productivity metrics. If unchecked, your learning efficiency is predicted to contract by ${Math.abs(diff)}% due to accumulating exhaustion or study inconsistency. Consider resetting your targets.`;
  } else {
    trend = 'stable';
    forecast = `You are maintaining a highly stable and balanced baseline. Your projected productivity will remain lock-steady at approximately ${clampedFuture}% with minimal variance.`;
  }
  
  return {
    trend,
    projectedProductivity: clampedFuture,
    rate: Math.round(slope * 10) / 10,
    forecast
  };
};

export const generateRecommendations = (latestLog, logs) => {
  const recommendations = [];
  
  if (!latestLog) {
    return [
      "Welcome to your Digital Twin core. Log your first study session today to start collecting predictive health feedback."
    ];
  }
  
  const burnout = calculateBurnoutRisk(logs);
  const consistency = calculateConsistencyIndex(logs);
  const prodScore = calculateProductivityScore(latestLog);
  
  // 1. Sleep warnings
  if (latestLog.sleepHours < 5) {
    recommendations.push(
      `Your digital twin reports a major power drain. Logging only ${latestLog.sleepHours} hours of sleep creates high cognitive friction. Reduce active study today by 50% to prevent mental depletion.`
    );
  } else if (latestLog.sleepHours >= 8 && latestLog.stressLevel < 4) {
    recommendations.push(
      "Optimal recovery detected! Your physical battery is highly charged. This is the perfect window to tackle high-complexity projects or learn new hard skills."
    );
  }
  
  // 2. Stress & Burnout recommendations
  if (burnout.level === 'Critical') {
    recommendations.push(
      "CRITICAL EMERGENCY: Brain fatigue indicators are flashing red. You have consecutive high-intensity days coupled with elevated stress. Stop all screens and take a mandatory 1-day cognitive rest period to protect memory retention."
    );
  } else if (burnout.level === 'High') {
    recommendations.push(
      `Twin Health Advisory: Stress levels are accumulating (${latestLog.stressLevel}/10). Pivot your study blocks into Pomodoro sessions (25m study, 10m walking) to drop cardiovascular load by 20%.`
    );
  }
  
  // 3. Consistency alerts
  if (consistency < 45 && logs.length >= 3) {
    recommendations.push(
      "Pattern Disruption Alert: Your study habits are highly volatile (heavy study spikes followed by complete drop-offs). Your twin recommends a flat 2.5-hour daily baseline rather than exhausting 8-hour sprint blocks."
    );
  } else if (consistency > 80 && logs.length >= 3) {
    recommendations.push(
      "Exceptional rhythmic output! Your day-to-day study variance is minimal. This high habit automaticity triggers neuroplastic efficiency—making learning feel 25% easier."
    );
  }
  
  // 4. Productivity-specific recommendation
  if (prodScore > 80) {
    recommendations.push(
      `High-Yield Output: You scored ${prodScore}/100 on productivity today. Complete tasks early and preserve this positive momentum by journaling your study setup for future replication.`
    );
  } else if (prodScore < 40) {
    recommendations.push(
      "Friction warning: Productivity is restricted. Try minimizing environmental distractions (e.g. activate Do Not Disturb) and start your next session with a tiny, 10-minute visual target."
    );
  }
  
  // Ensure we always have at least 2 recommendations
  if (recommendations.length < 2) {
    recommendations.push(
      "Digital Twin tip: Log your task completion counts accurately. The twin uses task ratios to optimize your focus milestones."
    );
  }
  
  return recommendations;
};
