import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  HelpCircle,
  Brain,
  Moon,
  Zap,
  Activity,
  Terminal,
  ChevronRight,
  AlertTriangle,
  Award
} from 'lucide-react';
import { getDynamicInsights } from '../utils/insightHelper.jsx';

const Insights = ({ twinData, loadingTwin }) => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();

  if (loadingTwin) {
    return (
      <div className="pr-8 py-8 h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Calibrating Diagnostic Models...</p>
        </div>
      </div>
    );
  }

  // Get trend visual properties based on predictions
  const getTrendConfig = (trend) => {
    switch (trend) {
      case 'improving':
        return {
          icon: TrendingUp,
          color: 'text-accent-emerald bg-emerald-500/10 border-emerald-500/25',
          banner: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400',
          labelText: 'Positive Growth Trend'
        };
      case 'declining':
        return {
          icon: TrendingDown,
          color: 'text-accent-rose bg-rose-500/10 border-rose-500/25',
          banner: 'bg-rose-500/5 border-rose-500/20 text-rose-400',
          labelText: 'Focus Decline Warning'
        };
      default:
        return {
          icon: Minus,
          color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
          banner: 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400',
          labelText: 'Stable Study Rhythm'
        };
    }
  };

  const trendConfig = getTrendConfig(twinData.growthPrediction.trend);
  const TrendIcon = trendConfig.icon;

  return (
    <div className="px-4 md:px-0 md:pr-8 py-6 md:py-8 pb-28 md:pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Title Header */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            AI Twin Deep-Dive
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Examine growth forecasts, study habit stability, and automated stress recovery logs.
          </p>
        </div>

        {/* SECTION 1: Active Real-Time AI Insights (Now fully matching dashboard and deep-dive) */}
        <div className="glass-panel-elevated panel-tint-bluish p-6 space-y-4 transition-all duration-300">
          <div className="flex items-center gap-2 border-b border-border pb-3.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">Active Real-Time AI Insights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getDynamicInsights(user, twinData).map((insight) => {
              const Icon = insight.icon;
              let borderHoverColor = 'hover:border-emerald-500/35';
              let iconBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
              let textTitleColor = 'text-emerald-400';
              let isPulse = '';

              if (insight.type === 'warning') {
                borderHoverColor = 'hover:border-amber-500/35';
                iconBg = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                textTitleColor = 'text-amber-400';
              } else if (insight.type === 'alert') {
                borderHoverColor = 'hover:border-rose-500/35';
                iconBg = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                textTitleColor = 'text-rose-400';
                isPulse = 'animate-pulse';
              } else if (insight.type === 'motivation') {
                borderHoverColor = 'hover:border-blue-500/35';
                iconBg = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
                textTitleColor = 'text-blue-400';
              }

              return (
                <div 
                  key={insight.type} 
                  className={`p-4 bg-bg-secondary/60 border border-border ${borderHoverColor} rounded-2xl flex items-start gap-4 transition-all group insight-card-neutral`}
                >
                  <div className={`p-2.5 ${iconBg} rounded-xl group-hover:scale-105 transition-transform mt-0.5 ${isPulse}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-[10px] ${textTitleColor} font-extrabold uppercase tracking-widest`}>{insight.title}</p>
                    <p className="text-xs text-zinc-300 leading-relaxed font-semibold insight-card-text">
                      {insight.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* SECTION 2: 30-Day Growth Extrapolator */}
        <div className="glass-panel-elevated panel-tint-bluish p-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden transition-all duration-300">
          {/* Subtle glowing orb */}
          <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Left Column: Visual Projection Ring */}
          <div className="md:col-span-1 flex flex-col justify-center items-center text-center p-4 border-r border-border md:pr-8">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">30-Day Projected Productivity</span>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer SVG glowing circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="62" stroke={theme === 'light' ? '#E2E8F0' : '#1f1f23'} strokeWidth="6" fill="transparent" />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="62" 
                  stroke="url(#indigoGrad)" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="390"
                  strokeDashoffset={390 - (390 * twinData.growthPrediction.projectedProductivity) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Central text */}
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">{twinData.growthPrediction.projectedProductivity}%</span>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Projected</span>
              </div>
            </div>

            <div className={`mt-5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase flex items-center gap-1.5 ${trendConfig.color}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span>{trendConfig.labelText}</span>
            </div>
          </div>

          {/* Right Columns: Descriptive Forecast Forecast */}
          <div className="md:col-span-2 flex flex-col justify-between py-2 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="uppercase tracking-widest font-bold">Predictive Analytics Forecast</span>
              </div>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">Weekly Productivity Trend</h3>
              
              <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed font-medium">
                {twinData.growthPrediction.forecast}
              </p>
            </div>

            {/* Micro details */}
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs font-semibold">
              <div>
                <span className="text-zinc-500">Activity Signals</span>
                <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">{twinData.logsCount} active daily logs</p>
              </div>
              <div>
                <span className="text-zinc-500">Stability Projection Rate</span>
                <p className={`text-sm font-extrabold mt-0.5 ${
                  twinData.growthPrediction.rate > 0 ? 'text-accent-emerald' : twinData.growthPrediction.rate < 0 ? 'text-accent-rose' : 'text-zinc-400'
                }`}>
                  {twinData.growthPrediction.rate > 0 ? '+' : ''}{twinData.growthPrediction.rate} score units/day
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* TWO COLUMN DIAGNOSTIC DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Diagnostic 1: Consistency & Volatility */}
          <div className="glass-panel-elevated panel-tint-bluish p-6 space-y-4 transition-colors">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-border pb-3">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Habit Stability & Signals</span>
            </h2>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Consistency Score</span>
              <span className="text-lg font-extrabold text-indigo-600 dark:text-white bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25">
                {twinData.consistencyIndex}%
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Consistency Score tracks the stability of your study hours over rolling intervals.
              {twinData.consistencyIndex > 75 
                ? " You maintain a steady study rhythm. This consistent habit pattern helps reinforce learning and builds strong long-term study routines." 
                : " Volatile spikes (such as heavy study sprints followed by days of inactivity) reduce overall retention. Strive to lock in a steady 2-3 hour baseline daily."
              }
            </p>
          </div>

          {/* Diagnostic 2: Exhaustion & Burnout Profile */}
          <div className="glass-panel-elevated panel-tint-bluish p-6 space-y-4 transition-colors">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-border pb-3">
              <Activity className="w-4 h-4 text-accent-rose" />
              <span>Burnout & Stress Analysis</span>
            </h2>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Burnout Risk Index</span>
              <span className={`text-lg font-extrabold bg-bg-secondary px-2 py-0.5 rounded border ${
                twinData.burnout.level === 'Critical' 
                  ? 'border-rose-500/40 text-accent-rose animate-pulse'
                  : twinData.burnout.level === 'High'
                  ? 'border-orange-500/40 text-orange-400'
                  : 'border-emerald-500/40 text-accent-emerald'
              }`}>
                {twinData.burnout.score}%
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Stress levels, sleep patterns, and study intensity are analyzed using our rolling burnout prediction model.
              {twinData.burnout.score > 55
                ? " Accumulating stresses are creating focus degradation. Implement immediate active recovery rest sessions and target a mandatory 8 hours of sleep tonight."
                : " Your stress indicators are highly balanced. Your digital twin reports a fully charged battery ready for complex analytical tasks."
              }
            </p>
          </div>

        </div>

        {/* DYNAMIC TECH LOG TERMINAL BLOCK */}
        <div className="glass-panel-elevated panel-tint-bluish p-6 space-y-4 transition-colors">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-4.5 h-4.5 text-primary" />
            <span>Twin Behavioral Insights & Logs</span>
          </h2>
          
          {/* Developer terminal readout styling */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 font-mono text-[11px] text-zinc-400 space-y-2 relative overflow-hidden keep-light-text">
            <div className="absolute top-2 right-3 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-[9px] font-bold text-indigo-400 select-none keep-light-text">
              AI DIAGNOSTIC OUT
            </div>
            
            <p className="text-zinc-650 keep-light-text">[{new Date().toISOString()}] INITIALIZING BEHAVIORAL DIAGNOSTIC MODEL...</p>
            <p className="text-zinc-500 keep-light-text">[{new Date().toISOString()}] Loading student log datasets... COMPLETED.</p>
            <p className="text-zinc-450 dark:text-zinc-400 keep-light-text">
              <span className="text-indigo-400 keep-light-text">► EVALUATION METRICS:</span> Productivity = {twinData.productivityScore}/100, Consistency = {twinData.consistencyIndex}%, Burnout = {twinData.burnout.score}% ({twinData.burnout.level})
            </p>
            <p className="text-zinc-450 dark:text-zinc-400 keep-light-text">
              <span className="text-indigo-400 keep-light-text">► TELEMETRY STREAK:</span> {twinData.activeStreak} consecutive days logged.
            </p>
            
            <div className="pt-2 border-t border-zinc-900 space-y-1.5 keep-light-text">
              <p className="text-zinc-550 dark:text-zinc-500 keep-light-text">// ACTIVE AI RECOVERY ORB ROUTINE INJECTING RECOMMENDATIONS:</p>
              {twinData.recommendations.map((rec, i) => (
                <p key={i} className="text-zinc-350 dark:text-zinc-300 flex items-start gap-1 keep-light-text">
                  <span className="text-indigo-500 font-bold keep-light-text">»</span>
                  <span className="keep-light-text">{rec}</span>
                </p>
              ))}
            </div>

            <div className="pt-2 text-zinc-650 keep-light-text">// PREDICTIONS SOLVER ENGAGED:</div>
            <p className="text-emerald-400 keep-light-text">
              [growthPredictionEngine] Forecasting productivity trend... STATUS: {twinData.growthPrediction.trend.toUpperCase()} (slope: {twinData.growthPrediction.rate})
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Insights;

