'use client';

import { useState, useEffect } from 'react';

// ── Constants ──
const TOTAL_DAYS = 7;
const MAX_CHARS = 500;

type StepKey = 'objective' | 'reflective' | 'interpretive' | 'decisional';

interface DayEntry {
  objective: string;
  reflective: string;
  interpretive: string;
  decisional: string;
}

const emptyEntry = (): DayEntry => ({ objective: '', reflective: '', interpretive: '', decisional: '' });

interface StepInfo {
  key: StepKey;
  label: string;
  icon: string;
  kidQuestion: string;
  parentQuestion: string;
  placeholder: string;
}

const steps: StepInfo[] = [
  {
    key: 'objective',
    label: 'O·客观事实',
    icon: '👁️',
    kidQuestion: '今天发生了什么？你看到了什么、听到了什么、做了什么？',
    parentQuestion: '今天孩子做了什么、说了什么？你观察到了哪些具体行为？',
    placeholder: '例如：今天在草原上徒步了3公里……',
  },
  {
    key: 'reflective',
    label: 'R·感受反应',
    icon: '❤️',
    kidQuestion: '今天你有什么感受？开心、意外、难过、还是累？',
    parentQuestion: '今天孩子的情绪状态怎么样？你自己有什么感受？',
    placeholder: '例如：刚开始觉得很累，但到山顶看到草原的时候特别开心……',
  },
  {
    key: 'interpretive',
    label: 'I·深层思考',
    icon: '🧠',
    kidQuestion: '今天这件事让你学到了什么？或者想到了什么？',
    parentQuestion: '今天孩子的表现说明了什么？你有什么新的发现或感悟？',
    placeholder: '例如：我明白了坚持走完累的路，才能看到好看的风景……',
  },
  {
    key: 'decisional',
    label: 'D·未来行动',
    icon: '🎯',
    kidQuestion: '接下来你会怎么做？今天的经历有没有改变你的想法？',
    parentQuestion: '接下来你会怎么支持孩子？今天的经历对你有何启发？',
    placeholder: '例如：以后遇到困难，我会先试着自己走完，再看要不要帮忙……',
  },
];

const dayQuestions = [
  { title: '抵达·破冰', emoji: '👋', desc: '认识伙伴、围炉诗会、第一次见结对朋友' },
  { title: '草原日', emoji: '🏔️', desc: '草原徒步、踏勘点位、先贤抉择剧场、AI诗歌工坊' },
  { title: '创作日', emoji: '✍️', desc: '人物终稿、诗歌定稿、版面设计、村委审核' },
  { title: '体验日', emoji: '🌱', desc: '古法制茶、核桃采摘、森林徒步、乡土劳作' },
  { title: '立牌日', emoji: '🎉', desc: '立牌预埋安装、集体揭幕仪式、小小讲解员培训' },
  { title: '宣讲日', emoji: '🎤', desc: '讲解员实操演练、成果整理、小组复盘' },
  { title: '告别日', emoji: '🤝', desc: '星图守护座谈、笔友签约、返程' },
];

const STORAGE_KIDS_KEY = 'orid_kids_data';
const STORAGE_PARENT_KEY = 'orid_parent_data';

// ── Component ──
export default function OridPage() {
  const [mode, setMode] = useState<'kids' | 'parent'>('kids');
  const [currentDay, setCurrentDay] = useState(0);
  const [entries, setEntries] = useState<DayEntry[]>([]);

  // Load from localStorage
  useEffect(() => {
    const key = mode === 'kids' ? STORAGE_KIDS_KEY : STORAGE_PARENT_KEY;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === TOTAL_DAYS) {
          setEntries(parsed);
          return;
        }
      }
    } catch {}
    // Initialize empty
    setEntries(Array.from({ length: TOTAL_DAYS }, () => emptyEntry()));
  }, [mode]);

  // Save to localStorage
  const saveEntries = (newEntries: DayEntry[]) => {
    setEntries(newEntries);
    const key = mode === 'kids' ? STORAGE_KIDS_KEY : STORAGE_PARENT_KEY;
    try {
      localStorage.setItem(key, JSON.stringify(newEntries));
    } catch {}
  };

  const updateEntry = (stepKey: StepKey, value: string) => {
    const newEntries = [...entries];
    newEntries[currentDay] = { ...newEntries[currentDay], [stepKey]: value };
    saveEntries(newEntries);
  };

  const currentEntry = entries[currentDay] || emptyEntry();

  // ── Summary View ──
  const showSummary = entries.every(e => e.objective || e.reflective || e.interpretive || e.decisional);
  const filledCount = entries.filter(e => e.objective || e.reflective || e.interpretive || e.decisional).length;

  // Count chars
  const totalChars = entries.reduce((sum, e) =>
    sum + e.objective.length + e.reflective.length + e.interpretive.length + e.decisional.length, 0);

  // ── Render ──
  return (
    <div className="min-h-screen gradient-bg px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold mb-2">研学ORID复盘卡</h1>
          <p className="text-[var(--text-secondary)]">每天4步反思，把经历转化为成长</p>
        </div>

        <div className="gold-divider mb-8" />

        {/* Mode Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setMode('kids')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'kids'
                ? 'bg-[var(--text-accent)]/20 text-[var(--text-accent)] border border-[var(--text-accent)]/30'
                : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            🧒 孩子版
          </button>
          <button
            onClick={() => setMode('parent')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'parent'
                ? 'bg-[var(--text-accent)]/20 text-[var(--text-accent)] border border-[var(--text-accent)]/30'
                : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            👩 家长版
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>已完成 {filledCount}/{TOTAL_DAYS} 天</span>
            <span>共 {totalChars} 字</span>
          </div>
          <div className="w-full bg-[var(--border-color)]/30 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(filledCount / TOTAL_DAYS) * 100}%`,
                background: 'linear-gradient(90deg, var(--text-accent), var(--text-accent-gold))',
              }}
            />
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {dayQuestions.map((d, i) => {
            const isFilled = entries[i]?.objective || entries[i]?.reflective;
            return (
              <button
                key={i}
                onClick={() => setCurrentDay(i)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  i === currentDay
                    ? 'bg-[var(--text-accent)]/20 text-[var(--text-accent)] border border-[var(--text-accent)]/30'
                    : isFilled
                      ? 'border border-[var(--text-accent)]/20 text-[var(--text-secondary)] bg-[var(--bg-highlight)]'
                      : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                {d.emoji} D{i + 1}<br />
                <span className="opacity-70">{d.title.slice(0, 3)}</span>
              </button>
            );
          })}
        </div>

        {/* Day Title */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">
            D{currentDay + 1} · {dayQuestions[currentDay].emoji} {dayQuestions[currentDay].title}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">{dayQuestions[currentDay].desc}</p>
        </div>

        {/* ORID Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const val = currentEntry[step.key] || '';
            return (
              <div
                key={step.key}
                className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{step.icon}</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{step.label}</span>
                  <span className="text-xs text-[var(--text-secondary)] ml-auto">
                    {val.length}/{MAX_CHARS}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-accent)] mb-3 font-medium">
                  {mode === 'kids' ? step.kidQuestion : step.parentQuestion}
                </p>
                <textarea
                  value={val}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) {
                      updateEntry(step.key, e.target.value);
                    }
                  }}
                  placeholder={step.placeholder}
                  className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-sm resize-none focus:outline-none focus:border-[var(--text-accent)] transition-colors"
                  rows={3}
                />
              </div>
            );
          })}
        </div>

        {/* Day Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentDay(c => Math.max(0, c - 1))}
            disabled={currentDay === 0}
            className="px-4 py-2 rounded-xl text-sm border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← 上一天
          </button>
          <button
            onClick={() => setCurrentDay(c => Math.min(TOTAL_DAYS - 1, c + 1))}
            disabled={currentDay === TOTAL_DAYS - 1}
            className="px-4 py-2 rounded-xl text-sm border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            下一天 →
          </button>
        </div>

        {/* Summary Report */}
        {filledCount >= 3 && (
          <div className="mt-12">
            <div className="gold-divider mb-8" />
            <h2 className="text-xl font-bold mb-6 text-center gradient-text">📊 成长报告预览</h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center">
                <div className="text-2xl font-bold text-[var(--text-accent)]">{filledCount}</div>
                <div className="text-xs text-[var(--text-secondary)]">完成天数</div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center">
                <div className="text-2xl font-bold text-[var(--text-accent)]">{totalChars}</div>
                <div className="text-xs text-[var(--text-secondary)]">总字数</div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center">
                <div className="text-2xl font-bold text-[var(--text-accent)]">
                  {mode === 'kids' ? '🧒' : '👩'}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{mode === 'kids' ? '孩子版' : '家长版'}</div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center">
                <div className="text-2xl font-bold text-[var(--text-accent)]">📋</div>
                <div className="text-xs text-[var(--text-secondary)]">可打印</div>
              </div>
            </div>

            {/* Quick View of Entries */}
            <div className="space-y-3 mb-6">
              {dayQuestions.map((d, i) => {
                const e = entries[i];
                if (!e || (!e.objective && !e.reflective)) return null;
                const preview = (e.objective || e.reflective || '').slice(0, 60);
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentDay(i)}
                    className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left hover:bg-[var(--bg-card-hover)] transition-all"
                  >
                    <div className="text-xs font-bold text-[var(--text-accent)] mb-1">
                      D{i + 1} · {d.emoji} {d.title}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">{preview}…</div>
                  </button>
                );
              })}
            </div>

            {/* Print/Export */}
            <div className="text-center">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, var(--text-accent), var(--text-accent-gold))',
                }}
              >
                🖨️ 打印成长报告
              </button>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                打印后可作为活动纪念永久保存
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 p-4 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-accent)]">
          <h3 className="font-bold text-sm text-[var(--text-accent)] mb-2">💡 使用建议</h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• 每天活动结束后填写，趁记忆新鲜效果最好</li>
            <li>• 孩子版和家长版分开填写，活动结束后可以互看</li>
            <li>• 不必写长篇大论，几句话也是好的反思</li>
            <li>• 数据保存在浏览器中，更换设备或清缓存会丢失</li>
            <li>• 完成3天以上即可预览成长报告</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
