'use client';

import React from 'react';

interface Palace {
  name: string;
  stars: string[];
}

interface ZiWeiChartProps {
  palaces: Palace[];
}

// 紫微斗数十二宫位（顺时针排列，从命宫开始）
const PALACE_ORDER = [
  '命宫','兄弟','夫妻','子女',
  '财帛','疾厄','迁移','交友',
  '官禄','田宅','福德','父母',
];

// 4×3网格布局：row→col映射，模拟传统紫微命盘
const GRID: { row: number; col: number }[] = [
  { row: 1, col: 2 }, // 命宫
  { row: 0, col: 3 }, // 兄弟
  { row: 0, col: 2 }, // 夫妻
  { row: 0, col: 1 }, // 子女
  { row: 0, col: 0 }, // 财帛
  { row: 1, col: 0 }, // 疾厄
  { row: 2, col: 0 }, // 迁移
  { row: 3, col: 0 }, // 交友
  { row: 3, col: 1 }, // 官禄
  { row: 3, col: 2 }, // 田宅
  { row: 3, col: 3 }, // 福德
  { row: 2, col: 3 }, // 父母
];

export default function ZiWeiChart({ palaces }: ZiWeiChartProps) {
  const W = 400, H = 340;
  const cellW = W / 4, cellH = H / 4;
  const pad = 3;

  // 补齐12宫（不足的用空值填充）
  const data = palaces?.length >= 12
    ? palaces.slice(0, 12)
    : PALACE_ORDER.map((name, i) => palaces?.[i] || { name, stars: [] });

  // 中间区域显示紫微斗数标题
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md mx-auto" style={{ background: 'transparent' }}>
      <defs>
        <radialGradient id="zwBg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(201,168,76,0.04)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
      </defs>

      <rect x="0" y="0" width={W} height={H} rx="8" fill="rgba(20,20,25,0.6)"/>

      {/* 中间装饰文字 */}
      <text x={W/2} y={H/2 - 8} textAnchor="middle" fill="rgba(201,168,76,0.15)" fontSize="18" fontWeight="bold" fontFamily="'Noto Serif SC',serif">紫微斗数</text>
      <text x={W/2} y={H/2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="10" fontFamily="'Noto Serif SC',serif">Zi Wei Dou Shu</text>

      {/* 宫位网格 */}
      {data.map((p, i) => {
        const pos = GRID[i];
        if (!pos) return null;
        const x = pos.col * cellW + pad;
        const y = pos.row * cellH + pad;
        const w = cellW - pad * 2;
        const h = cellH - pad * 2;
        const isLife = p.name === '命宫' || i === 0;

        return (
          <g key={i}>
            {/* 宫位背景 */}
            <rect x={x} y={y} width={w} height={h} rx="5"
              fill={isLife ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)'}
              stroke={isLife ? '#c9a84c' : 'rgba(255,255,255,0.1)'}
              strokeWidth={isLife ? 1.5 : 0.8}
              strokeOpacity={isLife ? 0.6 : 0.3}
            />
            {/* 宫名 */}
            <text x={x + w/2} y={y + 18} textAnchor="middle"
              fill={isLife ? '#c9a84c' : 'rgba(255,255,255,0.5)'}
              fontSize="11" fontWeight={isLife ? 'bold' : 'normal'}
              fontFamily="'Noto Serif SC',serif"
            >
              {p.name}
            </text>
            {/* 主星名 */}
            {(p.stars || []).slice(0, 4).map((star, si) => (
              <text key={si} x={x + w/2} y={y + 34 + si * 16} textAnchor="middle"
                fill="#c9a84c" fontSize="9" fontWeight="bold"
                fontFamily="'Noto Serif SC',serif"
              >
                {star}
              </text>
            ))}
          </g>
        );
      })}

      {/* 底部说明 */}
      <text x={W/2} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="7">十二宫命盘</text>
    </svg>
  );
}
