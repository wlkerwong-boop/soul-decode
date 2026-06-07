'use client';

import { useState } from 'react';

export default function FeedbackForm({
  reportId,
  province,
  city,
  birthYear,
}: {
  reportId: string;
  province: string;
  city: string;
  birthYear: string;
}) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0 && !feedback.trim()) return;
    setSending(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: rating || undefined,
          feedback: feedback.trim(),
          reportId,
          province,
          city,
          birthYear,
        }),
      });
      setSubmitted(true);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-6 text-center py-4">
        <p className="text-sm text-green-400">感谢你的反馈！🙏</p>
        <p className="text-xs text-[var(--text-secondary)] opacity-60 mt-1">你的意见将帮助我们持续改进</p>
      </div>
    );
  }

  return (
    <div id="feedback-section" className="mt-6 rounded-xl p-5 max-w-lg mx-auto"
      style={{
        background: 'linear-gradient(135deg, rgba(201,169,110,0.04), rgba(201,169,110,0.01))',
        border: '1px solid rgba(201,169,110,0.1)',
      }}
    >
      <div className="text-center mb-4">
        <p className="text-sm text-[var(--text-accent)] font-medium">📊 这份报告对你有帮助吗？</p>
        <p className="text-xs text-[var(--text-secondary)] opacity-60 mt-1">
          你的反馈将帮助我们优化算法，让更多人受益
        </p>
      </div>

      {/* 五星评分 */}
      <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl transition-all hover:scale-110"
            style={{
              filter: n <= (hoverRating || rating) ? 'none' : 'grayscale(1)',
              opacity: n <= (hoverRating || rating) ? 1 : 0.3,
            }}
          >
            ⭐
          </button>
        ))}
      </div>

      {/* 反馈文字 */}
      <textarea
        className="input-gold text-sm resize-none"
        rows={3}
        placeholder="有什么想说的吗？（选填）比如最准的是哪部分？哪里不够好？"
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={sending || (rating === 0 && !feedback.trim())}
        className="btn-gold !w-auto !px-8 !py-2 !text-sm mt-3 mx-auto block"
      >
        {sending ? '提交中...' : '提交反馈'}
      </button>
    </div>
  );
}
