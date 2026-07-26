'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── 七系统介绍文案（每 15s 轮播）──
const SYSTEM_CAROUSEL = [
  {
    system: '八字四柱',
    emoji: '🀄',
    text: '八字是你的"先天出厂设置"——年柱定根骨、月柱观天赋、日柱见本我、时柱看志向。它将解读你的五行元素配比和运势走势，帮你理解为什么有些事情天生顺手，有些则需要刻意修炼。',
  },
  {
    system: '人类图',
    emoji: '🧬',
    text: '人类图是你的"能量使用说明书"——揭示你是建设者、投射者、显示者还是反映者。它将告诉你如何做决策最省力（权威策略），以及你与生俱来的天赋通道在哪些领域发光。',
  },
  {
    system: '紫微斗数',
    emoji: '⭐',
    text: '紫微斗数是你的"人生十二宫地图"——命宫定格局、夫妻宫看关系、财帛宫观财富、官禄宫见事业。十四主星落于各宫，排列出你一生的重要课题和高光时刻。',
  },
  {
    system: '占星星盘',
    emoji: '🔭',
    text: '星盘是你的"宇宙出生快照"——太阳星座显意识自我，月亮星座见情绪底色，上升星座是你与世界的接口。行星相位揭示内在张力与天赋，是理解情绪模式的重要线索。',
  },
  {
    system: '五运六气',
    emoji: '🌊',
    text: '五运六气是你与天地节律的共振频率——出生年份决定了你的"运气密码"，揭示先天体质偏向、脏腑盛衰以及不同年份的健康重点。了解它，就是拿到了身体的预防手册。',
  },
  {
    system: 'MBTI人格',
    emoji: '🧠',
    text: 'MBTI是你的"思维操作系统"——从能量来源（E/I）、信息接收（S/N）、决策方式（T/F）、生活态度（J/P）四个维度定位你的认知偏好。交叉验证其他系统的结论，让自我认知更立体。',
  },
  {
    system: '中医体质',
    emoji: '🌿',
    text: '中医体质是你的"身体底色"——平和质、气虚质、阳虚质、阴虚质、痰湿质、湿热质、血瘀质、气郁质、特禀质，九种体质对应不同的饮食、作息和调理策略，让你学会"治未病"。',
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
          <p>第一章 · 你的出厂配置（八字+人类图总览）</p>
          <p>第二章 · 思维引擎（MBTI×大五人格）</p>
          <p>第三章 · 情绪与关系（占星×合盘）</p>
          <p>第四章 · 身体与健康（五运六气×中医体质）</p>
          <p>第五章 · 天赋与方向（七系统交叉解读）</p>
          <p className="text-[var(--text-accent)]">七大系统交叉融合 · 深度图文报告</p>
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
