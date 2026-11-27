'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── 报告实际使用的传统视角（每 15s 轮播）──
const SYSTEM_CAROUSEL = [
  {
    system: '八字四柱',
    emoji: '🀄',
    text: '八字四柱提供一种传统的时间结构视角。报告会列出四柱和五行计数，供您与自己的真实经历对照。',
  },
  {
    system: '人类图',
    emoji: '🧬',
    text: '人类图会展示类型、角色、权威和通道。它们是探索节奏与决策体验的提问线索，不是能力或性格结论。',
  },
  {
    system: '紫微斗数',
    emoji: '⭐',
    text: '紫微斗数会展示十二宫与星曜分布。相关解读属于传统象征视角，需要结合现实经历判断是否有帮助。',
  },
  {
    system: '占星星盘',
    emoji: '🔭',
    text: '占星部分展示本次算出的行星位置，并提供开放式观察问题；报告不会凭星盘判定能力或未来。',
  },
  {
    system: '五运六气',
    emoji: '🌊',
    text: '五运六气按报告标明的年份口径呈现传统节律信息，不据此推断个人体质、疾病或健康风险。',
  },
];

interface ReportWaitingProps {
  /** 报告类型，影响预估时间 */
  type?: 'personal' | 'compatibility';
  /** 是否已收到首字（进入流式阶段） */
  isStreaming: boolean;
  /** 已等待秒数 */
  elapsedSeconds: number;
  /** 当前报告字数 */
  charCount: number;
  /** 目标总字数（用于流式进度估算） */
  targetChars?: number;
  /** 错误信息 */
  error?: string;
  /** 重试 */
  onRetry?: () => void;
}

export default function ReportWaiting({
  type = 'personal',
  isStreaming,
  elapsedSeconds,
  charCount,
  targetChars = 13000,
  error,
  onRetry,
}: ReportWaitingProps) {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const startTimeRef = useRef(Date.now());

  // 重置轮播（当重新 loading 时）
  useEffect(() => {
    startTimeRef.current = Date.now();
    setCarouselIdx(0);
  }, []);

  // 轮播每 15 秒切换
  useEffect(() => {
    if (isStreaming) return; // 流式开始后停轮播
    const timer = setInterval(() => {
      setCarouselIdx(c => (c + 1) % SYSTEM_CAROUSEL.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [isStreaming]);

  // ── 进度计算 ──
  const totalEstimate = type === 'personal' ? 210 : 180; // 秒
  const estimateLabel = type === 'personal' ? '深度报告通常需要 3-4 分钟' : '合盘报告通常需要 3 分钟左右';

  // 进度百分比：前 10 秒 0→5%，之后按时间线性推进（最多到 95%，留 5% 给结束清算）
  const timeProgress = Math.min(95,
    elapsedSeconds <= 10
      ? (elapsedSeconds / 10) * 5
      : 5 + ((elapsedSeconds - 10) / (totalEstimate - 10)) * 90
  );

  // 流式进度：按字数估算
  const streamProgress = Math.min(99, (charCount / targetChars) * 100);

  // 实际显示进度
  const displayProgress = isStreaming ? Math.max(timeProgress, streamProgress) : timeProgress;

  // ── 格式化时间 ──
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} 分 ${s} 秒`;
  };

  // ── 当前轮播项 ──
  const currentCarousel = SYSTEM_CAROUSEL[carouselIdx];

  // ── 流式阶段：仅显示顶部细进度条 ──
  if (isStreaming) {
    return (
      <div className="max-w-lg mx-auto mb-6">
        {/* 细进度条 */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-1.5 bg-[var(--bg-highlight)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--text-accent)] to-emerald-400 rounded-full transition-all duration-[2000ms] ease-out"
              style={{ width: `${streamProgress}%` }}
            />
          </div>
          <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap tabular-nums">
            {charCount.toLocaleString()} 字
          </span>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] text-center">
          ✨ 报告正在生成中 · 已等待 {formatTime(elapsedSeconds)}
        </p>

        {/* 错误仍然显示在流式阶段 */}
        {error && (
          <div className="card-jade p-4 mt-4 text-center border-red-400/30">
            <p className="text-red-400 text-sm mb-3">❌ {error}</p>
            {onRetry && (
              <button onClick={onRetry}
                className="px-6 py-2 rounded-xl bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30 transition-all">
                🔄 重新生成
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── 等待阶段：完整等待页 ──
  return (
    <div className="max-w-lg mx-auto mb-8">
      <div className="card-jade p-8 text-center">
        {/* 诚实计时器 */}
        <div className="mb-6">
          <p className="text-2xl font-bold text-[var(--text-accent)] tabular-nums mb-1">
            {formatTime(elapsedSeconds)}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {estimateLabel}
          </p>
        </div>

        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-[var(--text-tertiary)]">正在解码</span>
            <span className="text-xs text-[var(--text-accent)] font-semibold tabular-nums">
              {displayProgress.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-[var(--bg-highlight)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--text-accent)] to-emerald-400 rounded-full transition-all duration-[3000ms] ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          {/* 进度锚点 */}
          <div className="flex justify-between mt-1.5 px-1">
            <span className="text-[10px] text-[var(--text-tertiary)]">首字</span>
            <span className="text-[10px] text-[var(--text-tertiary)]">排盘</span>
            <span className="text-[10px] text-[var(--text-tertiary)]">解读</span>
            <span className="text-[10px] text-[var(--text-tertiary)]">成稿</span>
          </div>
        </div>

        {/* 系统介绍轮播 */}
        <div className="py-4 mb-4 min-h-[120px] flex flex-col justify-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">{currentCarousel.emoji}</span>
            <p className="text-sm font-semibold text-[var(--text-accent)]">
              {currentCarousel.system}
            </p>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed animate-fade-in">
            {currentCarousel.text}
          </p>
          {/* 轮播指示器 */}
          <div className="flex justify-center gap-1.5 mt-4">
            {SYSTEM_CAROUSEL.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  i === carouselIdx ? 'bg-[var(--text-accent)] w-3' : 'bg-[var(--border-color)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 报告目录预览 */}
        <div className="text-left bg-[var(--bg-highlight)] rounded-xl p-4 text-xs text-[var(--text-tertiary)] space-y-1.5">
          <p className="text-[var(--text-secondary)] font-semibold mb-2">📑 报告包含</p>
          {type === 'personal' ? <>
            <p>第 0 章 · 排盘数据声明</p>
            <p>第 1–2 章 · 核心命盘与多视角观察</p>
            <p>第 3–5 章 · 人生阶段、方向与情绪养护</p>
            <p>第 6–7 章 · 实践清单与最终寄语</p>
          </> : <>
            <p>排盘数据声明与成员对照</p>
            <p>关系互动、沟通话术与实践建议</p>
            <p>最终寄语与使用边界</p>
          </>}
          <p className="text-[var(--text-accent)]">以实际生成内容为准，可在完成后下载报告</p>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="card-jade p-5 mt-4 text-center border-red-400/30">
          <p className="text-red-400 text-sm mb-3">❌ {error}</p>
          {onRetry && (
            <button onClick={onRetry}
              className="px-6 py-2 rounded-xl bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30 transition-all">
              🔄 重新生成
            </button>
          )}
        </div>
      )}
    </div>
  );
}
