'use client';

import { useState, useCallback } from 'react';

interface BaziData {
  pillars: string[];
  detail: { pillar: string; gan: string; zhi: string; shiShenGan: string; hideGan: string; nayin: string; diShi: string }[];
  dayMaster: string;
  dayMasterElement: string;
  elementDistribution: Record<string, number>;
  daYun: { startAge: number; yun: { ganZhi: string; age: number }[] };
  mingGong: string;
}

interface HDData {
  type: string; authority: string; profile: string;
  definition: string; incarnationCross: string;
  definedCenters: string[]; activatedGates: number[]; channels: string[];
  signature: string; notSelfTheme: string;
}

const PROVINCES = ['北京','上海','天津','重庆','河北','山西','内蒙古','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西','海南','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆','香港','澳门','台湾'];

export default function FusionPage() {
  const [form, setForm] = useState({ year: '', month: '', day: '', hour: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bazi, setBazi] = useState<BaziData | null>(null);
  const [hd, setHD] = useState<HDData | null>(null);
  const [fusion, setFusion] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.year || !form.month || !form.day) { setError('请填写完整的出生日期'); return; }
    setLoading(true); setError(''); setBazi(null); setHD(null); setFusion('');

    try {
      // 并行调用八字和人类图API
      const [baziRes, hdRes] = await Promise.all([
        fetch('/api/bazi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }).then(r => r.json()),
        fetch('/api/human-design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }).then(r => r.json()),
      ]);

      if (!baziRes.success) throw new Error(baziRes.error || '八字生成失败');
      if (!hdRes.success) throw new Error(hdRes.error || '人类图生成失败');

      setBazi(baziRes.data || baziRes);
      setHD(hdRes.bodygraph);

      // 融合分析
      try {
        const fusionRes = await fetch('/api/fusion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const fusionData = await fusionRes.json();
        setFusion(fusionData.fusion || fusionData.interpretation || '');
      } catch {}
    } catch (err: any) {
      setError(err.message || '生成失败');
    } finally { setLoading(false); }
  }, [form]);

  const ElementBar = ({ dist }: { dist: Record<string, number> }) => {
    const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
    const colors: Record<string, string> = { '木': '#4ade80', '火': '#f87171', '土': '#fbbf24', '金': '#a78bfa', '水': '#60a5fa' };
    return (
      <div className="flex h-6 rounded-full overflow-hidden border border-[var(--border-color)]">
        {Object.entries(dist).map(([k, v]) => (
          <div key={k} style={{ width: `${(v / total) * 100}%`, backgroundColor: colors[k] || '#888' }}
            className="flex items-center justify-center text-[10px] text-white font-medium">
            {k}{v}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="py-8 md:py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <div className="text-3xl mb-3">🔮🧬</div>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">八字 · 人类图 融合分析</h1>
        <p className="text-sm text-[var(--text-secondary)]">输入出生信息，获得传统八字与现代人类图的交叉解读</p>
      </div>

      {!bazi && (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 card-jade p-6">
          <div className="grid grid-cols-3 gap-3">
            <select className="input-jade" value={form.year} onChange={e => setForm(p => ({...p, year: e.target.value}))} required>
              <option value="">年</option>
              {Array.from({length:100},(_,i)=>String(new Date().getFullYear()-i)).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="input-jade" value={form.month} onChange={e => setForm(p => ({...p, month: e.target.value}))} required>
              <option value="">月</option>
              {[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1)}>{i+1}月</option>)}
            </select>
            <select className="input-jade" value={form.day} onChange={e => setForm(p => ({...p, day: e.target.value}))} required>
              <option value="">日</option>
              {[...Array(31)].map((_, i) => <option key={i+1} value={String(i+1)}>{i+1}日</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="input-jade" value={form.hour} onChange={e => setForm(p => ({...p, hour: e.target.value}))}>
              <option value="">时辰</option>
              {[...Array(24)].map((_, i) => <option key={i} value={String(i)}>{String(i).padStart(2,'0')}:00</option>)}
            </select>
            <select className="input-jade" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))}>
              <option value="">地点</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <button type="submit" className="btn-jade w-full" disabled={loading}>
            {loading ? '🔮🧬 双系统分析中...' : '🔮🧬 生成融合报告'}
          </button>
        </form>
      )}

      {loading && <div className="text-center py-12"><div className="cosmic-loader mx-auto mb-4"/><p>正在并行计算八字和人类图...</p></div>}

      {bazi && hd && (
        <div className="space-y-6">
          {/* Twins View */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Bazi Card */}
            <div className="card-jade p-6">
              <h3 className="text-lg font-bold mb-3">🔮 八字</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {bazi.pillars.map((p, i) => (
                  <div key={i} className="text-center p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                    <div className="text-base font-bold gradient-text">{p}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-1">
                      {bazi.detail[i]?.shiShenGan || ''}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{bazi.detail[i]?.nayin || ''}</div>
                  </div>
                ))}
              </div>
              <div className="text-sm mb-2">日主：<span className="font-bold">{bazi.dayMaster}{bazi.dayMasterElement}</span></div>
              <ElementBar dist={bazi.elementDistribution} />
              <div className="text-xs text-[var(--text-secondary)] mt-2">
                命宫{bazi.mingGong} | 大运{bazi.daYun.startAge}岁起运
              </div>
            </div>

            {/* HD Card */}
            <div className="card-jade p-6">
              <h3 className="text-lg font-bold mb-3">🧬 人类图</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">类型</span><span className="font-bold gradient-text">{hd.type}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">权威</span><span>{hd.authority}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">人生角色</span><span>{hd.profile}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">定义</span><span>{hd.definition}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">签名</span><span>{hd.signature}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">非自我</span><span>{hd.notSelfTheme}</span></div>
                <div className="pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">定义中心：</span>
                  <span>{hd.definedCenters?.join(', ') || '无'}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {hd.channels?.map(ch => <span key={ch} className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--text-accent)]/10 text-[var(--text-accent)]">{ch}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Fusion Analysis */}
          <div className="card-jade p-6">
            <h3 className="text-lg font-bold mb-3">🔗 融合分析</h3>
            {fusion ? (
              <div className="text-sm leading-relaxed whitespace-pre-line">{fusion}</div>
            ) : (
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">八字日主{bazi.dayMaster}{bazi.dayMasterElement} 对应人类图{hd.type}类型</p>
                <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  <p className="mb-2">【八字视角】{bazi.dayMaster}{bazi.dayMasterElement}日主，命宫{bazi.mingGong}，五行以{Object.entries(bazi.elementDistribution).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>`${k}(${v})`).join('、')}为主。</p>
                  <p className="mb-2">【人类图视角】{hd.type}类型，{hd.authority}权威，{hd.profile}人生角色。定义中心：{hd.definedCenters?.join('、') || '无'}。</p>
                  <p>【交叉分析】八字日主{bazi.dayMasterElement}与人类图{hd.type}类型之间存在对应关系。八字中的{bazi.dayMaster}金与人类图定义能量中心的相互影响，建议结合两种体系的长处来认识自己。</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <button onClick={() => { setBazi(null); setHD(null); setFusion(''); }} className="btn-jade max-w-xs inline-flex" style={{width:'auto'}}>🔄 重新查询</button>
            <button onClick={() => { document.title = `融合分析报告`; window.print(); }} className="px-6 py-3 rounded-xl border border-[var(--border-color)] text-sm hover:border-[var(--text-accent)] transition-all ml-3">📄 下载PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
