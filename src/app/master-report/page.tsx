'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import VoiceReader from '@/components/VoiceReader';
import BodygraphSVG from '@/components/BodygraphSVG';
import BaziChart from '@/components/BaziChart';
import ZiWeiChart from '@/components/ZiWeiChart';
import ReportWaiting from '@/components/ReportWaiting';
import { marked } from 'marked';
import { CHINA_CITIES, INTERNATIONAL_CITIES, CITY_TZ } from '@/data/cities';
import { beginNewReportView } from '@/lib/master-report-view';

const YEARS = Array.from({length:121},(_,i)=>2026-i);
const MONTHS = Array.from({length:12},(_,i)=>i+1);
const DAYS = Array.from({length:31},(_,i)=>i+1);
const HOURS = Array.from({length:24},(_,i)=>i);
const MINUTES = Array.from({length:60},(_,i)=>i);

export default function MasterPage() {
  const [year, setYear] = useState(''); const [month, setMonth] = useState('');
  const [day, setDay] = useState(''); const [hour, setHour] = useState(''); const [minute, setMinute] = useState('0');
  const [continent, setContinent] = useState(''); const [country, setCountry] = useState('');
  const [province, setProvince] = useState(''); const [city, setCity] = useState('');
  const [gender, setGender] = useState('男');
  const [report, setReport] = useState(''); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); const [data, setData] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [reportName, setReportName] = useState('');

  // ── R2: 免费排盘模式 ──
  const [showQuickInput, setShowQuickInput] = useState(true);
  const [showFullReport, setShowFullReport] = useState(false);

  // ── R3: 等待页 — 诚实进度 ──
  const [isStreaming, setIsStreaming] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 计时器：每秒更新
  useEffect(() => {
    if (loading && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading, startTime]);

  // 流式结束后清理
  useEffect(() => {
    if (!loading && !isStreaming && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [loading, isStreaming]);

  // ── R4: 下一步CTA配置 ──
  const NEXT_STEPS = {
    fullReport: {
      emoji: '👨‍👩‍👧‍👦',
      title: '想为孩子也解码一份？',
      desc: '每个孩子的出厂配置都独一无二。看看孩子的天赋、学习风格和成长路径，让教育不再盲人摸象。',
      btn: '🔮 亲子合盘 · 两份报告交叉解读 →',
      href: '/compatibility',
    },
    compatibility: {
      emoji: '🏫',
      title: '见己学园 · 家庭成长助手',
      desc: '即将上线：个性化学习方案、成长图谱追踪、家长课程匹配。三站联动，从看清孩子到陪好孩子。',
      btn: '📩 关注公众号，第一时间获取上线通知',
      href: '#',
      placeholder: true,
    },
  };

  const charCount = report.length;

  // Load saved reports on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('master_report_history');
      if (saved) setSavedReports(JSON.parse(saved));
    } catch {}
  }, []);

  // Extract name from report for auto-labeling
  const extractName = (r: string) => {
    const m = r.match(/^.{0,20}(?:你|您)(?:今年)?(\d+)岁/);
    return m ? `${m[1]}岁·${gender}` : gender;
  };

  // Save report to history
  const saveToHistory = (reportText: string, reportData: any) => {
    const entry = {
      id: Date.now().toString(36),
      name: extractName(reportText) || `${year}年${month}月${day}日·${gender}`,
      report: reportText, data: reportData,
      year, month, day, hour, minute, continent, country, province, city, gender,
      createdAt: new Date().toISOString()
    };
    const history = [entry, ...savedReports.filter((r:any) => r.report !== reportText)].slice(0, 10);
    setSavedReports(history);
    try { localStorage.setItem('master_report_history', JSON.stringify(history)); } catch {}
    try { localStorage.setItem('last_master_report', JSON.stringify({report: reportText, data: reportData})); } catch {}
  };

  const continents = useMemo(() => Object.keys(INTERNATIONAL_CITIES), []);
  const continentCountries = useMemo(() =>
    continent ? Object.keys(INTERNATIONAL_CITIES[continent]||{}) : [], [continent]);
  const isChina = country === '中国';
  const provinces = useMemo(() => isChina ? Object.keys(CHINA_CITIES) : [], [isChina]);
  const cities = useMemo(() => {
    if (!country) return [];
    if (isChina && province) return CHINA_CITIES[province]||[];
    if (!isChina && continent && country) return INTERNATIONAL_CITIES[continent]?.[country]||[];
    return [];
  }, [country, continent, isChina, province]);

  const detectedTz = useMemo(() => {
    if (city && CITY_TZ[city]) return CITY_TZ[city];
    return 'Asia/Shanghai';
  }, [city]);

  const submit = async () => {
    setLoading(true); setError(''); setReport(''); setData(null); setShowQuickInput(false);
    setIsStreaming(false); setStartTime(Date.now()); setElapsedSeconds(0);

    const loc = isChina ? province : country;
    try {
      const r = await fetch('/api/master-report/stream', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({year, month, day, hour, minute, location:loc, city, gender, timezone:detectedTz}),
      });
      if (!r.ok) { setError('API错误: ' + r.status); setLoading(false); return; }

      const reader = r.body?.getReader();
      if (!reader) { setError('不支持流式读取'); setLoading(false); return; }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullReport = '';
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const msg = JSON.parse(line.slice(6));
              if (msg.error) { setError(msg.error); setLoading(false); setIsStreaming(false); return; }
              if (msg.done) {
                setData({ bazi: msg.bazi, hd: msg.hd, ziwei: msg.ziwei, zodiac: msg.zodiac, wuyun: msg.wuyun, liunian: msg.liunian });
                setReport(fullReport);
                setLoading(false);
                setIsStreaming(false);
                saveToHistory(fullReport, { bazi: msg.bazi, hd: msg.hd, ziwei: msg.ziwei, zodiac: msg.zodiac, wuyun: msg.wuyun, liunian: msg.liunian });
              } else if (msg.content) {
                fullReport += msg.content;
                setReport(fullReport);
                if (isFirstChunk) {
                  setLoading(false);   // 等待页 → 流式阶段
                  setIsStreaming(true);
                  isFirstChunk = false;
                }
              }
            } catch {}
          }
        }
      }
    } catch (e: any) { setError(e.message||'网络错误'); setLoading(false); setIsStreaming(false); }
    // 流式自然结束
    if (!error) { setLoading(false); setIsStreaming(false); }
  };

  const handleRetry = useCallback(() => { submit(); }, [year, month, day, hour, minute, continent, country, province, city, gender]);

  const allFilled = year && month && day && continent && country && city;
  const quickFilled = year && month && day && continent && country && city;

  const reportHtml = useMemo(() => {
    if (!report) return '';
    try { return marked(report, { breaks: true, gfm: true }) as string; }
    catch { return report; }
  }, [report]);

  // ── R2: 骨架结果 ──
  const showSkeleton = data && !showFullReport;
  const startNewReport = () => {
    const next = beginNewReportView({ report, data, showQuickInput, showFullReport, error });
    setReport(next.report);
    setData(next.data);
    setShowQuickInput(next.showQuickInput);
    setShowFullReport(next.showFullReport);
    setError(next.error);
    setIsStreaming(false);
    setStartTime(null);
    setElapsedSeconds(0);
    try { localStorage.removeItem('last_master_report'); } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="inner-page soul-editorial-page min-h-screen px-4 py-6 md:py-10 pt-nav">
      <div className="soul-editorial-shell">

        <div className="soul-editorial-header">
          <p className="soul-editorial-eyebrow">Seven-System Reading</p>
          <h1 className="soul-editorial-title">
            人生<span className="gradient-text">总览</span>
          </h1>
          <p className="soul-editorial-lead">一次输入 · 七个维度交叉印证，看见完整的您</p>
          {(report || data) && !showQuickInput && (
            <button
              type="button"
              onClick={startNewReport}
              className="mt-4 rounded-xl border border-[var(--border-accent)] bg-[var(--bg-card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-accent)] hover:bg-[var(--bg-highlight)] transition-colors"
            >
              ＋ 为新的人重新排盘
            </button>
          )}
        </div>

        {/* ── R3: 等待页（loading=true 时全覆盖）── */}
        {loading && (
          <ReportWaiting
            type="personal"
            isStreaming={false}
            elapsedSeconds={elapsedSeconds}
            charCount={0}
            error={error}
            onRetry={handleRetry}
          />
        )}

        {/* ── R3: 流式进度条（isStreaming 时顶部细条）── */}
        {isStreaming && report && (
          <ReportWaiting
            type="personal"
            isStreaming={true}
            elapsedSeconds={elapsedSeconds}
            charCount={charCount}
            error={error}
            onRetry={handleRetry}
          />
        )}

        {/* ── R2: 免费排盘极简输入（4 字段）── */}
        {showQuickInput && (
          <div className="soul-editorial-grid mb-10">
            {/* 左：品牌信息（桌面） */}
            <div className="soul-editorial-intro hidden md:block">
              <p className="soul-editorial-section-label">一次输入，七重印证</p>
              <h2>
                七套古老智慧，<br />交叉印证<span className="gradient-text">同一件事</span>
              </h2>
              <p>
                您的出生信息将同时经由七个系统运算——东方命理与西方能量学彼此校验，输出一份互为印证的完整报告。
              </p>
              <div className="soul-editorial-tags">
                {['八字','人类图','占星','紫微斗数','五运六气','流年','人生规划'].map(s => (
                  <span key={s} className="soul-editorial-tag">
                    {s}
                  </span>
                ))}
              </div>
              <div className="soul-editorial-privacy">
                出生信息仅用于排盘，绝不外泄
              </div>
            </div>

            {/* 右：表单卡 */}
            <div className="soul-editorial-form report-form">
              {/* 01 基本信息 */}
              <div className="soul-editorial-form-section">
              <p className="soul-editorial-form-label">基本信息</p>
              <div className="soul-editorial-tabs">
                {['男','女'].map(g => (
                  <button key={g} onClick={()=>setGender(g)}
                    className="soul-editorial-tab"
                    data-active={gender===g}>{g}</button>
                ))}
              </div>
              </div>

              {/* 02 出生时间 */}
              <div className="soul-editorial-form-section">
              <p className="soul-editorial-form-label">出生时间</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select value={year} onChange={e=>setYear(e.target.value)}
                  className="input-jade soul-editorial-field px-3">
                  <option value="">年份</option>
                  {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                </select>
                <select value={month} onChange={e=>setMonth(e.target.value)}
                  className="input-jade soul-editorial-field px-3">
                  <option value="">月</option>
                  {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                <select value={day} onChange={e=>setDay(e.target.value)}
                  className="input-jade soul-editorial-field px-3">
                  <option value="">日</option>
                  {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
                <select value={hour} onChange={e=>setHour(e.target.value)}
                  className="input-jade soul-editorial-field px-3">
                  <option value="">时</option>
                  {HOURS.map(h=><option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              </div>

              {/* 03 出生地点 */}
              <div className="soul-editorial-form-section">
              <p className="soul-editorial-form-label">出生地点</p>
              <div className="space-y-3">
                <select value={continent} onChange={e=>{setContinent(e.target.value);setCountry('');setProvince('');setCity('');}}
                  className="w-full input-jade soul-editorial-field px-4">
                  <option value="">选择大洲</option>
                  {continents.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                {continent && (
                  <select value={country} onChange={e=>{setCountry(e.target.value);setProvince('');setCity('');}}
                    className="w-full input-jade soul-editorial-field px-4">
                    <option value="">选择国家</option>
                    {continentCountries.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                )}
                {isChina && country && (
                  <select value={province} onChange={e=>{setProvince(e.target.value);setCity('');}}
                    className="w-full input-jade soul-editorial-field px-4">
                    <option value="">选择省份</option>
                    {provinces.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                )}
                {country && cities.length > 0 && (
                  <select value={city} onChange={e=>setCity(e.target.value)}
                    className="w-full input-jade soul-editorial-field px-4">
                    <option value="">选择城市</option>
                    {cities.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>
              </div>

              {/* 04 精确时间（可选） */}
              <details className="soul-editorial-form-section text-sm text-[var(--text-tertiary)]">
                <summary className="cursor-pointer py-1 hover:text-[var(--text-secondary)] transition-colors">精确时间（可选）</summary>
                <div className="flex items-center gap-2 mt-3">
                  <span>分钟：</span>
                  <select value={minute} onChange={e=>setMinute(e.target.value)}
                    className="input-jade soul-editorial-field px-3">
                    {MINUTES.map(m=><option key={m} value={m}>{m}分</option>)}
                  </select>
                  <span className="ml-auto">时区：{city ? detectedTz : '选择城市后自动匹配'}</span>
                </div>
              </details>

              {/* CTA */}
              <button onClick={submit} disabled={!quickFilled||loading}
                className="soul-editorial-button w-full mt-8">
                {loading ? '⌛ 正在排盘中...' : '✦ 免费排盘，查看我的出厂配置'}
              </button>
              <p className="text-xs text-[var(--text-tertiary)] text-center mt-4 md:hidden">
                🔒 出生信息仅用于排盘，绝不外泄
              </p>
              {error && !loading && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
            </div>
          </div>
        )}

        {/* ── R2: 免费排盘骨架结果 ── */}
        {showSkeleton && (
          <div className="max-w-lg mx-auto mb-8">
            {data.hd && (
              <div className="card-jade p-6 text-center mb-6">
                <div className="text-sm text-[var(--text-tertiary)] mb-2">您的出厂配置预览</div>
                <div className="print-hidden mb-4">
                  <BodygraphSVG definedCenters={data.hd.definedCenters||[]} activatedGates={data.hd.activatedGates||[]} channels={data.hd.channels||[]} centerDefinition={{}} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-accent)] mb-1">
                  {data.hd.type}
                </h3>
                <p className="text-base text-[var(--text-secondary)] mb-1">
                  人生角色 {data.hd.profile} · {data.hd.authority}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-3">
                  这只是人类图系统的冰山一角——您的完整报告涵盖 7 大古老智慧系统，含深度图文解读。
                </p>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                这只是您 7 个系统中的 <strong>1 个的 1/10</strong>
              </p>
              <button onClick={() => setShowFullReport(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--text-accent)] to-emerald-500 text-white font-semibold text-base hover:shadow-lg transition-all transform hover:scale-105">
                📖 领取完整报告（深度图文版）→
              </button>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">八字 · 人类图 · 占星 · 紫微斗数 · 五运六气 · MBTI · 中医体质</p>
            </div>
          </div>
        )}

        {/* ── 完整报告区域 ── */}
        {showFullReport && (
          <>
            {/* 打印封面页 */}
            <div className="print-only" style={{pageBreakAfter:'always'}}>
              <div style={{textAlign:'center', paddingTop:'6cm'}}>
                <h1 style={{fontSize:'28pt', color:'#2d5a4f', marginBottom:'1cm'}}>
                  灵魂解码 · 人生总览报告
                </h1>
                <p style={{fontSize:'10pt', color:'#999', marginBottom:'2cm'}}>
                  八字 · 人类图 · 占星 · 紫微斗数 · 五运六气 · MBTI · 中医体质
                </p>
                <p style={{fontSize:'9pt', color:'#aaa', marginTop:'3cm'}}>
                  生成日期：{new Date().toLocaleDateString('zh-CN')}
                </p>
                <p style={{fontSize:'8pt', color:'#ccc', marginTop:'1cm'}}>
                  命理是地图不是判决书，七分天性三分环境
                </p>
              </div>
            </div>
            {/* Charts */}
            {data && (
              <div className="soul-chart-atlas-grid mb-10">
                {data.hd && (
                  <section className="soul-chart-card soul-chart-card--primary">
                    <div className="soul-chart-card-heading">
                      <div><p className="soul-chart-kicker">01 · BODYGRAPH</p><h3>人类图</h3></div>
                      <span>九大中心</span>
                    </div>
                    <div className="print-hidden">
                      <BodygraphSVG definedCenters={data.hd.definedCenters||[]} activatedGates={data.hd.activatedGates||[]} channels={data.hd.channels||[]} centerDefinition={{}} />
                    </div>
                    <div className="print-only">
                      <BodygraphSVG print={true} definedCenters={data.hd.definedCenters||[]} activatedGates={data.hd.activatedGates||[]} channels={data.hd.channels||[]} centerDefinition={{}} />
                    </div>
                    <div className="soul-chart-summary-grid">
                      {[
                        ['类型', data.hd.type], ['策略', data.hd.strategy], ['内在权威', data.hd.authority],
                        ['人生角色', data.hd.profile], ['定义', data.hd.definition],
                      ].filter(([, value]) => value).map(([label, value]) => (
                        <div key={label} className="soul-chart-summary-item"><span>{label}</span><strong>{value}</strong></div>
                      ))}
                    </div>
                  </section>
                )}
                {data.bazi && (
                  <section className="soul-chart-card soul-chart-card--primary">
                    <div className="soul-chart-card-heading">
                      <div><p className="soul-chart-kicker">02 · FOUR PILLARS</p><h3>八字四柱</h3></div>
                      <span>日主 · 五行</span>
                    </div>
                    <BaziChart
                      pillars={data.bazi.pillars || []}
                      dayMaster={data.bazi.dayMaster || ''}
                      elements={data.bazi.ganElements || []}
                      elementDistribution={data.bazi.elementDistribution || {}}
                    />
                  </section>
                )}
                {data.ziwei && (
                  <section className="soul-chart-card soul-chart-card--secondary">
                    <div className="soul-chart-card-heading">
                      <div><p className="soul-chart-kicker">03 · TWELVE PALACES</p><h3>紫微斗数</h3></div>
                      <span>命宫图谱</span>
                    </div>
                    <ZiWeiChart palaces={data.ziwei.palaces||[]} horoscope={data.ziwei.horoscope||null} />
                  </section>
                )}
                {data.wuyun && (
                  <section className="soul-chart-card soul-chart-card--secondary soul-wuyun-card">
                    <div className="soul-chart-card-heading">
                      <div><p className="soul-chart-kicker">04 · SEASONAL RHYTHM</p><h3>五运六气</h3></div>
                      <span>出生节律</span>
                    </div>
                    <div className="soul-wuyun-orbit" aria-hidden="true"><span /><i /><b /></div>
                    <div className="soul-wuyun-values">
                      <div><span>出生年运</span><strong>{data.wuyun.wuyun || '—'}</strong></div>
                      <div><span>出生气化</span><strong>{data.wuyun.liuqi || '—'}</strong></div>
                    </div>
                    <p className="soul-wuyun-note">以出生年份对应的运气信息作为报告中的节律观察入口。</p>
                  </section>
                )}
              </div>
            )}

            {/* Report */}
            {report && (
              <>
              <div className="card-jade p-6 md:p-8 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold">📜 人生总览报告</h2>
                  <div className="flex gap-2">
                    <VoiceReader text={report} title="🔊 听报告" />
                    <button onClick={async ()=>{
                      const btn = document.activeElement as HTMLButtonElement;
                      const origText = btn.textContent;
                      try {
                        btn.textContent = '⏳ 生成中...';
                        btn.disabled = true;
                        // 构建完整 HTML：提取当前页面 DOM + 内联样式
                        const clone = document.documentElement.cloneNode(true) as HTMLElement;
                        // 移除所有 script 标签
                        clone.querySelectorAll('script').forEach(s => s.remove());
                        // 移除不需要的元素
                        clone.querySelectorAll('.no-print, nav, .voice-reader-btn').forEach(el => el.remove());
                        // page.setContent() 使用 about:blank，必须把页面资源改成绝对地址，
                        // 否则本地字体和样式会加载失败，中文在 PDF 中会变成空白方框。
                        const head = clone.querySelector('head');
                        if (head) {
                          const base = document.createElement('base');
                          base.href = `${window.location.origin}/`;
                          head.prepend(base);
                        }
                        clone.querySelectorAll<HTMLLinkElement>('link[href]').forEach((link) => {
                          const href = link.getAttribute('href');
                          if (href) link.setAttribute('href', new URL(href, window.location.href).href);
                        });
                        if (!clone.querySelector('meta[charset]') && head) {
                          const charset = document.createElement('meta');
                          charset.setAttribute('charset', 'utf-8');
                          head.prepend(charset);
                        }
                        // 将样式表内联到 PDF 文档，并把其中的字体/图片 URL 改成绝对地址。
                        // 这样 Puppeteer 在 about:blank 中也能完整保留内页排版。
                        const stylesheetLinks = Array.from(
                          clone.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')
                        );
                        await Promise.all(stylesheetLinks.map(async (link) => {
                          const href = link.getAttribute('href');
                          if (!href) return;
                          const absoluteHref = new URL(href, window.location.href).href;
                          try {
                            const cssResponse = await fetch(absoluteHref);
                            if (!cssResponse.ok) return;
                            const cssText = await cssResponse.text();
                            const inlinedCss = cssText.replace(/url\(([^)]+)\)/g, (match, rawValue) => {
                              const raw = String(rawValue).trim();
                              const quote = raw.startsWith('"') || raw.startsWith("'") ? raw[0] : '';
                              const value = quote ? raw.slice(1, -1) : raw;
                              if (/^(data:|https?:|blob:|#)/i.test(value)) return match;
                              return `url("${new URL(value, absoluteHref).href}")`;
                            });
                            const style = document.createElement('style');
                            style.textContent = inlinedCss;
                            link.replaceWith(style);
                          } catch {
                            // 保留绝对地址的 link 作为回退，避免单个样式表阻断 PDF。
                          }
                        }));
                        const html = '<!DOCTYPE html>' + clone.outerHTML;
                        const resp = await fetch('/api/pdf', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ html }),
                        });
                        if (!resp.ok) {
                          const err = await resp.json().catch(() => ({ message: `HTTP ${resp.status}` }));
                          alert('PDF 生成失败: ' + (err.message || err.error || '未知错误'));
                          return;
                        }
                        const blob = await resp.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `人生总览_${year||'report'}.pdf`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch(e: any) {
                        alert('PDF 生成异常: ' + (e.message || '网络错误'));
                      } finally {
                        btn.textContent = origText;
                        btn.disabled = false;
                      }
                    }}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-all">
                      📥 下载PDF
                    </button>
                    <button onClick={()=>{
                      const b=new Blob([report],{type:'text/plain;charset=utf-8'});
                      const a=document.createElement('a');
                      a.href=URL.createObjectURL(b);
                      a.download=`人生总览_${year||''}.txt`;
                      a.click();
                    }}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-all">
                      📄 下载TXT
                    </button>
                  </div>
                </div>
                <div className="report-content prose prose-sm md:prose-base max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: reportHtml }} />
              </div>

              {/* ── R4: 下一步 CTA ── */}
              <div className="card-jade p-6 md:p-8 text-center">
                <div className="text-3xl mb-3">{NEXT_STEPS.fullReport.emoji}</div>
                <h3 className="text-lg font-bold mb-2">{NEXT_STEPS.fullReport.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-lg mx-auto">
                  {NEXT_STEPS.fullReport.desc}
                </p>
                <a href={NEXT_STEPS.fullReport.href}
                  className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--text-accent)] to-emerald-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                  {NEXT_STEPS.fullReport.btn}
                </a>
              </div>
              </>
            )}
          </>
        )}

        {/* ── 我的报告（历史记录） ── */}
        {savedReports.length > 0 && (
          <div className="card-jade p-4 md:p-5 mb-8 max-w-lg mx-auto">
            <button onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors">
              <span>📋 我的报告 ({savedReports.length})</span>
              <span className="text-xs opacity-60">{showHistory ? '▲ 收起' : '▼ 展开'}</span>
            </button>
            {showHistory && (
              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                {savedReports.map((r: any) => (
                  <div key={r.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-highlight)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer group"
                    onClick={() => { setReport(r.report); setData(r.data); setShowQuickInput(false); setShowFullReport(true); setShowHistory(false); }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">{r.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                        {r.year}年{r.month}月{r.day}日 · {new Date(r.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      const updated = savedReports.filter((x: any) => x.id !== r.id);
                      setSavedReports(updated);
                      try { localStorage.setItem('master_report_history', JSON.stringify(updated)); } catch {}
                    }}
                      className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition-all">
                      ✕ 删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
