'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveReport, type ReportType } from '@/lib/report-store';

interface Props {
  content: string;
  reportType: ReportType;
  defaultTitle: string;
  existingId?: string;
}

export default function SaveToArchive({ content, reportType, defaultTitle, existingId }: Props) {
  const router = useRouter();
  const [showSave, setShowSave] = useState(false);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState(defaultTitle);
  const [saved, setSaved] = useState(false);
  const [reportId, setReportId] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!password.trim() || password.length < 4) {
      setError('密码至少4位');
      return;
    }
    if (!title.trim()) {
      setError('请输入报告标题');
      return;
    }
    try {
      const report = saveReport(content, reportType, title, password, existingId);
      setReportId(report.meta.id);
      setSaved(true);
      setError('');
      sessionStorage.setItem('last-report-id', report.meta.id);
      sessionStorage.setItem('last-report-password', password);
      sessionStorage.setItem('my-report-just-saved', 'true');
    } catch (e: any) {
      setError('保存失败：' + e.message);
    }
  };

  return (
    <div className="p-6 rounded-xl border border-[var(--text-accent)]/20 bg-[var(--text-accent)]/5 backdrop-blur-sm mb-6">
      {!showSave && !saved && (
        <div className="text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            🔐 将此报告保存到您的健康档案
          </p>
          <button
            onClick={() => setShowSave(true)}
            className="px-5 py-2 border border-[var(--text-accent)] text-[var(--text-accent)] text-sm rounded-lg hover:bg-[var(--text-accent)]/10 transition-all"
          >
            保存到我的档案
          </button>
        </div>
      )}

      {showSave && !saved && (
        <div>
          <h3 className="text-sm font-bold text-[var(--text-accent)] mb-3">📁 保存到我的健康档案</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">报告标题</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-black/40 border border-[var(--border-color)] text-white text-sm focus:border-[var(--text-accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">设置查看密码（至少4位）</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="例如：你的生日或自定义密码"
                className="w-full p-2.5 rounded-lg bg-black/40 border border-[var(--border-color)] text-white text-sm focus:border-[var(--text-accent)] outline-none"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button onClick={handleSave} className="px-4 py-2 bg-[var(--text-accent)] text-black text-sm font-bold rounded-lg hover:opacity-90 transition-all">
                保存
              </button>
              <button onClick={() => setShowSave(false)} className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-secondary)] text-sm rounded-lg hover:border-[var(--text-accent)] transition-all">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {saved && (
        <div className="text-center">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-sm font-bold text-green-400 mb-1">保存成功！</p>
          <p className="text-xs text-[var(--text-secondary)] mb-1">报告ID：<span className="text-[var(--text-accent)] font-mono">{reportId}</span></p>
          <p className="text-xs text-[var(--text-secondary)] mb-3">请牢记您的密码，后续查看需要使用</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => router.push('/my')}
              className="px-4 py-2 bg-[var(--text-accent)] text-black text-xs font-bold rounded-lg hover:opacity-90 transition-all"
            >
              查看我的档案
            </button>
            <button
              onClick={() => { setShowSave(false); setSaved(false); setPassword(''); }}
              className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-secondary)] text-xs rounded-lg hover:border-[var(--text-accent)] transition-all"
            >
              继续浏览
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
