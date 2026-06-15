'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getReport, getReportAdmin, type Report } from '@/lib/report-store';
import TTSReader from '@/components/TTSReader';

export default function CasePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to find the report from localStorage (for just-saved reports)
    const savedId = sessionStorage.getItem('last-report-id');
    const savedPwd = sessionStorage.getItem('last-report-password');

    if (savedId === id && savedPwd) {
      const r = getReport(id, savedPwd);
      if (r) {
        setReport(r);
        setLoading(false);
        return;
      }
    }

    // Check if admin (password in session)
    const adminPwd = sessionStorage.getItem('admin-password');
    if (adminPwd) {
      const r = getReport(id, adminPwd);
      if (r) {
        setReport(r);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
  }, [id]);

  const handleAccess = () => {
    if (!password.trim()) { setError('请输入密码'); return; }
    const r = getReport(id, password);
    if (!r) { setError('密码错误或报告不存在'); return; }
    setReport(r);
    setError('');
    sessionStorage.setItem('last-report-password', password);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--text-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold mb-2">私密报告</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              此报告需要密码才能查看
            </p>
            <div className="p-6 rounded-xl border border-[var(--border-color)] bg-black/30">
              <div className="text-xs text-[var(--text-secondary)] mb-3 text-center">报告ID：{id}</div>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAccess()}
                placeholder="输入查看密码"
                className="w-full p-3 rounded-lg bg-black/40 border border-[var(--border-color)] text-white text-center mb-3 focus:border-[var(--text-accent)] outline-none"
                autoFocus
              />
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              <button onClick={handleAccess} className="w-full py-3 bg-[var(--text-accent)] text-black font-bold rounded-lg hover:opacity-90 transition-all">
                查看报告
              </button>
            </div>
            <div className="mt-6">
              <a href="/my" className="text-sm text-[var(--text-accent)] hover:underline">← 返回我的档案</a>
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="tag-pill text-xs tracking-widest mb-3 inline-block">
              {report.meta.type === 'health' ? '🀄 实战案例' :
               report.meta.type === 'bazi' ? '🔮 八字命理' :
               report.meta.type === 'mbti' ? '🧠 MBTI' : '✨ 占星'}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{report.meta.title}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{new Date(report.meta.date).toLocaleString('zh-CN')}</p>
          </div>

          {/* Report Content */}
          <div className="p-8 rounded-xl border border-[var(--border-color)] bg-black/30 backdrop-blur-sm mb-6">
            <div className="flex justify-end mb-4">
              <TTSReader text={report.content.replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\n/g, '，')} label="🎧 听报告" />
            </div>
            <div className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap text-sm">
              {report.content}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <a href="/my" className="px-4 py-2 border border-[var(--border-color)] text-sm text-[var(--text-secondary)] rounded-lg hover:border-[var(--text-accent)] transition-all">
              ← 返回档案
            </a>
            <a href="/health" className="px-4 py-2 bg-[var(--text-accent)] text-black text-sm font-bold rounded-lg hover:opacity-90 transition-all">
              再做健康评测
            </a>
          </div>
        </div>
      </div>
  );
}
