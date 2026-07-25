'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BigFiveScores, BigFiveResult } from '@/data/ipip50';
import { getBigFiveResults, BIGFIVE_DISCLAIMER } from '@/data/ipip50';

/* ═══════════════════════════════════════════
   SVG 五维雷达图（纯前端，无外部依赖）
   ═══════════════════════════════════════════ */
function RadarChart({ scores }: { scores: BigFiveScores }) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 140;
  const minScore = 10;
  const maxScore = 50;

  const dims: Array<{ key: keyof BigFiveScores; label: string }> = [
    { key: 'E', label: '外向性' },
    { key: 'A', label: '宜人性' },
    { key: 'C', label: '尽责性' },
    { key: 'N', label: '神经质' },
    { key: 'O', label: '开放性' },
  ];

  // 五边形顶点角度（顶端正上方开始，顺时针）
  const angles = dims.map((_, i) => ((i * 72 - 90) * Math.PI) / 180);

  // 极坐标 → 笛卡尔坐标
  const polarToCart = (angle: number, r: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  // 分数 → 半径
  const scoreToR = (score: number) => ((score - minScore) / (maxScore - minScore)) * maxR;

  // 各层级网格（20, 30, 40 分）
  const gridLevels = [20, 30, 40];

  // 数据多边形顶点
  const dataPoints = dims.map((d, i) => {
    const r = scoreToR(scores[d.key]);
    return polarToCart(angles[i], r);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[360px] mx-auto">
      {/* 网格线 */}
      {gridLevels.map((level) => {
        const r = scoreToR(level);
        const pts = angles.map(a => polarToCart(a, r));
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return (
          <path
            key={level}
            d={path}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="1"
            opacity="0.5"
          />
        );
      })}

      {/* 轴线 */}
      {angles.map((angle, i) => {
        const end = polarToCart(angle, maxR);
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={end.x} y2={end.y}
            stroke="var(--color-border)"
            strokeWidth="1"
            opacity="0.4"
          />
        );
      })}

      {/* 数据多边形 */}
      <path
        d={dataPath}
        fill="var(--color-primary)"
        fillOpacity="0.2"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* 数据点 */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="5"
          fill="var(--color-primary)"
          stroke="#fff"
          strokeWidth="2"
        />
      ))}

      {/* 标签 */}
      {dims.map((d, i) => {
        const labelR = maxR + 22;
        const pos = polarToCart(angles[i], labelR);
        return (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--text-secondary)"
            fontSize="13"
            fontWeight="600"
          >
            {d.label}
          </text>
        );
      })}

      {/* 分数标注 */}
      {dims.map((d, i) => {
        const scoreR = Math.min(scoreToR(scores[d.key]) + 16, maxR - 4);
        const pos = polarToCart(angles[i], scoreR);
        // 微调避免与数据点重叠
        const offsetX = Math.cos(angles[i]) * 4;
        const offsetY = Math.sin(angles[i]) * 4;
        return (
          <text
            key={`score-${i}`}
            x={pos.x + offsetX}
            y={pos.y + offsetY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-primary)"
            fontSize="12"
            fontWeight="700"
          >
            {scores[d.key]}
          </text>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════
   结果页主组件
   ═══════════════════════════════════════════ */
export default function BigFiveResultPage() {
  const router = useRouter();
  const [results, setResults] = useState<BigFiveResult[]>([]);
  const [scores, setScores] = useState<BigFiveScores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('bigfive-scores');
    if (!raw) {
      router.replace('/bigfive');
      return;
    }
    const parsed: BigFiveScores = JSON.parse(raw);
    setScores(parsed);
    setResults(getBigFiveResults(parsed));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="cosmic-loader">
          <div className="cosmic-ring cosmic-ring-1" />
          <div className="cosmic-ring cosmic-ring-2" />
          <div className="cosmic-ring cosmic-ring-3" />
          <div className="cosmic-center">🧠</div>
        </div>
      </div>
    );
  }

  if (!scores) return null;

  return (
    <div className="gradient-bg min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <span className="tag-pill text-xs tracking-widest mb-4 inline-block">IPIP-50 · 大五人格</span>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">你的<span className="gradient-text">人格画像</span></h1>
          <p className="text-sm text-[var(--text-secondary)]">基于国际公认的五因素模型 · 科学自我认知</p>
        </div>

        {/* 雷达图 */}
        <div className="card-jade p-4 md:p-6 mb-8 flex justify-center">
          <RadarChart scores={scores} />
        </div>

        {/* 五维度卡片 */}
        <div className="space-y-4 mb-10">
          {results.map((r) => (
            <div key={r.dimension} className="card-jade p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{r.label}</span>
                  <span className="text-xs text-[var(--text-tertiary)] ml-2">{r.labelEn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold gradient-text">{r.score}</span>
                  <span className="text-xs text-[var(--text-secondary)]">/ 50</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    r.level === '高' ? 'bg-emerald-500/15 text-emerald-400' :
                    r.level === '中高' ? 'bg-emerald-500/10 text-emerald-500' :
                    r.level === '中等' ? 'bg-blue-500/10 text-blue-400' :
                    r.level === '中低' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-orange-500/10 text-orange-400'
                  }`}>
                    {r.level}
                  </span>
                </div>
              </div>

              {/* 分数条 */}
              <div className="w-full h-1.5 rounded-full bg-[var(--border-color)] mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-emerald-500 transition-all duration-700"
                  style={{ width: `${((r.score - 10) / 40) * 100}%` }}
                />
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {r.description}
              </p>
            </div>
          ))}
        </div>

        {/* 双轨印证引导 */}
        <div className="card-jade p-6 mb-10 bg-gradient-to-br from-[var(--color-primary)]/8 to-transparent">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <span className="text-3xl shrink-0">🔮</span>
            <div className="flex-1">
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">与你的命盘交叉对照</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                大五人格从心理学维度刻画你的性格基底，七系统命盘从东方智慧给出命运底色——二者交叉印证，看见更完整的自己。
              </p>
            </div>
            <Link
              href="/master-report"
              className="shrink-0 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white font-semibold text-sm hover:shadow-lg transition-all whitespace-nowrap"
            >
              生成命盘报告 →
            </Link>
          </div>
        </div>

        {/* 免责声明 */}
        <div className="text-center mb-8">
          <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
            {BIGFIVE_DISCLAIMER}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="text-center">
          <button
            onClick={() => router.push('/bigfive')}
            className="px-6 py-2.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:border-[var(--color-primary)]/40 transition-all"
          >
            ← 重新测评
          </button>
        </div>
      </div>
    </div>
  );
}
