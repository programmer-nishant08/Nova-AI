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
      <ChatHeader 
        personality={personality}
        setPersonality={setPersonality}
        personalities={personalities}
        username={user?.username}
        conversationId={currentConversation}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-cyber-text-dim">
            <Logo size={48} showText={false} className="mb-4" />
            <h2 className="text-xl font-semibold text-cyber-text mb-1">Welcome to Nova AI</h2>
            <p className="text-sm text-center px-4">Start a conversation by typing a message below.</p>
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              <span className="px-3 py-1 bg-cyber-surface/50 border border-cyber-border/20 rounded-full text-xs text-cyber-text-dim">💬 Chat</span>
              <span className="px-3 py-1 bg-cyber-surface/50 border border-cyber-border/20 rounded-full text-xs text-cyber-text-dim">⚡ Fast</span>
              <span className="px-3 py-1 bg-cyber-surface/50 border border-cyber-border/20 rounded-full text-xs text-cyber-text-dim">🧠 Smart</span>
              <span className="px-3 py-1 bg-cyber-surface/50 border border-cyber-border/20 rounded-full text-xs text-cyber-text-dim">🔒 Private</span>
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
            <div className="bg-cyber-surface border border-cyber-border/20 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
                <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0">
        <MessageInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  );
}