'use client';

import { useState, useEffect, useRef } from 'react';
import BirthInputForm from '@/components/BirthInputForm';
import BodygraphSVG from '@/components/BodygraphSVG';
import Link from 'next/link';

/* ── 示例人类图数据（装饰用） ── */
const DEMO_HUMAN_DESIGN = {
  definedCenters: ['Head', 'Ajna', 'Throat', 'G', 'Ego', 'Sacral', 'Root'],
  activatedGates: [1, 2, 3, 5, 7, 8, 10, 11, 13, 14, 15, 16, 17, 20, 21, 23, 24, 25, 26, 27, 28, 29, 31, 33, 34, 35, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64],
  channels: ['1-8', '2-14', '3-60', '5-15', '7-31', '10-20', '11-56', '13-33', '16-48', '17-62', '20-34', '21-45', '23-43', '24-61', '25-51', '26-44', '27-50', '28-38', '29-46', '30-41', '31-7', '32-54', '33-13', '34-20', '35-36', '37-40', '39-55', '41-30', '42-53', '43-23', '44-26', '45-21', '46-29', '47-64', '48-16', '50-27', '51-25', '52-9', '53-42', '54-32', '55-39', '56-11', '57-34', '58-18', '59-6', '60-3', '61-24', '62-17', '63-4', '64-47'],
  centerDefinition: {},
};

const products = [
  {
    icon: '🌟',
    title: '人生总览',
    subtitle: 'Master Report',
    desc: '八字 · 人类图 · 占星 · 紫微 · 五运六气\n七系统AI深度交叉解读 · 一次性看清你的生命全貌',
    href: '/master-report',
    gradient: 'from-emerald-500/20 to-cyan-500/20',
    accent: 'emerald',
    features: ['7系统融合', 'AI深度交叉', '人生节奏图谱'],
  },
  {
    icon: '🧬',
    title: '人类图',
    subtitle: 'Human Design',
    desc: '能量中心 · 闸门通道 · 类型权威 · 人生角色\n基于Jovian Archive认证引擎 · 区分的科学标准',
    href: '/human-design',
    gradient: 'from-violet-500/20 to-purple-500/20',
    accent: 'violet',
    features: ['Jovian认证', '完整bodygraph', '即时生成'],
  },
];

const trustStats = [
  { value: '50,000+', label: '已生成报告', sub: '用户信赖选择' },
  { value: '7', label: '命理系统融合', sub: '八字·人类图·占星·紫微·五运六气·梅花·MBTI' },
  { value: '★', label: 'Jovian Archive', sub: '认证引擎对齐' },
  { value: '∞', label: 'AI深度解读', sub: '个性化生命报告' },
];

const quickTools = [
  { icon: '🌅', title: '每日运势', desc: '每日能量指引', href: '/daily' },
  { icon: '❤️', title: '关系合盘', desc: '双人能量匹配', href: '/compatibility' },
  { icon: '💰', title: '财富密码', desc: '财星格局分析', href: '/master-report' },
  { icon: '☯️', title: '梅花易数', desc: '卦象即时占卜', href: '/tools/divination' },
];

/* ── 数字动画计数器 ── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const formSectionRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus the first input after a brief delay
      setTimeout(() => {
        const firstInput = formSectionRef.current?.querySelector('input, select');
        if (firstInput && 'focus' in firstInput) (firstInput as HTMLElement).focus();
      }, 400);
    }, 100);
  };

  return (
    <div>
      {/* ════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════ */}
      <section className="hero-premium px-4 md:px-6">
        {/* ── 装饰性背景Bodygraph ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.06] dark:opacity-[0.04]">
          <div className="w-full max-w-2xl animate-float-bodygraph">
            <BodygraphSVG
              definedCenters={DEMO_HUMAN_DESIGN.definedCenters}
              activatedGates={DEMO_HUMAN_DESIGN.activatedGates}
              channels={DEMO_HUMAN_DESIGN.channels}
              centerDefinition={DEMO_HUMAN_DESIGN.centerDefinition}
            />
          </div>
        </div>

        {/* ── 光晕装饰 ── */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--glow-green)] animate-glow-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[var(--glow-gold)] opacity-30 blur-[100px] animate-float-slow pointer-events-none" />

        {/* ── 内容 ── */}
        <div className="relative z-10 max-w-5xl mx-auto w-full py-24 md:py-32">
          <div className="max-w-3xl">
            {/* 认证徽章 */}
            <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--text-accent)]/8 text-[var(--text-accent)] text-xs mb-6 border border-[var(--text-accent)]/15 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Jovian Archive™ 认证引擎 · 区分的科学标准
            </div>

            {/* 主标题 */}
            <h1 className="animate-slide-up-1 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              你的
              <span className="gradient-text">生命蓝图</span>
              <br />
              <span className="text-[var(--text-primary)]">一次看清</span>
            </h1>

            {/* 副标题 */}
            <p className="animate-slide-up-2 text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-xl mb-10">
              七系统AI融合报告 · 精准定位你的天赋、挑战与人生节奏
              <br />
              <span className="text-sm opacity-70">八字 · 人类图 · 占星 · 紫微 · 五运六气 · 梅花易数 · MBTI</span>
            </p>

            {/* CTA按钮组 */}
            <div className="animate-slide-up-3 flex flex-col sm:flex-row gap-4 items-start">
              <button
                onClick={scrollToForm}
                className="btn-premium group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  开始解码
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <Link
                href="/master-report"
                className="animate-slide-up-4 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/60 backdrop-blur-sm text-[var(--text-primary)] font-medium hover:border-[var(--text-accent)]/30 hover:bg-[var(--bg-card)] transition-all"
              >
                了解七系统
                <span className="text-[var(--text-secondary)]">→</span>
              </Link>
            </div>

            {/* 微型信任指示 */}
            <div className="animate-slide-up-5 mt-12 flex items-center gap-6 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <span className="text-green-500">✓</span>
                Swiss Ephemeris WASM
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-green-500">✓</span>
                Jovian Archive对齐
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-green-500">✓</span>
                AI深度解读
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FORM SECTION
          ════════════════════════════════════════════════ */}
      <section className="px-4 md:px-6 pb-16 md:pb-24" ref={formSectionRef}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {showForm ? '📜 输入出生信息' : '👋 准备开始？'}
            </h2>
            <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
              {showForm
                ? '填写完整信息，即刻生成你的专属生命蓝图报告'
                : '输入你的出生日期，解锁七系统融合的深度解读'}
            </p>
          </div>

          {!showForm ? (
            <div className="flex justify-center animate-scale-in">
              <button
                onClick={scrollToForm}
                className="btn-premium group px-12 py-4"
              >
                <span className="relative z-10 flex items-center gap-3 text-lg">
                  🔮 开始排盘
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          ) : (
            <div className="animate-scale-in">
              <div className="glass-card p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold">出生信息</h3>
                    <p className="text-sm text-[var(--text-secondary)]">所有数据仅用于计算，不会存储</p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg border border-[var(--border-color)]"
                  >
                    收起 ✕
                  </button>
                </div>
                <BirthInputForm />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CORE PRODUCTS
          ════════════════════════════════════════════════ */}
      <section className="px-4 md:px-6 pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">核心产品</h2>
            <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
              从七个维度，重新认识你自己
            </p>
            <div className="divider-premium max-w-[200px] mt-6" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {products.map((p, i) => (
              <Link key={i} href={p.href} className="group">
                <div className="glass-card p-8 h-full">
                  {/* 顶部渐变装饰条 */}
                  <div className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${p.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />

                  {/* 头部 */}
                  <div className="flex items-start gap-5 mb-6">
                    <div className="icon-ring text-2xl">{p.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold mb-0.5 group-hover:text-[var(--text-accent)] transition-colors">{p.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{p.subtitle}</p>
                    </div>
                    {i === 0 && (
                      <span className="ml-auto px-3 py-1 text-xs font-medium rounded-full bg-[var(--text-accent)]/10 text-[var(--text-accent)] border border-[var(--text-accent)]/20 animate-border-glow">
                        推荐
                      </span>
                    )}
                  </div>

                  {/* 描述 */}
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 whitespace-pre-line">{p.desc}</p>

                  {/* 特性标签 */}
                  <div className="flex flex-wrap gap-2">
                    {p.features.map((f, fi) => (
                      <span key={fi} className="tag-pill text-xs">{f}</span>
                    ))}
                  </div>

                  {/* 互动指示 */}
                  <div className="mt-6 flex items-center gap-1 text-sm text-[var(--text-accent)] opacity-0 group-hover:opacity-100 transition-all translate-x-[-8px] group-hover:translate-x-0">
                    探索 {p.title}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          QUICK TOOLS
          ════════════════════════════════════════════════ */}
      <section className="px-4 md:px-6 pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">更多工具</h2>
            <p className="text-sm text-[var(--text-secondary)]">即用即走，轻量体验</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickTools.map((t, i) => (
              <Link key={i} href={t.href} className="group">
                <div className="glass-card p-5 text-center h-full flex flex-col items-center justify-center">
                  <div className="text-3xl mb-3 transition-transform group-hover:scale-110 duration-300">{t.icon}</div>
                  <h4 className="font-semibold text-sm mb-1 group-hover:text-[var(--text-accent)] transition-colors">{t.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)]">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TRUST / STATS
          ════════════════════════════════════════════════ */}
      <section className="px-4 md:px-6 pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto">
          <div className="founder-card p-10 md:p-14">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">用数据说话</h2>
              <p className="text-sm text-[var(--text-secondary)]">真实用户 · 权威引擎 · 深度AI</p>
              <div className="divider-premium max-w-[160px] mt-5" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {trustStats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="stat-value">
                    {s.value.includes('+') ? (
                      <><AnimatedCounter target={parseInt(s.value.replace(/[,+]/g, ''))} />+</>
                    ) : s.value === '7' ? (
                      <AnimatedCounter target={7} />
                    ) : (
                      s.value
                    )}
                  </div>
                  <div className="text-sm font-semibold mt-2">{s.label}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FOUNDER STORY
          ════════════════════════════════════════════════ */}
      <section className="px-4 md:px-6 pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto">
          <div className="founder-card p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* 头像装饰 */}
              <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[var(--text-accent)] to-[var(--text-accent-gold)] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                ☸
              </div>

              <div>
                <h3 className="text-xl font-bold mb-1">光明喜舍 · 创始故事</h3>
                <p className="text-xs text-[var(--text-accent)] mb-4 font-medium">大理 · 银桥 · 用AI点亮觉知</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  我们相信，每个人的生命都是一幅独一无二的天命蓝图。融合东方七大门派的智慧——
                  八字、人类图、占星、紫微、五运六气、梅花易数、MBTI——借助AI的力量，为你绘制
                  一幅清晰完整的生命图谱。不再迷茫，不再困惑，看见真实的自己。
                </p>
                <div className="mt-5 flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[var(--text-accent)]" />
                    基于《区分的科学》标准
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[var(--text-accent)]" />
                    Swiss Ephemeris WASM
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[var(--text-accent)]" />
                    Ra Uru Hu 原始体系
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          BOTTOM CTA
          ════════════════════════════════════════════════ */}
      <section className="px-4 md:px-6 pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto">
          <div className="cta-section p-10 md:p-14 text-center relative">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                准备好解码你的<span className="gradient-text">生命蓝图</span>了吗？
              </h2>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
                只需一次出生信息，解锁七系统AI融合报告
                <br />
                看见你的天赋、使命与人生节奏
              </p>
              <button
                onClick={scrollToForm}
                className="btn-premium group text-lg"
              >
                <span className="relative z-10 flex items-center gap-2">
                  开始解码 →
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <p className="text-xs text-[var(--text-secondary)] mt-4 opacity-60">
                免费体验 · 无需注册 · 数据仅用于计算，不存储
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
