import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { 
  PlusIcon, 
  ChatBubbleLeftIcon, 
  MagnifyingGlassIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { formatDate, truncateText } from '../../utils/helpers';
import Logo from '../Common/Logo';

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth();
  const { 
    conversations, 
    currentConversation, 
    setCurrentConversation,
    loadConversations,
    createConversation,
    deleteConversation,
    loadMessages,
    setMessages
  } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNewChat = async () => {
    const convId = await createConversation();
    if (convId) {
      setMessages([]);
      setCurrentConversation(convId);
      setIsMobileOpen(false);
    }
  };

  const handleSelectConversation = async (convId) => {
    setCurrentConversation(convId);
    await loadMessages(convId);
    setIsMobileOpen(false);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-cyber-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={32} showText={false} />
            <span className="text-lg font-bold text-gradient">Nova</span>
            <span className="text-xs text-cyber-text-dim bg-cyber-dark/50 px-2 py-0.5 rounded-full">AI</span>
          </div>
          
          {/* Close button - mobile only */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-cyber-dark/50 text-cyber-text-dim hover:text-cyber-text transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <button
          onClick={handleNewChat}
          className="w-full mt-4 bg-gradient-primary text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-glow-purple transition-all duration-300 group"
        >
          <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-cyber-border flex-shrink-0">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyber-text-dim" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cyber-dark border border-cyber-border rounded-xl pl-9 pr-4 py-2 text-sm text-cyber-text placeholder-cyber-text-dim/40 focus:outline-none focus:border-cyber-purple transition"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center text-cyber-text-dim text-sm py-8">
            {searchQuery ? 'No results found' : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                currentConversation === conv.id
                  ? 'bg-cyber-purple/10 border border-cyber-purple/20'
                  : 'hover:bg-cyber-dark/50 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <ChatBubbleLeftIcon className={`w-4 h-4 flex-shrink-0 ${
                      currentConversation === conv.id ? 'text-cyber-purple' : 'text-cyber-text-dim'
                    }`} />
                    <span className={`text-sm truncate ${
                      currentConversation === conv.id ? 'text-cyber-text' : 'text-cyber-text-dim'
                    }`}>
                      {truncateText(conv.title, 30)}
                    </span>
                  </div>
                  <div className="text-xs text-cyber-text-dim/50 mt-0.5">
                    {formatDate(conv.updated_at)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-cyber-text-dim hover:text-red-400 transition-all duration-200 p-1 rounded-lg hover:bg-red-400/10"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Profile */}
      <div className="border-t border-cyber-border p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center font-semibold text-white text-sm flex-shrink-0 relative">
            {user?.username?.[0]?.toUpperCase() || 'U'}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-cyber-surface" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.username || 'User'}</div>
            <div className="text-xs text-cyber-text-dim/60 truncate">{user?.email || ''}</div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-cyber-dark/50 text-cyber-text-dim hover:text-red-400 transition-all duration-200"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 h-full bg-cyber-surface border-r border-cyber-border flex-col flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-cyber-surface border border-cyber-border rounded-xl text-cyber-text hover:bg-cyber-dark/50 transition-colors shadow-glow-purple"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 w-80 bg-cyber-surface border-r border-cyber-border z-50 animate-slideIn shadow-2xl">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}