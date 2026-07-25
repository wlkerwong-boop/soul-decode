'use client';

import { useEffect, useState } from 'react';
import { type JiugongFull } from '@/lib/jiugong-v3';

export default function JiugongResultPage() {
  const [data, setData] = useState<JiugongFull | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('jiugong-data');
    if (raw) setData(JSON.parse(raw));
  }, []);

  if (!data) return <div className="gradient-bg min-h-screen flex items-center justify-center"><p className="text-[var(--text-secondary)]">请从输入页提交</p></div>;

  const d = data;

  return (
    <div className="gradient-bg min-h-screen px-4 py-8 max-w-3xl mx-auto space-y-5 text-sm">

      {/* ═══ 命盘摘要 ═══ */}
      <div className="card-jade p-5">
        <h2 className="text-lg font-bold mb-3">📋 基本命盘</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-center">
          {[{l:'姓名',v:d.name},{l:'出生',v:`${d.year}.${d.month}.${d.day}`},{l:'虚岁',v:d.xuAge},
            {l:'总笔画',v:d.total},{l:'局差',v:d.ju}].map((x,i)=>(
            <div key={i} className="bg-[var(--bg-highlight)] rounded-xl p-2">
              <div className="text-xs text-[var(--text-tertiary)]">{x.l}</div>
              <div className="font-bold text-[var(--text-accent)]">{x.v}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-2 text-center">
          天格{d.tian}({d.tianWx}) · 人格{d.ren}({d.renWx}) · 地格{d.di}({d.diWx}) · 总格{d.zong} · 外格{d.wai}
        </div>
      </div>

      {/* ═══ 局 · 质 · 星运 ═══ */}
      <div className="card-jade p-5 space-y-4">
        <h2 className="text-lg font-bold">🎯 格局 · 特质 · 星运</h2>

        {/* 局差 */}
        <details className="bg-[var(--bg-highlight)] rounded-xl p-3 group" open>
          <summary className="cursor-pointer font-semibold text-sm">
            局差{d.ju}：{d.juDesc}
          </summary>
          <div className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{d.juFull}</div>
        </details>

        {/* 质 */}
        <div className="bg-[var(--bg-highlight)] rounded-xl p-3">
          <span className="text-xs text-[var(--text-tertiary)]">质{d.zhi} · {d.zhiName}({d.zhiElement})：</span>
          <span className="text-sm">{d.zhiDesc}</span>
          {d.zhiFull && <div className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{d.zhiFull}</div>}
        </div>

        {/* 星运 */}
        {d.xingyunName && (
          <div className="bg-[var(--bg-highlight)] rounded-xl p-3">
            <span className="text-xs text-[var(--text-tertiary)]">星运({d.total}画) · {d.xingyunName}：</span>
            <div className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{d.xingyunFull}</div>
          </div>
        )}
      </div>

      {/* ═══ 管理IQ ═══ */}
      {d.mgtType && (
        <div className="card-jade p-5">
          <h2 className="text-lg font-bold mb-3">🧠 管理 IQ</h2>
          <div className="bg-[var(--bg-highlight)] rounded-xl p-3 flex items-center gap-4">
            <div className="shrink-0 w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-2xl font-bold gradient-text">{d.mgtScore}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{d.mgtType}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{d.mgtDesc}</p>
            </div>
          </div>
          {d.mgtFull && <div className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line bg-[var(--bg-highlight)] rounded-xl p-3">{d.mgtFull}</div>}
        </div>
      )}

      {/* ═══ 五行性格 ═══ */}
      <div className="card-jade p-5">
        <h2 className="text-lg font-bold mb-3">⚖️ 五行性格</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[var(--bg-highlight)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-tertiary)]">思想功能（天→人）</div>
            <div className="font-bold">{d.thinkRel}</div>
            <div className="text-xs text-[var(--text-secondary)]">{d.thinkDesc}</div>
            {d.wxThinkFull && <div className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">{d.wxThinkFull}</div>}
          </div>
          <div className="bg-[var(--bg-highlight)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-tertiary)]">行动功能（人→地）</div>
            <div className="font-bold">{d.actionRel}</div>
            <div className="text-xs text-[var(--text-secondary)]">{d.actionDesc}</div>
            {d.wxActionFull && <div className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">{d.wxActionFull}</div>}
          </div>
        </div>
        <div className="bg-[var(--bg-highlight)] rounded-xl p-3 mt-2">
          <span className="text-xs text-[var(--text-tertiary)]">{d.mainFunc}：</span>
          <span className="text-xs text-[var(--text-secondary)]">{d.mainFuncDesc}</span>
        </div>
      </div>

      {/* ═══ 财富 ═══ */}
      <div className="card-jade p-5">
        <h2 className="text-lg font-bold mb-2">💰 财富</h2>
        <div className="bg-[var(--bg-highlight)] rounded-xl p-3">
          <span className="text-xs text-[var(--text-tertiary)]">财库通路：</span>
          <span className="text-sm">{d.wealthPath}</span>
        </div>
        <div className="bg-[var(--bg-highlight)] rounded-xl p-3 mt-2">
          <span className="text-xs text-[var(--text-tertiary)]">财宫 · {d.wealthPalace}：</span>
          <span className="text-sm">{d.wealthPalaceDesc}</span>
        </div>
      </div>

      {/* ═══ 婚姻 ═══ */}
      <div className="card-jade p-5">
        <h2 className="text-lg font-bold mb-2">💞 婚姻 · {d.marriage}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{d.marriageDesc}</p>
      </div>

      {/* ═══ 岁值星 ═══ */}
      <div className="card-jade p-5">
        <h2 className="text-lg font-bold mb-2">⭐ 岁值星 · {d.ageStar}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{d.ageStarDesc}</p>
        {d.ageStarFull && <div className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line bg-[var(--bg-highlight)] rounded-xl p-3">{d.ageStarFull}</div>}
      </div>

      {/* ═══ 四格气场+卦象 ═══ */}
      <div className="card-jade p-5">
        <h2 className="text-lg font-bold mb-3">🌐 2026年气场 · 卦象</h2>
        <div className="text-xs text-[var(--text-tertiary)] mb-3">主数：2026-1111=915→{d.mainNum}</div>
        <div className="space-y-3">
          {[
            {label:'上层·天格',qi:d.upperQi,energy:d.upperEnergy,gua:d.upperGua,strategy:d.upperStrategy},
            {label:'自我·人格',qi:d.selfQi,energy:d.selfEnergy,gua:d.selfGua,strategy:d.selfStrategy},
            {label:'下层·地格',qi:d.lowerQi,energy:d.lowerEnergy,gua:d.lowerGua,strategy:d.lowerStrategy},
            {label:'对外·总格',qi:d.outerQi,energy:d.outerEnergy,gua:d.outerGua,strategy:d.outerStrategy},
          ].map((q,i)=>(
            <div key={i} className="bg-[var(--bg-highlight)] rounded-xl p-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{q.label}</span>
                <span className="text-xs text-[var(--text-accent)]">象：{q.qi} · 卦：{q.gua}</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                能量：{q.energy}运
                {d.energyFull?.[q.energy] && <span className="ml-1">— {d.energyFull[q.energy]}</span>}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">策略：{q.strategy}</div>
              {/* 详细策略 */}
              {d.xiangStrategy?.[q.qi] && (
                <div className="mt-1 text-xs text-[var(--text-secondary)] opacity-70">
                  上层：{d.xiangStrategy[q.qi].upper} | 自我：{d.xiangStrategy[q.qi].self} | 下层：{d.xiangStrategy[q.qi].lower} | 对外：{d.xiangStrategy[q.qi].outer}
                  {d.xiangStrategy[q.qi].caution && <span className="block mt-0.5 text-red-400">⚠ {d.xiangStrategy[q.qi].caution}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 90年运程卷轴 ═══ */}
      <div className="card-jade p-5">
        <h2 className="text-lg font-bold mb-3">📜 90年运程卷轴</h2>
        <div className="text-xs text-[var(--text-tertiary)] mb-2">出生：{d.year}年 · 10组×9年=90年 · 每年独立卦象</div>
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[var(--text-tertiary)] sticky top-0 bg-[var(--bg-card)]">
              <th className="p-1 text-left">年龄</th><th className="p-1 text-left">年份</th><th className="p-1 text-left">象</th>
              <th className="p-1 text-left">运程</th><th className="p-1 text-left">卦象</th>
              <th className="p-1 text-left">口诀</th><th className="p-1 text-left">解读</th>
            </tr></thead>
            <tbody>
              {d.years.map((y,j)=>(
                <tr key={j} className="border-t border-[var(--border-color)] hover:bg-[var(--bg-highlight)]">
                  <td className="p-1 font-semibold">{y.age}</td><td className="p-1">{y.year}</td>
                  <td className="p-1">{y.chance}</td><td className="p-1">{y.yun}</td>
                  <td className="p-1 font-semibold">{y.gua}</td>
                  <td className="p-1 text-[var(--text-secondary)]">{y.koujue}</td>
                  <td className="p-1 text-[var(--text-secondary)]">{y.jiedu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-xs text-[var(--text-tertiary)] py-6">
        九宫学理 · 人生说明书 — 仅供学习参考 · 程天相九宫学理体系
      </div>
    </div>
  );
}
