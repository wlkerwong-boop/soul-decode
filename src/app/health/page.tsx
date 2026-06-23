'use client';

import Link from 'next/link';


const steps = [
  {
    icon: '📝',
    title: '填写症状',
    desc: '描述你的不适症状：部位、性质、时间规律',
  },
  {
    icon: '👅',
    title: '拍摄舌苔',
    desc: '在自然光下拍摄3张舌苔照片，辅助辨证',
  },
  {
    icon: '🧠',
    title: 'AI辨证分析',
    desc: '融合中医通鉴数据库+四圣心源理论，精准辨证',
  },
  {
    icon: '📋',
    title: '获取调理方案',
    desc: '包含中药处方、饮食建议、经络保健等完整方案',
  },
];

export default function HealthPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 gradient-bg min-h-screen">
        {/* 导航 */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[var(--text-accent)] text-xl font-bold tracking-wider">✦ 灵魂解码</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] overflow-x-auto scrollbar-hide whitespace-nowrap -mb-1 px-2">
            <Link href="/mbti" className="hover:text-[var(--text-accent)] transition-colors ">MBTI性格</Link>
            <Link href="/astrology" className="hover:text-[var(--text-accent)] transition-colors ">星座占星</Link>
          </div>
        </nav>

        {/* Hero 区域 */}
        <section className="px-6 pt-16 pb-12 text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6">
            <span className="tag-pill text-xs tracking-widest">🀄 中医辨证 + AI 深度解读</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            身心同调
            <br />
            <span className="text-[var(--text-accent)]">· AI中医辨证</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto mb-4">
            融合<span className="text-[var(--text-primary)]">中医通鉴数据库</span>与AI深度解读，
            <br className="" />
            以黄元御「一气周流」理论为辨证核心，为您生成精准的体质分析与调理方案
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="tag-pill">🌿 四圣心源</span>
            <span className="tag-pill">⚖️ 一气周流</span>
            <span className="tag-pill">👅 舌诊辨证</span>
            <span className="tag-pill">💊 中药处方</span>
            <span className="tag-pill">🥗 饮食调摄</span>
            <span className="tag-pill">🪡 经络保健</span>
          </div>
        </section>

        {/* 金色分隔 */}
        <div className="gold-divider max-w-4xl mx-auto mb-12" />

        {/* 服务流程 */}
        <section className="px-6 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">
            服务<span className="text-[var(--text-accent)]">流程</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative p-6 rounded-xl border border-[var(--border-color)] bg-black/40 backdrop-blur-sm hover:border-[var(--text-accent)]/40 transition-all group"
              >
                {/* 步骤编号 */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[var(--text-accent)] text-black text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="text-4xl mb-4 mt-2">{step.icon}</div>
                <h3 className="text-lg font-bold text-[var(--text-accent)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA 区域 */}
        <section className="px-6 pb-12 text-center max-w-2xl mx-auto">
          <Link
            href="/health/assessment"
            className="btn-gold inline-block text-lg tracking-wide"
          >
            ✦ 开始健康评测 ✦
          </Link>
          <p className="text-sm text-[var(--text-secondary)] mt-4 opacity-60">
            评测约需 3-5 分钟 · 基于中医经典理论
          </p>
        </section>

        {/* 金色分隔 */}
        <div className="gold-divider max-w-4xl mx-auto mb-12" />

        {/* 中医通鉴链接 */}
        <section className="px-6 pb-24 text-center">
          <h2 className="text-xl font-bold mb-4">
            探索<span className="text-[var(--text-accent)]">中医通鉴</span>知识库
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xl mx-auto">
            深入了解四圣心源、圆运动的古中医学、本草纲目等经典中医理论，构建完整的中医认知体系
          </p>
          <Link
            href="/tcm"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--text-accent)] text-[var(--text-accent)] rounded-lg hover:bg-[var(--text-accent)]/10 transition-all"
          >
            📖 点击查看完整知识库
            <span className="text-lg">→</span>
          </Link>
        </section>

        {/* 底部 */}
        <footer className="border-t border-[var(--border-color)] py-8 px-6">
          <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)] opacity-40">
            <p>灵魂解码 · 身心同调 · AI中医辨证</p>
            <p className="mt-1">本评测结果仅供参考，不构成医疗诊断建议</p>
            <p className="mt-1">
              <Link href="/" className="hover:text-[var(--text-accent)] transition-colors">← 返回首页</Link>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
