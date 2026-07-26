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
      {/* ═══════════════════════════════════════════
          Hero — 价值主张 + 唯一主按钮
          ═══════════════════════════════════════════ */}
      <section className="hero-premium relative pt-16 md:pt-20 pb-12 md:pb-16 px-4 text-center overflow-hidden">
        {/* 背景：人类图 + 光晕 */}
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
          {/* 顶部标签 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs mb-6 border border-[var(--color-primary)]/20 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            七系统融合 · AI 深度解读
          </div>

          {/* 价值主张标题 */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight animate-slide-up-1">
            7 大古老系统
            <br />
            <span className="gradient-text">1 份只属于你的报告</span>
          </h1>

          {/* 副标题：多系统点名 */}
          <p className="text-[var(--text-secondary)] text-base md:text-lg mb-3 max-w-xl mx-auto animate-slide-up-2">
            八字 · 人类图 · 占星 · 紫微斗数 · 五运六气 · MBTI · 中医体质
          </p>
          <p className="text-[var(--text-tertiary)] text-sm mb-8 max-w-lg mx-auto animate-slide-up-2">
            七个维度交叉印证，AI 深度融合解读 —— 不是七份报告，是一份完整的你
          </p>

          {/* 唯一主按钮 */}
          <div className="animate-slide-up-3">
            <button
              onClick={scrollToForm}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 transition-all"
            >
              免费排盘，看看你的出厂配置 →
            </button>
          </div>

          {/* 隐私承诺一句话 */}
          <p className="mt-5 text-xs text-[var(--text-tertiary)] animate-slide-up-4 flex items-center justify-center gap-1.5">
            <span>🔒</span>
            出生信息仅用于排盘，绝不外泄
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          样例报告节选区（NEW）
          ═══════════════════════════════════════════ */}
      <section className="px-4 pb-16 max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2">报告预览</h2>
          <p className="text-sm text-[var(--text-tertiary)]">一份让你感到"被看穿"的灵魂级分析</p>
        </div>

        {/* 报告预览卡片 */}
        <div className="relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden animate-fade-in-up">
          {/* 模拟报告内页 */}
          <div className="p-6 md:p-10 max-w-2xl mx-auto">
            {/* 报告标题区 */}
            <div className="text-center mb-8 pb-6 border-b border-[var(--border-color)]">
              <div className="text-xs text-[var(--text-tertiary)] tracking-widest mb-2">SOULCODE · 灵魂解码</div>
              <div className="text-lg md:text-xl font-bold gradient-text mb-1">个人生命使命解读报告</div>
              <div className="text-xs text-[var(--text-tertiary)]">基于七大古老智慧系统 · AI 深度融合</div>
            </div>

            {/* 报告正文样例 */}
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="text-[var(--color-primary)] text-lg shrink-0">✦</span>
                <div>
                  <span className="font-semibold text-[var(--color-primary-light)]">核心天赋：</span>
                  <span className="text-[var(--text-secondary)]">你的能量设计中，G 中心（自我方向中心）被定义，这意味着你天生带着明确的人生方向感...</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[var(--color-gold)] text-lg shrink-0">✦</span>
                <div>
                  <span className="font-semibold text-[var(--color-gold-light)]">人生角色：</span>
                  <span className="text-[var(--text-secondary)]">6/2 角色型——你是一位"人生典范"，前半生在试错中积累智慧，后半生自然散发影响力...</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[var(--color-primary)] text-lg shrink-0">✦</span>
                <div>
                  <span className="font-semibold text-[var(--color-primary-light)]">能量曲线：</span>
                  <span className="text-[var(--text-secondary)]">你的情绪中心未被定义，意味着你容易吸收他人情绪。报告将绘制你的专属能量波动图...</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[var(--color-gold)] text-lg shrink-0">✦</span>
                <div>
                  <span className="font-semibold text-[var(--color-gold-light)]">决策策略：</span>
                  <span className="text-[var(--text-secondary)]">作为投射者，你的正确决策方式是"等待邀请"。重大决定前，给自己 48 小时的感受周期...</span>
                </div>
              </div>
            </div>
          </div>

          {/* 底部渐变遮罩 + 钩子 */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/80 to-transparent flex items-end justify-center pb-5">
            <p className="text-sm text-[var(--color-primary)] font-medium">
              深度图文报告，含七大系统交叉分析 →
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          信任数据（K3 验收修正：删除虚构的"50,000+ 已生成报告"，
          替换为真实可验证指标）
          ═══════════════════════════════════════════ */}
      <section className="px-4 pb-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '7', label: '古老智慧系统', sub: '八字·人类图·占星·紫微·五运六气·MBTI·中医体质' },
            { value: '∞', label: '页深度报告', sub: '七系统交叉分析，AI 个性化解讀' },
            { value: '1', label: '一份完整报告', sub: '多系统交叉印证，不是堆砌' },
            { value: '∞', label: 'AI 深度解读', sub: '个性化成长路径规划' },
          ].map((s, i) => (
            <div key={i} className="text-center p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/30 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-xl md:text-2xl font-bold gradient-text mb-1">{s.value}</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">{s.label}</div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          更多探索（二级入口，视觉收敛，功能保留）
          ═══════════════════════════════════════════ */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-secondary)] mb-1">更多探索</h2>
          <p className="text-xs text-[var(--text-tertiary)]">单独了解某个维度</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 大五人格 — 原 hero 主按钮入口，现收敛至二级 */}
          <Link href="/mbti" className="group flex flex-col items-center p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/40 hover:border-blue-500/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🧠</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">大五人格测评</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">心理学黄金标准</span>
          </Link>
          <Link href="/human-design" className="group flex flex-col items-center p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/40 hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🧬</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">人类图解析</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">类型·中心·通道</span>
          </Link>
          <Link href="/master-report" className="group flex flex-col items-center p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/40 hover:border-[var(--color-gold)]/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🔮</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">八字命盘</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">四柱·五行·大运</span>
          </Link>
          <Link href="/compatibility" className="group flex flex-col items-center p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/40 hover:border-pink-500/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">❤️</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">关系合盘</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">双人·家庭·朋友</span>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          创始人故事（保留，精简）
          ═══════════════════════════════════════════ */}
      <section className="px-4 pb-16 max-w-3xl mx-auto">
        <div className="founder-card p-6 md:p-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent border border-[var(--border-color)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">关于光明喜舍</h2>
          <div className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>2016 年起深入研习心理学人格理论、东方传统文化与人类图体系。</p>
            <p>多维度测评融合并非简单堆叠——心理学为基、人类图为骨、传统文化为脉。多个维度交叉印证，才是一份真正完整的自我认知报告。</p>
            <p className="text-xs text-[var(--text-tertiary)]">目前在大理 · 银桥持续深耕。</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          底部 CTA（精简）
          ═══════════════════════════════════════════ */}
      <section className="cta-section px-4 pb-20 max-w-2xl mx-auto text-center">
        <div className="relative p-8 md:p-10 rounded-2xl border border-[var(--border-color)] bg-gradient-to-b from-[var(--color-primary)]/8 to-transparent overflow-hidden">
          <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[var(--color-primary)]/5 blur-[100px]" />
          <div className="relative">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2">准备好发现真实的自己了吗？</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">输入出生信息，即可获得一份专属于你的深度自我认知报告</p>
            <button onClick={scrollToForm}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-[var(--color-primary)]/25 transition-all">
              免费排盘，看看你的出厂配置 →
            </button>
            <p className="mt-4 text-xs text-[var(--text-tertiary)]">🔒 出生信息仅用于排盘，绝不外泄</p>
          </div>
        </div>
      </section>
    </div>
  );
}
