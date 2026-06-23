'use client';

import { useState } from 'react';
import { sageFigures } from '@/data/tools/sageData';

const threeQuestions = [
  {
    id: 1,
    title: '第一问 🔍',
    subtitle: '初心',
    template: '这位榜样一生始终坚守的初心是什么？',
    tip: '提示：不要只问"他做了什么"，要问"他为什么做"。初心是人物精神的根。',
    example: '好的追问："在他最困难的时候，是什么让他没有放弃？"',
  },
  {
    id: 2,
    title: '第二问 🤔',
    subtitle: '抉择',
    template: '他人生面临最难抉择时，做出选择的底层原因是什么？',
    tip: '提示：找人物传记中"两难时刻"。没有标准答案——你的思考比答案更重要。',
    example: '好的追问："如果是他，他会怎么看待今天的孩子面临的诱惑？"',
  },
  {
    id: 3,
    title: '第三问 💡',
    subtitle: '当下指引',
    template: '这份精神可以怎样指引我当下的学习与生活？',
    tip: '提示：最关键的连接——从"他的故事"到"我的生活"。越具体越好。',
    example: '好的追问："如果他在我的处境中，他会怎么做？"',
  },
];

export default function Ai3QPage() {
  const [selectedFigure, setSelectedFigure] = useState<number | null>(null);
  const [mode, setMode] = useState<'practice' | 'record'>('practice');
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [currentStep, setCurrentStep] = useState(0);

  const figure = selectedFigure ? sageFigures.find(f => f.id === selectedFigure) : null;

  const handleSelectFigure = (id: number) => {
    setSelectedFigure(id);
    setCurrentStep(0);
    setAnswers(['', '', '']);
  };

  const handleAnswerChange = (idx: number, val: string) => {
    const newAnswers = [...answers];
    newAnswers[idx] = val;
    setAnswers(newAnswers);
  };

  const figureScore = (id: number) => {
    return `${id}`;
  };

  // ── Figure Selection Screen ──
  if (!selectedFigure) {
    return (
      <div className="min-h-screen gradient-bg px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-3xl font-bold mb-2">灵魂三问AI练习器</h1>
            <p className="text-[var(--text-secondary)] mb-2">
              教孩子用好问题向AI探索先贤人物——而不是只问"他做了什么事"。
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="tag-pill">🔍 初心</span>
              <span className="tag-pill">🤔 抉择</span>
              <span className="tag-pill">💡 当下指引</span>
            </div>
          </div>
          <div className="gold-divider mb-8" />

          {/* Mode Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setMode('practice')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                mode === 'practice'
                  ? 'bg-[var(--text-accent)]/20 text-[var(--text-accent)] border border-[var(--text-accent)]/30'
                  : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              ✏️ 模拟练习
            </button>
            <button
              onClick={() => setMode('record')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                mode === 'record'
                  ? 'bg-[var(--text-accent)]/20 text-[var(--text-accent)] border border-[var(--text-accent)]/30'
                  : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              📝 实操记录
            </button>
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-4 text-center">
            {mode === 'practice'
              ? '选一位先贤，练习用好问题向AI提问'
              : '用DeepSeek等AI工具实操，然后粘贴AI的回答'
            }
          </p>

          {/* Figure Grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {sageFigures.map(f => (
              <button
                key={f.id}
                onClick={() => handleSelectFigure(f.id)}
                className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--text-accent)]/30 transition-all text-center"
              >
                <div className="font-bold text-sm text-[var(--text-primary)]">{f.name}</div>
                <div className="text-xs text-[var(--text-accent)]">{'★'.repeat(f.stars)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Question Flow ──
  return (
    <div className="min-h-screen gradient-bg px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelectedFigure(null)}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
          >
            ← 返回
          </button>
          <span className="text-xs text-[var(--text-secondary)]">|</span>
          <div>
            <span className="font-bold text-[var(--text-primary)]">{figure?.name}</span>
            <span className="text-xs text-[var(--text-secondary)] ml-2">{figure?.camp}</span>
          </div>
          <span className="text-xs text-[var(--text-accent)] ml-auto">
            {currentStep + 1} / 3
          </span>
        </div>

        {/* Progress */}
        <div className="w-full bg-[var(--border-color)]/30 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / 3) * 100}%`,
              background: 'linear-gradient(90deg, var(--text-accent), var(--text-accent-gold))',
            }}
          />
        </div>

        {/* Current Question */}
        <div className="p-6 rounded-xl border border-[var(--text-accent)]/20 bg-[var(--bg-card)] mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{threeQuestions[currentStep].title}</span>
            <span className="text-xs tag-pill">{threeQuestions[currentStep].subtitle}</span>
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            {threeQuestions[currentStep].template}
          </h2>

          {/* Mode: Practice */}
          {mode === 'practice' && (
            <div>
              <div className="p-4 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-accent)] mb-4">
                <p className="text-xs text-[var(--text-accent)] font-semibold mb-1">💡 {threeQuestions[currentStep].tip}</p>
                <p className="text-xs text-[var(--text-secondary)]">{threeQuestions[currentStep].example}</p>
              </div>
              <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                用你自己的话改写这个提问：
              </label>
              <textarea
                value={answers[currentStep]}
                onChange={(e) => handleAnswerChange(currentStep, e.target.value)}
                placeholder="例如：钱学森爷爷，当时美国条件那么好，您为什么一定要回来？"
                className="w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-sm resize-none focus:outline-none focus:border-[var(--text-accent)] transition-colors"
                rows={4}
              />
            </div>
          )}

          {/* Mode: Record */}
          {mode === 'record' && (
            <div>
              <div className="p-4 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-accent)] mb-4">
                <p className="text-xs text-[var(--text-accent)] mb-1">
                  ① 把上方问题复制到DeepSeek等AI工具中
                </p>
                <p className="text-xs text-[var(--text-accent)]">
                  ② 把AI的回答粘贴到下方
                </p>
              </div>
              <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                AI的回答：
              </label>
              <textarea
                value={answers[currentStep]}
                onChange={(e) => handleAnswerChange(currentStep, e.target.value)}
                placeholder="把AI的回答粘贴到这里……"
                className="w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-sm resize-none focus:outline-none focus:border-[var(--text-accent)] transition-colors"
                rows={6}
              />
              <div className="mt-2">
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                  用一句话总结你学到的东西：
                </label>
                <input
                  type="text"
                  placeholder="我学到了……"
                  className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-sm focus:outline-none focus:border-[var(--text-accent)] transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(c => Math.max(0, c - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl text-sm border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← 上一问
          </button>

          {currentStep < 2 ? (
            <button
              onClick={() => setCurrentStep(c => c + 1)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--text-accent), var(--text-accent-gold))',
              }}
            >
              下一问 →
            </button>
          ) : (
            <button
              onClick={() => setSelectedFigure(null)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--text-accent), var(--text-accent-gold))',
              }}
            >
              ✅ 完成！选择另一位先贤
            </button>
          )}
        </div>

        {/* Summary at the end */}
        {currentStep === 2 && answers.some(a => a.trim()) && (
          <div className="mt-8 p-4 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-accent)]">
            <h3 className="font-bold text-sm text-[var(--text-accent)] mb-2">📋 你的三问记录</h3>
            {threeQuestions.map((q, i) => (
              <div key={q.id} className="mb-2">
                <p className="text-xs font-semibold text-[var(--text-primary)]">{q.title}</p>
                <p className="text-xs text-[var(--text-secondary)]">{answers[i] || '(未填写)'}</p>
              </div>
            ))}
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              💡 提示：截图保存这段对话记录，后续创作人物简介和诗歌时可参考。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
