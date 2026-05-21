import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  // Custom tooltips with premium styling matching our dark-theme glassmorphism
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-zinc-950/90 border border-zinc-800 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">{label}</p>
          <div className="space-y-1">
            {payload.map((item) => (
              <p key={item.name} className="text-xs font-bold flex items-center justify-between gap-6" style={{ color: item.color }}>
                <span className="text-zinc-300 font-medium">{item.name}:</span>
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
            <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Analytics Hub
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Visualize historical study distributions, sleep-to-stress correlation grids, and growth vectors.
            </p>
          </div>

          {/* Timeframe selector controls */}
          <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-1 backdrop-blur-md">
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
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="h-[450px] border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-500 animate-pulse-slow">
              <BarChart3 className="w-10 h-10" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white mb-1.5">No Historical Telemetry Found</h3>
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
                { label: 'Avg Productivity', value: `${aggregates.avgProd}%`, icon: TrendingUp, color: 'text-indigo-400 bg-indigo-500/10' },
                { label: 'Avg Study Time', value: `${aggregates.avgStudy} hrs`, icon: Calendar, color: 'text-accent-emerald bg-emerald-500/10' },
                { label: 'Avg Rest Sleep', value: `${aggregates.avgSleep} hrs`, icon: Moon, color: 'text-accent-violet bg-violet-500/10' },
                { label: 'Avg Stress Load', value: `${aggregates.avgStress} / 10`, icon: Activity, color: 'text-accent-rose bg-rose-500/10' }
              ].map((item, i) => (
                <div key={i} className="glass-panel border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</span>
                    <h4 className="text-lg font-extrabold text-white mt-0.5">{item.value}</h4>
                  </div>
                </div>
              ))}
            </div>

            {/* CHARTS CONTAINER GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart 1: Productivity Curve over Time (Spans 2 columns) */}
              <div className="lg:col-span-2 glass-panel border border-zinc-800/80 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>Productivity Index Curve</span>
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Efficiency Telemetry</span>
                </div>
                
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                      <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={10} tickLine={false} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="Productivity Score"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 1.5 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Stress vs. Focus Area comparison (Spans 1 column) */}
              <div className="lg:col-span-1 glass-panel border border-zinc-800/80 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent-rose" />
                    <span>Cognitive Balance Grid</span>
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Stress vs Focus</span>
                </div>
                
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: -25, right: 5, top: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                      <XAxis dataKey="date" stroke="#52525b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} tickLine={false} domain={[1, 10]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                      <Area
                        type="monotone"
                        dataKey="Focus Quality"
                        stroke="#8b5cf6"
                        fill="rgba(139, 92, 246, 0.08)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="Stress Level"
                        stroke="#f43f5e"
                        fill="rgba(244, 63, 94, 0.08)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Study Hours vs. Sleep Hours Grouped Bar Chart (Spans Full 3 Columns) */}
              <div className="lg:col-span-3 glass-panel border border-zinc-800/80 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4.5 h-4.5 text-accent-emerald" />
                    <span>Allocation Contrast: Study Volume vs. Recovery Sleep</span>
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hours comparison</span>
                </div>
                
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: -15, right: 10, top: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                      <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                      <Bar dataKey="Study Hours" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="Sleep Hours" fill="#a78bfa" radius={[4, 4, 0, 0]} maxBarSize={28} />
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
