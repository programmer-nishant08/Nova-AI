import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Chat from '../Chat/Chat';
import Logo from '../Common/Logo';
import { Bars3Icon } from '@heroicons/react/24/outline';

export default function MainLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-cyber-dark overflow-hidden">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Mobile Header - Only visible on small screens */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-cyber-surface/80 backdrop-blur-sm border-b border-cyber-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-cyber-dark/50 text-cyber-text transition-colors"
          aria-label="Open menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <Logo size={28} showText={false} />
          <span className="text-sm font-bold text-gradient">Nova</span>
        </div>
        
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Chat Area with top padding for mobile */}
      <div className="flex-1 flex flex-col min-w-0 md:pt-0 pt-14">
        <Chat />
      </div>
    </div>
  );
}