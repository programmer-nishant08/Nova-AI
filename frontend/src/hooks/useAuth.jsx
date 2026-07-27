import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

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
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      return { success: false, error: errorMessage };
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
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      let errorMessage = 'Registration failed. Please check your details.';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg || err).join(', ');
        }
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('nova_token');
    localStorage.removeItem('nova_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}