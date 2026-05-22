import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

const GlowBackground = () => {
  const { theme } = useTheme();

  return (
    <div className="glow-mesh animate-fade-in" aria-hidden="true">
      {/* Subtle Noise Overlay for premium tactile texture */}
      <div className="noise-overlay" />

      {/* Cinematic ultra-subtle grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none grid-overlay"
        style={theme === 'dark' ? {
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.012) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        } : {}}
      />

      {/* Cinematic radial vignette to darken outer boundary and add immense atmospheric depth */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
          theme === 'light'
            ? 'bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_40%),radial-gradient(circle_at_center,transparent_40%,rgba(241,245,249,0.2)_90%)]'
            : 'bg-[radial-gradient(circle_at_center,transparent_25%,rgba(2,6,23,0.9)_90%)]'
        }`}
      />

      {/* Ambient Glows */}
      {/* Top-Right Glow for Light Mode, Top-Left for Dark Mode */}
      <div 
        className={`glow-circle w-[500px] h-[500px] absolute -top-40 transition-all duration-500 animate-pulse-slow ${
          theme === 'light' 
            ? 'bg-indigo-300/15 -right-40' 
            : 'bg-primary/10 -left-40'
        }`}
        style={{ animationDuration: '6s' }}
      />
      {/* Bottom-Right Glow */}
      <div 
        className={`glow-circle w-[600px] h-[600px] absolute -bottom-40 -right-40 transition-all duration-500 animate-pulse-slow ${
          theme === 'light' ? 'bg-purple-300/12' : 'bg-accent-violet/5'
        }`}
        style={{ animationDuration: '8s' }}
      />
      {/* Center-Left Glow */}
      <div 
        className={`glow-circle w-[350px] h-[350px] absolute top-[40%] left-[-100px] transition-all duration-500 animate-pulse-slow ${
          theme === 'light' ? 'bg-indigo-300/5' : 'bg-accent-emerald/5'
        }`}
        style={{ animationDuration: '10s' }}
      />
    </div>
  );
};

export default GlowBackground;
