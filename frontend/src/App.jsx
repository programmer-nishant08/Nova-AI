import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ChatProvider } from './context/ChatContext';
import MainLayout from './components/Layout/MainLayout';
import Auth from './components/Auth/Auth';
import Logo from './components/Common/Logo';

// ============================================
// APP CONTENT
// ============================================

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // ✅ Show loading screen with logo
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-dark">
        <div className="flex flex-col items-center gap-6">
          <Logo size={64} showText={false} />
          <div className="w-12 h-12 border-4 border-cyber-purple border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyber-text-dim text-sm animate-pulse">Loading Nova...</p>
        </div>
      </div>
    );
  }

  // ✅ If not authenticated, show Auth page
  if (!isAuthenticated) {
    return <Auth />;
  }

  // ✅ If authenticated, show MainLayout with Chat
  return (
    <ChatProvider>
      <MainLayout />
    </ChatProvider>
  );
}

// ============================================
// MAIN APP
// ============================================

function App() {

  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A2E',
              color: '#E2E8F0',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: {
                primary: '#8B5CF6',
                secondary: '#E2E8F0',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#E2E8F0',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;