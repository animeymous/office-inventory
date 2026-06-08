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
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const fullName = localStorage.getItem('fullName');
    
    if (token && role) {
      return { token, role, username, fullName };
    }
    return null;
  });

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, role, username: userName, fullName } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('username', userName);
    localStorage.setItem('fullName', fullName);
    
    setUser({ token, role, username: userName, fullName });
    return response.data;
  };

  const logout = () => {
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