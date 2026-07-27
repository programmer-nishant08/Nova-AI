import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-cyber-dark p-4">
          <div className="max-w-md w-full bg-cyber-surface border border-cyber-border rounded-2xl p-8 text-center shadow-glow-purple">
            <div className="text-5xl mb-4">🚨</div>
            <h1 className="text-2xl font-bold text-cyber-text mb-2">
              Something Went Wrong
            </h1>
            <p className="text-cyber-text-dim text-sm mb-6">
              Nova encountered an unexpected error. Please try refreshing the page.
            </p>
            
            {this.state.error && (
              <div className="bg-cyber-dark/50 border border-cyber-border rounded-xl p-4 text-left mb-6">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-cyber-text-dim cursor-pointer hover:text-cyber-text">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-cyber-text-dim/50 mt-2 overflow-x-auto font-mono whitespace-pre-wrap break-all">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-primary text-white font-medium px-6 py-2 rounded-xl hover:shadow-glow-purple transition"
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.href = '/';
                }}
                className="bg-cyber-dark/50 border border-cyber-border text-cyber-text font-medium px-6 py-2 rounded-xl hover:bg-cyber-dark/80 transition"
              >
                🏠 Go Home
              </button>
            </div>
            
            <p className="text-xs text-cyber-text-dim/50 mt-6">
              If this problem persists, contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}