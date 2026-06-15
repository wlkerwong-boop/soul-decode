'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  topics,
  categoryInfo,
  categoryColors,
  categoryBorderColors,
  categoryTextColors,
  getTopicsByCategory,
  type TopicCategory,
  type DharmaTopic,
} from '@/data/dharma/topics';

// ── 四阶段顺序 ──────────────────────────────────────────
const STAGES: { key: TopicCategory; order: number }[] = [
  { key: '基础', order: 0 },
  { key: '实修', order: 1 },
  { key: '生活', order: 2 },
  { key: '全局', order: 3 },
];

// ── localStorage 键 ──────────────────────────────────────
const STORAGE_KEY = 'dharma_sequence_read';

function getReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

// ── 阶段之间的连接线 ──────────────────────────────────────
function StageConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div className="flex justify-center py-1">
      <div
        className={`w-0.5 h-6 rounded-full transition-colors duration-500 ${
          isComplete ? 'bg-[var(--text-accent)]/50' : 'bg-[var(--border-color)]'
        }`}
      />
    </div>
  );
}

// ── 主题卡片 ──────────────────────────────────────────
function TopicCard({
  topic,
  isRead,
  onToggle,
  stageIndex,
}: {
  topic: DharmaTopic;
  isRead: boolean;
  onToggle: (id: string) => void;
  stageIndex: number;
}) {
  const accent = [
    'rgba(201, 169, 110, 0.08)',
    'rgba(74, 222, 128, 0.06)',
    'rgba(96, 165, 250, 0.06)',
    'rgba(251, 146, 60, 0.06)',
    'rgba(192, 132, 252, 0.06)',
    'rgba(244, 114, 182, 0.06)',
  ][stageIndex % 6];

  const borderAccent = [
    'rgba(201, 169, 110, 0.25)',
    'rgba(74, 222, 128, 0.2)',
    'rgba(96, 165, 250, 0.2)',
    'rgba(251, 146, 60, 0.2)',
    'rgba(192, 132, 252, 0.2)',
    'rgba(244, 114, 182, 0.2)',
  ][stageIndex % 6];

  return (
    <div
      className={`group relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 ${
        isRead
          ? 'border-[var(--text-accent)]/30 bg-[var(--text-accent)]/5'
          : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--text-accent)]/30'
      }`}
    >
      {/* 复选框 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggle(topic.id);
        }}
        className={`mt-1 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
          isRead
            ? 'bg-[var(--text-accent)] border-[var(--text-accent)]'
            : 'border-[var(--border-color)] hover:border-[var(--text-accent)]/50'
        }`}
        title={isRead ? '标记为未读' : '标记为已读'}
      >
        {isRead && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* 卡片主体 */}
      <Link href={`/dharma/treasury#${topic.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 border"
            style={{ background: accent, borderColor: borderAccent }}
          >
            {topic.icon}
          </div>
          <div className="min-w-0">
            <h4
              className={`text-sm font-bold truncate transition-colors ${
                isRead ? 'text-[var(--text-accent)]' : 'text-[var(--text-primary)] group-hover:text-[var(--text-accent)]'
              }`}
            >
              {topic.number}. {topic.title}
            </h4>
            <p
              className={`text-xs truncate ${
                isRead ? 'text-[var(--text-accent)]/60' : 'text-[var(--text-secondary)]'
              }`}
            >
              {topic.subtitle}
            </p>
          </div>
        </div>
        <p
          className={`text-xs leading-relaxed line-clamp-1 ${
            isRead ? 'text-[var(--text-secondary)]/50' : 'text-[var(--text-secondary)]'
          }`}
        >
          {topic.description}
        </p>
      </Link>
    </div>
  );
}

export default function SequencePage() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [expandedStages, setExpandedStages] = useState<Set<TopicCategory>>(
    new Set(['基础'])
  );
  const [mounted, setMounted] = useState(false);

  // ── 初始化 ──────────────────────────────────────────
  useEffect(() => {
    setReadIds(getReadIds());
    setMounted(true);
  }, []);

  const toggleRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveReadIds(next);
      return next;
    });
  }, []);

  const toggleStage = useCallback((key: TopicCategory) => {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const totalTopics = topics.length;
  const completedCount = mounted ? [...readIds].filter((id) =>
    topics.some((t) => t.id === id)
  ).length : 0;
  const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  // ── 按阶段组织主题 ──────────────────────────────────────
  const stageTopics = STAGES.map(({ key }) => ({
    key,
    info: categoryInfo[key],
    topics: getTopicsByCategory(key),
  }));

  // 检查一个阶段是否全部读完
  const isStageComplete = (cat: TopicCategory) => {
    const stageT = getTopicsByCategory(cat);
    return stageT.length > 0 && stageT.every((t) => readIds.has(t.id));
  };

  // 检查阶段是否部分完成
  const stageProgress = (cat: TopicCategory) => {
    const stageT = getTopicsByCategory(cat);
    if (stageT.length === 0) return 0;
    const done = stageT.filter((t) => readIds.has(t.id)).length;
    return Math.round((done / stageT.length) * 100);
  };

  // ── 重置进度 ──────────────────────────────────────────
  const handleReset = () => {
    if (confirm('确定要重置所有进度吗？此操作不可撤销。')) {
      setReadIds(new Set());
      localStorage.removeItem(STORAGE_KEY);
    }
  };

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
              <span className="opacity-50 hidden md:inline">修学路径 · 次第指引</span>
            </div>
          </div>
        </nav>

        {/* ── 顶部区域 ──────────────────────────────────── */}
        <section className="px-6 pt-12 pb-6 text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4">
            <span className="tag-pill text-xs tracking-widest">寂如师父 · 修学路径</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            🧭 修学路径
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto">
            从基础到全局，四个阶段系统修学。按顺序逐步深入，亦可按需选择主题。
          </p>
        </section>

        {/* ── 进度指示器 ──────────────────────────────────── */}
        {mounted && (
          <section className="px-6 pb-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl border border-[var(--text-accent)]/20 bg-[var(--bg-card)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text-primary)]">📊 修学进度</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {completedCount}/{totalTopics} 已完成
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-[var(--text-secondary)]/50 hover:text-red-400 transition-colors"
                >
                  重置进度
                </button>
              </div>
              {/* 进度条 */}
              <div className="w-full h-2.5 rounded-full bg-[var(--bg-section-alt)] border border-[var(--border-color)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progressPct}%`,
                    background: `linear-gradient(90deg, var(--text-accent), var(--text-accent-gold))`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--text-secondary)] text-right">
                {progressPct}%
              </p>
            </div>
          </section>
        )}

        {/* ── 金色分隔 ─────────────────────────────────── */}
        <div className="gold-divider max-w-5xl mx-auto mb-8" />

        {/* ── 阶段路径 ──────────────────────────────────── */}
        <section className="px-6 pb-16 max-w-3xl mx-auto">
          <div className="relative">
            {stageTopics.map(({ key, info, topics: stageT }, idx) => {
              const isExpanded = expandedStages.has(key);
              const isComplete = isStageComplete(key);
              const progress = stageProgress(key);

              return (
                <div key={key} className="relative">
                  {/* 阶段之间的连接线 */}
                  {idx > 0 && (
                    <StageConnector
                      isComplete={isStageComplete(STAGES[idx - 1].key)}
                    />
                  )}

                  {/* 阶段标题 */}
                  <div
                    onClick={() => toggleStage(key)}
                    className={`group flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
                      isComplete
                        ? 'border-[var(--text-accent)]/30 bg-[var(--text-accent)]/5'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--text-accent)]/30'
                    }`}
                  >
                    {/* 图标 */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2 transition-all duration-300 ${
                        isComplete
                          ? 'border-[var(--text-accent)] bg-[var(--text-accent)]/10'
                          : ''
                      }`}
                      style={{
                        borderColor: isComplete
                          ? undefined
                          : categoryBorderColors[key],
                        background: isComplete
                          ? undefined
                          : categoryColors[key],
                      }}
                    >
                      {isComplete ? '✅' : info.icon}
                    </div>

                    {/* 标题信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3
                          className={`text-lg font-bold transition-colors ${
                            isComplete
                              ? 'text-[var(--text-accent)]'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {info.title}
                        </h3>
                        {isComplete && (
                          <span className="text-xs text-[var(--text-accent)]">· 已完成</span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mb-2">{info.description}</p>
                      {/* 阶段内进度 */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-section-alt)] border border-[var(--border-color)] overflow-hidden max-w-[120px]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                              background: categoryTextColors[key],
                            }}
                          />
                        </div>
                        <span className="text-xs text-[var(--text-secondary)]">
                          {stageT.filter((t) => readIds.has(t.id)).length}/{stageT.length}
                        </span>
                      </div>
                    </div>

                    {/* 展开/收起图标 */}
                    <span
                      className={`text-[var(--text-secondary)] transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </div>

                  {/* 展开的主题列表 */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isExpanded ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
                    }`}
                  >
                    <div className="space-y-2.5 pl-4 border-l-2 border-[var(--border-color)] ml-7 pb-1">
                      {stageT.map((topic) => (
                        <TopicCard
                          key={topic.id}
                          topic={topic}
                          isRead={readIds.has(topic.id)}
                          onToggle={toggleRead}
                          stageIndex={idx}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 底部 ──────────────────────────────────────── */}
        <footer className="border-t border-[var(--border-color)] py-8 px-6">
          <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)]">
            <p>🧭 寂如法藏 · 修学路径 · {totalTopics}主题 · 四个阶段</p>
            <p className="mt-1">从基础到全局，系统修学寂如师父开示</p>
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
