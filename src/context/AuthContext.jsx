import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

/**
 * Provides `user`, `login`, and `logout` to the component tree.
 *
 * On first render, we check localStorage so that a hard refresh doesn't
 * log the user out — the token survives across page reloads.
 */
export function AuthProvider({ children }) {
  // Lazy initializer: runs once on mount, reads from storage.
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

/**
 * Convenience hook — fails loudly if used outside the provider
 * so we catch wiring mistakes early in development.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
