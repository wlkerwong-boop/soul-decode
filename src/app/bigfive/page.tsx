'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ipip50Questions, calculateBigFive } from '@/data/ipip50';

const TOTAL = ipip50Questions.length;
const PAGE_SIZE = 5;
const TOTAL_PAGES = Math.ceil(TOTAL / PAGE_SIZE);

const likertLabels = ['非常不同意', '不太同意', '中立', '比较同意', '非常同意'];

export default function BigFivePage() {
  const router = useRouter();
  const [showStart, setShowStart] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / TOTAL) * 100;

  const startIdx = currentPage * PAGE_SIZE;
  const pageQuestions = ipip50Questions.slice(startIdx, startIdx + PAGE_SIZE);

  const handleSelect = (qId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleNext = () => {
    if (currentPage < TOTAL_PAGES - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = () => {
    const scores = calculateBigFive(answers);
    sessionStorage.setItem('bigfive-scores', JSON.stringify(scores));
    sessionStorage.setItem('bigfive-answers', JSON.stringify(answers));
    router.push('/bigfive/result');
  };

  const allAnsweredOnPage = pageQuestions.every(q => answers[q.id] != null);

  // ── 开始页 ──
  if (showStart) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <span className="tag-pill text-xs tracking-widest mb-6 inline-block">科学心理学测评</span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            大五人格
            <br />
            <span className="gradient-text">科学测评</span>
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed mb-6 max-w-xl mx-auto">
            基于国际公认的大五人格模型（IPIP-50），50 道题目科学评估你的五大人格维度。
            心理学黄金标准，与你的命盘双轨印证。
          </p>
          <div className="grid grid-cols-5 gap-2 md:gap-3 mb-8 max-w-xl mx-auto text-xs md:text-sm">
            {[
              { dim: 'E', label: '外向性', en: 'Extraversion', icon: '🗣️' },
              { dim: 'A', label: '宜人性', en: 'Agreeableness', icon: '🤝' },
              { dim: 'C', label: '尽责性', en: 'Conscientiousness', icon: '📋' },
              { dim: 'N', label: '神经质', en: 'Neuroticism', icon: '🌊' },
              { dim: 'O', label: '开放性', en: 'Openness', icon: '💡' },
            ].map(d => (
              <div key={d.dim} className="p-2 md:p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]/40">
                <div className="text-lg md:text-xl mb-0.5">{d.icon}</div>
                <div className="text-[var(--text-primary)] font-semibold text-[11px] md:text-xs">{d.label}</div>
                <div className="text-[10px] text-[var(--text-tertiary)] hidden md:block">{d.en}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mb-6">约 8-12 分钟完成 · 每题 5 点量表</div>
          <button
            onClick={() => setShowStart(false)}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 transition-all"
          >
            开始测评 →
          </button>
          <p className="mt-6 text-xs text-[var(--text-tertiary)]">
            常模为成人样本，未成年人结果仅供趋势参考 · 本测评为自我认识工具，非临床心理诊断
          </p>
        </div>
      </div>
    );
  }

  // ── 答题页 ──
  return (
    <div className="gradient-bg min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        {/* 进度条 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-[var(--text-secondary)]">
              第 {currentPage + 1}/{TOTAL_PAGES} 页 · 共 {TOTAL} 题
            </span>
            <span className="text-[var(--text-accent)] font-semibold">
              {answeredCount}/{TOTAL} 已答
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--border-color)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 题目区 */}
        <div className="space-y-6">
          {pageQuestions.map((q) => (
            <div
              key={q.id}
              className="card-jade p-5 md:p-6 transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-xs text-[var(--text-tertiary)] shrink-0 mt-0.5">
                  {q.id}.
                </span>
                <p className="text-sm md:text-base text-[var(--text-primary)] leading-relaxed">
                  {q.text}
                </p>
              </div>

              {/* Likert 5点量表 */}
              <div className="flex items-center justify-between gap-1 md:gap-2">
                {[1, 2, 3, 4, 5].map((value) => {
                  const selected = answers[q.id] === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleSelect(q.id, value)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2.5 md:py-3 rounded-lg border transition-all text-[11px] md:text-xs ${
                        selected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-semibold shadow-sm'
                          : 'border-[var(--border-color)] bg-[var(--bg-card)]/50 text-[var(--text-tertiary)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5'
                      }`}
                    >
                      <span className={`text-lg md:text-xl ${selected ? 'scale-110' : ''} transition-transform`}>
                        {value === 1 ? '😤' : value === 2 ? '😐' : value === 3 ? '🤔' : value === 4 ? '😊' : '😄'}
                      </span>
                      <span className="hidden md:inline">{likertLabels[value - 1]}</span>
                      <span className="md:hidden text-[10px] leading-tight text-center">
                        {['很不同意', '不同意', '中立', '同意', '很同意'][value - 1]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 底部按钮 */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-5 py-2.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:border-[var(--color-primary)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← 上一页
          </button>

          <span className="text-xs text-[var(--text-tertiary)]">
            {currentPage + 1} / {TOTAL_PAGES}
          </span>

          {currentPage < TOTAL_PAGES - 1 ? (
            <button
              onClick={handleNext}
              disabled={!allAnsweredOnPage}
              className="px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              下一页 →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={answeredCount < TOTAL}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white font-semibold text-sm hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {answeredCount >= TOTAL ? '查看结果 →' : `还差 ${TOTAL - answeredCount} 题`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
