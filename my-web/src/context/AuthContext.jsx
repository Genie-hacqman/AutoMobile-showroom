import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { refreshSession, setAccessToken } from '../api/client';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // On first paint, try to exchange the refresh cookie for a fresh access token so
  // that authentication survives a page reload.
  useEffect(() => {
    let cancelled = false;

    refreshSession()
      .then((tokens) => {
        if (!cancelled) setUser(tokens.user || null);
      })
      .catch(() => {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsBootstrapping(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const tokens = await api.login({ email, password, remember_me: Boolean(rememberMe) });
    setAccessToken(tokens.access_token);
    setUser(tokens.user);
    return tokens.user;
  }, []);

  const register = useCallback((payload) => api.register(payload), []);

  const logout = useCallback(async () => {
    try {
      await api.logout({});
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await api.updateMe(payload);
    setUser(updated);
    return updated;
  }, []);

  const deleteAccount = useCallback(async () => {
    await api.deleteMe();
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const current = await api.me();
    setUser(current);
    return current;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isBootstrapping,
      login,
      register,
      logout,
      updateProfile,
      deleteAccount,
      refreshUser,
    }),
    [user, isBootstrapping, login, register, logout, updateProfile, deleteAccount, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
