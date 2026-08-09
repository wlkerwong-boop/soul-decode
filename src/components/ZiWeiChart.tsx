'use client';

import React from 'react';
import { CHART_ATLAS_COLORS, getVisibleStars } from './chart-atlas/chart-atlas';

interface Palace {
  name: string;
  stars: string[];
}

interface ZiWeiChartProps {
  palaces: Palace[];
  horoscope?: { mingZhu?: string; shenZhu?: string; wuXing?: string } | null;
}

// 紫微斗数十二宫位（顺时针排列，从命宫开始）
const PALACE_ORDER = [
  '命宫','兄弟','夫妻','子女',
  '财帛','疾厄','迁移','交友',
  '官禄','田宅','福德','父母',
];

// 4×3网格布局：row→col映射，模拟传统紫微命盘
const GRID: { row: number; col: number }[] = [
  { row: 0, col: 0 }, // 命宫
  { row: 0, col: 1 }, // 兄弟
  { row: 0, col: 2 }, // 夫妻
  { row: 0, col: 3 }, // 子女
  { row: 1, col: 3 }, // 财帛
  { row: 2, col: 3 }, // 疾厄
  { row: 3, col: 3 }, // 迁移
  { row: 3, col: 2 }, // 交友
  { row: 3, col: 1 }, // 官禄
  { row: 3, col: 0 }, // 田宅
  { row: 2, col: 0 }, // 福德
  { row: 1, col: 0 }, // 父母
];

export default function ZiWeiChart({ palaces, horoscope }: ZiWeiChartProps) {
  const W = 520, H = 430;
  const cellW = W / 4, cellH = H / 4;
  const pad = 5;
  const typeface = "LXGW WenKai, PingFang SC, sans-serif";

  // 补齐12宫（不足的用空值填充）
  const data = palaces?.length >= 12
    ? palaces.slice(0, 12)
    : PALACE_ORDER.map((name, i) => palaces?.[i] || { name, stars: [] });

  // 中间区域显示紫微斗数标题
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="w-full mx-auto chart-atlas-svg" style={{ background: 'transparent' }}>
      <title>紫微斗数十二宫命盘</title>
      <rect x="0" y="0" width={W} height={H} rx="14" fill={CHART_ATLAS_COLORS.paper} />
      <text x="22" y="28" fill={CHART_ATLAS_COLORS.gold} fontSize="10" fontWeight="700" letterSpacing="2" fontFamily={typeface}>TWELVE PALACES · 紫微斗数</text>
      <text x={W-22} y="28" textAnchor="end" fill={CHART_ATLAS_COLORS.faint} fontSize="9" fontFamily={typeface}>命宫 · 身宫 · 星曜</text>

      <rect x={cellW + pad} y={cellH + pad} width={cellW * 2 - pad * 2} height={cellH * 2 - pad * 2} rx="12" fill="#F5EBDD" stroke="#DCC9AA" strokeWidth="1.5" />

      {/* 中间信息区 — 命主/身主/五行局 */}
      {horoscope ? (
        <>
          <text x={W/2} y={H/2 - 38} textAnchor="middle" fill={CHART_ATLAS_COLORS.gold} fontSize="14" fontWeight="bold" fontFamily={typeface}>
            {horoscope.mingZhu || horoscope.shenZhu || horoscope.wuXing ? '命盘信息' : ''}
          </text>
          {horoscope.mingZhu && (
            <text x={W/2} y={H/2 - 13} textAnchor="middle" fill={CHART_ATLAS_COLORS.muted} fontSize="11" fontFamily={typeface}>
              命主：{horoscope.mingZhu}
            </text>
          )}
          {horoscope.shenZhu && (
            <text x={W/2} y={H/2 + 7} textAnchor="middle" fill={CHART_ATLAS_COLORS.muted} fontSize="11" fontFamily={typeface}>
              身主：{horoscope.shenZhu}
            </text>
          )}
          {horoscope.wuXing && (
            <text x={W/2} y={H/2 + 27} textAnchor="middle" fill={CHART_ATLAS_COLORS.muted} fontSize="11" fontFamily={typeface}>
              五行局：{horoscope.wuXing}
            </text>
          )}
        </>
      ) : (
        <>
          <text x={W/2} y={H/2 - 8} textAnchor="middle" fill={CHART_ATLAS_COLORS.gold} fontSize="18" fontWeight="bold" fontFamily={typeface}>紫微斗数</text>
          <text x={W/2} y={H/2 + 13} textAnchor="middle" fill={CHART_ATLAS_COLORS.faint} fontSize="10" fontFamily={typeface}>十二宫命盘</text>
        </>
      )}

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
              fill={isLife ? '#F3E7CB' : CHART_ATLAS_COLORS.paper}
              stroke={isLife ? CHART_ATLAS_COLORS.gold : '#D8CCBC'}
              strokeWidth={isLife ? 2 : 1}
              strokeOpacity="1"
            />
            {/* 宫名 */}
            <text x={x + w/2} y={y + 18} textAnchor="middle"
              fill={isLife ? CHART_ATLAS_COLORS.gold : CHART_ATLAS_COLORS.ink}
              fontSize="12" fontWeight={isLife ? 'bold' : '600'}
              fontFamily={typeface}
            >
              {p.name}
            </text>
            {/* 主星名 */}
            {getVisibleStars(p.stars || [], 3).map((star, si) => (
              <text key={si} x={x + w/2} y={y + 34 + si * 16} textAnchor="middle"
                fill={si === 0 ? CHART_ATLAS_COLORS.gold : CHART_ATLAS_COLORS.muted} fontSize="10" fontWeight={si === 0 ? '700' : '500'}
                fontFamily={typeface}
              >
                {star}
              </text>
            ))}
          </g>
        );
      })}

      {/* 底部说明 */}
      <text x={W/2} y={H - 8} textAnchor="middle" fill={CHART_ATLAS_COLORS.faint} fontSize="9" fontFamily={typeface}>默认展示主要星曜 · 详细信息见报告正文</text>
    </svg>
  );
}
