'use client';

import React from 'react';

interface WuXingChartProps {
  elements: Record<string, number>; // e.g. {金:4, 木:2, 水:1, 火:0, 土:3}
}

const ELEMENT_ORDER = ['金','木','水','火','土'];
const COLORS: Record<string, string> = {
  '金': '#f0d060',
  '木': '#6bb86b',
  '水': '#4a9fd4',
  '火': '#e06050',
  '土': '#c8a85c',
};
const LABELS: Record<string, string> = {
  '金': 'Metal',
  '木': 'Wood',
  '水': 'Water',
  '火': 'Fire',
  '土': 'Earth',
};

export default function WuXingChart({ elements }: WuXingChartProps) {
  const W = 340, H = 250;
  const cx = 120, cy = 120, r = 90;

  // 计算总和
  const total = ELEMENT_ORDER.reduce((s, el) => s + Math.max(0, elements?.[el] || 0), 0) || 1;

  // 生成弧形路径（SVG arc）
  function arcPath(startAngle: number, endAngle: number): string {
    const rad = Math.PI / 180;
    const x1 = cx + r * Math.cos((startAngle - 90) * rad);
    const y1 = cy + r * Math.sin((startAngle - 90) * rad);
    const x2 = cx + r * Math.cos((endAngle - 90) * rad);
    const y2 = cy + r * Math.sin((endAngle - 90) * rad);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
  }

  // 计算每个元素的起始/结束角度
  let currentAngle = 0;
  const slices = ELEMENT_ORDER.map((el) => {
    const val = Math.max(0, elements?.[el] || 0);
    const angle = (val / total) * 360;
    const path = val > 0 ? arcPath(currentAngle, currentAngle + angle) : null;
    const midAngle = currentAngle + angle / 2;
    const labelR = r * 0.65;
    const lx = cx + labelR * Math.cos((midAngle - 90) * Math.PI / 180);
    const ly = cy + labelR * Math.sin((midAngle - 90) * Math.PI / 180);
    const item = { el, val, path, midAngle, lx, ly, color: COLORS[el] || '#888' };
    currentAngle += angle;
    return item;
  });

  // 右侧图例
  const legendX = 220;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm mx-auto" style={{ background: 'transparent' }}>
      <defs>
        <filter id="wxGlow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      <rect x="0" y="0" width={W} height={H} rx="8" fill="rgba(20,20,25,0.6)"/>

      {/* 底色圆环 */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>

      {/* 扇形切片 */}
      {slices.map((s) =>
        s.path ? (
          <path key={s.el} d={s.path} fill={s.color} fillOpacity="0.65" stroke={s.color} strokeWidth="0.5" filter="url(#wxGlow)"/>
        ) : null
      )}

      {/* 圆心文字 */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#c9a84c" fontSize="14" fontWeight="bold" fontFamily="'Noto Serif SC',serif">五行</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9">Wu Xing</text>

      {/* 扇形内标签 */}
      {slices.map((s) => {
        if (!s.path || s.val === 0) return null;
        return (
          <g key={'lb-'+s.el}>
            <text x={s.lx} y={s.ly - 1} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="'Noto Serif SC',serif">{s.el}</text>
            <text x={s.lx} y={s.ly + 11} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8">{s.val}</text>
          </g>
        );
      })}

      {/* 右侧图例 */}
      <text x={legendX} y={18} fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="'Noto Serif SC',serif">五行分布</text>
      {ELEMENT_ORDER.map((el, i) => {
        const val = Math.max(0, elements?.[el] || 0);
        const pct = total > 0 ? Math.round((val / total) * 100) : 0;
        return (
          <g key={'leg-'+el}>
            <rect x={legendX} y={28 + i * 28} width="12" height="12" rx="3" fill={COLORS[el]} fillOpacity="0.7"/>
            <text x={legendX + 18} y={38 + i * 28} fill="rgba(255,255,255,0.75)" fontSize="11" fontFamily="'Noto Serif SC',serif">{el}</text>
            <text x={legendX + 48} y={38 + i * 28} fill="rgba(255,255,255,0.35)" fontSize="10">{val} ({pct}%)</text>
          </g>
        );
      })}
    </svg>
  );
}
