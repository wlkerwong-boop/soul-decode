'use client';

import { useState, useEffect, useCallback } from 'react';
import { CATEGORY_INFO, TemplateCategory } from '@/data/prompt-templates';

interface Template {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  category: TemplateCategory;
  userLevel: string;
  psychology: string;
  rationale: string;
  bestFor: string;
  expectedOutcome: string;
}

export default function PromptTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Record<string, any>>({});
  const [activeCat, setActiveCat] = useState<string>('all');
  const [selected, setSelected] = useState<Template | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/templates?level=paid')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setTemplates(d.templates);
          setCategories(d.categories);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = activeCat === 'all'
    ? templates
    : templates.filter(t => t.category === activeCat);

  const handleCopy = useCallback((t: Template) => {
    navigator.clipboard.writeText(t.prompt).then(() => {
      setCopiedId(t.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {});
  }, []);

  const categoryKeys = Object.keys(CATEGORY_INFO);

  return (
    <div className="templates-container max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-2xl">🎙️</span>
          <h2 className="text-xl font-bold text-[var(--text-accent)] tracking-wider">
            深度对话模板
          </h2>
          <span className="text-2xl">🎙️</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] opacity-70">
          基于心理学与行为科学设计的深度提问模板 · 复制后粘贴到AI对话框即可使用
        </p>
      </div>

      {/* 分类导航 */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-3 py-1.5 rounded-full text-xs transition-all ${
            activeCat === 'all'
              ? 'bg-[var(--text-accent)] text-[#0a0a0f] font-medium'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]'
          }`}
        >
          全部
        </button>
        {categoryKeys.map(key => {
          const cat = CATEGORY_INFO[key as TemplateCategory];
          return (
            <button
              key={key}
              onClick={() => setActiveCat(key)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                activeCat === key
                  ? 'bg-[var(--text-accent)] text-[#0a0a0f] font-medium'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          );
        })}
      </div>

      {/* 模板列表 */}
      <div className="space-y-4">
        {filtered.map(t => (
          <div
            key={t.id}
            className="rounded-xl p-5 cursor-pointer transition-all hover:translate-x-1"
            style={{
              background: 'linear-gradient(135deg, rgba(201,169,110,0.06), rgba(201,169,110,0.02))',
              border: '1px solid rgba(201,169,110,0.12)',
            }}
            onClick={() => setSelected(selected?.id === t.id ? null : t)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{CATEGORY_INFO[t.category]?.emoji || '📄'}</span>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">{t.title}</h3>
                  {t.userLevel !== 'free' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: t.userLevel === 'vip' ? 'rgba(201,169,110,0.2)' : 'rgba(74,222,128,0.15)',
                        color: t.userLevel === 'vip' ? '#c9a96e' : '#4ade80',
                        border: `1px solid ${t.userLevel === 'vip' ? 'rgba(201,169,110,0.3)' : 'rgba(74,222,128,0.2)'}`,
                      }}
                    >
                      {t.userLevel === 'vip' ? 'VIP' : '付费'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] opacity-70">{t.subtitle}</p>
                <p className="text-xs text-[var(--text-secondary)] opacity-50 mt-1">{t.bestFor}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleCopy(t); }}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: copiedId === t.id ? 'rgba(74,222,128,0.2)' : 'rgba(201,169,110,0.12)',
                  color: copiedId === t.id ? '#4ade80' : 'var(--text-accent)',
                  border: `1px solid ${copiedId === t.id ? 'rgba(74,222,128,0.3)' : 'rgba(201,169,110,0.2)'}`,
                }}
              >
                {copiedId === t.id ? '✅ 已复制' : '📋 复制'}
              </button>
            </div>

            {/* 展开详情 */}
            {selected?.id === t.id && (
              <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-3">
                {/* 提示词预览 */}
                <div>
                  <p className="text-xs text-[var(--text-accent)] mb-1 font-medium">📝 提示词预览</p>
                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed p-3 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.2)' }}
                  >
                    {t.prompt.slice(0, 300)}...
                  </div>
                </div>

                {/* 心理学原理 */}
                <div>
                  <p className="text-xs text-[var(--text-accent)] mb-1 font-medium">🧠 心理学原理</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{t.psychology}</p>
                </div>

                {/* 设计理由 */}
                <div>
                  <p className="text-xs text-[var(--text-accent)] mb-1 font-medium">🎯 为什么有效</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{t.rationale}</p>
                </div>

                {/* 预期效果 */}
                <div>
                  <p className="text-xs text-[var(--text-accent)] mb-1 font-medium">✨ 预期效果</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{t.expectedOutcome}</p>
                </div>

                {/* 复制完整提示词 */}
                <button
                  onClick={() => handleCopy(t)}
                  className="w-full py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: copiedId === t.id ? 'rgba(74,222,128,0.15)' : 'linear-gradient(135deg, #c9a96e, #b8944e)',
                    color: copiedId === t.id ? '#4ade80' : '#0a0a0f',
                  }}
                >
                  {copiedId === t.id ? '✅ 已复制到剪贴板' : '📋 复制完整提示词'}
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--text-secondary)] text-sm opacity-60">
            加载中...
          </div>
        )}
      </div>

      {/* 底部说明 */}
      <div className="mt-8 p-4 rounded-xl text-xs text-[var(--text-secondary)] leading-relaxed"
        style={{
          background: 'linear-gradient(135deg, rgba(201,169,110,0.04), rgba(201,169,110,0.01))',
          border: '1px solid rgba(201,169,110,0.08)',
        }}
      >
        <p className="font-medium text-[var(--text-accent)] mb-1">💡 使用建议</p>
        <p>复制提示词后，粘贴到DeepSeek、ChatGPT或Claude等AI助手的对话框。模板中的"____________"部分请替换为你自己的具体信息。建议每次只做一个模板，深入探索。</p>
      </div>
    </div>
  );
}
