import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EllipsisVerticalIcon,
  ShareIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import Logo from '../Common/Logo';

const modes = [
  { id: 'instant', label: 'Instant', icon: '⚡', gradient: 'from-cyber-purple to-cyber-cyan' },
  { id: 'expert', label: 'Expert', icon: '🧠', gradient: 'from-cyber-cyan to-cyber-pink' },
  { id: 'vision', label: 'Vision', icon: '🔮', gradient: 'from-cyber-pink to-cyber-purple' },
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
    <div className="border-b border-cyber-border/20 px-6 py-4 flex flex-col gap-3 bg-cyber-surface/30 backdrop-blur-sm relative z-20">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2">
            <Logo size={24} showText={false} />
            <span className="text-sm font-bold text-gradient">Nova</span>
          </div>
          <h2 className="text-lg font-semibold text-cyber-text hidden md:block">
            {conversationId ? 'Chat' : 'New Chat'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            className="bg-cyber-dark/50 border border-cyber-border rounded-xl px-3 py-1.5 text-sm text-cyber-text focus:outline-none focus:border-cyber-purple transition cursor-pointer"
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
              className="p-2 rounded-xl hover:bg-cyber-dark/50 text-cyber-text-dim hover:text-cyber-text transition"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-cyber-card border border-cyber-border rounded-xl shadow-glow-purple overflow-hidden z-50"
              >
                <button className="w-full px-4 py-2.5 text-left text-sm text-cyber-text hover:bg-cyber-dark/50 transition flex items-center gap-3">
                  <ShareIcon className="w-4 h-4 text-cyber-text-dim" />
                  Share Chat
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-cyber-text hover:bg-cyber-dark/50 transition flex items-center gap-3">
                  <DocumentArrowDownIcon className="w-4 h-4 text-cyber-text-dim" />
                  Export Chat
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-1 bg-cyber-dark/50 rounded-xl p-1 w-fit">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
              activeMode === mode.id
                ? `bg-gradient-to-r ${mode.gradient} text-white shadow-glow-purple`
                : 'text-cyber-text-dim hover:text-cyber-text'
            }`}
          >
            <span>{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}