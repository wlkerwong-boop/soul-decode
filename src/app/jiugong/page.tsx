'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calcFull, loadKangxi } from '@/lib/jiugong-v3';

export default function JiugongPage() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [loading, setLoading] = useState(false);
  const [dictReady, setDictReady] = useState(false);
  const router = useRouter();

  useEffect(() => { loadKangxi().then(() => setDictReady(true)); }, []);

  const valid = name.length >= 2 && /^[一-鿿]{2,4}$/.test(name.replace(/\s/g,'')) && year && parseInt(year) >= 1900;

  const submit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    await loadKangxi();
    const result = calcFull(name.trim(), parseInt(year), parseInt(month)||1, parseInt(day)||1);
    sessionStorage.setItem('jiugong-data', JSON.stringify(result));
    router.push('/jiugong/result');
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">

        {/* 标题区 — 对齐 R1 着陆页视觉 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs mb-5 border border-[var(--color-primary)]/20 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            河图洛书 · 程天相九宫学理
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            📜 九宫<span className="gradient-text">人生说明书</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            输入姓名与生日，即刻生成你的 13 维度天赋地图、性格密码与 90 年人生节律
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="card-jade p-6 md:p-8 space-y-5 animate-fade-in-up">
          {/* 姓名 */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-semibold">
              姓名 <span className="text-red-400">*</span>
            </label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="你的本名（如：王一然）" maxLength={4}
              className="input-jade text-base py-3 px-4 rounded-xl"
            />
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">请使用出生时父母所取的名字，这是你生命蓝图的第一份约定</p>
          </div>

          {/* 出生日期 */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-semibold">
              出生日期（公历） <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  value={year} onChange={e => setYear(e.target.value)}
                  placeholder="1990" type="number"
                  className="input-jade text-base py-3 px-3 rounded-xl text-center"
                />
                <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-0.5">年份</p>
              </div>
              <div>
                <input
                  value={month} onChange={e => setMonth(e.target.value)}
                  placeholder="1" type="number" min="1" max="12"
                  className="input-jade text-base py-3 px-3 rounded-xl text-center"
                />
                <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-0.5">月份</p>
              </div>
              <div>
                <input
                  value={day} onChange={e => setDay(e.target.value)}
                  placeholder="1" type="number" min="1" max="31"
                  className="input-jade text-base py-3 px-3 rounded-xl text-center"
                />
                <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-0.5">日期</p>
              </div>
            </div>
          </div>

          {/* 提交按钮 — 对齐 R1 gradient 风格 */}
          <button
            onClick={submit}
            disabled={!valid || loading || !dictReady}
            className="w-full py-3.5 rounded-xl font-semibold text-lg bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? '⏳ 正在为你绘制人生地图…' : dictReady ? '🔮 查看我的生命蓝图' : '⏳ 加载字典中…'}
          </button>

          {/* 隐私承诺 */}
          <p className="text-xs text-[var(--text-tertiary)] text-center leading-relaxed">
            🔒 你的姓名与生日仅用于排盘计算，数据不会存储到服务器，更不会外泄
          </p>
        </div>

        {/* 底部署名 */}
        <div className="mt-6 text-center text-xs text-[var(--text-tertiary)] opacity-50 leading-relaxed">
          程天相九宫学理体系 · 康熙字典正体笔画 · 五格三才框架 · 十大能量系统 · 90 年运势推演
        </div>
      </div>
    </div>
  );
}
