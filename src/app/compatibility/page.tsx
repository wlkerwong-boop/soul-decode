'use client';
import { useState, useMemo } from 'react';
import { CHINA_CITIES, INTERNATIONAL_CITIES } from '@/data/cities';

const YEARS = Array.from({length:121},(_,i)=>2026-i);
const MONTHS = Array.from({length:12},(_,i)=>i+1);
const DAYS = Array.from({length:31},(_,i)=>i+1);
const HOURS = Array.from({length:24},(_,i)=>i);
const MINUTES = [0,15,30,45];

const continents = Object.keys(INTERNATIONAL_CITIES);

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
    <div className="space-y-3 p-4 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-color)]">
      <h3 className="text-sm font-bold text-[var(--text-accent)]">{label}</h3>
      <div className="grid grid-cols-5 gap-1.5">
        <Sel value={data[pfx+'_year']} set={v=>setData(pfx+'_year',v)} opts={YEARS} ph="年份" />
        <Sel value={data[pfx+'_month']} set={v=>setData(pfx+'_month',v)} opts={MONTHS} ph="月" />
        <Sel value={data[pfx+'_day']} set={v=>setData(pfx+'_day',v)} opts={DAYS} ph="日" />
        <Sel value={data[pfx+'_hour']} set={v=>setData(pfx+'_hour',v)} opts={HOURS} ph="时" />
        <Sel value={data[pfx+'_minute']} set={v=>setData(pfx+'_minute',v)} opts={MINUTES} ph="分" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
        <Sel value={continent} set={v=>{setData(pfx+'_continent',v);setData(pfx+'_country','');setData(pfx+'_province','');setData(pfx+'_city','');}} opts={continents} ph="大洲" cls="input-jade text-sm py-2" />
        {continent ? <Sel value={country} set={v=>{setData(pfx+'_country',v);setData(pfx+'_province','');setData(pfx+'_city','');}} opts={continentCountries} ph="国家" cls="input-jade text-sm py-2" /> : <div />}
        {isChina && country ? <Sel value={province} set={v=>{setData(pfx+'_province',v);setData(pfx+'_city','');}} opts={provinces} ph="省份" cls="input-jade text-sm py-2" /> : (country && !isChina) ? <Sel value={city} set={v=>setData(pfx+'_city',v)} opts={cities} ph="城市" cls="input-jade text-sm py-2" /> : <div />}
        {isChina && province ? <Sel value={city} set={v=>setData(pfx+'_city',v)} opts={cities} ph="城市" cls="input-jade text-sm py-2" /> : <div />}
      </div>
      <div className="flex gap-2">
        {['男','女'].map(g => (
          <button key={g} onClick={()=>setData(pfx+'_gender',g)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${gender===g ? 'bg-[var(--text-accent)] text-white shadow-md' : 'bg-[var(--bg-highlight)] text-[var(--text-secondary)] hover:bg-opacity-80'}`}>
            {g==='男'?'👨 男':'👩 女'}
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setData = (k: string, v: string) => setForm(prev => ({...prev, [k]: v}));

  const canSubmit = (pfx: string) => form[pfx+'_year'] && form[pfx+'_month'] && form[pfx+'_day'] && form[pfx+'_city'];

  const submit = async () => {
    setLoading(true); setError(''); setReport('');
    const persons = type === 'couple' ? ['a','b'] : type === 'friend' ? ['a','b'] : ['m','p'];
    const data = persons.map(pfx => ({
      year: form[pfx+'_year'], month: form[pfx+'_month'], day: form[pfx+'_day'],
      hour: form[pfx+'_hour']||'12', minute: form[pfx+'_minute']||'0',
      gender: form[pfx+'_gender']||'男',
    }));
    try {
      const r = await fetch('/api/compatibility', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ personA: data[0], personB: data[1] }),
      });
      if (!r.ok) { setError('生成失败 ('+r.status+')'); return; }
      const reader = r.body?.getReader();
      if (!reader) { setError('无法读取响应'); return; }
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const txt = dec.decode(value, {stream:true});
        const lines = txt.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const d = JSON.parse(line.slice(6));
            if (d.done) break;
            if (d.content) setReport(prev => prev + d.content);
          } catch {}
        }
      }
    } catch (e: any) { setError(e.message||'网络错误'); }
    setLoading(false);
  };

  return (
    <div className="gradient-bg min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">💞 <span className="gradient-text">关系合盘</span></h1>
          <p className="text-sm text-[var(--text-secondary)]">八字合婚·人类图合盘·占星比较盘</p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[
            {v:'couple',l:'💑 情侣合盘'},
            {v:'family',l:'👨‍👩‍👧‍👦 家庭合盘'},
            {v:'friend',l:'🤝 朋友合盘'},
          ].map(t=>(
            <button key={t.v} onClick={()=>setType(t.v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${type===t.v ? 'bg-gradient-to-r from-[var(--text-accent)] to-emerald-500 text-white shadow-md' : 'bg-[var(--bg-highlight)] text-[var(--text-secondary)] border border-[var(--border-color)]'}`}>
              {t.l}
            </button>
          ))}
        </div>

        <div className="card-jade p-6 space-y-4">
          {type === 'couple' && (
            <><PersonForm label="你" pfx="a" data={form} setData={setData} /><PersonForm label="对方" pfx="b" data={form} setData={setData} /></>
          )}
          {type === 'family' && (
            <div className="space-y-3">
              <PersonForm label="本人" pfx="m" data={form} setData={setData} />
              <PersonForm label="伴侣" pfx="p" data={form} setData={setData} />
              <div className="p-4 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-color)] border-dashed text-center text-sm text-[var(--text-secondary)]">
                + 添加孩子（最多5人）
              </div>
            </div>
          )}
          {type === 'friend' && (
            <><PersonForm label="你" pfx="a" data={form} setData={setData} /><PersonForm label="朋友" pfx="b" data={form} setData={setData} /></>
          )}

          <button onClick={submit} disabled={loading||!(canSubmit('a')||canSubmit('m'))}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--text-accent)] to-emerald-500 text-white font-bold text-base hover:shadow-lg transition-all disabled:opacity-40">
            {loading ? '⌛ 正在合盘...' : '✦ 生成合盘报告'}
          </button>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>

        {report && (
          <div className="card-jade p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">📜 合盘解读</h2>
            <div className="prose prose-sm md:prose-base prose-invert whitespace-pre-wrap leading-relaxed">
              {report.split('\n').map((line, i) => (<p key={i} className="mb-3">{line || '\u00A0'}</p>))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
