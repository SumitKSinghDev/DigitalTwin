import React from 'react';

const GlowBackground = () => {
  return (
    <div className="glow-mesh" aria-hidden="true">
      {/* Indigo glow top-left */}
      <div 
        className="glow-circle bg-primary w-[500px] h-[500px] -top-40 -left-40 animate-pulse-slow"
        style={{ animationDuration: '6s' }}
      />
      {/* Violet glow bottom-right */}
      <div 
        className="glow-circle bg-accent-violet w-[600px] h-[600px] -bottom-40 -right-40 animate-pulse-slow"
        style={{ animationDuration: '8s' }}
      />
      {/* Emerald green glow center-left */}
      <div 
        className="glow-circle bg-accent-emerald w-[350px] h-[350px] top-[40%] left-[-100px] animate-pulse-slow"
        style={{ animationDuration: '10s' }}
      />
    </div>
  );
};

export default GlowBackground;
