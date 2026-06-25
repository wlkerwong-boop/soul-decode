'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export const DEV_VERIFY_CODE = '888888';
export const USER_STORAGE_KEY = 'soul_decode_user';

export interface User {
  phone: string;
  nickname: string;
  registerTime: string;
  loginTime: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (phone: string, code: string) => Promise<{ ok: boolean; message?: string }>;
  register: (phone: string, code: string, nickname: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  updateNickname: (nickname: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

function normalizePhone(phone: string): string {
  return phone.replace(/\s/g, '');
}

function loadUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.phone || !parsed.nickname) return null;
    return parsed as User;
  } catch {
    return null;
  }
}

function saveUserToStorage(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(loadUserFromStorage());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (phone: string, code: string) => {
    const normalized = normalizePhone(phone);
    if (!isValidPhone(normalized)) {
      return { ok: false, message: '请输入有效的11位手机号' };
    }
    if (code !== DEV_VERIFY_CODE) {
      return { ok: false, message: '验证码错误，开发期固定为 888888' };
    }

    // Auto-register if not found (seamless UX)
    const existing = loadUserFromStorage();
    if (existing && existing.phone === normalized) {
      const updated: User = {
        ...existing,
        loginTime: new Date().toISOString(),
      };
      saveUserToStorage(updated);
      setUser(updated);
      return { ok: true };
    }

    // Auto-create user on first login
    const now = new Date().toISOString();
    const newUser: User = {
      phone: normalized,
      nickname: normalized.slice(0, 3) + '****' + normalized.slice(-4),
      registerTime: now,
      loginTime: now,
    };
    saveUserToStorage(newUser);
    setUser(newUser);
    return { ok: true };
  }, []);

  const register = useCallback(async (phone: string, code: string, nickname: string) => {
    const normalized = normalizePhone(phone);
    const trimmedNickname = nickname.trim();

    if (!isValidPhone(normalized)) {
      return { ok: false, message: '请输入有效的11位手机号' };
    }
    if (code !== DEV_VERIFY_CODE) {
      return { ok: false, message: '验证码错误，开发期固定为 888888' };
    }
    if (!trimmedNickname || trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      return { ok: false, message: '昵称长度需在 2-20 个字符之间' };
    }

    const existing = loadUserFromStorage();
    if (existing && existing.phone === normalized) {
      return { ok: false, message: '该手机号已注册，请直接登录' };
    }

    const now = new Date().toISOString();
    const newUser: User = {
      phone: normalized,
      nickname: trimmedNickname,
      registerTime: now,
      loginTime: now,
    };
    saveUserToStorage(newUser);
    setUser(newUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  const updateNickname = useCallback((nickname: string) => {
    const trimmed = nickname.trim();
    if (!user || !trimmed || trimmed.length < 2 || trimmed.length > 20) return;
    const updated: User = { ...user, nickname: trimmed };
    saveUserToStorage(updated);
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        updateNickname,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
