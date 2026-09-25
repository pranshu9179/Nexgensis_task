import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
    return token ? { accessToken: token, username } : null;
  });

  const login = useCallback((userData) => {
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('username', userData.username);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
