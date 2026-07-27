import React from 'react';

export default function LogoOrbit({ size = 40, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Orbit rings */}
          <ellipse cx="40" cy="40" rx="32" ry="14" stroke="url(#ringGrad)" strokeWidth="1.2" opacity="0.3" />
          <ellipse cx="40" cy="40" rx="14" ry="32" stroke="url(#ringGrad)" strokeWidth="1.2" opacity="0.3" />
          <ellipse cx="40" cy="40" rx="28" ry="28" stroke="url(#ringGrad)" strokeWidth="1" opacity="0.2" />
          
          {/* Letter N made from paths */}
          <path
            d="M30 25 L30 55 L40 40 L50 55 L50 25"
            stroke="url(#textGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#glow)"
          />
          
          {/* Glow around the N */}
          <path
            d="M30 25 L30 55 L40 40 L50 55 L50 25"
            stroke="url(#textGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.15"
          />
          
          {/* Orbiting dot */}
          <circle cx="18" cy="40" r="3" fill="#F472B6">
            <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="1" to="0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="62" cy="40" r="2.5" fill="#06B6D4">
            <animateTransform attributeName="transform" type="rotate" from="180 40 40" to="540 40 40" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="1" to="0.3" dur="1.8s" repeatCount="indefinite" />
          </circle>
          
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F472B6" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
      {/* <span className="text-xl font-bold bg-gradient-to-r from-cyber-purple via-cyber-cyan to-cyber-pink bg-clip-text text-transparent">
        Nova 
      </span> */}
    </div>
  );
}