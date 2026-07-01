'use client';

import { useState, useMemo, useEffect } from 'react';
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

  // Restore last report from localStorage on mount (survives refresh)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('last_master_report');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.report && parsed.data) {
          setReport(parsed.report);
          setData(parsed.data);
        }
      }
    } catch {}
  }, []);

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
      // Persist report data so refresh doesn't lose it
      try { localStorage.setItem('last_master_report', JSON.stringify({report:d.report, data:d.data, year, month, day, hour, minute, continent, country, province, city, gender})); } catch {}
    } catch (e: any) { setError(e.message||'网络错误'); }
    finally { setLoading(false); }
  };

  const allFilled = year && month && day && continent && country && city;

  return (
    <div className="gradient-bg min-h-screen px-4 py-6 md:py-10">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight leading-tight">✦ <span className="gradient-text">人生总览</span></h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)]">一次输入 · 七大系统交叉融合</p>
          <p className="text-sm text-[var(--text-secondary)] opacity-70">八字·人类图·占星·紫微斗数·五运六气·流年·人生规划</p>
        </div>

        {/* ── 简洁表单 — 参考人生解码风格 ── */}
        <div className="card-jade p-5 md:p-6 mb-8 max-w-lg mx-auto">
          {/* 性别选择 */}
          <div className="flex gap-2 mb-4">
            {['男','女'].map(g => (
              <button key={g} onClick={()=>setGender(g)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  gender===g ? 'bg-[var(--text-accent)] text-white shadow-md' : 'bg-[var(--bg-highlight)] text-[var(--text-secondary)]'
                }`}>{g}</button>
            ))}
          </div>

          {/* 出生日期 — 响应式网格 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            <select value={year} onChange={e=>setYear(e.target.value)}
              className="col-span-2 input-jade text-sm py-3 px-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
              <option value="">年份</option>
              {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <select value={month} onChange={e=>setMonth(e.target.value)}
              className="input-jade text-sm py-3 px-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
              <option value="">月</option>
              {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
            <select value={day} onChange={e=>setDay(e.target.value)}
              className="input-jade text-sm py-3 px-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
              <option value="">日</option>
              {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <select value={hour} onChange={e=>setHour(e.target.value)}
              className="input-jade text-sm py-3 px-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
              <option value="">时</option>
              {HOURS.map(h=><option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* 出生地 — 逐级级联 */}
          <div className="space-y-2 mb-4">
            <select value={continent} onChange={e=>{setContinent(e.target.value);setCountry('');setProvince('');setCity('');}}
              className="w-full input-jade text-sm py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
              <option value="">选择大洲</option>
              {continents.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            {continent && (
              <select value={country} onChange={e=>{setCountry(e.target.value);setProvince('');setCity('');}}
                className="w-full input-jade text-sm py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
                <option value="">选择国家</option>
                {continentCountries.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            )}
            {isChina && country && (
              <select value={province} onChange={e=>{setProvince(e.target.value);setCity('');}}
                className="w-full input-jade text-sm py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
                <option value="">选择省份</option>
                {provinces.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            )}
            {country && cities.length > 0 && (
              <select value={city} onChange={e=>setCity(e.target.value)}
                className="w-full input-jade text-sm py-3 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
                <option value="">选择城市</option>
                {cities.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>

          {/* 分钟+时区信息 — 始终显示 */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-4">
            <span>分钟：</span>
            <select value={minute} onChange={e=>setMinute(e.target.value)}
              className="input-jade text-xs py-2 px-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
              {MINUTES.map(m=><option key={m} value={m}>{m}分</option>)}
            </select>
            <span className="ml-auto">时区：{city ? detectedTz : '选择城市后自动匹配'}</span>
          </div>

          {/* 提交按钮 */}
          <button onClick={submit} disabled={!allFilled||loading}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
              allFilled&&!loading ? 'bg-[var(--text-accent)] text-white hover:shadow-md' : 'bg-[var(--bg-highlight)] text-[var(--text-tertiary)] cursor-not-allowed'
            }`}>
            {loading ? '⌛ 生成报告中...' : '✦ 生成人生总览报告'}
          </button>
          {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
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
