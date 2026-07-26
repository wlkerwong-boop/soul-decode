'use client';

import { useEffect, useState, useRef } from 'react';
import { type JiugongFull } from '@/lib/jiugong-v3';
import { centeredScrollTop } from '@/lib/jiugong-scroll';

/* ═══════════════════════════════════
   共享小组件
   ═══════════════════════════════════ */
function Section({ icon, title, badge, children }: { icon:string; title:string; badge?:string; children:React.ReactNode }) {
  return (
    <div className="card-jade p-5 md:p-6">
      <h2 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
        {badge && <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-normal">{badge}</span>}
      </h2>
      {children}
    </div>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return <div className="bg-[var(--bg-highlight)] rounded-xl p-3">{children}</div>;
}

function DetailBlock({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="bg-[var(--bg-highlight)] rounded-xl p-3 group" open>
      <summary className="cursor-pointer font-semibold text-sm text-[var(--text-primary)]">{summary}</summary>
      <div className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{children}</div>
    </details>
  );
}

/* ═══════════════════════════════════
   结果页主组件
   ═══════════════════════════════════ */
export default function JiugongResultPage() {
  const [data, setData] = useState<JiugongFull | null>(null);
  const currentYearRef = useRef<HTMLTableRowElement>(null);
  const scrollPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('jiugong-data');
    if (raw) setData(JSON.parse(raw));
  }, []);

  // 卷轴自动定位到当前年份
  useEffect(() => {
    if (currentYearRef.current && scrollPanelRef.current) {
      setTimeout(() => {
        const row = currentYearRef.current;
        const panel = scrollPanelRef.current;
        if (!row || !panel) return;
        panel.scrollTo({
          top: centeredScrollTop(row.offsetTop, row.offsetHeight, panel.clientHeight),
          behavior: 'smooth',
        });
      }, 300);
    }
  }, [data]);

  if (!data) return (
    <div className="gradient-bg min-h-screen flex items-center justify-center">
      <p className="text-[var(--text-secondary)]">请从输入页提交</p>
    </div>
  );

  const d = data;
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - d.year + 1;

  return (
    <div className="gradient-bg min-h-screen px-4 py-8 max-w-3xl mx-auto space-y-4">

      {/* ── 报告标题 ── */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs mb-4 border border-[var(--color-primary)]/20">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
          {d.name} · {d.year}年生 · 虚岁{d.xuAge}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          📜 {d.name}的<span className="gradient-text">九宫人生说明书</span>
        </h1>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">以下分析基于程天相九宫学理，旨在帮你看见自己的天赋底色与人生节律，不构成命运定论</p>
      </div>

      {/* ── PDF 下载 ── */}
      <div className="no-print text-center -mt-2 mb-2">
        <button onClick={() => window.print()} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all">
          📥 下载 PDF 报告
        </button>
      </div>

      {/* ═══ 1. 命盘摘要 ═══ */}
      <Section icon="📋" title="你的命盘速览">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-center">
          {[{l:'姓名',v:d.name},{l:'出生',v:`${d.year}.${d.month}.${d.day}`},{l:'虚岁',v:d.xuAge},
            {l:'总笔画',v:d.total},{l:'局差',v:d.ju}].map((x,i)=>(
            <div key={i} className="bg-[var(--bg-highlight)] rounded-xl p-2">
              <div className="text-[10px] text-[var(--text-tertiary)]">{x.l}</div>
              <div className="font-bold text-[var(--text-accent)]">{x.v}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-2 text-center">
          天格{d.tian}({d.tianWx}) · 人格{d.ren}({d.renWx}) · 地格{d.di}({d.diWx}) · 总格{d.zong} · 外格{d.wai}
        </div>
      </Section>

      {/* ═══ 2. 格局·特质·星运 ═══ */}
      <Section icon="🎯" title="格局 · 先天特质 · 星运密码">
        <div className="space-y-3">
          <DetailBlock summary={`局差 ${d.ju}：${d.juDesc}`}>{d.juFull}</DetailBlock>
          <Highlight>
            <span className="text-xs text-[var(--text-tertiary)]">质{d.zhi} · {d.zhiName}({d.zhiElement})：</span>
            <span className="text-sm">{d.zhiDesc}</span>
            {d.zhiFull && <div className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{d.zhiFull}</div>}
          </Highlight>
          {d.xingyunName && (
            <Highlight>
              <span className="text-xs text-[var(--text-tertiary)]">星运({d.total}画) · {d.xingyunName}：</span>
              <div className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{d.xingyunFull}</div>
            </Highlight>
          )}
        </div>
      </Section>

      {/* ═══ 3. 管理IQ ═══ */}
      {d.mgtType && (
        <Section icon="🧠" title="管理 IQ" badge={d.mgtType}>
          <div className="flex items-center gap-4 bg-[var(--bg-highlight)] rounded-xl p-3">
            <div className="shrink-0 w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-2xl font-bold gradient-text">{d.mgtScore}</div>
            <div className="flex-1">
              <p className="text-xs text-[var(--text-secondary)]">{d.mgtDesc}</p>
            </div>
          </div>
          {d.mgtFull && <div className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line bg-[var(--bg-highlight)] rounded-xl p-3">{d.mgtFull}</div>}
        </Section>
      )}

      {/* ═══ 4. 五行性格 ═══ */}
      <Section icon="⚖️" title="五行能量性格">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Highlight>
            <div className="text-[10px] text-[var(--text-tertiary)] mb-1">思想功能（天→人）· 35岁前</div>
            <div className="font-bold text-sm">{d.thinkRel}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{d.thinkDesc}</div>
            {d.wxThinkFull && <div className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">{d.wxThinkFull}</div>}
          </Highlight>
          <Highlight>
            <div className="text-[10px] text-[var(--text-tertiary)] mb-1">行动功能（人→地）· 35岁后</div>
            <div className="font-bold text-sm">{d.actionRel}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{d.actionDesc}</div>
            {d.wxActionFull && <div className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">{d.wxActionFull}</div>}
          </Highlight>
        </div>
        <div className="bg-[var(--bg-highlight)] rounded-xl p-3 mt-2 text-center">
          <span className="text-xs text-[var(--text-tertiary)]">{d.mainFunc}：</span>
          <span className="text-xs text-[var(--text-secondary)]">{d.mainFuncDesc}</span>
        </div>
      </Section>

      {/* ═══ 5-6. 财富+婚姻 ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section icon="💰" title="财富">
          <Highlight>
            <div className="text-[10px] text-[var(--text-tertiary)]">财库通路</div>
            <div className="text-sm font-semibold">{d.wealthPath}</div>
          </Highlight>
          <div className="mt-2">
            <Highlight>
              <div className="text-[10px] text-[var(--text-tertiary)]">财宫 · {d.wealthPalace}</div>
              <div className="text-sm">{d.wealthPalaceDesc}</div>
            </Highlight>
          </div>
        </Section>

        <Section icon="💞" title="婚姻">
          <Highlight>
            <div className="text-[10px] text-[var(--text-tertiary)]">婚姻宫 · {d.marriage}</div>
            <div className="text-sm font-semibold mt-0.5">{d.marriageDesc}</div>
          </Highlight>
        </Section>
      </div>

      {/* ═══ 7. 岁值星 ═══ */}
      <Section icon="⭐" title="岁值星" badge={d.ageStar}>
        <p className="text-sm text-[var(--text-secondary)]">{d.ageStarDesc}</p>
        {d.ageStarFull && <div className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line bg-[var(--bg-highlight)] rounded-xl p-3">{d.ageStarFull}</div>}
      </Section>

      {/* ═══ 8. 四格气场 ═══ */}
      <Section icon="🌐" title={`${currentYear}年气场 · 卦象`}>
        <div className="text-xs text-[var(--text-tertiary)] mb-3 text-center">
          主数：{currentYear}−1111={currentYear - 1111} → {d.mainNum}
        </div>
        <div className="space-y-2">
          {[
            {label:'上层·天格',qi:d.upperQi,energy:d.upperEnergy,gua:d.upperGua,strategy:d.upperStrategy},
            {label:'自我·人格',qi:d.selfQi,energy:d.selfEnergy,gua:d.selfGua,strategy:d.selfStrategy},
            {label:'下层·地格',qi:d.lowerQi,energy:d.lowerEnergy,gua:d.lowerGua,strategy:d.lowerStrategy},
            {label:'对外·总格',qi:d.outerQi,energy:d.outerEnergy,gua:d.outerGua,strategy:d.outerStrategy},
          ].map((q,i)=>(
            <Highlight key={i}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">{q.label}</span>
                <span className="text-xs text-[var(--text-accent)]">象：{q.qi}</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">卦：{q.gua}</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                能量：{q.energy}运
                {d.energyFull?.[q.energy] && <span className="ml-1 text-[var(--text-secondary)]">— {d.energyFull[q.energy]}</span>}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">策略：{q.strategy}</div>
              {d.xiangStrategy?.[q.qi] && (
                <div className="mt-2 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      ['upper', '上层'],
                      ['self', '自我'],
                      ['lower', '下层'],
                      ['outer', '对外'],
                    ] as const).map(([key, label]) => (
                      <span key={key} className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1">
                        <span className="text-[var(--text-tertiary)]">{label}：</span>
                        {d.xiangStrategy![q.qi][key]}
                      </span>
                    ))}
                  </div>
                  {d.xiangStrategy[q.qi].caution && <span className="block mt-0.5 text-red-400">⚠ {d.xiangStrategy[q.qi].caution}</span>}
                </div>
              )}
            </Highlight>
          ))}
        </div>
      </Section>

      {/* ═══ 9. 90年运程卷轴 ═══ */}
      <Section icon="📜" title="90年运程卷轴" badge="10组×9年">
        <p className="text-xs text-[var(--text-tertiary)] mb-3 text-center">
          出生：{d.year}年 · 当前 {currentAge}岁（{currentYear}年）· 高亮行
        </p>
        <div
          ref={scrollPanelRef}
          className="overflow-x-auto max-h-[60vh] overflow-y-auto scrollbar-hide rounded-xl border border-[var(--border-color)]"
          style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x proximity' }}
        >
          <table className="w-full text-xs min-w-[560px]">
            <thead>
              <tr className="text-[var(--text-tertiary)] sticky top-0 bg-[var(--bg-card)] z-10">
                <th className="p-1.5 text-left font-semibold">年龄</th>
                <th className="p-1.5 text-left font-semibold">年份</th>
                <th className="p-1.5 text-left font-semibold">象</th>
                <th className="p-1.5 text-left font-semibold">运程</th>
                <th className="p-1.5 text-left font-semibold">卦象</th>
                <th className="p-1.5 text-left font-semibold">口诀</th>
                <th className="p-1.5 text-left font-semibold">解读</th>
              </tr>
            </thead>
            <tbody>
              {d.years.map((y, j) => {
                const isCurrent = y.year === currentYear;
                return (
                  <tr
                    key={j}
                    ref={isCurrent ? currentYearRef : null}
                    className={`border-t border-[var(--border-color)]/40 transition-colors ${
                      isCurrent
                        ? 'bg-[var(--color-primary)]/15 border-l-2 border-l-[var(--color-primary)] font-medium'
                        : 'hover:bg-[var(--bg-highlight)]'
                    }`}
                  >
                    <td className={`p-1.5 ${isCurrent ? 'text-[var(--color-primary)] font-bold' : ''}`}>{y.age}</td>
                    <td className={`p-1.5 ${isCurrent ? 'text-[var(--color-primary)]' : ''}`}>{y.year}</td>
                    <td className="p-1.5">{y.chance}</td>
                    <td className="p-1.5">{y.yun}</td>
                    <td className="p-1.5 font-semibold">{y.gua}</td>
                    <td className="p-1.5 text-[var(--text-secondary)]">{y.koujue}</td>
                    <td className="p-1.5 text-[var(--text-secondary)]">{y.jiedu}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── 底部 ── */}
      <div className="no-print text-center text-xs text-[var(--text-tertiary)] py-6 opacity-50">
        九宫学理 · 人生说明书 — 仅供学习参考 · 程天相九宫学理体系
      </div>
    </div>
  );
}
