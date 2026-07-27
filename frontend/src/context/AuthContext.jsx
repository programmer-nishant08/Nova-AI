import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nova_token');
    const userData = localStorage.getItem('nova_user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        localStorage.removeItem('nova_token');
        localStorage.removeItem('nova_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/login', { email, password });
      if (response.data.success) {
        const { access_token, user } = response.data;
        localStorage.setItem('nova_token', access_token);
        localStorage.setItem('nova_user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(user);
        toast.success('Welcome back!');
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/api/register', { username, email, password });
      if (response.data.success) {
        const { access_token, user } = response.data;
        localStorage.setItem('nova_token', access_token);
        localStorage.setItem('nova_user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(user);
        toast.success('Account created!');
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const googleLogin = async (email, name) => {
    try {
      const response = await api.post('/api/google-auth', { email, name });
      if (response.data.success) {
        const { access_token, user } = response.data;
        localStorage.setItem('nova_token', access_token);
        localStorage.setItem('nova_user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(user);
        toast.success('Welcome!');
        return { success: true };
      }
      return { success: false, error: 'Google login failed' };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Google login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('nova_token');
    localStorage.removeItem('nova_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);