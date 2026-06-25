'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { isUserPremium } from '@/lib/access-control';

interface PersonForm {
  name: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: string;
}

const emptyPerson: PersonForm = { name: '', year: '', month: '', day: '', hour: '', gender: '' };
const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

export default function CompatibilityPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [p1, setP1] = useState<PersonForm>({ ...emptyPerson, name: '我' });
  const [p2, setP2] = useState<PersonForm>(emptyPerson);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1.year || !p1.month || !p1.day || !p2.year || !p2.month || !p2.day) {
      setError('请填写双方完整的出生日期');
      return;
    }

    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    // Check if paid
    const premium = isUserPremium();
    if (!premium) {
      router.push('/payment');
      return;
    }

    setError('');
    setReport('');
    setStep('loading');
    setLoading(true);

    try {
      // Get bazi data for both persons (simplified - call the API)
      const res = await fetch('/api/compatibility-decoded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1: { ...p1 },
          person2: { ...p2 },
        }),
      });

      if (!res.ok) throw new Error('合盘生成失败');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let buf = '', full = '';
      setStep('result');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const d = JSON.parse(line.slice(6));
            if (d.content) { full += d.content; setStreamingContent(full); }
            if (d.done) { setReport(full); setStreamingContent(''); break; }
          } catch {}
        }
      }
      if (full) setReport(full);
    } catch (err: any) {
      setError(err.message);
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const PersonForm = ({ label, data, onChange, color }: {
    label: string; data: PersonForm; onChange: (d: PersonForm) => void; color: string;
  }) => (
    <div className="card-jade p-5" style={{ borderColor: color }}>
      <h3 className="text-base font-bold mb-4" style={{ color }}>{label}</h3>
      <div className="space-y-3">
        <input className="input-jade text-sm" placeholder="称呼（如：小明）" value={data.name}
          onChange={e => onChange({ ...data, name: e.target.value })} />
        <div className="grid grid-cols-3 gap-2">
          <select className="input-jade text-sm" value={data.year} onChange={e => onChange({ ...data, year: e.target.value })} required>
            <option value="">年</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="input-jade text-sm" value={data.month} onChange={e => onChange({ ...data, month: e.target.value })} required>
            <option value="">月</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="input-jade text-sm" value={data.day} onChange={e => onChange({ ...data, day: e.target.value })} required>
            <option value="">日</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select className="input-jade text-sm" value={data.hour} onChange={e => onChange({ ...data, hour: e.target.value })}>
            <option value="">时辰</option>
            {['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'].map(h => (
              <option key={h} value={h}>{h}:00-{h}:59</option>
            ))}
          </select>
          <select className="input-jade text-sm" value={data.gender} onChange={e => onChange({ ...data, gender: e.target.value })}>
            <option value="">性别</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-8 md:py-16 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="text-3xl mb-3">💞</div>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">灵魂共鸣 · 关系合盘</h1>
        <p className="text-sm text-[var(--text-secondary)]">输入两个人的出生信息，AI分析你们的灵魂匹配度</p>
      </div>

      {step === 'form' && (
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <PersonForm label="👤 第一个人" data={p1} onChange={setP1} color="var(--text-accent)" />
            <PersonForm label="👤 第二个人" data={p2} onChange={setP2} color="var(--text-accent-gold)" />
          </div>

          {error && <div className="text-sm text-red-500 bg-red-500/5 border border-red-500/15 rounded-lg px-4 py-3 mb-4">{error}</div>}

          <div className="text-center">
            <button type="submit" className="btn-jade max-w-xs mx-auto" disabled={loading}>
              💞 解析两人关系
            </button>
            <p className="text-xs text-[var(--text-secondary)] opacity-50 mt-2">需要会员权益 · ¥19.9 或月卡会员</p>
          </div>
        </form>
      )}

      {step === 'loading' && (
        <div className="text-center py-20">
          <div className="cosmic-loader mx-auto mb-8">
            <div className="cosmic-ring cosmic-ring-1" />
            <div className="cosmic-ring cosmic-ring-2" />
            <div className="cosmic-center">💞</div>
          </div>
          <p className="text-lg text-[var(--text-accent)] loading-pulse">正在合盘...</p>
        </div>
      )}

      {step === 'result' && (
        <div>
          <div className="report-content leading-relaxed">
            {streamingContent && (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingContent) }} />
            )}
            {report && (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }} />
            )}
          </div>
          {report && (
            <div className="text-center mt-8">
              <button onClick={() => { setStep('form'); setReport(''); setStreamingContent(''); }}
                className="btn-jade max-w-xs mx-auto inline-flex" style={{ width: 'auto' }}>
                🔄 重新合盘
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simple markdown renderer
function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-[var(--text-accent)] mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[var(--text-accent)] mt-8 mb-3 pb-2 border-b border-[var(--border-color)]">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold gradient-text mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[var(--text-accent-light)]">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm leading-relaxed mb-1">• $1</li>')
    .replace(/\n\n/g, '</p><p class="text-sm leading-relaxed mb-3 text-[var(--text-primary)]">')
    .replace(/^(.+)$/gm, (m: string) => {
      if (m.startsWith('<')) return m;
      if (m.startsWith('•')) return m;
      return m;
    });
}
