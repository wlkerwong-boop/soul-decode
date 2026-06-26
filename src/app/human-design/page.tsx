'use client';

import { useState, useCallback } from 'react';

// 人类图问答组件
function HDQA() {
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = useCallback(async () => {
    if (!q.trim()) return;
    setLoading(true); setA('');
    try {
      const r = await fetch('/api/hd-qa', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ query: q }),
      });
      const d = await r.json();
      setA(d.answer || '未找到答案');
    } catch { setA('查询失败'); }
    finally { setLoading(false); }
  }, [q]);

  return (<div><h3 className="text-lg font-bold mb-4">💬 人类图知识问答</h3>
    <p className="text-sm text-[var(--text-secondary)] mb-4">提问关于人类图的概念、类型、中心、通道等问题</p>
    <div className="flex gap-2 mb-4">
      <input className="input-jade flex-1" value={q} onChange={e => setQ(e.target.value)}
        placeholder="例如：什么是投射者？荐骨权威怎么用？"
        onKeyDown={e => e.key === 'Enter' && ask()} />
      <button onClick={ask} disabled={loading} className="btn-jade" style={{width:'auto'}}>{loading ? '...' : '提问'}</button>
    </div>
    {loading && <p className="text-sm text-[var(--text-secondary)]">查询中...</p>}
    {a && <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm leading-relaxed whitespace-pre-line">{a}</div>}
  </div>);
}

interface HDBodygraph {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnationCross: string;
  signature: string;
  notSelfTheme: string;
  definedCenters: string[];
  undefinedCenters: string[];
  centerDefinition: Record<string, boolean>;
  activatedGates: number[];
  channels: string[];
  circuitries: string[];
}

const PROVINCES = ['北京','上海','天津','重庆','河北','山西','内蒙古','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西','海南','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆','香港','澳门','台湾'];

const TYPE_INFO: Record<string, { emoji: string; desc: string }> = {
  'Generator': { emoji: '⚡', desc: '建设者 — 能量源源不断，等待正确的事情投入' },
  'Manifesting Generator': { emoji: '⚡🔥', desc: '显示建设者 — 快速启动+持续投入，多线程高效能' },
  'Projector': { emoji: '🔭', desc: '投射者 — 天赋是看透他人，等待被邀请' },
  'Manifestor': { emoji: '🚀', desc: '显示者 — 发起一切的能力，告知他人即可' },
  'Reflector': { emoji: '🌙', desc: '反映者 — 社区的镜子，需完整月亮周期做决定' },
};

const CENTER_NAMES: Record<string, string> = {
  'Head': '头顶中心 — 灵感与压力',
  'Ajna': '眉心中心 — 概念化与思考',
  'Throat': '喉咙中心 — 表达与行动',
  'G': 'G中心 — 方向与爱',
  'Ego': '意志力中心 — 意志与自我价值',
  'Sacral': '荐骨中心 — 生命能量与回应',
  'Solar Plexus': '情绪中心 — 情绪感受与觉察',
  'Spleen': '脾中心 — 直觉与生存',
  'Root': '根部中心 — 压力与动力',
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

export default function HumanDesignPage() {
  const [form, setForm] = useState({ year: '', month: '', day: '', hour: '', location: '', gender: '', timezone: '' });
  const [loading, setLoading] = useState(false);
  const [hd, setHd] = useState<HDBodygraph | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [interp, setInterp] = useState('');
  const [interpLoading, setInterpLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.year || !form.month || !form.day) { setError('请填写完整的出生日期'); return; }
    setLoading(true); setError(''); setHd(null); setInterp('');
    try {
      const payload = { ...form, timezone: form.timezone || 'Asia/Shanghai' };
      const res = await fetch('/api/human-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '生成失败');
      setHd(data.bodygraph);
    } catch (err: any) {
      setError(err.message || '人类图生成失败');
    } finally { setLoading(false); }
  }, [form]);

  const handleInterpret = useCallback(async () => {
    if (!hd) return;
    setInterpLoading(true); setInterp('');
    try {
      const res = await fetch('/api/hd-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodygraph: hd }),
      });
      const data = await res.json();
      setInterp(data.interpretation || '解析生成失败');
    } catch { setInterp('解析生成失败'); }
    finally { setInterpLoading(false); }
  }, [hd]);

  const ti = hd ? TYPE_INFO[hd.type] : null;

  return (
    <div className="py-8 md:py-16 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <div className="text-3xl mb-3">🧬</div>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">人类图 · Human Design</h1>
        <p className="text-sm text-[var(--text-secondary)]">输入出生信息，生成你的专属能量地图</p>
      </div>

      {!hd && (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 card-jade p-6 md:p-8">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">出生日期 *</label>
            <div className="grid grid-cols-3 gap-3">
              <select className="input-jade" value={form.year} onChange={e => setForm(p => ({...p, year: e.target.value}))} required>
                <option value="">年</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
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
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">出生时间</label>
            <select className="input-jade" value={form.hour} onChange={e => setForm(p => ({...p, hour: e.target.value}))}>
              <option value="">不确定</option>
              {[...Array(24)].map((_, i) => <option key={i} value={String(i).padStart(2,'0')}>{String(i).padStart(2,'0')}:00</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">出生地点</label>
            <select className="input-jade" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))}>
              <option value="">选择省份</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">时区</label>
            <select className="input-jade" value={form.timezone} onChange={e => setForm(p => ({...p, timezone: e.target.value}))}>
              <option value="Asia/Shanghai">中国标准时间（默认）</option>
              <option value="America/Los_Angeles">美国洛杉矶（UTC-7/8）</option>
              <option value="America/New_York">美国纽约（UTC-4/5）</option>
              <option value="Europe/London">英国伦敦（UTC+0/1）</option>
              <option value="Europe/Paris">欧洲巴黎（UTC+1/2）</option>
              <option value="Australia/Sydney">澳大利亚悉尼（UTC+10/11）</option>
              <option value="Asia/Tokyo">日本东京（UTC+9）</option>
            </select>
          </div>
          {error && <div className="text-sm text-red-500 bg-red-500/5 border border-red-500/15 rounded-lg px-4 py-3">{error}</div>}
          <button type="submit" className="btn-jade" disabled={loading}>
            {loading ? '🧬 计算中...' : '🧬 生成我的人类图'}
          </button>
          <p className="text-[10px] text-center text-[var(--text-secondary)] opacity-50">基于ephemeris-astronomy近似计算，精度±1个闸门</p>
        </form>
      )}

      {loading && (
        <div className="text-center py-20">
          <div className="cosmic-loader mx-auto mb-8"><div className="cosmic-ring cosmic-ring-1"/><div className="cosmic-ring cosmic-ring-2"/><div className="cosmic-center">🧬</div></div>
          <p className="text-lg text-[var(--text-accent)] loading-pulse">正在计算星历位置...</p>
        </div>
      )}

      {hd && (
        <div className="space-y-6">
          {/* Type Hero */}
          <div className="card-jade p-6 md:p-8 text-center" style={{ borderColor: 'var(--border-accent)' }}>
            <div className="text-4xl mb-3">{ti?.emoji || '🧬'}</div>
            <h2 className="text-2xl font-bold gradient-text mb-2">{hd.type}</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">{ti?.desc}</p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="tag-pill">策略：{hd.strategy}</span>
              <span className="tag-pill">权威：{hd.authority}</span>
              <span className="tag-pill">角色：{hd.profile}</span>
              <span className="tag-pill">定义：{hd.definition}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'overview', label: '📊 概览' },
              { id: 'centers', label: '⚪ 能量中心' },
              { id: 'gates', label: '🚪 闸门' },
              { id: 'cross', label: '🎯 使命' },
              { id: 'qa', label: '💬 问答' },
              { id: 'interpret', label: '📜 解读' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${tab === t.id ? 'bg-[var(--text-accent)] text-white font-medium' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">🧬 类型</h3><p className="text-lg font-bold">{hd.type}</p><p className="text-xs text-[var(--text-secondary)] mt-1">策略：{hd.strategy}</p></div>
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">⚖️ 内在权威</h3><p className="text-lg font-bold">{hd.authority}</p></div>
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">🎭 人生角色</h3><p className="text-lg font-bold">{hd.profile}</p></div>
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">🔗 定义</h3><p className="text-lg font-bold">{hd.definition}</p></div>
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">✅ 签名</h3><p className="text-lg font-bold">{hd.signature}</p></div>
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">⚠️ 非自我主题</h3><p className="text-lg font-bold text-red-500">{hd.notSelfTheme}</p></div>
            </div>
          )}

          {tab === 'centers' && (
            <div className="grid md:grid-cols-3 gap-3">
              {Object.entries(CENTER_NAMES).map(([center, desc]) => {
                const defined = hd.centerDefinition[center];
                return (
                  <div key={center} className={`card-jade p-4 ${defined ? '' : 'opacity-60'}`} style={{ borderColor: defined ? 'var(--text-accent)' : undefined }}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold">{center}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${defined ? 'bg-[var(--text-accent)]/10 text-[var(--text-accent)]' : 'bg-gray-500/10 text-gray-500'}`}>
                        {defined ? '✅ 定义' : '⬜ 开放'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{desc}</p>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'gates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">🚪 激活闸门（{hd.activatedGates.length}个）</h3>
              <div className="flex flex-wrap gap-2">
                {hd.activatedGates.map(g => <span key={g} className="tag-pill text-base font-mono">#{g}</span>)}
              </div>
              {hd.channels.length > 0 && (
                <>
                  <div className="gold-divider my-4" />
                  <h3 className="text-lg font-bold">🔗 激活通道（{hd.channels.length}条）</h3>
                  <div className="flex flex-wrap gap-2">
                    {hd.channels.map(ch => <span key={ch} className="tag-pill-gold text-base">{ch}</span>)}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'cross' && (
            <div className="card-jade p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-bold gradient-text mb-2">{hd.incarnationCross}</h3>
              <p className="text-sm text-[var(--text-secondary)]">你此生的核心主题</p>
            </div>
          )}

          {tab === 'interpret' && (
            <div>
              {!interp && !interpLoading && (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--text-secondary)] mb-4">生成AI深度解读报告</p>
                  <button onClick={handleInterpret} className="btn-jade max-w-xs mx-auto inline-flex" style={{width:'auto'}}>
                    📜 生成解读
                  </button>
                </div>
              )}
              {interpLoading && <div className="text-center py-8"><div className="cosmic-loader mx-auto mb-4" style={{width:40,height:40}}><div className="cosmic-ring cosmic-ring-3" style={{width:'100%',height:'100%'}}/><div className="cosmic-center text-xs">📜</div></div><p className="text-sm text-[var(--text-secondary)]">正在解读...</p></div>}
              {interp && <div className="card-jade p-6"><div className="report-content leading-relaxed whitespace-pre-line">{interp}</div></div>}
            </div>
          )}

          {tab === 'qa' && (
            <div className="card-jade p-6">
              <HDQA />
            </div>
          )}

          <div className="text-center space-x-4">
            <button onClick={() => { setHd(null); setInterp(''); }} className="btn-jade max-w-xs inline-flex" style={{width:'auto'}}>🔄 重新生成</button>
            <button onClick={() => { document.title = `人类图-${hd.type}`; window.print(); }} className="px-6 py-3 rounded-xl border border-[var(--border-color)] text-sm hover:border-[var(--text-accent)] transition-all">📄 下载PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
