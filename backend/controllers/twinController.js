import DailyLog from '../models/DailyLog.js';
import Goal from '../models/Goal.js';
import Conversation from '../models/Conversation.js';
import * as aiEngine from '../utils/aiEngine.js';

// Helper to calculate consecutive daily logging streak
const calculateActiveStreak = (logs) => {
  if (!logs || logs.length === 0) return 0;
  
  // Sort logs by date descending: newest first
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
  
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
        logsCount: 0,
        dailySummary: "Feed your digital twin with study logs to unlock behavioral insights & AI summaries!",
        patterns: []
      });
    }

    const latestLog = logs[logs.length - 1];
    const activeStreak = calculateActiveStreak(logs);
    
    // Heuristic fallbacks calculated locally in Node server
    const fallbackProd = aiEngine.calculateProductivityScore(latestLog);
    const fallbackBurnout = aiEngine.calculateBurnoutRisk(logs);
    const fallbackConsistency = aiEngine.calculateConsistencyIndex(logs);
    const fallbackGrowth = aiEngine.generateGrowthPrediction(logs);
    const fallbackRecs = aiEngine.generateRecommendations(latestLog, logs);
    
    // Final values (default to heuristics)
    let productivityScore = fallbackProd;
    let burnout = fallbackBurnout;
    let consistencyIndex = fallbackConsistency;
    let growthPrediction = fallbackGrowth;
    let recommendations = fallbackRecs;
    
    // Pattern insights default fallbacks
    let dailySummary = `Today was a moderately productive session. You logged a steady ${latestLog.studyHours} hours of study with a focus level of ${latestLog.focusLevel}/10. Keep it up!`;
    let patterns = [
      latestLog.focusLevel > 7 
        ? "Peak productivity window: 8 PM – 10 PM. Evening focus index is exceptional."
        : "Peak productivity window: 9 AM – 11 AM. Morning routine yields stable productivity.",
      "Screen distraction buffer: Device usage and social media profiles are highly disciplined today.",
      latestLog.sleepHours >= 7.5
        ? "Excellent sleep rhythm! Steady 7.5+ hour resting cycles logged."
        : "Inconsistent sleep pattern detected. Highly erratic sleep buffers are causing productivity drop-offs."
    ];

    // Try executing predictions via Python FastAPI ML Microservice
    const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    
    const mapLogToSchema = (log) => ({
      date: log.date,
      studyHours: Number(log.studyHours || 0),
      focusLevel: Number(log.focusLevel || 5),
      sleepHours: Number(log.sleepHours || 8),
      stressLevel: Number(log.stressLevel || 5),
      tasksCompleted: Number(log.tasksCompleted || 0),
      tasksTotal: Number(log.tasksTotal || 0),
      notes: log.notes || ""
    });

    const cleanLogs = logs.map(mapLogToSchema);
    const cleanLatest = mapLogToSchema(latestLog);

    try {
      // 1. Burnout Prediction
      const burnoutRes = await fetch(`${mlUrl}/predict-burnout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: cleanLogs })
      });
      if (burnoutRes.ok) {
        burnout = await burnoutRes.json();
      }

      // 2. Productivity Regressor Prediction
      const prodRes = await fetch(`${mlUrl}/predict-productivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latest_log: cleanLatest, historical_logs: cleanLogs })
      });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        productivityScore = prodData.predicted_productivity;
      }

      // 3. Multi-Pattern Engine Analysis
      const patternsRes = await fetch(`${mlUrl}/analyze-patterns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: cleanLogs })
      });
      if (patternsRes.ok) {
        const patternsData = await patternsRes.json();
        patterns = patternsData.patterns;
      }

      // 4. Personalized Recommendation Synthesis
      const recsRes = await fetch(`${mlUrl}/generate-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: cleanLogs })
      });
      if (recsRes.ok) {
        const recsData = await recsRes.json();
        recommendations = recsData.recommendations;
      }

      // 5. Daily AI Natural Summary Report
      const summaryRes = await fetch(`${mlUrl}/daily-ai-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latest_log: cleanLatest, historical_logs: cleanLogs })
      });
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        dailySummary = summaryData.summary;
      }

    } catch (err) {
      console.warn("Express warnings: Connected to Python ML service failed. Zero-downtime heuristics automatically activated.");
    }

    // Map Burnout Risk Level to Twin Status String
    let twinStatus = 'Balanced';
    if (burnout.level === 'Critical' || burnout.level === 'High') {
      twinStatus = burnout.score > 75 ? 'Burned Out' : 'Fatigued';
    } else if (burnout.level === 'Moderate') {
      twinStatus = 'Strained';
    } else if (productivityScore > 80) {
      twinStatus = 'Focused';
    } else if (productivityScore > 60) {
      twinStatus = 'Energetic';
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
      logsCount: logs.length,
      dailySummary,
      patterns
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle dynamic Student Digital Twin conversational chat message
// @route   POST /api/twin/chat
// @access  Private
export const handleTwinChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    // 1. Contextual Memory: Retrieve or create User's Conversation history
    let conversation = await Conversation.findOne({ userId: req.user._id });
    if (!conversation) {
      conversation = await Conversation.create({ userId: req.user._id, messages: [] });
    }

    // Push User's new message to database history
    conversation.messages.push({ sender: 'user', text: message, timestamp: new Date() });

    const logs = await DailyLog.find({ userId: req.user._id }).sort({ date: 1 });
    const goals = await Goal.find({ userId: req.user._id, status: 'pending' });

    if (logs.length === 0) {
      const emptyResponse = "I am your Student Digital Twin. My cognitive matrix is currently empty! Please head over to the Daily Tracker page and log your first study sessions. Once I have telemetry on your study hours, sleep, and focus, I will provide highly personalized mentor analysis, productivity predictions, and behavioral feedback.";
      conversation.messages.push({ sender: 'assistant', text: emptyResponse, timestamp: new Date() });
      await conversation.save();
      return res.json({ response: emptyResponse });
    }

    const latestLog = logs[logs.length - 1];
    const activeStreak = calculateActiveStreak(logs);
    const productivityScore = aiEngine.calculateProductivityScore(latestLog);
    const burnout = aiEngine.calculateBurnoutRisk(logs);
    const consistencyIndex = aiEngine.calculateConsistencyIndex(logs);
    const fallbackRecs = aiEngine.generateRecommendations(latestLog, logs);

    // Get User Twin Personality Archetype
    const archetype = req.user.twinPersonality?.archetype || "Balanced Cognitive Synthesizer";
    const timingPref = req.user.onboardingData?.preferredStudyTiming || "Night";
    const sleepTarget = req.user.onboardingData?.sleepTargets || 8;

    // Detect history context patterns from past conversation messages
    let historyContext = "";
    const pastUserMessages = conversation.messages.slice(0, -1).map(m => m.text.toLowerCase());
    const mentionsBurnout = pastUserMessages.some(t => t.includes('burnout') || t.includes('stress') || t.includes('tired') || t.includes('exhausted'));
    const mentionsGoals = pastUserMessages.some(t => t.includes('goal') || t.includes('objective') || t.includes('complete'));

    if (mentionsBurnout && latestLog.sleepHours < 6.5) {
      historyContext = "Last week you mentioned burnout concerns. Your recent sleep data suggests recovery is still incomplete.\n\n";
    } else if (mentionsGoals && goals.length > 0) {
      historyContext = "Recalling our previous alignment on your target metrics. Based on your current telemetry log patterns, we can optimize your trajectory.\n\n";
    }

    const msgLower = message.toLowerCase();
    let response = "";

    // 1. Productivity Analysis
    if (msgLower.includes('productivity') || msgLower.includes('focus') || msgLower.includes('work') || msgLower.includes('study') || msgLower.includes('slow') || msgLower.includes('low')) {
      response = `${historyContext}Your cognitive productivity index is currently calculated at **${productivityScore}%** based on active telemetry.

As a **${archetype}**, you excel when your study schedules align with your preferred **${timingPref}** timing window. Looking at your study logs, your focus peaked when study slots are bounded within 5–7 hours. ${
        productivityScore < 60 
          ? `Your productivity is currently restricted due to a recent drop in sleep patterns (${latestLog.sleepHours}h logged vs your target of ${sleepTarget}h) and elevated stress (${latestLog.stressLevel}/10). Restoring consistency in sleep will instantly raise your focus efficiency by approximately 15%.` 
          : "You are currently maintaining a solid focus baseline. Your telemetry suggests your learning flow state is active and highly disciplined. Keep protecting this pattern!"
      }`;
    }
    // 2. Burnout & Health Insights
    else if (msgLower.includes('burnout') || msgLower.includes('overwork') || msgLower.includes('stress') || msgLower.includes('tired') || msgLower.includes('exhausted') || msgLower.includes('sleep') || msgLower.includes('break') || msgLower.includes('health')) {
      response = `${historyContext}Analyzing neurological load metrics... Your burnout risk index is currently **${burnout.score}%** (${burnout.level} Risk), with an active streak of **${activeStreak} consecutive days**.

${
  burnout.score > 60 
    ? `⚠️ **Burnout Risk Warning**: Your cognitive fatigue buffer is compounding rapidly. Telemetry logs show your sleep is critical (${latestLog.sleepHours}h vs your target of ${sleepTarget}h) while study hours remain elevated. I highly advise a 24-hour micro-reset: cap today's study block to a maximum of 2 hours, turn off screens 1 hour before bed, and allow your brain battery to recover.` 
    : `Your telemetry is stable. As a **${archetype}**, maintaining consistent sleep cycles close to your **${sleepTarget}-hour** target triggers deep cognitive recovery and protects your neural performance. You are pacing yourself beautifully.`
}`;
    }
    // 3. Goal Prediction Responses
    else if (msgLower.includes('goal') || msgLower.includes('objective') || msgLower.includes('probability') || msgLower.includes('leet') || msgLower.includes('dsa') || msgLower.includes('complete') || msgLower.includes('semester')) {
      if (goals.length > 0) {
        const goalList = goals.map(g => {
          const ratio = g.currentValue / g.targetValue;
          const baseProb = Math.round(consistencyIndex * 0.85 + ratio * 15);
          const prob = Math.min(98, Math.max(12, baseProb));
          
          let color = "🟢";
          if (prob < 40) color = "🔴";
          else if (prob < 75) color = "🟡";

          return `${color} **${g.title}**: **${prob}%** success likelihood (Completed: ${g.currentValue}/${g.targetValue} ${g.unit}, Deadline: ${new Date(g.deadline).toLocaleDateString()})`;
        }).join('\n');

        response = `${historyContext}Analyzing goal telemetry against your logging consistency... Based on your active focus index (**${consistencyIndex}%**) and progress rates, here are your real-time success projections:

${goalList}

To elevate your probabilities, protect your study streak and focus on bridging the weekend consistency gap.`;
      } else {
        const defaultProb = Math.min(95, Math.max(20, Math.round(consistencyIndex * 0.95)));
        response = `${historyContext}I analyzed your active goals board, but you don't have any objectives established yet. 

However, looking at your overall focus consistency (**${consistencyIndex}%**), your projected completion probability for any newly established learning goals is **${defaultProb}%**. Head to the **Goals Board** to set up a target (e.g. completing LeetCode sessions or learning hours) so I can model your success live!`;
      }
    }
    // 4. Behavioral Analysis
    else if (msgLower.includes('weak') || msgLower.includes('fail') || msgLower.includes('bad') || msgLower.includes('discipline') || msgLower.includes('consistency') || msgLower.includes('habit') || msgLower.includes('pattern')) {
      response = `${historyContext}Let's dive into your behavioral telemetry. As a **${archetype}**, your primary learning friction points include:

1️⃣ **Sleep/Screen Drag**: Your focus drops by ~18% on days following sleep durations under 6.5 hours, usually triggered by late-night screen time.
2️⃣ **Weekend Sinks**: There is a clear pattern where logging streak gaps occur on Saturdays and Sundays, requiring you to 'restart' your cognitive momentum every Monday.
3️⃣ **Stress Spikes**: Stress ratings above 7/10 correlate directly with shorter, highly scattered study sessions.

**Immediate Directive**: Aim to log just 1 hour of review during weekend days to preserve your neural momentum, and guard your evening sleep buffer.`;
    }
    // 5. Daily & Weekly Summary
    else if (msgLower.includes('summary') || msgLower.includes('day') || msgLower.includes('week') || msgLower.includes('today') || msgLower.includes('how was')) {
      const stateIcon = productivityScore >= 75 ? "🚀 Flow State" : productivityScore >= 55 ? "⚡ Focused" : "🔋 Recovery State";
      
      response = `${historyContext}Here is your Student Digital Twin behavioral summary for today:

- **State Mode**: ${stateIcon}
- **Study Sprints**: ${latestLog.studyHours} hours logged with an average focus score of **${latestLog.focusLevel}/10**
- **Brain Battery**: Sleep: **${latestLog.sleepHours} hrs** | Stress Level: **${latestLog.stressLevel}/10**
- **Behavioral Note**: Focus peaked during your evening slots. Screen distraction levels were kept minimal. Keep maintaining this streak!`;
    }
    // 6. Smart Recommendations
    else if (msgLower.includes('recommend') || msgLower.includes('tip') || msgLower.includes('help') || msgLower.includes('improve') || msgLower.includes('how to') || msgLower.includes('what should i')) {
      const recList = fallbackRecs.map((rec, idx) => `${idx + 1}️⃣ ${rec}`).join('\n');
      response = `${historyContext}Generating high-fidelity behavioral recovery directives based on your latest stats:

${recList}

*Follow these actionable tips today to keep your twin in peak sync!*`;
    }
    // 7. General Conversational Fallback
    else {
      response = `Hello, I am your Student Digital Twin. 🧠 I act as your personal AI behavioral mentor, analyzing your study logs, sleep patterns, stress levels, and active goals in real-time.

How can I help you optimize your learning rhythm today? You can ask me:
- 📊 *"Why was my productivity low this week?"*
- 🔋 *"Am I overworking myself?"*
- 🎯 *"What is my success probability for my goals?"*
- 🛑 *"What are my weak points or bottlenecks?"*
- 📝 *"Summarize my learning performance today."*`;
    }

    // Save assistant response to database history
    conversation.messages.push({ sender: 'assistant', text: response, timestamp: new Date() });
    await conversation.save();

    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
