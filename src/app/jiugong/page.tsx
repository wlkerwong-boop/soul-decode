'use client';

import { useState, useEffect } from 'react';
import { calcFull, loadKangxi, type JiugongFull } from '@/lib/jiugong-v3';

export default function JiugongPage() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [data, setData] = useState<JiugongFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [dictReady, setDictReady] = useState(false);

  useEffect(() => { loadKangxi().then(() => setDictReady(true)); }, []);

  const submit = async () => {
    if (!name || !year) return;
    setLoading(true);
    await loadKangxi();
    const result = calcFull(name, parseInt(year), parseInt(month)||1, parseInt(day)||1);
    setData(result);
    setLoading(false);
  };

  const d = data;

  return (
    <div className="gradient-bg min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">📜 九宫姓名学</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">基于程天相九宫学理 · 康熙字典笔画</p>
        </div>

        {!d ? (
          <div className="card-jade p-6 max-w-lg mx-auto space-y-4 report-form">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="姓名（2-4个汉字）"
              className="w-full input-jade text-sm py-3 px-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]" />
            <div className="grid grid-cols-3 gap-2">
              <input value={year} onChange={e=>setYear(e.target.value)} placeholder="出生年" type="number"
                className="input-jade text-sm py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]" />
              <input value={month} onChange={e=>setMonth(e.target.value)} placeholder="月" type="number"
                className="input-jade text-sm py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]" />
              <input value={day} onChange={e=>setDay(e.target.value)} placeholder="日" type="number"
                className="input-jade text-sm py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]" />
            </div>
            <button onClick={submit} disabled={!name||!year||loading||!dictReady}
              className="w-full py-3.5 rounded-xl font-semibold bg-[var(--text-accent)] text-white transition-all disabled:opacity-40">
              {dictReady ? '🔮 生成人生报告' : '⏳ 加载字典中…'}
            </button>
            <p className="text-xs text-[var(--text-tertiary)] text-center">🔒 信息仅用于排盘，绝不外泄</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. 摘要 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-3">📋 命盘摘要</h2>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-center text-sm">
                {[{l:'姓名',v:d.name},{l:'出生',v:`${d.year}.${d.month}.${d.day}`},{l:'虚岁',v:`${d.xuAge}岁`},
                  {l:'总笔画',v:`${d.total}画`},{l:'局',v:`局差${d.ju}`}].map((item,i)=>(
                  <div key={i} className="bg-[var(--bg-highlight)] rounded-xl p-3">
                    <div className="text-[var(--text-tertiary)] text-xs">{item.l}</div>
                    <div className="font-bold text-[var(--text-accent)]">{item.v}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--text-secondary)] text-center mt-2">
                三才：天{d.tianWx} / 人{d.renWx} / 地{d.diWx}
              </p>
            </div>

            {/* 2. 五格 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-3">🔢 五格</h2>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                {[{l:'天格',v:d.tian,wx:d.tianWx},{l:'人格',v:d.ren,wx:d.renWx},{l:'地格',v:d.di,wx:d.diWx},
                  {l:'总格',v:d.zong,wx:'-'},{l:'外格',v:d.wai,wx:'-'}].map((g,i)=>(
                  <div key={i} className="bg-[var(--bg-highlight)] rounded-xl p-3">
                    <div className="text-[var(--text-tertiary)] text-xs">{g.l}</div>
                    <div className="text-xl font-bold text-[var(--text-accent)]">{g.v}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{g.wx}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 局质 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-3">🎯 成功机运 & 本质特质</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[var(--bg-highlight)] rounded-xl p-4 border-l-4 border-[var(--text-accent)]">
                  <div className="text-xs text-[var(--text-tertiary)]">局差 {d.ju}</div>
                  <div className="text-sm font-semibold mt-1">{d.juDesc}</div>
                </div>
                <div className="bg-[var(--bg-highlight)] rounded-xl p-4 border-l-4 border-emerald-400">
                  <div className="text-xs text-[var(--text-tertiary)]">质数 {d.zhi}</div>
                  <div className="text-sm font-semibold mt-1">{d.zhiDesc}</div>
                </div>
              </div>
            </div>

            {/* 4. 管理IQ */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-2">🧠 管理 IQ · {d.mgtType}</h2>
              <p className="text-sm text-[var(--text-secondary)]">评分 {d.mgtScore} · {d.mgtDesc}</p>
            </div>

            {/* 5. 五行性格 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-3">⚖️ 五行性格</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--bg-highlight)] rounded-xl p-4 text-center">
                  <div className="text-xs text-[var(--text-tertiary)]">思想功能（天→人）</div>
                  <div className="text-base font-bold mt-1">{d.tianWx}{d.tianWx===d.renWx?'平':d.tianWx==='木'&&d.renWx==='火'||d.tianWx==='火'&&d.renWx==='土'||d.tianWx==='土'&&d.renWx==='金'||d.tianWx==='金'&&d.renWx==='水'||d.tianWx==='水'&&d.renWx==='木'?'生':'克'}{d.renWx}</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">35岁前思维模式</div>
                </div>
                <div className="bg-[var(--bg-highlight)] rounded-xl p-4 text-center">
                  <div className="text-xs text-[var(--text-tertiary)]">行动功能（人→地）</div>
                  <div className="text-base font-bold mt-1">{d.renWx}{d.renWx===d.diWx?'平':d.renWx==='木'&&d.diWx==='火'||d.renWx==='火'&&d.diWx==='土'||d.renWx==='土'&&d.diWx==='金'||d.renWx==='金'&&d.diWx==='水'||d.renWx==='水'&&d.diWx==='木'?'生':'克'}{d.diWx}</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">35岁后行为模式</div>
                </div>
              </div>
            </div>

            {/* 6. 婚姻 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-2">💞 婚姻 · {d.marriageType}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{d.marriageDesc}</p>
            </div>

            {/* 7. 财运 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-2">💰 财运 · {d.wealthType}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{d.wealthDesc}</p>
            </div>

            {/* 8. 岁值星 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-2">⭐ 岁值星 · {d.ageStar}</h2>
              <p className="text-xs text-[var(--text-tertiary)]">虚岁 {d.xuAge} · {d.ageStarDesc}</p>
            </div>

            {/* 9. 四大关系 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-3">🌐 四大关系</h2>
              <div className="grid grid-cols-2 gap-3">
                {[{l:'上层',v:d.upperQi},{l:'自我',v:d.selfQi},{l:'下层',v:d.lowerQi},{l:'对外',v:d.outerQi}].map((q,i)=>(
                  <div key={i} className="bg-[var(--bg-highlight)] rounded-xl p-3 border-l-4 border-[var(--text-accent)]">
                    <div className="text-xs text-[var(--text-tertiary)]">{q.l}</div>
                    <div className="font-bold text-sm">{q.v} · {d.qiDesc[q.v]||''}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 10. 能量 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-3">⚡ 十大能量</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
                {[{l:'天格',v:d.tianE},{l:'人格',v:d.renE},{l:'地格',v:d.diE},{l:'总格',v:d.zongE}].map((e,i)=>(
                  <div key={i} className="bg-[var(--bg-highlight)] rounded-xl p-3">
                    <div className="text-xs text-[var(--text-tertiary)]">{e.l}</div>
                    <div className="font-bold">{e.v}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{d.eDesc[e.v]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 11. 碰撞 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-2">💥 碰撞周期</h2>
              <div className="text-sm text-[var(--text-secondary)] space-y-2">
                <p>上层：{d.upperColl.join('岁、')}岁</p>
                <p>自我：{d.selfColl.join('岁、')}岁</p>
                <p>下层：{d.lowerColl.join('岁、')}岁</p>
              </div>
            </div>

            {/* 12. 90年卷轴 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-3">📜 90年运势卷轴</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="bg-[var(--bg-highlight)]">
                      <th className="p-2 text-left">组别</th><th className="p-2 text-left">年龄</th>
                      <th className="p-2 text-left">卦象</th><th className="p-2 text-left">口诀</th>
                      <th className="p-2 text-left">解读</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.groups.map((g,i)=>(<tr key={i} className="border-t border-[var(--border-color)]">
                      <td className="p-2 font-semibold">{g.name}</td><td className="p-2">{g.ages}</td>
                      <td className="p-2">{g.gua}</td><td className="p-2">{g.koujue}</td>
                      <td className="p-2 text-[var(--text-secondary)]">{g.jie}</td>
                    </tr>))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 13. 流年策略 */}
            <div className="card-jade p-5">
              <h2 className="text-lg font-bold mb-3">🧭 当前流年策略</h2>
              <div className="text-sm text-[var(--text-secondary)] space-y-2">
                <p><strong>上层</strong>（{d.upperQi}）：保持伦理，维护上层关系</p>
                <p><strong>自我</strong>（{d.selfQi}）：顺势而行，不可逆势强求</p>
                <p><strong>下层</strong>（{d.lowerQi}）：稳固根基，防人心变动</p>
                <p><strong>对外</strong>（{d.outerQi}）：外部环境与应对之道</p>
              </div>
            </div>

            <button onClick={()=>setData(null)} className="w-full py-3 rounded-xl bg-[var(--bg-highlight)] text-[var(--text-secondary)] text-sm">
              重新测算
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
