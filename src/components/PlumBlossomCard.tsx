'use client';

import { getTrigramEmoji } from '@/lib/plum-blossom';

interface TrigramInfo {
  name: string;
  symbol: string;
  element: string;
  nature: string;
}

interface HexagramDisplay {
  name: string;
  code: number;
  upper: TrigramInfo;
  lower: TrigramInfo;
  judgment: string;
}

interface PlumBlossomDisplayProps {
  data: {
    primary: HexagramDisplay;
    changing: HexagramDisplay | null;
    mutual: HexagramDisplay | null;
    bodyTrigram: TrigramInfo;
    useTrigram: TrigramInfo;
    bodyUseRelation: string;
    movingLine: number;
    sixRelations: string[];
    interpretation: string;
  };
}

export default function PlumBlossomCard({ data }: PlumBlossomDisplayProps) {
  const { primary, changing, mutual, bodyTrigram, useTrigram, bodyUseRelation, movingLine, sixRelations } = data;

  // 体用生克颜色
  const getRelationColor = (rel: string) => {
    if (rel.includes('凶')) return '#ef4444';
    if (rel.includes('吉')) return '#4ade80';
    if (rel.includes('泄气')) return '#fb923c';
    if (rel.includes('劳心')) return '#eab308';
    return '#c9a96e';
  };

  // 绘制六爻
  const renderLines = (lines: boolean[], highlightLine?: number) => (
    <div className="flex flex-col gap-1.5 items-center py-2">
      {[...lines].reverse().map((isYang, i) => {
        const lineNum = lines.length - i;
        const isHighlight = highlightLine === lineNum;
        const relation = sixRelations[lineNum - 1] || '';

        return (
          <div key={i} className="flex items-center gap-2 w-full">
            {/* 爻位 */}
            <span className="text-[10px] text-[var(--text-secondary)] opacity-40 w-4 text-right">
              {lineNum}
            </span>
            {/* 爻线 */}
            <div className={`flex-1 h-3 rounded-sm relative ${isHighlight ? 'ring-1 ring-[var(--text-accent)]' : ''}`}
              style={{
                background: isYang
                  ? 'linear-gradient(90deg, #c9a96e, #e0c88a, #c9a96e)'
                  : 'linear-gradient(90deg, transparent, #c9a96e44 20%, #c9a96e44 80%, transparent)',
                opacity: isHighlight ? 1 : 0.7,
              }}
            />
            {/* 六亲 */}
            <span className="text-[10px] text-[var(--text-secondary)] opacity-50 w-8 text-left">
              {relation}
            </span>
          </div>
        );
      })}
    </div>
  );

  const relationColor = getRelationColor(bodyUseRelation);

  return (
    <div className="plum-container max-w-3xl mx-auto">
      {/* 标题 */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-2xl">☯</span>
          <h2 className="text-xl font-bold text-[var(--text-accent)] tracking-wider">
            梅花易数 · 卦象
          </h2>
          <span className="text-2xl">☯</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] opacity-70">
          基于京氏易纳甲体系 · 六亲 · 世应
        </p>
      </div>

      {/* 三卦并排 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* 本卦 */}
        <div className="rounded-xl p-3 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(201,169,110,0.08), rgba(201,169,110,0.02))',
            border: '1px solid rgba(201,169,110,0.15)',
          }}
        >
          <div className="text-xs text-[var(--text-accent)] mb-1 font-medium">本卦</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">{primary.name}</div>
          <div className="text-xs text-[var(--text-secondary)] opacity-60 mb-1">
            {getTrigramEmoji(primary.upper.name)}{primary.upper.name}{getTrigramEmoji(primary.lower.name)}{primary.lower.name}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] opacity-50 mb-2">
            第{primary.code}卦 · {primary.upper.element}{primary.lower.element}
          </div>
          {renderLines(
            [...Array(6)].map((_, i) => {
              // We don't have the raw lines here directly, but we can derive from upper/lower
              const upperBits = [false, false, false]; // simplified
              const lowerBits = [false, false, false];
              const trigramToBits = (t: TrigramInfo): boolean[] => {
                const map: Record<string, boolean[]> = {
                  '乾': [true, true, true], '兑': [false, true, true],
                  '离': [true, false, true], '震': [false, false, true],
                  '巽': [true, true, false], '坎': [false, true, false],
                  '艮': [true, false, false], '坤': [false, false, false],
                };
                return map[t.name] || [false, false, false];
              };
              const lower = trigramToBits(primary.lower);
              const upper = trigramToBits(primary.upper);
              return i < 3 ? lower[i] : upper[i - 3];
            }),
            movingLine,
          )}
          <div className="text-[10px] text-[var(--text-secondary)] leading-tight mt-1 opacity-60 px-1">
            {primary.judgment.slice(0, 20)}...
          </div>
        </div>

        {/* 变卦 */}
        <div className="rounded-xl p-3 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(74,222,128,0.06), rgba(74,222,128,0.02))',
            border: '1px solid rgba(74,222,128,0.12)',
          }}
        >
          <div className="text-xs text-[#4ade80] mb-1 font-medium">变卦</div>
          {changing ? (
            <>
              <div className="text-lg font-bold text-[var(--text-primary)]">{changing.name}</div>
              <div className="text-xs text-[var(--text-secondary)] opacity-60 mb-1">
                {getTrigramEmoji(changing.upper.name)}{changing.upper.name}{getTrigramEmoji(changing.lower.name)}{changing.lower.name}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] opacity-50 mb-2">
                动爻{movingLine} · {changing.upper.element}{changing.lower.element}
              </div>
              {renderLines(
                [...Array(6)].map((_, i) => {
                  const map: Record<string, boolean[]> = {
                    '乾': [true, true, true], '兑': [false, true, true],
                    '离': [true, false, true], '震': [false, false, true],
                    '巽': [true, true, false], '坎': [false, true, false],
                    '艮': [true, false, false], '坤': [false, false, false],
                  };
                  const lower = map[changing.lower.name] || [false, false, false];
                  const upper = map[changing.upper.name] || [false, false, false];
                  return i < 3 ? lower[i] : upper[i - 3];
                }),
              )}
              <div className="text-[10px] text-[var(--text-secondary)] leading-tight mt-1 opacity-60 px-1">
                {changing.judgment.slice(0, 20)}...
              </div>
            </>
          ) : (
            <div className="py-8 text-[var(--text-secondary)] opacity-40 text-xs">无动爻</div>
          )}
        </div>

        {/* 互卦 */}
        <div className="rounded-xl p-3 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(96,165,250,0.06), rgba(96,165,250,0.02))',
            border: '1px solid rgba(96,165,250,0.12)',
          }}
        >
          <div className="text-xs text-[#60a5fa] mb-1 font-medium">互卦</div>
          {mutual ? (
            <>
              <div className="text-lg font-bold text-[var(--text-primary)]">{mutual.name}</div>
              <div className="text-xs text-[var(--text-secondary)] opacity-60 mb-1">
                {getTrigramEmoji(mutual.upper.name)}{mutual.upper.name}{getTrigramEmoji(mutual.lower.name)}{mutual.lower.name}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] opacity-50 mb-2">
                {mutual.upper.element}{mutual.lower.element}
              </div>
              {renderLines(
                [...Array(6)].map((_, i) => {
                  const map: Record<string, boolean[]> = {
                    '乾': [true, true, true], '兑': [false, true, true],
                    '离': [true, false, true], '震': [false, false, true],
                    '巽': [true, true, false], '坎': [false, true, false],
                    '艮': [true, false, false], '坤': [false, false, false],
                  };
                  const lower = map[mutual.lower.name] || [false, false, false];
                  const upper = map[mutual.upper.name] || [false, false, false];
                  return i < 3 ? lower[i] : upper[i - 3];
                }),
              )}
              <div className="text-[10px] text-[var(--text-secondary)] leading-tight mt-1 opacity-60 px-1">
                {mutual.judgment.slice(0, 20)}...
              </div>
            </>
          ) : (
            <div className="py-8 text-[var(--text-secondary)] opacity-40 text-xs">无互卦</div>
          )}
        </div>
      </div>

      {/* 体用生克 */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-xs text-[var(--text-secondary)] mb-1">体卦</div>
          <div className="text-2xl">{getTrigramEmoji(bodyTrigram.name)}</div>
          <div className="text-sm font-bold" style={{ color: getElementColor(bodyTrigram.element) }}>
            {bodyTrigram.name} · {bodyTrigram.element}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] opacity-60">{bodyTrigram.nature}</div>
        </div>
        <div className="flex items-center">
          <div className="text-center px-3 py-2 rounded-lg"
            style={{
              background: `${relationColor}15`,
              border: `1px solid ${relationColor}33`,
            }}
          >
            <div className="text-xs font-medium" style={{ color: relationColor }}>
              {bodyUseRelation}
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[var(--text-secondary)] mb-1">用卦</div>
          <div className="text-2xl">{getTrigramEmoji(useTrigram.name)}</div>
          <div className="text-sm font-bold" style={{ color: getElementColor(useTrigram.element) }}>
            {useTrigram.name} · {useTrigram.element}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] opacity-60">{useTrigram.nature}</div>
        </div>
      </div>

      {/* 综合解读 */}
      <div
        className="rounded-xl p-4 text-sm leading-relaxed"
        style={{
          background: 'linear-gradient(135deg, rgba(201,169,110,0.06), rgba(201,169,110,0.02))',
          border: '1px solid rgba(201,169,110,0.1)',
        }}
      >
        <div className="text-[var(--text-accent)] font-medium mb-2 text-center">☯ 卦象解读</div>
        <p className="text-[var(--text-secondary)] leading-relaxed">{data.interpretation}</p>
        <p className="text-[var(--text-primary)] mt-2 leading-relaxed text-center italic">
          「{primary.judgment}」
        </p>
      </div>
    </div>
  );
}

function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    '木': '#4ade80', '火': '#fb923c', '土': '#eab308', '金': '#d1d5db', '水': '#60a5fa',
  };
  return colors[element] || '#c9a96e';
}
