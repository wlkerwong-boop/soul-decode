'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { CHINA_CITIES, INTERNATIONAL_CITIES } from '@/data/cities';
import { buildCompatibilityPersonPayload, consumeSseChunk } from '@/lib/compatibility-depth';
import ReportWaiting from '@/components/ReportWaiting';
import { marked } from 'marked';

const YEARS = Array.from({length:121},(_,i)=>2026-i);
const MONTHS = Array.from({length:12},(_,i)=>i+1);
const DAYS = Array.from({length:31},(_,i)=>i+1);
const HOURS = Array.from({length:24},(_,i)=>i);
const MINUTES = [0,15,30,45];

const continents = Object.keys(INTERNATIONAL_CITIES);

const REPORT_TITLES: Record<string, string> = {
  couple: '情侣合盘报告',
  family: '家庭合盘报告',
  friend: '朋友合盘报告',
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character));
}

function PersonForm({ label, pfx, data, setData }: {
  label: string; pfx: string;
  data: Record<string,string>;
  setData: (k:string,v:string) => void;
}) {
  const continent = data[pfx+'_continent'] || '';
  const country = data[pfx+'_country'] || '';
  const province = data[pfx+'_province'] || '';
  const city = data[pfx+'_city'] || '';
  const gender = data[pfx+'_gender'] || '男';
  const isChina = country === '中国';

  const continentCountries = useMemo(() =>
    continent ? Object.keys(INTERNATIONAL_CITIES[continent]||{}) : [], [continent]);
  const provinces = useMemo(() => isChina ? Object.keys(CHINA_CITIES) : [], [isChina]);
  const cities = useMemo(() => {
    if (!country) return [];
    if (isChina && province) return CHINA_CITIES[province]||[];
    if (!isChina && continent && country) return INTERNATIONAL_CITIES[continent]?.[country]||[];
    return [];
  }, [country, continent, isChina, province]);

  const Sel = ({value, set, opts, ph, cls}:{value:string, set:(v:string)=>void, opts:any[], ph:string, cls?:string}) => (
    <select value={value} onChange={e=>set(e.target.value)} className={cls || "input-jade text-sm py-2"}>
      <option value="">{ph}</option>
      {opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="soul-editorial-person">
      <h3 className="soul-editorial-person-title">{label}</h3>
      <div className="soul-editorial-person-grid grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Sel value={data[pfx+'_year']} set={v=>setData(pfx+'_year',v)} opts={YEARS} ph="年份" />
        <Sel value={data[pfx+'_month']} set={v=>setData(pfx+'_month',v)} opts={MONTHS} ph="月" />
        <Sel value={data[pfx+'_day']} set={v=>setData(pfx+'_day',v)} opts={DAYS} ph="日" />
        <Sel value={data[pfx+'_hour']} set={v=>setData(pfx+'_hour',v)} opts={HOURS} ph="时" />
        <Sel value={data[pfx+'_minute']} set={v=>setData(pfx+'_minute',v)} opts={MINUTES} ph="分" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        <Sel value={continent} set={v=>{setData(pfx+'_continent',v);setData(pfx+'_country','');setData(pfx+'_province','');setData(pfx+'_city','');}} opts={continents} ph="大洲" cls="input-jade text-sm py-2" />
        {continent ? <Sel value={country} set={v=>{setData(pfx+'_country',v);setData(pfx+'_province','');setData(pfx+'_city','');}} opts={continentCountries} ph="国家" cls="input-jade text-sm py-2" /> : <div />}
        {isChina && country ? <Sel value={province} set={v=>{setData(pfx+'_province',v);setData(pfx+'_city','');}} opts={provinces} ph="省份" cls="input-jade text-sm py-2" /> : (country && !isChina) ? <Sel value={city} set={v=>setData(pfx+'_city',v)} opts={cities} ph="城市" cls="input-jade text-sm py-2" /> : <div />}
        {isChina && province ? <Sel value={city} set={v=>setData(pfx+'_city',v)} opts={cities} ph="城市" cls="input-jade text-sm py-2" /> : <div />}
      </div>
      <div className="soul-editorial-person-actions">
        {['男','女'].map(g => (
          <button key={g} onClick={()=>setData(pfx+'_gender',g)}
            className="soul-editorial-gender"
            data-active={gender===g}>
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HepanPage() {
  const [type, setType] = useState('couple');
  const [form, setForm] = useState<Record<string,string>>({});
  const [report, setReport] = useState('');
  const [visibleChapters, setVisibleChapters] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [childrenCount, setChildrenCount] = useState(0);

  // ── 等待体验 ──
  const [isStreaming, setIsStreaming] = useState(false);
  // 注：任何时刻只渲染前 visibleChapters 章（生成中也不自动展开全部），
  // 避免旧内核（微信X5/安卓自带浏览器）2万字 DOM 布局卡死触发 reload/back。
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading, startTime]);

  useEffect(() => {
    if (!loading && !isStreaming && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [loading, isStreaming]);

  const charCount = report.length;

  const setData = (k: string, v: string) => setForm(prev => ({...prev, [k]: v}));

  const canSubmit = (pfx: string) => Boolean(form[pfx+'_year'] && form[pfx+'_month'] && form[pfx+'_day'] && form[pfx+'_city']);
  const requiredPrefixes = type === 'family'
    ? ['m', 'p', ...Array.from({ length: childrenCount }, (_, i) => `c${i}`)]
    : ['a', 'b'];
  const canGenerate = !loading && (type !== 'family' || childrenCount > 0) && requiredPrefixes.every(canSubmit);
  const reportTitle = REPORT_TITLES[type] || '合盘报告';

  const submit = async () => {
    if (!canGenerate) {
      setError(type === 'family' && childrenCount === 0 ? '家庭合盘至少需要添加一位孩子' : '请完整填写参与者的出生年月日和出生城市');
      return;
    }
    setLoading(true); setError(''); setReport('');
    setIsStreaming(false); setStartTime(Date.now()); setElapsedSeconds(0);

    const persons: any[] = [];

    if (type === 'couple') {
      persons.push(prefixData('a'), prefixData('b'));
    } else if (type === 'friend') {
      persons.push(prefixData('a'), prefixData('b'));
    } else if (type === 'family') {
      persons.push(prefixData('m'));
      persons.push(prefixData('p'));
      for (let i = 0; i < childrenCount; i++) {
        persons.push(prefixData('c'+i));
      }
    }

    function prefixData(pfx: string) {
      return buildCompatibilityPersonPayload(form, pfx);
    }

    try {
      const r = await fetch('/api/compatibility', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ persons, type }),
      });
      if (!r.ok) { setError('生成失败 ('+r.status+')'); setLoading(false); return; }
      const reader = r.body?.getReader();
      if (!reader) { setError('无法读取响应'); setLoading(false); return; }
      const dec = new TextDecoder();
      let sseBuffer = '';
      let isFirstChunk = true;
      let streamError = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const parsed = consumeSseChunk(sseBuffer, dec.decode(value, { stream: true }));
        sseBuffer = parsed.buffer;
        if (parsed.contents.length) {
          if (isFirstChunk) { setLoading(false); setIsStreaming(true); isFirstChunk = false; }
          setReport(previous => previous + parsed.contents.join(''));
        }
        if (parsed.error) {
          streamError = parsed.error;
          setError(parsed.error);
          setReport('');
          setLoading(false);
          setIsStreaming(false);
          break;
        }
        if (parsed.done) { setLoading(false); setIsStreaming(false); break; }
      }
      if (streamError) return;
    } catch (e: any) { setError(e.message||'网络错误'); setLoading(false); setIsStreaming(false); }
    setLoading(false); setIsStreaming(false);
  };

  const handleRetry = useCallback(() => { submit(); }, [type, form, childrenCount]);

  return (
    <div className="inner-page soul-editorial-page min-h-screen px-4 py-8 pt-nav">
      <div className="soul-editorial-shell">
        <div className="soul-editorial-header">
          <p className="soul-editorial-eyebrow">Relationship Reading</p>
          <h1 className="soul-editorial-title"><span className="gradient-text">关系合盘</span></h1>
          <p className="soul-editorial-lead">八字合婚 · 人类图合盘 · 占星比较盘</p>
        </div>

        <div className="soul-editorial-tabs soul-editorial-tabs--three max-w-xl mx-auto mb-8">
          {[
            {v:'couple',l:'情侣合盘'},
            {v:'family',l:'家庭合盘'},
            {v:'friend',l:'朋友合盘'},
          ].map(t=>(
            <button key={t.v} onClick={()=>{ setType(t.v); setReport(''); setError(''); setVisibleChapters(3); }}
              className="soul-editorial-tab"
              data-active={type===t.v}>
              {t.l}
            </button>
          ))}
        </div>

        <div className="soul-editorial-form space-y-6 max-w-4xl mx-auto">
          {type === 'couple' && (
            <><PersonForm label="您" pfx="a" data={form} setData={setData} /><PersonForm label="对方" pfx="b" data={form} setData={setData} /></>
          )}
          {type === 'family' && (
            <div className="space-y-3">
              <PersonForm label="本人" pfx="m" data={form} setData={setData} />
              <PersonForm label="伴侣" pfx="p" data={form} setData={setData} />
              {Array.from({length: childrenCount}).map((_, i) => (
                <PersonForm key={i} label={`孩子 ${i+1}`} pfx={`c${i}`} data={form} setData={setData} />
              ))}
              <div className="flex items-center justify-between">
                {childrenCount < 5 ? (
                  <button onClick={() => setChildrenCount(c => c+1)}
                    className="px-4 py-2 rounded-xl border border-dashed border-[var(--text-accent)]/40 text-sm text-[var(--text-accent)] hover:bg-[var(--text-accent)]/5 transition-all">
                    ＋ 添加孩子 ({childrenCount}/5)
                  </button>
                ) : (
                  <span className="text-xs text-[var(--text-secondary)]">已添加 5 个孩子（上限）</span>
                )}
                {childrenCount > 0 && (
                  <button onClick={() => setChildrenCount(c => c-1)}
                    className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                    移除最后一个
                  </button>
                )}
              </div>
            </div>
          )}
          {type === 'friend' && (
            <><PersonForm label="您" pfx="a" data={form} setData={setData} /><PersonForm label="朋友" pfx="b" data={form} setData={setData} /></>
          )}

          <button onClick={submit} disabled={!canGenerate}
            title={type==='family'&&childrenCount===0?'请先添加至少一个孩子':undefined}
            className="soul-editorial-button w-full mt-2">
            {loading ? '⌛ 正在合盘...' : '✦ 生成合盘报告'}
          </button>
          {error && !loading && !isStreaming && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>

        {/* ── 等待页（loading=true 时覆盖）── */}
        {loading && (
          <div className="mt-6">
            <ReportWaiting
              type="compatibility"
              isStreaming={false}
              elapsedSeconds={elapsedSeconds}
              charCount={0}
              error={error}
              onRetry={handleRetry}
            />
          </div>
        )}

        {/* ── 流式进度条（isStreaming 时顶部细条）── */}
        {isStreaming && report && (
          <div className="mt-6">
            <ReportWaiting
              type="compatibility"
              isStreaming={true}
              elapsedSeconds={elapsedSeconds}
              charCount={charCount}
              error={error}
              onRetry={handleRetry}
            />
          </div>
        )}

        {report && (
          <div className="soul-editorial-surface p-6 md:p-8 mt-10 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <p className="soul-editorial-section-label">Reading</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => {
                  const toPlain = (md: string) => md
                    .replace(/^#{1,4}\s+/gm, '')
                    .replace(/\*\*([^*]+)\*\*/g, '$1')
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                    .replace(/`([^`]+)`/g, '$1')
                    .replace(/^\s*\|[-:|\s]+\|\s*$/gm, '')
                    .replace(/^\s*\|/gm, '')
                    .replace(/\|\s*$/gm, '')
                    .replace(/\n{3,}/g, '\n\n');
                  const b = new Blob([toPlain(report)], { type: 'text/plain;charset=utf-8' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(b);
                  a.download = `${reportTitle}.txt`;
                  a.click();
                }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-all">
                  📄 下载TXT
                </button>
                <button onClick={async () => {
                  const btn = document.activeElement as HTMLButtonElement;
                  const origText = btn.textContent;
                  try {
                    btn.textContent = '⏳ 生成中...';
                    btn.disabled = true;
                    const resp = await fetch('/api/word', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ report, meta: { year: '合盘', location: reportTitle, reportTitle, fileStem: reportTitle }, charts: { images: {} } }),
                    });
                    if (!resp.ok) { alert('Word 生成失败'); return; }
                    const blob = await resp.blob();
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `${reportTitle}.docx`;
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
                  } catch (e: any) {
                    alert('Word 生成异常: ' + (e.message || '网络错误'));
                  } finally {
                    btn.textContent = origText;
                    btn.disabled = false;
                  }
                }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-all">
                  📝 下载Word
                </button>
                <button onClick={async () => {
                  const btn = document.activeElement as HTMLButtonElement;
                  const origText = btn.textContent;
                  try {
                    btn.textContent = '⏳ 生成中...';
                    btn.disabled = true;
                    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
                      <link rel="stylesheet" href="/fonts/lxgwwenkai/lxgwwenkai-regular.css">
                      <style>
                        body { font-family: 'LXGW WenKai', serif; color: #2B2620; padding: 24px; line-height: 1.9; }
                        h1 { color: #A8843C; font-size: 22px; border-bottom: 2px solid #E6D9C5; padding-bottom: 8px; }
                        h2 { color: #A8843C; font-size: 17px; margin-top: 24px; }
                        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
                        th { background: #F7F0E4; color: #A8843C; }
                        td, th { border: 1px solid #E6D9C5; padding: 6px 8px; font-size: 12px; }
                        p { margin: 8px 0; }
                      </style></head><body>
                      <h1>${escapeHtml(reportTitle)}</h1>
                      <main>${marked(report, { breaks: true, gfm: true })}</main>
                    </body></html>`;
                    const resp = await fetch('/api/pdf', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ html, filename: reportTitle }),
                    });
                    if (!resp.ok) { alert('PDF 生成失败'); return; }
                    const blob = await resp.blob();
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `${reportTitle}.pdf`;
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
                  } catch (e: any) {
                    alert('PDF 生成异常: ' + (e.message || '网络错误'));
                  } finally {
                    btn.textContent = origText;
                    btn.disabled = false;
                  }
                }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-all">
                  📥 下载PDF
                </button>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-5">合盘解读</h2>
            <div className="prose prose-sm md:prose-base whitespace-pre-wrap leading-relaxed">
              {report.split(/^(?=## )/m).filter((s: string) => s.trim()).slice(0, visibleChapters).map((section, i) => (
                <div key={i} style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}>
                  {section.split('\n').map((line, j) => (<p key={j} className="mb-3">{line || ' '}</p>))}
                </div>
              ))}
              {visibleChapters < report.split(/^(?=## )/m).filter((s: string) => s.trim()).length && (
                <div className="text-center mt-6">
                  <button onClick={() => setVisibleChapters(v => v + 3)}
                    className="px-6 py-2.5 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-all">
                    📖 继续阅读（剩余 {report.split(/^(?=## )/m).filter((s: string) => s.trim()).length - visibleChapters} 章）
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── R4: 下一步 CTA ── */}
        {report && (
          <div className="soul-editorial-surface p-6 md:p-8 mt-6 text-center max-w-4xl mx-auto">
            <div className="text-2xl mb-3">✦</div>
            <h3 className="text-lg font-bold mb-2">见己学园 · 家庭成长助手</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-lg mx-auto">
              即将上线：个性化学习方案、成长图谱追踪、家长课程匹配。三站联动，从看清孩子到陪好孩子。
            </p>
            <span className="inline-flex px-6 py-3 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-color)] text-[var(--text-tertiary)] text-sm cursor-default">
              📩 即将上线，敬请期待
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
