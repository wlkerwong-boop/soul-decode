'use client';

import { useState, useEffect } from 'react';
import BirthInputForm from '@/components/BirthInputForm';

const stats = [
  { num: '8', label: '核心维度' },
  { num: '∞', label: 'AI解读组合' },
  { num: '24h', label: '全自动生成' },
  { num: '⭐', label: '五星反馈' },
];

const features = [
  { icon: '🔮', title: '八字命盘', desc: '基于真实八字算法排盘，四柱八字的深度解读，揭示你与生俱来的天赋与挑战。', cta: '/astrology' },
  { icon: '📈', title: '能量K线', desc: '以K线图可视化你的能量波动趋势，把握人生关键节点的涨跌节奏。', cta: '/astrology' },
  { icon: '🎭', title: '性格解码', desc: '融合MBTI四维性格模型与心理学原型，揭示你行为模式背后的深层驱动力。', cta: '/mbti' },
  { icon: '💼', title: '职业道路', desc: '基于八字十神与五行喜忌，分析你的职业天赋方向与发展潜力。' },
  { icon: '❤️', title: '关系蓝图', desc: '解读你的情感模式与人际关系密码，了解自己在亲密关系中的核心需求。' },
  { icon: '💰', title: '财富密码', desc: '分析八字中财星格局，揭示你的财富获取模式与理财盲点。' },
  { icon: '🗺️', title: '人生时间线', desc: '大运流年推演，预见人生各阶段的重要转折与机遇窗口。' },
  { icon: '☯️', title: '身心健康', desc: '结合中医五脏平衡理念与倪海厦经方智慧，提供个性化的健康调养建议。', cta: '/health' },
];

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="gradient-bg">
      {/* ── Hero Section ── */}
      <section className="px-4 pt-12 md:pt-20 pb-10 md:pb-16 text-center relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.03] pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--text-accent) 0%, transparent 70%)' }}
        />

        <div className="max-w-3xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-highlight)] border border-[var(--border-accent)] text-[var(--text-accent)] text-xs md:text-sm mb-6 md:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-accent)] animate-pulse" />
            AI深度解读 + 真实八字排盘
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4 md:mb-6">
            输入出生信息
            <br />
            <span className="gradient-text">看见真实的自己</span>
          </h1>

          <p className="text-sm md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-6 md:mb-8 px-2">
            基于真实八字算法，融合心理学原型与AI深度解读，
            生成让你感到<span className="text-[var(--text-primary)] font-medium">"被看穿"</span>的灵魂级分析报告
          </p>

          {/* CTA Button - scrolls to form */}
          <button
            onClick={() => {
              const form = document.getElementById('birth-form-section');
              if (form) form.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-jade inline-flex items-center justify-center px-8 md:px-12 py-3 md:py-4 text-base md:text-lg max-w-xs mx-auto"
            style={{ width: 'auto' }}
          >
            ✦ 立即开始解析
          </button>

          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mt-6 md:mt-8">
            {features.slice(0, 4).map((f, i) => (
              <span key={i} className="tag-pill text-xs md:text-sm">
                {f.icon} {f.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="gold-divider max-w-3xl mx-auto my-6 md:my-8" />

      {/* ── Input Form (now immediately after hero) ── */}
      <section id="birth-form-section" className="px-4 md:px-6 pb-10 md:pb-16 max-w-4xl mx-auto scroll-mt-20">
        <div className="card-jade p-5 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              输入你的<span className="gradient-text">出生信息</span>
            </h2>
            <p className="text-xs md:text-sm text-[var(--text-secondary)]">
              八字排盘 · 能量K线 · 性格解码 · AI深度解读
            </p>
          </div>
          <BirthInputForm />
        </div>
      </section>

      {/* ── 八大维度 (Mobile-friendly cards - no flip, just tap to expand) ── */}
      <section className="px-4 md:px-6 pb-16 md:pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            探索<span className="gradient-text">八大维度</span>自我认知
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            点击卡片查看详情，每个维度都为你揭示真实的自己
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 max-w-5xl mx-auto">
          {features.map((card, i) => (
            <div
              key={card.title}
              className="card-jade p-4 md:p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-300 min-h-[140px] md:min-h-[180px] justify-center"
              style={{
                borderColor: activeFeature === i ? 'var(--text-accent)' : undefined,
                boxShadow: activeFeature === i ? '0 0 20px var(--glow-green)' : undefined,
              }}
              onClick={() => setActiveFeature(activeFeature === i ? null : i)}
              onMouseEnter={() => setActiveFeature(i)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-3 md:mb-4 transition-transform duration-300"
                style={{
                  transform: activeFeature === i ? 'scale(1.1)' : 'scale(1)',
                  background: `linear-gradient(135deg, rgba(74, 124, 111, 0.10), rgba(74, 124, 111, 0.04))`,
                  border: '1px solid rgba(74, 124, 111, 0.20)',
                }}
              >
                {card.icon}
              </div>

              {activeFeature === i ? (
                <div className="animate-fade-in">
                  <h4 className="text-xs md:text-sm font-bold text-[var(--text-primary)] mb-1 md:mb-2">{card.title}</h4>
                  <p className="text-[10px] md:text-xs text-[var(--text-secondary)] leading-relaxed">{card.desc}</p>
                  {card.cta && (
                    <a
                      href={card.cta}
                      className="inline-block mt-2 md:mt-3 px-3 py-1 rounded-full text-[10px] md:text-xs font-medium text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #4a7c6f, #3a6a5e)' }}
                      onClick={e => e.stopPropagation()}
                    >
                      开始探索 →
                    </a>
                  )}
                </div>
              ) : (
                <>
                  <h3 className="text-sm md:text-lg font-bold text-[var(--text-primary)] mb-0.5 md:mb-1">{card.title}</h3>
                  <p className="text-[10px] md:text-xs text-[var(--text-secondary)] opacity-70">点击查看详情</p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 统计区域 ── */}
      <section className="px-4 md:px-6 py-12 md:py-16" style={{ background: 'var(--bg-section-alt)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="card-jade p-4 md:p-6 text-center"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">{stat.num}</div>
                <div className="text-[10px] md:text-xs text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials Placeholder ── */}
      <section className="px-4 md:px-6 py-12 md:py-16 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            用户<span className="gradient-text">反馈</span>
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)]">那些被说中的瞬间</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { text: '"看完报告直接哭了，完全是在说我"', user: '—— 北京 · 林女士' },
            { text: '"职业道路那一章帮我下定了转行的决心"', user: '—— 杭州 · 张先生' },
            { text: '"跟男朋友一起测了合盘，太准了"', user: '—— 成都 · 小王' },
          ].map((t, i) => (
            <div key={i} className="card-jade p-5 md:p-6 text-center">
              <p className="text-sm md:text-base text-[var(--text-primary)] mb-3 leading-relaxed">{t.text}</p>
              <p className="text-xs text-[var(--text-secondary)] opacity-60">{t.user}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 md:px-6 py-12 md:py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div
            className="p-6 md:p-10 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(74, 124, 111, 0.06), rgba(201, 160, 110, 0.04))',
              border: '1px solid var(--border-accent)',
            }}
          >
            <h2 className="text-xl md:text-2xl font-bold mb-3">准备好了吗？</h2>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] mb-6">
              只需输入出生日期、时间和地点，AI将为你生成深度解析报告
            </p>
            <button
              onClick={() => {
                const form = document.getElementById('birth-form-section');
                if (form) form.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-jade inline-flex items-center justify-center px-8 md:px-10 py-3 md:py-4 text-base md:text-lg"
              style={{ width: 'auto' }}
            >
              ✦ 立即开始解析
            </button>
            <p className="mt-4 text-[10px] md:text-xs text-[var(--text-secondary)] opacity-50">
              免费体验 · 信息仅用于本报告生成 · 不存储
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
