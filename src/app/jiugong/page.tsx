'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calcFull, loadKangxi, type JiugongFull } from '@/lib/jiugong-v3';

export default function JiugongPage() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [loading, setLoading] = useState(false);
  const [dictReady, setDictReady] = useState(false);
  const router = useRouter();

  useEffect(() => { loadKangxi().then(() => setDictReady(true)); }, []);

  const submit = async () => {
    if (!name || !year) return;
    setLoading(true);
    await loadKangxi();
    const result = calcFull(name, parseInt(year), parseInt(month)||1, parseInt(day)||1);
    sessionStorage.setItem('jiugong-data', JSON.stringify(result));
    router.push('/jiugong/result');
  };

  return (
    <div className="gradient-bg min-h-screen px-4 py-8 flex items-center justify-center">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">📜 九宫学理</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">基于程天相九宫学理 · 康熙字典笔画</p>
        </div>
        <div className="card-jade p-6 space-y-4">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="姓名（2-4个汉字）"
            className="w-full py-3 px-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm" />
          <div className="grid grid-cols-3 gap-2">
            <input value={year} onChange={e=>setYear(e.target.value)} placeholder="出生年" type="number"
              className="py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm" />
            <input value={month} onChange={e=>setMonth(e.target.value)} placeholder="月" type="number"
              className="py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm" />
            <input value={day} onChange={e=>setDay(e.target.value)} placeholder="日" type="number"
              className="py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm" />
          </div>
          <button onClick={submit} disabled={!name||!year||loading||!dictReady}
            className="w-full py-3.5 rounded-xl font-semibold bg-[var(--text-accent)] text-white transition-all disabled:opacity-40">
            {dictReady ? '🔮 生成人生说明书' : '⏳ 加载字典中…'}
          </button>
        </div>
      </div>
    </div>
  );
}
