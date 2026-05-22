import Goal from '../models/Goal.js';
import DailyLog from '../models/DailyLog.js';
import * as aiEngine from '../utils/aiEngine.js';

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res) => {
  try {
    const { title, category, targetValue, unit, deadline } = req.body;

    if (!title || !targetValue || !deadline) {
      return res.status(400).json({ message: 'Title, target value, and deadline are required' });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      category: category || 'Study',
      targetValue: Number(targetValue),
      unit: unit || 'Hours',
      deadline: new Date(deadline),
      currentValue: 0,
      status: 'pending',
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all goals for the user (with ML predicted success probabilities)
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const goals = await Goal.find(query).sort({ deadline: 1 });
    
    // Fetch user study logs to engineer behavioral inputs
    const logs = await DailyLog.find({ userId: req.user._id }).sort({ date: 1 });
    
    if (logs.length === 0 || goals.length === 0) {
      // Return goals with flat baseline probability if no behavioral telemetry exists
      return res.json(goals.map(g => {
        const goalObj = g.toObject ? g.toObject() : { ...g };
        goalObj.successProbability = 50;
        return goalObj;
      }));
    }

    // Calculate rolling inputs
    const consistencyIndex = aiEngine.calculateConsistencyIndex(logs);
    const growth = aiEngine.generateGrowthPrediction(logs);
    const trendRate = growth.rate || 0;
    
    const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    const enrichedGoals = [];
    const today = new Date();

    for (let goal of goals) {
      const goalObj = goal.toObject ? goal.toObject() : { ...goal };
      
      if (goalObj.status !== 'pending') {
        goalObj.successProbability = goalObj.status === 'completed' ? 100 : 0;
        enrichedGoals.push(goalObj);
        continue;
      }

      // Time calculations
      const deadlineDate = new Date(goalObj.deadline);
      const remainingTime = deadlineDate - today;
      const remainingDays = Math.max(1, Math.round(remainingTime / (1000 * 60 * 60 * 24)));
      const completionRatio = goalObj.targetValue > 0 ? (goalObj.currentValue / goalObj.targetValue) : 0;

      // Establish baseline heuristic fallback first
      let prob = (completionRatio * 0.65) + (consistencyIndex / 100 * 0.2) + (trendRate * 0.035) + 0.15;
      if (completionRatio >= 1.0) prob += 0.15;
      if (remainingDays < 5 && completionRatio < 0.4) prob -= 0.35;
      let successProbability = Math.max(5, Math.min(100, Math.round(prob * 100)));

      // Query Python FastAPI for machine learning prediction
      try {
        const response = await fetch(`${mlUrl}/predict-goal-success`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_consistency: Number(consistencyIndex),
            productivity_trend: Number(trendRate),
            remaining_days: Number(remainingDays),
            completion_ratio: Number(completionRatio)
          })
        });
        if (response.ok) {
          const data = await response.json();
          successProbability = data.success_probability;
        }
      } catch (err) {
        // Silently use the heuristic fallback
      }

      goalObj.successProbability = successProbability;
      enrichedGoals.push(goalObj);
    }

    res.json(enrichedGoals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update goal progress or values
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res) => {
  try {
    const { currentValue, title, category, targetValue, unit, deadline } = req.body;
    
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    if (title !== undefined) goal.title = title;
    if (category !== undefined) goal.category = category;
    if (targetValue !== undefined) goal.targetValue = Number(targetValue);
    if (unit !== undefined) goal.unit = unit;
    if (deadline !== undefined) goal.deadline = new Date(deadline);

    if (currentValue !== undefined) {
      goal.currentValue = Math.max(0, Number(currentValue));
      
      // Auto-update status based on values
      if (goal.currentValue >= goal.targetValue) {
        goal.status = 'completed';
      } else {
        goal.status = 'pending';
      }
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
