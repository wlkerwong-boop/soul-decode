'use client';

import { useMemo, useState } from 'react';

import type { BlindBiographySample } from '@/data/biography-validation-study';
import type { BiographyReviewLabel, BiographyValidationScore } from '@/lib/biography-validation';

const LABELS: Array<{ value: BiographyReviewLabel; title: string; hint: string }> = [
  { value: 'match', title: '匹配', hint: '报告出现了清晰、可对应的主题' },
  { value: 'mismatch', title: '矛盾', hint: '报告与事实出现了明显冲突' },
  { value: 'neutral', title: '中性', hint: '没有命中，也没有明显冲突' },
  { value: 'unscorable', title: '无法判断', hint: '信息不足，无法公平判断' },
];

const SAMPLE_LABELS: Record<string, string> = {
  'sample-a': '样本 A',
  'sample-b': '样本 B',
  'sample-c': '样本 C',
};

interface BiographyValidationWorkbenchProps {
  samples: BlindBiographySample[];
}

interface ReviewState {
  label?: BiographyReviewLabel;
  note: string;
}

function emptyReviews(sample: BlindBiographySample): Record<string, ReviewState> {
  return Object.fromEntries(sample.facts.map((fact) => [fact.id, { note: '' }]));
}

function scoreValue(value: number | null): string {
  return value === null ? '—' : `${value}%`;
}

export default function BiographyValidationWorkbench({ samples }: BiographyValidationWorkbenchProps) {
  const [sampleId, setSampleId] = useState(samples[0]?.id || 'sample-a');
  const [reportText, setReportText] = useState('');
  const [hasReadReport, setHasReadReport] = useState(false);
  const [reviews, setReviews] = useState<Record<string, ReviewState>>(() => emptyReviews(samples[0]));
  const [score, setScore] = useState<BiographyValidationScore | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedSample = useMemo(
    () => samples.find((sample) => sample.id === sampleId) || samples[0],
    [sampleId, samples],
  );
  const reviewReady = reportText.trim().length >= 80 && hasReadReport;
  const completedCount = selectedSample.facts.filter((fact) => reviews[fact.id]?.label).length;

  const changeSample = (nextSampleId: string) => {
    const nextSample = samples.find((sample) => sample.id === nextSampleId);
    if (!nextSample) return;
    setSampleId(nextSample.id);
    setReportText('');
    setHasReadReport(false);
    setReviews(emptyReviews(nextSample));
    setScore(null);
    setError('');
  };

  const setReview = (factId: string, patch: Partial<ReviewState>) => {
    setReviews((current) => ({
      ...current,
      [factId]: { ...current[factId], ...patch },
    }));
    setScore(null);
    setError('');
  };

  const submitReview = async () => {
    if (!reviewReady) {
      setError('请先粘贴完整报告，并确认你已经先阅读报告。');
      return;
    }
    if (completedCount !== selectedSample.facts.length) {
      setError('请为每条事实选择一个标签后再提交。');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/biography-validation/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleId: selectedSample.id,
          reviews: selectedSample.facts.map((fact) => ({
            factId: fact.id,
            label: reviews[fact.id].label,
            note: reviews[fact.id].note.trim() || undefined,
          })),
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body.errors?.join('；') || '提交失败，请稍后重试。');
      }
      setScore(body.score as BiographyValidationScore);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '提交失败，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-page)] px-4 py-12 text-[var(--text-primary)]">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[var(--text-accent)]">SOULCODE · VALIDATION LAB</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">名人传记盲评工作台</h1>
          <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
            先看匿名人物报告，再打开预登记事实，逐条判断它们是否在报告中得到清晰对应。这里记录的是观察吻合度，不是命运判决，也不是科学验证结论。
          </p>
        </header>

        <section className="mb-6 rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-md)] md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <label className="block flex-1">
              <span className="mb-2 block text-sm font-medium">匿名样本</span>
              <select
                value={selectedSample.id}
                onChange={(event) => changeSample(event.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-transparent px-4 py-3 outline-none focus:border-[var(--text-accent)]"
              >
                {samples.map((sample) => (
                  <option key={sample.id} value={sample.id}>{SAMPLE_LABELS[sample.id] || '匿名样本'}</option>
                ))}
              </select>
            </label>
            <div className="rounded-xl bg-[var(--bg-highlight)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              本页不保存报告、身份或评审结果
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 md:p-7">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--text-accent)]">STEP 1 · REPORT FIRST</p>
              <h2 className="mt-2 text-xl font-semibold">先粘贴报告</h2>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">{reportText.trim().length}/80 字起</span>
          </div>
          <textarea
            value={reportText}
            onChange={(event) => { setReportText(event.target.value); setScore(null); }}
            className="min-h-44 w-full resize-y rounded-xl border border-[var(--border-color)] bg-transparent px-4 py-3 leading-7 outline-none focus:border-[var(--text-accent)]"
            placeholder="把不含人物姓名的七系统报告或人生剧本粘贴到这里……"
          />
          <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={hasReadReport}
              onChange={(event) => setHasReadReport(event.target.checked)}
              className="mt-1 accent-[var(--text-accent)]"
            />
            <span>我确认已经先阅读报告，尚未根据事实清单倒推报告内容。</span>
          </label>
        </section>

        {!reviewReady && (
          <section className="mb-6 rounded-2xl border border-dashed border-[var(--border-color)] p-6 text-center text-[var(--text-secondary)]">
            完成上面的报告阅读确认后，事实清单才会显示。
          </section>
        )}

        {reviewReady && (
          <section className="mb-6 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[var(--text-accent)]">STEP 2 · LABEL FACTS</p>
                <h2 className="mt-2 text-xl font-semibold">逐条标注预登记事实</h2>
              </div>
              <span className="text-sm text-[var(--text-secondary)]">已完成 {completedCount}/{selectedSample.facts.length}</span>
            </div>
            {selectedSample.facts.map((fact, index) => (
              <article key={fact.id} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="rounded-full bg-[var(--bg-highlight)] px-3 py-1">事实 {index + 1}</span>
                  <span>{fact.eventYear || '年份未标注'}</span>
                  <span>·</span>
                  <span>{fact.distinctiveness === 'high' ? '高区分度' : fact.distinctiveness === 'medium' ? '中区分度' : '低区分度'}</span>
                </div>
                <p className="mt-4 text-lg leading-8">{fact.description}</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {LABELS.map((label) => (
                    <button
                      key={label.value}
                      type="button"
                      onClick={() => setReview(fact.id, { label: label.value })}
                      aria-pressed={reviews[fact.id]?.label === label.value}
                      className={`rounded-xl border px-3 py-3 text-left transition ${reviews[fact.id]?.label === label.value ? 'border-[var(--text-accent)] bg-[var(--bg-highlight)]' : 'border-[var(--border-color)] hover:border-[var(--border-accent)]'}`}
                    >
                      <span className="block text-sm font-medium">{label.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--text-secondary)]">{label.hint}</span>
                    </button>
                  ))}
                </div>
                <input
                  value={reviews[fact.id]?.note || ''}
                  onChange={(event) => setReview(fact.id, { note: event.target.value })}
                  className="mt-4 w-full rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--text-accent)]"
                  placeholder="可选：写一句中性备注"
                />
              </article>
            ))}
          </section>
        )}

        {reviewReady && (
          <section className="mb-8 rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-card)] p-5 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[var(--text-accent)]">STEP 3 · SUBMIT</p>
                <h2 className="mt-2 text-xl font-semibold">提交这次匿名盲评</h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">提交后只返回统计指标，不揭示样本真实身份。</p>
              </div>
              <button
                type="button"
                onClick={submitReview}
                disabled={submitting}
                className="rounded-xl bg-[var(--text-accent)] px-6 py-3 font-medium text-[var(--text-inverse)] transition hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
              >
                {submitting ? '正在计算……' : '提交盲评'}
              </button>
            </div>
            {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</p>}
          </section>
        )}

        {score && (
          <section className="rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-card)] p-5 md:p-7">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--text-accent)]">REVIEW RESULT · ANONYMOUS</p>
            <h2 className="mt-2 text-2xl font-semibold">这次盲评的观察指标</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['观察吻合度', scoreValue(score.observedFitScore)],
                ['覆盖率', `${score.coveragePercent}%`],
                ['矛盾率', `${score.contradictionPercent}%`],
                ['无法评分', `${score.unscorablePercent}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[var(--bg-highlight)] p-4">
                  <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--text-accent)]">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">
              这是一次评审记录，不是科学验证结论。正式汇总前还需要更多样本、独立评审者和预先登记的统一规则。
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
