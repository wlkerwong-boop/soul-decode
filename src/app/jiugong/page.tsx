'use client';

import { useState } from 'react';
import { calcJiugong } from '@/lib/jiugong';

export default function JiugongPage() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [result, setResult] = useState<any>(null);

  const submit = () => {
    if (!name || !year) return;
    const r = calcJiugong(name, parseInt(year), parseInt(month)||1, parseInt(day)||1);
    setResult(r);
  };

  const { wuge, jiugong, jiugongLabels, tezhi, suizhi, rengePosition, totalStroke } = result || {};

  return (
    <div className="gradient-bg min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">🔮 九宫人生解码</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">姓名 + 出生日期 → 专属人生说明书</p>
        </div>

        {!result ? (
          <div className="card-jade p-6 max-w-md mx-auto space-y-4">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="姓名（2-4个汉字）"
              className="w-full input-jade text-sm py-3 px-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]" />
            <div className="grid grid-cols-3 gap-2">
              <input value={year} onChange={e=>setYear(e.target.value)} placeholder="年份"
                className="input-jade text-sm py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]" type="number" />
              <input value={month} onChange={e=>setMonth(e.target.value)} placeholder="月"
                className="input-jade text-sm py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]" type="number" />
              <input value={day} onChange={e=>setDay(e.target.value)} placeholder="日"
                className="input-jade text-sm py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]" type="number" />
            </div>
            <button onClick={submit} disabled={!name||!year}
              className="w-full py-3.5 rounded-xl font-semibold bg-[var(--text-accent)] text-white hover:shadow-md transition-all disabled:opacity-40">
              查看我的人生说明书 →
            </button>
            <p className="text-xs text-[var(--text-tertiary)] text-center">🔒 信息仅用于排盘，绝不外泄</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 五格卡片 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-3">📐 姓名五格</h2>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                {[{l:'天格',v:wuge?.tian},{l:'人格',v:wuge?.ren},{l:'地格',v:wuge?.di},{l:'总格',v:wuge?.zong},{l:'外格',v:wuge?.wai}].map(g=>(
                  <div key={g.l} className="bg-[var(--bg-highlight)] rounded-xl p-3">
                    <div className="text-[var(--text-tertiary)] text-xs">{g.l}</div>
                    <div className="text-2xl font-bold text-[var(--text-accent)]">{g.v}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--text-tertiary)] text-center mt-2">三才：{wuge?.sancai}</p>
            </div>

            {/* 九宫气场图 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-3">🏠 九宫气场</h2>
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {jiugongLabels?.map((g:any) => (
                  <div key={`${g.row}-${g.col}`}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-center p-1 transition-all ${
                      rengePosition?.[0]===g.row && rengePosition?.[1]===g.col
                        ? 'bg-[var(--text-accent)] text-white shadow-lg scale-105'
                        : 'bg-[var(--bg-highlight)]'
                    }`}>
                    <div className={`text-lg font-bold ${rengePosition?.[0]===g.row && rengePosition?.[1]===g.col ? 'text-white' : 'text-[var(--text-accent)]'}`}>
                      {g.num}
                    </div>
                    <div className={`text-[10px] leading-tight ${rengePosition?.[0]===g.row && rengePosition?.[1]===g.col ? 'text-white/80' : 'text-[var(--text-tertiary)]'}`}>
                      {g.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 特质 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-2">🌟 十大特质 · {tezhi?.name}</h2>
              <p className="text-xs text-[var(--text-tertiary)] mb-2">总格个位数 {wuge?.zong % 10} · 五行属{tezhi?.element}</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tezhi?.desc}</p>
            </div>

            {/* 岁值星 */}
            <div className="card-jade p-5 bg-gradient-to-br from-[var(--bg-highlight)] to-[var(--bg-card)]">
              <h2 className="text-lg font-bold mb-2">⭐ 岁值星 · {suizhi?.star}</h2>
              <p className="text-xs text-[var(--text-tertiary)] mb-2">虚岁 {suizhi?.xuSui} 岁</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{suizhi?.desc}</p>
            </div>

            <button onClick={()=>setResult(null)} className="w-full py-3 rounded-xl bg-[var(--bg-highlight)] text-[var(--text-secondary)] text-sm hover:text-[var(--text-accent)] transition-all">
              重新测算
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
