import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('resolvetrack_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('resolvetrack_token');
      const storedUser = localStorage.getItem('resolvetrack_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('resolvetrack_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid, clearing local auth state.');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('resolvetrack_token', token);
      localStorage.setItem('resolvetrack_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success) {
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('resolvetrack_token', token);
      localStorage.setItem('resolvetrack_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('resolvetrack_token');
    localStorage.removeItem('resolvetrack_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
