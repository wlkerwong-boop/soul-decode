'use client';

import { useState, useEffect } from 'react';

interface DailyFortuneProps {
  dayMaster?: string;
  dayMasterElement?: string;
  pillars?: string[];
  zodiac?: string;
}

export default function DailyFortune({ dayMaster, dayMasterElement, pillars, zodiac }: DailyFortuneProps) {
  const [fortune, setFortune] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [today, setToday] = useState('');

  useEffect(() => {
    const d = new Date();
    setToday(`${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`);
  }, []);

  const handleGenerate = async () => {
    if (!dayMaster) {
      setError('请先生成八字报告，再查看每日运势');
      return;
    }
    setLoading(true);
    setError('');
    setFortune('');

    try {
      const res = await fetch('/api/daily-fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayMaster, dayMasterElement, pillars, zodiac }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFortune(data.fortune);
      setGenerated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-jade overflow-hidden" style={{ background: 'var(--bg-card)' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌅</span>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">每日运势</h3>
            <p className="text-[10px] text-[var(--text-secondary)] opacity-70">{today || '加载中...'}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        {!generated && !loading && (
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {dayMaster
                ? '基于你的八字日主，生成今日专属运势指引'
                : '请先生成八字报告，即可查看每日运势'}
            </p>
            {dayMaster && (
              <button
                onClick={handleGenerate}
                className="btn-jade inline-flex items-center justify-center px-6 py-2.5 text-sm"
                style={{ width: 'auto' }}
              >
                🌅 查看今日运势
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-6">
            <div className="cosmic-loader mx-auto mb-4" style={{ width: 48, height: 48 }}>
              <div className="cosmic-ring cosmic-ring-3" style={{ width: '100%', height: '100%' }} />
              <div className="cosmic-center text-xs">✦</div>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">正在推演今日运势...</p>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2 mb-3">
            {error}
          </div>
        )}

        {fortune && (
          <div className="space-y-3">
            {fortune.split(/【([^】]+)】/).filter(Boolean).map((part, i) => {
              if (i % 2 === 1) {
                return (
                  <div key={i}>
                    <h4 className="text-sm font-bold text-[var(--text-accent)] mb-1">{part}</h4>
                  </div>
                );
              }
              return (
                <p key={i} className="text-sm text-[var(--text-primary)] leading-relaxed">{part.trim()}</p>
              );
            })}
          </div>
        )}

        {generated && (
          <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="text-xs text-[var(--text-accent)] hover:underline"
            >
              🔄 重新生成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
