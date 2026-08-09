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
    <div className="inner-page gradient-bg min-h-screen px-4 pt-nav pb-16 md:pb-24">
      <div className="inner-page-container max-w-3xl mx-auto">
        {/* 标题 */}
        <div className="inner-page-header text-center mb-10 md:mb-14">
          <span className="inner-page-eyebrow">IPIP-50 · 大五人格</span>
          <h1 className="inner-page-title">你的<span className="inner-page-title-accent">人格画像</span></h1>
          <p className="inner-page-lead">基于国际公认的五因素模型，整理一份可阅读、可验证的性格观察</p>
        </div>

        {/* 雷达图 */}
        <section className="inner-page-card inner-page-chart mb-10 md:mb-12" aria-labelledby="bigfive-chart-title">
          <div className="inner-page-section-label" id="bigfive-chart-title">五维轮廓</div>
          <RadarChart scores={scores} />
          <p className="inner-page-caption">分数呈现的是倾向，不是固定的标签。你可以把它当作一张自我观察的起点。</p>
        </section>

        {/* 五维度卡片 */}
        <section className="space-y-5 mb-12" aria-labelledby="bigfive-dimensions-title">
          <div className="inner-page-section-heading">
            <div>
              <span className="inner-page-eyebrow">FIVE DIMENSIONS</span>
              <h2 id="bigfive-dimensions-title">逐项看懂你的倾向</h2>
            </div>
            <span className="inner-page-section-note">10–50 分</span>
          </div>
          {results.map((r) => (
            <article key={r.dimension} className="inner-page-card inner-page-score-card">
              <div className="inner-page-score-head">
                <div className="min-w-0">
                  <div className="inner-page-score-name">
                    <span>{r.label}</span>
                    <span className="inner-page-score-en">{r.labelEn}</span>
                  </div>
                  <p className="inner-page-score-kicker">人格维度 · {r.dimension}</p>
                </div>
                <div className="inner-page-score-value">
                  <span className="inner-page-score-number">{r.score}</span>
                  <span className="inner-page-score-total">/ 50</span>
                  <span className={`inner-page-level level-${r.level}`
                  }>
                    {r.level}
                  </span>
                </div>
              </div>

              {/* 分数条 */}
              <div className="inner-page-progress" aria-label={`${r.label} ${r.score} 分`}>
                <div
                  className="inner-page-progress-fill"
                  style={{ width: `${((r.score - 10) / 40) * 100}%` }}
                />
              </div>

              <p className="inner-page-score-description">{r.description}</p>
            </article>
          ))}
        </section>

        {/* 双轨印证引导 */}
        <section className="inner-page-card inner-page-next-step mb-12" aria-labelledby="bigfive-next-title">
          <div className="inner-page-next-mark" aria-hidden="true">↗</div>
          <div className="flex-1 min-w-0">
            <span className="inner-page-eyebrow">NEXT STEP</span>
            <h2 id="bigfive-next-title">把一张测评，放回完整的生命蓝图</h2>
            <p>
              大五人格帮助你看见心理倾向，生命蓝图再把出生信息、关系方式与行动节奏放在同一张地图里。
            </p>
          </div>
          <Link href="/master-report" className="inner-page-button shrink-0">
            进入生命蓝图 <span aria-hidden="true">→</span>
          </Link>
        </section>

        {/* 免责声明 */}
        <div className="inner-page-disclaimer">
          <p>{BIGFIVE_DISCLAIMER}</p>
        </div>

        {/* 操作按钮 */}
        <div className="inner-page-actions">
          <button onClick={() => router.push('/bigfive')} className="inner-page-button secondary">
            ← 重新测评
          </button>
        </div>
      </div>
    </div>
  );
}
