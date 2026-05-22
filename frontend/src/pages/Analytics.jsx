import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../utils/api.js';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Moon, 
  Activity, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

// Local frontend version of Productivity Score heuristic to avoid cross-import complexities
const getProductivityScore = (log) => {
  if (!log) return 0;
  const studyHoursNorm = Math.min((log.studyHours / 6) * 100, 100);
  const focusNorm = log.focusLevel * 10;
  let taskCompletionNorm = log.tasksTotal > 0 ? (log.tasksCompleted / log.tasksTotal) * 100 : focusNorm;
  
  let score = (0.4 * studyHoursNorm) + (0.3 * focusNorm) + (0.3 * taskCompletionNorm);
  if (log.sleepHours < 5) score -= (5 - log.sleepHours) * 8;
  if (log.stressLevel > 7) score -= (log.stressLevel - 7) * 8;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

const Analytics = () => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7'); // '7' or '30' or 'all'

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/logs');
        setLogs(res.data);
      } catch (error) {
        console.error('Failed to fetch logs for analytics:', error);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  // Filter logs based on selected timeframe
  const getFilteredData = () => {
    if (timeframe === 'all') return logs;
    const count = parseInt(timeframe);
    return logs.slice(-count);
  };

  const filteredLogs = getFilteredData();

  // Map database logs into Recharts friendly structures
  const chartData = filteredLogs.map((log) => {
    // Format date string for shorter chart labels (e.g. "May 21")
    const dateObj = new Date(log.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    return {
      rawDate: log.date,
      date: formattedDate,
      'Study Hours': log.studyHours,
      'Sleep Hours': log.sleepHours,
      'Stress Level': log.stressLevel,
      'Focus Quality': log.focusLevel,
      'Productivity Score': getProductivityScore(log),
    };
  });

  // Calculate high-level stats for the current filtered timeframe
  const calculateAggregates = () => {
    if (chartData.length === 0) return { avgStudy: 0, avgSleep: 0, avgStress: 0, avgProd: 0 };
    
    const totals = chartData.reduce((acc, curr) => {
      acc.study += curr['Study Hours'];
      acc.sleep += curr['Sleep Hours'];
      acc.stress += curr['Stress Level'];
      acc.prod += curr['Productivity Score'];
      return acc;
    }, { study: 0, sleep: 0, stress: 0, prod: 0 });

    const len = chartData.length;
    return {
      avgStudy: Math.round((totals.study / len) * 10) / 10,
      avgSleep: Math.round((totals.sleep / len) * 10) / 10,
      avgStress: Math.round((totals.stress / len) * 10) / 10,
      avgProd: Math.round(totals.prod / len),
    };
  };

  const aggregates = calculateAggregates();

  // Custom tooltips with premium styling matching our dark/light theme glassmorphism
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 bg-card border border-border rounded-xl shadow-2xl backdrop-blur-md ${
          theme === 'light' ? 'shadow-indigo-500/5' : 'shadow-black/75'
        }`}>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">{label}</p>
          <div className="space-y-1">
            {payload.map((item) => (
              <p key={item.name} className="text-xs font-bold flex items-center justify-between gap-6" style={{ color: item.color }}>
                <span className="text-zinc-500 dark:text-zinc-300 font-medium">{item.name}:</span>
                <span>{item.value}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="pr-8 py-8 h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Aggregating Telemetry Charts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-8 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              Analytics Hub
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Visualize historical study distributions, sleep-to-stress correlation grids, and growth vectors.
            </p>
          </div>

          {/* Timeframe selector controls */}
          <div className="flex items-center gap-1.5 bg-bg-secondary border border-border rounded-xl p-1 backdrop-blur-md timeframe-selector-container">
            {[
              { label: 'Last 7 Days', value: '7' },
              { label: 'Last 30 Days', value: '30' },
              { label: 'All Time', value: 'all' }
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setTimeframe(btn.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeframe === btn.value
                    ? 'bg-indigo-600 border border-indigo-500/35 text-white'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800/40 border border-transparent'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="h-[450px] border border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="p-4 bg-bg-secondary border border-border rounded-2xl text-zinc-500 animate-pulse-slow">
              <BarChart3 className="w-10 h-10" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1.5">No Historical Telemetry Found</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                We need daily telemetry logs to compile charting analytics. Head over to the logger page to register your daily parameters.
              </p>
              <Link to="/tracker" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25">
                Start Logging Daily
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* TIMEFRAME SUMMARY AGGREGATES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Avg Productivity', value: `${aggregates.avgProd}%`, icon: TrendingUp, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' },
                { label: 'Avg Study Time', value: `${aggregates.avgStudy} hrs`, icon: Calendar, color: 'text-emerald-600 dark:text-accent-emerald bg-emerald-500/10' },
                { label: 'Avg Rest Sleep', value: `${aggregates.avgSleep} hrs`, icon: Moon, color: 'text-violet-600 dark:text-accent-violet bg-violet-500/10' },
                { label: 'Avg Stress Load', value: `${aggregates.avgStress} / 10`, icon: Activity, color: 'text-rose-600 dark:text-accent-rose bg-rose-500/10' }
              ].map((item, i) => (
                <div key={i} className="glass-panel-elevated panel-tint-neutral p-4 flex items-center gap-4 hover:translate-y-0">
                  <div className={`p-2.5 rounded-xl ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</span>
                    <h4 className="text-lg font-extrabold text-zinc-900 dark:text-white mt-0.5">{item.value}</h4>
                  </div>
                </div>
              ))}
            </div>

            {/* CHARTS CONTAINER GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart 1: Productivity Curve over Time (Spans 2 columns) */}
              <div className="lg:col-span-2 glass-panel-elevated panel-tint-neutral p-6 space-y-6 relative overflow-hidden">
                {theme === 'light' && (
                  <div className="absolute inset-x-4 inset-y-12 bg-gradient-to-t from-indigo-500/[0.015] to-transparent pointer-events-none rounded-xl" />
                )}
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>Productivity Index Curve</span>
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Efficiency Telemetry</span>
                </div>
                
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10 }}>
                      <defs>
                        <filter id="prodLineGlow" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={theme === 'light' ? '#818CF8' : '#6366f1'} floodOpacity={0.25} />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? 'rgba(148, 163, 184, 0.06)' : 'rgba(255, 255, 255, 0.03)'} />
                      <XAxis dataKey="date" stroke={theme === 'light' ? '#64748B' : '#52525b'} fontSize={10} tickLine={false} />
                      <YAxis stroke={theme === 'light' ? '#64748B' : '#52525b'} fontSize={10} tickLine={false} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: theme === 'light' ? '#E2E8F0' : '#2A3142', strokeWidth: 1 }} />
                      <Line
                        type="monotone"
                        dataKey="Productivity Score"
                        stroke={theme === 'light' ? '#818CF8' : '#6366f1'}
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 1.5, fill: theme === 'light' ? '#FFFFFF' : '#6366f1' }}
                        activeDot={{ r: 5 }}
                        style={{ filter: 'url(#prodLineGlow)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Stress vs. Focus Area comparison (Spans 1 column) */}
              <div className="lg:col-span-1 glass-panel-elevated panel-tint-neutral p-6 space-y-6 relative overflow-hidden">
                {theme === 'light' && (
                  <div className="absolute inset-x-4 inset-y-12 bg-gradient-to-t from-indigo-500/[0.015] to-transparent pointer-events-none rounded-xl" />
                )}
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent-rose" />
                    <span>Cognitive Balance Grid</span>
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Stress vs Focus</span>
                </div>
                
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: -25, right: 5, top: 10 }}>
                      <defs>
                        <linearGradient id="focusAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={theme === 'light' ? '#A78BFA' : '#8b5cf6'} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={theme === 'light' ? '#A78BFA' : '#8b5cf6'} stopOpacity={0.01} />
                        </linearGradient>
                        <linearGradient id="stressAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={theme === 'light' ? '#EE8A7E' : '#f43f5e'} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={theme === 'light' ? '#EE8A7E' : '#f43f5e'} stopOpacity={0.01} />
                        </linearGradient>
                        <filter id="focusAreaGlow" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={theme === 'light' ? '#A78BFA' : '#8b5cf6'} floodOpacity={0.15} />
                        </filter>
                        <filter id="stressAreaGlow" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={theme === 'light' ? '#EE8A7E' : '#f43f5e'} floodOpacity={0.15} />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? 'rgba(148, 163, 184, 0.06)' : 'rgba(255, 255, 255, 0.03)'} />
                      <XAxis dataKey="date" stroke={theme === 'light' ? '#64748B' : '#52525b'} fontSize={9} tickLine={false} />
                      <YAxis stroke={theme === 'light' ? '#64748B' : '#52525b'} fontSize={9} tickLine={false} domain={[1, 10]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', color: theme === 'light' ? '#475569' : '#D1D5DB' }} />
                      <Area
                        type="monotone"
                        dataKey="Focus Quality"
                        stroke={theme === 'light' ? '#A78BFA' : '#8b5cf6'}
                        fill="url(#focusAreaGrad)"
                        strokeWidth={2}
                        style={{ filter: 'url(#focusAreaGlow)' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Stress Level"
                        stroke={theme === 'light' ? '#EE8A7E' : '#f43f5e'}
                        fill="url(#stressAreaGrad)"
                        strokeWidth={2}
                        style={{ filter: 'url(#stressAreaGlow)' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Study Hours vs. Sleep Hours Grouped Bar Chart (Spans Full 3 Columns) */}
              <div className="lg:col-span-3 glass-panel-elevated panel-tint-neutral p-6 space-y-6 relative overflow-hidden">
                {theme === 'light' && (
                  <div className="absolute inset-x-4 inset-y-12 bg-gradient-to-t from-indigo-500/[0.015] to-transparent pointer-events-none rounded-xl" />
                )}
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-4.5 h-4.5 text-accent-emerald" />
                    <span>Allocation Contrast: Study Volume vs. Recovery Sleep</span>
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hours comparison</span>
                </div>
                
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: -15, right: 10, top: 10 }}>
                      <defs>
                        <linearGradient id="studyBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={theme === 'light' ? '#34D399' : '#10b981'} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={theme === 'light' ? '#34D399' : '#10b981'} stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="sleepBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={theme === 'light' ? '#818CF8' : '#a78bfa'} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={theme === 'light' ? '#818CF8' : '#a78bfa'} stopOpacity={0.4} />
                        </linearGradient>
                        <filter id="studyBarGlow" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={theme === 'light' ? '#34D399' : '#10b981'} floodOpacity={0.12} />
                        </filter>
                        <filter id="sleepBarGlow" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={theme === 'light' ? '#818CF8' : '#a78bfa'} floodOpacity={0.12} />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? 'rgba(148, 163, 184, 0.06)' : 'rgba(255, 255, 255, 0.03)'} />
                      <XAxis dataKey="date" stroke={theme === 'light' ? '#64748B' : '#52525b'} fontSize={10} tickLine={false} />
                      <YAxis stroke={theme === 'light' ? '#64748B' : '#52525b'} fontSize={10} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'light' ? 'rgba(59, 130, 246, 0.03)' : 'rgba(139, 92, 246, 0.04)', radius: 8 }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: theme === 'light' ? '#475569' : '#D1D5DB' }} />
                      <Bar dataKey="Study Hours" fill="url(#studyBarGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} style={{ filter: 'url(#studyBarGlow)' }} />
                      <Bar dataKey="Sleep Hours" fill="url(#sleepBarGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} style={{ filter: 'url(#sleepBarGlow)' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Analytics;
