'use client';

import { useState, useCallback } from 'react';
import BodygraphSVG from '@/components/BodygraphSVG';

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

  return (
    <div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">提问关于人类图的概念、类型、中心、通道等问题</p>
      <div className="flex gap-2 mb-4">
        <input className="input-jade flex-1" value={q} onChange={e => setQ(e.target.value)}
          placeholder="例如：什么是投射者？荐骨权威怎么用？"
          onKeyDown={e => e.key === 'Enter' && ask()} />
        <button onClick={ask} disabled={loading} className="btn-jade" style={{width:'auto'}}>{loading ? '...' : '提问'}</button>
      </div>
      {loading && <p className="text-sm text-[var(--text-secondary)]">查询中...</p>}
      {a && <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm leading-relaxed whitespace-pre-line">{a}</div>}
    </div>
  );
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

const GATE_NAMES = ['乾','坤','屯','蒙','需','讼','师','比','小畜','履','泰','否','同人','大有','谦','豫','随','蛊','临','观','噬嗑','贲','剥','复','无妄','大畜','颐','大过','坎','离','咸','恒','遁','大壮','晋','明夷','家人','睽','蹇','解','损','益','夬','姤','萃','升','困','井','革','鼎','震','艮','渐','归妹','丰','旅','巽','兑','涣','节','中孚','小过','既济','未济'];

const CHANNEL_DESC: Record<string, string> = {
  '24-61':'思考的通道 — 独特的心智模式，灵感转化为深刻认知',
  '34-57':'力量的通道 — 原始生命力与直觉的完美结合',
  '35-36':'无常的通道 — 情感体验的丰富旅程，成长于变化',
  '39-55':'情绪的通道 — 深刻的情感波动与精神觉醒之路',
  '37-40':'社区的通道 — 归属感与互助精神的平衡',
  '18-58':'修正的通道 — 追求完美，持续改进的动力',
  '26-44':'传递的通道 — 将内在体验展现给世界',
  '21-45':'金钱的通道 — 物质世界的掌控与管理',
  '11-56':'好奇的通道 — 探索未知，讲故事的才能',
  '10-34':'探索的通道 — 活在当下，按照自己的方式行事',
  '10-20':'觉醒的通道 — 当下的觉知与即时表达',
  '1-8':'创造的通道 — 独特的自我表达与影响力',
  '2-14':'节奏的通道 — 自然规律的守护者',
  '3-60':'突变的通道 — 打破常规，创造新生',
  '4-63':'逻辑的通道 — 从混沌中发现清晰模式',
  '5-15':'节律的通道 — 顺应宇宙的自然节拍',
  '6-59':'亲密的通道 — 建立深度情感连接',
  '7-31':'领导力的通道 — 指引方向的权威',
  '9-52':'专注的通道 — 聚焦细节，持续深入',
  '12-22':'开放的通道 — 情感表达的艺术天赋',
  '13-33':'记录的通道 — 见证历史，传递集体智慧',
  '16-48':'才华的通道 — 将技能升华为艺术',
  '17-62':'接受的通道 — 善用新观点解决问题',
  '19-49':'敏感的通道 — 情感连接与同理心',
  '20-57':'觉知的通道 — 当下瞬间的敏锐洞见',
  '22-12':'调性的通道 — 情感的细腻表达力',
  '23-43':'结构的通道 — 化繁为简的独特能力',
  '25-51':'争斗的通道 — 突破困境的勇气与韧性',
  '27-50':'维护的通道 — 关爱与支持他人的天赋',
  '28-38':'挣扎的通道 — 为意义而战的信念',
  '29-46':'发现的通道 — 幸运来自好奇心与开放',
  '30-41':'渴望的通道 — 对新体验的强烈向往',
  '31-32':'影响的通道 — 通过榜样引领他人',
  '33-13':'隐遁的通道 — 从喧嚣中回归内在',
  '41-30':'聚焦的通道 — 将梦想转化为行动',
  '42-53':'成熟的通道 — 生命周期的智慧',
  '47-64':'困惑的通道 — 从混沌中寻找意义与秩序',
  '57-34':'直觉的通道 — 无法解释的精准知晓',
  '59-6':'聚焦的通道 — 精准的情感定向表达',
  '14-2':'驱动的通道 — 内在能量的自然流动',
  '44-26':'传递的通道 — 将经验转化为洞见',
  '50-27':'守护的通道 — 家族与社群的关爱者',
  '32-54':'蜕变的通道 — 持续自我更新与成长',
};

const PROFILE_DESC: Record<string, {conscious:string,unconscious:string,desc:string}> = {
  '1/3': {conscious:'研究者',unconscious:'实验者',desc:'你生来就需要深入研究和亲身体验。只有当你充分理解并亲手尝试过，你才能真正相信。你的内在有着实验精神，不怕试错，这是你成长的必经之路。'},
  '1/4': {conscious:'研究者',unconscious:'社交者',desc:'你通过深入研究建立坚实的知识基础，然后通过社交网络分享给需要的人。你的朋友和人脉是你价值的放大器，你的知识为他人所用。'},
  '2/4': {conscious:'隐士',unconscious:'社交者',desc:'你天生就有某种才华，但你自己往往不觉得它有多特别。这个天赋需要被他人发现和邀请才能充分发挥。你独处时充电，社交时发光。'},
  '3/4': {conscious:'实验者',unconscious:'社交者',desc:'你通过不断地尝试、犯错、学习来成长。每一次失败都是宝贵的数据。你对新鲜事物充满好奇，通过广泛的人脉传递你的经验。'},
  '4/1': {conscious:'社交者',unconscious:'研究者',desc:'你通过人脉网络传播你深入研究的成果。你的朋友就是你的机遇。你对认定的领域有超乎常人的专注和深度。'},
  '4/6': {conscious:'社交者',unconscious:'人生典范',desc:'你生来就是要成为他人的榜样。前半生你可能在试错中摸索，但30岁之后，你的人生经验和智慧会成为他人的指路明灯。'},
  '5/1': {conscious:'异端者',unconscious:'研究者',desc:'你天生就是解决问题的专家。别人有难题时会自然来找你。你的知识储备为实践服务，你的答案总是实用而有效。'},
  '5/2': {conscious:'异端者',unconscious:'隐士',desc:'你的天赋在关键时刻会被召唤出来。平时你可能喜欢独处，但当问题出现时，你能给出超乎寻常的解决方案。'},
  '6/2': {conscious:'人生典范',unconscious:'隐士',desc:'你像一个活在屋顶上的观察者。前30年你在高处俯瞰人生，积累智慧和经验。之后你被邀请下来展示你的领悟，成为他人的榜样。'},
  '6/3': {conscious:'人生典范',unconscious:'实验者',desc:'你的人生是一本丰富的教科书。通过大量的经历和试错，你最终会提炼出宝贵的人生智慧，并愿意与他人坦诚分享。'},
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

export default function HumanDesignPage() {
  const [form, setForm] = useState({ year: '', month: '', day: '', hour: '', location: '', gender: '', timezone: '' });
  const [loading, setLoading] = useState(false);
  const [hd, setHd] = useState<HDBodygraph | null>(null);
  const [error, setError] = useState('');
  const [interp, setInterp] = useState('');
  const [interpLoading, setInterpLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.year || !form.month || !form.day) { setError('请填写完整的出生日期'); return; }
    setLoading(true); setError(''); setHd(null); setInterp('');
    try {
      const payload = { ...form, timezone: form.timezone || 'Asia/Shanghai' };
      const res = await fetch('https://bell.aisoulcode.cn/api/human-design', {
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

  const TYPE_ADVICE: Record<string, {strategyDetail:string,signatureDetail:string,notSelfDetail:string}> = {
    'Generator': {strategyDetail:'等待事情来找你，用身体感受（荐骨的"嗯哼"回应）来判断是否投入。',signatureDetail:'找到让你满足的事情并持续投入，那是你生命能量的正确流向。',notSelfDetail:'停下来，不要强迫自己做不想做的事。你的挫败感是明确的信号。'},
    'Manifesting Generator': {strategyDetail:'等待回应，但一旦得到肯定的响应就快速启动。你能同时处理多件事情。',signatureDetail:'满足感来自高效地完成你热爱的事情，同时体验多重成就。',notSelfDetail:'挫败感告诉你正在被催促或做了错误的选择。给自己空间。'},
    'Projector': {strategyDetail:'不要主动出击。等待正确的认可和邀请，那时你的天赋才会被真正看见和需要。',signatureDetail:'当你被正确的人认可和邀请时的成就感，证明你走在正确的路上。',notSelfDetail:'如果你感到苦涩，说明你又在主动推销自己而不是等待被邀请。退后一步。'},
    'Manifestor': {strategyDetail:'你可以直接发起行动，但请记得告知相关的人——这会让你的道路顺畅，减少不必要的阻力。',signatureDetail:'内在的平静是你走对路的最可靠信号。如果你感到愤怒，停下来。',notSelfDetail:'愤怒提醒你：要么没有告知他人，要么被阻止了行动。你需要重新获得主动权。'},
    'Reflector': {strategyDetail:'不要着急下结论。等待完整28天的月亮周期，让事情自然展开和沉淀后再做决定。',signatureDetail:'不要追求常态的满足，允许自己为每一次新的体验感到惊喜。',notSelfDetail:'失望是正常的，你没有义务去反映和满足所有人的期待。给自己时间和空间。'},
  };

  const CROSS_DESC: Record<string, string> = {
    '55/23': '你带着改变世界的频率而来。你的情感深度和表达能力结合，使你能将内在的觉醒转化为外在的影响。你的挑战是在正确的时间被正确的人看见。',
    '41/9': '你的人生主题是关于新开始和专注。你对新体验的渴望与你专注细节的天赋相结合，使你能在每个新的周期中精确地投入你的能量。',
    '35/3': '你的人生主题是关于变化和探索。你的好奇心驱使你不断体验新事物，而你的实验精神确保你在每次变化中都能学习和成长。',
    '56/24': '你的人生主题是关于解惑和传播。你的好奇心驱使你探索生命的奥秘，而你的思考能力使你能够将复杂的概念简化为可分享的智慧。',
    '28/60': '你的人生主题是关于为意义而战。你在寻找生命的意义，在挣扎的过程中获得深刻的洞见，最终找到属于自己的答案。',
  };

  const centers = [
    {key:'Head',cn:'顶轮',desc:'灵感、压力、疑问的来源。定义者有持续的灵感输入；开放者吸收他人的精神压力。'},
    {key:'Ajna',cn:'眉心轮',desc:'概念化与思考。定义者有固定的思维方式；开放者思维灵活，善于采纳他人观点。'},
    {key:'Throat',cn:'喉咙中心',desc:'表达与行动。定义者有清晰的表达方式；开放者表达受环境影响。'},
    {key:'G',cn:'G中心',desc:'方向与爱。定义者有稳定的自我认同；开放者善于适应不同环境。'},
    {key:'Ego',cn:'意志力中心',desc:'意志力与自我价值。定义者有稳定的承诺能力；开放者无需证明自我价值。'},
    {key:'Sacral',cn:'荐骨中心',desc:'生命能量与回应。定义者有持续的工作能量；开放者易过度消耗他人能量。'},
    {key:'Solar Plexus',cn:'情绪中心',desc:'情绪感受与觉察。定义者经历情绪波；开放者敏感于他人情绪。'},
    {key:'Spleen',cn:'脾中心',desc:'直觉与生存。定义者有可靠的直觉；开放者需留意身体警示。'},
    {key:'Root',cn:'根部中心',desc:'压力与动力。定义者有自身节奏；开放者吸收环境压力。'},
  ];

  const getAuthorityDetail = () => {
    const a = hd?.authority || '';
    if (a.includes('情绪')) return '你的情绪中心有定义，这意味着你的情绪是一个波动的过程——从高到低，持续变化。正确的决策不是在你感觉好的时候做，也不是在你感觉不好的时候做，而是等到情绪回归"清明"的那一刻。这个过程可能需要数小时到数天不等。关键：不要在情绪波峰或波谷做重要决定。';
    if (a.includes('荐骨')) return '你的荐骨中心（骶骨）是你最可靠的决策工具。问自己一个是非题，关注腹部的即时身体反应——"嗯哼"表示肯定（温暖、扩张感），"嗯..."表示否定（收缩、停滞感）。这个回应是即时的，但注意不要被头脑的分析干扰。训练自己信任这个身体智慧。';
    if (a.includes('直觉')) return '你的直觉来自脾中心，它是瞬间的、转瞬即逝的"知道"。这个信号在当下出现，不需要逻辑分析。如果你错过了它，就放下，下一个直觉会在你需要的时候再来。信任你的第一印象和本能反应。';
    if (a.includes('意志力')) return '你的意志力中心有定义，你的决策来自于内心的渴望和承诺能力。问自己："我真的想这样做吗？我有能力完成吗？"如果两个答案都是肯定的，你就可以依靠你的意志力去实现它。';
    if (a.includes('自我投射')) return '你需要通过说话来理清自己的思路。找一个信任的人，把问题说出来——在你表达的过程中，答案会自然而然地浮出水面。你的G中心和喉咙中心相连，表达即知晓。';
    if (a.includes('外在')) return '你无法仅靠自己做出最佳决策。你的头脑可能充满了各种可能性，但你需要借助他人的视角来筛选和确认。找1-2个你信任、了解你的人，把你的情况说出来，听听他们的反馈。';
    return '作为反映者，你的所有中心都是开放的。你的决策需要完整28天的月亮周期——让月亮经过所有64个闸门之后再回来看你的问题。不要被任何人的催促或时间表影响。';
  };

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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">出生时间</label>
              <select className="input-jade" value={form.hour} onChange={e => setForm(p => ({...p, hour: e.target.value}))}>
                <option value="">不确定</option>
                {[...Array(24)].map((_, i) => <option key={i} value={String(i).padStart(2,'0')}>{String(i).padStart(2,'0')}:00</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">时区</label>
              <select className="input-jade" value={form.timezone} onChange={e => setForm(p => ({...p, timezone: e.target.value}))}>
                <option value="Asia/Shanghai">中国标准时间</option>
                <option value="America/Los_Angeles">美国洛杉矶</option>
                <option value="America/New_York">美国纽约</option>
                <option value="Europe/London">英国伦敦</option>
                <option value="Europe/Paris">欧洲巴黎</option>
                <option value="Australia/Sydney">澳大利亚悉尼</option>
                <option value="Asia/Tokyo">日本东京</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">出生地点</label>
            <select className="input-jade" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))}>
              <option value="">选择省份</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <button type="submit" className="btn-jade w-full" disabled={loading}>
            {loading ? '🧬 计算中...' : '🧬 生成我的人类图'}
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

          {/* == On-screen action bar == */}
          <div className="flex flex-wrap gap-3 justify-between items-center print-hidden">
            <button onClick={() => { setHd(null); setInterp(''); }} className="text-sm px-4 py-2 rounded-xl border border-[var(--border-color)] hover:border-[var(--text-accent)] transition-all">
              ← 重新查询
            </button>
            <div className="flex gap-2">
              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                <button key={i} onClick={() => document.getElementById('hd-s'+i)?.scrollIntoView({behavior:'smooth'})}
                  className="text-xs px-2 py-1 rounded border border-[var(--border-color)] hover:border-[var(--text-accent)]">
                  {i}
                </button>
              ))}
              <button onClick={() => { document.title = '人类图报告-'+hd.type; window.print(); }}
                className="text-sm px-4 py-2 rounded-xl border border-[var(--border-color)] hover:border-[var(--text-accent)] transition-all">
                📄 PDF
              </button>
            </div>
          </div>

          {/* ===== S1: Type Hero ===== */}
          <div id="hd-s1" className="card-jade overflow-hidden" style={{borderColor:'var(--border-accent)'}}>
            <div className="bg-gradient-to-r from-[var(--text-accent)]/10 to-transparent p-6 md:p-8 flex items-center gap-6">
              <div className="text-5xl flex-shrink-0">{ti?.emoji || '🧬'}</div>
              <div>
                <div className="text-sm text-[var(--text-accent)] font-medium mb-1">你的类型</div>
                <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">{hd.type}</h2>
                <p className="text-sm text-[var(--text-secondary)]">{ti?.desc}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-px bg-[var(--border-color)]">
              <div className="bg-[var(--bg-card)] p-4 text-center"><div className="text-xs text-[var(--text-secondary)] mb-1">策略</div><div className="text-sm font-bold">{hd.strategy}</div></div>
              <div className="bg-[var(--bg-card)] p-4 text-center"><div className="text-xs text-[var(--text-secondary)] mb-1">内在权威</div><div className="text-sm font-bold">{hd.authority}</div></div>
              <div className="bg-[var(--bg-card)] p-4 text-center"><div className="text-xs text-[var(--text-secondary)] mb-1">人生角色</div><div className="text-sm font-bold">{hd.profile}</div></div>
              <div className="bg-[var(--bg-card)] p-4 text-center"><div className="text-xs text-[var(--text-secondary)] mb-1">定义</div><div className="text-sm font-bold">{hd.definition}</div></div>
            </div>
          </div>

          {/* ===== Bodygraph SVG ===== */}
          <div id="hd-bodygraph" className="card-jade p-6">
            <h3 className="text-lg font-bold gradient-text mb-2">📊 人体图</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">● 金色 = 定义中心  ○ 灰色 = 开放中心  |  金色连线 = 激活通道</p>
            <BodygraphSVG
              definedCenters={hd.definedCenters}
              activatedGates={hd.activatedGates}
              channels={hd.channels}
              centerDefinition={hd.centerDefinition}
            />
          </div>

          {/* ===== S3: Quick Stats ===== */}
          <div id="hd-s2" className="grid grid-cols-3 gap-4">
            <div className="card-jade p-4 text-center"><div className="text-2xl font-bold gradient-text">{hd.definedCenters.length}</div><div className="text-xs text-[var(--text-secondary)] mt-1">定义中心</div></div>
            <div className="card-jade p-4 text-center"><div className="text-2xl font-bold gradient-text">{hd.activatedGates.length}</div><div className="text-xs text-[var(--text-secondary)] mt-1">激活闸门</div></div>
            <div className="card-jade p-4 text-center"><div className="text-2xl font-bold gradient-text">{hd.channels.length}</div><div className="text-xs text-[var(--text-secondary)] mt-1">激活通道</div></div>
          </div>

          {/* ===== S3: Type Deep Dive ===== */}
          <div id="hd-s3" className="card-jade p-6">
            <h3 className="text-lg font-bold gradient-text mb-2">🧬 类型深度解读</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">基于Ra Uru Hu原始体系 · 《区分的科学》参考</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-accent)] font-medium mb-2">📌 策略 — 正确的行动方式</div>
                <p className="text-sm">{hd.strategy}。{(TYPE_ADVICE[hd.type] || TYPE_ADVICE['Projector']).strategyDetail}</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-accent)] font-medium mb-2">✅ 签名 — 做对事的感觉</div>
                <p className="text-sm">当你依循策略和内在权威生活时，你会自然体验到<strong> {hd.signature} </strong>。{(TYPE_ADVICE[hd.type] || TYPE_ADVICE['Projector']).signatureDetail}</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-accent)] font-medium mb-2">⚠️ 非自我 — 偏离的信号</div>
                <p className="text-sm">当你偏离自己的策略时，你会感受到<strong className="text-red-500"> {hd.notSelfTheme} </strong>。这是你内在的警报：{(TYPE_ADVICE[hd.type] || TYPE_ADVICE['Projector']).notSelfDetail}</p>
              </div>
            </div>
          </div>

          {/* ===== S4: Authority ===== */}
          <div id="hd-s4" className="card-jade p-6">
            <h3 className="text-lg font-bold gradient-text mb-2">⚖️ 内在权威 — 你正确的决策方式</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">你的内在权威是<strong>{hd.authority}</strong>。这是你做出正确人生决策的可靠内在工具。</p>
            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm leading-relaxed">
              {getAuthorityDetail()}
            </div>
          </div>

          {/* ===== S5: Profile ===== */}
          <div id="hd-s5" className="card-jade p-6">
            <h3 className="text-lg font-bold gradient-text mb-2">🎭 人生角色 {hd.profile} — 你与世界互动的方式</h3>
            {(() => {
              const info = PROFILE_DESC[hd.profile];
              return (
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">意识人格（你认识到的自己）：<strong>{info?.conscious || '—'}</strong> ｜ 设计人格（底层驱动力）：<strong>{info?.unconscious || '—'}</strong></p>
                  <p className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm leading-relaxed">{info?.desc || '你的人生角色组合是独特的。'}</p>
                </div>
              );
            })()}
          </div>

          {/* ===== S6: Centers ===== */}
          <div id="hd-s6" className="card-jade p-6">
            <h3 className="text-lg font-bold gradient-text mb-2">⚪ 能量中心分析</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">9个能量中心中 <strong>{hd.definedCenters.length}个定义</strong>（有色·稳定特质） · <strong>{hd.undefinedCenters.length}个开放</strong>（白色·接收放大他人能量）</p>
            <div className="space-y-2">
              {centers.map(c => {
                const def = hd.centerDefinition[c.key];
                return (
                  <div key={c.key} className={`flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border ${def ? 'border-[var(--text-accent)]/20' : 'border-[var(--border-color)] opacity-70'}`}>
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${def ? 'bg-[var(--text-accent)]/20 text-[var(--text-accent)]' : 'bg-gray-500/10 text-gray-500'}`}>{def ? '●' : '○'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{c.cn}（{c.key}）</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${def ? 'bg-[var(--text-accent)]/10 text-[var(--text-accent)]' : 'bg-gray-500/10 text-gray-500'}`}>{def ? '定义' : '开放'}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===== S7: Gates & Channels ===== */}
          <div id="hd-s7" className="card-jade p-6">
            <h3 className="text-lg font-bold gradient-text mb-2">🚪 闸门与通道</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">你激活了 <strong>{hd.activatedGates.length}个闸门</strong> · <strong>{hd.channels.length}条通道</strong></p>

            {hd.channels.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[var(--text-accent)] mb-3">🔗 激活通道详细解读</h4>
                <div className="space-y-2">
                  {hd.channels.map(ch => (
                    <div key={ch} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-[var(--text-accent)]">{ch}</span>
                        <span className="text-xs text-[var(--text-secondary)]">{CHANNEL_DESC[ch]?.split('—')[0] || ''}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{CHANNEL_DESC[ch]?.split('—').slice(1).join('—') || '激活的能量通道'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-[var(--text-accent)] mb-3">📍 激活闸门（共{hd.activatedGates.length}个）</h4>
              <div className="flex flex-wrap gap-2">
                {hd.activatedGates.sort((a,b)=>a-b).map(g => (
                  <span key={g} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--text-accent)]/5 border border-[var(--text-accent)]/15 text-sm">
                    <span className="font-mono font-bold">{g}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{GATE_NAMES[g-1] || ''}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ===== S8: Incarnation Cross ===== */}
          <div id="hd-s8" className="card-jade p-6 text-center" style={{borderColor:'var(--border-accent)'}}>
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-lg font-bold gradient-text mb-1">{hd.incarnationCross}</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">你此生的核心主题与方向</p>
            <p className="max-w-xl mx-auto text-sm text-[var(--text-secondary)] leading-relaxed p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              {(() => {
                const cross = hd.incarnationCross;
                for (const [key, desc] of Object.entries(CROSS_DESC)) {
                  if (cross.includes(key)) return desc;
                }
                return '你的轮回交叉代表了你此生的独特使命。结合你的类型、权威和人生角色，你的存在本身就是对他人的贡献。生命的意义在活出自己中自然呈现。';
              })()}
            </p>
          </div>

          {/* ===== S9: Signature & Not-Self ===== */}
          <div id="hd-s9" className="grid md:grid-cols-2 gap-4">
            <div className="card-jade p-5 border-l-4" style={{borderLeftColor:'var(--text-accent)'}}>
              <div className="text-xs text-[var(--text-accent)] font-medium mb-1">✅ 当你正确运作时</div>
              <div className="text-2xl font-bold gradient-text">{hd.signature}</div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">这是你依循内在权威和策略生活时的自然状态</p>
            </div>
            <div className="card-jade p-5 border-l-4" style={{borderLeftColor:'#ef4444'}}>
              <div className="text-xs text-red-500 font-medium mb-1">⚠️ 当你偏离策略时</div>
              <div className="text-2xl font-bold text-red-500">{hd.notSelfTheme}</div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">这是一个信号，提醒你停下来检视是否在正确地做自己</p>
            </div>
          </div>

          {/* ===== S10: Definition ===== */}
          <div id="hd-s10" className="card-jade p-6">
            <h3 className="text-lg font-bold gradient-text mb-2">🔗 定义类型 — 能量中心的连接方式</h3>
            <p className="text-sm leading-relaxed p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              {hd.definition === 'None' && '你的所有中心都是开放的（反映者）。你像一面镜子，反射周围环境的能量。你不需要固守任何身份，你的天赋是在不同环境中做真实的自己。'}
              {hd.definition === 'Single' && '你所有定义的中心通过通道连接在一起，形成一个完整的能量整体。你的特质是连贯的、一致的。你在做自己时不会被内外拉扯。'}
              {hd.definition === 'Split' && '你的定义中心形成了两个或多个独立的能量集群。这意味着你内在有不同的"子人格"，在不同的生活领域展现出不同的特质。这不是矛盾，而是丰富。'}
              {hd.definition === 'Triple Split' && '你的定义中心形成了三个独立的能量集群。你是一个多面向的人，在不同的场合展现出截然不同的面向。这需要你花更多时间整合内在的各个部分。'}
              {hd.definition === 'Quadruple Split' && '你的定义中心形成了四个独立的能量集群。你拥有极为丰富的内在面向，但这也意味着你很容易被他人影响和改变方向。找到稳定的核心是关键。'}
            </p>
          </div>

          {/* ===== AI Interpretation ===== */}
          <div id="hd-interpret" className="card-jade p-6">
            <h3 className="text-lg font-bold gradient-text mb-2">📜 AI 深度解读</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">结合你的类型、权威、中心、闸门，生成个性化的深度文本</p>
            {!interp && !interpLoading && (
              <div className="text-center py-6">
                <button onClick={handleInterpret} className="btn-jade">📜 生成完整解读报告</button>
              </div>
            )}
            {interpLoading && <div className="text-center py-8"><div className="cosmic-loader mx-auto mb-4" style={{width:40,height:40}}><div className="cosmic-ring cosmic-ring-3"/><div className="cosmic-center text-xs">📜</div></div><p className="text-sm text-[var(--text-secondary)]">正在解读...</p></div>}
            {interp && <div className="text-sm leading-relaxed whitespace-pre-line p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">{interp}</div>}
          </div>

          {/* ===== HD Q&A ===== */}
          <div className="card-jade p-6">
            <h3 className="text-lg font-bold gradient-text mb-2">💬 人类图知识问答</h3>
            <HDQA />
          </div>

          {/* ===== Bottom ===== */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-[var(--border-color)]">
            <button onClick={() => { setHd(null); setInterp(''); }} className="btn-jade" style={{width:'auto'}}>🔄 重新生成</button>
            <button onClick={() => { document.title = '人类图报告-'+hd.type; window.print(); }} className="px-6 py-3 rounded-xl border border-[var(--border-color)] text-sm hover:border-[var(--text-accent)] transition-all">📄 下载PDF</button>
          </div>

        </div>
      )}
    </div>
  );
}
