import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

const Logo = ({ className = "w-6 h-6", glow = true }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      {glow && (
        <div className={`absolute inset-0 rounded-full pointer-events-none transition-all duration-300 ${
          isLight 
            ? 'bg-indigo-500/10 blur-[3px] shadow-[0_2px_10px_rgba(79,70,229,0.18)]' 
            : 'logo-glow blur-md'
        }`} />
      )}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            {isLight ? (
              <>
                <stop offset="0%" stopColor="#312e81" /> {/* Indigo-900 */}
                <stop offset="45%" stopColor="#4338ca" /> {/* Indigo-700 */}
                <stop offset="100%" stopColor="#6d28d9" /> {/* Purple-700 */}
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </>
            )}
          </linearGradient>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            {isLight ? (
              <>
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
              </>
            )}
          </linearGradient>
        </defs>
        
        {/* Outer dotted orbital paths */}
        <circle cx="50" cy="50" r="42" stroke="url(#logoGrad)" strokeWidth={isLight ? "1.5" : "1.2"} strokeDasharray="3 5" opacity={isLight ? "0.6" : "0.35"} />
        
        {/* Neural/SaaS geometric polygon web structure */}
        <polygon points="50,16 79,32 79,68 50,84 21,68 21,32" stroke="url(#logoGrad)" strokeWidth={isLight ? "2.5" : "2"} strokeLinejoin="round" />
        <polygon points="50,28 69,39 69,61 50,72 31,61 31,39" stroke="url(#logoGrad)" strokeWidth={isLight ? "1.5" : "1"} strokeLinejoin="round" strokeDasharray="2 3" opacity={isLight ? "0.8" : "0.6"} />
        
        {/* Symmetric coordinate connection axes */}
        <line x1="50" y1="16" x2="50" y2="84" stroke="url(#logoGrad)" strokeWidth={isLight ? "1" : "0.8"} strokeDasharray="4 4" opacity={isLight ? "0.6" : "0.5"} />
        <line x1="21" y1="32" x2="79" y2="68" stroke="url(#logoGrad)" strokeWidth={isLight ? "1" : "0.8"} strokeDasharray="4 4" opacity={isLight ? "0.6" : "0.5"} />
        <line x1="21" y1="68" x2="79" y2="32" stroke="url(#logoGrad)" strokeWidth={isLight ? "1" : "0.8"} strokeDasharray="4 4" opacity={isLight ? "0.6" : "0.5"} />
        
        {/* Central synchronizing core */}
        <circle cx="50" cy="50" r="13" fill="url(#glowGrad)" />
        <circle cx="50" cy="50" r="8" fill="url(#logoGrad)" />
        <circle cx="50" cy="50" r="3" fill="#ffffff" />
        
        {/* Interactive network node elements */}
        <circle cx="50" cy="16" r="3.5" fill={isLight ? "#4f46e5" : "#6366f1"} className="logo-node" strokeWidth="1.5" />
        <circle cx="79" cy="32" r="3.5" fill={isLight ? "#7c3aed" : "#8b5cf6"} className="logo-node" strokeWidth="1.5" />
        <circle cx="79" cy="68" r="3.5" fill={isLight ? "#7c3aed" : "#ec4899"} className="logo-node" strokeWidth="1.5" />
        <circle cx="50" cy="84" r="3.5" fill={isLight ? "#7c3aed" : "#8b5cf6"} className="logo-node" strokeWidth="1.5" />
        <circle cx="21" cy="68" r="3.5" fill={isLight ? "#4f46e5" : "#6366f1"} className="logo-node" strokeWidth="1.5" />
        <circle cx="21" cy="32" r="3.5" fill={isLight ? "#4f46e5" : "#ec4899"} className="logo-node" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

export default Logo;
