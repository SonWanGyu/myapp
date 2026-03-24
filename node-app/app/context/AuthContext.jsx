'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  const USER_API_URL = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/users`;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${USER_API_URL}/me`, {
        method: 'GET',
        credentials: 'include'
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Not authenticated');
    } finally {
      setIsInitializing(false);
    }
  };

  const login = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
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

export const useAuth = () => useContext(AuthContext);
