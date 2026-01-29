import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recover from simple storage or just stay logged out on refresh? 
    // Ideally we'd hit /auth/me but we don't have it.
    // For this prototype, we'll rely on memory or localStorage.
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  async function login(username, password) {
    // In a real app we would use HttpOnly cookies.
    // Here we'll call the servlet.
    try {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // Important for session cookie
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Falha no login');
        }

        const data = await response.json();
        const userData = { username: data.user, role: data.role };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
    } catch (e) {
        throw e;
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('user');
    fetch('http://localhost:8080/auth/logout', { method: 'POST', credentials: 'include' });
  }

  return (
    <AuthContext.Provider value={{ user, signed: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
