import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function FloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! 👋", sender: 'bot' },
    { id: 2, text: "What can I help with?", sender: 'bot' },
  ]);

  const quickPrompts = [
    'Contact Help',
    'Suggestions',
    'Add Suggestions',
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), text: message, sender: 'user' }]);
    setMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "I'll help you with that! 😊", 
        sender: 'bot' 
      }]);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-cyan-500 shadow-glow-purple flex items-center justify-center text-white text-2xl hover:shadow-glow-purple/50 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✦
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-[380px] h-[600px] bg-cyber-surface/95 backdrop-blur-xl border border-cyber-border/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="relative px-6 py-5 bg-gradient-to-br from-purple-600 via-purple-700 to-cyan-600">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg font-bold">
                  ✦
                </div>
                <div>
                  <h3 className="text-white font-semibold">Nova AI</h3>
                  <p className="text-white/60 text-xs">Online • Ready to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cyber-dark/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-br-none'
                      : 'bg-cyber-surface/80 border border-cyber-border/30 text-cyber-text rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-cyber-dark/30 border-t border-cyber-border/10">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setMessages([...messages, { id: Date.now(), text: prompt, sender: 'user' }]);
                    setTimeout(() => {
                      setMessages(prev => [...prev, { 
                        id: Date.now() + 1, 
                        text: `I can help with "${prompt}"!`, 
                        sender: 'bot' 
                      }]);
                    }, 500);
                  }}
                  className="px-4 py-1.5 bg-cyber-surface/50 border border-cyber-border/20 rounded-full text-xs text-cyber-text whitespace-nowrap hover:border-purple-500/50 hover:text-purple-400 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-cyber-border/10 bg-cyber-surface/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything ..."
                className="flex-1 bg-cyber-dark/50 border border-cyber-border/20 rounded-xl px-4 py-2.5 text-sm text-cyber-text placeholder-cyber-text-dim/40 focus:outline-none focus:border-purple-500/50 transition"
              />
              <button
                onClick={handleSend}
                className="p-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-white hover:shadow-glow-purple transition"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}