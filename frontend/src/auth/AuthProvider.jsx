// src/auth/AuthProvider.jsx
import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

/**
 * Simple frontend-only AuthProvider.
 * - reads token + current_user from localStorage (your Login.jsx writes these)
 * - login({ token, user }) sets both
 * - logout clears both
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("current_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("current_user", JSON.stringify(user));
    else localStorage.removeItem("current_user");
  }, [user]);

  function login({ token: t, user: u }) {
    setToken(t || `demo-token-${Date.now()}`);
    setUser(u || null);
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("current_user");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
