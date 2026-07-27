import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon, MicrophoneIcon, PaperClipIcon } from '@heroicons/react/24/outline';

export default function MessageInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
      // Reset height after sending
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
    <div className="border-t border-cyber-border p-4 bg-cyber-surface/50 backdrop-blur-sm sticky bottom-0 z-20">
      <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <div className={`absolute left-3 bottom-3 flex items-center gap-1 transition-opacity duration-200 ${
            isFocused || message ? 'opacity-0' : 'opacity-100'
          }`}>
            <span className="text-xs text-cyber-text-dim/30">⌘</span>
            <span className="text-xs text-cyber-text-dim/20">Type a message...</span>
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
            className="w-full bg-cyber-dark/50 border border-cyber-border rounded-2xl px-4 py-3 text-cyber-text placeholder-transparent focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition resize-none min-h-[52px] max-h-[120px]"
            disabled={disabled}
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            className="p-3 rounded-xl text-cyber-text-dim hover:text-cyber-text hover:bg-cyber-dark/50 transition"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-3 rounded-xl text-cyber-text-dim hover:text-cyber-text hover:bg-cyber-dark/50 transition"
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim() || disabled}
            className="bg-gradient-primary text-white p-3 rounded-xl hover:shadow-glow-purple transition-all duration-300 disabled:opacity-40 disabled:hover:shadow-none disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}