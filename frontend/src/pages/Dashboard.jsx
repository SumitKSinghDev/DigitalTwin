import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import TwinAvatar from '../components/Dashboard/TwinAvatar.jsx';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Activity, 
  Target, 
  Sparkles, 
  AlertTriangle,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Brain
} from 'lucide-react';

const Dashboard = ({ twinData, loadingTwin, goalsCount }) => {
  const { user } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  // Fetch pending goals for quick display
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get('/goals?status=pending');
        setGoals(res.data.slice(0, 3)); // show top 3 pending goals
      } catch (error) {
        console.error('Failed to fetch goals for dashboard:', error);
      }
      setLoadingGoals(false);
    };
    fetchGoals();
  }, [goalsCount]);

  if (loadingTwin) {
    return (
      <div className="pr-8 py-8 h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Constructing Student Twin...</p>
        </div>
      </div>
    );
  }

  // Get color configurations based on burnout risk
  const getBurnoutBadgeColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'Moderate': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'High': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'Critical': return 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse';
      default: return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    }
  };

  return (
    <div className="pr-8 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Hello, {user?.username || 'Student'}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Your digital twin telemetry is synced. Read your productivity profiles below.
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg backdrop-blur-md text-xs font-semibold text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Twin Core Version 1.0</span>
          </div>
        </div>

        {/* 4 QUICK TELEMETRY HIGHLIGHT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Productivity Score */}
          <div className="glass-panel border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-200 group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Productivity Score</span>
              <div className="p-2 bg-indigo-500/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold text-white">{twinData.productivityScore}</span>
                <span className="text-xs text-zinc-500 ml-1">/100</span>
              </div>
              <div className="flex items-center text-[10px] font-bold text-indigo-400 uppercase tracking-widest gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Computed today</span>
              </div>
            </div>
          </div>

          {/* Card 2: Burnout Risk */}
          <div className="glass-panel border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-200 group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mental Burnout Risk</span>
              <div className="p-2 bg-zinc-800/60 rounded-xl text-zinc-400 group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold text-white">{twinData.burnout.score}%</span>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${getBurnoutBadgeColor(twinData.burnout.level)}`}>
                {twinData.burnout.level} Risk
              </span>
            </div>
          </div>

          {/* Card 3: Consistency Index */}
          <div className="glass-panel border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-200 group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Consistency Index</span>
              <div className="p-2 bg-zinc-800/60 rounded-xl text-zinc-400 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold text-white">{twinData.consistencyIndex}%</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase">variance scale</span>
            </div>
          </div>

          {/* Card 4: Daily Logging Streak */}
          <div className="glass-panel border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-200 group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Logging Streak</span>
              <div className="p-2 bg-zinc-800/60 rounded-xl text-zinc-400 group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold text-white">{twinData.activeStreak}</span>
                <span className="text-xs text-zinc-500 ml-1">days</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

        </div>

        {/* TWO-COLUMN DUAL LAYOUT: Twin Orb & AI Telemetry recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Glowing Pulse Twin Avatar (occupies 1/3) */}
          <div className="lg:col-span-1 glass-panel border border-zinc-800/80 rounded-2xl relative overflow-hidden flex items-center justify-center">
            {/* Mesh highlights inside card */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
            <TwinAvatar status={twinData.twinStatus} username={user?.username} />
          </div>

          {/* Column 2: Actionable AI Recommendations (occupies 2/3) */}
          <div className="lg:col-span-2 glass-panel border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-white border-b border-zinc-800/80 pb-3.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Twin Diagnostic Recommendations</span>
              </h2>
              
              <div className="space-y-4">
                {twinData.recommendations.map((rec, i) => (
                  <div 
                    key={i}
                    className="p-4 bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl flex items-start gap-3 transition-colors group"
                  >
                    {rec.includes('CRITICAL') || rec.includes('Emergency') ? (
                      <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-accent-rose mt-0.5 animate-pulse">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : rec.includes('warning') || rec.includes('Disruption') ? (
                      <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-accent-amber mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-primary mt-0.5 group-hover:scale-105 transition-transform">
                        <Brain className="w-4 h-4" />
                      </div>
                    )}
                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800/80 pt-4 mt-6 flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-medium">Heuristics are computed across rolling weekly logs.</span>
              <Link to="/insights" className="text-primary hover:text-indigo-400 font-bold flex items-center gap-1 group">
                <span>Open Deep-Dive Analytics</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

        {/* BOTTOM COLUMN: Quick Goal Checklist Tracker */}
        <div className="glass-panel border border-zinc-800/80 rounded-2xl p-6">
          <div className="flex justify-between items-center border-b border-zinc-800/80 pb-4 mb-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-4.5 h-4.5 text-primary" />
              <span>Pending Objective Milestones</span>
            </h2>
            <Link to="/goals" className="text-xs text-zinc-400 hover:text-zinc-200 font-semibold flex items-center gap-1 group">
              <span>Manage Goals</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loadingGoals ? (
            <div className="py-8 flex justify-center">
              <span className="w-5 h-5 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            </div>
          ) : goals.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl space-y-3">
              <p>No active study or wellness goals defined for this cycle.</p>
              <Link to="/goals" className="inline-block px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/30 rounded-lg text-primary font-bold">
                Create First Goal
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                
                // Color categories
                const getCategoryStyles = (cat) => {
                  switch (cat) {
                    case 'Study': return 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400';
                    case 'Wellness': return 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
                    case 'Project': return 'bg-violet-500/10 border-violet-500/25 text-violet-400';
                    default: return 'bg-zinc-800 border-zinc-700 text-zinc-300';
                  }
                };

                return (
                  <div 
                    key={goal._id}
                    className="p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl hover:border-zinc-700/80 transition-colors flex flex-col justify-between space-y-4"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-xs font-bold text-zinc-200 line-clamp-1">{goal.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${getCategoryStyles(goal.category)}`}>
                        {goal.category}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-semibold text-zinc-500">
                        <span>Progress Ratio</span>
                        <span className="text-zinc-300 font-extrabold">{goal.currentValue} / {goal.targetValue} {goal.unit} ({percent}%)</span>
                      </div>
                      
                      {/* Bar Indicator */}
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
