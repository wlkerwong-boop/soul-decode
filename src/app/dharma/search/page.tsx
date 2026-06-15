'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  topics,
  categoryInfo,
  categoryColors,
  categoryBorderColors,
  categoryTextColors,
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

// ── 分类标签 ──────────────────────────────────────────
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

// ── 高亮匹配文本 ──────────────────────────────────────────
function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-[var(--text-accent)]/20 text-[var(--text-primary)] rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');

  // ── 搜索结果 ──────────────────────────────────────────
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return topics.filter((topic) => {
      const searchFields = [
        topic.title,
        topic.subtitle,
        topic.description,
        topic.details,
        topic.quote,
        ...topic.keyPoints,
      ];
      return searchFields.some((field) => field.toLowerCase().includes(q));
    });
  }, [query]);

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
              <span className="opacity-50 hidden md:inline">全文搜索 · 检索所有主题</span>
            </div>
          </div>
        </nav>

        {/* ── 搜索区域 ──────────────────────────────────── */}
        <section className="px-6 pt-16 pb-8 text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4">
            <span className="tag-pill text-xs tracking-widest">寂如师父 · 全文搜索</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            🔍 搜索法藏
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            搜索22个主题中的标题、描述、法义要点与开示金句
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[var(--text-secondary)]">
                🔍
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="输入关键词搜索法义..."
                className="input-jade w-full pl-12 pr-10 py-4 text-base rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-card)] focus:border-[var(--text-accent)] focus:ring-2 focus:ring-[var(--text-accent)]/20 outline-none transition-all duration-200 placeholder:text-[var(--text-secondary)]/40"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-lg"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── 金色分隔 ─────────────────────────────────── */}
        <div className="gold-divider max-w-5xl mx-auto mb-8" />

        {/* ── 搜索结果 ──────────────────────────────────── */}
        <section className="px-6 pb-16 max-w-6xl mx-auto">
          {query.trim() === '' ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-6 opacity-30">🔍</div>
              <p className="text-lg text-[var(--text-secondary)] mb-2">输入关键词开始搜索</p>
              <p className="text-sm text-[var(--text-secondary)]/60">
                可搜索主题标题、副标题、描述、详细内容、核心要点与开示金句
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-6 opacity-30">📭</div>
              <p className="text-lg text-[var(--text-secondary)] mb-2">未找到相关主题</p>
              <p className="text-sm text-[var(--text-secondary)]/60">
                未搜索到与&ldquo;{query}&rdquo;匹配的内容，请尝试其他关键词
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[var(--text-secondary)]">
                  共找到{' '}
                  <span className="font-bold text-[var(--text-accent)]">{results.length}</span>{' '}
                  个匹配主题
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((topic, i) => (
                  <Link
                    key={topic.id}
                    href={`/dharma/treasury#${topic.id}`}
                    className="group p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--text-accent)]/40 transition-all duration-300 cursor-pointer block"
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
                      {highlightText(topic.title, query)}
                    </h3>
                    <p className="text-xs text-[var(--text-accent)] mb-3 leading-relaxed">
                      {highlightText(topic.subtitle, query)}
                    </p>

                    {/* 描述 */}
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-2">
                      {highlightText(topic.description, query)}
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
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── 底部 ──────────────────────────────────────── */}
        <footer className="border-t border-[var(--border-color)] py-8 px-6">
          <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)]">
            <p>🔍 寂如法藏 · 全文搜索 · 22主题</p>
            <p className="mt-1">跨模块全文搜索，快速定位所需开示内容</p>
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
