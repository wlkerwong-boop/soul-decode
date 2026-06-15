"use client";

import BirthInputForm from '@/components/BirthInputForm';

export default function Home() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* ── Navigation ── */}
      <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="gradient-text text-xl font-bold tracking-wider">✦ 灵魂解码</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
            <a href="/my" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              📁 档案
            </a>
            <a href="/health" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              身心健康
            </a>
            <a href="/mbti" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              MBTI性格
            </a>
            <a href="/astrology" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              星座占星
            </a>
            <a href="/tcm" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              中医通鉴
            </a>
            <a href="/dharma" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              ☸ 法藏
            </a>
            <span className="opacity-30 hidden md:inline">·</span>
            <span className="text-xs text-[var(--text-secondary)] opacity-50 hidden md:inline">
              八字排盘 · 能量K线 · AI深度解读
            </span>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="hero-jade px-6 pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-highlight)] border border-[var(--border-accent)] text-[var(--text-accent)] text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--text-accent)] animate-pulse" />
            AI深度解读 + 真实八字排盘
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            输入你的出生信息
            <br />
            <span className="gradient-text">看见真实的自己</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-8">
            基于真实八字算法排盘，融合心理学原型与AI深度解读，
            <br className="hidden sm:inline" />
            生成一份让你感到<span className="text-[var(--text-primary)] font-medium">"被看穿"</span>的灵魂级分析报告
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {[
              ['🔮', '八字命盘'],
              ['📈', '能量K线'],
              ['🎭', '性格解码'],
              ['🗡️', '天赋与弱点'],
              ['💼', '职业道路'],
              ['❤️', '关系蓝图'],
              ['💰', '财富密码'],
              ['🗺️', '人生时间线'],
            ].map(([emoji, text]) => (
              <span key={text} className="tag-pill">
                {emoji} {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gold Divider ── */}
      <div className="gold-divider max-w-3xl mx-auto my-8" />

      {/* ── Input Form ── */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div className="card-jade p-6 md:p-8">
          <BirthInputForm />
        </div>
      </section>

      {/* ── 服务卡片区 (卡片翻转) ── */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">
            探索<span className="gradient-text">八大维度</span>自我认知
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            悬停卡片查看详细描述，每个维度都为你揭示真实的自己
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {cards.map((card, i) => (
            <div key={card.title} className="flip-card h-60">
              <div className="flip-card-inner">
                {/* 正面 */}
                <div
                  className="flip-card-front card-jade p-6 flex flex-col items-center justify-center text-center cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${card.bgFrom}, ${card.bgTo})`,
                    border: `1px solid ${card.borderColor}`,
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                    style={{
                      background: card.iconBg,
                      border: `1px solid ${card.iconBorder}`,
                    }}
                  >
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">{card.subtitle}</p>
                </div>

                {/* 背面 */}
                <div
                  className="flip-card-back card-jade"
                  style={{
                    background: `linear-gradient(135deg, ${card.bgTo}, ${card.bgFrom})`,
                    border: `1px solid ${card.borderColor}`,
                  }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">{card.icon}</div>
                    <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">{card.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {card.description}
                    </p>
                    {card.cta && (
                      <a
                        href={card.cta}
                        className="inline-block mt-4 px-4 py-1.5 rounded-full text-xs font-medium text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, #4a7c6f, #3a6a5e)' }}
                      >
                        开始探索 →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 统计区域 ── */}
      <section className="px-6 py-16" style={{ background: 'var(--bg-section-alt)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: '8', label: '核心维度' },
              { num: '∞', label: 'AI解读组合' },
              { num: '24h', label: '全自动生成' },
              { num: '⭐', label: '五星反馈' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-jade p-6 text-center"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="text-3xl font-bold gradient-text mb-1">{stat.num}</div>
                <div className="text-xs text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div
            className="p-10 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(74, 124, 111, 0.06), rgba(201, 160, 110, 0.04))',
              border: '1px solid var(--border-accent)',
            }}
          >
            <h2 className="text-2xl font-bold mb-3">
              准备好了吗？
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              只需输入出生日期、时间和地点，AI将为你生成深度解析报告
            </p>
            <button
              onClick={() => {
                const form = document.querySelector('section.px-6.pb-16');
                if (form) form.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-jade inline-flex items-center justify-center px-10 py-4 text-lg"
              style={{ width: 'auto' }}
            >
              ✦ 立即开始解析
            </button>
            <p className="mt-4 text-xs text-[var(--text-secondary)] opacity-50">
              免费体验 · 信息仅用于本报告生成 · 不存储
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border-color)] py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)]">
          <p>灵魂解码 · 用AI看见真实的自己</p>
          <p className="mt-1">你的出生信息仅用于生成本次报告，不会存储</p>
          <p className="mt-2">
            <a href="/admin" className="hover:text-[var(--text-accent)] transition-colors opacity-60 hover:opacity-100">
              ⚙️ 管理
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

const cards = [
  {
    icon: '🔮',
    title: '八字命盘',
    subtitle: '真实排盘 · 深度解读',
    bgFrom: 'rgba(74, 124, 111, 0.04)',
    bgTo: 'rgba(74, 124, 111, 0.01)',
    iconBg: 'rgba(74, 124, 111, 0.10)',
    iconBorder: 'rgba(74, 124, 111, 0.20)',
    borderColor: 'rgba(74, 124, 111, 0.10)',
    description: '基于真实八字算法排盘，四柱八字的深度解读，揭示你与生俱来的天赋与挑战。',
    cta: '/astrology',
  },
  {
    icon: '📈',
    title: '能量K线',
    subtitle: '运势波动 · 趋势预测',
    bgFrom: 'rgba(201, 160, 110, 0.04)',
    bgTo: 'rgba(201, 160, 110, 0.01)',
    iconBg: 'rgba(201, 160, 110, 0.10)',
    iconBorder: 'rgba(201, 160, 110, 0.20)',
    borderColor: 'rgba(201, 160, 110, 0.10)',
    description: '以K线图可视化你的能量波动趋势，把握人生关键节点的涨跌节奏。',
    cta: '/astrology',
  },
  {
    icon: '🎭',
    title: '性格解码',
    subtitle: 'MBTI · 心理学原型',
    bgFrom: 'rgba(106, 156, 143, 0.04)',
    bgTo: 'rgba(106, 156, 143, 0.01)',
    iconBg: 'rgba(106, 156, 143, 0.10)',
    iconBorder: 'rgba(106, 156, 143, 0.20)',
    borderColor: 'rgba(106, 156, 143, 0.10)',
    description: '融合MBTI四维性格模型与心理学原型，揭示你行为模式背后的深层驱动力。',
    cta: '/mbti',
  },
  {
    icon: '💼',
    title: '职业道路',
    subtitle: '天赋定位 · 方向指引',
    bgFrom: 'rgba(74, 124, 111, 0.04)',
    bgTo: 'rgba(74, 124, 111, 0.01)',
    iconBg: 'rgba(74, 124, 111, 0.10)',
    iconBorder: 'rgba(74, 124, 111, 0.20)',
    borderColor: 'rgba(74, 124, 111, 0.10)',
    description: '基于八字十神与五行喜忌，分析你的职业天赋方向与发展潜力。',
  },
  {
    icon: '❤️',
    title: '关系蓝图',
    subtitle: '情感 · 亲子 · 人际',
    bgFrom: 'rgba(201, 160, 110, 0.04)',
    bgTo: 'rgba(201, 160, 110, 0.01)',
    iconBg: 'rgba(201, 160, 110, 0.10)',
    iconBorder: 'rgba(201, 160, 110, 0.20)',
    borderColor: 'rgba(201, 160, 110, 0.10)',
    description: '解读你的情感模式与人际关系密码，了解自己在亲密关系中的核心需求。',
  },
  {
    icon: '💰',
    title: '财富密码',
    subtitle: '财星 · 投资 · 理财',
    bgFrom: 'rgba(106, 156, 143, 0.04)',
    bgTo: 'rgba(106, 156, 143, 0.01)',
    iconBg: 'rgba(106, 156, 143, 0.10)',
    iconBorder: 'rgba(106, 156, 143, 0.20)',
    borderColor: 'rgba(106, 156, 143, 0.10)',
    description: '分析八字中财星格局，揭示你的财富获取模式与理财盲点。',
  },
  {
    icon: '🗺️',
    title: '人生时间线',
    subtitle: '大运流年 · 关键节点',
    bgFrom: 'rgba(74, 124, 111, 0.04)',
    bgTo: 'rgba(74, 124, 111, 0.01)',
    iconBg: 'rgba(74, 124, 111, 0.10)',
    iconBorder: 'rgba(74, 124, 111, 0.20)',
    borderColor: 'rgba(74, 124, 111, 0.10)',
    description: '大运流年推演，预见人生各阶段的重要转折与机遇窗口。',
  },
  {
    icon: '☯️',
    title: '身心健康',
    subtitle: '中医 · 经络 · 五脏',
    bgFrom: 'rgba(201, 160, 110, 0.04)',
    bgTo: 'rgba(201, 160, 110, 0.01)',
    iconBg: 'rgba(201, 160, 110, 0.10)',
    iconBorder: 'rgba(201, 160, 110, 0.20)',
    borderColor: 'rgba(201, 160, 110, 0.10)',
    description: '结合中医五脏平衡理念与倪海厦经方智慧，提供个性化的健康调养建议。',
    cta: '/health',
  },
];
