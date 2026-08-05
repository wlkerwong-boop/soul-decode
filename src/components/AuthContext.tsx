'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { normalizeEmail, translateAuthError } from '@/lib/email-auth';
import { toAppUser, type AppUser } from '@/lib/auth-user';
import { createClient } from '@/lib/supabase/client';

export const USER_STORAGE_KEY = 'soul_decode_user';

interface AuthResult {
  ok: boolean;
  message?: string;
  requiresEmailVerification?: boolean;
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, nickname: string) => Promise<AuthResult>;
  resendVerification: (email: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function saveCompatibilityUser(user: AppUser | null) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_STORAGE_KEY);
}

function emailRedirectTo() {
  return `${window.location.origin}/auth/callback?next=/my`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const nextUser = data.user ? toAppUser(data.user) : null;
      setUser(nextUser);
      saveCompatibilityUser(nextUser);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ? toAppUser(session.user) : null;
      setUser(nextUser);
      saveCompatibilityUser(nextUser);
      setIsLoading(false);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: '登录服务尚未配置' };

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) return { ok: false, message: translateAuthError(error.message || error.code || '') };

    const nextUser = data.user ? toAppUser(data.user) : null;
    setUser(nextUser);
    saveCompatibilityUser(nextUser);
    return { ok: true };
  }, [supabase]);

  const register = useCallback(async (
    email: string,
    password: string,
    nickname: string
  ): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: '注册服务尚未配置' };

    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: {
        emailRedirectTo: emailRedirectTo(),
        data: {
          nickname: nickname.trim(),
          source_site: 'soulcode',
        },
      },
    });

    if (error) return { ok: false, message: translateAuthError(error.message || error.code || '') };
    if (data.user?.identities?.length === 0) {
      return { ok: false, message: '该邮箱已注册，请直接登录' };
    }

    return {
      ok: true,
      requiresEmailVerification: !data.session,
    };
  }, [supabase]);

  const resendVerification = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: '验证邮件服务尚未配置' };
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizeEmail(email),
      options: { emailRedirectTo: emailRedirectTo() },
    });
    return error
      ? { ok: false, message: translateAuthError(error.message || error.code || '') }
      : { ok: true };
  }, [supabase]);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    saveCompatibilityUser(null);
    setUser(null);
  }, [supabase]);

  const updateNickname = useCallback(async (nickname: string): Promise<AuthResult> => {
    const trimmed = nickname.trim();
    if (!supabase || !user || trimmed.length < 2 || trimmed.length > 20) {
      return { ok: false, message: '昵称长度需在 2-20 个字符之间' };
    }
    const { data, error } = await supabase.auth.updateUser({ data: { nickname: trimmed } });
    if (error) return { ok: false, message: translateAuthError(error.message || error.code || '') };
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ nickname: trimmed })
      .eq('auth_id', data.user.id);
    if (profileError) return { ok: false, message: '昵称暂时无法保存，请稍后再试' };
    const nextUser = toAppUser(data.user);
    setUser(nextUser);
    saveCompatibilityUser(nextUser);
    return { ok: true };
  }, [supabase, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: Boolean(user),
        isConfigured: Boolean(supabase),
        login,
        register,
        resendVerification,
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
