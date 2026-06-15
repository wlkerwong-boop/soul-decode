'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mbtiQuestions, calculateMBTI, getDimensionScore } from '@/data/mbti-questions';


export default function MBTIPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [showStart, setShowStart] = useState(true);

  const total = mbtiQuestions.length;
  const progress = total > 0 ? (Object.keys(answers).length / total) * 100 : 0;

  const handleAnswer = (answer: 'A' | 'B') => {
    const q = mbtiQuestions[current];
    const newAnswers = { ...answers, [q.id]: answer };
    setAnswers(newAnswers);
    if (current < total - 1) {
      setCurrent(current + 1);
    } else {
      const type = calculateMBTI(newAnswers);
      const scores = getDimensionScore(newAnswers);
      sessionStorage.setItem('mbti-type', type);
      sessionStorage.setItem('mbti-scores', JSON.stringify(scores));
      sessionStorage.setItem('mbti-answers', JSON.stringify(newAnswers));
      router.push('/mbti/result');
    }
  };

  if (showStart) {
    return (
      <div className="relative min-h-screen">
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-2xl text-center">
            <span className="tag-pill text-xs tracking-widest mb-6 inline-block">心理学测评</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
              MBTI 性格类型<br />
              <span className="text-[var(--text-accent)]">深度测试</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
              48道精心设计的选择题，揭示你的性格密码。
              了解你的能量来源、认知方式、决策模式和生活风格。<br />
              <span className="text-sm opacity-60">约需 5-8 分钟完成</span>
            </p>
            <div className="grid grid-cols-4 gap-4 mb-10 text-sm">
              {['E/I 外向/内向','S/N 实感/直觉','T/F 思考/情感','J/P 判断/感知'].map((d,i) => (
                <div key={i} className="p-3 rounded-lg border border-[var(--border-color)] bg-black/20">
                  <div className="text-[var(--text-accent)] font-bold">{d.split('/')[0]}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">{d.split('/')[1]}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowStart(false)} className="px-8 py-3 bg-[var(--text-accent)] text-black font-bold rounded-lg hover:opacity-90 transition-all text-lg">
              开始测试 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = mbtiQuestions[current];

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="w-full h-1 bg-black/30">
          <div className="h-full bg-[var(--text-accent)] transition-all duration-300" style={{ width: progress + '%' }} />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-6">
              <span className="text-sm text-[var(--text-secondary)]">第 {current + 1} / {total} 题</span>
            </div>
            <div className="p-8 rounded-xl border border-[var(--border-color)] bg-black/30 backdrop-blur-sm mb-6">
              <div className="text-xs text-[var(--text-accent)] mb-3 font-mono">
                {q.dimension === 'EI' ? '能量来源' : q.dimension === 'SN' ? '认知方式' : q.dimension === 'TF' ? '决策模式' : '生活风格'}
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-8 text-center leading-relaxed">{q.text}</h2>
              <div className="space-y-3">
                <button onClick={() => handleAnswer('A')} className="w-full p-4 rounded-lg border border-[var(--border-color)] hover:border-[var(--text-accent)] hover:bg-[var(--text-accent)]/10 transition-all text-left">
                  <span className="text-[var(--text-accent)] mr-3">A.</span>{q.optionA}
                </button>
                <button onClick={() => handleAnswer('B')} className="w-full p-4 rounded-lg border border-[var(--border-color)] hover:border-[var(--text-accent)] hover:bg-[var(--text-accent)]/10 transition-all text-left">
                  <span className="text-[var(--text-accent)] mr-3">B.</span>{q.optionB}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button onClick={() => current > 0 && setCurrent(current - 1)} disabled={current === 0} className="px-4 py-2 text-sm text-[var(--text-secondary)] disabled:opacity-30 hover:text-white transition-colors">
                ← 上一题
              </button>
              <div className="flex gap-1">
                {Array.from({ length: total }).map((_, i) => (
                  <div key={i} className={'w-1.5 h-1.5 rounded-full transition-all ' + (i < current ? 'bg-[var(--text-accent)]' : i === current ? 'bg-white' : 'bg-white/20')} />
                ))}
              </div>
              <div className="w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
