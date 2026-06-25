'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';

const zodiacData = [
  { sign: 'rat', label: '鼠' }, { sign: 'ox', label: '牛' }, { sign: 'tiger', label: '虎' },
  { sign: 'rabbit', label: '兔' }, { sign: 'dragon', label: '龙' }, { sign: 'snake', label: '蛇' },
  { sign: 'horse', label: '马' }, { sign: 'goat', label: '羊' }, { sign: 'monkey', label: '猴' },
  { sign: 'rooster', label: '鸡' }, { sign: 'dog', label: '狗' }, { sign: 'pig', label: '猪' },
];

export default function DailyPage() {
  const { user, isLoggedIn } = useAuth();
  const [zodiac, setZodiac] = useState('');
  const [fortune, setFortune] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [today, setToday] = useState('');

  useEffect(() => {
    const d = new Date();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    setToday(`${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekDays[d.getDay()]}`);
  }, []);

  const handleGenerate = async () => {
    if (!zodiac) { setError('请选择您的生肖'); return; }
    setLoading(true);
    setError('');
    setFortune('');

    try {
      const res = await fetch('/api/daily-zodiac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zodiac }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFortune(data.fortune);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-16 px-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-3xl mb-3">🌅</div>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">每日运势</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {today || '加载中...'} · 基于生肖的每日指引
        </p>
      </div>

      {/* Zodiac selector */}
      <div className="max-w-md mx-auto mb-8">
        <div className="grid grid-cols-4 gap-2">
          {zodiacData.map(z => (
            <button
              key={z.sign}
              onClick={() => { setZodiac(z.sign); setFortune(''); setError(''); }}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                zodiac === z.sign
                  ? 'bg-[var(--text-accent)] text-white shadow-md'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-accent)]'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      {zodiac && !fortune && !loading && (
        <div className="text-center mb-8">
          <button onClick={handleGenerate} className="btn-jade max-w-xs mx-auto inline-flex" style={{ width: 'auto' }}>
            🌅 查看{['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig'][zodiacData.findIndex(z=>z.sign===zodiac)]}今日运势
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="cosmic-loader mx-auto mb-6" style={{ width: 60, height: 60 }}>
            <div className="cosmic-ring cosmic-ring-3" style={{ width: '100%', height: '100%' }} />
            <div className="cosmic-center text-sm">✦</div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">正在推演运势...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-md mx-auto mb-4 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/15 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Fortune display */}
      {fortune && (
        <div className="card-jade p-6 md:p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🌅</span>
            <div>
              <h2 className="text-lg font-bold">{zodiacData.find(z=>z.sign===zodiac)?.label} · 今日运势</h2>
              <p className="text-xs text-[var(--text-secondary)]">{today}</p>
            </div>
          </div>
          <div className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
            {fortune}
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex justify-between">
            <button onClick={handleGenerate} disabled={loading} className="text-xs text-[var(--text-accent)] hover:underline">
              🔄 重新生成
            </button>
            <button
              onClick={() => { setFortune(''); setError(''); }}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              换一个生肖
            </button>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      {!isLoggedIn && (
        <div className="text-center mt-10">
          <p className="text-xs text-[var(--text-secondary)] opacity-60 mb-2">
            登录后可基于八字生成更精准的每日运势
          </p>
          <a href="/auth/login" className="text-sm text-[var(--text-accent)] hover:underline">
            登录 →
          </a>
        </div>
      )}
    </div>
  );
}
