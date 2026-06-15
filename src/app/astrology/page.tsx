'use client';

import { useState } from 'react';
import { getZodiacByDate, getChineseZodiac, getChineseZodiacElement, zodiacSigns } from '@/lib/astrology';
import TTSReader from '@/components/TTSReader';

export default function AstrologyPage() {
  const [year, setYear] = useState('1990');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [result, setResult] = useState<{ zodiac: any; chineseZodiac: string; element: string } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);
    if (isNaN(m) || isNaN(d) || isNaN(y) || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return;
    const zodiac = getZodiacByDate(m, d);
    setResult({
      zodiac,
      chineseZodiac: getChineseZodiac(y),
      element: getChineseZodiacElement(y),
    });
    setAiContent(null);
    setAiError(null);
  };

  const generateAIInterpretation = async () => {
    if (!result?.zodiac || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/astrology-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: parseInt(year),
          month: parseInt(month),
          day: parseInt(day),
          zodiacName: result.zodiac.name,
          zodiacEnglish: result.zodiac.englishName,
          element: result.zodiac.element,
          quality: result.zodiac.quality,
          rulingPlanet: result.zodiac.rulingPlanet,
          chineseZodiac: result.chineseZodiac,
          chineseElement: result.element,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiContent(data.content);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen gradient-bg">
      <div className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="tag-pill text-xs tracking-widest mb-4 inline-block">占星学</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
              星座与生肖<br />
              <span className="text-[var(--text-accent)]">星辰之书</span>
            </h1>
            <p className="text-[var(--text-secondary)]">探索你的太阳星座、生肖属相和五行属性</p>
          </div>

          {/* Input Form */}
          <div className="max-w-md mx-auto mb-12">
            <form onSubmit={handleSubmit} className="card-jade p-6">
              <div className="text-sm text-[var(--text-secondary)] mb-4 text-center">输入你的出生日期</div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1">年</label>
                  <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="1990" className="input-jade text-center" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1">月</label>
                  <input type="number" value={month} onChange={e => setMonth(e.target.value)} placeholder="1" min={1} max={12} className="input-jade text-center" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1">日</label>
                  <input type="number" value={day} onChange={e => setDay(e.target.value)} placeholder="1" min={1} max={31} className="input-jade text-center" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-[var(--text-accent)] text-black font-bold rounded-lg hover:opacity-90 transition-all">解析我的星座</button>
            </form>
          </div>

          {/* Result */}
          {result && result.zodiac && (
            <div className="space-y-8 mb-12">
              <div className="text-center">
                <div className="text-6xl mb-2">{result.zodiac.symbol}</div>
                <div className="text-3xl font-bold text-[var(--text-accent)] mb-1">{result.zodiac.name}</div>
                <div className="text-[var(--text-secondary)]">{result.zodiac.englishName}</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '日期范围', value: result.zodiac.dateRange },
                  { label: '星座属性', value: result.zodiac.element + '象' },
                  { label: '属相', value: result.chineseZodiac + '年' },
                  { label: '五行', value: result.element },
                  { label: '模式', value: result.zodiac.quality + '星座' },
                  { label: '守护星', value: result.zodiac.rulingPlanet },
                ].map((item, i) => (
                  <div key={i} className="card-jade p-4 text-center">
                    <div className="text-xs text-[var(--text-secondary)] mb-1">{item.label}</div>
                    <div className="font-bold text-sm">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Description with TTS */}
              <div className="card-jade p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-[var(--text-accent)]">性格特质</h2>
                  <TTSReader text={`你是${result.zodiac.name}。${result.zodiac.description}你的性格特质包括：${result.zodiac.traits.join('、')}。`} label="听描述" />
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {result.zodiac.traits.map((t: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-[var(--text-accent)]/10 border border-[var(--text-accent)]/20 text-sm">{t}</span>
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">{result.zodiac.description}</p>
              </div>

              {/* AI Deep Interpretation */}
              <div className="card-jade p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-[var(--text-accent)]">AI 占星解读</h2>
                  {aiContent && <TTSReader text={aiContent.replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\n/g, '，')} label="听解读" />}
                </div>
                {!aiContent && !aiLoading && (
                  <div className="text-center py-6">
                    <p className="text-sm text-[var(--text-secondary)] mb-4">让AI结合你的星座、生肖和五行，生成一份深度的占星解读</p>
                    <button onClick={generateAIInterpretation} className="px-6 py-3 bg-[var(--text-accent)] text-black font-bold rounded-lg hover:opacity-90 transition-all">
                      生成AI占星解读
                    </button>
                  </div>
                )}
                {aiLoading && (
                  <div className="text-center py-6">
                    <div className="inline-block w-6 h-6 border-2 border-[var(--text-accent)] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-sm text-[var(--text-secondary)]">星辰之力正在解读中...</p>
                  </div>
                )}
                {aiError && (
                  <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-red-400 text-sm mb-4">
                    {aiError}
                    <button onClick={generateAIInterpretation} className="ml-3 underline">重试</button>
                  </div>
                )}
                {aiContent && (
                  <div className="text-[var(--text-secondary)] leading-relaxed text-sm whitespace-pre-wrap">
                    {aiContent}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Zodiac Signs Gallery */}
          <div className="text-center mb-6">
            <button onClick={() => setShowAll(!showAll)} className="text-sm text-[var(--text-accent)] hover:underline">
              {showAll ? '收起' : '查看全部十二星座'}
            </button>
          </div>

          {showAll && (
            <div className="grid md:grid-cols-3 gap-4">
              {zodiacSigns.map((z, i) => (
                <div key={i} className="card-jade p-4 hover:border-[var(--text-accent)] transition-all cursor-pointer">
                  <div className="text-2xl mb-1">{z.symbol}</div>
                  <div className="font-bold text-sm text-[var(--text-accent)]">{z.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{z.dateRange}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">{z.element}象 · {z.quality} · {z.rulingPlanet}</div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <a href="/" className="text-sm text-[var(--text-accent)] hover:underline">← 返回首页</a>
          </div>
        </div>
      </div>
    </div>
  );
}
