'use client';

import { useState } from 'react';
import VoiceReader from '@/components/VoiceReader';
import BodygraphSVG from '@/components/BodygraphSVG';
import BaziChart from '@/components/BaziChart';
import ZiWeiChart from '@/components/ZiWeiChart';
import WuXingChart from '@/components/WuXingChart';

export default function MasterPage() {
  const [year, setYear] = useState(''); const [month, setMonth] = useState('');
  const [day, setDay] = useState(''); const [hour, setHour] = useState('12');
  const [location, setLocation] = useState(''); const [gender, setGender] = useState('男');
  const [report, setReport] = useState(''); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); const [data, setData] = useState<any>(null);

  const submit = async () => {
    setLoading(true); setError(''); setReport(''); setData(null);
    try {
      const r = await fetch('/api/master-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, hour, location, gender }),
      });
      const d = await r.json();
      if (!d.success) { setError(d.error); return; }
      setReport(d.report); setData(d.data);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="gradient-bg min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            ✦ <span className="gradient-text">人生总览</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-lg mx-auto">
            一次输入 · 七系统交叉融合<br />
            八字 · 人类图 · 占星 · 紫微斗数 · 五运六气 · 流年 · 人生规划<br />
            <span className="text-xs opacity-60">DeepSeek V4 Pro · 温暖深度解读</span>
          </p>
        </div>

        {/* Form */}
        <div className="card-jade p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <input placeholder="出生年" value={year} onChange={e=>setYear(e.target.value)} className="input-jade" type="number" />
            <input placeholder="月" value={month} onChange={e=>setMonth(e.target.value)} className="input-jade" type="number" min={1} max={12} />
            <input placeholder="日" value={day} onChange={e=>setDay(e.target.value)} className="input-jade" type="number" min={1} max={31} />
            <input placeholder="时(0-23)" value={hour} onChange={e=>setHour(e.target.value)} className="input-jade" type="number" min={0} max={23} />
            <input placeholder="出生地" value={location} onChange={e=>setLocation(e.target.value)} className="input-jade" />
          </div>
          <div className="flex gap-3 items-center">
            <select value={gender} onChange={e=>setGender(e.target.value)} className="input-jade w-20">
              <option>男</option><option>女</option>
            </select>
            <button onClick={submit} disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? '⌛ 生成中...' : '✦ 生成人生总览'}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Data Summary */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 text-xs">
            <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-center">
              <div className="font-bold text-[var(--accent)]">八字</div>
              <div className="text-[var(--text-secondary)]">{data.bazi?.pillars?.join(' ')}</div>
            </div>
            <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-center">
              <div className="font-bold text-[var(--accent)]">人类图</div>
              <div className="text-[var(--text-secondary)]">{data.hd?.type} {data.hd?.profile}</div>
            </div>
            <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-center">
              <div className="font-bold text-[var(--accent)]">占星</div>
              <div className="text-[var(--text-secondary)]">{data.zodiac?.zodiac}</div>
            </div>
            <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-center">
              <div className="font-bold text-[var(--accent)]">五运六气</div>
              <div className="text-[var(--text-secondary)]">{data.wuyun?.wuyun}</div>
            </div>
            <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-center">
              <div className="font-bold text-[var(--accent)]">流年</div>
              <div className="text-[var(--text-secondary)]">{data.liunian?.split('|')[1]?.trim()}</div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            {data.hd && (
              <div className="card-jade p-4">
                <h3 className="text-sm font-bold text-[var(--accent)] mb-2">🧬 人类图·身体图</h3>
                <BodygraphSVG
                  definedCenters={data.hd.definedCenters||[]}
                  activatedGates={data.hd.activatedGates||[]}
                  channels={data.hd.channels||[]}
                  centerDefinition={{}}
                />
                <p className="text-xs text-[var(--text-secondary)] mt-2 text-center">
                  {data.hd.type} · {data.hd.profile} · {data.hd.authority}
                </p>
              </div>
            )}
            {data.bazi && (
              <div className="card-jade p-4">
                <h3 className="text-sm font-bold text-[var(--accent)] mb-2">🀄 八字四柱</h3>
                <BaziChart pillars={data.bazi.pillars||[]} dayMaster={data.bazi.dayMaster||''} elements={['金','金','金','火']}/>
                <p className="text-xs text-[var(--text-secondary)] mt-2 text-center">
                  {data.bazi.pillars?.join(' · ')}
                </p>
              </div>
            )}
            {data.ziwei && (
              <div className="card-jade p-4">
                <h3 className="text-sm font-bold text-[var(--accent)] mb-2">⭐ 紫微斗数·十二宫</h3>
                <ZiWeiChart palaces={data.ziwei.palaces||[]} />
              </div>
            )}
            {data.wuyun && (
              <div className="card-jade p-4">
                <h3 className="text-sm font-bold text-[var(--accent)] mb-2">🌊 五运六气</h3>
                <div className="text-xs text-[var(--text-secondary)] space-y-1">
                  <p>{data.wuyun.stem}年 → {data.wuyun.wuyun}</p>
                  <p>{data.wuyun.branch}年 → {data.wuyun.liuqi}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Report */}
        {report && (
          <div className="card-jade p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">📜 人生总览报告</h2>
              <VoiceReader text={report} title="听报告" />
            </div>
            <div className="prose prose-sm prose-invert whitespace-pre-wrap text-sm leading-relaxed">
              {report.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line || '\u00A0'}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
