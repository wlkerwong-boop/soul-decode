import BirthInputForm from '@/components/BirthInputForm';
import CosmicBackground from '@/components/CosmicBackground';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* 星空背景 */}
      <CosmicBackground />

      {/* 内容区域 - 在星空之上 */}
      <div className="relative z-10 gradient-bg min-h-screen">
        {/* 导航 */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-accent)] text-xl font-bold tracking-wider">✦ 灵魂解码</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <a href="/health" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">身心健康</a>
            <a href="/mbti" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">MBTI性格</a>
            <a href="/astrology" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">星座占星</a>
            <span className="opacity-50 hidden md:inline">·</span>
            <span className="opacity-50 hidden md:inline">八字排盘 · 能量K线 · AI深度解读</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-6 pt-16 pb-12 text-center max-w-3xl mx-auto">
          <div className="inline-block mb-6">
            <span className="tag-pill text-xs tracking-widest">AI 深度解读 + 真实八字排盘</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            输入你的出生信息
            <br />
            <span className="text-[var(--text-accent)]">看见真实的自己</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-4">
            基于真实八字算法排盘，融合心理学原型与AI深度解读，
            <br className="hidden sm:inline" />
            生成一份让你感到<span className="text-[var(--text-primary)]">"被看穿"</span>的灵魂级分析报告
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="tag-pill">🔮 八字命盘</span>
            <span className="tag-pill">📈 能量K线</span>
            <span className="tag-pill">🎭 性格解码</span>
            <span className="tag-pill">🗡️ 天赋与弱点</span>
            <span className="tag-pill">💼 职业道路</span>
            <span className="tag-pill">❤️ 关系蓝图</span>
            <span className="tag-pill">💰 财富密码</span>
            <span className="tag-pill">🗺️ 人生时间线</span>
          </div>
        </section>

        {/* 金色分隔 */}
        <div className="gold-divider max-w-3xl mx-auto mb-12" />

        {/* 输入表单 */}
        <section className="px-6 pb-24 max-w-4xl mx-auto">
          <BirthInputForm />
        </section>

        {/* 底部 */}
        <footer className="border-t border-[var(--border-color)] py-8 px-6">
          <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)] opacity-40">
            <p>灵魂解码 · 用AI看见真实的自己</p>
            <p className="mt-1">你的出生信息仅用于生成本次报告，不会存储</p>
            <p className="mt-2">
              <a href="/admin" className="hover:text-[var(--text-accent)] transition-colors opacity-30 hover:opacity-60">⚙️ 管理</a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
