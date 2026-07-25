'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calcJiugong } from '@/lib/jiugong';

export default function JiugongPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const valid = name.length >= 2 && /^[一-鿿]{2,4}$/.test(name) && year && parseInt(year) >= 1900;

  const handleSubmit = () => {
    if (!valid) return;
    const result = calcJiugong(
      name,
      parseInt(year),
      parseInt(month) || 1,
      parseInt(day) || 1
    );
    sessionStorage.setItem('jiugong-result', JSON.stringify(result));
    sessionStorage.setItem('jiugong-name', name);
    sessionStorage.setItem('jiugong-year', year);
    router.push('/jiugong/result');
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* 标题 */}
        <div className="text-center mb-8">
          <span className="tag-pill text-xs tracking-widest mb-4 inline-block">河图洛书 · 姓名学</span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            🔮 九宫<span className="gradient-text">人生解码</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            输入姓名与出生日期，解锁你的专属人生说明书
          </p>
        </div>

        {/* 输入表单 */}
        <div className="card-jade p-6 md:p-8 space-y-5 animate-fade-in-up">
          {/* 姓名 */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-semibold">
              姓名 <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="请输入姓名（2-4个汉字）"
              maxLength={4}
              className="input-jade text-base py-3 px-4 rounded-xl"
            />
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">请使用汉字，如「王一然」</p>
          </div>

          {/* 出生日期 */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-semibold">
              出生日期 <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="1990"
                  type="number"
                  className="input-jade text-base py-3 px-3 rounded-xl text-center"
                />
                <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-0.5">年份</p>
              </div>
              <div>
                <input
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  placeholder="6"
                  type="number"
                  min="1" max="12"
                  className="input-jade text-base py-3 px-3 rounded-xl text-center"
                />
                <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-0.5">月份</p>
              </div>
              <div>
                <input
                  value={day}
                  onChange={e => setDay(e.target.value)}
                  placeholder="4"
                  type="number"
                  min="1" max="31"
                  className="input-jade text-base py-3 px-3 rounded-xl text-center"
                />
                <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-0.5">日期</p>
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={!valid}
            className="w-full py-3.5 rounded-xl font-semibold text-lg bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            查看我的人生说明书 →
          </button>

          {/* 隐私承诺 */}
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            🔒 姓名和出生信息仅用于排盘，绝不外泄
          </p>
        </div>

        {/* 底部说明 */}
        <div className="mt-6 text-center text-xs text-[var(--text-tertiary)] opacity-60">
          基于河图洛书五格三才体系 · 中国传统姓名学智慧
        </div>
      </div>
    </div>
  );
}
