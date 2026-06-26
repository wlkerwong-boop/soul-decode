'use client';

import { useState, useCallback, useRef } from 'react';

/* ── 类型定义 ── */

interface HiddenStem {
  stem: string;
  qiType: string;   // '本气' | '中气' | '余气'
  tenGod: string;
}

interface ShenshaMap {
  year: string[];
  month: string[];
  day: string[];
  hour: string[];
}

interface Relation {
  type: string;         // '六合' | '三合' | '六冲' | '六害' | '三刑' | '半合' | '六破'
  pillars: string[];    // 参与的地支
  description: string;  // 如"酉丑半合金局"
}

interface DayunItem {
  startYear: number;
  startAge: number;
  ganZhi: string;
  tenGod: string;
  naYin: string;
  hiddenStems: HiddenStem[];
}

interface DayunData {
  startAge: number;
  startAgeDetail: string;
  list: DayunItem[];
  text: string;
}

interface BaziResponse {
  success: boolean;
  bazi: {
    pillars: string[];
    dayMaster: string;
    dayMasterElement: string;
    dayBranch: string;
    ganElements: string[];
    zhiElements: string[];
    nayin: string[];
    elementDistribution: Record<string, number>;
    shensha: ShenshaMap;
    hiddenStems: {
      year: HiddenStem[];
      month: HiddenStem[];
      day: HiddenStem[];
      hour: HiddenStem[];
    };
    relations: Relation[];
    mingGong: string;
    taiYuan: string;
    kongWang: { xun: string; kongZhi: string[] };
  };
  dayun: DayunData;
}

interface AstrologyBody {
  key: string;
  label: string;
  sign: { key: string; label: string; element: string };
  house: number;
  retrograde: boolean;
  position: string;
}

interface Aspect {
  body1: string;
  body2: string;
  type: string;
  orb: number;
}

interface AstrologyResponse {
  success: boolean;
  astrology: {
    sunSign: { key: string; label: string; element: string };
    bodies: AstrologyBody[];
    aspects: Aspect[];
    houses: string;
    text: string;
  };
}

interface HDData {
  type: string; authority: string; profile: string;
  definition: string; incarnationCross: string;
  definedCenters: string[]; activatedGates: number[]; channels: string[];
  signature: string; notSelfTheme: string;
}

interface HDResponse {
  success: boolean;
  bodygraph: HDData;
}

/* ── 梅花易数类型 ── */

interface TrigramData {
  name: string;
  symbol: string;
  element: string;
  nature: string;
}

interface HexagramInfo {
  name: string;
  code: number;
  upper: TrigramData;
  lower: TrigramData;
  judgment: string;
  lines?: boolean[];
}

interface PlumBlossomResponse {
  success: boolean;
  hexagram: {
    primary: HexagramInfo;
    changing: HexagramInfo | null;
    mutual: HexagramInfo | null;
    bodyTrigram: TrigramData;
    useTrigram: TrigramData;
    bodyUseRelation: string;
    movingLine: number;
    sixRelations: string[];
    shiYing: { shi: number; ying: number };
    nayinStem: string[];
    nayinBranch: string[];
    interpretation: string;
  };
}

/* ── 常量 ── */

const PROVINCES = ['北京','上海','天津','重庆','河北','山西','内蒙古','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西','海南','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆','香港','澳门','台湾'];

const ELEMENT_COLORS: Record<string, string> = { '木':'#4ade80','火':'#f87171','土':'#fbbf24','金':'#a78bfa','水':'#60a5fa' };
const ELEMENT_EMOJI: Record<string, string> = { '木':'🌳','火':'🔥','土':'⛰️','金':'⚔️','水':'💧' };
const ELEMENT_NAMES_CN: Record<string, string> = { '木':'Wood','火':'Fire','土':'Earth','金':'Metal','水':'Water' };

const RELATION_EMOJI: Record<string, string> = {
  '六合':'🤝','三合':'🔗','六冲':'⚡','六害':'⚠️','三刑':'🌀','半合':'🔗','六破':'💥',
};

const ASPECT_LABELS: Record<string, string> = {
  'conjunction':'合相','opposition':'對分','trine':'三分','square':'四分','sextile':'六分',
};

const ASPECT_EMOJI: Record<string, string> = {
  'conjunction':'●','opposition':'⚡','trine':'△','square':'□','sextile':'⬡',
};

/* ── 八卦三爻符号 ── */

const TRIGRAM_EMOJI: Record<string, string> = {
  '乾': '☰', '兑': '☱', '离': '☲', '震': '☳',
  '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷',
};

function getTrigramEmoji(name: string): string {
  return TRIGRAM_EMOJI[name] || '✦';
}

/* ── 辅助组件 ── */

function ElementBar({ dist }: { dist: Record<string, number> }) {
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
  const order = ['木','火','土','金','水'];
  return (
    <div className="flex h-5 rounded-full overflow-hidden border border-[var(--border-color)]">
      {order.filter(k => dist[k]).map(k => (
        <div
          key={k}
          style={{ width: `${(dist[k] / total) * 100}%`, backgroundColor: ELEMENT_COLORS[k] || '#888' }}
          className="flex items-center justify-center text-[9px] text-white font-bold"
          title={`${k}: ${dist[k]}`}
        >
          {dist[k] > 0 && (dist[k] / total) > 0.08 ? `${ELEMENT_EMOJI[k]}${dist[k]}` : ''}
        </div>
      ))}
    </div>
  );
}

function ShenshaBadge({ name }: { name: string }) {
  const isBad = ['亡神','劫煞','灾煞','勾绞','元辰','孤辰','寡宿','大耗','小耗','天罗','地网','阴阳差错','孤鸾','六厄','空亡'].some(k => name.includes(k));
  const isGood = ['天德','月德','天乙','文昌','福星','天喜','天赦','国印','金舆','天厨','禄神','红鸾','天医'].some(k => name.includes(k));
  return (
    <span
      className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium mr-0.5 mb-0.5 ${
        isBad
          ? 'bg-red-500/15 text-red-400 border border-red-500/20'
          : isGood
            ? 'bg-green-500/15 text-green-400 border border-green-500/20'
            : 'bg-blue-500/10 text-blue-300 border border-blue-500/15'
      }`}
    >
      {name}
    </span>
  );
}

function RelationTag({ rel }: { rel: Relation }) {
  const emoji = RELATION_EMOJI[rel.type] || '🔮';
  return (
    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)]">
      <span>{emoji}</span>
      <span className="text-[var(--text-accent)] font-medium">{rel.description}</span>
      <span className="text-[var(--text-secondary)]">（{rel.type}）</span>
    </div>
  );
}

function HiddenStemsRow({ stems }: { stems: HiddenStem[] }) {
  if (!stems || stems.length === 0) return <span className="text-[var(--text-secondary)] text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {stems.map((h, i) => (
        <span
          key={i}
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            h.qiType === '本气'
              ? 'bg-[var(--text-accent)]/15 text-[var(--text-accent)]'
              : h.qiType === '中气'
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-blue-500/10 text-blue-400'
          }`}
          title={h.qiType}
        >
          {h.stem}({h.tenGod})
        </span>
      ))}
    </div>
  );
}

function DayunTable({ dayun }: { dayun: DayunData }) {
  if (!dayun.list || dayun.list.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-color)]">
            <th className="py-1.5 px-2 text-left text-[var(--text-secondary)]">年龄</th>
            <th className="py-1.5 px-2 text-left text-[var(--text-secondary)]">年份</th>
            <th className="py-1.5 px-2 text-left text-[var(--text-secondary)]">干支</th>
            <th className="py-1.5 px-2 text-left text-[var(--text-secondary)]">十神</th>
            <th className="py-1.5 px-2 text-left text-[var(--text-secondary)]">纳音</th>
          </tr>
        </thead>
        <tbody>
          {dayun.list.map((yun, i) => (
            <tr key={i} className="border-b border-[var(--border-color)]/40 hover:bg-[var(--bg-highlight)] transition-colors">
              <td className="py-1.5 px-2 font-mono">{yun.startAge}-{yun.startAge + 9}岁</td>
              <td className="py-1.5 px-2 text-[var(--text-secondary)]">{yun.startYear}</td>
              <td className="py-1.5 px-2 font-bold gradient-text">{yun.ganZhi}</td>
              <td className="py-1.5 px-2">{yun.tenGod || '—'}</td>
              <td className="py-1.5 px-2 text-[var(--text-secondary)]">{yun.naYin || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── 主页面 ── */

export default function FusionPage() {
  const [form, setForm] = useState({ year: '', month: '', day: '', hour: '', minute: '0', gender: 'male', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bazi, setBazi] = useState<BaziResponse['bazi'] | null>(null);
  const [dayun, setDayun] = useState<DayunData | null>(null);
  const [hd, setHD] = useState<HDData | null>(null);
  const [astro, setAstro] = useState<AstrologyResponse['astrology'] | null>(null);
  const [plum, setPlum] = useState<PlumBlossomResponse['hexagram'] | null>(null);
  const [fusion, setFusion] = useState('');
  const [hdInterp, setHdInterp] = useState('');
  const [hdInterpLoading, setHdInterpLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const reportRef = useRef<HTMLDivElement>(null);

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  /* ── 融合分析文本（客户端生成） ── */

  const generateFusionText = useCallback((
    b: BaziResponse['bazi'],
    h: HDData,
    a: AstrologyResponse['astrology'],
    p: PlumBlossomResponse['hexagram'],
  ): string => {
    const lines: string[] = [];

    // 八字核心
    const topElements = Object.entries(b.elementDistribution)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 2)
      .map(([k]) => k);
    lines.push(`【八字视角】日主${b.dayMaster}${b.dayMasterElement}，命宫${b.mingGong}，五行以${topElements.join('、')}为主，四柱${b.pillars.join(' ')}。`);

    // 人类图
    lines.push(`【人类图视角】${h.type}类型，${h.authority}权威，${h.profile}人生角色。定义中心：${h.definedCenters?.join('、') || '无'}。`);

    // 占星
    if (a) {
      lines.push(`【占星视角】太阳${a.sunSign.label}（${a.sunSign.element}），主要行星能量分布反映先天性格特质。`);
    }

    // 梅花易数
    if (p) {
      const primaryName = p.primary?.name || '未知';
      const changingName = p.changing?.name || '无';
      const bodyName = p.bodyTrigram?.name || '?';
      const useName = p.useTrigram?.name || '?';
      lines.push(`【梅花易数视角】本卦「${primaryName}」变卦「${changingName}」，体卦${bodyName}（${p.bodyTrigram?.element}）用卦${useName}（${p.useTrigram?.element}），体用关系：${p.bodyUseRelation}。`);
    }

    // 交叉分析
    const element = b.dayMasterElement;
    const sunElement = a?.sunSign?.element || '';
    const plumBodyElement = p?.bodyTrigram?.element || '';
    let xing = '';
    if (element && sunElement) {
      if (element === sunElement) {
        xing = `八字日主${element}与太阳星座${sunElement}元素相同，能量高度一致，性格表达内外统一。`;
      } else if (
        (element === '金' && sunElement === '土') || (element === '土' && sunElement === '火') ||
        (element === '火' && sunElement === '木') || (element === '木' && sunElement === '水') ||
        (element === '水' && sunElement === '金')
      ) {
        xing = `八字日主${element}生太阳星座${sunElement}元素（相生），内在能量滋养外在表达，和谐互补。`;
      } else {
        xing = `八字日主${element}与太阳星座${sunElement}元素不同，提示内在先天能量与后天性格表达的互补关系。`;
      }
    }
    lines.push(`【八字×占星交叉】${xing}`);

    // 梅花易数与八字/人类图/占星交叉
    if (p && element && plumBodyElement) {
      if (element === plumBodyElement) {
        lines.push(`【八字×梅花易数交叉】日主五行${element}与体卦${p.bodyTrigram.name}（${plumBodyElement}）五行相同，先天命运与当下卦象同频共振。`);
      } else if (
        (element === '金' && plumBodyElement === '土') || (element === '土' && plumBodyElement === '火') ||
        (element === '火' && plumBodyElement === '木') || (element === '木' && plumBodyElement === '水') ||
        (element === '水' && plumBodyElement === '金')
      ) {
        lines.push(`【八字×梅花易数交叉】日主${element}生体卦${plumBodyElement}（相生），先天命盘滋养当前形势，顺遂之象。`);
      } else if (
        (plumBodyElement === '金' && element === '土') || (plumBodyElement === '土' && element === '火') ||
        (plumBodyElement === '火' && element === '木') || (plumBodyElement === '木' && element === '水') ||
        (plumBodyElement === '水' && element === '金')
      ) {
        lines.push(`【八字×梅花易数交叉】体卦${plumBodyElement}生日主${element}（相生），当前形势对命主有助益。`);
      } else {
        lines.push(`【八字×梅花易数交叉】日主${element}与体卦${plumBodyElement}五行不同，提示需调和内外能量。`);
      }
    }

    if (p && h) {
      lines.push(`【人类图×梅花易数交叉】${h.type}类型对应本卦「${p.primary.name}」的${p.bodyUseRelation.includes('吉') ? '积极' : '审慎'}态势，策略与卦象呼应。`);
    }

    if (p && a && sunElement && plumBodyElement) {
      if (sunElement === plumBodyElement) {
        lines.push(`【占星×梅花易数交叉】太阳${sunElement}元素与体卦${plumBodyElement}相同，灵魂表达与当下际遇一致。`);
      } else {
        lines.push(`【占星×梅花易数交叉】太阳${sunElement}元素与体卦${plumBodyElement}不同，内在灵魂倾向与现实处境需要调和。`);
      }
    }

    lines.push(`综合八字五行喜忌、人类图策略权威、占星星座特质以及梅花易数卦象启示，四系统相互印证，全面认知自我与当下。`);

    return lines.join('\n');
  }, []);

  /* ── 提交 ── */

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.year || !form.month || !form.day) { setError('请填写完整的出生日期'); return; }
    setLoading(true); setError(''); setBazi(null); setDayun(null); setHD(null); setAstro(null); setPlum(null); setFusion('');

    const body = {
      year: form.year,
      month: form.month,
      day: form.day,
      hour: form.hour || '12',
      minute: form.minute || '0',
      gender: form.gender,
      location: form.location || '北京',
    };

    try {
      const [baziRes, hdRes, astroRes, plumRes] = await Promise.all([
        fetch('/api/bazi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
        fetch('/api/human-design', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
        fetch('/api/astrology', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
        fetch('/api/plum-blossom', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'date', year: form.year, month: form.month, day: form.day, hour: form.hour || undefined }) }).then(r => r.json()),
      ]);

      if (!baziRes.success) throw new Error(baziRes.error || '八字生成失败');
      if (!hdRes.success) throw new Error(hdRes.error || '人类图生成失败');
      if (!astroRes.success) throw new Error(astroRes.error || '占星生成失败');
      if (!plumRes.success) throw new Error(plumRes.error || '梅花易数起卦失败');

      setBazi(baziRes.bazi);
      setDayun(baziRes.dayun);
      setHD(hdRes.bodygraph);
      setAstro(astroRes.astrology);
      setPlum(plumRes.hexagram);

      // 自动生成人类图深度解读报告
      setHdInterpLoading(true);
      try {
        const interpRes = await fetch('/api/hd-interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bodygraph: hdRes.bodygraph }),
        });
        const interpData = await interpRes.json();
        setHdInterp(interpData.interpretation || '');
      } catch { setHdInterp('解读生成失败'); }
      finally { setHdInterpLoading(false); }

      // 融合分析（客户端生成）
      const fusionText = generateFusionText(baziRes.bazi, hdRes.bodygraph, astroRes.astrology, plumRes.hexagram);
      setFusion(fusionText);

      // 也尝试调用融合API获取更丰富的AI解读
      try {
        const fusionRes = await fetch('/api/fusion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const fusionData = await fusionRes.json();
        if (fusionData.fusion) setFusion(prev => prev + '\n\n' + fusionData.fusion);
      } catch {}
    } catch (err: any) {
      setError(err.message || '生成失败');
    } finally { setLoading(false); }
  }, [form, generateFusionText]);

  /* ── 打印/PDF ── */

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  /* ── 渲染 ── */

  return (
    <>
      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          body * { visibility: visible !important; color: #000 !important; }
          .no-print { display: none !important; }
          .print-area { display: block !important; }
          .card-jade { break-inside: avoid; border: 1px solid #ccc !important; box-shadow: none !important; background: #fff !important; }
          .gradient-text { -webkit-text-fill-color: #2d5a4f !important; color: #2d5a4f !important; }
          .btn-jade, .btn-gold, button { display: none !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      <div className="py-6 md:py-12 px-4 max-w-6xl mx-auto" ref={reportRef}>
        {/* ── 标题 ── */}
        <div className="text-center mb-8 no-print">
          <div className="text-3xl mb-2">🔮🧬✨☯</div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">八字 · 人类图 · 占星 · 梅花易数 融合分析</h1>
          <p className="text-sm text-[var(--text-secondary)]">输入出生信息，获得东方命理 · 人类设计 · 西方占星 · 梅花易数四系统交叉解读</p>
        </div>

        {/* ── 打印用标题 ── */}
        <div className="hidden print-area text-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#2d5a4f' }}>八字 · 人类图 · 占星 · 梅花易数 融合分析报告</h1>
          <p className="text-sm" style={{ color: '#666' }}>
            出生时间：{form.year}年{form.month}月{form.day}日{form.hour ? ` ${form.hour}时` : ''}
            {form.location ? ` · ${form.location}` : ''}
          </p>
          <hr style={{ borderColor: '#ccc', margin: '10px 0' }} />
        </div>

        {/* ── 表单 ── */}
        {!bazi && (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 card-jade p-6 no-print">
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
              <select className="input-jade" value={form.minute} onChange={e => setForm(p => ({...p, minute: e.target.value}))}>
                <option value="0">00分</option>
                {[0,15,30,45].map(m => <option key={m} value={String(m)}>{String(m).padStart(2,'0')}分</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select className="input-jade" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))}>
                <option value="">地点</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select className="input-jade" value={form.gender} onChange={e => setForm(p => ({...p, gender: e.target.value}))}>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <button type="submit" className="btn-jade w-full" disabled={loading}>
              {loading ? '🔮🧬✨☯ 四系统同步分析中...' : '🔮🧬✨☯ 生成四系统融合报告'}
            </button>
          </form>
        )}

        {/* ── 加载中 ── */}
        {loading && (
          <div className="text-center py-12 no-print">
            <div className="cosmic-loader mx-auto mb-4">
              <div className="cosmic-ring cosmic-ring-1" />
              <div className="cosmic-ring cosmic-ring-2" />
              <div className="cosmic-ring cosmic-ring-3" />
              <div className="cosmic-center">☯</div>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">正在并行计算八字、人类图、西方占星和梅花易数...</p>
          </div>
        )}

        {/* ── 结果 ── */}
        {bazi && hd && astro && plum && (
          <div className="space-y-5">
            {/* ═══ 四栏系统总览 ═══ */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 八字卡片 */}
              <div className="card-jade p-5">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <span>🔮</span> 八字排盘
                </h3>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {['年','月','日','时'].map((label, i) => (
                    <div key={i} className="text-center p-2 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)]">
                      <div className="text-[10px] text-[var(--text-secondary)] mb-0.5">{label}</div>
                      <div className="text-base font-bold gradient-text">{bazi.pillars[i]}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{bazi.nayin[i]}</div>
                    </div>
                  ))}
                </div>
                <div className="text-sm mb-1">
                  日主：<span className="font-bold gradient-text">{bazi.dayMaster}{bazi.dayMasterElement}</span>
                  <span className="text-[var(--text-secondary)] ml-2">地支{bazi.dayBranch}</span>
                </div>
                <ElementBar dist={bazi.elementDistribution} />
                <div className="flex flex-wrap gap-x-3 text-[11px] text-[var(--text-secondary)] mt-2">
                  <span>命宫{bazi.mingGong}</span>
                  {bazi.taiYuan && <span>胎元{bazi.taiYuan}</span>}
                  {bazi.kongWang?.kongZhi?.length > 0 && <span>空亡{bazi.kongWang.kongZhi.join('、')}</span>}
                </div>
              </div>

              {/* 人类图卡片 */}
              <div className="card-jade p-5">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <span>🧬</span> 人类图
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">类型</span><span className="font-bold gradient-text">{hd.type}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">权威</span><span>{hd.authority}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">人生角色</span><span>{hd.profile}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">定义</span><span>{hd.definition}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">签名</span><span>{hd.signature}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">非自我</span><span>{hd.notSelfTheme}</span></div>
                  <div className="pt-2 border-t border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)] text-xs">定义中心：</span>
                    <span className="text-xs">{hd.definedCenters?.join(', ') || '无'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hd.channels?.map(ch => <span key={ch} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--text-accent)]/10 text-[var(--text-accent)]">{ch}</span>)}
                  </div>
                </div>
              </div>

            {/* 占星卡片 */}
              <div className="card-jade p-5">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <span>✨</span> 西方占星
                </h3>
                <div className="text-center mb-3">
                  <div className="text-2xl mb-1">
                    {astro.sunSign.key === 'aries' && '♈'}
                    {astro.sunSign.key === 'taurus' && '♉'}
                    {astro.sunSign.key === 'gemini' && '♊'}
                    {astro.sunSign.key === 'cancer' && '♋'}
                    {astro.sunSign.key === 'leo' && '♌'}
                    {astro.sunSign.key === 'virgo' && '♍'}
                    {astro.sunSign.key === 'libra' && '♎'}
                    {astro.sunSign.key === 'scorpio' && '♏'}
                    {astro.sunSign.key === 'sagittarius' && '♐'}
                    {astro.sunSign.key === 'capricorn' && '♑'}
                    {astro.sunSign.key === 'aquarius' && '♒'}
                    {astro.sunSign.key === 'pisces' && '♓'}
                  </div>
                  <div className="text-lg font-bold gradient-text">{astro.sunSign.label}</div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {ELEMENT_EMOJI[astro.sunSign.element] || '✨'} {astro.sunSign.element}象星座
                  </div>
                </div>
                <div className="text-xs text-[var(--text-secondary)] mb-1">宫位制：{astro.houses}</div>
              </div>

              {/* 梅花易数卡片 */}
              <div className="card-jade p-5">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <span>☯</span> 梅花易数
                </h3>
                <div className="text-center mb-3">
                  <div className="text-3xl mb-1">
                    {getTrigramEmoji(plum.primary.upper.name)}{getTrigramEmoji(plum.primary.lower.name)}
                  </div>
                  <div className="text-lg font-bold gradient-text">{plum.primary.name}</div>
                  {plum.changing && (
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      → {getTrigramEmoji(plum.changing.upper.name)}{getTrigramEmoji(plum.changing.lower.name)} {plum.changing.name}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">体卦</span>
                    <span>{getTrigramEmoji(plum.bodyTrigram.name)} {plum.bodyTrigram.name}（{plum.bodyTrigram.element}）</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">用卦</span>
                    <span>{getTrigramEmoji(plum.useTrigram.name)} {plum.useTrigram.name}（{plum.useTrigram.element}）</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">体用</span>
                    <span className={`font-medium ${
                      plum.bodyUseRelation.includes('吉') ? 'text-green-400' :
                      plum.bodyUseRelation.includes('凶') ? 'text-red-400' :
                      'text-[var(--text-accent)]'
                    }`}>{plum.bodyUseRelation}</span>
                  </div>
                  {plum.mutual && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">互卦</span>
                      <span>{getTrigramEmoji(plum.mutual.upper.name)}{getTrigramEmoji(plum.mutual.lower.name)} {plum.mutual.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">动爻</span>
                    <span>第{plum.movingLine}爻</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ 人类图深度解读报告 ═══ */}
            <div className="card-jade p-5">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <span>📜</span> 人类图深度解读报告
              </h3>
              {hdInterpLoading ? (
                <div className="text-center py-6">
                  <div className="cosmic-loader mx-auto mb-3" style={{width:36,height:36}}>
                    <div className="cosmic-ring cosmic-ring-3" style={{width:'100%',height:'100%'}}/>
                    <div className="cosmic-center text-xs">📜</div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">正在生成深度解读...</p>
                </div>
              ) : hdInterp ? (
                <div className="text-sm leading-relaxed report-content whitespace-pre-line">
                  {hdInterp.split('## ').filter(Boolean).map((section, i) => {
                    const lines = section.trim().split('\n');
                    const title = lines[0].trim();
                    const body = lines.slice(1).join('\n').trim();
                    return (
                      <div key={i} className="mb-5 last:mb-0">
                        <h4 className="text-sm font-bold text-[var(--text-accent)] mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-accent)] inline-block" />
                          {title}
                        </h4>
                        <div className="text-sm leading-relaxed text-[var(--text-primary)]/90">{body}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-secondary)]">解读生成中...</p>
              )}
            </div>

            {/* ═══ 八字详细信息 ═══ */}
            <div className="card-jade p-5">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <span>🔮</span> 八字详细分析
              </h3>

              {/* 五行分布 */}
              <div className="mb-4">
                <div className="text-xs text-[var(--text-secondary)] mb-1">五行分布</div>
                <ElementBar dist={bazi.elementDistribution} />
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {Object.entries(bazi.elementDistribution).map(([k, v]) => (
                    <span key={k} className="text-[11px] flex items-center gap-1">
                      <span style={{ color: ELEMENT_COLORS[k] }}>{ELEMENT_EMOJI[k]}</span>
                      <span>{k}: {v}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* 神煞 */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('shensha')}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--text-accent)] mb-1.5 cursor-pointer"
                >
                  <span>{expandedSections['shensha'] ? '▼' : '▶'} 神煞</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-normal">（点击展开）</span>
                </button>
                {expandedSections['shensha'] && bazi.shensha && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(['year','month','day','hour'] as const).map((key, i) => (
                      <div key={key} className="p-2 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)]">
                        <div className="text-[10px] text-[var(--text-secondary)] mb-1 font-medium">{['年柱','月柱','日柱','时柱'][i]}</div>
                        <div className="flex flex-wrap">
                          {(bazi.shensha[key] || []).length > 0
                            ? bazi.shensha[key].map((s: string) => <ShenshaBadge key={s} name={s} />)
                            : <span className="text-[10px] text-[var(--text-secondary)]">无</span>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 藏干 */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('hiddenStems')}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--text-accent)] mb-1.5 cursor-pointer"
                >
                  <span>{expandedSections['hiddenStems'] ? '▼' : '▶'} 藏干</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-normal">（点击展开）</span>
                </button>
                {expandedSections['hiddenStems'] && bazi.hiddenStems && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(['year','month','day','hour'] as const).map((key, i) => (
                      <div key={key} className="p-2 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)]">
                        <div className="text-[10px] text-[var(--text-secondary)] mb-1 font-medium">{['年柱','月柱','日柱','时柱'][i]}（{bazi.pillars[i]}）</div>
                        <HiddenStemsRow stems={bazi.hiddenStems[key] || []} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 刑害合冲 */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('relations')}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--text-accent)] mb-1.5 cursor-pointer"
                >
                  <span>{expandedSections['relations'] ? '▼' : '▶'} 刑害合冲</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-normal">（点击展开）</span>
                </button>
                {expandedSections['relations'] && bazi.relations && (
                  <div className="flex flex-wrap gap-2">
                    {bazi.relations.length > 0
                      ? bazi.relations.map((rel, i) => <RelationTag key={i} rel={rel} />)
                      : <span className="text-xs text-[var(--text-secondary)]">无特殊关系</span>
                    }
                  </div>
                )}
              </div>

              {/* 大运 */}
              <div>
                <button
                  onClick={() => toggleSection('dayun')}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--text-accent)] mb-1.5 cursor-pointer"
                >
                  <span>{expandedSections['dayun'] ? '▼' : '▶'} 大运</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-normal">（点击展开）</span>
                </button>
                {expandedSections['dayun'] && dayun && (
                  <div>
                    <div className="text-xs text-[var(--text-secondary)] mb-2">
                      {dayun.startAge}岁起运（{dayun.startAgeDetail}）
                    </div>
                    <DayunTable dayun={dayun} />
                  </div>
                )}
              </div>
            </div>

            {/* ═══ 占星详细 ═══ */}
            <div className="card-jade p-5">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <span>✨</span> 占星命盘
              </h3>

              {/* 太阳星座 */}
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)]">
                <div className="text-3xl">
                  {astro.sunSign.key === 'aries' && '♈'}
                  {astro.sunSign.key === 'taurus' && '♉'}
                  {astro.sunSign.key === 'gemini' && '♊'}
                  {astro.sunSign.key === 'cancer' && '♋'}
                  {astro.sunSign.key === 'leo' && '♌'}
                  {astro.sunSign.key === 'virgo' && '♍'}
                  {astro.sunSign.key === 'libra' && '♎'}
                  {astro.sunSign.key === 'scorpio' && '♏'}
                  {astro.sunSign.key === 'sagittarius' && '♐'}
                  {astro.sunSign.key === 'capricorn' && '♑'}
                  {astro.sunSign.key === 'aquarius' && '♒'}
                  {astro.sunSign.key === 'pisces' && '♓'}
                </div>
                <div>
                  <div className="text-lg font-bold gradient-text">太阳{astro.sunSign.label}</div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    元素：{astro.sunSign.element} {ELEMENT_EMOJI[astro.sunSign.element] || ''}
                  </div>
                </div>
              </div>

              {/* 行星星座表格 */}
              <div className="mb-4">
                <div className="text-xs text-[var(--text-secondary)] mb-2 font-medium">十大行星</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="py-1 px-2 text-left text-[var(--text-secondary)]">行星</th>
                        <th className="py-1 px-2 text-left text-[var(--text-secondary)]">星座</th>
                        <th className="py-1 px-2 text-left text-[var(--text-secondary)]">宫位</th>
                        <th className="py-1 px-2 text-left text-[var(--text-secondary)]">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {astro.bodies.map((body) => (
                        <tr key={body.key} className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-highlight)]">
                          <td className="py-1.5 px-2 font-medium">{body.label}</td>
                          <td className="py-1.5 px-2">
                            {body.sign?.label || '—'}
                            {body.sign?.element ? <span className="text-[10px] text-[var(--text-secondary)] ml-1">（{ELEMENT_NAMES_CN[body.sign.element] || body.sign.element}）</span> : ''}
                          </td>
                          <td className="py-1.5 px-2 text-[var(--text-secondary)]">第{body.house}宫</td>
                          <td className="py-1.5 px-2">
                            {body.retrograde ? <span className="text-red-400">逆行℞</span> : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 相位 */}
              {astro.aspects && astro.aspects.length > 0 && (
                <div>
                  <div className="text-xs text-[var(--text-secondary)] mb-2 font-medium">主要相位</div>
                  <div className="flex flex-wrap gap-2">
                    {astro.aspects.map((asp, i) => (
                      <div key={i} className="text-[11px] px-2 py-1 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] flex items-center gap-1">
                        <span>{ASPECT_EMOJI[asp.type] || '●'}</span>
                        <span className="font-medium">{asp.body1}—{asp.body2}</span>
                        <span className="text-[var(--text-accent)]">{ASPECT_LABELS[asp.type] || asp.type}</span>
                        <span className="text-[var(--text-secondary)]">（{asp.orb?.toFixed(1)}°）</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ═══ 梅花易数详细 ═══ */}
            <div className="card-jade p-5">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <span>☯</span> 梅花易数详解
              </h3>

              {/* 三卦概览 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {/* 本卦 */}
                <div className="p-3 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] text-center">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">本卦</div>
                  <div className="text-3xl mb-1">
                    {getTrigramEmoji(plum.primary.upper.name)}{getTrigramEmoji(plum.primary.lower.name)}
                  </div>
                  <div className="text-sm font-bold gradient-text">{plum.primary.name}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-1">
                    {plum.primary.upper.name}{getTrigramEmoji(plum.primary.upper.name)}（{plum.primary.upper.element}）
                    · {plum.primary.lower.name}{getTrigramEmoji(plum.primary.lower.name)}（{plum.primary.lower.element}）
                  </div>
                </div>

                {/* 变卦 */}
                <div className="p-3 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] text-center">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">变卦（{plum.movingLine}爻动）</div>
                  {plum.changing ? (
                    <>
                      <div className="text-3xl mb-1">
                        {getTrigramEmoji(plum.changing.upper.name)}{getTrigramEmoji(plum.changing.lower.name)}
                      </div>
                      <div className="text-sm font-bold gradient-text">{plum.changing.name}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-1">
                        {plum.changing.upper.name}{getTrigramEmoji(plum.changing.upper.name)}（{plum.changing.upper.element}）
                        · {plum.changing.lower.name}{getTrigramEmoji(plum.changing.lower.name)}（{plum.changing.lower.element}）
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-[var(--text-secondary)]">无变爻</div>
                  )}
                </div>

                {/* 互卦 */}
                <div className="p-3 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] text-center">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">互卦</div>
                  {plum.mutual ? (
                    <>
                      <div className="text-3xl mb-1">
                        {getTrigramEmoji(plum.mutual.upper.name)}{getTrigramEmoji(plum.mutual.lower.name)}
                      </div>
                      <div className="text-sm font-bold gradient-text">{plum.mutual.name}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-1">
                        {plum.mutual.upper.name}{getTrigramEmoji(plum.mutual.upper.name)}（{plum.mutual.upper.element}）
                        · {plum.mutual.lower.name}{getTrigramEmoji(plum.mutual.lower.name)}（{plum.mutual.lower.element}）
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-[var(--text-secondary)]">—</div>
                  )}
                </div>
              </div>

              {/* 体用生克 */}
              <div className="mb-4 p-3 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-secondary)] mb-2 font-medium">体用生克</div>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl">{getTrigramEmoji(plum.bodyTrigram.name)}</div>
                    <div className="font-bold gradient-text">{plum.bodyTrigram.name}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">体卦（{plum.bodyTrigram.element}）</div>
                  </div>
                  <div className="text-xl text-[var(--text-secondary)]">→</div>
                  <div className="text-center">
                    <div className="text-2xl">{getTrigramEmoji(plum.useTrigram.name)}</div>
                    <div className="font-bold gradient-text">{plum.useTrigram.name}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">用卦（{plum.useTrigram.element}）</div>
                  </div>
                  <div className="text-xl text-[var(--text-secondary)]">=</div>
                  <div className={`text-center font-bold px-3 py-1.5 rounded-lg ${
                    plum.bodyUseRelation.includes('吉') ? 'bg-green-500/15 text-green-400 border border-green-500/20' :
                    plum.bodyUseRelation.includes('凶') ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                    plum.bodyUseRelation.includes('泄气') ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                    'bg-blue-500/10 text-blue-300 border border-blue-500/15'
                  }`}>
                    {plum.bodyUseRelation}
                  </div>
                </div>
              </div>

              {/* 卦辞解读 */}
              <div className="mb-4">
                <div className="text-xs text-[var(--text-secondary)] mb-2 font-medium">卦辞</div>
                <div className="text-sm italic text-[var(--text-accent)] border-l-2 border-[var(--text-accent)]/40 pl-3">
                  “{plum.primary.judgment}”
                </div>
              </div>

              {/* 综合解读 */}
              <div className="mb-4">
                <div className="text-xs text-[var(--text-secondary)] mb-2 font-medium">梅花易数综合解读</div>
                <div className="text-sm leading-relaxed">{plum.interpretation}</div>
              </div>

              {/* 六亲/世应/纳甲 */}
              <div>
                <button
                  onClick={() => toggleSection('plumDetails')}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--text-accent)] mb-1.5 cursor-pointer"
                >
                  <span>{expandedSections['plumDetails'] ? '▼' : '▶'} 六亲 · 世应 · 纳甲</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-normal">（点击展开）</span>
                </button>
                {expandedSections['plumDetails'] && (
                  <div className="space-y-3">
                    {/* 六亲 */}
                    <div className="p-3 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)]">
                      <div className="text-xs text-[var(--text-secondary)] mb-1.5 font-medium">六亲</div>
                      <div className="grid grid-cols-6 gap-1">
                        {plum.sixRelations?.map((rel, i) => (
                          <div key={i} className="text-center p-1.5 rounded bg-[var(--bg-color)] border border-[var(--border-color)]">
                            <div className="text-[10px] text-[var(--text-secondary)]">{i + 1}爻</div>
                            <div className="text-xs font-medium">{rel}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* 世应 */}
                    {plum.shiYing && (
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-400" />
                          <span>世爻：第{plum.shiYing.shi}爻</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                          <span>应爻：第{plum.shiYing.ying}爻</span>
                        </div>
                      </div>
                    )}
                    {/* 纳甲 */}
                    {plum.nayinStem && plum.nayinBranch && (
                      <div className="p-3 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)]">
                        <div className="text-xs text-[var(--text-secondary)] mb-1.5 font-medium">纳甲</div>
                        <div className="grid grid-cols-6 gap-1">
                          {plum.nayinStem.map((stem, i) => (
                            <div key={i} className="text-center p-1.5 rounded bg-[var(--bg-color)] border border-[var(--border-color)]">
                              <div className="text-[10px] text-[var(--text-secondary)]">{i + 1}爻</div>
                              <div className="text-xs font-mono">{stem}{plum.nayinBranch[i]}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ═══ 融合分析 ═══ */}
            <div className="card-jade p-5">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <span>🔗</span> 四系统融合分析
              </h3>
              {fusion ? (
                <div className="text-sm leading-relaxed whitespace-pre-line space-y-1">
                  {fusion.split('\n').map((line, i) => {
                    if (line.startsWith('【八字视角】')) return <p key={i} className="border-l-2 border-green-500/40 pl-3 py-1">{line}</p>;
                    if (line.startsWith('【人类图视角】')) return <p key={i} className="border-l-2 border-purple-500/40 pl-3 py-1">{line}</p>;
                    if (line.startsWith('【占星视角】')) return <p key={i} className="border-l-2 border-blue-500/40 pl-3 py-1">{line}</p>;
                    if (line.startsWith('【梅花易数视角】')) return <p key={i} className="border-l-2 border-amber-500/40 pl-3 py-1">{line}</p>;
                    if (line.startsWith('【八字×占星交叉】') || line.startsWith('【八字×梅花易数交叉】') || line.startsWith('【人类图×梅花易数交叉】') || line.startsWith('【占星×梅花易数交叉】')) return <p key={i} className="border-l-2 border-[var(--text-accent-gold)]/50 pl-3 py-1 font-medium">{line}</p>;
                    if (line.startsWith('【交叉分析】')) return <p key={i} className="border-l-2 border-[var(--text-accent-gold)]/50 pl-3 py-1 font-medium">{line}</p>;
                    if (!line.trim()) return <br key={i} />;
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              ) : (
                <div className="text-sm text-[var(--text-secondary)]">
                  <p>八字日主{bazi.dayMaster}{bazi.dayMasterElement} → 人类图{hd.type}类型 → 太阳{astro.sunSign.label} → 梅花易数{plum.primary.name}</p>
                  <p className="mt-2">四系统交叉印证中...</p>
                </div>
              )}
            </div>

            {/* ═══ 操作按钮 ═══ */}
            <div className="flex flex-wrap justify-center gap-3 no-print pt-2">
              <button
                onClick={() => { setBazi(null); setDayun(null); setHD(null); setAstro(null); setPlum(null); setFusion(''); setHdInterp(''); }}
                className="btn-jade max-w-xs inline-flex"
                style={{ width: 'auto' }}
              >
                🔄 重新查询
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-3 rounded-xl border border-[var(--border-color)] text-sm hover:border-[var(--text-accent)] hover:bg-[var(--bg-highlight)] transition-all inline-flex items-center gap-2"
              >
                📄 下载PDF报告
              </button>
            </div>

            {/* ═══ 页脚信息（打印可见） ═══ */}
            <div className="hidden print-area text-center text-[10px]" style={{ color: '#999', marginTop: '20px' }}>
              <p>报告由 灵魂解码（aisoulcode.cn）生成 · 融合八字·人类图·占星·梅花易数四系统</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
