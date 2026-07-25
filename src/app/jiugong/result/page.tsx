'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JiugongFull } from '@/lib/jiugong-v3';
import { ENERGY_DESC, QI_DESC, STRATEGY } from '@/lib/jiugong-v3';

/* ═══════════════════════════════════
   共享子组件
   ═══════════════════════════════════ */

function Section({ title, icon, badge, children }: { title:string; icon:string; badge?:string; children:React.ReactNode }) {
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

function StatRow({ items }: { items: { label:string; value:string|number; sub?:string; highlight?:boolean }[] }) {
  return (
    <div className={`grid gap-2 ${items.length<=3?'grid-cols-3':items.length<=4?'grid-cols-4':'grid-cols-5'}`}>
      {items.map((it,i) => (
        <div key={i} className={`text-center rounded-xl p-3 ${
          it.highlight ? 'bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30' : 'bg-[var(--bg-highlight)]'
        }`}>
          <div className="text-[10px] text-[var(--text-tertiary)]">{it.label}</div>
          <div className={`text-lg md:text-xl font-bold ${it.highlight?'gradient-text':'text-[var(--text-primary)]'}`}>{it.value}</div>
          {it.sub && <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}

function HighlightBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 p-3 md:p-4 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 text-sm text-[var(--text-secondary)] leading-relaxed">
      {children}
    </div>
  );
}

/* ═══════════════════════════════════
   结果页主组件
   ═══════════════════════════════════ */

export default function JiugongResultPage() {
  const router = useRouter();
  const [d, setD] = useState<JiugongFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('jiugong-full');
    if (!raw) { router.replace('/jiugong'); return; }
    setD(JSON.parse(raw));
    setLoading(false);
  }, [router]);

  if (loading) return (
    <div className="gradient-bg min-h-screen flex items-center justify-center">
      <div className="cosmic-loader"><div className="cosmic-ring cosmic-ring-1"/><div className="cosmic-ring cosmic-ring-2"/><div className="cosmic-ring cosmic-ring-3"/><div className="cosmic-center">🔮</div></div>
    </div>
  );
  if (!d) return null;

  const wxOrders = {木:1,火:2,土:3,金:4,水:5} as Record<string,number>;
  const ren2diRel = d.renWx===d.diWx?'平' : ((wxOrders[d.renWx]??0)+1)%5+1===(wxOrders[d.diWx]??0) ? '生' : ((wxOrders[d.diWx]??0)+1)%5+1===(wxOrders[d.renWx]??0) ? '被生' : '克';

  return (
    <div className="gradient-bg min-h-screen px-4 py-8 md:py-10">
      <div className="max-w-3xl mx-auto">

        {/* 报告标题 */}
        <div className="text-center mb-6">
          <span className="tag-pill text-xs tracking-widest mb-3 inline-block">程天相九宫学理 · 康熙字典笔画</span>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{d.name} 的<span className="gradient-text">人生说明书</span></h1>
          <p className="text-xs text-[var(--text-tertiary)]">{d.year}年{d.month}月{d.day}日出生 · 虚岁{d.xuAge} · 总笔画{d.total}</p>
        </div>

        <div className="space-y-4">

          {/* ═══════════ 1. 命盘摘要 ═══════════ */}
          <Section title="命盘摘要" icon="📋" badge={`局${d.ju}·质${d.zhi}`}>
            <StatRow items={[
              {label:'姓名',value:d.name},{label:'出生',value:`${d.year}.${d.month}.${d.day}`},
              {label:'虚岁',value:`${d.xuAge}岁`},{label:'总笔画',value:`${d.total}画`},
              {label:'三才',value:`天${d.tianWx}/人${d.renWx}/地${d.diWx}`},
            ]}/>
          </Section>

          {/* ═══════════ 2. 五格三才 ═══════════ */}
          <Section title="五格三才" icon="🔢">
            <StatRow items={[
              {label:'天格',value:d.tian,sub:d.tianWx},{label:'人格',value:d.ren,sub:d.renWx,highlight:true},
              {label:'地格',value:d.di,sub:d.diWx},{label:'总格',value:d.zong},{label:'外格',value:d.wai},
            ]}/>
            <HighlightBox>
              <strong>三才配置：</strong>天{d.tianWx} / 人{d.renWx} / 地{d.diWx}。
              人格与地格{d.renWx===d.diWx?'平' : ren2diRel==='生'?'相生(旺象)':ren2diRel==='被生'?'地生人(淡象)':'相克(破象)'}。
              {ren2diRel==='生'?'人克地：主动开创，掌控力强。':ren2diRel==='被生'?'地被生：基础稳固，外援充足。':ren2diRel==='克'?'人与地相克：需调和自我与环境的关系。':'两格平衡：内外一致。'}
            </HighlightBox>
          </Section>

          {/* ═══════════ 3. 成功机运 & 本质特质 ═══════════ */}
          <Section title="成功机运 & 本质特质" icon="🎯">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[var(--bg-highlight)] rounded-xl p-4 border-l-4 border-[var(--color-primary)]">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">局差 {d.ju} · 成功机运</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{d.juDesc}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-2">{d.juAdvice}</div>
              </div>
              <div className="bg-[var(--bg-highlight)] rounded-xl p-4 border-l-4 border-emerald-400">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">质数 {d.zhi} · 本质特质</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{d.zhiDesc}</div>
              </div>
            </div>
          </Section>

          {/* ═══════════ 4. 管理IQ ═══════════ */}
          <Section title="管理 IQ" icon="🧠" badge="九型管理风格">
            <div className="bg-[var(--bg-highlight)] rounded-xl p-4 border-l-4 border-[var(--color-primary)]">
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-14 h-14 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center text-2xl font-bold gradient-text">{d.mgtScore}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[var(--text-primary)]">{d.mgtType}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">名字第二字 {d.secondStroke} 画</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{d.mgtDesc}</p>
                </div>
              </div>
            </div>
            <HighlightBox>
              <strong>管理风格解读：</strong> {d.mgtScore>=80?'管理天赋高，善用影响力，组织能力强。':d.mgtScore>=70?'管理细胞良好，后天可培养，适合中层管理。':'管理细胞需后天激发，模仿学习。适合专业性管理工作。'}
            </HighlightBox>
          </Section>

          {/* ═══════════ 5. 五行性格 ═══════════ */}
          <Section title="五行性格" icon="⚖️" badge="思想功能 · 行动功能">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[var(--bg-highlight)] rounded-xl p-4 text-center">
                <div className="text-xs text-[var(--text-tertiary)]">思想功能（天格→人格）</div>
                <div className="text-lg font-bold text-[var(--text-primary)] mt-1">{d.thinkFunc}</div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1">35岁前思维模式 · 与上层关系</div>
              </div>
              <div className="bg-[var(--bg-highlight)] rounded-xl p-4 text-center">
                <div className="text-xs text-[var(--text-tertiary)]">行动功能（人格→地格）</div>
                <div className="text-lg font-bold text-[var(--text-primary)] mt-1">{d.actionFunc}</div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1">35岁后行为模式 · 与下属/配偶关系</div>
              </div>
            </div>
            <HighlightBox>
              <strong>性格倾向：</strong> {d.xinggeDetail}
            </HighlightBox>
          </Section>

          {/* ═══════════ 6. 婚姻分析 ═══════════ */}
          <Section title="婚姻分析" icon="💞">
            <div className="bg-[var(--bg-highlight)] rounded-xl p-4 border-l-4 border-pink-400">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[var(--text-primary)]">{d.marriageType}</span>
                <span className="text-xs text-[var(--text-tertiary)]">婚姻宫</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{d.marriageDesc}</p>
            </div>
            <HighlightBox>
              <strong>缘起缘灭：</strong> {d.marriageDetail}
            </HighlightBox>
          </Section>

          {/* ═══════════ 7. 财运分析 ═══════════ */}
          <Section title="财运分析" icon="💰">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="bg-[var(--bg-highlight)] rounded-xl p-4 border-l-4 border-amber-400">
                <div className="text-xs text-[var(--text-tertiary)]">财库类型</div>
                <div className="font-bold text-[var(--text-primary)] mt-1">{d.wealthType}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{d.wealthDesc}</div>
              </div>
              <div className="bg-[var(--bg-highlight)] rounded-xl p-4 border-l-4 border-yellow-400">
                <div className="text-xs text-[var(--text-tertiary)]">财库通路</div>
                <div className="font-bold text-[var(--text-primary)] mt-1">{d.pathType}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{d.pathDesc}</div>
              </div>
            </div>
            <HighlightBox>
              <strong>理财建议：</strong> {d.wealthAdvice} 通路类型为{d.pathType}——{d.pathDesc}
            </HighlightBox>
          </Section>

          {/* ═══════════ 8. 岁值星 ═══════════ */}
          <Section title="岁值星 · 心灵动力" icon="⭐">
            <div className="flex items-center gap-4 bg-[var(--bg-highlight)] rounded-xl p-4">
              <div className="shrink-0 w-14 h-14 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center text-xl">⭐</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[var(--text-tertiary)]">虚岁{d.xuAge} · 尾数{d.xuAge%10}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)]">{d.ageStar}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{d.ageStarDesc}</p>
              </div>
            </div>
          </Section>

          {/* ═══════════ 9. 四大关系气场 ═══════════ */}
          <Section title="四大关系 · 气场" icon="🌐">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                {label:'上层',qi:d.upperQi,icon:'⬆️'},{label:'自我',qi:d.selfQi,icon:'🎯'},
                {label:'下层',qi:d.lowerQi,icon:'⬇️'},{label:'对外',qi:d.outerQi,icon:'🌍'},
              ].map(item=>(
                <div key={item.label} className="bg-[var(--bg-highlight)] rounded-xl p-3 border-l-4 border-[var(--color-primary)]/30">
                  <div className="flex items-center gap-1 mb-1">
                    <span>{item.icon}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">{item.label}关系</span>
                  </div>
                  <div className="text-base font-bold text-[var(--text-primary)]">{item.qi}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{QI_DESC[item.qi]||''}</div>
                </div>
              ))}
            </div>
            <HighlightBox>
              <strong>上层策略：</strong>{d.strategy.upper}<br/>
              <strong>自我策略：</strong>{d.strategy.self}<br/>
              <strong>下层策略：</strong>{d.strategy.lower}<br/>
              <strong>对外策略：</strong>{d.strategy.outer}
            </HighlightBox>
          </Section>

          {/* ═══════════ 10. 十大能量 · 内在动能 ═══════════ */}
          <Section title="十大能量 · 内在动能" icon="⚡">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                {label:'天格能量(脑力)',e:d.tianE},{label:'人格能量(情绪)',e:d.renE},
                {label:'地格能量(行动)',e:d.diE},{label:'总格能量(整体)',e:d.zongE},
              ].map(item=>(
                <div key={item.label} className="bg-[var(--bg-highlight)] rounded-xl p-3 border-l-4 border-[var(--color-primary)]/30">
                  <div className="text-[10px] text-[var(--text-tertiary)]">{item.label}</div>
                  <div className="text-base font-bold text-[var(--text-primary)]">{item.e}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{ENERGY_DESC[item.e]||''}</div>
                </div>
              ))}
            </div>
            <HighlightBox>
              胎是谷底也是转，一切变量九宫管。养得助力在人际，长生贵人生两地。<br/>
              看人成功与失败，流年关键在冠带。临官动力是十足，创业升官看基础。<br/>
              若是帝旺还负债，后运滚滚筑高台。衰是倦怠病最乱，死绝常有鬼来撞。
            </HighlightBox>
          </Section>

          {/* ═══════════ 11. 碰撞周期 ═══════════ */}
          <Section title="碰撞周期" icon="💥" badge="人生转折点">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[var(--bg-highlight)] rounded-xl p-3 text-center">
                <div className="text-[10px] text-[var(--text-tertiary)]">上层碰撞</div>
                <div className="text-xs font-semibold mt-1 text-[var(--text-primary)]">{d.upperColl.slice(0,5).join('、')}…</div>
                <div className="text-[10px] text-[var(--text-tertiary)] mt-1">犯上·变节·开窍·田宅</div>
              </div>
              <div className="bg-[var(--bg-highlight)] rounded-xl p-3 text-center">
                <div className="text-[10px] text-[var(--text-tertiary)]">自我碰撞</div>
                <div className="text-xs font-semibold mt-1 text-[var(--text-primary)]">{d.selfColl.slice(0,5).join('、')}…</div>
                <div className="text-[10px] text-[var(--text-tertiary)] mt-1">变心·冲突·情绪不稳</div>
              </div>
              <div className="bg-[var(--bg-highlight)] rounded-xl p-3 text-center">
                <div className="text-[10px] text-[var(--text-tertiary)]">下层碰撞</div>
                <div className="text-xs font-semibold mt-1 text-[var(--text-primary)]">{d.lowerColl.slice(0,5).join('、')}…</div>
                <div className="text-[10px] text-[var(--text-tertiary)] mt-1">情变·亲友反目·破财</div>
              </div>
            </div>
            <HighlightBox>
              <strong>应变之道：</strong> 上层碰撞需克制，思想上开窍；自我碰撞注意情绪与健康；下层碰撞理性抉择，防意外。碰撞之年宜静不宜动。
            </HighlightBox>
          </Section>

          {/* ═══════════ 12. 90年运势卷轴 ═══════════ */}
          <Section title="90年运势卷轴" icon="📜" badge="十年一组·九年一轮">
            <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
              <table className="w-full text-xs md:text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    <th className="text-left py-2 text-[var(--text-tertiary)] font-semibold">组别</th>
                    <th className="text-left py-2 text-[var(--text-tertiary)] font-semibold">年龄</th>
                    <th className="text-left py-2 text-[var(--text-tertiary)] font-semibold">卦象</th>
                    <th className="text-left py-2 text-[var(--text-tertiary)] font-semibold">口诀</th>
                    <th className="text-left py-2 text-[var(--text-tertiary)] font-semibold">解读</th>
                  </tr>
                </thead>
                <tbody>
                  {d.groups.map((g,i) => (
                    <tr key={i} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-highlight)]">
                      <td className="py-2 font-semibold text-[var(--text-primary)]">{g.name}</td>
                      <td className="py-2 text-[var(--text-secondary)]">{g.ages}</td>
                      <td className="py-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">{g.gua}</span>
                      </td>
                      <td className="py-2 text-[var(--text-secondary)] text-[11px]">{g.koujue}</td>
                      <td className="py-2 text-[var(--text-secondary)] text-[11px]">{g.jie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <HighlightBox>
              十年一组，每组九年。运势如四季轮转——{d.groups[0].name}开局，{d.groups[5].name}正当年，{d.groups[9].name}收尾。顺势而为，逆势而修。
            </HighlightBox>
          </Section>

          {/* ═══════════ 13. 流年运作策略 ═══════════ */}
          <Section title="流年运作策略" icon="🧭">
            <div className="grid grid-cols-2 gap-2">
              {[
                {label:'上层',v:d.strategy.upper},{label:'自我',v:d.strategy.self},
                {label:'下层',v:d.strategy.lower},{label:'对外',v:d.strategy.outer},
              ].map(item=>(
                <div key={item.label} className="bg-[var(--bg-highlight)] rounded-xl p-3 border-l-4 border-[var(--color-primary)]/30">
                  <div className="text-[10px] text-[var(--text-tertiary)]">{item.label}策略</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mt-1">{item.v}</div>
                </div>
              ))}
            </div>
            <HighlightBox>
              <strong>核心提醒：</strong> 气场不可改变，但能量可以调整。知道自己的磁场变化，就能提前布局。
              运势好时紧追不舍，运势弱时耐心等待。每一年的岁值星是当年的心灵动力，配合气场策略使用效果更佳。
            </HighlightBox>
          </Section>

        </div>

        {/* 底部 */}
        <div className="mt-6 text-center space-y-3">
          <button onClick={()=>router.push('/jiugong')}
            className="px-6 py-2.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:border-[var(--color-primary)]/40 transition-all">
            ← 重新测算
          </button>
          <p className="text-xs text-[var(--text-tertiary)] opacity-60">
            九宫姓名学 · 程天相九宫学理体系 · 仅供自我认识参考
          </p>
        </div>
      </div>
    </div>
  );
}
