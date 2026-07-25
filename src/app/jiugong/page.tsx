'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calcFull, loadKangxi } from '@/lib/jiugong-v3';

export default function JiugongPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [loading, setLoading] = useState(false);
  const [dictReady, setDictReady] = useState(false);

  useEffect(() => { loadKangxi().then(() => setDictReady(true)); }, []);

  const valid = name.length >= 2 && /^[一-鿿]{2,4}$/.test(name.replace(/\s/g,'')) && year && parseInt(year) >= 1900;

  const submit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    await loadKangxi();
    const result = calcFull(name.trim(), parseInt(year), parseInt(month)||1, parseInt(day)||1);
    sessionStorage.setItem('jiugong-full', JSON.stringify(result));
    router.push('/jiugong/result');
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <span className="tag-pill text-xs tracking-widest mb-4 inline-block">河图洛书 · 程天相九宫学理</span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            📜 九宫<span className="gradient-text">人生解码</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            输入姓名与出生日期，解锁 13 维度专属人生说明书
          </p>
        </div>

        <div className="card-jade p-6 md:p-8 space-y-5 animate-fade-in-up">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-semibold">
              姓名 <span className="text-red-400">*</span>
            </label>
            <input value={name} onChange={e=>setName(e.target.value)}
              placeholder="请输入姓名（2-4个汉字）" maxLength={4}
              className="input-jade text-base py-3 px-4 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-semibold">
              出生日期（公历） <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input value={year} onChange={e=>setYear(e.target.value)}
                  placeholder="1990" type="number"
                  className="input-jade text-base py-3 px-3 rounded-xl text-center" />
                <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-0.5">年份</p>
              </div>
              <div>
                <input value={month} onChange={e=>setMonth(e.target.value)}
                  placeholder="1" type="number" min="1" max="12"
                  className="input-jade text-base py-3 px-3 rounded-xl text-center" />
                <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-0.5">月份</p>
              </div>
              <div>
                <input value={day} onChange={e=>setDay(e.target.value)}
                  placeholder="1" type="number" min="1" max="31"
                  className="input-jade text-base py-3 px-3 rounded-xl text-center" />
                <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-0.5">日期</p>
              </div>
            </div>
          </div>

          <button onClick={submit} disabled={!valid||loading||!dictReady}
            className="w-full py-3.5 rounded-xl font-semibold text-lg bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
            {loading ? '⏳ 生成中…' : dictReady ? '🔮 生成人生报告' : '⏳ 加载字典中…'}
          </button>

          <p className="text-xs text-[var(--text-tertiary)] text-center">
            🔒 姓名和出生信息仅用于排盘，绝不外泄
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-[var(--text-tertiary)] opacity-60">
          基于程天相九宫学理体系 · 康熙字典笔画 · 五格三才 · 十大能量 · 90年运势
        </div>
      </div>
    </div>
  );
}
