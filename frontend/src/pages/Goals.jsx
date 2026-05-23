import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  PlusCircle, 
  Calendar,
  Layers,
  Sparkles,
  Trophy
} from 'lucide-react';

const Goals = ({ triggerGoalsRefresh }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Study');
  const [targetValue, setTargetValue] = useState(5);
  const [unit, setUnit] = useState('Hours');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!title || !targetValue || !deadline) return;

    setSubmitting(true);
    try {
      const res = await api.post('/goals', {
        title,
        category,
        targetValue: Number(targetValue),
        unit,
        deadline,
      });
      setGoals((prev) => [res.data, ...prev]);
      setTitle('');
      setCategory('Study');
      setTargetValue(5);
      setUnit('Hours');
      setDeadline('');
      setShowAddForm(false);
      if (triggerGoalsRefresh) triggerGoalsRefresh();
    } catch (error) {
      console.error('Failed to add goal:', error);
    }
    setSubmitting(false);
  };

  const handleIncrement = async (id, currentValue, targetValue, incrementBy) => {
    const newVal = Math.max(0, currentValue + incrementBy);
    try {
      // Optimistic update
      setGoals((prev) =>
        prev.map((g) => {
          if (g._id === id) {
            const nextStatus = newVal >= g.targetValue ? 'completed' : 'pending';
            return { ...g, currentValue: newVal, status: nextStatus };
          }
          return g;
        })
      );

      await api.put(`/goals/${id}`, { currentValue: newVal });
      if (triggerGoalsRefresh) triggerGoalsRefresh();
    } catch (error) {
      console.error('Failed to update goal progress:', error);
      fetchGoals(); // reload on error
    }
  };

  const handleDelete = async (id) => {
    try {
      setGoals((prev) => prev.filter((g) => g._id !== id));
      await api.delete(`/goals/${id}`);
      if (triggerGoalsRefresh) triggerGoalsRefresh();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      fetchGoals();
    }
  };

  // Filter pending vs completed
  const pendingGoals = goals.filter((g) => g.status === 'pending');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  // Category styles dictionary
  const getCategoryStyles = (cat) => {
    switch (cat) {
      case 'Study': return 'bg-indigo-500/10 border-indigo-500/25 text-indigo-600 dark:text-indigo-400';
      case 'Wellness': return 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-accent-emerald';
      case 'Project': return 'bg-violet-500/10 border-violet-500/25 text-violet-600 dark:text-accent-violet';
      case 'Career': return 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-accent-amber';
      default: return 'bg-bg-secondary border-border text-zinc-750 dark:text-zinc-300';
    }
  };

  if (loading) {
    return (
      <div className="pr-8 py-8 h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Loading Objectives Board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-0 md:pr-8 pt-20 pb-28 md:py-8 md:pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Title Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              Goals & Objectives
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Set customized productivity milestones and log achievements step-by-step.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all duration-150"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Objective</span>
          </button>
        </div>

        {/* ADD GOAL CARD POPUP (collapsible) */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel-elevated panel-tint-neutral border border-indigo-500/20 rounded-2xl p-6 overflow-hidden shadow-lg"
            >
              <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                
                {/* Title */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Objective Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Algorithms and Complexity Course"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-lg text-xs glass-input"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-lg text-xs glass-input bg-card text-zinc-800 dark:text-zinc-300 font-bold focus:outline-none"
                  >
                    <option value="Study">Study</option>
                    <option value="Project">Project</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Career">Career</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Target Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-lg text-xs glass-input font-bold"
                  />
                </div>

                {/* Target Value */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Target Value</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                    className="w-full py-2.5 px-3 rounded-lg text-xs glass-input font-bold text-center"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Metric Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hours, Tasks, Pages"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-lg text-xs glass-input"
                  />
                </div>

                {/* Buttons controls */}
                <div className="md:col-span-2 flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? 'Submitting...' : 'Initialize Objective'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="py-3 px-4 bg-bg-secondary border border-border hover:bg-slate-200 dark:hover:bg-zinc-800/60 rounded-xl text-xs font-bold text-zinc-500 dark:text-zinc-400 transition-all duration-150"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GOALS GRID COLUMNS: ACTIVE OBJECTIVES vs. COMPLETED MILESTONES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMN 1: Active Objectives */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-border pb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Active Objectives</span>
              <span className="ml-1 text-xs px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-indigo-400 font-extrabold">{pendingGoals.length}</span>
            </h2>

            {pendingGoals.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-border rounded-2xl">
                No active targets defined. Fill in the form above to deploy one.
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {pendingGoals.map((goal) => {
                    const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                    const dateStr = new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                    return (
                      <motion.div
                        key={goal._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="glass-panel-elevated panel-tint-neutral p-5 hover:border-indigo-500/40 dark:hover:border-zinc-700/85 transition-all duration-200 space-y-4"
                      >
                        {/* Upper info row */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 leading-snug">{goal.title}</h3>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                              <span>By {dateStr}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${getCategoryStyles(goal.category)}`}>
                              {goal.category}
                            </span>
                            <button
                              onClick={() => handleDelete(goal._id)}
                              className="p-1.5 bg-bg-secondary border border-border hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-accent-rose dark:hover:text-accent-rose transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Lower Progress modifiers */}
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            <span>Incremental Progress</span>
                            <span className="text-zinc-800 dark:text-zinc-200 font-extrabold">{goal.currentValue} / {goal.targetValue} {goal.unit} ({percent}%)</span>
                          </div>

                          {/* Bar indicator */}
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          {/* Interactive increment controllers */}
                          <div className="flex justify-end items-center gap-2 pt-1">
                            <button
                              onClick={() => handleIncrement(goal._id, goal.currentValue, goal.targetValue, -1)}
                              disabled={goal.currentValue <= 0}
                              className="p-1.5 bg-bg-secondary border border-border hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-transform"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleIncrement(goal._id, goal.currentValue, goal.targetValue, 1)}
                              className="p-1.5 bg-bg-secondary border border-border hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 active:scale-90 transition-transform"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* COLUMN 2: Completed Milestones */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-border pb-3 flex items-center gap-2">
              <Trophy className="w-4.5 h-4.5 text-accent-emerald animate-pulse" />
              <span>Completed Milestones</span>
              <span className="ml-1 text-xs px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400 font-extrabold">{completedGoals.length}</span>
            </h2>

            {completedGoals.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-border rounded-2xl">
                No goals marked completed yet. Complete your active targets to trigger achievements!
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {completedGoals.map((goal) => {
                    const dateStr = new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                    return (
                      <motion.div
                        key={goal._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-panel-glow-emerald border border-emerald-500/15 rounded-2xl p-5 hover:border-emerald-500/35 transition-all duration-200 flex justify-between items-center gap-6"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-accent-emerald">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getCategoryStyles(goal.category)}`}>
                              {goal.category}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-zinc-650 dark:text-zinc-300 leading-snug line-through opacity-65">{goal.title}</h3>
                          
                          <p className="text-[10px] text-zinc-500 font-semibold uppercase">
                            Logged: {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <button
                            onClick={() => handleDelete(goal._id)}
                            className="p-1.5 bg-bg-secondary border border-border hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-accent-rose dark:hover:text-accent-rose transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Goals;
