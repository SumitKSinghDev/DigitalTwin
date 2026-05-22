import React from 'react';

const Logo = ({ className = "w-6 h-6", glow = true }) => {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      {glow && (
        <div className="absolute inset-0 logo-glow blur-md rounded-full pointer-events-none" />
      )}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Outer dotted orbital paths */}
        <circle cx="50" cy="50" r="42" stroke="url(#logoGrad)" strokeWidth="1.2" strokeDasharray="3 5" opacity="0.35" />
        
        {/* Neural/SaaS geometric polygon web structure */}
        <polygon points="50,16 79,32 79,68 50,84 21,68 21,32" stroke="url(#logoGrad)" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="50,28 69,39 69,61 50,72 31,61 31,39" stroke="url(#logoGrad)" strokeWidth="1" strokeLinejoin="round" strokeDasharray="2 3" opacity="0.6" />
        
        {/* Symmetric coordinate connection axes */}
        <line x1="50" y1="16" x2="50" y2="84" stroke="url(#logoGrad)" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
        <line x1="21" y1="32" x2="79" y2="68" stroke="url(#logoGrad)" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
        <line x1="21" y1="68" x2="79" y2="32" stroke="url(#logoGrad)" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
        
        {/* Central synchronizing core */}
        <circle cx="50" cy="50" r="13" fill="url(#glowGrad)" />
        <circle cx="50" cy="50" r="8" fill="url(#logoGrad)" />
        <circle cx="50" cy="50" r="3" fill="#ffffff" />
        
        {/* Interactive network node elements */}
        <circle cx="50" cy="16" r="3.5" fill="#6366f1" className="logo-node" strokeWidth="1.5" />
        <circle cx="79" cy="32" r="3.5" fill="#8b5cf6" className="logo-node" strokeWidth="1.5" />
        <circle cx="79" cy="68" r="3.5" fill="#ec4899" className="logo-node" strokeWidth="1.5" />
        <circle cx="50" cy="84" r="3.5" fill="#8b5cf6" className="logo-node" strokeWidth="1.5" />
        <circle cx="21" cy="68" r="3.5" fill="#6366f1" className="logo-node" strokeWidth="1.5" />
        <circle cx="21" cy="32" r="3.5" fill="#ec4899" className="logo-node" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

export default Logo;
