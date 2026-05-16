'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiFetch, getStoredUser, getToken, setAuth, clearAuth } from '@/lib/api-client';
import { uiRoleToApi, dashboardPathForRole } from '@/lib/role-map';

const AuthContext = createContext(null);

const PUBLIC_PATHS = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verifyemail'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, uiRole) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        role: uiRoleToApi(uiRole),
      }),
    });
    setAuth(res.token, res.user);
    setUser(res.user);
    router.push(dashboardPathForRole(res.user.role));
    return res;
  }, [router]);

  const signup = useCallback(async (payload) => {
    const res = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        confirmPassword: payload.confirmPassword,
        role: uiRoleToApi(payload.role),
        department: payload.department,
      }),
    });
    return res;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname?.startsWith(p + '?'));
    
    const token = getToken();
    if (!isPublic && !token) {
      router.replace('/login');
      return;
    }

    if (user && !isPublic) {
      const userRole = user.role;
      if (pathname.startsWith('/instructor') && userRole !== 'Instructor') {
        router.replace(dashboardPathForRole(userRole));
      } else if (pathname.startsWith('/student') && userRole !== 'Student') {
        router.replace(dashboardPathForRole(userRole));
      } else if (pathname.startsWith('/admin') && userRole !== 'Admin') {
        router.replace(dashboardPathForRole(userRole));
      }
    }
  }, [loading, pathname, router, user]);

  const [settings, setSettings] = useState({
    sidebarNotifications: true,
    theme: 'dark'
  });

  useEffect(() => {
    const stored = localStorage.getItem('app-settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('app-settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateUser = useCallback((userData) => {
    const currentUser = getStoredUser();
    const updatedUser = { ...currentUser, ...userData };
    // We keep the existing token
    const token = getToken();
    setAuth(token, updatedUser);
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, settings, updateSettings, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
