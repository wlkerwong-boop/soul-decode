'use client';

import { useState } from 'react';
import VoiceReader from '@/components/VoiceReader';

type Palace = { name: string; stars: string[] };
type Result = { palaces: Palace[]; date: string; time: string; gender: string } | null;

const PALACE_DESC: Record<string, string> = {
  '命宫':'一生格局与性格', '兄弟':'手足缘分', '夫妻':'婚姻情感',
  '子女':'子女缘分', '财帛':'财富格局', '疾厄':'健康状况',
  '迁移':'外出运势', '仆役':'人际社交', '官禄':'事业发展',
  '田宅':'房产家运', '福德':'精神福气', '父母':'父母缘分',
};

export default function ZiweiPage() {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('12');
  const [gender, setGender] = useState('男');
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true); setError(''); setResult(null); setAiReport('');
    try {
      const r = await fetch('/api/ziwei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, hour, gender }),
      });
      const d = await r.json();
      if (!d.success) { setError(d.error); return; }
      setResult(d.data);

      // Also get AI interpretation
      const ai = await fetch('/api/fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, hour, location: gender === '女' ? '女' : '男', timezone: 'Asia/Shanghai' }),
      });
      const aiData = await ai.json();
      if (aiData.fusion) setAiReport(aiData.fusion);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="gradient-bg min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">🔮 紫微斗数</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          五代陈抟老祖创制 · 十四主星 · 十二宫位 · 人生全盘解析
        </p>

        <div className="card-jade p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <input placeholder="年" value={year} onChange={e=>setYear(e.target.value)}
              className="input-jade" type="number" />
            <input placeholder="月" value={month} onChange={e=>setMonth(e.target.value)}
              className="input-jade" type="number" min={1} max={12} />
            <input placeholder="日" value={day} onChange={e=>setDay(e.target.value)}
              className="input-jade" type="number" min={1} max={31} />
            <input placeholder="时" value={hour} onChange={e=>setHour(e.target.value)}
              className="input-jade" type="number" min={0} max={23} />
          </div>
          <div className="flex gap-3 items-center mb-4">
            <select value={gender} onChange={e=>setGender(e.target.value)}
              className="input-jade w-24">
              <option>男</option><option>女</option>
            </select>
            <button onClick={submit} disabled={loading}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? '排盘中...' : '开始排盘'}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {result && (
          <>
            <div className="text-sm text-[var(--text-secondary)] mb-4">
              {result.date} {result.time} · {result.gender}
            </div>

            {/* 十二宫图 */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {result.palaces.map((p, i) => (
                <div key={i} className={`p-3 rounded-xl border ${p.name==='命宫'?'border-[var(--accent)]/30 bg-[var(--accent)]/5 ring-1 ring-[var(--accent)]/20':'border-[var(--border)] bg-[var(--card)]'}`}>
                  <div className="text-xs font-bold mb-1">{p.name}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mb-1">{PALACE_DESC[p.name]||''}</div>
                  {p.stars.slice(0,4).map((s, j) => (
                    <div key={j} className="text-xs inline-block mr-1 mb-0.5 px-1.5 py-0.5 rounded bg-[var(--bg-highlight)]">
                      {s}
                    </div>
                  ))}
                  {p.stars.length > 4 && <span className="text-[10px] text-[var(--text-secondary)]">+{p.stars.length-4}</span>}
                </div>
              ))}
            </div>

            {aiReport && (
              <div className="card-jade p-6">
                <h3 className="text-lg font-bold mb-4">🔮 紫微斗数 + 三系统融合解读</h3>
                <VoiceReader text={aiReport} title="听解读" />
                <div className="prose prose-sm prose-invert mt-4 whitespace-pre-wrap text-sm leading-relaxed">
                  {aiReport.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line || '\u00A0'}</p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
