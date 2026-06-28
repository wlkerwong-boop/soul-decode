'use client';

import React from 'react';

interface ZodiacWheelProps {
  sunSign: string; // e.g. '白羊座', '天秤座'
}

const SIGNS = [
  '白羊座','金牛座','双子座','巨蟹座',
  '狮子座','处女座','天秤座','天蝎座',
  '射手座','摩羯座','水瓶座','双鱼座',
];

const SYMBOLS: Record<string, string> = {
  '白羊座':'♈','金牛座':'♉','双子座':'♊','巨蟹座':'♋',
  '狮子座':'♌','处女座':'♍','天秤座':'♎','天蝎座':'♏',
  '射手座':'♐','摩羯座':'♑','水瓶座':'♒','双鱼座':'♓',
};

const SIGN_COLORS: Record<string, string> = {
  '白羊座':'#e06050','金牛座':'#6bb86b','双子座':'#f0d060',
  '巨蟹座':'#4a9fd4','狮子座':'#e8a030','处女座':'#c8a85c',
  '天秤座':'#e8a030','天蝎座':'#c84030','射手座':'#4a7fd4',
  '摩羯座':'#5a5a5a','水瓶座':'#6090e0','双鱼座':'#8860b0',
};

export default function ZodiacWheel({ sunSign }: ZodiacWheelProps) {
  const W = 360, H = 380;
  const cx = W / 2, cy = 170;
  const r = 140;
  const segAngle = 360 / 12;
  const sunIdx = SIGNS.indexOf(sunSign);

  // 生成12宫弧形
  function signArc(idx: number): string {
    const start = idx * segAngle - 90;
    const end = (idx + 1) * segAngle - 90;
    const rad = Math.PI / 180;
    const x1 = cx + r * Math.cos(start * rad);
    const y1 = cy + r * Math.sin(start * rad);
    const x2 = cx + r * Math.cos(end * rad);
    const y2 = cy + r * Math.sin(end * rad);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm mx-auto" style={{ background: 'transparent' }}>
      <defs>
        <filter id="zdGlow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="zdBg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgba(201,168,76,0.04)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
      </defs>

      <rect x="0" y="0" width={W} height={H} rx="8" fill="rgba(20,20,25,0.6)"/>

      <circle cx={cx} cy={cy} r={r * 1.05} fill="url(#zdBg)"/>

      {/* 12宫弧形 */}
      {SIGNS.map((sign, i) => {
        const isSun = i === sunIdx;
        const color = SIGN_COLORS[sign] || '#888';
        return (
          <g key={i}>
            <path
              d={signArc(i)}
              fill={isSun ? color : 'transparent'}
              fillOpacity={isSun ? 0.2 : 0}
              stroke={isSun ? color : 'rgba(255,255,255,0.12)'}
              strokeWidth={isSun ? 2 : 0.8}
              filter={isSun ? 'url(#zdGlow)' : undefined}
            />
            {/* 符号 */}
            <text
              x={cx + (r * 0.72) * Math.cos(((i * segAngle + segAngle / 2) - 90) * Math.PI / 180)}
              y={cy + (r * 0.72) * Math.sin(((i * segAngle + segAngle / 2) - 90) * Math.PI / 180)}
              textAnchor="middle" dominantBaseline="central"
              fill={isSun ? color : 'rgba(255,255,255,0.35)'}
              fontSize={isSun ? 16 : 11}
              fontWeight={isSun ? 'bold' : 'normal'}
            >
              {SYMBOLS[sign] || ''}
            </text>
            {/* 名称 */}
            <text
              x={cx + (r * 0.92) * Math.cos(((i * segAngle + segAngle / 2) - 90) * Math.PI / 180)}
              y={cy + (r * 0.92) * Math.sin(((i * segAngle + segAngle / 2) - 90) * Math.PI / 180)}
              textAnchor="middle" dominantBaseline="central"
              fill={isSun ? color : 'rgba(255,255,255,0.2)'}
              fontSize="8" fontFamily="'Noto Serif SC',serif"
              fontWeight={isSun ? 'bold' : 'normal'}
            >
              {sign.replace('座','')}
            </text>
          </g>
        );
      })}

      {/* 中心圆 */}
      <circle cx={cx} cy={cy} r={28} fill="rgba(201,168,76,0.06)" stroke="rgba(201,168,76,0.2)" strokeWidth="1"/>
      <text x={cx} y={cy - 5} textAnchor="middle" fill="#c9a84c" fontSize="12" fontWeight="bold" fontFamily="'Noto Serif SC',serif">星座</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8">Zodiac</text>

      {/* 当前太阳星座说明 */}
      {sunSign && (
        <text x={W/2} y={H - 10} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="'Noto Serif SC',serif">
          太阳星座 · <tspan fill={SIGN_COLORS[sunSign] || '#c9a84c'} fontWeight="bold">{sunSign}</tspan>
        </text>
      )}
    </svg>
  );
}
