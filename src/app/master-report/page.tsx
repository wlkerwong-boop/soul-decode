'use client';

import { useState } from 'react';
import VoiceReader from '@/components/VoiceReader';
import BodygraphSVG from '@/components/BodygraphSVG';
import BaziChart from '@/components/BaziChart';
import ZiWeiChart from '@/components/ZiWeiChart';

const YEARS = Array.from({length:121},(_,i)=>2026-i);
const MONTHS = Array.from({length:12},(_,i)=>i+1);
const DAYS = Array.from({length:31},(_,i)=>i+1);
const HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
const LOCATIONS: Record<string,string> = {
  '北京':'北京','上海':'上海','天津':'天津','重庆':'重庆',
  '广东':'广东','深圳':'广东','广州':'广东',
  '山东':'山东','济南':'山东','青岛':'山东',
  '江苏':'江苏','南京':'江苏','苏州':'江苏',
  '浙江':'浙江','杭州':'浙江',
  '湖北':'湖北','武汉':'湖北',
  '四川':'四川','成都':'四川',
  '云南':'云南','大理':'云南','昆明':'云南',
  '洛杉矶':'America/Los_Angeles','纽约':'America/New_York',
  '伦敦':'Europe/London','巴黎':'Europe/Paris',
  '东京':'Asia/Tokyo','悉尼':'Australia/Sydney',
};

export default function MasterPage() {
  const [year, setYear] = useState(''); const [month, setMonth] = useState('');
  const [day, setDay] = useState(''); const [hour, setHour] = useState('');
  const [location, setLocation] = useState(''); const [gender, setGender] = useState('男');
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [report, setReport] = useState(''); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); const [data, setData] = useState<any>(null);

  const submit = async () => {
    setLoading(true); setError(''); setReport(''); setData(null);
    try {
      const r = await fetch('/api/master-report', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({year, month, day, hour, location, gender, timezone}),
      });
      const d = await r.json();
      if (!d.success) { setError(d.error||'生成失败'); return; }
      setReport(d.report); setData(d.data);
    } catch (e: any) { setError(e.message||'网络错误'); }
    setLoading(false);
  };

  const Btn = ({v,cur,set,label}:{v:string,cur:string,set:(s:string)=>void,label:string}) => (
    <button onClick={()=>set(v)}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${cur===v ? 'bg-[var(--accent)] text-white shadow-md' : 'bg-[var(--bg-highlight)] text-[var(--text-secondary)] hover:bg-opacity-80'}`}>
      {label}
    </button>
  );

  return (
    <div className="gradient-bg min-h-screen px-4 py-6 md:py-10">
      <div className="max-w-4xl mx-auto">

        {/* Hero - Big */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight leading-tight">
            ✦ <span className="gradient-text">人生总览</span>
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)]">
            一次输入 · 七大系统交叉融合
          </p>
          <p className="text-sm text-[var(--text-secondary)] opacity-70">
            八字 · 人类图 · 占星 · 紫微斗数 · 五运六气 · 流年 · 人生规划
          </p>
        </div>

        {/* Form - Big */}
        <div className="card-jade p-6 md:p-8 mb-8">
          <div className="space-y-5">

            {/* Date Row */}
            <div>
              <label className="block text-base font-bold mb-2 text-[var(--text-secondary)]">出生日期</label>
              <div className="grid grid-cols-4 gap-3">
                <select value={year} onChange={e=>setYear(e.target.value)} className="input-jade text-lg py-3 font-medium">
                  <option value="">年份</option>
                  {YEARS.map(y=><option key={y} value={y}>{y}年</option>)}
                </select>
                <select value={month} onChange={e=>setMonth(e.target.value)} className="input-jade text-lg py-3 font-medium">
                  <option value="">月份</option>
                  {MONTHS.map(m=><option key={m} value={m}>{m}月</option>)}
                </select>
                <select value={day} onChange={e=>setDay(e.target.value)} className="input-jade text-lg py-3 font-medium">
                  <option value="">日期</option>
                  {DAYS.map(d=><option key={d} value={d}>{d}日</option>)}
                </select>
                <select value={hour} onChange={e=>setHour(e.target.value)} className="input-jade text-lg py-3 font-medium">
                  <option value="">时辰</option>
                  {HOURS.map(h=><option key={h} value={h}>{h}时</option>)}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-base font-bold mb-2 text-[var(--text-secondary)]">出生地</label>
              <select value={location} onChange={e=>setLocation(e.target.value)} className="input-jade text-lg py-3 font-medium w-full">
                <option value="">选择出生地</option>
                {Object.entries(LOCATIONS).filter(([k])=>k.length<=4||LOCATIONS[k]===k).map(([k,v])=>
                  <option key={k} value={v}>{k}</option>
                )}
                <option value="other">其他（联系客服）</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-base font-bold mb-2 text-[var(--text-secondary)]">时区</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {v:'Asia/Shanghai',l:'🇨🇳 北京时间'},
                  {v:'America/Los_Angeles',l:'🇺🇸 洛杉矶'},
                  {v:'America/New_York',l:'🇺🇸 纽约'},
                  {v:'Europe/London',l:'🇬🇧 伦敦'},
                  {v:'Asia/Tokyo',l:'🇯🇵 东京'},
                  {v:'Australia/Sydney',l:'🇦🇺 悉尼'},
                ].map(tz=>
                  <button key={tz.v} onClick={()=>setTimezone(tz.v)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${timezone===tz.v ? 'bg-[var(--accent)] text-white shadow-md' : 'bg-[var(--bg-highlight)] text-[var(--text-secondary)]'}`}>
                    {tz.l}
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">
                海外出生：人类图用当地时间，八字紫微用北京时间
              </p>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-base font-bold mb-2 text-[var(--text-secondary)]">性别</label>
              <div className="flex gap-3">
                <Btn v="男" cur={gender} set={setGender} label="👨 男" />
                <Btn v="女" cur={gender} set={setGender} label="👩 女" />
              </div>
            </div>

            {/* Submit */}
            <button onClick={submit} disabled={loading||!year||!month||!day}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--accent)] to-emerald-500 text-white font-bold text-lg hover:shadow-xl transition-all disabled:opacity-40">
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
                <h3 className="text-base font-bold text-[var(--accent)] mb-3">🧬 人类图</h3>
                <BodygraphSVG
                  definedCenters={data.hd.definedCenters||[]}
                  activatedGates={data.hd.activatedGates||[]}
                  channels={data.hd.channels||[]}
                  centerDefinition={{}}
                />
                <p className="text-sm text-[var(--text-secondary)] mt-3 text-center">{data.hd.type} · {data.hd.profile} · {data.hd.authority}</p>
              </div>
            )}
            {data.bazi && (
              <div className="card-jade p-5">
                <h3 className="text-base font-bold text-[var(--accent)] mb-3">🀄 八字四柱</h3>
                <BaziChart pillars={data.bazi.pillars||[]} dayMaster={data.bazi.dayMaster||''} elements={['金','金','金','火']}/>
              </div>
            )}
            {data.ziwei && (
              <div className="card-jade p-5">
                <h3 className="text-base font-bold text-[var(--accent)] mb-3">⭐ 紫微斗数</h3>
                <ZiWeiChart palaces={data.ziwei.palaces||[]} />
              </div>
            )}
            {data.wuyun && (
              <div className="card-jade p-5">
                <h3 className="text-base font-bold text-[var(--accent)] mb-3">🌊 五运六气</h3>
                <div className="text-sm text-[var(--text-secondary)] space-y-2">
                  <p>出生年运：{data.wuyun.stem}年 → {data.wuyun.wuyun}</p>
                  <p>出生气化：{data.wuyun.branch}年 → {data.wuyun.liuqi}</p>
                  <p className="text-xs opacity-60">当前流年：2026丙午年 · 火运太过 · 太阳寒水司天</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Report */}
        {report && (
          <div className="card-jade p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">📜 人生总览报告</h2>
              <VoiceReader text={report} title="🔊 听报告" />
            </div>
            <div className="prose prose-sm md:prose-base prose-invert whitespace-pre-wrap leading-relaxed">
              {report.split('\n').map((line, i) => (
                <p key={i} className="mb-3">{line || '\u00A0'}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
