'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  topics,
  categoryInfo,
  categoryColors,
  categoryBorderColors,
  categoryTextColors,
  getRelatedTopics,
  type DharmaTopic,
  type TopicCategory,
} from '@/data/dharma/topics';

// ── 卡片装饰色 ──────────────────────────────────────────
function getCardAccent(index: number): string {
  const colors = [
    'rgba(201, 169, 110, 0.08)',
    'rgba(74, 222, 128, 0.06)',
    'rgba(96, 165, 250, 0.06)',
    'rgba(251, 146, 60, 0.06)',
    'rgba(192, 132, 252, 0.06)',
    'rgba(244, 114, 182, 0.06)',
  ];
  return colors[index % colors.length];
}

function getIconBorder(index: number): string {
  const colors = [
    'rgba(201, 169, 110, 0.25)',
    'rgba(74, 222, 128, 0.2)',
    'rgba(96, 165, 250, 0.2)',
    'rgba(251, 146, 60, 0.2)',
    'rgba(192, 132, 252, 0.2)',
    'rgba(244, 114, 182, 0.2)',
  ];
  return colors[index % colors.length];
}

// ── 分类标签组件 ──────────────────────────────────────────
function CategoryBadge({ category }: { category: TopicCategory }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: categoryColors[category],
        border: `1px solid ${categoryBorderColors[category]}`,
        color: categoryTextColors[category],
      }}
    >
      {categoryInfo[category].icon} {category}
    </span>
  );
}

// ── 主题详情弹窗 ──────────────────────────────────────────
function TopicModal({
  topic,
  onClose,
}: {
  topic: DharmaTopic;
  onClose: () => void;
}) {
  const relatedTopics = getRelatedTopics(topic);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-[var(--text-accent)]/30 bg-[var(--bg-card)] p-8 scrollbar-hide"
        onClick={e => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-lg"
        >
          ✕
        </button>

        {/* 头部 */}
        <div className="flex items-start gap-5 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 shrink-0"
            style={{
              borderColor: categoryBorderColors[topic.category],
              background: categoryColors[topic.category],
            }}
          >
            {topic.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-[var(--text-accent)]">
                {topic.title}
              </h2>
              <CategoryBadge category={topic.category} />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{topic.subtitle}</p>
          </div>
        </div>

        {/* 详细描述 */}
        <div className="mb-6 p-5 rounded-xl bg-[var(--bg-section-alt)] border border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{topic.details}</p>
        </div>

        {/* 代表性金句 */}
        <div className="mb-6 p-5 rounded-xl border border-[var(--text-accent)]/15 bg-[var(--text-accent)]/5">
          <div className="flex items-start gap-2">
            <span className="text-lg shrink-0 mt-0.5">🪷</span>
            <div>
              <p className="text-xs text-[var(--text-accent)] mb-2 font-bold">代表性法义金句</p>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">
                &ldquo;{topic.quote}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* 知识要点 */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[var(--text-accent)] mb-3">📌 核心法义要点</h3>
          <div className="flex flex-wrap gap-2">
            {topic.keyPoints.map((point, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-[var(--text-accent)]/8 border border-[var(--text-accent)]/15 text-xs text-[var(--text-primary)]"
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* 关联主题 */}
        {relatedTopics.length > 0 && (
          <div className="pt-4 border-t border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-accent)] mb-3">🔗 关联主题推荐</h3>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map(rt => (
                <span
                  key={rt.id}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)] bg-[var(--bg-card)]"
                >
                  {rt.icon} {rt.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TreasuryPage() {
  const [selectedTopic, setSelectedTopic] = useState<DharmaTopic | null>(null);
  const [activeCategory, setActiveCategory] = useState<TopicCategory | 'all'>('all');

  const categories: (TopicCategory | 'all')[] = ['all', '基础', '实修', '生活', '全局'];
  const filteredTopics = activeCategory === 'all' ? topics : topics.filter(t => t.category === activeCategory);

  return (
    <div className="relative min-h-screen gradient-bg">
      <div className="relative z-10 min-h-screen">
        {/* ── 导航 ──────────────────────────────────────── */}
        <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="gradient-text text-xl font-bold tracking-wider">
                ✦ 灵魂解码
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <Link href="/dharma" className="hover:text-[var(--text-accent)] transition-colors">
              ☸ 法藏
            </Link>
            <span className="opacity-50 hidden md:inline">·</span>
            <span className="opacity-50 hidden md:inline">寂如法藏 · 22主题</span>
          </div>
          </div>
        </nav>

        {/* ── 顶部区域 ──────────────────────────────────── */}
        <section className="px-6 pt-12 pb-6 text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4">
            <span className="tag-pill text-xs tracking-widest">寂如师父 · 全部开示主题</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            📖 寂如法藏
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto">
            22个主题 · 552万字开示 · 系统整理寂如师父全部法语
          </p>
        </section>

        {/* ── 金色分隔 ─────────────────────────────────── */}
        <div className="gold-divider max-w-5xl mx-auto mb-8" />

        {/* ── 分类筛选 ──────────────────────────────────── */}
        <section className="px-6 pb-6 max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => {
              const label = cat === 'all' ? '全部' : categoryInfo[cat].title;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--text-accent)]/15 border border-[var(--text-accent)]/30 text-[var(--text-accent)]'
                      : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat === 'all' ? '' : categoryInfo[cat].icon + ' '}
                  {label}
                  {cat !== 'all' && (
                    <span className="ml-1.5 opacity-60">({categoryInfo[cat].count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 主题卡片网格 ──────────────────────────────── */}
        <section className="px-6 pb-16 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTopics.map((topic, i) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="group p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--text-accent)]/40 transition-all duration-300 cursor-pointer"
              >
                {/* 图标 */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 border"
                  style={{
                    background: getCardAccent(i),
                    borderColor: getIconBorder(i),
                  }}
                >
                  {topic.icon}
                </div>

                {/* 分类标签 */}
                <div className="mb-2">
                  <CategoryBadge category={topic.category} />
                </div>

                {/* 标题与副标题 */}
                <h3 className="text-lg font-bold mb-1 text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                  {topic.title}
                </h3>
                <p className="text-xs text-[var(--text-accent)] mb-3 leading-relaxed">
                  {topic.subtitle}
                </p>

                {/* 描述 */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-2">
                  {topic.description}
                </p>

                {/* 底部 */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">
                    📌 {topic.keyPoints.length} 项核心法义
                  </span>
                  <span className="text-xs text-[var(--text-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                    查看详情 →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 主题详情弹窗 ──────────────────────────────── */}
        {selectedTopic && (
          <TopicModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
        )}

        {/* ── 底部 ──────────────────────────────────────── */}
        <footer className="border-t border-[var(--border-color)] py-8 px-6">
          <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)]">
            <p>📖 寂如法藏 · 22主题 · 552万字开示 · 双师传承</p>
            <p className="mt-1">寂如师父致力于传承佛陀正法，以佛法智慧引导现代人走向觉醒与解脱</p>
            <p className="mt-2">
              <Link href="/dharma" className="hover:text-[var(--text-accent)] transition-colors opacity-60 hover:opacity-100">
                ← 返回法藏首页
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
