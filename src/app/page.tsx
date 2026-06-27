'use client';

import { useState } from 'react';
import BirthInputForm from '@/components/BirthInputForm';
import Link from 'next/link';

const coreProducts = [
  { icon: '🔮', title: '八字命盘', desc: '四柱八字排盘，五行喜忌分析，大运流年推演', href: '/astrology', color: '#f59e0b' },
  { icon: '🧬', title: '人类图', desc: '能量中心·闸门·通道·类型权威·人生角色全解析', href: '/human-design', color: '#8b5cf6' },
  { icon: '🔄', title: '三系统融合', desc: '八字+人类图+占星·AI深度交叉解读', href: '/fusion', color: '#06b6d4', featured: true },
];

const features = [
  { icon: '✋', title: '中医手诊', desc: 'AI辅助掌色/掌形辨证', href: '/hand-diagnosis' },
  { icon: '🌅', title: '每日运势', desc: '每日能量指引', href: '/daily' },
  { icon: '❤️', title: '关系合盘', desc: '双人能量匹配', href: '/matching' },
  { icon: '💰', title: '财富密码', desc: '财星格局分析', href: '/wealth' },
];

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="gradient-bg min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs mb-6 border border-[var(--accent)]/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Jovian Archive认证引擎 · 区分的科学标准
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            你的<span className="gradient-text">生命蓝图</span>
            <br />一次看清
          </h1>
          <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-xl mx-auto">
            八字 + 人类图 + 占星 · 三系统融合AI报告<br />
            从三个维度精准定位你的天赋、挑战与人生节奏
          </p>
          <button onClick={() => setShowForm(!showForm)}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-[var(--accent)]/25 transition-all">
            {showForm ? '收起' : '开始排盘 →'}
          </button>
        </div>
      </section>

      {/* ── Quick Form ── */}
      {showForm && (
        <section className="px-4 pb-12 max-w-xl mx-auto">
          <div className="card-jade p-6">
            <h3 className="text-lg font-bold mb-2">输入出生信息</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">获取完整的八字命盘 + 人类图 + 占星分析</p>
            <BirthInputForm />
          </div>
        </section>
      )}

      {/* ── Core Products ── */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">三大核心产品</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {coreProducts.map((p, i) => (
            <Link key={i} href={p.href}
              className={`relative p-6 rounded-2xl border transition-all hover:translate-y-[-2px] hover:shadow-lg
                ${p.featured ? 'border-[var(--accent)]/30 bg-[var(--accent)]/5 ring-1 ring-[var(--accent)]/20' : 'border-[var(--border)] bg-[var(--card)]'}`}>
              {p.featured && <span className="absolute -top-2.5 left-4 px-3 py-0.5 text-xs bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-medium">推荐</span>}
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="font-bold mb-1">{p.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Extra Tools ── */}
      <section className="px-4 pb-16 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-6">更多工具</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((f, i) => (
            <Link key={i} href={f.href}
              className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-center hover:border-[var(--accent)]/30 transition-all">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h4 className="font-semibold text-sm">{f.title}</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-4 pb-16 max-w-3xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['3', '命理系统', '八字·人类图·占星'],
            ['64', '功能页面', '完整工具链'],
            ['5/5', 'Jovian认证', '权威引擎对标'],
            ['∞', 'AI解读', '深度个性化报告'],
          ].map(([num, label, sub], i) => (
            <div key={i} className="text-center p-4">
              <div className="text-2xl font-bold gradient-text">{num}</div>
              <div className="text-sm font-medium mt-1">{label}</div>
              <div className="text-xs text-[var(--text-secondary)]">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 pb-8 text-center text-xs text-[var(--text-secondary)]">
        <p>基于《区分的科学》标准 · Swiss Ephemeris WASM引擎 · AI深度解读</p>
        <p className="mt-1">Jovian Archive™ 认证对齐 · Ra Uru Hu 原始体系</p>
      </footer>
    </div>
  );
}
