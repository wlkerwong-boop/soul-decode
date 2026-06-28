'use client';

import React from 'react';

interface BaziChartProps {
  pillars: string[];      // 四柱 e.g. ['辛酉','辛丑','庚戌','丁丑']
  dayMaster: string;      // 日主 e.g. '庚金'
  elements: string[];     // 五行 e.g. ['金','金','土','火']
}

const COLUMN_NAMES = ['年柱','月柱','日柱','时柱'];
const COLORS: Record<string,string> = {
  '金':'#f0d060', '木':'#6bb86b', '水':'#4a9fd4', '火':'#e06050', '土':'#c8a85c'
};

export default function BaziChart({ pillars, dayMaster, elements }: BaziChartProps) {
  const W = 420, H = 220;
  const cw = 80, ch = 50;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md mx-auto">

      {/* 背景 */}
      <rect x="0" y="0" width={W} height={H} rx="8" fill="rgba(20,20,25,0.6)" />

      {/* 日主大字 */}
      <text x={W/2} y={30} textAnchor="middle" fill="#c9a84c" fontSize="16" fontWeight="bold" fontFamily="'Noto Serif SC',serif">{dayMaster || ''}</text>
      <text x={W/2} y={48} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="'Noto Serif SC',serif">日主</text>

      {/* 四柱 */}
      {pillars.map((p, i) => {
        const x = 40 + i * (cw + 20);
        const chars = p.split('');
        const ele = elements?.[i] || '';
        const color = COLORS[ele] || '#888';
        return (
          <g key={i}>
            {/* 柱名 */}
            <text x={x + cw/2} y={80} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="'Noto Serif SC',serif">{COLUMN_NAMES[i]}</text>
            {/* 天干 */}
            <rect x={x + 5} y={90} width={cw - 10} height={ch} rx="4" fill="rgba(201,168,76,0.08)" stroke={color} strokeWidth="1.5" />
            <text x={x + cw/2} y={90 + ch/2 + 5} textAnchor="middle" fill={color} fontSize="18" fontWeight="bold" fontFamily="'Noto Serif SC',serif">{chars[0]}</text>
            {/* 地支 */}
            <rect x={x + 5} y={90 + ch + 4} width={cw - 10} height={ch} rx="4" fill="rgba(201,168,76,0.05)" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
            <text x={x + cw/2} y={90 + ch + 4 + ch/2 + 5} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="16" fontFamily="'Noto Serif SC',serif">{chars[1]}</text>
          </g>
        );
      })}

      {/* 底部五行分布 */}
      <text x={W/2} y={H - 12} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9">
        五行：{Object.entries(COLORS).map(([el,cl]) => {
          const count = elements.filter((e: string) => e === el).length;
          return count > 0 ? `${el}${count} ` : '';
        }).join('')}
      </text>
    </svg>
  );
}
