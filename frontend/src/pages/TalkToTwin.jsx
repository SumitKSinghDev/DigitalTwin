import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../utils/api.js';
import { 
  Send, 
  Sparkles, 
  Brain, 
  Bot, 
  User, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Award,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Premium custom geometric reactor core glyph representing the Behavioral Core Reactor
const ReactorCoreGlyph = ({ color }) => (
  <svg 
    viewBox="0 0 64 64" 
    className="w-8 h-8 transition-all duration-500 transform hover:scale-110" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ color }}
  >
    {/* Delicate Micro-precision Grid Guides */}
    <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 5" className="opacity-20" />
    <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="0.25" className="opacity-15" />
    
    {/* Minimal Center Core Power Node */}
    <circle cx="32" cy="32" r="3.5" fill="currentColor" />
    <circle cx="32" cy="32" r="7.5" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" className="opacity-70 animate-pulse" />
    
    {/* Concentric rings/sectors */}
    <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />
    
    {/* Tri-spoke magnetic guiding spikes */}
    <line x1="32" y1="21" x2="32" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="opacity-75" />
    <circle cx="32" cy="13" r="0.8" fill="currentColor" />
    
    <line x1="22.5" y1="37.5" x2="15.6" y2="41.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="opacity-75" />
    <circle cx="15.6" cy="41.5" r="0.8" fill="currentColor" />
    
    <line x1="41.5" y1="37.5" x2="48.4" y2="41.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="opacity-75" />
    <circle cx="48.4" cy="41.5" r="0.8" fill="currentColor" />
    
    {/* Segmented outer magnetic containment ring */}
    <circle 
      cx="32" 
      cy="32" 
      r="26" 
      stroke="currentColor" 
      strokeWidth="1.2" 
      strokeDasharray="45 12 35 15 25 10" 
      className="opacity-95" 
    />
  </svg>
);

const TalkToTwin = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'twin',
      text: `Hello ${user?.username || 'Student'}! I am your Student Digital Twin. 🧠 I act as your personal AI behavioral mentor, analyzing your study logs, sleep patterns, stress levels, and active goals in real-time.

How can I help you optimize your learning rhythm today?`,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [twinStatus, setTwinStatus] = useState('Balanced');
  const [glowColor, setGlowColor] = useState('text-indigo-400');
  const [glowHex, setGlowHex] = useState('#6366F1');
  const [bgColor, setBgColor] = useState('bg-indigo-500/20');
  const [borderColor, setBorderColor] = useState('border-indigo-500/30');
  const [pulseDuration, setPulseDuration] = useState(3.6);
  const [pulseScale, setPulseScale] = useState([1, 1.05, 1]);

  const messagesEndRef = useRef(null);

  // Quick suggestion chips
  const suggestions = [
    { text: "📊 Why was my productivity low?", query: "Why was my productivity low this week?" },
    { text: "🔋 Am I overworking myself?", query: "Am I overworking myself?" },
    { text: "🎯 Will I complete my goals?", query: "What is my goal completion probability?" },
    { text: "🛑 What are my weak points?", query: "What are my weak points or bottlenecks?" },
    { text: "📝 Summarize my day", query: "Summarize my learning performance today." }
  ];

  // Map status states to orb theme styling
  const updateOrbStyle = (status) => {
    switch (status) {
      case 'Focused':
        setGlowColor('text-purple-500');
        setGlowHex('#8B5CF6');
        setBgColor('bg-purple-500/20');
        setBorderColor('border-purple-500/30');
        setPulseDuration(3.0);
        setPulseScale([1, 1.05, 1]);
        break;
      case 'Energetic':
      case 'Peak Mode':
        setGlowColor('text-blue-500');
        setGlowHex('#3B82F6');
        setBgColor('bg-blue-500/20');
        setBorderColor('border-blue-500/30');
        setPulseDuration(2.5);
        setPulseScale([1, 1.06, 1]);
        break;
      case 'Strained':
        setGlowColor('text-amber-500');
        setGlowHex('#F59E0B');
        setBgColor('bg-amber-500/15');
        setBorderColor('border-amber-500/25');
        setPulseDuration(4.2);
        setPulseScale([1, 1.04, 1]);
        break;
      case 'Balanced':
        setGlowColor('text-indigo-400');
        setGlowHex('#6366F1');
        setBgColor('bg-indigo-500/20');
        setBorderColor('border-indigo-500/30');
        setPulseDuration(3.6);
        setPulseScale([1, 1.05, 1]);
        break;
      case 'Fatigued':
        setGlowColor('text-rose-500');
        setGlowHex('#EF4444');
        setBgColor('bg-rose-500/15');
        setBorderColor('border-rose-500/25');
        setPulseDuration(5.0);
        setPulseScale([1, 1.03, 1]);
        break;
      case 'Burned Out':
      case 'Burnout':
        setGlowColor('text-amber-500 animate-pulse');
        setGlowHex('#F59E0B');
        setBgColor('bg-amber-500/25');
        setBorderColor('border-amber-500/40');
        setPulseDuration(2.0);
        setPulseScale([0.98, 1.04, 0.98]);
        break;
      default:
        setGlowColor('text-indigo-400');
        setGlowHex('#6366F1');
        setBgColor('bg-indigo-500/20');
        setBorderColor('border-indigo-500/30');
        setPulseDuration(3.6);
        setPulseScale([1, 1.05, 1]);
    }
  };

  useEffect(() => {
    const fetchTwinStatus = async () => {
      try {
        const res = await api.get('/twin');
        if (res.data && res.data.twinStatus) {
          setTwinStatus(res.data.twinStatus);
          updateOrbStyle(res.data.twinStatus);
        }
      } catch (err) {
        console.warn('Failed to sync twin state in chat page, utilizing stable heuristics.');
      }
    };
    fetchTwinStatus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText) return;

    // Append User message
    const userMsg = {
      sender: 'user',
      text: trimmedText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    try {
      const res = await api.post('/twin/chat', { message: trimmedText });
      
      // Simulate slight mentor reasoning lag for natural human-like feeling
      setTimeout(() => {
        setIsTyping(false);
        const twinMsg = {
          sender: 'twin',
          text: res.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, twinMsg]);
      }, 750);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      const errorMsg = {
        sender: 'twin',
        text: "My neural transmission matrix encountered a slight interruption. Let's try sending your behavioral query once more.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  return (
    <div className="px-4 md:px-0 md:pr-8 pt-4 md:pt-8 pb-28 md:pb-20 h-[calc(100vh-1rem)] md:h-auto flex flex-col justify-between overflow-hidden md:overflow-visible">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-4 md:space-y-6 h-full overflow-hidden">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="p-2.5 bg-card hover:bg-card-hover border border-border rounded-xl text-zinc-400 hover:text-zinc-200 dark:hover:text-white transition-all shadow-md cursor-pointer hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Talk to Twin</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-extrabold select-none uppercase tracking-widest animate-pulse">
                  AI Mentor Mode
                </span>
              </h1>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mt-0.5">
                Rethinking Productivity Habits Through Behavioral Twin Analytics
              </p>
            </div>
          </div>

          {/* Mini active status card */}
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-card border border-border rounded-xl shadow-md">
            <span className={`w-2.5 h-2.5 rounded-full ${glowColor.replace('text-', 'bg-')} animate-pulse`} />
            <span className="text-xs font-bold text-zinc-300">
              Sync: <span className={`${glowColor} font-extrabold uppercase`}>{twinStatus}</span>
            </span>
          </div>
        </div>

        {/* Dynamic Chat Pane Layout (Split Screen on Lg: Interactive Orb on left, Chat on right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 items-stretch min-h-[350px] lg:min-h-[500px] h-[calc(100vh-12rem)] md:h-auto overflow-hidden">
          
          {/* Column 1: Futuristic interactive AI Orb details block */}
          <div className="hidden lg:flex lg:col-span-1 glass-panel-elevated panel-tint-bluish p-6 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[250px] lg:min-h-0">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Visual Avatar Core Container */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-5 select-none">
              
              {/* Layered Volumetric Ambient Glows */}
              <motion.div 
                animate={{
                  opacity: theme === 'light' ? [0.12, 0.22, 0.12] : [0.25, 0.45, 0.25],
                  scale: [0.9, 1.1, 0.9]
                }}
                transition={{
                  duration: pulseDuration,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 rounded-full blur-[36px] pointer-events-none transition-all duration-700" 
                style={{ backgroundColor: `${glowHex}${theme === 'light' ? '11' : '22'}` }}
              />
              <motion.div 
                animate={{
                  opacity: theme === 'light' ? [0.2, 0.35, 0.2] : [0.45, 0.7, 0.45],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{
                  duration: pulseDuration,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute inset-3 rounded-full blur-[18px] pointer-events-none transition-all duration-700" 
                style={{ backgroundColor: `${glowHex}${theme === 'light' ? '22' : '40'}` }}
              />
              
              {/* Concentric Energy Rings (High-precision SaaS instrumentation SVG orbits) */}
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
                className="absolute w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="48" stroke={glowHex} strokeWidth="0.5" strokeDasharray="1 4" fill="none" className="opacity-30" />
                <circle cx="50" cy="50" r="45" stroke={glowHex} strokeWidth="0.75" strokeDasharray="2 16" fill="none" className="opacity-40" />
              </motion.svg>
              
              <motion.svg
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 48, ease: "linear" }}
                className="absolute w-[86%] h-[86%] pointer-events-none"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="47" stroke={glowHex} strokeWidth="0.5" strokeDasharray="12 6 2 6" fill="none" className="opacity-25" />
                <circle cx="50" cy="3" r="1.2" fill={glowHex} className="opacity-80 animate-pulse" />
              </motion.svg>

              <motion.svg
                animate={{ rotate: 240 }}
                transition={{ repeat: Infinity, duration: 64, ease: "linear" }}
                className="absolute w-[74%] h-[74%] pointer-events-none"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="46" stroke={glowHex} strokeWidth="0.5" strokeDasharray="3 8" fill="none" className="opacity-20" />
              </motion.svg>
              
              {/* Main Pulsing Orb Core */}
              <motion.div
                animate={{
                  scale: pulseScale,
                  boxShadow: theme === 'light'
                    ? [
                        `0 0 10px 1px ${glowHex}10`,
                        `0 0 16px 3px ${glowHex}25`,
                        `0 0 10px 1px ${glowHex}10`
                      ]
                    : [
                        `0 0 12px 2px ${glowHex}20`,
                        `0 0 24px 6px ${glowHex}45`,
                        `0 0 12px 2px ${glowHex}20`
                      ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: pulseDuration,
                  ease: 'easeInOut'
                }}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center relative cursor-pointer select-none transition-all duration-700 ${glowColor} bg-card border border-border/80 backdrop-blur-xl reactor-orb-core`}
              >
                {/* Reactor Core Glyph */}
                <ReactorCoreGlyph color={glowHex} />
                
                <span className="text-[7px] uppercase font-extrabold tracking-widest text-zinc-500 mt-2 reactor-orb-text">REACTOR ACTIVE</span>
              </motion.div>

              {/* Advanced Micro Floating Particles Cloud */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      x: [0, Math.sin(i + 1) * 45, Math.cos(i + 2) * -30, 0],
                      y: [0, Math.cos(i + 1) * -45, Math.sin(i + 2) * 30, 0],
                      scale: [0.6, 1.2, 0.8, 0.6],
                      opacity: [0.2, 0.7, 0.4, 0.2]
                    }}
                    transition={{
                      duration: 7 + i * 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      top: `${32 + (i * 12) % 36}%`,
                      left: `${32 + (i * 15) % 36}%`,
                      backgroundColor: glowHex,
                      boxShadow: `0 0 6px 1px ${glowHex}a0`,
                    }}
                  />
                ))}
              </div>
            </div>

            <h3 className="text-sm font-extrabold text-white capitalize">{user?.username || 'Student'}'s Twin</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
              Active State: <span className={`${glowColor} font-bold`}>{twinStatus}</span>
            </p>
            
            <div className="border-t border-border/80 w-full mt-4 pt-4 text-left">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Cognitive Signals</span>
              <ul className="space-y-1.5 text-[10px] font-semibold text-zinc-400">
                <li className="flex justify-between"><span>Focus Index:</span> <span className="text-zinc-200">Active</span></li>
                <li className="flex justify-between"><span>Stress Sync:</span> <span className="text-zinc-200">Telemetry Live</span></li>
                <li className="flex justify-between"><span>Mentor Matrix:</span> <span className="text-indigo-400 font-extrabold">Advanced</span></li>
              </ul>
            </div>
          </div>

          {/* Column 2: Modern futuristic chat widget */}
          <div className="lg:col-span-3 glass-panel-elevated panel-tint-neutral flex flex-col justify-between overflow-hidden relative border border-border/80 h-full">
            
            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[calc(100vh-23rem)] md:max-h-[460px] custom-scrollbar scroll-smooth">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => {
                  const isTwin = msg.sender === 'twin';
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3.5 max-w-[85%] ${isTwin ? 'self-start' : 'self-end flex-row-reverse ml-auto'}`}
                    >
                      {/* Avatar Icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${
                        isTwin 
                          ? `bg-indigo-600/10 border-indigo-500/20 text-indigo-400`
                          : 'bg-bg-secondary border-border text-white'
                      }`}>
                        {isTwin ? <Brain className="w-4 h-4" /> : <User className="w-4 h-4 text-zinc-400" />}
                      </div>

                      {/* Bubble content */}
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed border font-medium ${
                        isTwin 
                          ? 'bg-bg-secondary/40 border-border/80 text-zinc-200 rounded-tl-sm msg-bubble-twin'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-indigo-500/30 text-white keep-light-text rounded-tr-sm shadow-md shadow-indigo-600/5'
                      } whitespace-pre-line`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing Loader Indicator */}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3.5 max-w-[85%]"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border/80 rounded-tl-sm flex items-center gap-1.5 msg-bubble-twin">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips Container */}
            <div className="px-5 py-3 border-t border-border bg-bg-secondary/30 flex flex-wrap gap-2 items-center chat-directives-panel">
              <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest mr-1">Directives:</span>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug.query)}
                  className="px-3 py-1.5 rounded-xl border border-border/80 hover:border-indigo-500/40 bg-card hover:bg-card-hover text-[10px] text-zinc-400 hover:text-indigo-650 dark:hover:text-white transition-all cursor-pointer font-bold select-none whitespace-nowrap hover:scale-[1.02]"
                >
                  {sug.text}
                </button>
              ))}
            </div>

            {/* Message Input Panel */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(message);
              }}
              className="p-4 border-t border-border/80 bg-bg-secondary/80 flex gap-3.5 items-center chat-input-panel"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask your Digital Twin about productivity habits, burnout risk, or goal likelihoods..."
                className="flex-1 py-3 px-4 rounded-xl bg-[#F8FAFC] dark:bg-zinc-950/80 border border-border text-xs text-text-primary focus:outline-none focus:border-indigo-500/50 placeholder-zinc-400 dark:placeholder-zinc-600 transition-colors font-medium chat-input-field"
              />
              <button
                type="submit"
                disabled={!message.trim() || isTyping}
                className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md shadow-blue-500/10 flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TalkToTwin;
