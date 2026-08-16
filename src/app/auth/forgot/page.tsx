'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/components/AuthContext';
import { isValidEmail, normalizeEmail } from '@/lib/email-auth';

export default function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSent(false);

    if (!isValidEmail(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);

    if (!result.ok) {
      setError(result.message || '发送失败，请稍后重试');
      return;
    }
    setSent(true);
  };

  const base = typeof window !== 'undefined' && window.location.pathname.startsWith('/staging') ? '/staging' : '';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🔑</div>
        <h1 className="text-3xl font-bold mb-2">找回密码</h1>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          输入注册时使用的邮箱，我们会发送一封密码重置邮件
        </p>
      </div>

      {sent ? (
        <div className="card-jade p-6 md:p-8 space-y-5" style={{ background: 'var(--bg-card)' }}>
          <div className="text-sm leading-relaxed text-[var(--text-accent)] bg-[var(--bg-highlight)] border border-[var(--border-accent)] rounded-lg px-3 py-2">
            📮 重置邮件已发送至 {normalizeEmail(email)}
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            请查收邮件（如果不在收件箱，请检查垃圾邮件文件夹），点击邮件中的链接即可设置新密码。链接约 1 小时内有效。
          </p>
          <button
            onClick={() => setSent(false)}
            className="btn-jade w-full"
            type="button"
          >
            重新发送
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-jade p-6 md:p-8 space-y-5" style={{ background: 'var(--bg-card)' }}>
          {!isConfigured && (
            <div className="text-sm text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              登录服务尚未配置，暂时无法提交
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setError(''); }}
              placeholder="请输入注册邮箱"
              autoComplete="email"
              className="input-jade"
              required
            />
          </div>

          {error && (
            <div role="alert" className="text-sm leading-relaxed text-red-500 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !isConfigured} className="btn-jade">
            {loading ? '发送中…' : '发送重置邮件'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        <a href={`${base}/auth/login`} className="text-[var(--text-accent)] font-medium hover:underline">
          ← 返回登录
        </a>
      </div>
    </div>
  );
}
