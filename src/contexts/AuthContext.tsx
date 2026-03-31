import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserRole } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  username: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = localStorage.getItem('greenroute_auth');
    return stored ? JSON.parse(stored) : { isAuthenticated: false, role: null, username: null };
  });

  const login = useCallback((username: string, _password: string, role: UserRole) => {
    const state = { isAuthenticated: true, role, username };
    setAuth(state);
    localStorage.setItem('greenroute_auth', JSON.stringify(state));
    return true;
  }, []);

  const logout = useCallback(() => {
    const state = { isAuthenticated: false, role: null, username: null };
    setAuth(state);
    localStorage.removeItem('greenroute_auth');
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
