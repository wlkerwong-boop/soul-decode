'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, DEV_VERIFY_CODE } from '@/components/AuthContext';

interface PhoneAuthFormProps {
  mode: 'login' | 'register';
}

export default function PhoneAuthForm({ mode }: PhoneAuthFormProps) {
  const router = useRouter();
  const { login, register, isLoggedIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/my');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = () => {
    const normalized = phone.replace(/\s/g, '');
    if (!/^1[3-9]\d{9}$/.test(normalized)) {
      setError('请输入有效的11位手机号');
      return;
    }
    setError('');
    setCountdown(60);
    // 开发期直接提示固定验证码
    setTimeout(() => {
      setCode(DEV_VERIFY_CODE);
    }, 400);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result =
        mode === 'login'
          ? await login(phone, code)
          : await register(phone, code, nickname);

      if (!result.ok) {
        setError(result.message || '操作失败，请重试');
      } else {
        router.push('/my');
      }
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">{isRegister ? '🌱' : '🔮'}</div>
        <h1 className="text-3xl font-bold mb-2">
          {isRegister ? '注册灵魂解码' : '登录灵魂解码'}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {isRegister
            ? '创建账号，保存你的报告与成长档案'
            : '欢迎回来，查看你的个人档案与历史报告'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card-jade p-6 md:p-8 space-y-5"
        style={{ background: 'var(--bg-card)' }}
      >
        {isRegister && (
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="nickname">
              昵称
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="2-20 个字符"
              maxLength={20}
              className="input-jade"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="phone">
            手机号
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 11);
              setPhone(v);
              if (error) setError('');
            }}
            placeholder="请输入 11 位手机号"
            className="input-jade"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="code">
            验证码
          </label>
          <div className="flex gap-3">
            <input
              id="code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(v);
                if (error) setError('');
              }}
              placeholder="6 位验证码"
              className="input-jade"
              required
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={countdown > 0 || phone.length !== 11}
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-highlight)] border border-[var(--border-accent)] text-[var(--text-accent)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(74,124,111,0.12)] transition-colors whitespace-nowrap"
            >
              {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
            </button>
          </div>
          <p className="text-xs text-[var(--text-secondary)] opacity-70 mt-2">
            开发期验证码固定为：<span className="font-mono font-bold text-[var(--text-accent)]">{DEV_VERIFY_CODE}</span>
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || phone.length !== 11 || code.length !== 6 || (isRegister && !nickname.trim())}
          className="btn-jade"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              处理中…
            </span>
          ) : isRegister ? (
            '注册并登录'
          ) : (
            '登录'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        {isRegister ? (
          <>
            已有账号？
            <a href="/auth/login" className="text-[var(--text-accent)] font-medium hover:underline">
              直接登录
            </a>
          </>
        ) : (
          <>
            还没有账号？
            <a href="/auth/register" className="text-[var(--text-accent)] font-medium hover:underline">
              立即注册
            </a>
          </>
        )}
      </div>
    </div>
  );
}
