import React, { useState } from 'react';
import Logo from '../Common/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './Login';
import Register from './Register';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-dark p-4 relative overflow-hidden">
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-glow pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <Logo size={94} showText={false} />
             <span className="text-2xl font-bold bg-gradient-to-r from-cyber-purple via-cyber-cyan to-cyber-pink bg-clip-text text-transparent">
        Nova AI
      </span>

          <p className="text-cyber-text-dim mt-1 text-sm">Advanced Intelligent Assistant</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-glow-purple relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-[0.03] pointer-events-none" />
          
          <div className="flex gap-2 mb-6 bg-cyber-dark/50 rounded-xl p-1 relative">
            <div 
              className={`absolute inset-y-1 w-[calc(50%-4px)] bg-gradient-primary rounded-lg transition-all duration-300 ${
                isLogin ? 'left-1' : 'left-[calc(50%+2px)]'
              }`}
            />
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition relative z-10 ${
                isLogin ? 'text-white' : 'text-cyber-text-dim hover:text-cyber-text'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition relative z-10 ${
                !isLogin ? 'text-white' : 'text-cyber-text-dim hover:text-cyber-text'
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              {isLogin ? (
                <Login onSwitch={() => setIsLogin(false)} />
              ) : (
                <Register onSwitch={() => setIsLogin(true)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-cyber-text-dim mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-cyber-purple hover:underline">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-cyber-purple hover:underline">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}