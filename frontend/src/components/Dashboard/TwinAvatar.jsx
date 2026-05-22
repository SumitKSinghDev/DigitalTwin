import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext.jsx';

// Premium custom geometric reactor core glyph representing the Behavioral Core Reactor
const ReactorCoreGlyph = ({ color }) => (
  <svg 
    viewBox="0 0 64 64" 
    className="w-10 h-10 transition-all duration-500 transform hover:scale-110" 
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

const TwinAvatar = ({ status, username }) => {
  const { theme } = useTheme();
  // Get state styling details based on calculated status
  const getStyleConfigs = (twinStatus) => {
    switch (twinStatus) {
      case 'Focused':
        return {
          glowColor: 'text-purple-500',
          glowHex: '#8B5CF6',
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500/30',
          pulseScale: [1, 1.05, 1],
          pulseDuration: 3.0,
          particleColor: 'bg-purple-400',
          tagText: 'Flow State Active',
          tagClass: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
        };
      case 'Energetic':
      case 'Peak Mode':
        return {
          glowColor: 'text-blue-500',
          glowHex: '#3B82F6',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          pulseScale: [1, 1.06, 1],
          pulseDuration: 2.5,
          particleColor: 'bg-blue-400',
          tagText: 'Cognitive Peak Mode',
          tagClass: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        };
      case 'Strained':
        return {
          glowColor: 'text-amber-500',
          glowHex: '#F59E0B',
          bgColor: 'bg-amber-500/15',
          borderColor: 'border-amber-500/25',
          pulseScale: [1, 1.04, 1],
          pulseDuration: 4.2,
          particleColor: 'bg-amber-400',
          tagText: 'Compounding Load',
          tagClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        };
      case 'Balanced':
        return {
          glowColor: 'text-indigo-400',
          glowHex: '#6366F1',
          bgColor: 'bg-indigo-500/20',
          borderColor: 'border-indigo-500/30',
          pulseScale: [1, 1.05, 1],
          pulseDuration: 3.6,
          particleColor: 'bg-indigo-400',
          tagText: 'Telemetry Stable',
          tagClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
        };
      case 'Fatigued':
        return {
          glowColor: 'text-rose-500',
          glowHex: '#EF4444',
          bgColor: 'bg-rose-500/15',
          borderColor: 'border-rose-500/25',
          pulseScale: [1, 1.03, 1],
          pulseDuration: 5.0,
          particleColor: 'bg-rose-400',
          tagText: 'Power Depleted',
          tagClass: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        };
      case 'Burned Out':
      case 'Burnout':
        return {
          glowColor: 'text-amber-500 animate-pulse',
          glowHex: '#F59E0B',
          bgColor: 'bg-amber-500/25',
          borderColor: 'border-amber-500/40',
          pulseScale: [0.98, 1.04, 0.98],
          pulseDuration: 2.0,
          particleColor: 'bg-amber-400',
          tagText: 'BURNOUT MITIGATION',
          tagClass: 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-extrabold animate-pulse',
        };
      default:
        return {
          glowColor: 'text-indigo-400',
          glowHex: '#6366F1',
          bgColor: 'bg-indigo-500/20',
          borderColor: 'border-indigo-500/30',
          pulseScale: [1, 1.05, 1],
          pulseDuration: 3.6,
          particleColor: 'bg-indigo-400',
          tagText: 'Telemetry Stable',
          tagClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
        };
    }
  };

  const config = getStyleConfigs(status);

  return (
    <div className="flex flex-col items-center justify-center text-center h-full w-full py-2">
      
      {/* Visual Avatar Core Container */}
      <div className="relative w-44 h-44 flex items-center justify-center mb-4">
        
        {/* Layered Volumetric Ambient Glows */}
        <motion.div 
          animate={{
            opacity: theme === 'light' ? [0.12, 0.22, 0.12] : [0.25, 0.45, 0.25],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            duration: config.pulseDuration,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 rounded-full blur-[48px] pointer-events-none transition-all duration-700" 
          style={{ backgroundColor: `${config.glowHex}${theme === 'light' ? '11' : '22'}` }}
        />
        <motion.div 
          animate={{
            opacity: theme === 'light' ? [0.2, 0.35, 0.2] : [0.45, 0.7, 0.45],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{
            duration: config.pulseDuration,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute inset-4 rounded-full blur-[24px] pointer-events-none transition-all duration-700" 
          style={{ backgroundColor: `${config.glowHex}${theme === 'light' ? '22' : '40'}` }}
        />
        
        {/* Concentric Energy Rings (High-precision SaaS instrumentation SVG orbits) */}
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
          className="absolute w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
        >
          {/* Outer fine dotted ring */}
          <circle cx="50" cy="50" r="48" stroke={config.glowHex} strokeWidth="0.5" strokeDasharray="1 4" fill="none" className="opacity-30" />
          {/* Outer high-precision ticks */}
          <circle cx="50" cy="50" r="45" stroke={config.glowHex} strokeWidth="0.75" strokeDasharray="2 16" fill="none" className="opacity-40" />
        </motion.svg>
        
        <motion.svg
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 48, ease: "linear" }}
          className="absolute w-[86%] h-[86%] pointer-events-none"
          viewBox="0 0 100 100"
        >
          {/* Middle segmented ring */}
          <circle cx="50" cy="50" r="47" stroke={config.glowHex} strokeWidth="0.5" strokeDasharray="12 6 2 6" fill="none" className="opacity-25" />
          {/* Tiny orbit core tracker */}
          <circle cx="50" cy="3" r="1.2" fill={config.glowHex} className="opacity-80 animate-pulse" />
        </motion.svg>

        <motion.svg
          animate={{ rotate: 240 }}
          transition={{ repeat: Infinity, duration: 64, ease: "linear" }}
          className="absolute w-[74%] h-[74%] pointer-events-none"
          viewBox="0 0 100 100"
        >
          {/* Inner fine orbit ring */}
          <circle cx="50" cy="50" r="46" stroke={config.glowHex} strokeWidth="0.5" strokeDasharray="3 8" fill="none" className="opacity-20" />
        </motion.svg>
        
        {/* Main Pulsing Orb Core */}
        <motion.div
          animate={{
            scale: config.pulseScale,
            boxShadow: theme === 'light' 
              ? [
                  `0 0 10px 1px ${config.glowHex}10`,
                  `0 0 16px 3px ${config.glowHex}25`,
                  `0 0 10px 1px ${config.glowHex}10`
                ]
              : [
                  `0 0 12px 2px ${config.glowHex}20`,
                  `0 0 24px 6px ${config.glowHex}45`,
                  `0 0 12px 2px ${config.glowHex}20`
                ]
          }}
          transition={{
            repeat: Infinity,
            duration: config.pulseDuration,
            ease: 'easeInOut'
          }}
          className={`w-28 h-28 rounded-full flex flex-col items-center justify-center relative cursor-pointer select-none transition-all duration-700 ${config.glowColor} bg-card border border-border/80 backdrop-blur-xl`}
        >
          {/* Reactor Core Glyph */}
          <ReactorCoreGlyph color={config.glowHex} />
          
          <span className="text-[7px] uppercase font-extrabold tracking-widest text-zinc-500 mt-2">REACTOR ACTIVE</span>
        </motion.div>
        
        {/* Advanced Micro Floating Particles Cloud */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, Math.sin(i + 1) * 55, Math.cos(i + 2) * -35, 0],
                y: [0, Math.cos(i + 1) * -55, Math.sin(i + 2) * 35, 0],
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
                backgroundColor: config.glowHex,
                boxShadow: `0 0 6px 1px ${config.glowHex}a0`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Name and State description */}
      <h3 className="text-base font-extrabold text-white tracking-tight capitalize mb-1">
        {username || 'Student'}'s Twin
      </h3>

      {/* Dynamic Sync Status Ticker */}
      <div className="flex flex-col items-center gap-2 mt-0.5">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest border ${config.tagClass} transition-all duration-500`}>
          {config.tagText}
        </span>
        
        <div className="flex items-center gap-1.5 px-3 py-1 bg-bg-secondary border border-border/80 rounded-xl text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 shadow-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'Burned Out' || status === 'Burnout' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status === 'Burned Out' || status === 'Burnout' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          </span>
          <span>Twin Sync Status: Online</span>
        </div>
      </div>
      
    </div>
  );
};

export default TwinAvatar;
