import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiError } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("fyf_token");
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (e) {
      localStorage.removeItem("fyf_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (username, password) => {
    try {
      const { data } = await api.post("/auth/login", { username, password });
      localStorage.setItem("fyf_token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("fyf_token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch (_) {}
    localStorage.removeItem("fyf_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
