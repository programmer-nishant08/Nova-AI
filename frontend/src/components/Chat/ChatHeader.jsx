import React, { useState } from 'react';
import Logo from '../Common/Logo';
import { motion } from 'framer-motion';
import { 
  EllipsisVerticalIcon,
  ShareIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

export default function ChatHeader({ 
  personality, 
  setPersonality, 
  personalities, 
  username,
  conversationId 
}) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="border-b border-cyber-border px-6 py-4 flex items-center justify-between bg-cyber-surface/50 backdrop-blur-sm relative z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Logo size ={36} />
                     
          <div>
            <h2 className="text-lg font-semibold text-cyber-text">
              {conversationId ? 'Nova AI' : 'New Chat'}
            </h2>
            <p className="text-sm text-cyber-text-dim/60">
              {username || 'User'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          className="bg-cyber-dark/50 border border-cyber-border rounded-xl px-3 py-2 text-sm text-cyber-text focus:outline-none focus:border-cyber-purple transition cursor-pointer"
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
  );
}