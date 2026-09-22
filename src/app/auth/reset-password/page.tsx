'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

function useSupabase(): SupabaseClient | null {
  const [client] = useState(() => createClient());
  return client;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { isConfigured } = useAuth();
  const supabase = useSupabase();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // 邮件链接进入时：用链接里的凭证换登录态
  useEffect(() => {
    if (!supabase) {
      setStatus('error');
      setStatusMessage('登录服务尚未配置');
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const tokenHash = params.get('token_hash');
    const type = params.get('type');

    const exchange = async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type === 'recovery') {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
          if (error) throw error;
        } else {
          // 没有链接凭证：检查是否已登录（例如已登录用户手动访问）
          const { data } = await supabase.auth.getUser();
          if (!data.user) {
            setStatus('error');
            setStatusMessage('链接无效或已过期，请重新发起找回密码');
            return;
          }
        }
        setStatus('ready');
      } catch {
        setStatus('error');
        setStatusMessage('链接无效或已过期，请重新发起找回密码');
      }
    };
    exchange();
  }, [supabase]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('密码至少 8 位');
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('密码需同时包含字母和数字');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase!.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError('密码更新失败，请稍后重试');
      return;
    }
    setDone(true);
  };

  const base = typeof window !== 'undefined' && window.location.pathname.startsWith('/staging') ? '/staging' : '';

  if (status === 'loading') {
    return (
      <div className="w-full max-w-md mx-auto text-center py-16 text-[var(--text-secondary)]">
        正在验证链接…
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🔐</div>
        <h1 className="text-3xl font-bold mb-2">设置新密码</h1>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          为您的账号设置一个新密码
        </p>
      </div>

      {done ? (
        <div className="card-jade p-6 md:p-8 space-y-5" style={{ background: 'var(--bg-card)' }}>
          <div className="text-sm leading-relaxed text-[var(--text-accent)] bg-[var(--bg-highlight)] border border-[var(--border-accent)] rounded-lg px-3 py-2">
            ✅ 密码已更新成功
          </div>
          <button
            onClick={() => router.push(`${base}/auth/login`)}
            className="btn-jade w-full"
            type="button"
          >
            去登录
          </button>
        </div>
      ) : status === 'error' ? (
        <div className="card-jade p-6 md:p-8 space-y-5" style={{ background: 'var(--bg-card)' }}>
          <div role="alert" className="text-sm leading-relaxed text-red-500 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">
            {statusMessage}
          </div>
          <a
            href={`${base}/auth/forgot`}
            className="btn-jade w-full text-center inline-flex items-center justify-center"
          >
            重新发起找回密码
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-jade p-6 md:p-8 space-y-5" style={{ background: 'var(--bg-card)' }}>
          {!isConfigured && (
            <div className="text-sm text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              登录服务尚未配置，暂时无法提交
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="new-password">新密码</label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); setError(''); }}
              placeholder="至少 8 位，同时包含字母和数字"
              autoComplete="new-password"
              className="input-jade"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="confirm-password">确认新密码</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => { setConfirmPassword(event.target.value); setError(''); }}
              placeholder="请再次输入新密码"
              autoComplete="new-password"
              className="input-jade"
              required
            />
          </div>

          {error && (
            <div role="alert" className="text-sm leading-relaxed text-red-500 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting || !isConfigured} className="btn-jade">
            {submitting ? '更新中…' : '确认修改密码'}
          </button>
        </form>
      )}
    </div>
  );
}
