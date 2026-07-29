// frontend/src/components/Common/Logo.jsx
import React from 'react';

export default function Logo({ size = 40, className = "", showText = true, textSize = "text-xl" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Simple N with gradient accent bar */}
      <div className="relative flex-shrink-0">
        <div 
          className="bg-cyber-dark rounded-xl flex items-center justify-center font-bold text-cyber-text border border-cyber-border/50"
          style={{ width: size, height: size, fontSize: size * 0.5 }}
        >
          N
        </div>
        {/* Gradient accent bar at bottom */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-primary rounded-full" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSize} font-bold text-cyber-text`}>
            Nova
          </span>
          <span className="text-[10px] text-cyber-text-dim/50 font-medium tracking-widest uppercase">
            AI Assistant
          </span>
        </div>
      )}
    </div>
  );
}