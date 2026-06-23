'use client';

import { useState, useCallback } from 'react';

// ── 4 Themes × Questions ──
interface TalkCard {
  theme: string;
  icon: string;
  color: string;
  questions: string[];
}

const talkCards: TalkCard[] = [
  {
    theme: '破冰相识',
    icon: '👋',
    color: 'rgba(74, 124, 111, 0.08)',
    questions: [
      '如果这位先贤来到我们面前，你觉得他最想对我们说什么？',
      '为什么那么多有学问的人都在研究这个人？你觉得他有什么特别之处？',
      '你说说看，有哪一件事是这个人做的，而你觉得自己也能做到？',
      '如果让你用一个词形容他，你会用什么词？为什么？',
      '你觉得他小时候会是个什么样的孩子？跟你像吗？',
      '他的故事里，最让你意外的一件事是什么？',
      '如果他是你的同桌，你们会成为好朋友吗？为什么？',
    ],
  },
  {
    theme: '深挖理解',
    icon: '🔍',
    color: 'rgba(201, 160, 110, 0.08)',
    questions: [
      '他人生最难的时候，是什么支撑了他？如果是你，你会怎么做？',
      '你觉得他的哪一个选择最了不起？为什么这个选择很难？',
      '如果把他放在今天的昌宁茶山上，他会做什么？',
      '他有没有做过让你觉得"这人也太厉害了吧"的事？是什么？',
      '你觉得他有没有害怕过？他是怎么面对害怕的？',
      '如果可以问他一个问题，你会问什么？为什么想问这个？',
      '他做的这些事，换一个人来做，能做成吗？为什么只有他做成了？',
    ],
  },
  {
    theme: '草原有感',
    icon: '🌿',
    color: 'rgba(96, 165, 250, 0.08)',
    questions: [
      '你看这片草原，先贤们有没有看过同样的风景？',
      '你要是能穿越回去见他一面，你想问他一个什么问题？',
      '你觉得我们在这里立牌，和先贤们当年做的事情，有什么相同的地方？',
      '草原上的风、草、云，你觉得哪个最像他的精神？为什么？',
      '走在这片草原上，你觉得他的心情会是什么样的？',
      '如果他在我们身边，看到我们为立牌忙前忙后，他会说什么？',
      '昌宁的茶山和草原，你觉得他最喜欢哪个地方？',
    ],
  },
  {
    theme: '反思联结',
    icon: '💡',
    color: 'rgba(201, 106, 110, 0.08)',
    questions: [
      '参加完这次活动，你对这位先贤的理解有没有变化？',
      '如果明年再来，你想选谁做你的榜样？为什么？',
      '你觉得你身上的哪个品质和你的榜样最像？',
      '这次活动里，你什么时候觉得"我好像也有他那样的精神"？',
      '你觉得你的先贤会怎么评价你写的诗？他会为你骄傲吗？',
      '回家以后，你会怎么跟没来的朋友介绍这位先贤？',
      '如果让你给先贤写一句回信，你会写什么？',
    ],
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(cards: TalkCard[], count: number = 3): { card: TalkCard; questions: string[] }[] {
  // Pick 3 different themes, each gets some questions
  const shuffledThemes = shuffleArray(cards);
  const selected = shuffledThemes.slice(0, Math.min(count, shuffledThemes.length));
  return selected.map(card => ({
    card,
    questions: shuffleArray(card.questions).slice(0, 2), // 2 questions per theme
  }));
}

export default function TalkPage() {
  const [picked, setPicked] = useState(() => pickQuestions(talkCards, 3));
  const [currentTheme, setCurrentTheme] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleRefresh = useCallback(() => {
    setPicked(pickQuestions(talkCards, 3));
    setCurrentTheme(0);
  }, []);

  const handleNoteChange = (qIdx: number, value: string) => {
    const key = `${currentTheme}-${qIdx}`;
    setNotes(prev => ({ ...prev, [key]: value }));
  };

  const current = picked[currentTheme];

  return (
    <div className="min-h-screen gradient-bg px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-3xl font-bold mb-2">亲子对话卡</h1>
          <p className="text-[var(--text-secondary)] mb-4">
            和孩子聊先贤，不必找话题——打开它，问题已经有了。
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="tag-pill">👋 破冰相识</span>
            <span className="tag-pill">🔍 深挖理解</span>
            <span className="tag-pill">🌿 草原有感</span>
            <span className="tag-pill">💡 反思联结</span>
          </div>
        </div>

        <div className="gold-divider mb-8" />

        {/* Theme Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {picked.map((p, i) => (
            <button
              key={i}
              onClick={() => setCurrentTheme(i)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                i === currentTheme
                  ? 'bg-[var(--text-accent)]/20 text-[var(--text-accent)] border border-[var(--text-accent)]/30'
                  : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              {p.card.icon} {p.card.theme}
            </button>
          ))}
        </div>

        {/* Current Theme Card */}
        {current && (
          <div
            className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] mb-6"
            style={{ background: current.card.color, borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{current.card.icon}</span>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{current.card.theme}</h2>
              <span className="text-xs tag-pill ml-auto">
                主题 {currentTheme + 1} / {picked.length}
              </span>
            </div>

            <div className="space-y-4">
              {current.questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]/50"
                >
                  <p className="text-base text-[var(--text-primary)] leading-relaxed mb-3 font-medium">
                    {q}
                  </p>
                  <textarea
                    value={notes[`${currentTheme}-${qIdx}`] || ''}
                    onChange={(e) => handleNoteChange(qIdx, e.target.value)}
                    placeholder="记录你们的对话……（可选）"
                    className="w-full p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-sm resize-none focus:outline-none focus:border-[var(--text-accent)] transition-colors"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleRefresh}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--text-accent), var(--text-accent-gold))',
            }}
          >
            🔄 换一批话题
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-accent)]">
          <h3 className="font-bold text-sm text-[var(--text-accent)] mb-2">💡 使用建议</h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• 在行走途中、晚饭后、睡前，自然地问，不要像考试</li>
            <li>• 孩子回答后，先肯定再追问："哦？为什么你会这么想？"</li>
            <li>• 家长也可以分享自己的答案——这不是"考孩子"</li>
            <li>• 孩子说"不知道"的时候，换成选择题："是A还是B？"</li>
            <li>• 记录有趣的回答，活动结束后可以整理进成长档案</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
