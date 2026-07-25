'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JiugongResult } from '@/lib/jiugong';
import { calcLifeScroll } from '@/lib/jiugong';

/* ═══════════════════════════════════════════
   五格卡片
   ═══════════════════════════════════════════ */
function WuGeCard({ wuge, name }: { wuge: JiugongResult['wuge']; name: string }) {
  const items = [
    { label: '天格', value: wuge.tian, sub: '祖运·先天' },
    { label: '人格', value: wuge.ren, sub: '主运·核心', highlight: true },
    { label: '地格', value: wuge.di, sub: '前运·基础' },
    { label: '总格', value: wuge.zong, sub: '后运·归宿' },
    { label: '外格', value: wuge.wai, sub: '副运·人际' },
  ];

  return (
    <div className="card-jade p-5 md:p-6">
      <h2 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span>📐</span> 姓名五格 · {name}
      </h2>
      <div className="grid grid-cols-5 gap-2">
        {items.map(g => (
          <div
            key={g.label}
            className={`text-center rounded-xl p-3 transition-all ${
              g.highlight
                ? 'bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30'
                : 'bg-[var(--bg-highlight)]'
            }`}
          >
            <div className="text-[10px] text-[var(--text-tertiary)] mb-0.5">{g.label}</div>
            <div className={`text-xl md:text-2xl font-bold ${g.highlight ? 'gradient-text' : 'text-[var(--text-primary)]'}`}>
              {g.value}
            </div>
            <div className="text-[9px] text-[var(--text-tertiary)] mt-0.5">{g.sub}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--text-secondary)] text-center mt-3 px-2 py-1.5 rounded-lg bg-[var(--bg-highlight)]">
        三才配置：{wuge.sancai}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   九宫气场图（3×3 动画展示）
   ═══════════════════════════════════════════ */
function JiuGongGrid({
  labels,
  rengePosition,
}: {
  labels: JiugongResult['jiugongLabels'];
  rengePosition: [number, number];
}) {
  return (
    <div className="card-jade p-5 md:p-6">
      <h2 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span>🏠</span> 九宫气场
      </h2>
      <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
        {labels.map((g, i) => {
          const isRenge = rengePosition[0] === g.row && rengePosition[1] === g.col;
          return (
            <div
              key={`${g.row}-${g.col}`}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-center p-1.5 transition-all duration-500 animate-scale-in ${
                isRenge
                  ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25 ring-2 ring-[var(--color-primary)]/40'
                  : 'bg-[var(--bg-highlight)] hover:bg-[var(--bg-elevated)]'
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`text-lg md:text-xl font-bold ${isRenge ? 'text-white' : 'text-[var(--text-accent)]'}`}>
                {g.num}
              </div>
              <div className={`text-[10px] leading-tight mt-0.5 ${isRenge ? 'text-white/85' : 'text-[var(--text-tertiary)]'}`}>
                {g.name}
              </div>
              {isRenge && (
                <div className="text-[9px] text-white/70 mt-0.5">人格所在</div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-3">
        洛书九宫 · 人格所在宫高亮
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   岁值星卡片
   ═══════════════════════════════════════════ */
function SuiZhiCard({ suizhi }: { suizhi: JiugongResult['suizhi'] }) {
  return (
    <div className="card-jade p-5 md:p-6 bg-gradient-to-br from-[var(--color-primary)]/8 to-[var(--bg-card)]">
      <h2 className="text-base font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <span>⭐</span> 岁值星
      </h2>
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-16 h-16 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center text-2xl">
          ⭐
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[var(--text-tertiary)]">虚岁</span>
            <span className="text-xl font-bold gradient-text">{suizhi.xuSui}</span>
            <span className="text-xs text-[var(--text-tertiary)]">岁</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
              {suizhi.star}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{suizhi.desc}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   90 年运势卷轴
   ═══════════════════════════════════════════ */
function LifeScroll({ name, year }: { name: string; year: number }) {
  
  // 按十年分段
  const decades: { start: number; items: typeof scroll }[] = [];
  for (let i = 0; i < 9; i++) {
    decades.push({ start: i * 10 + 1, items: scroll.slice(i * 10, (i + 1) * 10) });
  }

  const starColors: Record<string, string> = {
    '将星': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    '权星': 'bg-red-500/15 text-red-400 border-red-500/20',
    '空亡星': 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    '车星': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    '田宅星': 'bg-green-500/15 text-green-400 border-green-500/20',
    '库星': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    '孤星': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    '破军星': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    '贵星': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    '文星': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  };

  return (
    <div className="card-jade p-5 md:p-6">
      <h2 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span>📜</span> 人生 90 年运势卷轴
      </h2>

      {/* 卷轴容器 */}
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
        <div className="flex gap-1 min-w-[600px]">
          {decades.map((decade) => (
            <div key={decade.start} className="flex-1 min-w-[60px]">
              {/* 十年标签 */}
              <div className="text-center text-[10px] text-[var(--text-tertiary)] mb-1.5 font-semibold">
                {decade.start}s
              </div>
              {/* 每年一个色块 */}
              <div className="flex flex-col gap-0.5">
                {decade.items.map((item) => {
                  const isHovered = hoveredAge === item.age;
                  const colorClass = starColors[item.star] || 'bg-gray-500/10 text-gray-400';
                  return (
                    <div
                      key={item.age}
                      className="relative group"
                      onMouseEnter={() => setHoveredAge(item.age)}
                      onMouseLeave={() => setHoveredAge(null)}
                    >
                      <div
                        className={`h-7 rounded px-1 flex items-center justify-center text-[9px] font-semibold cursor-default transition-all border ${colorClass} ${
                          isHovered ? 'scale-110 shadow-sm z-10' : ''
                        }`}
                      >
                        {item.age}
                      </div>
                      {/* tooltip */}
                      {isHovered && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 whitespace-nowrap bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-2 py-1 shadow-lg">
                          <span className="text-[10px] font-semibold text-[var(--text-primary)]">
                            {item.age}岁 · {item.star}
                          </span>
                          <span className="text-[9px] text-[var(--text-tertiary)] ml-1">
                            {item.keyword}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 当前岁数指示 */}
      <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
        {Object.entries(starColors).slice(0, 5).map(([star, cls]) => (
          <span key={star} className={`text-[10px] px-1.5 py-0.5 rounded-full border ${cls}`}>
            {star}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   结果页主组件
   ═══════════════════════════════════════════ */
export default function JiugongResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<JiugongResult | null>(null);
  const [name, setName] = useState('');
  const [year, setYear] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('jiugong-result');
    const storedName = sessionStorage.getItem('jiugong-name');
    const storedYear = sessionStorage.getItem('jiugong-year');
    if (!raw) {
      router.replace('/jiugong');
      return;
    }
    setResult(JSON.parse(raw));
    setName(storedName || '');
    setYear(parseInt(storedYear || '0'));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="cosmic-loader">
          <div className="cosmic-ring cosmic-ring-1" />
          <div className="cosmic-ring cosmic-ring-2" />
          <div className="cosmic-ring cosmic-ring-3" />
          <div className="cosmic-center">🔮</div>
        </div>
      </div>
    );
  }

  if (!result) return null;
  const { wuge, jiugongLabels, tezhi, suizhi, rengePosition } = result;

  return (
    <div className="gradient-bg min-h-screen px-4 py-8 md:py-10">
      <div className="max-w-2xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {name} 的<span className="gradient-text">人生说明书</span>
          </h1>
          <p className="text-xs text-[var(--text-tertiary)]">九宫姓名学 · 河图洛书体系</p>
        </div>

        <div className="space-y-4">
          {/* 1. 五格卡片 */}
          <WuGeCard wuge={wuge} name={name} />

          {/* 2. 九宫气场图 */}
          <JiuGongGrid labels={jiugongLabels} rengePosition={rengePosition} />

          {/* 3. 十大特质 */}
          <div className="card-jade p-5 md:p-6">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <span>🌟</span> 十大特质 · {tezhi.name}
            </h2>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-xl font-bold gradient-text">
                {wuge.zong % 10}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    {tezhi.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">五行属{tezhi.element} · 总格个位数 {wuge.zong % 10}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tezhi.desc}</p>
              </div>
            </div>
          </div>

          {/* 4. 岁值星 */}
          <SuiZhiCard suizhi={suizhi} />

          {/* 5. 90 年运势卷轴 */}
          <LifeScroll name={name} year={year} />
        </div>

        {/* 底部操作 */}
        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => router.push('/jiugong')}
            className="px-6 py-2.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:border-[var(--color-primary)]/40 hover:text-[var(--text-accent)] transition-all"
          >
            ← 重新测算
          </button>
          <p className="text-xs text-[var(--text-tertiary)] opacity-60">
            基于河图洛书五格三才体系 · 仅供自我认识参考
          </p>
        </div>
      </div>
    </div>
  );
}
