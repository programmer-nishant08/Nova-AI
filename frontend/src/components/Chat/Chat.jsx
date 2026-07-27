import React, { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import Message from './Message';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import Logo from '../Common/Logo';

export default function Chat() {
  const { 
    messages, 
    loading, 
    personality, 
    setPersonality, 
    personalities, 
    sendMessage,
    currentConversation 
  } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-cyber-dark relative min-h-0">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-gradient-glow pointer-events-none" />

      <ChatHeader 
        personality={personality}
        setPersonality={setPersonality}
        personalities={personalities}
        username={user?.username}
        conversationId={currentConversation}
      />

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 relative z-10"
        style={{ 
          maxHeight: 'calc(100vh - 180px)',
          paddingTop: '16px'
        }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-cyber-text-dim">
            <Logo size={64} showText={false} className="mb-6" />
            <h2 className="text-2xl font-bold text-cyber-text mb-2">Welcome to Nova AI</h2>
            <p className="text-sm text-center px-4">Start a conversation by typing a message below.</p>
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              <span className="px-3 py-1.5 bg-cyber-surface/50 border border-cyber-border rounded-full text-xs text-cyber-text-dim">💬 Chat</span>
              <span className="px-3 py-1.5 bg-cyber-surface/50 border border-cyber-border rounded-full text-xs text-cyber-text-dim">⚡ Fast</span>
              <span className="px-3 py-1.5 bg-cyber-surface/50 border border-cyber-border rounded-full text-xs text-cyber-text-dim">🧠 Smart</span>
              <span className="px-3 py-1.5 bg-cyber-surface/50 border border-cyber-border rounded-full text-xs text-cyber-text-dim">🔒 Private</span>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <Message 
            key={msg.id || idx} 
            role={msg.role} 
            content={msg.content} 
            timestamp={msg.timestamp} 
          />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-cyber-surface border border-cyber-border rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
                <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
              </div>
              <p className="text-xs text-cyber-text-dim/50 mt-1 text-center">Nova is thinking...</p>
            </div>
          </div>
        )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="flex-shrink-0">
        <MessageInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  );
}