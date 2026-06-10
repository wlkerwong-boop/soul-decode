'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMBTITypeInfo } from '@/data/mbti-types';
import CosmicBackground from '@/components/CosmicBackground';

export default function MBTIResultPage() {
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, {first: number; second: number}> | null>(null);
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const t = sessionStorage.getItem('mbti-type');
    const s = sessionStorage.getItem('mbti-scores');
    if (!t) { router.replace('/mbti'); return; }
    setType(t);
    setScores(s ? JSON.parse(s) : null);
    setInfo(getMBTITypeInfo(t));
  }, [router]);

  if (!type || !info) return null;

  const dimLabels: Record<string, {first: string; second: string; color: string}> = {
    EI: { first: 'E 外向', second: 'I 内向', color: '#c8a46c' },
    SN: { first: 'S 实感', second: 'N 直觉', color: '#7eb8da' },
    TF: { first: 'T 思考', second: 'F 情感', color: '#e88d7a' },
    JP: { first: 'J 判断', second: 'P 感知', color: '#8fc9a8' },
  };

  const barMax = 15;

  return (
    <div className="relative min-h-screen">
      <CosmicBackground />
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
          <div className="grid gap-4 mb-12">
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
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden relative">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: pct + '%', backgroundColor: v.color }} />
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[10px] text-black font-bold opacity-0">
                      {Math.round(pct)}%
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
                    <span>{score?.first || 0}</span>
                    <span>{score?.second || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Description */}
          <div className="p-8 rounded-xl border border-[var(--border-color)] bg-black/30 backdrop-blur-sm mb-8">
            <h2 className="text-xl font-bold mb-4 text-[var(--text-accent)]">性格描述</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">{info.description}</p>
            <div className="mt-6 text-center">
              <span className="italic text-[var(--text-accent)]">「{info.motto}」</span>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-xl border border-emerald-800/30 bg-emerald-900/10">
              <h3 className="font-bold text-emerald-400 mb-3">优势</h3>
              <ul className="space-y-2">
                {info.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">+</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-red-800/30 bg-red-900/10">
              <h3 className="font-bold text-red-400 mb-3">劣势</h3>
              <ul className="space-y-2">
                {info.weaknesses.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">-</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Careers */}
          <div className="p-8 rounded-xl border border-[var(--border-color)] bg-black/30 backdrop-blur-sm mb-12">
            <h2 className="text-xl font-bold mb-4 text-[var(--text-accent)]">适合职业方向</h2>
            <div className="flex flex-wrap gap-2">
              {info.careers.map((c: string, i: number) => (
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
