'use client';

import { useState, useMemo } from 'react';
import VoiceReader from '@/components/VoiceReader';
import BodygraphSVG from '@/components/BodygraphSVG';
import BaziChart from '@/components/BaziChart';
import ZiWeiChart from '@/components/ZiWeiChart';
import { CHINA_CITIES, INTERNATIONAL_CITIES, CITY_TZ } from '@/data/cities';

const YEARS = Array.from({length:121},(_,i)=>2026-i);
const MONTHS = Array.from({length:12},(_,i)=>i+1);
const DAYS = Array.from({length:31},(_,i)=>i+1);
const HOURS = Array.from({length:24},(_,i)=>i);
const MINUTES = [0,15,30,45];

export default function MasterPage() {
  const [year, setYear] = useState(''); const [month, setMonth] = useState('');
  const [day, setDay] = useState(''); const [hour, setHour] = useState(''); const [minute, setMinute] = useState('0');
  const [continent, setContinent] = useState(''); const [country, setCountry] = useState('');
  const [province, setProvince] = useState(''); const [city, setCity] = useState('');
  const [gender, setGender] = useState('男');
  const [report, setReport] = useState(''); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); const [data, setData] = useState<any>(null);

  // Cascading location: continent → country → province(China only) → city
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

  // Auto-detect timezone from city
  const detectedTz = useMemo(() => {
    if (city && CITY_TZ[city]) return CITY_TZ[city];
    return 'Asia/Shanghai';
  }, [city]);

  const submit = async () => {
    setLoading(true); setError(''); setReport(''); setData(null);
    const loc = isChina ? province : country;
    try {
      const r = await fetch('/api/master-report', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({year, month, day, hour, minute, location:loc, gender, timezone:detectedTz}),
      });
      const d = await r.json();
      if (!d.success) { setError(d.error||'生成失败'); return; }
      setReport(d.report); setData(d.data);
    } catch (e: any) { setError(e.message||'网络错误'); }
    setLoading(false);
  };

  const Btn = ({v,cur,set,label}:{v:string,cur:string,set:(s:string)=>void,label:string}) => (
    <button onClick={()=>set(v)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${cur===v ? 'bg-[var(--text-accent)] text-white shadow-md' : 'bg-[var(--bg-highlight)] text-[var(--text-secondary)] hover:bg-opacity-80'}`}>{label}</button>
  );

  const Sel = ({v,set,opts,placeholder}:{v:string,set:(s:string)=>void,opts:any[],placeholder:string}) => (
    <select value={v} onChange={e=>set(e.target.value)} className="input-jade text-lg py-3 font-medium">
      <option value="">{placeholder}</option>
      {opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="gradient-bg min-h-screen px-4 py-6 md:py-10">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight leading-tight">✦ <span className="gradient-text">人生总览</span></h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)]">一次输入 · 七大系统交叉融合</p>
          <p className="text-sm text-[var(--text-secondary)] opacity-70">八字·人类图·占星·紫微斗数·五运六气·流年·人生规划</p>
        </div>

        <div className="card-jade p-6 md:p-8 mb-8">
          <div className="space-y-5">

            {/* Date */}
            <div>
              <label className="block text-base font-bold mb-2 text-[var(--text-secondary)]">出生日期</label>
              <div className="grid grid-cols-5 gap-2">
                <Sel v={year} set={setYear} opts={YEARS} placeholder="年份" />
                <Sel v={month} set={setMonth} opts={MONTHS} placeholder="月份" />
                <Sel v={day} set={setDay} opts={DAYS} placeholder="日期" />
                <Sel v={hour} set={setHour} opts={HOURS} placeholder="时" />
                <Sel v={minute} set={setMinute} opts={MINUTES} placeholder="分" />
              </div>
            </div>

            {/* Location - Cascading: 大洲 → 国家 → 省份(仅中国) → 城市 */}
            <div>
              <label className="block text-base font-bold mb-2 text-[var(--text-secondary)]">出生地</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Sel v={continent} set={(s:string)=>{setContinent(s);setCountry('');setProvince('');setCity('');}} opts={continents} placeholder="大洲" />
                {continent ? (
                  <Sel v={country} set={(s:string)=>{setCountry(s);setProvince('');setCity('');}} opts={continentCountries} placeholder="国家" />
                ) : <div />}
                {isChina && country ? (
                  <Sel v={province} set={(s:string)=>{setProvince(s);setCity('');}} opts={provinces} placeholder="省份" />
                ) : country && !isChina ? (
                  <Sel v={city} set={setCity} opts={cities} placeholder="城市" />
                ) : <div />}
                {isChina && province ? (
                  <Sel v={city} set={setCity} opts={cities} placeholder="城市" />
                ) : <div />}
              </div>
            </div>

            {/* Timezone - auto detected */}
            <div>
              <label className="block text-base font-bold mb-2 text-[var(--text-secondary)]">时区</label>
              <div className="px-3 py-2 rounded-lg bg-[var(--bg-highlight)] text-sm text-[var(--text-secondary)]">
                {city ? `自动检测：${detectedTz}` : '选择城市后自动匹配'}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">海外出生：人类图用当地时间，八字/紫微自动换算北京时间</p>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-base font-bold mb-2 text-[var(--text-secondary)]">性别</label>
              <div className="flex gap-3">
                <Btn v="男" cur={gender} set={setGender} label="👨 男" />
                <Btn v="女" cur={gender} set={setGender} label="👩 女" />
              </div>
            </div>

            <button onClick={submit} disabled={loading||!year||!month||!day||!hour||!city}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--text-accent)] to-emerald-500 text-white font-bold text-lg hover:shadow-xl transition-all disabled:opacity-40">
              {loading ? '⌛ 正在为您解读...' : '✦ 生成人生总览报告'}
            </button>
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
          </div>
        </div>

        {/* Charts */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {data.hd && (
              <div className="card-jade p-5">
                <h3 className="text-base font-bold text-[var(--text-accent)] mb-3">🧬 人类图</h3>
                <BodygraphSVG definedCenters={data.hd.definedCenters||[]} activatedGates={data.hd.activatedGates||[]} channels={data.hd.channels||[]} centerDefinition={{}} />
                <p className="text-sm text-[var(--text-secondary)] mt-3 text-center">{data.hd.type} · {data.hd.profile} · {data.hd.authority}</p>
              </div>
            )}
            {data.bazi && (
              <div className="card-jade p-5">
                <h3 className="text-base font-bold text-[var(--text-accent)] mb-3">🀄 八字四柱</h3>
                <BaziChart pillars={data.bazi.pillars||[]} dayMaster={data.bazi.dayMaster||''} elements={['金','金','金','火']}/>
              </div>
            )}
            {data.ziwei && (
              <div className="card-jade p-5">
                <h3 className="text-base font-bold text-[var(--text-accent)] mb-3">⭐ 紫微斗数</h3>
                <ZiWeiChart palaces={data.ziwei.palaces||[]} />
              </div>
            )}
            {data.wuyun && (
              <div className="card-jade p-5">
                <h3 className="text-base font-bold text-[var(--text-accent)] mb-3">🌊 五运六气</h3>
                <div className="text-sm text-[var(--text-secondary)] space-y-2">
                  <p>出生年运：{data.wuyun.stem}年 → {data.wuyun.wuyun}</p>
                  <p>出生气化：{data.wuyun.branch}年 → {data.wuyun.liuqi}</p>
                </div>
              </div>
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
                <button onClick={()=>window.print()}
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
            <div className="prose prose-sm md:prose-base prose-invert whitespace-pre-wrap leading-relaxed">
              {report.split('\n').map((line, i) => (<p key={i} className="mb-3">{line || '\u00A0'}</p>))}
            </div>
          </div>

          {/* Compatibility Suggestion */}
          <div className="card-jade p-6 md:p-8 text-center">
            <div className="text-3xl mb-3">💞</div>
            <h3 className="text-lg font-bold mb-2">想了解你与他人的关系？</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-lg mx-auto">
              两个人的相遇不是偶然。八字合婚、人类图合盘、占星比较盘——<br/>
              看看你们在哪些方面天生契合，哪些领域需要经营。
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <a href="/compatibility" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--text-accent)] to-emerald-500 text-white font-medium hover:shadow-lg transition-all">
                💑 情侣合盘
              </a>
              <a href="/compatibility" className="px-5 py-2.5 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-all">
                👨‍👩‍👧‍👦 家庭合盘
              </a>
              <a href="/compatibility" className="px-5 py-2.5 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-all">
                🤝 朋友合盘
              </a>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
