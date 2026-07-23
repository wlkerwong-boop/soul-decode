'use client';

import BodygraphSVG from '@/components/BodygraphSVG';
import Link from 'next/link';

const DEMO_HUMAN_DESIGN = {
  definedCenters: ['Head', 'Ajna', 'Throat', 'G', 'Ego', 'Sacral', 'Root'],
  activatedGates: [1,2,3,5,7,8,10,11,13,14,15,16,17,20,21,23,24,25,26,27,28,29,31,33,34,35,39,40,41,42,43,44,45,46,47,48,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64],
  channels: ['1-8','2-14','3-60','5-15','7-31','10-20','11-56','13-33','16-48','17-62','20-34','21-45','23-43','24-61','25-51','26-44','27-50','28-38','29-46','30-41','31-7','32-54','33-13','34-20','35-36','37-40','39-55','41-30','42-53','43-23','44-26','45-21','46-29','47-64','48-16','50-27','51-25','52-9','53-42','54-32','55-39','56-11','57-34','58-18','59-6','60-3','61-24','62-17','63-4','64-47'],
  centerDefinition: {},
};

export default function Home() {
  const scrollToForm = () => {
    window.location.href = '/master-report';
  };

  return (
    <div className="gradient-bg min-h-screen">
      {/* ── Hero ── */}
      <section className="hero-premium relative pt-20 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-[0.04]">
            <BodygraphSVG
              definedCenters={DEMO_HUMAN_DESIGN.definedCenters}
              activatedGates={DEMO_HUMAN_DESIGN.activatedGates}
              channels={DEMO_HUMAN_DESIGN.channels}
              centerDefinition={DEMO_HUMAN_DESIGN.centerDefinition}
            />
          </div>
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-primary)]/10 blur-[120px] animate-glow-pulse" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs mb-6 border border-[var(--color-primary)]/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            自我认知测评工具 · 科学成长导航
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-tight animate-slide-up-1">
            发现<span className="gradient-text">真实的自己</span>
            <br />找到成长的方向
          </h1>
          <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-2xl mx-auto animate-slide-up-2">
            多维人格分析 · 天赋识别 · 成长路径规划<br />
            融合心理学与传统文化智慧，用数据看清自己
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-3">
            <Link href="/mbti"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 transition-all">
              🧠 大五人格测评 →
            </Link>
            <button onClick={scrollToForm}
              className="px-8 py-3.5 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-medium text-lg hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all">
              深度自我认知报告 →
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-[var(--text-tertiary)] animate-slide-up-4">
            <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> 多维度测评</span>
            <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> AI智能解读</span>
            <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> 个性化成长方案</span>
          </div>
        </div>
      </section>

      {/* ── 核心测评 ── */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="text-center mb-10 animate-slide-up-2">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3">核心测评</h2>
          <p className="text-[var(--text-secondary)] text-sm">科学工具 + 传统文化智慧，全方位认识自己</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 大五人格 */}
          <Link href="/mbti" className="glass-card group relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 hover:shadow-lg transition-all animate-slide-up-3">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-xl" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🧠</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">大五人格测评</h3>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-500/10 text-blue-600 font-medium">心理学黄金标准</span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mb-3">Big Five Personality Test</p>
                <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                  基于国际公认的大五人格模型（开放性、尽责性、外向性、宜人性、神经质），科学评估您的人格特质。了解自己的情绪模式、社交风格、工作偏好和成长空间。
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-blue-500/8 text-blue-600 border border-blue-500/15">科学量表</span>
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-blue-500/8 text-blue-600 border border-blue-500/15">AI深度解读</span>
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-blue-500/8 text-blue-600 border border-blue-500/15">成长建议</span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                  开始测评 →→
                </span>
              </div>
            </div>
          </Link>

          {/* 深度自我认知 */}
          <div className="glass-card group relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 hover:shadow-lg transition-all animate-slide-up-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-t-xl" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🌟</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">深度自我认知报告</h3>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium">旗舰</span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mb-3">多维人格 · 天赋识别 · 成长路径 · 时间节奏</p>
                <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                  输入出生信息，AI为您生成一份深度自我认知报告——涵盖性格特质、天赋优势、成长路径、健康建议，融合心理学与传统文化智慧进行多维交叉分析。
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] border border-[var(--color-primary)]/15">多维交叉</span>
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] border border-[var(--color-primary)]/15">AI深度解读</span>
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] border border-[var(--color-primary)]/15">成长路径图</span>
                </div>
                <button onClick={scrollToForm}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline">
                  立即生成 →→
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 更多工具 ── */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3">更多工具</h2>
          <p className="text-[var(--text-secondary)] text-sm">传统文化智慧辅助，帮助您从多个维度认识自己</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/human-design" className="group flex flex-col items-center p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧬</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">人类图解析</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-1">类型·中心·通道·闸门</span>
          </Link>
          <Link href="/master-report" className="group flex flex-col items-center p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔮</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">八字命盘</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-1">四柱·五行·十神·大运</span>
          </Link>
          <Link href="/compatibility" className="group flex flex-col items-center p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">❤️</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">关系合盘</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-1">双人·家庭·朋友</span>
          </Link>
        </div>
      </section>

      {/* ── 信任数据 ── */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '50,000+', label: '已生成报告', sub: '用户信赖选择' },
            { value: '7', label: '多维测评体系', sub: '心理学·命理·占星·人类图·中医体质' },
            { value: '★', label: '认证引擎', sub: '国际标准对齐' },
            { value: '∞', label: 'AI深度解读', sub: '个性化成长报告' },
          ].map((s, i) => (
            <div key={i} className="text-center p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/30 animate-slide-up-3" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="stat-value text-2xl md:text-3xl font-bold gradient-text mb-1">{s.value}</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">{s.label}</div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 创始人故事 ── */}
      <section className="px-4 pb-16 max-w-3xl mx-auto">
        <div className="founder-card p-8 md:p-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent border border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">关于光明喜舍</h2>
          <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>2016年起深入研习心理学人格理论、东方传统文化与人类图体系。</p>
            <p>多维度测评融合并非简单堆叠——心理学为基、人类图为骨、传统文化为脉。多个维度交叉印证，才是一份真正完整的自我认知报告。</p>
            <p>目前在大理·银桥持续深耕，致力于将东方智慧与现代AI技术结合，帮助每个人看清真实的自己。</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section px-4 pb-20 max-w-2xl mx-auto text-center">
        <div className="relative p-10 rounded-2xl border border-[var(--border-color)] bg-gradient-to-b from-[var(--color-primary)]/8 to-transparent overflow-hidden">
          <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[var(--color-primary)]/5 blur-[100px]" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">准备好发现真实的自己了吗？</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">只需输入出生信息，即可获得一份专属于您的深度自我认知报告</p>
            <button onClick={scrollToForm}
              className="btn-premium px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-[var(--color-primary)]/25 transition-all">
              开始测评 →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
