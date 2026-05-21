import Goal from '../models/Goal.js';

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

// @desc    Get all goals for the user
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
    res.json(goals);
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
