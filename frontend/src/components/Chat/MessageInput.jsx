import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon, MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function MessageInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-cyber-border/10 bg-cyber-dark/30 p-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <div className={`absolute left-3 bottom-2.5 flex items-center gap-1 transition-opacity duration-200 ${
            isFocused || message ? 'opacity-0' : 'opacity-100'
          }`}>
            <span className="text-xs text-cyber-text-dim/30">Message Nova...</span>
          </div>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder=""
            rows={1}
            className="w-full bg-cyber-dark/40 border border-cyber-border/20 rounded-xl px-3 py-2.5 text-sm text-cyber-text placeholder-transparent focus:outline-none focus:border-cyber-purple/30 transition resize-none min-h-[42px] max-h-[80px]"
            disabled={disabled}
          />
        </div>

        {/* Action Buttons - DeepThink & Search */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            className="p-2 rounded-lg text-cyber-text-dim hover:text-cyber-text hover:bg-cyber-dark/50 transition"
            title="DeepThink"
          >
            <SparklesIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg text-cyber-text-dim hover:text-cyber-text hover:bg-cyber-dark/50 transition"
            title="Search"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim() || disabled}
            className="bg-cyber-purple/20 text-cyber-purple p-2 rounded-lg hover:bg-cyber-purple/30 transition-all duration-300 disabled:opacity-30 disabled:hover:bg-cyber-purple/20 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}