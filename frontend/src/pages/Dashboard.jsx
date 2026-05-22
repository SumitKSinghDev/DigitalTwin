import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../utils/api.js';
import TwinAvatar from '../components/Dashboard/TwinAvatar.jsx';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
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
  Brain,
  Search,
  Bell,
  Calendar,
  Code,
  CheckCircle2,
  Lock,
  X
} from 'lucide-react';
import { getDynamicInsights } from '../utils/insightHelper.jsx';

// Custom SVG Circular Progress Ring for Productivity (Hierarchical & Animated)
const ProductivityRing = ({ score }) => {
  const { theme } = useTheme();
  const radius = 27;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-[58px] h-[58px] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} stroke={theme === 'light' ? 'rgba(99, 102, 241, 0.08)' : '#1F2937'} strokeWidth="4.5" fill="transparent" />
        <motion.circle 
          cx="36" 
          cy="36" 
          r={radius} 
          stroke="url(#blueIndigoGrad)" 
          strokeWidth="5.5" 
          fill="transparent" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: theme === 'light' ? 'none' : 'drop-shadow(0 0 3px rgba(139, 92, 246, 0.35))' }}
        />
        <defs>
          <linearGradient id="blueIndigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Custom SVG Circular Progress Ring for Burnout Risk (Hierarchical & Animated)
const BurnoutDial = ({ score, level }) => {
  const { theme } = useTheme();
  const radius = 27;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "#22C55E"; // Green for Low
  if (level === 'Moderate' || level === 'Medium') color = "#F59E0B"; // Orange for Moderate
  else if (level === 'High' || level === 'Critical') color = "#EF4444"; // Red for High

  return (
    <div className="relative w-[58px] h-[58px] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} stroke={theme === 'light' ? 'rgba(99, 102, 241, 0.08)' : '#1F2937'} strokeWidth="4.5" fill="transparent" />
        <motion.circle 
          cx="36" 
          cy="36" 
          r={radius} 
          stroke={color} 
          strokeWidth="5.5" 
          fill="transparent" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: theme === 'light' ? 'none' : `drop-shadow(0 0 4px ${color}35)` }}
        />
      </svg>
    </div>
  );
};

// Custom SVG Circular Progress Ring for Focus Consistency (Hierarchical & Animated)
const ConsistencyRing = ({ score }) => {
  const { theme } = useTheme();
  const radius = 27;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-[58px] h-[58px] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} stroke={theme === 'light' ? 'rgba(99, 102, 241, 0.08)' : '#1F2937'} strokeWidth="4.5" fill="transparent" />
        <motion.circle 
          cx="36" 
          cy="36" 
          r={radius} 
          stroke="url(#purplePinkGrad)" 
          strokeWidth="5.5" 
          fill="transparent" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: theme === 'light' ? 'none' : 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.35))' }}
        />
        <defs>
          <linearGradient id="purplePinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Sparkline Mini Chart for Weekly Growth Card
const GrowthSparkline = () => {
  const data = [
    { name: 'Mon', value: 30 },
    { name: 'Tue', value: 40 },
    { name: 'Wed', value: 35 },
    { name: 'Thu', value: 50 },
    { name: 'Fri', value: 45 },
    { name: 'Sat', value: 65 },
    { name: 'Sun', value: 78 }
  ];

  return (
    <div className="w-full h-12 mt-2.5 relative overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#8B5CF6" 
            strokeWidth={1.8} 
            fillOpacity={1} 
            fill="url(#sparkGrad)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Focus Heatmap Grid (Dynamic timeframe vs Hours of the Day)
const FocusHeatmap = ({ logs, timeframe }) => {
  const { theme } = useTheme();
  const [hoveredCell, setHoveredCell] = useState(null);
  const containerRef = React.useRef(null);
  const hourLabels = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '12 AM'];
  
  const getHeatmapDays = () => {
    const dates = [];
    const current = new Date();
    
    if (timeframe === '7') {
      const day = current.getDay();
      const diff = current.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(current.getTime());
      monday.setDate(diff);
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday.getTime());
        d.setDate(monday.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const date = String(d.getDate()).padStart(2, '0');
        dates.push({
          dateStr: `${year}-${month}-${date}`,
          label: d.toLocaleDateString('en-US', { weekday: 'short' })
        });
      }
    } else if (timeframe === '14') {
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(current.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const date = String(d.getDate()).padStart(2, '0');
        dates.push({
          dateStr: `${year}-${month}-${date}`,
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
    } else if (timeframe === '30') {
      const year = current.getFullYear();
      const month = current.getMonth();
      const numDays = new Date(year, month + 1, 0).getDate();
      
      for (let i = 1; i <= numDays; i++) {
        const mStr = String(month + 1).padStart(2, '0');
        const dStr = String(i).padStart(2, '0');
        const d = new Date(year, month, i);
        dates.push({
          dateStr: `${year}-${mStr}-${dStr}`,
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
    }
    return dates;
  };

  const getHourFocusFactor = (hour) => {
    if (hour >= 18 && hour <= 22) return 1.0; // Peak 6 PM - 10 PM
    if (hour >= 9 && hour <= 12) return 0.6;   // Morning 9 AM - 12 PM
    if (hour >= 13 && hour <= 17) return 0.35; // Afternoon 1 PM - 5 PM
    if (hour >= 23 || hour <= 1) return 0.2;   // Winding down
    return 0.05;                               // Sleep hours
  };

  const getGridOpacity = (dateStr, hourIndex, isLogged) => {
    const log = logs.find(l => {
      if (!l.date) return false;
      const logDateOnly = l.date.includes('T') ? l.date.split('T')[0] : l.date;
      return logDateOnly === dateStr;
    });
    const focusLevel = log ? log.focusLevel : 5.0; // 5.0 baseline focus level
    const focusFactor = focusLevel / 10;
    const hourFactor = getHourFocusFactor(hourIndex);
    const calculated = focusFactor * hourFactor;

    if (isLogged) {
      return Math.max(0.15, Math.min(0.95, calculated));
    } else {
      // Soft, translucent baseline estimation
      return Math.max(0.08, Math.min(0.4, calculated * 0.8));
    }
  };

  const formatHour = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:00 ${ampm}`;
  };

  const heatmapDays = getHeatmapDays();

  return (
    <div ref={containerRef} className="space-y-4 relative">
      <div 
        onScroll={() => setHoveredCell(null)}
        className="max-h-[220px] overflow-y-auto pr-1.5 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
      >
        {heatmapDays.map((day) => {
          const log = logs.find(l => {
            if (!l.date) return false;
            const logDateOnly = l.date.includes('T') ? l.date.split('T')[0] : l.date;
            return logDateOnly === day.dateStr;
          });
          const isLogged = !!log;

          return (
            <div key={day.dateStr} className="flex items-center gap-1.5 h-3">
              <span className="text-[9px] text-zinc-500 w-10 flex-shrink-0 font-semibold text-left">{day.label}</span>
              <div className="flex gap-0.5 sm:gap-1 flex-1">
                {Array.from({ length: 24 }).map((_, hIdx) => {
                  const opacity = getGridOpacity(day.dateStr, hIdx, isLogged);
                  const baseColor = isLogged ? '#8B5CF6' : '#6366F1';
                  
                  return (
                    <div 
                      key={hIdx}
                      className="flex-1 h-3 rounded-sm transition-all duration-300 hover:scale-110 hover:border hover:border-purple-400/80 relative cursor-pointer"
                      style={{ 
                        backgroundColor: baseColor,
                        opacity: opacity 
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        if (!containerRef.current) return;
                        const containerRect = containerRef.current.getBoundingClientRect();
                        
                        setHoveredCell({
                          day: day.label,
                          hour: formatHour(hIdx),
                          isLogged: isLogged,
                          activeFocus: isLogged ? Math.round(opacity * 100) : null,
                          expectedFocus: Math.round(getHourFocusFactor(hIdx) * 100),
                          studyHours: log ? log.studyHours : null,
                          sleepHours: log ? log.sleepHours : null,
                          stressLevel: log ? log.stressLevel : null,
                          tasksCompleted: log ? log.tasksCompleted : null,
                          tasksTotal: log ? log.tasksTotal : null,
                          x: rect.left - containerRect.left + rect.width / 2,
                          y: rect.top - containerRect.top - 8
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Dynamic Hover Tooltip Box */}
      {hoveredCell && (
        <div 
          className={`absolute z-50 pointer-events-none text-[10px] font-bold p-3 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-150 animate-in fade-in zoom-in-95 flex flex-col gap-1.5 ${
            theme === 'light' 
              ? 'bg-white/95 border border-slate-200/80 text-slate-750 shadow-slate-200/50' 
              : 'bg-zinc-950/95 border border-[#2A3142] text-zinc-200'
          }`}
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y}px`,
            transform: 'translate(-50%, -100%)',
            whiteSpace: 'nowrap',
            minWidth: '170px'
          }}
        >
          <div className={`flex items-center justify-between gap-3 border-b pb-1.5 ${
            theme === 'light' ? 'border-slate-200/60' : 'border-[#2A3142]/60'
          }`}>
            <span className={`text-[10px] font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{hoveredCell.day} at {hoveredCell.hour}</span>
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full select-none ${
              hoveredCell.isLogged 
                ? 'text-purple-400 bg-purple-500/10 border border-purple-500/20' 
                : 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
            }`}>
              {hoveredCell.isLogged ? 'Active' : 'Baseline'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center gap-4">
              <span className="text-zinc-400 font-bold text-[9px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                Active Focus:
              </span>
              <span className={`font-extrabold text-[10px] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {hoveredCell.isLogged ? `${hoveredCell.activeFocus}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-zinc-400 font-bold text-[9px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] opacity-60" />
                Expected Focus:
              </span>
              <span className={`font-extrabold text-[10px] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{hoveredCell.expectedFocus}%</span>
            </div>
          </div>

          {/* Premium Telemetry Hover Stats (only shown when actual log exists) */}
          {hoveredCell.isLogged && (
            <div className={`border-t my-1.5 pt-1.5 space-y-1 ${
              theme === 'light' ? 'border-slate-200/60' : 'border-[#2A3142]/60'
            }`}>
              <div className="flex justify-between items-center gap-4">
                <span className="text-zinc-400 font-bold text-[9px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Study Sprints:
                </span>
                <span className={`font-extrabold text-[10px] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {hoveredCell.studyHours !== null ? `${hoveredCell.studyHours} hrs` : '0 hrs'}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-zinc-400 font-bold text-[9px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Sleep Duration:
                </span>
                <span className={`font-extrabold text-[10px] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {hoveredCell.sleepHours !== null ? `${hoveredCell.sleepHours} hrs` : '0 hrs'}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-zinc-400 font-bold text-[9px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Stress Strain:
                </span>
                <span className={`font-extrabold text-[10px] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {hoveredCell.stressLevel !== null ? `${hoveredCell.stressLevel}/10` : '0/10'}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-zinc-400 font-bold text-[9px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  Tasks Complete:
                </span>
                <span className={`font-extrabold text-[10px] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {hoveredCell.tasksCompleted !== null && hoveredCell.tasksTotal !== null
                    ? `${hoveredCell.tasksCompleted}/${hoveredCell.tasksTotal}`
                    : '0/0'}
                </span>
              </div>
            </div>
          )}
          
          <div className={`absolute left-1/2 -bottom-[4px] -translate-x-1/2 w-2 h-2 rotate-45 ${
            theme === 'light' ? 'bg-white border-r border-b border-slate-200/80' : 'bg-zinc-950 border-r border-b border-[#2A3142]'
          }`} />
        </div>
      )}
      
      {/* Time Axis Labels */}
      <div className="flex justify-between pl-11 text-[9px] text-zinc-500 font-bold uppercase tracking-wider pb-1">
        {hourLabels.map((lbl) => (
          <span key={lbl}>{lbl}</span>
        ))}
      </div>

      {/* Premium Subtitle Legend */}
      <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-zinc-500 pt-2 border-t border-[#2A3142]/40">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-[#8B5CF6] opacity-80" />
          <span>Active Logs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-[#6366F1] opacity-40" />
          <span>Twin Baseline (Estimation)</span>
        </div>
      </div>
    </div>
  );
};


// Helper: Smart Parser to Split AI daily summary into Observation & Recommendation
const parseSummary = (text) => {
  if (!text) return { observation: 'Syncing telemetry...', recommendation: 'Awaiting digital twin generation...' };
  
  // Use a more robust regex that avoids splitting on decimal points within numbers
  // matches a sentence ending in . ! or ? only if the dot is followed by whitespace or end of string, OR if it's not followed by a digit.
  const sentences = text.match(/(?:[^.!?]|\.(?!\s|$))+[.!?]+(?=\s|$)/g) || [text];
  if (sentences.length <= 1) {
    return {
      observation: text,
      recommendation: "Your twin recommends preserving sleep hygiene and maintaining consistent study block increments."
    };
  }
  
  const cleanSentences = sentences.map(s => s.trim());
  const recommendationWords = ['recommend', 'suggest', 'should', 'try', 'consider', 'focus on', 'prioritize', 'reduce', 'maintain', 'keep', 'ensure', 'prevent', 'optimizing'];
  
  const obs = [];
  const recs = [];
  
  cleanSentences.forEach((s, idx) => {
    const isRec = recommendationWords.some(w => s.toLowerCase().includes(w));
    if (isRec || idx >= Math.ceil(cleanSentences.length / 2)) {
      recs.push(s);
    } else {
      obs.push(s);
    }
  });
  
  if (obs.length === 0) obs.push(cleanSentences[0]);
  if (recs.length === 0) recs.push("Maintain current study flow pacing and rest indices to protect cognitive bandwidth.");
  
  return {
    observation: obs.join(' '),
    recommendation: recs.join(' ')
  };
};

// Framer Motion Animation Variants for Staggered Load
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 95, damping: 17 } 
  }
};

const Dashboard = ({ twinData, loadingTwin, goalsCount }) => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [historicalLogs, setHistoricalLogs] = useState([]);
  const [timeframe, setTimeframe] = useState('7');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(true);

  const timeframeLabels = {
    '7': 'This Week',
    '14': 'Last 14 Days',
    '30': 'This Month'
  };
  
  // Format current date matching header
  const getFormattedDate = () => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Fetch pending goals & history for deep charts
  useEffect(() => {
    const fetchDashboardDetails = async () => {
      try {
        const [goalsRes, logsRes] = await Promise.all([
          api.get('/goals?status=pending'),
          api.get('/logs')
        ]);
        setGoals(goalsRes.data.slice(0, 3));
        setHistoricalLogs(logsRes.data);
      } catch (error) {
        console.error('Failed to sync dashboard analytics:', error);
      }
      setLoadingGoals(false);
    };
    fetchDashboardDetails();
  }, [goalsCount]);

  if (loadingTwin) {
    return (
      <div className="pr-8 py-8 h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Constructing Digital Twin...</p>
        </div>
      </div>
    );
  }

  // Parse Daily AI summary details
  const parsedSummary = parseSummary(twinData.dailySummary);

  // Dynamic context message for Hero section
  const getHeroBehavioralContext = (status) => {
    switch (status) {
      case 'Focused':
        return "Flow state active. Evening study sprints are demonstrating high neural retention.";
      case 'Energetic':
      case 'Peak Mode':
        return "Brain battery levels are peak (90%+). Excellent window to tackle complex goals.";
      case 'Strained':
        return "Cognitive load compounding. Pacing adjustments recommended to sustain endurance.";
      case 'Fatigued':
        return "Fatigue levels elevated due to sleep volatility. Recovery blocks prioritized.";
      case 'Burned Out':
      case 'Burnout':
        return "Critical burnout strain warning. Study session load should be halved today.";
      default:
        return "Digital twin active. Synchronized 7 focus concentration signals today.";
    }
  };
  const heroBehavioralMsg = getHeroBehavioralContext(twinData.twinStatus);

  // Get date strings for the selected timeframe
  const getDatesForTimeframe = () => {
    const dates = [];
    const current = new Date();
    
    if (timeframe === '7') {
      // Current calendar week: Monday to Sunday
      const day = current.getDay();
      const diff = current.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(current.getTime());
      monday.setDate(diff);
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday.getTime());
        d.setDate(monday.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const date = String(d.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${date}`);
      }
    } else if (timeframe === '14') {
      // Last 14 calendar days ending today
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(current.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const date = String(d.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${date}`);
      }
    } else if (timeframe === '30') {
      // Current calendar month (from 1st to last day of current month)
      const year = current.getFullYear();
      const month = current.getMonth();
      const numDays = new Date(year, month + 1, 0).getDate();
      
      for (let i = 1; i <= numDays; i++) {
        const mStr = String(month + 1).padStart(2, '0');
        const dStr = String(i).padStart(2, '0');
        dates.push(`${year}-${mStr}-${dStr}`);
      }
    }
    return dates;
  };

  const timeframeDates = getDatesForTimeframe();
  
  const barChartData = timeframeDates.map(dateStr => {
    const log = historicalLogs.find(l => {
      if (!l.date) return false;
      const logDateOnly = l.date.includes('T') ? l.date.split('T')[0] : l.date;
      return logDateOnly === dateStr;
    });
    const d = new Date(dateStr + 'T00:00:00');
    
    let label = '';
    if (timeframe === '7') {
      label = d.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue"...
    } else {
      label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "May 21"
    }
    
    return {
      name: label,
      hours: log ? log.studyHours : 0,
      focus: log ? log.focusLevel : 0,
      dateStr
    };
  });

  const hasNoLogs = historicalLogs.length === 0;
  const chartData = barChartData;

  // Dynamic status evaluation helpers for dashboard cards
  const getProductivityDetails = (score) => {
    if (score >= 80) return { label: "Excellent", trend: "+12% from last week", color: "text-emerald-400" };
    if (score >= 60) return { label: "Focused", trend: "+5% from last week", color: "text-emerald-400" };
    if (score >= 40) return { label: "Balanced", trend: "Stable consistency", color: "text-indigo-400" };
    return { label: "Friction", trend: "-18% drop detected", color: "text-rose-400" };
  };
  const prodDetails = getProductivityDetails(twinData.productivityScore);

  const getBurnoutDetails = (score, level) => {
    let color = "text-emerald-400";
    let trend = "8% decline this cycle";
    if (level === 'Moderate' || level === 'Medium') {
      color = "text-amber-400";
      trend = "Elevated cognitive strain";
    } else if (level === 'High' || level === 'Critical') {
      color = "text-rose-400";
      trend = "High burnout risk alert";
    }
    return { color, trend };
  };
  const burnoutDetails = getBurnoutDetails(twinData.burnout.score, twinData.burnout.level);

  const getConsistencyDetails = (score) => {
    if (score >= 75) return { label: "High Rhythm", trend: "+15% logging habits", color: "text-emerald-400" };
    if (score >= 45) return { label: "Stable Rhythm", trend: "Steady journal log", color: "text-indigo-400" };
    return { label: "Volatile", trend: "Irregular log pattern", color: "text-rose-400" };
  };
  const consistencyDetails = getConsistencyDetails(twinData.consistencyIndex);

  return (
    <div className="pr-8 pt-8 pb-20 min-h-screen bg-background overflow-x-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto space-y-6"
      >
        
        {/* Dynamic Welcome SaaS Header */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-4"
        >
          <div>
            <h1 className={`text-3xl font-black tracking-tight flex items-center gap-2 ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              Good Evening, {user?.username || 'Sumit'}! 👋
            </h1>
            <p className={`text-xs font-semibold uppercase tracking-wider mt-1 flex items-center gap-1.5 ${
              theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3B82F6]" />
              {heroBehavioralMsg}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 border rounded-xl backdrop-blur-md text-xs font-semibold shadow-md ${
              theme === 'light' 
                ? 'bg-white/80 border-slate-200/60 text-slate-700' 
                : 'bg-[#1A1D26] border-[#2A3142]/60 text-zinc-300'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span>Streak: <span className={`font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{twinData.activeStreak} Days</span> 🔥</span>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-[9px] font-extrabold uppercase tracking-widest shadow-md ${
              theme === 'light'
                ? 'bg-white/80 border-slate-200/60 text-slate-500'
                : 'bg-[#1A1D26] border-[#2A3142]/60 text-zinc-400'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span>AI Active: Telemetry synced</span>
            </div>

            <div className={`flex items-center gap-2 px-3.5 py-1.5 border rounded-xl backdrop-blur-md text-xs font-semibold shadow-md select-none ${
              theme === 'light'
                ? 'bg-white/80 border-slate-200/60 text-slate-600'
                : 'bg-[#1A1D26] border-[#2A3142]/60 text-zinc-400'
            }`}>
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{getFormattedDate()}</span>
            </div>
          </div>
        </motion.div>

        {/* PREMIUM DAILY AI BEHAVIORAL SUMMARY SHEET */}
        {twinData.dailySummary && (
          <motion.div 
            variants={itemVariants} 
            className={`glass-panel-elevated border-l-4 border-l-purple-500 rounded-2xl p-5 relative overflow-hidden border border-border/80 transition-all duration-500 ${
              theme === 'light' 
                ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(243,246,251,0.95))] text-[#0F172A] shadow-md shadow-indigo-500/5' 
                : 'bg-gradient-to-r from-[#1A1D26] via-[#212535] to-[#1A1D26] text-zinc-100'
            }`}
          >
            <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 animate-pulse mt-0.5 flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-3.5 w-full">
                <div className="flex items-center gap-2">
                  <h3 className={`text-xs font-extrabold uppercase tracking-widest ${
                    theme === 'light' ? 'text-[#0F172A]' : 'text-purple-400'
                  }`}>
                    AI Behavioral Telemetry Analysis
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[8px] font-extrabold uppercase tracking-widest select-none border border-purple-500/20">
                    Twin Out
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className={`space-y-1 p-3.5 border rounded-xl ${
                    theme === 'light' ? 'bg-[#EEF2FF]/60 border-slate-200/40' : 'bg-[#0F1117]/60 border-border/40'
                  }`}>
                    <span className={`text-[9px] font-bold uppercase tracking-widest block ${
                      theme === 'light' ? 'text-[#475569]' : 'text-zinc-500'
                    }`}>AI Observation</span>
                    <p className={`text-xs leading-relaxed font-semibold ${theme === 'light' ? 'text-[#0F172A]' : 'text-zinc-200'}`}>
                      {parsedSummary.observation}
                    </p>
                  </div>
                  <div className={`space-y-1 p-3.5 border rounded-xl border-l-2 border-l-blue-500/65 ${
                    theme === 'light' ? 'bg-[#EEF2FF]/60 border-slate-200/40' : 'bg-[#0F1117]/60 border-border/40'
                  }`}>
                    <span className={`text-[9px] font-bold uppercase tracking-widest block ${
                      theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                    }`}>AI Recommendation</span>
                    <p className={`text-xs leading-relaxed font-semibold ${theme === 'light' ? 'text-[#0F172A]' : 'text-zinc-200'}`}>
                      {parsedSummary.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4 CIRCULAR PROGRESS TELEMETRY GAUGES (UPGRADED HIERARCHY) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Gauge 1: Productivity Score */}
          <motion.div 
            variants={itemVariants}
            className={`glass-panel-elevated panel-tint-lavender p-5 flex flex-col justify-between h-[132px] relative overflow-hidden group transition-all duration-300 ${
              theme === 'light' ? '' : 'hover:border-[#3B82F6]/30'
            }`}
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Productivity Score</span>
                <div className="text-3xl font-black tracking-tight leading-none mt-1">
                  {twinData.productivityScore}%
                </div>
              </div>
              <ProductivityRing score={twinData.productivityScore} />
            </div>
            
            <div className="flex items-center justify-between border-t border-[#2A3142]/40 pt-2.5">
              <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">{prodDetails.label}</span>
              <span className="text-[9px] text-zinc-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                {prodDetails.trend}
              </span>
            </div>
          </motion.div>

          {/* Gauge 2: Burnout Risk */}
          <motion.div 
            variants={itemVariants}
            className={`glass-panel-elevated panel-tint-lavender p-5 flex flex-col justify-between h-[132px] relative overflow-hidden group transition-all duration-300 ${
              theme === 'light' ? '' : 'hover:border-[#EF4444]/30'
            }`}
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Burnout Risk</span>
                <div className="text-3xl font-black tracking-tight leading-none mt-1">
                  {twinData.burnout.score}%
                </div>
              </div>
              <BurnoutDial score={twinData.burnout.score} level={twinData.burnout.level} />
            </div>
            
            <div className="flex items-center justify-between border-t border-[#2A3142]/40 pt-2.5">
              <span className={`text-[9px] font-extrabold uppercase tracking-widest ${burnoutDetails.color}`}>
                {twinData.burnout.level} Risk
              </span>
              <span className="text-[9px] text-zinc-400 font-bold flex items-center gap-1">
                {burnoutDetails.trend}
              </span>
            </div>
          </motion.div>

          {/* Gauge 3: Focus Consistency */}
          <motion.div 
            variants={itemVariants}
            className={`glass-panel-elevated panel-tint-lavender p-5 flex flex-col justify-between h-[132px] relative overflow-hidden group transition-all duration-300 ${
              theme === 'light' ? '' : 'hover:border-[#8B5CF6]/30'
            }`}
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Focus Consistency</span>
                <div className="text-3xl font-black tracking-tight leading-none mt-1">
                  {twinData.consistencyIndex}%
                </div>
              </div>
              <ConsistencyRing score={twinData.consistencyIndex} />
            </div>
            
            <div className="flex items-center justify-between border-t border-[#2A3142]/40 pt-2.5">
              <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-widest">{consistencyDetails.label}</span>
              <span className="text-[9px] text-zinc-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-purple-400 flex-shrink-0" />
                {consistencyDetails.trend}
              </span>
            </div>
          </motion.div>

          {/* Gauge 4: Weekly Growth */}
          <motion.div 
            variants={itemVariants}
            className={`glass-panel-elevated panel-tint-lavender p-5 flex flex-col justify-between h-[132px] relative overflow-hidden group transition-all duration-300 ${
              theme === 'light' ? '' : 'hover:border-[#EC4899]/30'
            }`}
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-colors" />
            
            <div className="flex justify-between items-start w-full">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Weekly Growth</span>
                <div className="text-3xl font-black tracking-tight leading-none mt-1">+18%</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-extrabold uppercase select-none tracking-widest">
                Growth Peak
              </span>
            </div>
            <GrowthSparkline />
          </motion.div>

        </div>

        {/* MIDDLE SECTION: Study Hours Bar & AI Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Study Hours Recharts Glowing Graph (occupies 2/3) */}
          <motion.div 
            variants={itemVariants} 
            className={`lg:col-span-2 glass-panel-elevated panel-tint-neutral p-6 flex flex-col justify-between space-y-4 transition-all duration-300 ${
              theme === 'light' ? '' : 'hover:border-[#2A3142]'
            }`}
          >
            <div className="flex justify-between items-center border-b border-border pb-3.5">
              <div className="space-y-1">
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Logged Study Analytics</span>
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-zinc-500 font-medium">Daily study sprint allocation & learning duration.</p>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-extrabold select-none uppercase tracking-wider">
                    +12% vs last cycle
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border/80 hover:border-primary/50 rounded-xl text-xs font-bold text-zinc-300 transition-all active:scale-95 shadow-md select-none"
                >
                  <span>{timeframeLabels[timeframe]}</span>
                  <span className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-36 bg-card border border-border/80 rounded-xl shadow-xl z-20 overflow-hidden backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-150">
                      {Object.entries(timeframeLabels).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setTimeframe(key);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-primary/10 hover:text-indigo-650 dark:hover:text-white flex items-center justify-between ${timeframe === key ? 'text-primary bg-primary/5' : 'text-zinc-400'}`}
                        >
                          <span>{label}</span>
                          {timeframe === key && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Glowing neon Recharts Bar Chart */}
            <div className="w-full h-72 relative flex items-center justify-center">
              {theme === 'light' && (
                <div className="absolute inset-x-4 inset-y-8 bg-gradient-to-t from-indigo-500/[0.02] to-transparent pointer-events-none rounded-xl" />
              )}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={theme === 'light' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(255, 255, 255, 0.03)'} 
                    vertical={false} 
                  />
                  <XAxis 
                    dataKey="name" 
                    stroke={theme === 'light' ? '#64748B' : '#6B7280'} 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                    interval={timeframe === '30' ? 4 : (timeframe === '14' ? 1 : 0)}
                  />
                  <YAxis 
                    stroke={theme === 'light' ? '#64748B' : '#6B7280'} 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dx={-5}
                  />
                  <Tooltip 
                    cursor={{ fill: theme === 'light' ? 'rgba(59, 130, 246, 0.04)' : 'rgba(139, 92, 246, 0.04)', radius: 8 }}
                    contentStyle={{ 
                      backgroundColor: theme === 'light' ? '#FFFFFF' : '#1A1D26', 
                      borderColor: theme === 'light' ? '#E2E8F0' : '#2A3142', 
                      borderRadius: '16px',
                      color: theme === 'light' ? '#0F172A' : '#F3F4F6',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: theme === 'light' ? '0 10px 25px rgba(15, 23, 42, 0.05)' : '0 10px 25px rgba(0, 0, 0, 0.35)'
                    }}
                  />
                  {/* Premium bar styles using linear gradients */}
                  <defs>
                    <linearGradient id="neonBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme === 'light' ? '#818CF8' : '#8B5CF6'} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={theme === 'light' ? '#C084FC' : '#3B82F6'} stopOpacity={0.3} />
                    </linearGradient>
                    <filter id="barShadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={theme === 'light' ? '#818CF8' : '#8B5CF6'} floodOpacity={0.15} />
                    </filter>
                  </defs>
                  <Bar 
                    dataKey="hours" 
                    fill="url(#neonBarGrad)" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={36}
                    name="Study Hours"
                    isAnimationActive={!hasNoLogs}
                    style={{ filter: 'url(#barShadow)' }}
                    animationDuration={1100}
                  />
                </BarChart>
              </ResponsiveContainer>

              {hasNoLogs && (
                <div className={`absolute inset-0 backdrop-blur-[1.5px] flex flex-col items-center justify-center rounded-2xl select-none p-6 text-center ${
                  theme === 'light' ? 'bg-white/90' : 'bg-[#0F1117]/80'
                }`}>
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3.5 animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className={`text-sm font-extrabold tracking-wide ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>No Telemetry Synced Yet</h3>
                  <p className={`text-[11px] max-w-[280px] font-semibold mt-1.5 leading-relaxed ${
                    theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                  }`}>
                    Start tracking your study sprints in the Daily Tracker to populate your Digital Twin with active behavioral analytics.
                  </p>
                  <Link 
                    to="/tracker" 
                    className="mt-4 px-4 py-1.5 bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/35 hover:border-[#8B5CF6]/50 rounded-xl text-[10px] font-extrabold text-purple-300 uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-[0_0_12px_rgba(139,92,246,0.15)] active:scale-95"
                  >
                    Go to Tracker
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Column 2: Sleek SaaS AI Insights List (occupies 1/3) */}
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-1 glass-panel-elevated panel-tint-bluish p-6 flex flex-col justify-between transition-all duration-300"
          >
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center border-b border-border pb-3.5">
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Real-Time AI Insights</span>
                </h2>
                <Link to="/insights" className="text-[10px] text-blue-400 hover:text-blue-300 font-extrabold uppercase tracking-widest select-none">
                  View All
                </Link>
              </div>

              {/* Individual mapped insight rows */}
              <div className="space-y-3">
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
                      className={`p-3 border rounded-2xl flex items-start gap-3 transition-colors group ${
                        theme === 'light' ? 'bg-white/60 border-slate-200/50 shadow-sm shadow-indigo-100/5' : 'bg-[#0F1117]/60 border-border'
                      } ${borderHoverColor}`}
                    >
                      <div className={`p-2 ${iconBg} rounded-xl group-hover:scale-105 transition-transform mt-0.5 ${isPulse}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-[9px] ${textTitleColor} font-extrabold uppercase tracking-wider`}>{insight.title}</p>
                        <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                          {insight.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

        </div>

        {/* BOTTOM SECTION: Focus Heatmap, Goal checklist, Twin Mascot & Personality */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Block 1: Focus Heatmap (GitHub contributions style) */}
          <motion.div 
            variants={itemVariants} 
            className="glass-panel-elevated panel-tint-neutral p-6 flex flex-col justify-between space-y-4 transition-all duration-300"
          >
            <div className="space-y-1 border-b border-border pb-3.5">
              <div className="flex justify-between items-start">
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>Focus Heatmap</span>
                </h2>
                <div className="flex flex-col items-end gap-1 select-none">
                  <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                    +18% above weekly baseline
                  </span>
                  <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-widest mt-0.5">
                    Peak: 8 PM - 10 PM
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 font-medium">Visualizing hourly focus concentration index.</p>
              
              {/* Behavior Insight Banner */}
              <div className="mt-3.5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-2.5 relative overflow-hidden group select-none behavior-insight-banner">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-[9px] font-extrabold text-purple-300 uppercase tracking-widest leading-none mb-1.5 behavior-insight-title">
                    Behavior Insight
                  </p>
                  <p className="text-xs text-zinc-200 font-semibold leading-relaxed behavior-insight-text">
                    Focus intensity rises significantly during evening learning cycles.
                  </p>
                </div>
              </div>
            </div>
            
            <FocusHeatmap logs={historicalLogs} timeframe={timeframe} />
          </motion.div>

          {/* Block 2: Goal Checklist Widget with Predicted Success Probabilities */}
          <motion.div 
            variants={itemVariants} 
            className="glass-panel-elevated panel-tint-neutral p-6 flex flex-col justify-between space-y-4 transition-all duration-300"
          >
            <div className="flex justify-between items-center border-b border-border pb-3.5">
              <div className="space-y-0.5">
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Target className="w-4.5 h-4.5 text-blue-400" />
                  <span>Goal Progress</span>
                </h2>
                <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-widest">
                  Active Goals: {goals.length}
                </span>
              </div>
              <Link 
                to="/goals" 
                className="text-[9px] text-zinc-400 hover:text-zinc-200 border border-border px-2 py-1 rounded-lg bg-background font-bold select-none uppercase tracking-widest hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                + Add Goal
              </Link>
            </div>

            {loadingGoals ? (
              <div className="h-full flex items-center justify-center">
                <span className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              </div>
            ) : goals.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-zinc-500 py-6 space-y-3">
                <p>No active objectives established.</p>
                <Link to="/goals" className="px-3.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/30 rounded-xl text-primary font-bold">
                  Create First Goal
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                  
                  // Predicted Probability color
                  let probColor = "text-emerald-400";
                  if (goal.successProbability < 40) probColor = "text-rose-400";
                  else if (goal.successProbability < 75) probColor = "text-amber-400";

                  return (
                    <div key={goal._id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-500/10 rounded-lg text-primary">
                            {goal.category === 'Career' ? <Code className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-200 line-clamp-1">{goal.title}</span>
                            <span className="text-[9px] text-zinc-500 font-semibold block">{goal.currentValue}/{goal.targetValue} {goal.unit} ({percent}%)</span>
                          </div>
                        </div>
                        
                        {/* predicted probability badge */}
                        <div className="text-right">
                          <span className={`text-[10px] font-extrabold ${probColor} bg-background border border-border px-1.5 py-0.5 rounded`}>
                            {goal.successProbability}% success
                          </span>
                        </div>
                      </div>

                      {/* Smooth progress bar */}
                      <div className="w-full h-2 bg-background border border-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Block 3: Digital Twin Mascot Interaction Card */}
          <motion.div 
            variants={itemVariants} 
            className={`glass-panel-elevated panel-tint-neutral p-6 flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-300 ${
              theme === 'light' ? '' : 'bg-gradient-to-b from-[#1A1D26] to-[#12151E]'
            }`}
          >
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-center border-b border-border pb-3.5">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <span>Your Digital Twin</span>
              </h2>
              <button className="text-[9px] text-zinc-400 hover:text-zinc-200 border border-border px-2 py-1 rounded-lg bg-background font-bold select-none uppercase tracking-widest hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                Customize
              </button>
            </div>

            {/* Pulsating interactive mascot orb */}
            <div className="flex-1 flex items-center justify-center py-1 select-none">
              <TwinAvatar status={twinData.twinStatus} username={user?.username} />
            </div>

            {/* Interacting gradient CTAs */}
            <div className="flex gap-2.5 pt-1">
              <Link 
                to="/talk"
                className="flex-1 py-2 rounded-xl text-xs font-bold text-center text-white bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md hover:from-blue-600 hover:to-indigo-600 transition-colors shadow-blue-500/10 flex items-center justify-center"
              >
                Talk to Twin
              </Link>
              <Link 
                to="/tracker" 
                className={`flex-1 py-2 rounded-xl text-xs font-bold text-center transition-all duration-300 border ${
                  theme === 'light' 
                    ? 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200/80 hover:border-indigo-500/30 shadow-sm' 
                    : 'text-zinc-300 bg-[#222938] hover:bg-[#2c354a] border-[#2A3142]'
                }`}
              >
                Log Session
              </Link>
            </div>
          </motion.div>

        </div>

        {/* ROW 3: Newly Added Twin Personality System (Polished and Dynamic) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Twin Personality System block (occupies 1/3 of the row) */}
          <motion.div 
            variants={itemVariants} 
            className={`glass-panel-elevated panel-tint-neutral p-6 flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-300 ${
              theme === 'light' ? '' : 'bg-gradient-to-b from-[#1A1D26] to-[#12151D]'
            }`}
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
            
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Twin Personality System</span>
              </h2>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-extrabold tracking-widest uppercase">
                Cognitive Profile
              </span>
            </div>

            <div className="space-y-3.5 my-2">
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Personality Type</span>
                <h4 className="text-sm font-black text-white leading-tight mt-0.5">
                  {twinData.productivityScore >= 75 ? "Night-Focused Analytical Learner" : twinData.consistencyIndex >= 60 ? "Adaptive Consistency Type" : "High-Intensity Focus Pattern"}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className={`p-2.5 border rounded-xl ${
                  theme === 'light' ? 'bg-[#EEF2FF]/60 border-slate-200/50' : 'bg-[#0F1117]/60 border-border/40'
                }`}>
                  <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest block">Core Strength</span>
                  <span className="text-[10px] text-zinc-300 font-semibold block mt-0.5 leading-tight">
                    {twinData.productivityScore >= 75 ? "High late focus peaks" : "Steady circadian habit index"}
                  </span>
                </div>
                <div className={`p-2.5 border rounded-xl ${
                  theme === 'light' ? 'bg-[#EEF2FF]/60 border-slate-200/50' : 'bg-[#0F1117]/60 border-border/40'
                }`}>
                  <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest block">Vulnerability</span>
                  <span className="text-[10px] text-zinc-300 font-semibold block mt-0.5 leading-tight">
                    {twinData.productivityScore >= 75 ? "Morning cognitive lag" : "Volatile sprint endurance"}
                  </span>
                </div>
              </div>

              <div className={`flex items-center gap-2 text-[10px] p-2.5 rounded-xl select-none border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200/50 text-slate-600' : 'bg-[#0A0D14]/80 border-border/30 text-zinc-400'
              }`}>
                <TrendingUp className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Behavior Evolution: <strong className="text-white font-bold">Evolving into Stable Architect</strong></span>
              </div>
            </div>
          </motion.div>

          {/* Spacer cards or extended descriptive widgets to keep bottom layout symmetrical */}
          <motion.div 
            variants={itemVariants}
            className={`glass-panel-elevated panel-tint-neutral p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
              theme === 'light' ? '' : 'bg-gradient-to-b from-[#1A1D26] to-[#12151D]'
            }`}
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Target className="w-4.5 h-4.5 text-blue-400" />
                <span>Goal success prediction</span>
              </h2>
            </div>
            
            <div className="space-y-3.5 my-2">
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                Your twin runs predictive simulations against your active goals using Random Forest regressions.
              </p>
              <div className={`p-3 border rounded-xl flex items-center justify-between ${
                theme === 'light' ? 'bg-[#EEF2FF]/60 border-slate-200/50' : 'bg-[#0F1117]/60 border-border/40'
              }`}>
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">Estimated Accuracy</span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  88.4% R²
                </span>
              </div>
            </div>
            
            <Link to="/goals" className="text-[10px] text-blue-400 hover:text-blue-300 font-extrabold uppercase tracking-widest flex items-center gap-1 select-none pt-1">
              <span>View Predictions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className={`glass-panel-elevated panel-tint-neutral p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
              theme === 'light' ? '' : 'bg-gradient-to-b from-[#1A1D26] to-[#12151D]'
            }`}
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-colors" />
            
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-pink-400" />
                <span>Behavior logs audit</span>
              </h2>
            </div>
            
            <div className="space-y-3 my-2">
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                Keep logging your study, focus, stress, and sleep levels to improve machine learning accuracy.
              </p>
              
              <div className="flex items-center gap-3">
                <div className={`flex-1 p-2 border rounded-xl text-center ${
                  theme === 'light' ? 'bg-[#EEF2FF]/60 border-slate-200/50' : 'bg-[#0F1117]/60 border-border/40'
                }`}>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">Logs Saved</span>
                  <span className="text-sm font-black text-white">{historicalLogs.length}</span>
                </div>
                <div className={`flex-1 p-2 border rounded-xl text-center ${
                  theme === 'light' ? 'bg-[#EEF2FF]/60 border-slate-200/50' : 'bg-[#0F1117]/60 border-border/40'
                }`}>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">Audit Status</span>
                  <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest block mt-1">Verified</span>
                </div>
              </div>
            </div>
            
            <Link to="/tracker" className="text-[10px] text-pink-400 hover:text-pink-300 font-extrabold uppercase tracking-widest flex items-center gap-1 select-none pt-1">
              <span>Open Activity Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

        </div>

      </motion.div>

      {/* Floating "Talk to Twin" CTA with contextual prompt popover */}
      <div className="fixed bottom-6 right-6 z-[99] flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence>
          {showSuggestion && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: 3.5, type: "spring", stiffness: 100 } }}
              exit={{ opacity: 0, scale: 0.9, y: 10, transition: { delay: 0, duration: 0.2 } }}
              className={`p-3.5 pr-8 rounded-2xl shadow-2xl max-w-xs pointer-events-auto flex items-start gap-2.5 relative overflow-hidden border ${
                theme === 'light' ? 'bg-card border-border shadow-indigo-500/5' : 'bg-[#1A1D26] border-[#2A3142] shadow-black/75'
              }`}
            >
              <div className="absolute -left-6 -bottom-6 w-12 h-12 bg-blue-500/5 rounded-full blur-xl animate-pulse" />
              <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-primary animate-bounce mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-extrabold text-blue-400 uppercase tracking-wider">Twin Suggestion</p>
                <p className="text-[10px] text-zinc-300 font-semibold leading-relaxed">
                  {twinData.burnout.score > 50 
                    ? "Ask your twin how to reduce burnout risk."
                    : "Talk to Twin about optimizing your late study sprints."}
                </p>
              </div>
              
              <button
                onClick={() => setShowSuggestion(false)}
                className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-zinc-200 transition-colors p-0.5 rounded-full hover:bg-white/10 dark:hover:bg-zinc-800"
                aria-label="Dismiss suggestion"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, type: "spring", stiffness: 110 }}
          className="pointer-events-auto shadow-[0_8px_30px_rgba(59,130,246,0.22)] rounded-full hover:shadow-[0_8px_35px_rgba(59,130,246,0.35)] transition-shadow duration-300"
        >
          <Link 
            to="/talk"
            className="flex items-center gap-2.5 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full text-xs font-black shadow-md active:scale-95 transition-all select-none border border-blue-400/20"
          >
            <Brain className="w-4 h-4 animate-pulse text-blue-100" />
            <span>Talk to Twin</span>
          </Link>
        </motion.div>
      </div>

    </div>
  );
};

export default Dashboard;
