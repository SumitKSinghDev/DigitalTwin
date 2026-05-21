import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, AlertTriangle, Battery } from 'lucide-react';

const TwinAvatar = ({ status, username }) => {
  // Get state styling details based on calculated status
  const getStyleConfigs = (twinStatus) => {
    switch (twinStatus) {
      case 'Focused':
        return {
          glowColor: 'text-indigo-500',
          bgColor: 'bg-indigo-500/20',
          borderColor: 'border-indigo-400/40',
          pulseScale: [1, 1.15, 1],
          pulseDuration: 2.5,
          icon: Brain,
          particleColor: 'bg-indigo-400',
          orbitSpeed: 'animate-spin-slow',
          tagText: 'Flow State Active',
          tagClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
        };
      case 'Energetic':
        return {
          glowColor: 'text-accent-emerald',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-400/40',
          pulseScale: [1, 1.12, 1],
          pulseDuration: 3,
          icon: Zap,
          particleColor: 'bg-emerald-400',
          orbitSpeed: 'animate-spin-slow',
          tagText: 'Cognitive Capacity Peak',
          tagClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        };
      case 'Strained':
        return {
          glowColor: 'text-accent-amber',
          bgColor: 'bg-amber-500/15',
          borderColor: 'border-amber-400/35',
          pulseScale: [1, 1.08, 1],
          pulseDuration: 4,
          icon: Battery,
          particleColor: 'bg-amber-400',
          orbitSpeed: 'animate-spin-slow',
          tagText: 'Compounding Load Detected',
          tagClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        };
      case 'Fatigued':
        return {
          glowColor: 'text-orange-500',
          bgColor: 'bg-orange-500/15',
          borderColor: 'border-orange-400/35',
          pulseScale: [1, 1.06, 1],
          pulseDuration: 5,
          icon: Battery,
          particleColor: 'bg-orange-400',
          orbitSpeed: 'animate-spin-slow',
          tagText: 'Power Depletion Warning',
          tagClass: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        };
      case 'Burned Out':
        return {
          glowColor: 'text-accent-rose',
          bgColor: 'bg-rose-500/20',
          borderColor: 'border-rose-400/40',
          pulseScale: [0.98, 1.06, 0.98],
          pulseDuration: 1.5,
          icon: AlertTriangle,
          particleColor: 'bg-rose-400',
          orbitSpeed: 'animate-pulse',
          tagText: 'CRITICAL SHUTDOWN',
          tagClass: 'bg-rose-500/15 border-rose-500/40 text-rose-400 font-extrabold animate-pulse',
        };
      default:
        return {
          glowColor: 'text-accent-emerald',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-400/40',
          pulseScale: [1, 1.1, 1],
          pulseDuration: 3.5,
          icon: Sparkles,
          particleColor: 'bg-emerald-400',
          orbitSpeed: 'animate-spin-slow',
          tagText: 'Telemetry Stable',
          tagClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        };
    }
  };

  const config = getStyleConfigs(status);
  const IconComponent = config.icon;

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[300px]">
      
      {/* Visual Avatar Core Container */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-6">
        
        {/* Deep background ambient glowing shadow */}
        <div className={`absolute inset-4 rounded-full ${config.glowColor} ${config.bgColor} blur-[36px] opacity-75 pointer-events-none transition-all duration-700`} />
        
        {/* Orbital rings */}
        <div className={`absolute w-full h-full border border-dashed rounded-full ${config.borderColor} ${config.orbitSpeed} opacity-20`} style={{ animationDuration: '20s' }} />
        <div className={`absolute w-[80%] h-[80%] border border-dashed rounded-full ${config.borderColor} ${config.orbitSpeed} opacity-30`} style={{ animationDuration: '14s', animationDirection: 'reverse' }} />
        
        {/* Main Pulsing Orb Core */}
        <motion.div
          animate={{
            scale: config.pulseScale,
            boxShadow: [
              '0 0 20px 2px currentColor',
              '0 0 35px 8px currentColor',
              '0 0 20px 2px currentColor'
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: config.pulseDuration,
            ease: 'easeInOut'
          }}
          className={`w-32 h-32 rounded-full border border-zinc-700/50 flex flex-col items-center justify-center relative cursor-pointer select-none transition-all duration-700 ${config.glowColor} ${config.bgColor} bg-zinc-950/80 backdrop-blur-xl border-2`}
        >
          {/* Animated icon */}
          <IconComponent className="w-10 h-10 mb-1.5 transition-all duration-500 transform hover:scale-110" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">TWIN ACTIVE</span>
        </motion.div>
        
        {/* Micro Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute w-1.5 h-1.5 rounded-full ${config.particleColor} top-10 left-10 animate-ping opacity-60`} />
          <div className={`absolute w-1 h-1 rounded-full ${config.particleColor} bottom-10 right-12 animate-pulse opacity-40`} />
          <div className={`absolute w-2 h-2 rounded-full ${config.particleColor} top-[45%] right-6 animate-pulse opacity-50`} style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* Name and State description */}
      <h3 className="text-xl font-extrabold text-white tracking-tight capitalize mb-1 flex items-center gap-1.5">
        <span>{username || 'Student'}'s Twin</span>
      </h3>
      
      <p className="text-zinc-500 text-xs font-semibold mb-4 uppercase tracking-widest">
        Sync State: <span className={config.glowColor + " font-bold"}>{status || 'Syncing...'}</span>
      </p>

      {/* State-specific descriptive tag badge */}
      <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${config.tagClass} transition-all duration-500`}>
        {config.tagText}
      </span>
      
    </div>
  );
};

export default TwinAvatar;
