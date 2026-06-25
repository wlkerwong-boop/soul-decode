'use client';

import { useState } from 'react';

export default function DharmaQA() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ q: string; a: string; sources?: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sources, setSources] = useState('');

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const res = await fetch('/api/dharma-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnswer(data.answer);
      setSources(data.sources || '');
      setHistory(prev => [{ q, a: data.answer, sources: data.sources }, ...prev].slice(0, 20));
      setShowHistory(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Question Input */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="输入佛法问题，例如：如何对治焦虑？什么是正念？"
            className="input-jade w-full pr-24 py-4 text-base rounded-2xl"
            disabled={loading}
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-[var(--text-accent)] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {loading ? '思考中…' : '提问'}
          </button>
        </div>
        <p className="text-xs text-[var(--text-secondary)] opacity-50 mt-2 text-center">
          基于寂如师父开示体系 · AI辅助回答 · 仅供参考
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="cosmic-loader mx-auto mb-4" style={{ width: 40, height: 40 }}>
            <div className="cosmic-ring cosmic-ring-3" style={{ width: '100%', height: '100%' }} />
            <div className="cosmic-center text-xs">☸</div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">正在思维法义...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto mb-4 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/15 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-3 mb-6">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-1"
              style={{
                background: 'linear-gradient(135deg, rgba(201, 169, 110, 0.15), rgba(201, 169, 110, 0.05))',
                border: '1px solid rgba(201, 169, 110, 0.25)',
              }}
            >
              ☸
            </div>
            <div>
              <p className="text-xs text-[var(--text-accent)] mb-1 font-medium">法藏回答</p>
              <div className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                {answer}
              </div>
              {sources && (
                <p className="text-xs text-[var(--text-accent)] opacity-70 mt-2">{sources}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="max-w-2xl mx-auto mt-8 pt-6 border-t border-[var(--border-color)]">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
          >
            {showHistory ? '收起' : '展开'} 历史提问（{history.length}）
          </button>
          {showHistory && (
            <div className="mt-4 space-y-4">
              {history.map((h, i) => (
                <div key={i} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Q: {h.q}</p>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-3">{h.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
