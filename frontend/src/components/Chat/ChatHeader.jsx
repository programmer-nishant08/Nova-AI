import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const modes = [
  { id: 'instant', label: 'Instant', icon: '⚡' },
  { id: 'expert', label: 'Expert', icon: '🧠' },
  { id: 'vision', label: 'Vision', icon: '🔮' },
];

export default function ChatHeader({ 
  personality, 
  setPersonality, 
  personalities, 
  username,
  conversationId 
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [activeMode, setActiveMode] = useState('instant');

  return (
    <div className="border-b border-cyber-border/10 px-4 py-3 bg-cyber-dark/30">
      {/* Row 1: Mode Selector + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-cyber-dark/40 rounded-lg p-0.5">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                activeMode === mode.id
                  ? 'bg-cyber-purple/20 text-cyber-purple'
                  : 'text-cyber-text-dim hover:text-cyber-text'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            className="bg-transparent border-none text-xs text-cyber-text-dim focus:outline-none cursor-pointer hover:text-cyber-text transition"
          >
            {personalities.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>

          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 rounded-md hover:bg-cyber-dark/50 text-cyber-text-dim hover:text-cyber-text transition"
            >
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
            
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-40 bg-cyber-card border border-cyber-border rounded-lg shadow-glow-purple overflow-hidden z-50"
              >
                <button className="w-full px-3 py-2 text-left text-xs text-cyber-text hover:bg-cyber-dark/50 transition">
                  Share Chat
                </button>
                <button className="w-full px-3 py-2 text-left text-xs text-cyber-text hover:bg-cyber-dark/50 transition">
                  Export Chat
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}