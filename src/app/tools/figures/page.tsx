'use client';

import { useState } from 'react';
import { sageFigures, camps, type SageFigure } from '@/data/tools/sageData';
import { sageBios } from '@/data/tools/sageBioData';

function FigureDetail({ figure, onClose }: { figure: SageFigure; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-[var(--bg-card-hover)] transition-colors text-sm">
          ✕
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 border-[var(--text-accent)]/30 bg-[var(--bg-highlight)] flex-shrink-0">
            ★
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{figure.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="tag-pill text-xs">{figure.camp}</span>
              <span className="tag-pill text-xs">{figure.dynasty}</span>
              <span className="tag-pill text-xs text-[var(--text-accent)]">
                {'★'.repeat(figure.stars)}{'☆'.repeat(5 - figure.stars)}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">一句话简介</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{figure.description}</p>
        </div>

        {/* Full Bio */}
        {sageBios[figure.id] && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">通俗简介</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{sageBios[figure.id]}</p>
          </div>
        )}

        {/* Slogan */}
        <div className="p-4 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-accent)] mb-4">
          <p className="text-sm text-[var(--text-accent)] italic text-center">&ldquo;{figure.slogan}&rdquo;</p>
        </div>

        {/* Keywords/Tags */}
        <div className="mb-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">精神特质</h3>
          <div className="flex flex-wrap gap-2">
            {figure.keywords.map(kw => (
              <span key={kw} className="tag-pill text-xs bg-[var(--bg-highlight)]">{kw}</span>
            ))}
          </div>
        </div>

        {/* Image Source */}
        <p className="text-xs text-[var(--text-secondary)] mt-4 opacity-60">
          人物照片来源建议：{figure.imageHint}
        </p>
      </div>
    </div>
  );
}

export default function FiguresPage() {
  const [selectedFigure, setSelectedFigure] = useState<SageFigure | null>(null);
  const [activeCamp, setActiveCamp] = useState<string | null>(null);

  // Get unique camps in order
  const campList = Array.from(new Set(sageFigures.map(f => f.camp)));

  const filtered = activeCamp
    ? sageFigures.filter(f => f.camp === activeCamp)
    : sageFigures;

  return (
    <div className="min-h-screen gradient-bg px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-3xl font-bold mb-2">先贤人物谱</h1>
          <p className="text-[var(--text-secondary)] mb-4">
            共 {sageFigures.length} 位先贤 · 点击人物查看详情
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="tag-pill">🏛️ 六大阵营</span>
            <span className="tag-pill">⭐ 1-5星难度</span>
            <span className="tag-pill">📖 点击看简介</span>
          </div>
        </div>

        <div className="gold-divider mb-8" />

        {/* Camp Filter */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => setActiveCamp(null)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              !activeCamp
                ? 'bg-[var(--text-accent)]/20 text-[var(--text-accent)] border border-[var(--text-accent)]/30'
                : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            🏠 全部 ({sageFigures.length})
          </button>
          {campList.map(camp => {
            const count = sageFigures.filter(f => f.camp === camp).length;
            // Get emoji for camp
            const campInfo = camps.find(c => c.name === camp);
            const emoji = campInfo?.icon || '📌';
            return (
              <button
                key={camp}
                onClick={() => setActiveCamp(camp)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCamp === camp
                    ? 'bg-[var(--text-accent)]/20 text-[var(--text-accent)] border border-[var(--text-accent)]/30'
                    : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                {emoji} {camp} ({count})
              </button>
            );
          })}
        </div>

        {/* Figure Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFigure(f)}
              className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--text-accent)]/30 hover:shadow-md transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-2 border-2 border-[var(--border-color)] group-hover:border-[var(--text-accent)]/30 bg-[var(--bg-highlight)] transition-colors">
                ★
              </div>
              <div className="font-bold text-sm text-[var(--text-primary)] truncate">{f.name}</div>
              <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{f.camp}</div>
              <div className="text-xs text-[var(--text-accent)] mt-1">
                {'★'.repeat(f.stars)}{'☆'.repeat(5 - f.stars)}
              </div>
            </button>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedFigure && (
          <FigureDetail
            figure={selectedFigure}
            onClose={() => setSelectedFigure(null)}
          />
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-[var(--text-secondary)]">
          <div className="gold-divider mb-6" />
          <p>点亮星图 · 先贤人物谱 · 共 {sageFigures.length} 位</p>
          <p className="mt-1">数据来源：昌宁茶乡精神图谱共建行动</p>
        </div>
      </div>
    </div>
  );
}
