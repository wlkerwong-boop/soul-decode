'use client';
import { useState } from 'react';

const HOURS = Array.from({length:24},(_,i)=>i);
const MINUTES = [0,15,30,45];

export default function HepanPage() {
  const [type, setType] = useState('couple');

  const PersonForm = ({label, pfx}:{label:string, pfx:string}) => (
    <div className="space-y-3 p-4 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-color)]">
      <h3 className="text-sm font-bold text-[var(--accent)]">{label}</h3>
      <div className="grid grid-cols-5 gap-1.5">
        <select className="input-jade text-sm py-2"><option>年份</option></select>
        <select className="input-jade text-sm py-2"><option>月</option></select>
        <select className="input-jade text-sm py-2"><option>日</option></select>
        <select className="input-jade text-sm py-2"><option>时</option></select>
        <select className="input-jade text-sm py-2"><option>分</option></select>
      </div>
      <select className="input-jade text-sm py-2 w-full"><option>出生地</option></select>
      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded-lg text-sm bg-[var(--accent)] text-white">👨 男</button>
        <button className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-highlight)] text-[var(--text-secondary)]">👩 女</button>
      </div>
    </div>
  );

  return (
    <div className="gradient-bg min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">💞 <span className="gradient-text">关系合盘</span></h1>
          <p className="text-sm text-[var(--text-secondary)]">八字合婚·人类图合盘·占星比较盘</p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[
            {v:'couple',l:'💑 情侣合盘'},
            {v:'family',l:'👨‍👩‍👧‍👦 家庭合盘'},
            {v:'friend',l:'🤝 朋友合盘'},
          ].map(t=>(
            <button key={t.v} onClick={()=>setType(t.v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${type===t.v ? 'bg-gradient-to-r from-[var(--accent)] to-emerald-500 text-white shadow-md' : 'bg-[var(--bg-highlight)] text-[var(--text-secondary)] border border-[var(--border-color)]'}`}>
              {t.l}
            </button>
          ))}
        </div>

        <div className="card-jade p-6 space-y-4">
          {type === 'couple' && (
            <><PersonForm label="你" pfx="a" /><PersonForm label="对方" pfx="b" /></>
          )}
          {type === 'family' && (
            <div className="space-y-3">
              <PersonForm label="本人" pfx="m" />
              <PersonForm label="伴侣" pfx="p" />
              <div className="p-4 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-color)] border-dashed text-center text-sm text-[var(--text-secondary)]">
                + 添加孩子（最多5人）
              </div>
            </div>
          )}
          {type === 'friend' && (
            <><PersonForm label="你" pfx="a" /><PersonForm label="朋友" pfx="b" /></>
          )}

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-emerald-500 text-white font-bold text-base hover:shadow-lg transition-all">
            ✦ 生成合盘报告
          </button>
        </div>
      </div>
    </div>
  );
}
