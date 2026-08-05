'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import {
  isValidEmail,
  normalizeEmail,
  validateRegistration,
} from '@/lib/email-auth';

interface EmailAuthFormProps {
  mode: 'login' | 'register';
}

export default function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const router = useRouter();
  const {
    login,
    register,
    resendVerification,
    isLoggedIn,
    isConfigured,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [awaitingVerification, setAwaitingVerification] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === '1') setNotice('邮箱验证成功，您已安全登录');
    if (params.get('error') === 'verification') setError('验证链接无效或已过期，请重新注册或重发邮件');
    if (params.get('error') === 'config') setError('登录服务尚未完成配置');
  }, []);

  useEffect(() => {
    if (isLoggedIn && !awaitingVerification) router.replace('/my');
  }, [awaitingVerification, isLoggedIn, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!isValidEmail(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }
    if (mode === 'register') {
      const validationError = validateRegistration({
        email,
        password,
        confirmPassword,
        nickname,
      });
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setLoading(true);
    const result = mode === 'login'
      ? await login(email, password)
      : await register(email, password, nickname);
    setLoading(false);

    if (!result.ok) {
      setError(result.message || '操作失败，请稍后重试');
      return;
    }
    if (result.requiresEmailVerification) {
      setAwaitingVerification(true);
      setNotice(`验证邮件已发送至 ${normalizeEmail(email)}，请点击邮件中的链接完成注册`);
      return;
    }
    router.push('/my');
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    const result = await resendVerification(email);
    setLoading(false);
    if (result.ok) setNotice('验证邮件已重新发送，请检查收件箱和垃圾邮件目录');
    else setError(result.message || '邮件发送失败，请稍后重试');
  };

  const isRegister = mode === 'register';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">{isRegister ? '🌱' : '🔮'}</div>
        <h1 className="text-3xl font-bold mb-2">
          {isRegister ? '注册灵魂解码' : '登录灵魂解码'}
        </h1>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          {isRegister
            ? '使用您的常用邮箱创建账号，保存报告与成长档案'
            : '欢迎回来，查看您的个人档案与历史报告'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card-jade p-6 md:p-8 space-y-5"
        style={{ background: 'var(--bg-card)' }}
      >
        {!isConfigured && (
          <div className="text-sm text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            登录服务尚未配置，暂时无法提交
          </div>
        )}

        {isRegister && (
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="nickname">昵称</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="2-20 个字符"
              maxLength={20}
              autoComplete="nickname"
              className="input-jade"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="email">邮箱</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError('');
            }}
            placeholder="QQ、Gmail、Outlook、163 等邮箱"
            autoComplete="email"
            className="input-jade"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="password">密码</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError('');
            }}
            placeholder={isRegister ? '至少 8 位，同时包含字母和数字' : '请输入密码'}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            className="input-jade"
            required
          />
        </div>

        {isRegister && (
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="confirm-password">确认密码</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError('');
              }}
              placeholder="请再次输入密码"
              autoComplete="new-password"
              className="input-jade"
              required
            />
          </div>
        )}

        {error && (
          <div role="alert" className="text-sm leading-relaxed text-red-500 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {notice && (
          <div aria-live="polite" className="text-sm leading-relaxed text-[var(--text-accent)] bg-[var(--bg-highlight)] border border-[var(--border-accent)] rounded-lg px-3 py-2">
            {notice}
          </div>
        )}

        {awaitingVerification ? (
          <button type="button" onClick={handleResend} disabled={loading} className="btn-jade">
            {loading ? '发送中…' : '重新发送验证邮件'}
          </button>
        ) : (
          <button type="submit" disabled={loading || !isConfigured} className="btn-jade">
            {loading ? '处理中…' : isRegister ? '注册并发送验证邮件' : '登录'}
          </button>
        )}
      </form>

      <a
        href="/master-report"
        className="mt-4 flex items-center justify-center w-full rounded-xl border border-[var(--border-accent)] bg-[var(--bg-highlight)] px-5 py-3 text-sm font-semibold text-[var(--text-accent)] hover:opacity-90 transition-opacity"
      >
        ✦ 无需登录，直接进入人生总览排盘
      </a>

      <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        {isRegister ? (
          <>已有账号？<a href="/auth/login" className="text-[var(--text-accent)] font-medium hover:underline">直接登录</a></>
        ) : (
          <>还没有账号？<a href="/auth/register" className="text-[var(--text-accent)] font-medium hover:underline">立即注册</a></>
        )}
      </div>
    </div>
  );
}
