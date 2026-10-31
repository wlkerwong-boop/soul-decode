'use client';

import React from 'react';
import { CHART_ATLAS_COLORS, formatPillar, getElementPercent } from './chart-atlas/chart-atlas';

interface BaziChartProps {
  pillars: string[];      // 四柱 e.g. ['辛酉','辛丑','庚戌','丁丑']
  dayMaster: string;      // 日主 e.g. '庚金'
  elements: string[];     // 五行 e.g. ['金','金','土','火']
  elementDistribution?: Record<string, number>;
}

const COLUMN_NAMES = ['年柱','月柱','日柱','时柱'];
const ELEMENTS = ['木', '火', '土', '金', '水'];

export default function BaziChart({ pillars, dayMaster, elements, elementDistribution }: BaziChartProps) {
  const W = 640, H = 330;
  const cw = 116, gap = 18;
  const x0 = 36;
  const typeface = "LXGW WenKai, PingFang SC, sans-serif";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="w-full mx-auto chart-atlas-svg">
      <title>八字四柱命盘</title>
      <rect x="0" y="0" width={W} height={H} rx="14" fill={CHART_ATLAS_COLORS.paper} />
      <text x="24" y="28" fill={CHART_ATLAS_COLORS.gold} fontSize="10" fontWeight="700" letterSpacing="2" fontFamily={typeface}>FOUR PILLARS · 八字四柱</text>
      <text x={W-24} y="28" textAnchor="end" fill={CHART_ATLAS_COLORS.faint} fontSize="9" fontFamily={typeface}>日主 · 五行 · 四柱</text>

      <g transform="translate(0 18)">
        <text x={W/2} y="48" textAnchor="middle" fill={CHART_ATLAS_COLORS.muted} fontSize="10" fontFamily={typeface}>日主</text>
        <text x={W/2} y="75" textAnchor="middle" fill={CHART_ATLAS_COLORS.ink} fontSize="24" fontWeight="700" fontFamily={typeface}>{dayMaster || '—'}</text>

        {Array.from({ length: 4 }).map((_, i) => {
        const x = x0 + i * (cw + gap);
        const { stem, branch } = formatPillar(pillars?.[i] || '');
        const ele = elements?.[i] || '';
        const color = CHART_ATLAS_COLORS.elements[ele] || CHART_ATLAS_COLORS.gold;
        const isDay = i === 2;
        return (
          <g key={i}>
            <rect x={x} y="96" width={cw} height="34" rx="7" fill={isDay ? '#F3E7CB' : CHART_ATLAS_COLORS.paperDeep} stroke={isDay ? CHART_ATLAS_COLORS.gold : '#D7C9B6'} strokeWidth={isDay ? "2" : "1"} />
            <text x={x + cw/2} y="119" textAnchor="middle" fill={CHART_ATLAS_COLORS.muted} fontSize="10" fontWeight="700" fontFamily={typeface}>{COLUMN_NAMES[i]}</text>
            <rect x={x} y="140" width={cw} height="62" rx="9" fill={CHART_ATLAS_COLORS.paper} stroke={color} strokeWidth={isDay ? "2.5" : "1.5"} />
            <text x={x + cw/2} y="181" textAnchor="middle" fill={color} fontSize="31" fontWeight="700" fontFamily={typeface}>{stem || '—'}</text>
            <text x={x + cw/2} y="220" textAnchor="middle" fill={CHART_ATLAS_COLORS.faint} fontSize="9" fontFamily={typeface}>天干</text>
            <rect x={x} y="230" width={cw} height="48" rx="9" fill="#FCFAF5" stroke="#D7C9B6" strokeWidth="1" />
            <text x={x + cw/2} y="262" textAnchor="middle" fill={CHART_ATLAS_COLORS.ink} fontSize="24" fontWeight="600" fontFamily={typeface}>{branch || '—'}</text>
          </g>
        );
      })}

        <g transform="translate(36 295)">
          <text x="0" y="0" fill={CHART_ATLAS_COLORS.muted} fontSize="9" fontFamily={typeface}>五行分布</text>
          {ELEMENTS.map((element, i) => {
            const percent = getElementPercent(elementDistribution || {}, element);
            const x = 68 + i * 106;
            return (
              <g key={element}>
                <circle cx={x} cy="-4" r="4" fill={CHART_ATLAS_COLORS.elements[element]} />
                <text x={x + 9} y="0" fill={CHART_ATLAS_COLORS.muted} fontSize="9" fontFamily={typeface}>{element} {percent}%</text>
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
}
