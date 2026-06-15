'use client';

/**
 * 八字四柱神卡
 *
 * 以视觉化方式展示用户的真实八字排盘结果
 * 每个柱子一个卡片，展示天干地支+五行+纳音
 */

import { getElementColor, getElementEmoji } from '@/lib/bazi';

interface BaziCardProps {
  pillars: string[];
  ganElements: string[];
  zhiElements: string[];
  zodiac: string;
  dayMaster: string;
  dayMasterElement: string;
  nayin: string[];
  elementDistribution: Record<string, number>;
  summary: string;
}

const PILLAR_NAMES = ['年柱', '月柱', '日柱', '时柱'];

export default function BaziCard({
  pillars,
  ganElements,
  zhiElements,
  zodiac,
  dayMaster,
  dayMasterElement,
  nayin,
  elementDistribution,
  summary,
}: BaziCardProps) {
  const hasHour = pillars[3] !== '--';

  return (
    <div className="bazi-container">
      {/* 标题 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-2xl">🔮</span>
          <h2 className="text-xl font-bold text-[var(--text-accent)] tracking-wider">
            八字命盘
          </h2>
          <span className="text-2xl">🔮</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          基于真实天干地支算法排盘 · {zodiac}年 · 日主{dayMaster}（{dayMasterElement}）
        </p>
      </div>

      {/* 四柱卡片 */}
      <div className={`grid ${hasHour ? 'grid-cols-4' : 'grid-cols-3'} gap-3 mb-8 max-w-2xl mx-auto`}>
        {pillars.map((pillar, i) => {
          if (pillar === '--') return null;
          const gan = pillar.charAt(0);
          const zhi = pillar.charAt(1);
          const ganEl = ganElements[i];
          const zhiEl = zhiElements[i];
          const element = ganEl !== '—' ? ganEl : zhiEl;
          const color = getElementColor(element);
          const emoji = getElementEmoji(element);

          return (
            <div
              key={i}
              className="pillar-card rounded-xl p-4 text-center"
              style={{
                background: `linear-gradient(145deg, rgba(${hexToRgb(color)}, 0.08), rgba(${hexToRgb(color)}, 0.02))`,
                borderColor: `${color}44`,
              }}
            >
              <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                {PILLAR_NAMES[i]}
                {i === 2 && <span className="text-[var(--text-accent)] ml-1">★</span>}
              </div>

              {/* 天干 */}
              <div
                className="text-3xl font-bold mb-1"
                style={{ color }}
              >
                {gan}
              </div>

              {/* 地支 */}
              <div
                className="text-2xl font-bold mb-2"
                style={{ color: `${color}aa` }}
              >
                {zhi}
              </div>

              {/* 五行标签 */}
              <div className="flex justify-center gap-1 mb-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: `${color}22`,
                    color,
                    border: `1px solid ${color}33`,
                  }}
                >
                  {emoji} {ganEl}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: `${color}15`,
                    color: `${color}bb`,
                    border: `1px solid ${color}22`,
                  }}
                >
                  {zhiEl}
                </span>
              </div>

              {/* 纳音 */}
              <div className="text-[10px] text-[var(--text-secondary)]">
                {nayin[i]}
              </div>
            </div>
          );
        })}
      </div>

      {/* 五行分布 */}
      <div className="max-w-xl mx-auto mb-8">
        <h3 className="text-sm text-[var(--text-secondary)] mb-3 text-center">
          五行分布
        </h3>
        <div className="flex justify-center gap-4">
          {Object.entries(elementDistribution).map(([element, count]) => {
            const color = getElementColor(element);
            const emoji = getElementEmoji(element);
            const maxCount = Math.max(...Object.values(elementDistribution));
            const barHeight = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={element} className="flex flex-col items-center gap-1">
                <div className="text-lg">{emoji}</div>
                <div
                  className="w-8 rounded-full relative"
                  style={{
                    height: '60px',
                    background: `${color}15`,
                    border: `1px solid ${color}22`,
                  }}
                >
                  <div
                    className="absolute bottom-0 w-full rounded-full transition-all duration-700"
                    style={{
                      height: `${barHeight}%`,
                      background: `linear-gradient(to top, ${color}88, ${color}33)`,
                    }}
                  />
                </div>
                <div className="text-xs font-bold" style={{ color }}>
                  {element}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">
                  {count}次
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 命局简评 */}
      <div className="max-w-xl mx-auto">
        <div
          className="rounded-xl p-4 text-sm leading-relaxed text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(201,169,110,0.08), rgba(201,169,110,0.02))',
            border: '1px solid rgba(201,169,110,0.15)',
          }}
        >
          <span className="text-[var(--text-accent)] font-medium">命局简评</span>
          <p className="text-[var(--text-secondary)] mt-2 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '201, 169, 110';
}
