import  { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "ctm_jwt_token";
const USER_KEY  = "ctm_user";

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user,  setUser]    = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /** Call this after a successful login */
  const login = useCallback((jwt, userData) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
  }, []);

  /** Clear session */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Returns auth headers for protected API calls:
   *   const headers = getAuthHeaders();
   *   axios.get("/api/protected", { headers });
   */
  const getAuthHeaders = useCallback(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook — use anywhere: const { user, login, logout } = useAuth(); */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}