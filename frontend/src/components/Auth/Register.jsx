import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

export default function Register({ onSwitch }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await register(username, email, password);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2 rounded-xl">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-cyber-text-dim mb-1.5">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-cyber-dark/50 border border-cyber-border rounded-xl px-4 py-3 text-cyber-text placeholder-cyber-text-dim/30 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition"
          placeholder="johndoe (min 3 characters)"
          required
          disabled={loading}
          minLength={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-cyber-text-dim mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-cyber-dark/50 border border-cyber-border rounded-xl px-4 py-3 text-cyber-text placeholder-cyber-text-dim/30 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition"
          placeholder="you@example.com"
          required
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-cyber-text-dim mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-cyber-dark/50 border border-cyber-border rounded-xl px-4 py-3 text-cyber-text placeholder-cyber-text-dim/30 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition"
          placeholder="set a strong password (min 6 characters)"
          required
          disabled={loading}
          minLength={6}
        />
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-primary text-white font-semibold py-3 rounded-xl shadow-glow-purple hover:shadow-glow-purple/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating Account...
          </span>
        ) : (
          'Create Account'
        )}
      </motion.button>
      
      <p className="text-center text-sm text-cyber-text-dim">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-cyber-purple hover:underline font-medium"
        >
          Sign In
        </button>
      </p>
    </form>
  );
}