'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMBTITypeInfo } from '@/data/mbti-types';

import TTSReader from '@/components/TTSReader';

export default function MBTIResultPage() {
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, {first: number; second: number}> | null>(null);
  const [answers, setAnswers] = useState<Record<string, any> | null>(null);
  const [info, setInfo] = useState<any>(null);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem('mbti-type');
    const s = sessionStorage.getItem('mbti-scores');
    const a = sessionStorage.getItem('mbti-answers');
    if (!t) { router.replace('/mbti'); return; }
    setType(t);
    setScores(s ? JSON.parse(s) : null);
    setAnswers(a ? JSON.parse(a) : null);
    setInfo(getMBTITypeInfo(t));
  }, [router]);

  const generateAIInterpretation = async () => {
    if (!type || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/mbti-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, scores, answers }),
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

  if (!type || !info) return null;

  const dimLabels: Record<string, {first: string; second: string; color: string}> = {
    EI: { first: 'E 外向', second: 'I 内向', color: '#c8a46c' },
    SN: { first: 'S 实感', second: 'N 直觉', color: '#7eb8da' },
    TF: { first: 'T 思考', second: 'F 情感', color: '#e88d7a' },
    JP: { first: 'J 判断', second: 'P 感知', color: '#8fc9a8' },
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Result Header */}
          <div className="text-center mb-12">
            <span className="tag-pill text-xs tracking-widest mb-4 inline-block">你的性格类型</span>
            <div className="text-6xl font-bold text-[var(--text-accent)] mb-4 tracking-widest">{type}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{info.name}</h1>
            <p className="text-xl text-[var(--text-secondary)]">{info.title}</p>
            <p className="text-sm opacity-50 mt-1">{info.nickname}</p>
          </div>

          {/* Dimension Scores */}
          <div className="grid gap-4 mb-8">
            {Object.entries(dimLabels).map(([k, v]) => {
              const score = scores?.[k];
              const total = (score?.first || 0) + (score?.second || 0);
              const pct = total > 0 ? ((score?.first || 0) / total) * 100 : 50;
              const dominant = pct >= 50 ? v.first : v.second;
              const recessive = pct >= 50 ? v.second : v.first;
              return (
                <div key={k} className="p-4 rounded-lg border border-[var(--border-color)] bg-black/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{dominant}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{recessive}</span>
                  </div>
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: pct + '%', backgroundColor: v.color }} />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
                    <span>{score?.first || 0}</span>
                    <span>{score?.second || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Base Description + TTS */}
          <div className="p-8 rounded-xl border border-[var(--border-color)] bg-black/30 backdrop-blur-sm mb-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[var(--text-accent)]">性格描述</h2>
              <TTSReader text={`你的MBTI类型是${type}，${info.name}型，${info.title}。${info.description}。你的座右铭是：${info.motto}。`} label="听描述" />
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">{info.description}</p>
            <div className="mt-6 text-center">
              <span className="italic text-[var(--text-accent)]">「{info.motto}」</span>
            </div>
          </div>

          {/* AI Deep Interpretation */}
          <div className="p-8 rounded-xl border border-[var(--text-accent)]/30 bg-[var(--text-accent)]/5 backdrop-blur-sm mb-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[var(--text-accent)]">AI 深度解读</h2>
              {aiContent && <TTSReader text={aiContent.replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\n/g, '，')} label="听解读" />}
            </div>
            {!aiContent && !aiLoading && (
              <div className="text-center py-6">
                <p className="text-sm text-[var(--text-secondary)] mb-4">让AI基于你的测试结果，生成一份深度的性格分析报告</p>
                <button onClick={generateAIInterpretation} className="px-6 py-3 bg-[var(--text-accent)] text-black font-bold rounded-lg hover:opacity-90 transition-all">
                  生成AI深度解读
                </button>
              </div>
            )}
            {aiLoading && (
              <div className="text-center py-6">
                <div className="inline-block w-6 h-6 border-2 border-[var(--text-accent)] border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">AI正在解读你的性格...</p>
              </div>
            )}
            {aiError && (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-red-400 text-sm mb-4">
                {aiError}
                <button onClick={generateAIInterpretation} className="ml-3 underline">重试</button>
              </div>
            )}
            {aiContent && (
              <div className="prose prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed text-sm whitespace-pre-wrap">
                {aiContent}
              </div>
            )}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-xl border border-emerald-800/30 bg-emerald-900/10">
              <h3 className="font-bold text-emerald-400 mb-3">优势</h3>
              <ul className="space-y-2">
                {info.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5 shrink-0">+</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-red-800/30 bg-red-900/10">
              <h3 className="font-bold text-red-400 mb-3">劣势</h3>
              <ul className="space-y-2">
                {info.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 shrink-0">-</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Careers */}
          <div className="p-8 rounded-xl border border-[var(--border-color)] bg-black/30 backdrop-blur-sm mb-12">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[var(--text-accent)]">适合职业方向</h2>
              {info.careers && <TTSReader text={`适合的职业方向有：${info.careers.join('、')}`} label="听职业" />}
            </div>
            <div className="flex flex-wrap gap-2">
              {info.careers?.map((c: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-[var(--text-secondary)]">{c}</span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="text-center space-y-4">
            <button onClick={() => router.push('/mbti')} className="px-6 py-3 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--text-accent)] transition-all">
              重新测试
            </button>
            <div className="mt-6">
              <a href="/" className="text-sm text-[var(--text-accent)] hover:underline">← 返回首页</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
