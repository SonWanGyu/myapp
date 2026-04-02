'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const router = useRouter();

  const USER_API_URL = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/users`;

  const checkAuth = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`${USER_API_URL}/me`, {
        method: 'GET',
        credentials: 'include'
      });
      if (res.ok) {
        const user: User = await res.json();
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Not authenticated');
    } finally {
      setIsInitializing(false);
    }
  }, [USER_API_URL]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (user: User): void => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch(`${USER_API_URL}/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
