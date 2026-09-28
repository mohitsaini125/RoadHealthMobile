import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getMe, login as apiLogin, signup as apiSignup } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";
import { getToken, removeToken, saveToken } from "../storage/authStorage";
import { resetDraft } from "../utils/draft";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(async () => {
    await removeToken();
    resetDraft();
    setUser(null);
  }, []);

  // Session restoration: token -> GET /auth/me
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    (async () => {
      try {
        const token = await getToken();
        if (token) setUser(await getMe());
      } catch (e) {
        if (e.status === 401) await clearSession();
        // Network errors: keep the token, user will be sent to login and can retry.
      } finally {
        setLoading(false);
      }
    })();
  }, [clearSession]);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    await saveToken(res.access_token);
    setUser(await getMe());
  };

  const signup = async (payload) => {
    await apiSignup(payload);
    await login(payload.email, payload.password);
  };

  const refreshUser = async () => setUser(await getMe());

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout: clearSession, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
