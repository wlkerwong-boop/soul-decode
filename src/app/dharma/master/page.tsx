'use client';

import Link from 'next/link';

export default function MasterPage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* ── 导航 ── */}
      <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="gradient-text text-xl font-bold tracking-wider">
              ✦ 灵魂解码
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <Link href="/dharma" className="hover:text-[var(--text-accent)] transition-colors">
              ☸ 法藏
            </Link>
            <span className="opacity-60 hidden md:inline">·</span>
            <span className="opacity-60 hidden md:inline">金刚法藏 · 双师传承</span>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-16 pb-8 text-center max-w-4xl mx-auto">
        <div className="inline-block mb-6">
          <span className="tag-pill text-xs tracking-widest">寂如师父 · 金刚法藏传承</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
          📿 金刚法藏
          <br />
          <span className="gradient-text">传承 · 师承 · 心印</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto">
          寂如师父的师承脉络与金刚法藏传承，了解法脉源流与核心心法
        </p>
      </section>

      {/* ── 金色分隔 ── */}
      <div className="gold-divider max-w-5xl mx-auto mb-12" />

      {/* ── 师承脉络 ── */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">师承脉络</h2>
          <p className="text-sm text-[var(--text-secondary)]">双师传承 · 法脉源流</p>
        </div>

        <div className="relative">
          {/* 传承线 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--text-accent)] via-[var(--text-accent-gold)] to-[var(--text-accent)] -translate-x-1/2 hidden md:block" />

          {masters.map((m, i) => (
            <div key={m.name} className={`flex items-center gap-8 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              {/* 空格（桌面端交替布局用） */}
              <div className="hidden md:block flex-1" />

              {/* 节点 */}
              <div className="relative z-10 shrink-0">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border-2"
                  style={{
                    background: `linear-gradient(135deg, ${m.bgFrom}, ${m.bgTo})`,
                    borderColor: m.borderColor,
                    boxShadow: `0 0 20px ${m.glowColor}`,
                  }}
                >
                  {m.icon}
                </div>
                {/* 连线点（桌面端） */}
                <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--text-accent)] border-2 border-[var(--bg-page)]"
                  style={{ [i % 2 === 0 ? 'right' : 'left']: '-0.5rem' }}
                />
              </div>

              {/* 卡片 */}
              <div className="flex-1 card-jade p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{m.name}</h3>
                <p className="text-xs text-[var(--text-accent)] mb-3">{m.title}</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{m.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {m.tags.map(t => (
                    <span key={t} className="tag-pill text-xs">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 核心心法 ── */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">💎 核心心法</h2>
          <p className="text-sm text-[var(--text-secondary)]">法藏传承中的修行精要</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {teachings.map(t => (
            <div key={t.title} className="card-jade p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
              <div className="flex items-start gap-4">
                <div className="text-2xl shrink-0 mt-0.5">{t.icon}</div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-2">{t.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{t.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 底部 ── */}
      <footer className="border-t border-[var(--border-color)] py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)]">
          <p>📿 金刚法藏 · 寂如师父传承</p>
          <p className="mt-2">
            <Link href="/dharma" className="hover:text-[var(--text-accent)] transition-colors opacity-60 hover:opacity-100">
              ← 返回法藏首页
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

const masters = [
  {
    icon: '🪷',
    name: '释迦牟尼佛',
    title: '本师 · 佛法创始人',
    description: '佛陀在菩提树下觉悟后，初转法轮，建立僧团，为众生开示解脱之道。佛法传承两千五百余年，至今法脉不断。',
    tags: ['觉悟', '四圣谛', '八正道', '缘起法'],
    bgFrom: 'rgba(201, 169, 110, 0.15)',
    bgTo: 'rgba(201, 169, 110, 0.05)',
    borderColor: 'rgba(201, 169, 110, 0.3)',
    glowColor: 'rgba(201, 169, 110, 0.2)',
  },
  {
    icon: '🧘',
    name: '历代祖师',
    title: '传承 · 心印相传',
    description: '从迦叶尊者到达摩祖师，再到历代禅宗大德，佛法以心印心，代代相传。中国禅宗更发展出独特的直指人心的法门。',
    tags: ['心印', '传灯', '直指人心', '见性成佛'],
    bgFrom: 'rgba(96, 165, 250, 0.15)',
    bgTo: 'rgba(96, 165, 250, 0.05)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    glowColor: 'rgba(96, 165, 250, 0.15)',
  },
  {
    icon: '🎙️',
    name: '金刚老师',
    title: '保山 · 在家居士 · 实修指导',
    description: '金刚老师是寂如师父的根本老师，家居保山，以在家身份实修实证。其教导不拘泥于形式，直指修行核心——实事求是、如实面对自己的生命状态。',
    tags: ['保山', '在家修行', '实事求是', '如实面对'],
    bgFrom: 'rgba(74, 222, 128, 0.15)',
    bgTo: 'rgba(74, 222, 128, 0.05)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
    glowColor: 'rgba(74, 222, 128, 0.15)',
  },
  {
    icon: '☸',
    name: '寂如师父',
    title: '当代 · 修行指导 · 法语开示',
    description: '寂如师父师从金刚老师，修行近十年，致力于传承佛陀正法。其开示以现代语言诠释古老智慧，帮助修行者将佛法落实于日常生活，实现生命的如实转化。',
    tags: ['佛法修学', '现代诠释', '生命转化', '解脱道'],
    bgFrom: 'rgba(192, 132, 252, 0.15)',
    bgTo: 'rgba(192, 132, 252, 0.05)',
    borderColor: 'rgba(192, 132, 252, 0.3)',
    glowColor: 'rgba(192, 132, 252, 0.15)',
  },
];

const teachings = [
  {
    icon: '🎯',
    title: '实事求是',
    description: '修行的根本态度——不美化、不逃避、不自我欺骗。如实面对自己的生命状态是一切修行的起点。',
  },
  {
    icon: '🪞',
    title: '从自我到真心',
    description: '区分"自我"与"真实的自己"，透过觉察自我的运作模式，回归生命的本质状态。',
  },
  {
    icon: '🌊',
    title: '观无常破执着',
    description: '观照一切现象的不断变化，从对确定性的执着中解脱，获得真正的自由。',
  },
  {
    icon: '🕸️',
    title: '缘起与解脱',
    description: '理解万法因缘生的道理，在缘起链中找到解脱的突破口——切断无明与渴爱。',
  },
];
