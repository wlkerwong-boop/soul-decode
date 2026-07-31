'use client';

import { HeroSection } from '@/components/shared';
import { FeatureCard, FeatureCardGrid } from '@/components/shared';
import type { FeatureCardItem } from '@/components/shared';
import Link from 'next/link';
import React from 'react';

/* ── Cosmic gradient background for Hero ── */
const COSMIC_BG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900"><defs><radialGradient id="a" cx="50%" cy="30%" r="70%"><stop offset="0%" stop-color="#1E293B"/><stop offset="50%" stop-color="#0F172A"/><stop offset="100%" stop-color="#020617"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#a)"/><circle cx="20%" cy="15%" r="1.5" fill="rgba(212,175,55,0.6)"/><circle cx="75%" cy="22%" r="1" fill="rgba(212,175,55,0.4)"/><circle cx="50%" cy="10%" r="2" fill="rgba(212,175,55,0.7)"/><circle cx="35%" cy="40%" r="0.8" fill="rgba(212,175,55,0.35)"/><circle cx="65%" cy="55%" r="1.2" fill="rgba(212,175,55,0.5)"/><circle cx="85%" cy="70%" r="0.6" fill="rgba(212,175,55,0.3)"/><circle cx="12%" cy="80%" r="1.8" fill="rgba(212,175,55,0.45)"/><circle cx="90%" cy="12%" r="1" fill="rgba(255,255,255,0.3)"/><circle cx="40%" cy="75%" r="0.7" fill="rgba(255,255,255,0.25)"/></svg>`
)}`;

/* ── Feature card items ── */
const SERVICE_CARDS: FeatureCardItem[] = [
  {
    id: 'master-report',
    icon: <span className="text-2xl">🔮</span>,
    title: '七系统融合报告',
    description: '八字·人类图·占星·紫微·五运六气·MBTI·中医体质，七维交叉印证，AI深度融合——不是七份报告，是一份完整的你。',
  },
  {
    id: 'jiugong',
    icon: <span className="text-2xl">📜</span>,
    title: '九宫学理',
    description: '河图洛书·程天相体系，13维度天赋地图、性格密码、90年人生节律，看见生命的底层代码。',
  },
  {
    id: 'human-design',
    icon: <span className="text-2xl">🧬</span>,
    title: '单项测评',
    description: '人类图排盘·MBTI性格·关系合盘·大五人格——从单一维度开始，逐步拼出完整的自己。',
  },
];

/* ── Book contents list ── */
const BOOK_TOC = [
  { label: '八字命盘分析', desc: '四柱·十神·五行·大运·流年' },
  { label: '人类图解析', desc: '能量类型·人生角色·内在权威·通道与闸门' },
  { label: '紫微斗数', desc: '十二宫·十四主星·四化飞星·格局论断' },
  { label: '占星本命盘', desc: '行星·星座·宫位·相位解读' },
  { label: '五运六气', desc: '黄帝内经体系·先天体质偏性·年度运气' },
  { label: '中医体质辨识', desc: '九种体质·饮食起居·调理建议' },
  { label: 'MBTI × 大五人格', desc: '心理学黄金标准·性格特质·适配领域' },
];

/* ── Explore cards ── */
const EXPLORE_ITEMS = [
  { label: '☸ 法藏', href: '/dharma', desc: '佛法智慧' },
  { label: '🎭 昌宁活动', href: '/events', desc: '线下共修' },
  { label: '🌅 每日运势', href: '/daily', desc: '今日指引' },
  { label: '❤️ 关系合盘', href: '/compatibility', desc: '双人·家庭' },
  { label: '🧠 MBTI测评', href: '/mbti', desc: '16种人格' },
];

/* ── Link-wrapped feature card ── */
function LinkedFeatureCard({ item, href }: { item: FeatureCardItem; href: string }) {
  return (
    <Link href={href} className="block">
      <FeatureCard {...item} />
    </Link>
  );
}

/* ═══════════════════════════════════════════════════
   Home Page
   ═══════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* ── Hero Section ── */}
      <HeroSection
        bgImage={COSMIC_BG}
        title="解码你的生命蓝图"
        subtitle="七系统交叉印证，AI 深度融合——以古老智慧为镜，看清自己本来模样。"
        cta={{
          label: '免费排盘，看看你的出厂配置',
          href: '/master-report',
        }}
        overlayFrom="rgba(15,23,42,0.55)"
        overlayTo="rgba(15,23,42,0.85)"
        align="center"
      />

      {/* ── Core Services: 3 Feature Cards ── */}
      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
              核心服务
            </h2>
            <p className="mx-auto max-w-xl text-lg text-[var(--color-text-muted)]">
              从多个维度理解自己，选择适合你的入口
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <LinkedFeatureCard item={SERVICE_CARDS[0]} href="/master-report" />
            <LinkedFeatureCard item={SERVICE_CARDS[1]} href="/jiugong" />
            <LinkedFeatureCard item={SERVICE_CARDS[2]} href="/human-design" />
          </div>
        </div>
      </section>

      {/* ── Report Preview: Open Book Design ── */}
      <section className="px-6 pb-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
              报告预览
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              一份让你感到「被看穿」的灵魂级分析
            </p>
          </div>

          {/* Book spread */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] lg:flex-row">
            {/* Left page: Table of Contents */}
            <div className="relative flex-shrink-0 border-b border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)]/30 to-transparent p-6 lg:w-72 lg:border-b-0 lg:border-r lg:border-[var(--color-border)]">
              {/* Book spine shadow */}
              <div className="absolute right-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[var(--color-accent)]/40 to-transparent hidden lg:block" />

              <h3 className="mb-5 text-sm font-semibold tracking-widest text-[var(--color-accent)]">
                目 录
              </h3>
              <ul className="space-y-2">
                {BOOK_TOC.map((item, i) => (
                  <li key={i} className="group cursor-default">
                    <div className="rounded-lg px-3 py-2 transition-all group-hover:bg-[var(--color-accent)]/10">
                      <p className="text-sm font-medium text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">
                        {String(i + 1).padStart(2, '0')}. {item.label}
                      </p>
                      <p className="text-xs text-[var(--color-text-dim)]">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right page: Content Preview */}
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="max-w-md space-y-5">
                <div className="text-center">
                  <div className="mb-1 text-xs tracking-widest text-[var(--color-text-dim)]">
                    SOULCODE · 灵魂解码
                  </div>
                  <div className="gradient-text text-lg font-bold md:text-xl">
                    个人生命使命解读报告
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-text-dim)]">
                    基于七大古老智慧系统 · AI 深度融合
                  </div>
                </div>

                <div className="space-y-3 pt-4 text-sm leading-relaxed">
                  {[
                    { highlight: '核心天赋', text: '你的 G 中心被定义，天生带着明确的人生方向感——你不是迷路，你只是在等对的时机。', color: 'text-[var(--color-accent)]' },
                    { highlight: '人生角色', text: '6/2 角色型——前半生在试错中积累智慧，后半生自然散发影响力。你不必着急，节奏自有安排。', color: 'text-[var(--color-accent-light)]' },
                    { highlight: '能量曲线', text: '情绪中心开放，你容易吸收他人情绪。报告将绘制你的专属能量波动图，教你分辨哪些是你的，哪些是别人的。', color: 'text-[var(--color-accent)]' },
                    { highlight: '决策策略', text: '等待邀请不是被动——是在对的邀请出现时，你已准备好。重大决定前，给自己 48 小时的感受周期。', color: 'text-[var(--color-accent-light)]' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`mt-0.5 shrink-0 text-lg ${item.color}`}>✦</span>
                      <div>
                        <span className={`font-semibold ${item.color}`}>{item.highlight}：</span>
                        <span className="text-[var(--color-text-muted)]">{item.text}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gradient fade at bottom */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent lg:left-72" />

                {/* CTA link */}
                <div className="pt-2 text-center">
                  <Link
                    href="/master-report"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] transition-all hover:gap-2"
                  >
                    查看完整报告示例
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── More to Explore: Horizontal Scroll ── */}
      <section className="px-6 pb-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text-muted)]">
              更多探索
            </h2>
            <p className="text-xs text-[var(--color-text-dim)]">
              从不同维度认识自己
            </p>
          </div>

          {/* Horizontal scrollable cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {EXPLORE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex-shrink-0 w-36 snap-start flex flex-col items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/60 p-4 transition-all hover:border-[var(--color-border-hover)] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_var(--color-card-shadow)]"
              >
                <span className="mb-2 text-lg transition-transform group-hover:scale-110">{item.label.slice(0, 2)}</span>
                <span className="text-xs font-medium text-[var(--color-text)]">{item.label.slice(2)}</span>
                <span className="mt-1 text-[10px] text-[var(--color-text-dim)]">{item.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section className="px-6 pb-20 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center gap-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/70 p-8 sm:flex-row sm:items-start">
            {/* Founder photo placeholder */}
            <div className="flex-shrink-0">
              <div className="flex h-[150px] w-[150px] items-center justify-center rounded-full border-2 border-[var(--color-accent)]/40 bg-[var(--color-primary)]/50 text-4xl text-[var(--color-accent)]/60">
                ✦
              </div>
            </div>

            {/* About text */}
            <div className="space-y-3 text-center sm:text-left">
              <h3 className="text-xl font-bold text-[var(--color-text)]">
                关于光明喜舍
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                2016 年起深入研习心理学人格理论、东方传统文化与人类图体系。
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                多维度测评融合并非简单堆叠——心理学为基、人类图为骨、传统文化为脉。多个维度交叉印证，才是一份真正完整的自我认知报告。
              </p>
              <p className="text-xs text-[var(--color-text-dim)]">
                目前在大理 · 银桥持续深耕
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="relative rounded-2xl border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-accent)]/8 to-transparent p-8 md:p-10 overflow-hidden">
            <div className="pointer-events-none absolute top-[-50%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[var(--color-accent)]/5 blur-[100px]" />
            <div className="relative">
              <h2 className="mb-2 text-xl font-bold text-[var(--color-text)] md:text-2xl">
                准备好发现真实的自己了吗？
              </h2>
              <p className="mb-6 text-sm text-[var(--color-text-muted)]">
                输入出生信息，即可获得一份专属于你的深度自我认知报告
              </p>
              <a
                href="/master-report"
                className="inline-flex items-center rounded-[var(--radius-full)] bg-[var(--color-accent)] px-8 py-3.5 text-base font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-accent-light)] hover:shadow-[0_0_30px_var(--color-accent)] hover:scale-105"
              >
                免费排盘，看看你的出厂配置
              </a>
              <p className="mt-4 text-xs text-[var(--color-text-dim)]">
                🔒 出生信息仅用于排盘，绝不外泄
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
