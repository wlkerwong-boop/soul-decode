'use client';

import { useState, useMemo } from 'react';
import { sageFigures, getFigureById, type SageFigure } from '@/data/tools/sageData';

// ── 12 Questions (4 dimensions) ──
interface Question {
  id: number;
  dimension: string;
  text: string;
  options: { label: string; keywords: string[] }[];
}

const questions: Question[] = [
  // 维度1：性格特质（4题）
  { id: 1, dimension: '性格特质', text: '周末不用上学，你更倾向于？',
    options: [
      { label: '📚 安静看书、画画、做手工', keywords: ['喜欢安静', '爱写作', '爱画画', '喜欢手工'] },
      { label: '🏃 去户外跑跳、打球、爬山', keywords: ['爱冒险', '爱自然', '勇敢', '爱户外'] },
      { label: '🎮 玩会儿游戏再干别的', keywords: [] },
      { label: '👫 约朋友一起出去玩', keywords: ['喜欢交友'] },
    ]},
  { id: 2, dimension: '性格特质', text: '遇到一道很难的数学题，你通常？',
    options: [
      { label: '💪 自己想办法，一定要解出来', keywords: ['有毅力', '有钻研精神', '爱钻研'] },
      { label: '🙋 先自己试试，不行再找人帮忙', keywords: ['勇于尝试'] },
      { label: '📱 搜一下答案看看解析', keywords: [] },
      { label: '⏭️ 先放一放，过会儿再看', keywords: ['有耐心'] },
    ]},
  { id: 3, dimension: '性格特质', text: '你觉得自己更像哪种人？',
    options: [
      { label: '🎯 目标明确，说做就做', keywords: ['执行力强', '果断', '有规划'] },
      { label: '🤔 想得多，喜欢先观察再行动', keywords: ['善于观察', '有观察力', '爱思考'] },
      { label: '💡 想法多，经常有新点子', keywords: ['有创意', '有想象力'] },
      { label: '🤝 随和，大家怎么样我就怎么样', keywords: [] },
    ]},
  { id: 4, dimension: '性格特质', text: '在团队合作中你通常是？',
    options: [
      { label: '👑 主动承担，领头的那一个', keywords: ['有领导力', '有担当', '有责任心'] },
      { label: '🤲 积极配合，把分配的事做好', keywords: ['负责任', '做事认真'] },
      { label: '💡 出主意、提想法的那一个', keywords: ['有创意', '有想象力'] },
      { label: '🧹 默默收尾、查漏补缺的那一个', keywords: ['细心', '有责任感', '有耐心'] },
    ]},

  // 维度2：兴趣方向（3题）
  { id: 5, dimension: '兴趣方向', text: '去图书馆，你最先走向哪个区域？',
    options: [
      { label: '🚀 科学/发明类', keywords: ['爱科学', '爱发明', '想当科学家', '爱天文'] },
      { label: '📜 历史/人物传记类', keywords: ['爱历史', '爱读书'] },
      { label: '🧙 神话/奇幻/冒险类', keywords: ['有好奇心', '爱冒险', '爱探索'] },
      { label: '🎨 艺术/手工类', keywords: ['有艺术感', '喜欢手工', '爱画画'] },
    ]},
  { id: 6, dimension: '兴趣方向', text: '课余时间你更愿意做什么？',
    options: [
      { label: '🌱 养植物、观察昆虫、去公园', keywords: ['喜欢自然', '爱自然', '种植物', '爱观察'] },
      { label: '✏️ 写日记、写故事、摘抄好句子', keywords: ['爱写作', '有才华', '喜欢记录'] },
      { label: '🧩 搭积木、做模型、编程', keywords: ['喜欢动手', '爱发明', '有创意'] },
      { label: '🏀 运动、跑步、活动身体', keywords: [] },
    ]},
  { id: 7, dimension: '兴趣方向', text: '哪种类型的视频/故事最能吸引你？',
    options: [
      { label: '🌍 探险/旅行/地理纪录片', keywords: ['爱冒险', '爱旅行', '爱地理', '有探索精神'] },
      { label: '🔬 科学实验/发明创造', keywords: ['爱科学', '爱发明', '有好奇心', '喜欢动手'] },
      { label: '📖 历史故事/古代人物', keywords: ['爱历史', '爱读书', '有学问'] },
      { label: '❤️ 感人/励志的真实故事', keywords: ['善良', '有爱心', '有同理心'] },
    ]},

  // 维度3：成长期待（3题）
  { id: 8, dimension: '成长期待', text: '你希望将来成为一个什么样的人？',
    options: [
      { label: '🧠 有学问、有智慧的人', keywords: ['有学问', '有才华', '爱学习'] },
      { label: '❤️ 善良、乐于助人的人', keywords: ['善良', '有爱心', '乐于助人', '有同理心'] },
      { label: '💪 勇敢、有担当的人', keywords: ['勇敢', '有担当', '有骨气', '有勇气'] },
      { label: '🎨 有创造力、能改变世界的人', keywords: ['有创意', '有想象力', '敢于创新'] },
    ]},
  { id: 9, dimension: '成长期待', text: '你最佩服哪种品质？',
    options: [
      { label: '🏔️ 坚持不放弃', keywords: ['有毅力', '有恒心', '长期坚持', '坚持到底'] },
      { label: '🤲 乐于分享、帮助他人', keywords: ['乐于助人', '爱分享', '有爱心'] },
      { label: '🧐 独立思考、不盲从', keywords: ['独立', '有主见', '爱思考'] },
      { label: '⚖️ 公平正直、有原则', keywords: ['正直', '公平', '有原则', '有骨气'] },
    ]},
  { id: 10, dimension: '成长期待', text: '如果可以用一个词形容理想中的自己？',
    options: [
      { label: '🦅 自由', keywords: ['爱自由', '爱冒险', '勇敢'] },
      { label: '🌳 踏实', keywords: ['做事踏实', '不浮躁', '有耐心', '有恒心'] },
      { label: '🔥 勇敢', keywords: ['勇敢', '有勇气', '有骨气', '有担当'] },
      { label: '💡 智慧', keywords: ['有学问', '有才华', '爱思考', '爱学习'] },
    ]},

  // 维度4：个人特质（2题）
  { id: 11, dimension: '个人特质', text: '你的朋友最常用哪个词形容你？',
    options: [
      { label: '📣 热心肠，爱管闲事', keywords: ['有爱心', '乐于助人', '善良', '有正义感'] },
      { label: '🧠 点子多，鬼主意大王', keywords: ['有创意', '有想象力', '喜欢动手'] },
      { label: '🛡️ 靠谱，交给你的事放心', keywords: ['负责任', '有责任心', '说到做到', '做事认真'] },
      { label: '😄 乐观，什么困难都不怕', keywords: ['乐观', '心态好', '幽默', '自信'] },
    ]},
  { id: 12, dimension: '个人特质', text: '你更喜欢什么样的学习方式？',
    options: [
      { label: '📖 自己读书、琢磨', keywords: ['爱学习', '爱读书', '有钻研精神', '独立'] },
      { label: '👥 和同学一起讨论', keywords: ['喜欢交友', '善于协调'] },
      { label: '🧪 动手做实验、做项目', keywords: ['喜欢动手', '爱发明', '有创意'] },
      { label: '🌿 到户外去观察、体验', keywords: ['爱自然', '爱观察', '有好奇心'] },
    ]},
];

// ── Result Component ──
function ResultCard({ figure }: { figure: SageFigure }) {
  return (
    <div className="p-6 rounded-xl border border-[var(--text-accent)]/25 bg-[var(--bg-card)] card-jade">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-[var(--text-accent)]/30 bg-[var(--bg-highlight)]">
          ★
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">{figure.name}</h3>
          <p className="text-xs text-[var(--text-accent)]">{figure.camp} · {'★'.repeat(figure.stars)}{'☆'.repeat(5 - figure.stars)}</p>
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">{figure.description}</p>
      <p className="text-sm text-[var(--text-accent)] italic mb-3">&ldquo;{figure.slogan}&rdquo;</p>
      <div className="flex flex-wrap gap-2">
        {figure.keywords.slice(0, 4).map(kw => (
          <span key={kw} className="tag-pill text-xs bg-[var(--bg-highlight)]">{kw}</span>
        ))}
      </div>
    </div>
  );
}

// ── Progress Bar ──
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current) / total) * 100;
  return (
    <div className="w-full bg-[var(--border-color)]/30 rounded-full h-2 mb-6 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--text-accent), var(--text-accent-gold))',
        }}
      />
    </div>
  );
}

// ── Main Page ──
export default function MatchingPage() {
  const [step, setStep] = useState<'welcome' | 'quiz' | 'result'>('welcome');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const allKeywords = useMemo(() => {
    const kw: string[] = [];
    answers.forEach((label, idx) => {
      const question = questions.find(q => q.id === idx + 1);
      if (question) {
        const opt = question.options.find(o => o.label === label);
        if (opt) kw.push(...opt.keywords);
      }
    });
    return kw;
  }, [answers]);

  const matchedFigures = useMemo(() => {
    if (allKeywords.length === 0) return [];
    const scored = sageFigures.map(f => ({
      figure: f,
      score: f.keywords.filter(kw =>
        allKeywords.some(ak => ak.includes(kw) || kw.includes(ak))
      ).length,
    }));
    return scored.sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.figure);
  }, [allKeywords]);

  const handleStart = () => {
    setStep('quiz');
    setCurrentQ(0);
    setAnswers([]);
  };

  const handleSelect = (label: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = label;
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      setStep('result');
    }
  };

  const handleRestart = () => {
    setStep('welcome');
    setCurrentQ(0);
    setAnswers([]);
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(c => c - 1);
  };

  // ── Welcome Screen ──
  if (step === 'welcome') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl mb-6">🧭</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">精神坐标定位器</h1>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            12道选择题，帮你从60位古圣先贤中
            <br />找到和你最"心灵相通"的那一位。
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs text-[var(--text-secondary)]">
            <span className="tag-pill">🧠 性格特质</span>
            <span className="tag-pill">🎯 兴趣方向</span>
            <span className="tag-pill">🌟 成长期待</span>
            <span className="tag-pill">💫 个人特质</span>
          </div>
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-xl text-base font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--text-accent), var(--text-accent-gold))',
            }}
          >
            开始匹配 →
          </button>
          <p className="text-xs text-[var(--text-secondary)] mt-4">大约需要3分钟</p>
        </div>
      </div>
    );
  }

  // ── Quiz Screen ──
  if (step === 'quiz') {
    const question = questions[currentQ];
    const hasAnswer = answers[currentQ] !== undefined;

    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-[var(--text-accent)] font-semibold">
              第 {currentQ + 1} / {questions.length} 题
            </span>
            <span className="text-xs text-[var(--text-secondary)]">{question.dimension}</span>
          </div>
          <ProgressBar current={currentQ + 1} total={questions.length} />

          {/* Question */}
          <h2 className="text-xl font-bold mb-6">{question.text}</h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((opt) => {
              const isSelected = answers[currentQ] === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(opt.label)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-[var(--text-accent)] bg-[var(--bg-highlight)]'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--text-accent)]/40'
                  }`}
                >
                  <span className="text-base">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Nav Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={currentQ === 0}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← 上一题
            </button>
            {hasAnswer && currentQ < questions.length - 1 && (
              <button
                onClick={() => setCurrentQ(c => c + 1)}
                className="text-sm text-[var(--text-accent)] font-semibold hover:underline"
              >
                下一题 →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Result Screen ──
  return (
    <div className="min-h-screen gradient-bg px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">你的精神坐标已找到！</h1>
          <p className="text-[var(--text-secondary)]">
            基于你的选择，以下3位先贤与你的精神气质最契合
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {matchedFigures.map((figure, i) => (
            <div key={figure.id} className="relative">
              {i === 0 && (
                <div className="text-center mb-2">
                  <span className="tag-pill text-sm bg-[var(--text-accent)]/20 text-[var(--text-accent)] font-bold">
                    🏆 最佳匹配
                  </span>
                </div>
              )}
              <ResultCard figure={figure} />
            </div>
          ))}
        </div>

        {/* Restart */}
        <div className="text-center">
          <button
            onClick={handleRestart}
            className="px-6 py-2 rounded-xl text-sm font-semibold border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all"
          >
            重新匹配 →
          </button>
        </div>

        {/* Figure Browser */}
        <div className="mt-12">
          <div className="gold-divider mb-8" />
          <h2 className="text-lg font-bold mb-6 text-center">浏览全部先贤</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sageFigures.map(f => (
              <button
                key={f.id}
                onClick={() => {
                  const idx = matchedFigures.findIndex(mf => mf.id === f.id);
                  if (idx >= 0) {
                    const el = document.querySelectorAll('.space-y-4 > div')[idx];
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left hover:bg-[var(--bg-card-hover)] transition-all text-sm"
              >
                <div className="font-bold text-[var(--text-primary)]">{f.name}</div>
                <div className="text-xs text-[var(--text-secondary)] truncate">{f.camp}</div>
                <div className="text-xs text-[var(--text-accent)]">{'★'.repeat(f.stars)}{'☆'.repeat(5 - f.stars)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
