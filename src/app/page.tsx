'use client';

import Link from 'next/link';

/* ── Starfield SVG (pure CSS/SVG, no external images) ── */
const STARFIELD = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="960" viewBox="0 0 1440 960">
    <defs>
      <radialGradient id="bg" cx="50%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#1E293B"/><stop offset="45%" stop-color="#0F172A"/><stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(212,175,55,0.18)"/><stop offset="100%" stop-color="rgba(212,175,55,0)"/>
      </radialGradient>
    </defs>
    <rect width="1440" height="960" fill="url(#bg)"/>
    ${/* Gold stars */''}
    ${[[80,45,'2','0.9'],[280,70,'1.5','0.7'],[560,30,'2.2','0.95'],[820,60,'1.3','0.6'],[1100,90,'1.8','0.85'],[1350,50,'1','0.5'],
      [150,180,'1.6','0.7'],[420,130,'1.2','0.55'],[680,160,'1.9','0.8'],[950,140,'1','0.45'],[1200,200,'1.4','0.65'],
      [60,300,'1.7','0.75'],[340,260,'1.1','0.5'],[700,290,'2','0.9'],[880,250,'1.3','0.6'],[1150,310,'1.5','0.7'],
      [200,380,'1','0.45'],[500,350,'1.8','0.8'],[780,400,'1.2','0.55'],[1020,370,'1.6','0.75'],[1320,420,'1','0.5'],
      [100,500,'1.4','0.6'],[380,470,'1','0.4'],[620,520,'1.7','0.8'],[900,490,'1.3','0.6'],[1100,540,'1.5','0.7'],
      [250,620,'1.2','0.55'],[550,580,'1.8','0.85'],[750,650,'1','0.45'],[1050,610,'1.6','0.7'],[1300,670,'1.3','0.6'],
      [160,730,'1.5','0.65'],[460,700,'1','0.45'],[680,760,'1.7','0.75'],[960,720,'1.2','0.55'],[1200,780,'1.4','0.65'],
      [320,830,'1.8','0.8'],[600,810,'1.1','0.5'],[880,850,'1.5','0.7'],[1180,830,'1','0.45'],
    ].map(([cx,cy,r,o])=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(212,175,55,${o})"/>`).join('')}
    ${/* White twinkle stars */''}
    ${[[440,100,'0.8','0.6'],[960,200,'0.7','0.5'],[160,420,'0.9','0.55'],[1280,280,'0.6','0.45'],[720,500,'0.8','0.5'],
      [300,560,'0.7','0.45'],[1100,430,'0.8','0.55'],[580,700,'0.7','0.5'],[140,840,'0.9','0.55'],[1040,750,'0.6','0.4'],
      [860,130,'0.7','0.5'],[220,250,'0.8','0.45'],[1280,540,'0.7','0.5'],[480,620,'0.6','0.4'],[760,300,'0.8','0.5'],
    ].map(([cx,cy,r,o])=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,${o})"/>`).join('')}
    ${/* Constellation accents */''}
    <line x1="80" y1="45" x2="280" y2="70" stroke="rgba(212,175,55,0.06)" stroke-width="0.5"/>
    <line x1="560" y1="30" x2="820" y2="60" stroke="rgba(212,175,55,0.06)" stroke-width="0.5"/>
    <line x1="680" y1="160" x2="950" y2="140" stroke="rgba(212,175,55,0.05)" stroke-width="0.5"/>
    <line x1="340" y1="260" x2="700" y2="290" stroke="rgba(212,175,55,0.05)" stroke-width="0.5"/>
    <line x1="500" y1="350" x2="780" y2="400" stroke="rgba(212,175,55,0.04)" stroke-width="0.5"/>
    <line x1="620" y1="520" x2="900" y2="490" stroke="rgba(212,175,55,0.04)" stroke-width="0.5"/>
    <line x1="550" y1="580" x2="750" y2="650" stroke="rgba(212,175,55,0.04)" stroke-width="0.5"/>
    <line x1="680" y1="760" x2="960" y2="720" stroke="rgba(212,175,55,0.04)" stroke-width="0.5"/>
    <ellipse cx="50%" cy="75%" rx="60%" ry="40%" fill="url(#glow)" opacity="0.4"/>
  </svg>`
)}`;

/* ── Data ── */
const CARDS = [
  { icon: '🔮', title: '七系统融合报告', desc: '八字·人类图·占星·紫微·五运六气·MBTI·中医体质，七维交叉印证，AI深度融合——不是七份报告，是一份完整的你。', href: '/master-report' },
  { icon: '📜', title: '九宫学理', desc: '河图洛书·程天相体系，13维度天赋地图、性格密码、90年人生节律，看见生命的底层代码。', href: '/jiugong' },
  { icon: '🧬', title: '单项测评', desc: '人类图排盘·MBTI性格·关系合盘·大五人格——从单一维度开始，逐步拼出完整的自己。', href: '/human-design' },
];

const TOC = [
  { label: '八字命盘分析', sub: '四柱·十神·五行·大运·流年' },
  { label: '人类图解析', sub: '能量类型·人生角色·内在权威·通道与闸门' },
  { label: '紫微斗数', sub: '十二宫·十四主星·四化飞星·格局论断' },
  { label: '占星本命盘', sub: '行星·星座·宫位·相位解读' },
  { label: '五运六气', sub: '黄帝内经体系·先天体质偏性·年度运气' },
  { label: '中医体质辨识', sub: '九种体质·饮食起居·调理建议' },
  { label: 'MBTI × 大五人格', sub: '心理学黄金标准·性格特质·适配领域' },
];

const HIGHLIGHTS = [
  { label: '核心天赋', text: '你的 G 中心被定义，天生带着明确的人生方向感——你不是迷路，你只是在等对的时机。', accent: true },
  { label: '人生角色', text: '6/2 角色型——前半生在试错中积累智慧，后半生自然散发影响力。你不必着急，节奏自有安排。' },
  { label: '能量曲线', text: '情绪中心开放，你容易吸收他人情绪。报告将绘制你的专属能量波动图，教你分辨哪些是你的，哪些是别人的。', accent: true },
  { label: '决策策略', text: '等待邀请不是被动——是在对的邀请出现时，你已准备好。重大决定前，给自己 48 小时的感受周期。' },
];

const EXPLORE = [
  { emoji: '☸', label: '法藏', href: '/dharma', desc: '佛法智慧' },
  { emoji: '🎭', label: '昌宁活动', href: '/events', desc: '线下共修' },
  { emoji: '🌅', label: '每日运势', href: '/daily', desc: '今日指引' },
  { emoji: '❤️', label: '关系合盘', href: '/compatibility', desc: '双人·家庭' },
  { emoji: '🧠', label: 'MBTI测评', href: '/mbti', desc: '16种人格' },
];

/* ── Helper: Section Title ── */
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-12 text-center">
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">{title}</h2>
      {subtitle && <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
    </div>
  );
}

/* ════════════════════════════════════════════
   Home Page
   ════════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      {/* ── Hero: fullscreen, starfield background ── */}
      <section
        className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${STARFIELD})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]" />
        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <p className="mb-4 text-xs tracking-[0.25em] text-[var(--color-accent)]/70">SOULCODE · 灵魂解码</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl md:text-6xl">
            解码你的生命蓝图
          </h1>
          <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg">
            七系统交叉印证，AI 深度融合——以古老智慧为镜，看清自己本来模样。
          </p>
          <Link
            href="/master-report"
            className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-10 py-4 text-base font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-accent-light)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95"
          >
            免费排盘
          </Link>
        </div>
      </section>

      {/* ── 3 Feature Cards ── */}
      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionTitle title="核心服务" subtitle="从多个维度理解自己，选择适合你的入口" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-border-hover)] hover:shadow-[0_8px_32px_rgba(212,175,55,0.06)]"
              >
                <div className="mb-4 text-3xl transition-transform duration-300 group-hover:scale-110">{c.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">{c.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Report Preview: Open Book ── */}
      <section className="px-6 pb-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <SectionTitle title="报告预览" subtitle="一份让你感到「被看穿」的灵魂级分析" />
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] lg:flex-row">
            {/* Left: TOC */}
            <div className="relative flex-shrink-0 border-b border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)]/30 to-transparent p-6 lg:w-72 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[2px] bg-gradient-to-b from-transparent via-[var(--color-accent)]/40 to-transparent lg:block" />
              <h3 className="mb-5 text-sm font-semibold tracking-[0.2em] text-[var(--color-accent)]">目 录</h3>
              <ul className="space-y-1.5">
                {TOC.map((item, i) => (
                  <li key={i} className="rounded-lg px-3 py-2 transition-colors hover:bg-[var(--color-accent)]/8">
                    <p className="text-sm font-medium text-[var(--color-text)]">{String(i + 1).padStart(2, '0')}. {item.label}</p>
                    <p className="text-xs text-[var(--color-text-dim)]">{item.sub}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Preview */}
            <div className="relative flex flex-1 items-center justify-center p-8">
              <div className="max-w-md space-y-5">
                <div className="text-center">
                  <p className="text-xs tracking-[0.15em] text-[var(--color-text-dim)]">SOULCODE · 灵魂解码</p>
                  <p className="gradient-text text-lg font-bold md:text-xl">个人生命使命解读报告</p>
                  <p className="mt-1 text-xs text-[var(--color-text-dim)]">基于七大古老智慧系统 · AI 深度融合</p>
                </div>
                <div className="space-y-3 text-sm leading-relaxed">
                  {HIGHLIGHTS.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={h.accent ? 'mt-0.5 shrink-0 text-lg text-[var(--color-accent)]' : 'mt-0.5 shrink-0 text-lg text-[var(--color-accent-light)]'}>✦</span>
                      <div>
                        <span className={h.accent ? 'font-semibold text-[var(--color-accent)]' : 'font-semibold text-[var(--color-accent-light)]'}>{h.label}：</span>
                        <span className="text-[var(--color-text-muted)]">{h.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 text-center">
                  <Link
                    href="/master-report"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] transition-all hover:gap-2"
                  >
                    查看完整报告示例
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                  </Link>
                </div>
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent lg:left-72" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── More to Explore: Horizontal Scroll ── */}
      <section className="px-6 pb-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <p className="text-lg font-semibold text-[var(--color-text-muted)]">更多探索</p>
            <p className="text-xs text-[var(--color-text-dim)]">从不同维度认识自己</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
            {EXPLORE.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="group w-36 flex-shrink-0 snap-start flex flex-col items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/60 p-4 transition-all hover:border-[var(--color-border-hover)] hover:-translate-y-1"
              >
                <span className="mb-2 text-xl transition-transform group-hover:scale-110">{e.emoji}</span>
                <span className="text-xs font-medium text-[var(--color-text)]">{e.label}</span>
                <span className="mt-1 text-[10px] text-[var(--color-text-dim)]">{e.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="px-6 pb-20 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center gap-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/70 p-8 sm:flex-row sm:items-start">
            <div className="flex h-36 w-36 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-accent)]/40 bg-[var(--color-primary)]/50 text-4xl text-[var(--color-accent)]/60 shadow-[0_0_40px_rgba(212,175,55,0.08)]">
              ✦
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <h3 className="text-xl font-bold text-[var(--color-text)]">关于光明喜舍</h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                2016 年起深入研习心理学人格理论、东方传统文化与人类图体系。
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                多维度测评融合并非简单堆叠——心理学为基、人类图为骨、传统文化为脉。多个维度交叉印证，才是一份真正完整的自我认知报告。
              </p>
              <p className="text-xs text-[var(--color-text-dim)]">目前在大理 · 银桥持续深耕</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-accent)]/8 to-transparent p-8 md:p-10">
            <div className="pointer-events-none absolute top-[-50%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[var(--color-accent)]/5 blur-[100px]" />
            <div className="relative">
              <h2 className="mb-2 text-xl font-bold text-[var(--color-text)] md:text-2xl">准备好发现真实的自己了吗？</h2>
              <p className="mb-6 text-sm text-[var(--color-text-muted)]">输入出生信息，即可获得一份专属于你的深度自我认知报告</p>
              <Link
                href="/master-report"
                className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-8 py-3.5 text-base font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-accent-light)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95"
              >
                免费排盘，看看你的出厂配置
              </Link>
              <p className="mt-4 text-xs text-[var(--color-text-dim)]">🔒 出生信息仅用于排盘，绝不外泄</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
