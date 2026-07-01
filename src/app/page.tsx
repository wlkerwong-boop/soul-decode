'use client';

import { useState, useRef } from 'react';
import BirthInputForm from '@/components/BirthInputForm';
import BodygraphSVG from '@/components/BodygraphSVG';
import Link from 'next/link';

const DEMO_HUMAN_DESIGN = {
  definedCenters: ['Head', 'Ajna', 'Throat', 'G', 'Ego', 'Sacral', 'Root'],
  activatedGates: [1,2,3,5,7,8,10,11,13,14,15,16,17,20,21,23,24,25,26,27,28,29,31,33,34,35,39,40,41,42,43,44,45,46,47,48,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64],
  channels: ['1-8','2-14','3-60','5-15','7-31','10-20','11-56','13-33','16-48','17-62','20-34','21-45','23-43','24-61','25-51','26-44','27-50','28-38','29-46','30-41','31-7','32-54','33-13','34-20','35-36','37-40','39-55','41-30','42-53','43-23','44-26','45-21','46-29','47-64','48-16','50-27','51-25','52-9','53-42','54-32','55-39','56-11','57-34','58-18','59-6','60-3','61-24','62-17','63-4','64-47'],
  centerDefinition: {},
};

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const formSectionRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const firstInput = formSectionRef.current?.querySelector('input, select');
        if (firstInput && 'focus' in firstInput) (firstInput as HTMLElement).focus();
      }, 300);
    }, 100);
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
            Jovian Archive认证引擎 · 区分的科学标准
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-tight animate-slide-up-1">
            您的<span className="gradient-text">生命蓝图</span>
            <br />一次看清
          </h1>
          <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-2xl mx-auto animate-slide-up-2">
            八字 · 人类图 · 占星 · 紫微 · 五运六气<br />
            七系统AI融合报告 · 精准定位您的天赋、挑战与人生节奏
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-3">
            <button onClick={scrollToForm}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 transition-all">
              开始排盘 →
            </button>
            <Link href="/daily"
              className="px-8 py-3.5 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-medium text-lg hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all">
              🌅 每日运势 ·
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-[var(--text-tertiary)] animate-slide-up-4">
            <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> 真实排盘</span>
            <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> AI深度解读</span>
            <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> 7系统融合</span>
          </div>
        </div>
      </section>

      {/* ── Quick Form ── */}
      {showForm && (
        <section ref={formSectionRef} className="px-4 pb-12 max-w-lg mx-auto">
          <div className="glass-card p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">输入您的出生信息</h2>
              <button onClick={() => setShowForm(false)} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">收起 ✕</button>
            </div>
            <BirthInputForm />
          </div>
        </section>
      )}

      {/* ── 核心产品 ── */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="text-center mb-10 animate-slide-up-2">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3">核心产品</h2>
          <p className="text-[var(--text-secondary)] text-sm">基于您的出生信息，提供深度个性化解读</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 人生总览 */}
          <div className="glass-card group relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 hover:shadow-lg transition-all animate-slide-up-3">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-t-xl" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform icon-ring">🌟</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">人生总览</h3>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium">旗舰</span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mb-3">八字 · 人类图 · 占星 · 紫微 · 五运六气 · 流年 · 人生规划</p>
                <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                  七系统AI深度融合解读，一次性看清您的生命全貌——天性禀赋、事业天赋、财富格局、情感模式、成长路径、健康体质、人生关键节点。
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] border border-[var(--color-primary)]/15">7系统融合</span>
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] border border-[var(--color-primary)]/15">AI深度交叉</span>
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] border border-[var(--color-primary)]/15">人生节奏图谱</span>
                </div>
                <Link href="/master-report"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline">
                  立即生成 →<span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 每日运势 */}
          <div className="glass-card group relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 hover:shadow-lg transition-all animate-slide-up-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-xl" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform icon-ring">🌅</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">每日运势</h3>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/10 text-amber-600 font-medium">个性化</span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mb-3">Daily Personalized Fortune</p>
                <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                  基于您的八字五行和人类图能量中心状态，每天生成属于您个人的专属运势指引——不止是生肖星座，而是真正与您命盘匹配的每日能量指南。
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-amber-500/8 text-amber-600 border border-amber-500/15">八字匹配</span>
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-amber-500/8 text-amber-600 border border-amber-500/15">HD能量追踪</span>
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-amber-500/8 text-amber-600 border border-amber-500/15">每日更新</span>
                </div>
                <Link href="/daily"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:underline">
                  查看今日运势 →<span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 深度探索 ── */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3">深度探索</h2>
          <p className="text-[var(--text-secondary)] text-sm">在人生总览的基础上，深入探索每一个维度</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link href="/human-design" className="group flex flex-col items-center p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧬</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">人类图排盘</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-1">类型·中心·通道·闸门</span>
          </Link>
          <Link href="/master-report" className="group flex flex-col items-center p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔮</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">八字排盘</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-1">四柱·五行·十神·大运</span>
          </Link>
          <Link href="/master-report" className="group flex flex-col items-center p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📐</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">紫微斗数</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-1">12宫·主星·辅星·四化</span>
          </Link>
          <Link href="/compatibility" className="group flex flex-col items-center p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">❤️</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">关系合盘</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-1">双人·家庭·朋友</span>
          </Link>
          <Link href="/mbti" className="group flex flex-col items-center p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧠</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">MBTI性格</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-1">16型人格·深度解析</span>
          </Link>
          <Link href="/tools" className="group flex flex-col items-center p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-card)] transition-all">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📿</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">法藏文库</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-1">佛法·道法·亲子智慧</span>
          </Link>
        </div>
      </section>

      {/* ── 信任数据 ── */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '50,000+', label: '已生成报告', sub: '用户信赖选择' },
            { value: '7', label: '命理系统融合', sub: '八字·人类图·占星·紫微·五运六气·流年·规划' },
            { value: '★', label: 'Jovian Archive', sub: '认证引擎对齐' },
            { value: '∞', label: 'AI深度解读', sub: '个性化生命报告' },
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
            <p>2016年起深入研习东方命理（八字·梅花易数·紫微斗数）与西方人类图体系。</p>
            <p>七系统融合并非简单堆叠——八字为根、人类图为干、占星为花、紫微为果、五运六气为气候、流年为季节、规划为耕作者的日程表。七个维度交叉印证，才是一份真正完整的生命报告。</p>
            <p>目前在大理·银桥持续深耕，致力于将东方智慧与现代AI技术结合，让每个人都能看清自己的生命蓝图。</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section px-4 pb-20 max-w-2xl mx-auto text-center">
        <div className="relative p-10 rounded-2xl border border-[var(--border-color)] bg-gradient-to-b from-[var(--color-primary)]/8 to-transparent overflow-hidden">
          <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[var(--color-primary)]/5 blur-[100px]" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">准备好探索您的生命蓝图了吗？</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">只需输入您的出生信息，即可获得一份专属于您的七系统融合报告</p>
            <button onClick={scrollToForm}
              className="btn-premium px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-[var(--color-primary)]/25 transition-all">
              开始排盘 →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
