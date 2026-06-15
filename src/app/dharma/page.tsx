'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { wisdomQuotes, categoryInfo } from '@/data/dharma/topics';

function getRandomQuote() {
  return wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];
}

export default function DharmaPage() {
  const [quote, setQuote] = useState(wisdomQuotes[0]);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  const refreshQuote = () => setQuote(getRandomQuote());

  const entryCards = [
    {
      icon: '📖',
      title: '寂如法藏',
      subtitle: '22主题 · 系统修学',
      description: '寂如师父全部开示内容，按主题系统整理为22个知识模块，涵盖基础见地、实修方法、生活运用与全局视野。',
      href: '/dharma/treasury',
      color: 'rgba(201, 169, 110, 0.08)',
      borderColor: 'rgba(201, 169, 110, 0.25)',
    },
    {
      icon: '🧭',
      title: '修学路径',
      subtitle: '次第 · 指引',
      description: '基于寂如师父22个主题的修学次第规划，从基础到全局的渐进式学习路径。',
      href: '/dharma/sequence',
      color: 'rgba(74, 222, 128, 0.06)',
      borderColor: 'rgba(74, 222, 128, 0.2)',
    },
    {
      icon: '🔍',
      title: '搜索',
      subtitle: '全文检索 · 智能查找',
      description: '跨模块全文搜索，快速定位所需开示内容，精准找到相关法义。',
      href: '/dharma/search',
      color: 'rgba(96, 165, 250, 0.06)',
      borderColor: 'rgba(96, 165, 250, 0.2)',
    },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* ── 导航 ── */}
      <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="gradient-text text-xl font-bold tracking-wider">
              ✦ 灵魂解码
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <Link href="/my" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              📁 档案
            </Link>
            <Link href="/health" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              身心健康
            </Link>
            <Link href="/mbti" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              MBTI性格
            </Link>
            <Link href="/astrology" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              星座占星
            </Link>
            <Link href="/tcm" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              中医通鉴
            </Link>
            <Link href="/dharma" className="text-[var(--text-accent)] transition-colors hidden sm:inline font-semibold">
              ☸ 法藏
            </Link>
            <span className="opacity-60 hidden md:inline">·</span>
            <span className="opacity-60 hidden md:inline">寂如师父 · 佛法修学</span>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-16 pb-8 text-center max-w-4xl mx-auto">
        <div className="inline-block mb-6">
          <span className="tag-pill text-xs tracking-widest">寂如师父开示 · 佛法修学知识库</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
          ☸ 法藏
          <br />
          <span className="gradient-text">Dhārma Treasury</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto mb-4">
          系统整理寂如师父全部开示内容
          <br className="hidden sm:inline" />
          构建可溯源、可系统修学的佛法知识体系
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <span className="tag-pill">📖 22主题</span>
          <span className="tag-pill">📝 552万字开示</span>
          <span className="tag-pill">🧘 实修次第</span>
          <span className="tag-pill">🪷 般若智慧</span>
        </div>
      </section>

      {/* ── 金色分隔 ── */}
      <div className="gold-divider max-w-5xl mx-auto mb-12" />

      {/* ── 入口卡片 ── */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">知识宝库</h2>
          <p className="text-sm text-[var(--text-secondary)]">选择入口，开始你的法藏探索</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {entryCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <div
                className="group p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--text-accent)]/40 transition-all duration-300 cursor-pointer"
                style={{ background: card.color, borderColor: card.borderColor }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 border"
                  style={{ background: card.color, borderColor: card.borderColor }}
                >
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold mb-1 text-[var(--text-primary)]">
                  {card.title}
                </h3>
                <p className="text-xs text-[var(--text-accent)] mb-3">{card.subtitle}</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 金色分隔 ── */}
      <div className="gold-divider max-w-5xl mx-auto mb-12" />

      {/* ── 随机法语 ── */}
      <section className="px-6 pb-12 max-w-3xl mx-auto text-center">
        <h2 className="text-lg font-bold mb-6 gradient-text">✦ 随机法语</h2>
        <div
          className="p-8 rounded-xl border border-[var(--text-accent)]/20 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all duration-300 cursor-pointer"
          onClick={refreshQuote}
          title="点击刷新"
        >
          <p className="text-base text-[var(--text-primary)] leading-relaxed italic mb-4">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-xs text-[var(--text-accent)]">—— {quote.source}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-4">点击刷新法语</p>
        </div>
      </section>

      {/* ── 金色分隔 ── */}
      <div className="gold-divider max-w-5xl mx-auto mb-12" />

      {/* ── 分类概览 ── */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">修学架构</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(categoryInfo).map(([key, info]) => (
            <div
              key={key}
              className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center card-jade"
            >
              <div className="text-3xl mb-3">{info.icon}</div>
              <h3 className="font-bold text-[var(--text-primary)] mb-1">{info.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-2">{info.description}</p>
              <span className="tag-pill text-xs">{info.count} 主题</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 底部 ── */}
      <footer className="border-t border-[var(--border-color)] py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)]">
          <p>☸ 法藏 Dhārma Treasury · 22主题 · 552万字开示</p>
          <p className="mt-1">寂如师父开示 · 佛法修学知识库</p>
          <p className="mt-2">
            <Link href="/" className="hover:text-[var(--text-accent)] transition-colors opacity-60 hover:opacity-100">
              ← 返回首页
            </Link>
            <span className="mx-3">·</span>
            <Link href="/dharma/treasury" className="hover:text-[var(--text-accent)] transition-colors opacity-60 hover:opacity-100">
              浏览全部主题
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
