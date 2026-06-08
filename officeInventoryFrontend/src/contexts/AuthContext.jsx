/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const fullName = localStorage.getItem('fullName');
    
    if (role) {
      return { role, username, fullName };
    }
    return null;
  });

  const login = async (username, password) => {
    // Token is automatically stored in HttpOnly cookie by backend
    const response = await api.post('/auth/login', { username, password });
    const { role, username: userName, fullName } = response.data;
    
    // Store only non-sensitive data in localStorage
    localStorage.setItem('role', role);
    localStorage.setItem('username', userName);
    localStorage.setItem('fullName', fullName);
    
    setUser({ role, username: userName, fullName });
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout'); // Clear cookie on backend
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.clear();
    setUser(null);
  };

  const changePassword = async (newPassword) => {
    await api.post('/auth/change-password', { newPassword });
  };

  const value = {
    user,
    login,
    logout,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};