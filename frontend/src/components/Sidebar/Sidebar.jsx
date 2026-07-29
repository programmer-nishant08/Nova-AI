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

  // ✅ Group conversations by date (like DeepSeek)
  const groupConversations = (convs) => {
    const groups = {
      pinned: [],
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    convs.forEach(conv => {
      const date = new Date(conv.updated_at);
      const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (conv.pinned) {
        groups.pinned.push(conv);
      } else if (cleanDate.getTime() === today.getTime()) {
        groups.today.push(conv);
      } else if (cleanDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(conv);
      } else if (cleanDate > weekAgo) {
        groups.thisWeek.push(conv);
      } else if (cleanDate > monthAgo) {
        groups.thisMonth.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = groupConversations(filteredConversations);

  // ✅ Render each group
  const renderGroup = (title, items, icon) => {
    if (items.length === 0) return null;
    return (
      <div className="mt-4 first:mt-0">
        <div className="flex items-center gap-2 px-2 py-1">
          {icon && <span className="text-xs text-cyber-text-dim/60">{icon}</span>}
          <span className="text-[10px] font-medium text-cyber-text-dim/40 uppercase tracking-wider">{title}</span>
          <span className="text-[10px] text-cyber-text-dim/20 ml-auto">{items.length}</span>
        </div>
        {items.map((conv) => (
          <div
            key={conv.id}
            onClick={() => handleSelectConversation(conv.id)}
            className={`group px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
              currentConversation === conv.id
                ? 'bg-cyber-purple/10'
                : 'hover:bg-cyber-dark/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftIcon className={`w-3.5 h-3.5 flex-shrink-0 ${
                    currentConversation === conv.id ? 'text-cyber-purple' : 'text-cyber-text-dim/30'
                  }`} />
                  <span className={`text-sm truncate ${
                    currentConversation === conv.id ? 'text-cyber-text' : 'text-cyber-text-dim'
                  }`}>
                    {truncateText(conv.title, 28)}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-cyber-text-dim/30 hover:text-red-400 transition-all duration-200 p-0.5"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ✅ Sidebar Content
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-cyber-border/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={28} showText={false} />
            <span className="text-lg font-bold text-gradient">Nova</span>
          </div>
          
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-cyber-dark/50 text-cyber-text-dim hover:text-cyber-text transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <button
          onClick={handleNewChat}
          className="w-full mt-3 bg-gradient-primary text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-glow-purple transition-all duration-300 group text-sm"
        >
          <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-cyber-border/10 flex-shrink-0">
        <div className="relative">
          <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-cyber-text-dim/30" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cyber-dark/30 border border-cyber-border/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-cyber-text placeholder-cyber-text-dim/20 focus:outline-none focus:border-cyber-purple/30 transition"
          />
        </div>
      </div>

      {/* ✅ Conversations List - Grouped */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center text-cyber-text-dim/40 text-sm py-8">
            {searchQuery ? 'No results found' : 'No conversations yet'}
          </div>
        ) : (
          <>
            {renderGroup('Pinned', groups.pinned, '📌')}
            {renderGroup('Today', groups.today, '📅')}
            {renderGroup('Yesterday', groups.yesterday, '📅')}
            {renderGroup('This Week', groups.thisWeek, '📅')}
            {renderGroup('This Month', groups.thisMonth, '📅')}
            {renderGroup('Older', groups.older, '📅')}
          </>
        )}
      </div>

      {/* User Profile */}
      <div className="border-t border-cyber-border/10 p-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center font-semibold text-white text-xs flex-shrink-0 relative">
            {user?.username?.[0]?.toUpperCase() || 'U'}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-cyber-surface" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.username || 'User'}</div>
            <div className="text-xs text-cyber-text-dim/40 truncate">{user?.email || ''}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-cyber-dark/50 text-cyber-text-dim/40 hover:text-red-400 transition-all duration-200"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 h-full bg-cyber-surface border-r border-cyber-border/10 flex-col flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-cyber-surface/80 backdrop-blur-sm border border-cyber-border/10 rounded-lg text-cyber-text hover:bg-cyber-dark/50 transition-colors"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 w-72 bg-cyber-surface border-r border-cyber-border/10 z-50 animate-slideIn shadow-2xl">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}