import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  BookOpen, 
  Moon, 
  Brain, 
  Activity, 
  CheckSquare, 
  FileText, 
  Save, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

const Tracker = ({ triggerTwinRefresh }) => {
  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getLocalDateString(new Date()));
  const [studyHours, setStudyHours] = useState(4);
  const [focusLevel, setFocusLevel] = useState(7);
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetchingLog, setFetchingLog] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error'

  // Fetch log for selected date on mount or when date changes
  useEffect(() => {
    const fetchLogForDate = async () => {
      setFetchingLog(true);
      setSaveStatus(null);
      try {
        const res = await api.get(`/logs/${date}`);
        // Log exists, populate values
        const log = res.data;
        setStudyHours(log.studyHours);
        setFocusLevel(log.focusLevel);
        setSleepHours(log.sleepHours);
        setStressLevel(log.stressLevel);
        setTasksCompleted(log.tasksCompleted);
        setTasksTotal(log.tasksTotal);
        setNotes(log.notes || '');
      } catch (error) {
        // No log for date, reset to typical baseline defaults
        setStudyHours(4);
        setFocusLevel(7);
        setSleepHours(7);
        setStressLevel(4);
        setTasksCompleted(0);
        setTasksTotal(0);
        setNotes('');
      }
      setFetchingLog(false);
    };

    fetchLogForDate();
  }, [date]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveStatus(null);

    const payload = {
      date,
      studyHours: Number(studyHours),
      focusLevel: Number(focusLevel),
      sleepHours: Number(sleepHours),
      stressLevel: Number(stressLevel),
      tasksCompleted: Number(tasksCompleted),
      tasksTotal: Number(tasksTotal),
      notes,
    };

    try {
      await api.post('/logs', payload);
      setSaveStatus('success');
      if (triggerTwinRefresh) triggerTwinRefresh();
      
      // Flash success and remove banner after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to save daily log:', error);
      setSaveStatus('error');
    }
    setLoading(false);
  };

  return (
    <div className="px-4 md:px-0 md:pr-8 pt-20 pb-36 md:py-8 md:pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              Daily Telemetry Log
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Feed your student digital twin with performance and recovery logs.
            </p>
          </div>
          
          {/* Date Picker Component */}
          <div className="flex items-center gap-3 bg-bg-secondary border border-border rounded-xl px-4 py-2.5 backdrop-blur-md">
            <Calendar className="w-4 h-4 text-primary" />
            <input
              type="date"
              value={date}
              max={getLocalDateString(new Date())}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-sm text-zinc-800 dark:text-zinc-100 font-semibold focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {fetchingLog ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <span className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Accessing Synced Day...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: Numeric sliders for intensity and recovery */}
            <div className="glass-panel-elevated panel-tint-lavender p-6 space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-border pb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Study Metrics</span>
              </h2>

              {/* Study Hours Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Study Hours</span>
                  </label>
                  <span className="text-sm font-extrabold text-indigo-500 dark:text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-lg border border-indigo-500/25">
                    {studyHours} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="0.5"
                  value={studyHours}
                  onChange={(e) => setStudyHours(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 font-semibold">
                  <span>0 hrs</span>
                  <span>4 hrs</span>
                  <span>8 hrs</span>
                  <span>12 hrs</span>
                  <span>16+ hrs</span>
                </div>
              </div>

              {/* Focus Level Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-accent-violet" />
                    <span>Focus Quality</span>
                  </label>
                  <span className="text-sm font-extrabold text-violet-600 dark:text-accent-violet px-2 py-0.5 bg-violet-500/10 rounded-lg border border-violet-500/25">
                    {focusLevel} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={focusLevel}
                  onChange={(e) => setFocusLevel(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-600 font-semibold">
                  <span>1 (Distracted)</span>
                  <span>5 (Average)</span>
                  <span>10 (Flow State)</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Physical Recovery sliders */}
            <div className="glass-panel-elevated panel-tint-lavender p-6 space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-border pb-3 flex items-center gap-2">
                <Moon className="w-4 h-4 text-accent-emerald" />
                <span>Wellness & Balance</span>
              </h2>

              {/* Sleep Hours Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-accent-emerald" />
                    <span>Sleep Rested</span>
                  </label>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-accent-emerald px-2 py-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/25">
                    {sleepHours} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-600 font-semibold">
                  <span>0 hrs (None)</span>
                  <span>6 hrs</span>
                  <span>8 hrs (Optimal)</span>
                  <span>12+ hrs</span>
                </div>
              </div>

              {/* Stress Level Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-accent-rose" />
                    <span>Stress Level</span>
                  </label>
                  <span className={`text-sm font-extrabold px-2 py-0.5 rounded-lg border ${
                    stressLevel > 7 
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-accent-rose'
                      : stressLevel > 4
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-accent-amber'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-accent-emerald'
                  }`}>
                    {stressLevel} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-600 font-semibold">
                  <span>1 (Serene)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Overwhelmed)</span>
                </div>
              </div>
            </div>

            {/* FULL WIDTH SPANS: Task ratios and notes */}
            <div className="md:col-span-2 glass-panel-elevated panel-tint-neutral p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-0">
              
              {/* Task Completed Inputs */}
              <div className="md:col-span-1 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-border pb-2">
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                  <span>Tasks Finished</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Completed</label>
                    <input
                      type="number"
                      min="0"
                      value={tasksCompleted}
                      onChange={(e) => setTasksCompleted(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full py-2.5 px-3 rounded-lg text-sm glass-input font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Total Tasks</label>
                    <input
                      type="number"
                      min="0"
                      value={tasksTotal}
                      onChange={(e) => {
                        const total = Math.max(0, parseInt(e.target.value) || 0);
                        setTasksTotal(total);
                        // Prevent completed exceeding total
                        if (tasksCompleted > total) setTasksCompleted(total);
                      }}
                      className="w-full py-2.5 px-3 rounded-lg text-sm glass-input font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Text Notes */}
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-border pb-2">
                  <FileText className="w-4 h-4 text-accent-violet" />
                  <span>Subject Logs / Core Notes</span>
                </h3>
                <textarea
                  placeholder="Record your study topics (e.g. Practiced dynamic programming in algorithms; constructed Node express setup; revised cellular biology definitions...)"
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3.5 rounded-xl text-xs glass-input font-medium leading-relaxed min-h-[140px] md:min-h-[110px] resize-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

            </div>

            {/* Submit Bar */}
            <div className="md:col-span-2 fixed bottom-16 md:static left-0 right-0 p-4 md:p-0 bg-[#0a0c10]/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t border-border/60 md:border-0 shadow-[0_-8px_20px_rgba(0,0,0,0.3)] md:shadow-none flex items-center justify-between gap-4 z-[90] pb-safe">
              <div className="hidden md:flex text-xs font-semibold text-zinc-500 items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Heuristic indicators update twin state calculations instantly.</span>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto py-3.5 md:py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/25 active:scale-95 hover:shadow-indigo-600/35 transition-all duration-150 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Synchronize Log</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* Floating state indicators */}
        <AnimatePresence>
          {saveStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 px-5 py-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 shadow-xl shadow-emerald-950/20 backdrop-blur-md flex items-center gap-3 z-[110]"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Digital Twin Telemetry Synced Successfully!</span>
            </motion.div>
          )}

          {saveStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 px-5 py-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-400 shadow-xl shadow-rose-950/20 backdrop-blur-md flex items-center gap-3 z-[110]"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Database Connection Error. Try saving again.</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Tracker;
