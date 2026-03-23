import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username')); // <-- Add this state

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = (newToken: string, newUsername: string) => {
    setToken(newToken);
    setUsername(newUsername);
    localStorage.setItem('username', newUsername);
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ token, username, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};