'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserReports, getReportTypeLabel, isAdminPassword, getPresetCases, type ReportMeta } from '@/lib/report-store';
import CosmicBackground from '@/components/CosmicBackground';

export default function MyPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [reports, setReports] = useState<ReportMeta[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [presetCases, setPresetCases] = useState<ReportMeta[]>([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'my' | 'admin'>('my');

  const handleLogin = () => {
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }
    const userReports = getUserReports(password);
    if (userReports.length === 0 && !isAdminPassword(password)) {
      setError('密码错误或暂无报告');
      return;
    }
    setReports(userReports);
    setLoggedIn(true);
    setIsAdmin(isAdminPassword(password));
    if (isAdminPassword(password)) {
      setPresetCases(getPresetCases(password));
    }
    setError('');
  };

  // Check if user just completed an assessment
  useEffect(() => {
    const justSaved = sessionStorage.getItem('my-report-just-saved');
    if (justSaved) {
      sessionStorage.removeItem('my-report-just-saved');
    }
  }, []);

  if (!loggedIn) {
    return (
      <div className="relative min-h-screen">
        <CosmicBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold mb-2">我的健康档案</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
              输入您在健康评测时设置的查看密码
            </p>
            <div className="p-6 rounded-xl border border-[var(--border-color)] bg-black/30">
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="输入查看密码"
                className="w-full p-3 rounded-lg bg-black/40 border border-[var(--border-color)] text-white text-center mb-4 focus:border-[var(--text-accent)] outline-none"
                autoFocus
              />
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              <button onClick={handleLogin} className="w-full py-3 bg-[var(--text-accent)] text-black font-bold rounded-lg hover:opacity-90 transition-all">
                查看我的档案
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-4 opacity-50">
              首次使用？完成健康评测或八字分析后，系统会提示您设置密码
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <CosmicBackground />
      <div className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="tag-pill text-xs tracking-widest mb-4 inline-block">🔐 我的健康档案</span>
            <h1 className="text-3xl font-bold mb-2">我的报告</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              共 {reports.length + (isAdmin ? presetCases.length : 0)} 份报告
            </p>
          </div>

          {/* Tabs (only show admin tab for admin) */}
          {isAdmin && (
            <div className="flex gap-4 mb-6 justify-center">
              <button onClick={() => setTab('my')} className={`px-4 py-2 rounded-lg text-sm transition-all ${tab === 'my' ? 'bg-[var(--text-accent)] text-black font-bold' : 'border border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                我的报告
              </button>
              <button onClick={() => setTab('admin')} className={`px-4 py-2 rounded-lg text-sm transition-all ${tab === 'admin' ? 'bg-[var(--text-accent)] text-black font-bold' : 'border border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                管理员 · 预设案例
              </button>
            </div>
          )}

          {/* Admin presets */}
          {isAdmin && tab === 'admin' && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[var(--text-accent)] mb-3">📋 预设案例（内部参考）</h2>
              <div className="space-y-3">
                {presetCases.map((report) => (
                  <div key={report.id} className="p-4 rounded-xl border border-[var(--border-color)] bg-black/30 hover:border-[var(--text-accent)] transition-all cursor-pointer"
                    onClick={() => router.push(`/my/cases/${report.id}`)}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--text-accent)]/10 text-[var(--text-accent)]">{getReportTypeLabel(report.type)}</span>
                        <span className="text-xs text-[var(--text-secondary)] ml-2">{new Date(report.date).toLocaleDateString('zh-CN')}</span>
                      </div>
                      <span className="text-[var(--text-accent)] text-sm">→</span>
                    </div>
                    <div className="font-bold text-sm mt-1">{report.title}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">{report.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User reports */}
          <div className="space-y-3">
            {reports.length === 0 && !isAdmin && (
              <div className="text-center py-12 text-[var(--text-secondary)]">
                <div className="text-3xl mb-3">📄</div>
                <p>暂无报告</p>
                <p className="text-sm mt-2">完成健康评测或八字分析后，报告会自动保存到这里</p>
                <div className="flex gap-3 justify-center mt-4">
                  <button onClick={() => router.push('/health')} className="px-4 py-2 border border-[var(--border-color)] text-sm rounded-lg hover:border-[var(--text-accent)] transition-all">
                    去做健康评测
                  </button>
                  <button onClick={() => router.push('/')} className="px-4 py-2 border border-[var(--border-color)] text-sm rounded-lg hover:border-[var(--text-accent)] transition-all">
                    去做八字分析
                  </button>
                </div>
              </div>
            )}
            {reports.map((report) => (
              <div key={report.id} className="p-4 rounded-xl border border-[var(--border-color)] bg-black/30 hover:border-[var(--text-accent)] transition-all cursor-pointer"
                onClick={() => router.push(`/my/cases/${report.id}`)}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--text-accent)]/10 text-[var(--text-accent)]">{getReportTypeLabel(report.type)}</span>
                    <span className="text-xs text-[var(--text-secondary)] ml-2">{new Date(report.date).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <span className="text-[var(--text-accent)] text-sm">→</span>
                </div>
                <div className="font-bold text-sm mt-1">{report.title}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{report.summary}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button onClick={() => { setLoggedIn(false); setPassword(''); }} className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
              退出 · 切换账号
            </button>
            <span className="mx-3 text-[var(--text-secondary)] opacity-30">|</span>
            <a href="/" className="text-sm text-[var(--text-accent)] hover:underline">返回首页</a>
          </div>
        </div>
      </div>
    </div>
  );
}
