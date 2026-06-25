'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface HDBodygraph {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnationCross: string;
  signature: string;
  notSelfTheme: string;
  variable: string;
  channels: string[];
  activatedGates: number[];
  definedCenters: string[];
  undefinedCenters: string[];
  centerDefinition: Record<string, boolean>;
  circuitries: string[];
  determination: string;
  environment: string;
  view: string;
  motivation: string;
  cognition: string;
  sense: string;
  activations: {
    personality: Record<string, { gate: number; line: number }>;
    design: Record<string, { gate: number; line: number }>;
  };
}

const PROVINCES = ['北京','上海','天津','重庆','河北','山西','内蒙古','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西','海南','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆','香港','澳门','台湾'];

const TYPE_INFO: Record<string, { emoji: string; desc: string; color: string }> = {
  'Generator': { emoji: '⚡', desc: '建设者 — 你的生命能量源源不断，等待正确的事情让你投入。', color: '#c9a06e' },
  'Manifesting Generator': { emoji: '⚡🔥', desc: '显示建设者 — 快速启动+持续投入，多线程高效能。', color: '#c9a06e' },
  'Projector': { emoji: '🔭', desc: '投射者 — 你的天赋是看透他人，等待被正确邀请。', color: '#4a7c6f' },
  'Manifestor': { emoji: '🚀', desc: '显示者 — 你有发起一切的能力，告知他人即可。', color: '#d4835a' },
  'Reflector': { emoji: '🌙', desc: '反映者 — 你是社区的镜子，需要完整的月亮周期做决定。', color: '#8b7ec8' },
};

const CENTER_DESC: Record<string, string> = {
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

export default function HumanDesignPage() {
  const router = useRouter();
  const [form, setForm] = useState({ year: '', month: '', day: '', hour: '', location: '', gender: '', timezone: '' });
  const [loading, setLoading] = useState(false);
  const [hd, setHd] = useState<HDBodygraph | null>(null);
  const [error, setError] = useState('');
  const [interp, setInterp] = useState('');
  const [interpLoading, setInterpLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [svgContent, setSvgContent] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.year || !form.month || !form.day) {
      setError('请填写完整的出生日期');
      return;
    }
    setLoading(true);
    setError('');
    setHd(null);
    setInterp('');
    setSvgContent('');

    try {
      const res = await fetch('/api/human-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHd(data.bodygraph);
      if (data.svg) setSvgContent(data.svg);

    } catch (err: any) {
      setError(err.message || '人类图生成失败');
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleInterpret = useCallback(async () => {
    if (!hd) return;
    setInterpLoading(true);
    setInterp('');
    try {
      const res = await fetch('/api/hd-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodygraph: hd }),
      });
      const data = await res.json();
      setInterp(data.interpretation || '解析生成失败');
    } catch {
      setInterp('解析生成失败');
    } finally {
      setInterpLoading(false);
    }
  }, [hd]);

  const typeInfo = hd ? TYPE_INFO[hd.type] || { emoji: '✦', desc: hd.type, color: '#4a7c6f' } : null;

  return (
    <div className="py-8 md:py-16 px-4 max-w-5xl mx-auto">
      {/* Header */}
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
                {[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1)}>{i+1}月</option>)}
              </select>
              <select className="input-jade" value={form.day} onChange={e => setForm(p => ({...p, day: e.target.value}))} required>
                {[...Array(31)].map((_, i) => <option key={i+1} value={String(i+1)}>{i+1}日</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">出生时间（24小时制，可选）</label>
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
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">性别</label>
            <select className="input-jade" value={form.gender} onChange={e => setForm(p => ({...p, gender: e.target.value}))}>
              <option value="">选择</option>
              <option value="男">男</option><option value="女">女</option>
            </select>
          </div>
          {error && <div className="text-sm text-red-500 bg-red-500/5 border border-red-500/15 rounded-lg px-4 py-3">{error}</div>}
          <button type="submit" className="btn-jade" disabled={loading}>
            {loading ? '🧬 生成中...' : '🧬 生成我的人类图'}
          </button>
        </form>
      )}

      {loading && (
        <div className="text-center py-20">
          <div className="cosmic-loader mx-auto mb-8"><div className="cosmic-ring cosmic-ring-1"/><div className="cosmic-ring cosmic-ring-2"/><div className="cosmic-center">🧬</div></div>
          <p className="text-lg text-[var(--text-accent)] loading-pulse">正在计算星历位置...</p>
        </div>
      )}

      {hd && (
        <div className="space-y-8">
          {/* Type Hero */}
          <div className="card-jade p-6 md:p-8 text-center" style={{ borderColor: typeInfo?.color || 'var(--border-accent)' }}>
            <div className="text-4xl mb-3">{typeInfo?.emoji || '🧬'}</div>
            <h2 className="text-2xl font-bold gradient-text mb-2">{hd.type}</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">{typeInfo?.desc}</p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="tag-pill">策略：{hd.strategy}</span>
              <span className="tag-pill">权威：{hd.authority}</span>
              <span className="tag-pill">人生角色：{hd.profile}</span>
              <span className="tag-pill">定义：{hd.definition}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'overview', label: '📊 概览' },
              { id: 'centers', label: '⚪ 能量中心' },
              { id: 'gates', label: '🚪 闸门通道' },
              { id: 'cross', label: '🎯 人生使命' },
              { id: 'chart', label: '🧬 身体图' },
              { id: 'interpret', label: '📜 深度解析' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-[var(--text-accent)] text-white font-medium' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">🧬 类型</h3><p className="text-lg font-bold">{hd.type}</p><p className="text-xs text-[var(--text-secondary)] mt-1">策略：{hd.strategy}</p></div>
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">⚖️ 内在权威</h3><p className="text-lg font-bold">{hd.authority}</p><p className="text-xs text-[var(--text-secondary)] mt-1">做决定的正确方式</p></div>
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">🎭 人生角色</h3><p className="text-lg font-bold">{hd.profile}</p><p className="text-xs text-[var(--text-secondary)] mt-1">你在这个世界的角色</p></div>
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">🔗 定义</h3><p className="text-lg font-bold">{hd.definition}</p><p className="text-xs text-[var(--text-secondary)] mt-1">你处理信息的方式</p></div>
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">✅ 签名</h3><p className="text-lg font-bold">{hd.signature}</p><p className="text-xs text-[var(--text-secondary)] mt-1">当你活出设计时的感受</p></div>
              <div className="card-jade p-5"><h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">⚠️ 非自我主题</h3><p className="text-lg font-bold text-red-500">{hd.notSelfTheme}</p><p className="text-xs text-[var(--text-secondary)] mt-1">偏离真我时的信号</p></div>
            </div>
          )}

          {/* Centers Tab */}
          {activeTab === 'centers' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">⚪ 能量中心</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {Object.entries(CENTER_DESC).map(([center, desc]) => {
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
            </div>
          )}

          {/* Gates Tab */}
          {activeTab === 'gates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">🚪 激活闸门</h3>
              <p className="text-sm text-[var(--text-secondary)]">{hd.activatedGates.length} 个闸门被激活</p>
              <div className="flex flex-wrap gap-2">
                {hd.activatedGates.map(gate => (
                  <span key={gate} className="tag-pill text-base font-mono">#{gate}</span>
                ))}
              </div>
              <div className="gold-divider my-4" />
              <h3 className="text-lg font-bold">🔗 激活通道</h3>
              <div className="flex flex-wrap gap-2">
                {hd.channels.map(ch => (
                  <span key={ch} className="tag-pill-gold text-base">{ch}</span>
                ))}
              </div>
              <div className="gold-divider my-4" />
              <h4 className="text-sm font-bold text-[var(--text-secondary)]">回路类型</h4>
              <div className="flex flex-wrap gap-2">
                {hd.circuitries.map(c => <span key={c} className="tag-pill">{c}</span>)}
              </div>
            </div>
          )}

          {/* Incarnation Cross Tab */}
          {activeTab === 'cross' && (
            <div className="card-jade p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-bold gradient-text mb-2">{hd.incarnationCross}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">你此生的核心主题与使命方向</p>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="p-4 rounded-xl bg-[var(--bg-highlight)]"><h4 className="text-xs font-bold text-[var(--text-accent)] mb-1">PHS 系统</h4><p className="text-sm">确定：{hd.determination}<br/>环境：{hd.environment}</p></div>
                <div className="p-4 rounded-xl bg-[var(--bg-highlight)]"><h4 className="text-xs font-bold text-[var(--text-accent)] mb-1">认知架构</h4><p className="text-sm">视角：{hd.view}<br/>动力：{hd.motivation}<br/>认知：{hd.cognition}<br/>感觉：{hd.sense}</p></div>
              </div>
            </div>
          )}

          {/* Bodygraph SVG Tab */}
          {activeTab === 'chart' && svgContent && (
            <div className="card-jade p-4 overflow-auto">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">🧬 身体图</h3>
                <p className="text-xs text-[var(--text-secondary)]">你的能量中心与通道连接</p>
              </div>
              <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: svgContent }} />
            </div>
          )}

          {/* Interpret Tab */}
          {activeTab === 'interpret' && (
            <div className="space-y-4">
              {!interp && !interpLoading && (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--text-secondary)] mb-4">基于你的完整人类图数据，生成AI深度解读</p>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 opacity-60">参考来源：区分的科学（Ra Uru Hu）、人类图系统原著</p>
                  <button onClick={handleInterpret} className="btn-jade max-w-xs mx-auto inline-flex" style={{width:'auto'}} disabled={interpLoading}>
                    📜 生成深度解读
                  </button>
                </div>
              )}
              {interpLoading && (
                <div className="text-center py-8">
                  <div className="cosmic-loader mx-auto mb-6" style={{width:48,height:48}}><div className="cosmic-ring cosmic-ring-3" style={{width:'100%',height:'100%'}}/><div className="cosmic-center text-xs">📜</div></div>
                  <p className="text-sm text-[var(--text-secondary)]">AI正在研读你的人类图...</p>
                </div>
              )}
              {interp && (
                <div className="card-jade p-6">
                  <div className="report-content leading-relaxed whitespace-pre-line">{interp}</div>
                </div>
              )}
            </div>
          )}

          {/* Bottom actions */}
          <div className="text-center space-x-4">
            <button onClick={() => { setHd(null); setSvgContent(''); setInterp(''); }} className="btn-jade max-w-xs inline-flex" style={{width:'auto'}}>🔄 重新生成</button>
            <button onClick={() => { document.title = `人类图-${hd.type}`; window.print(); }} className="px-6 py-3 rounded-xl border border-[var(--border-color)] text-sm hover:border-[var(--text-accent)] transition-all">📄 下载PDF</button>
          </div>
        </div>
      )}

      {!hd && (
        <div className="mt-10 text-center">
          <div className="gold-divider max-w-md mx-auto mb-6" />
          <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-4">人类图能告诉你</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
            {['你的能量类型', '做决定的正确方式', '你的天生角色', '优势与盲点', '人际关系模式', '人生使命方向'].map(item => (
              <div key={item} className="p-3 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-accent)] text-xs text-center">{item}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
