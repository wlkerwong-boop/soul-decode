'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { getAllReports, getReportTypeLabel, type ReportMeta } from '@/lib/report-store';
import { useState } from 'react';

export default function MyPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const [reports, setReports] = useState<ReportMeta[]>([]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/auth/login');
      return;
    }
    if (isLoggedIn) {
      setReports(getAllReports());
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <div className="spinner mb-4" />
        <p className="text-sm text-[var(--text-secondary)]">{isLoading ? '加载中…' : '请先登录'}</p>
      </div>
    );
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const maskPhone = (phone: string) => `${phone.slice(0, 3)}****${phone.slice(-4)}`;

  return (
    <div className="py-12 md:py-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="tag-pill text-xs tracking-widest mb-4 inline-block">📁 我的灵魂档案</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">个人中心</h1>
          <p className="text-sm text-[var(--text-secondary)]">管理你的账号信息与历史报告</p>
        </div>

        {/* Profile Card */}
        <div className="card-jade p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(74,124,111,0.15), rgba(201,160,110,0.15))',
                border: '1px solid var(--border-accent)',
                color: 'var(--text-accent)',
              }}
            >
              {user.nickname.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                <h2 className="text-xl font-bold">{user.nickname}</h2>
                <span className="text-sm text-[var(--text-secondary)]">{maskPhone(user.phone)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="px-3 py-2 rounded-lg bg-[var(--bg-highlight)]">
                  <span className="text-[var(--text-secondary)]">注册时间：</span>
                  <span className="text-[var(--text-primary)]">{formatTime(user.registerTime)}</span>
                </div>
                <div className="px-3 py-2 rounded-lg bg-[var(--bg-highlight)]">
                  <span className="text-[var(--text-secondary)]">最近登录：</span>
                  <span className="text-[var(--text-primary)]">{formatTime(user.loginTime)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="px-5 py-2.5 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-500/5 transition-colors shrink-0"
            >
              退出登录
            </button>
          </div>
        </div>

        {/* Reports Section */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold">历史报告</h3>
          <span className="text-sm text-[var(--text-secondary)]">共 {reports.length} 份</span>
        </div>

        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="card-jade p-10 text-center">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-[var(--text-secondary)] mb-2">暂无报告</p>
              <p className="text-sm text-[var(--text-secondary)] opacity-70 mb-6">
                完成健康评测、八字分析或其他测评后，报告会自动保存到这里
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href="/health"
                  className="px-5 py-2 rounded-lg border border-[var(--border-color)] text-sm hover:border-[var(--text-accent)] transition-colors"
                >
                  去做健康评测
                </a>
                <a
                  href="/"
                  className="px-5 py-2 rounded-lg bg-[var(--text-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  去做八字分析
                </a>
              </div>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="card-jade p-4 md:p-5 cursor-pointer hover:border-[var(--text-accent)] transition-colors"
                onClick={() => router.push(`/my/cases/${report.id}`)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-highlight)] text-[var(--text-accent)]">
                        {getReportTypeLabel(report.type)}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        {new Date(report.date).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <h4 className="font-bold text-base mb-1 truncate">{report.title}</h4>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{report.summary}</p>
                  </div>
                  <span className="text-[var(--text-accent)] text-lg shrink-0">→</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
