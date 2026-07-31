import Link from 'next/link';

const IconCrystal = () => (
  <svg aria-hidden="true" className="mb-5 h-12 w-12" viewBox="0 0 48 48" fill="none">
    <path d="M24 4 44 18 24 44 4 18 24 4Z" fill="url(#crystal)" />
    <path d="M24 4v40M4 18h40" stroke="#D4AF37" strokeWidth=".75" opacity=".45" />
    <defs>
      <linearGradient id="crystal" x1="4" y1="4" x2="44" y2="44">
        <stop stopColor="#26354D" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
    </defs>
  </svg>
);

const IconScroll = () => (
  <svg aria-hidden="true" className="mb-5 h-12 w-12" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="4" width="32" height="40" rx="4" stroke="#D4AF37" strokeWidth="2" />
    <path d="M14 12h20M14 20h20M14 28h14" stroke="#D4AF37" strokeWidth="1.5" opacity=".65" />
  </svg>
);

const IconDna = () => (
  <svg aria-hidden="true" className="mb-5 h-12 w-12" viewBox="0 0 48 48" fill="none">
    <path d="M12 8c0 0 8 8 12 16s12 16 12 16M36 8s-8 8-12 16-12 16-12 16" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
    <path d="m17 14 14 20M31 14 17 34" stroke="#D4AF37" strokeWidth="1" opacity=".45" />
  </svg>
);

const Arrow = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="m8 6 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const services = [
  {
    icon: <IconCrystal />,
    title: '七系统融合报告',
    desc: '八字·人类图·占星·紫微·五运六气·MBTI·中医体质，七维交叉印证，一份完整的你。',
    href: '/master-report',
  },
  {
    icon: <IconScroll />,
    title: '九宫学理',
    desc: '河图洛书·程天相体系，13维度天赋地图、性格密码、90年人生节律，看见生命的底层代码。',
    href: '/jiugong',
  },
  {
    icon: <IconDna />,
    title: '单项测评',
    desc: '人类图排盘·MBTI性格·关系合盘·大五人格，从一个维度开始，逐步拼出完整的自己。',
    href: '/human-design',
  },
];

const reportChapters = [
  { num: '01', title: '八字命盘分析', desc: '四柱·十神·五行·大运·流年', intro: '你的出厂配置里，藏着这一生的主线剧情。' },
  { num: '02', title: '人类图解析', desc: '能量类型·人生角色·内在权威·通道与闸门', intro: '能量类型决定你如何与世界交换能量。' },
  { num: '03', title: '紫微斗数', desc: '十二宫·十四主星·四化飞星·格局论断', intro: '十二宫如同人生的十二个房间，各有风景。' },
  { num: '04', title: '占星本命盘', desc: '行星·星座·宫位·相位解读', intro: '行星是演员，星座是角色，宫位是舞台。' },
  { num: '05', title: '五运六气', desc: '黄帝内经体系·先天体质偏性·年度运气', intro: '顺应天时，方能事半功倍。' },
  { num: '06', title: '中医体质辨识', desc: '九种体质·饮食起居·调理建议', intro: '体质是地基，调理是修缮。' },
  { num: '07', title: 'MBTI × 大五人格', desc: '心理学黄金标准·性格特质·适配领域', intro: '认识自己，是改变的开始。' },
];

const moreExplore = [
  { emoji: '📿', title: '法藏', desc: '经典研读', href: '/dharma' },
  { emoji: '🏔️', title: '昌宁活动', desc: '线下共修', href: '/dharma' },
  { emoji: '🌅', title: '每日运势', desc: '今日指引', href: '/daily' },
  { emoji: '💞', title: '关系合盘', desc: '双人·家庭', href: '/compatibility' },
  { emoji: '🧠', title: 'MBTI测评', desc: '16种人格', href: '/mbti' },
];

const reportHighlights = [
  ['核心天赋', '你的 G 中心被定义，天生带着明确的人生方向感——你不是迷路，你只是在等对的时机。'],
  ['人生角色', '6/2 角色型——前半生在试错中积累智慧，后半生自然散发影响力。'],
  ['能量曲线', '情绪中心开放，你容易吸收他人情绪。报告会帮助你分辨哪些是你的，哪些是别人的。'],
];

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-[#0B1120] text-[#F8FAFC]">
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 py-[20vh] text-center">
        <div className="absolute inset-0 bg-[#0B1120]" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,58,138,0.18)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(212,175,55,0.07)_0%,transparent_48%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,175,55,0.05)_0%,transparent_42%)]" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(2px 2px at 20px 30px,rgba(212,175,55,.45),transparent),radial-gradient(2px 2px at 40px 70px,rgba(255,255,255,.28),transparent),radial-gradient(1px 1px at 90px 40px,rgba(212,175,55,.5),transparent),radial-gradient(2px 2px at 160px 120px,rgba(255,255,255,.2),transparent),radial-gradient(1px 1px at 230px 80px,rgba(212,175,55,.4),transparent),radial-gradient(2px 2px at 300px 150px,rgba(255,255,255,.28),transparent)',
              backgroundSize: '350px 200px',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="mb-6 text-xs tracking-[0.3em] text-[#D4AF37]/75">SOULCODE · 灵魂解码</p>
          <h1 className="mb-8 text-4xl font-medium leading-[1.35] tracking-[0.05em] [text-shadow:0_2px_40px_rgba(0,0,0,.55)] md:text-5xl lg:text-6xl">
            解码你的生命蓝图
          </h1>
          <p className="mx-auto mb-10 max-w-md text-base leading-[1.8] text-[#94A3B8] md:text-lg">
            七系统交叉印证，AI 深度融合——以古老智慧为镜，看清自己本来模样。
          </p>
          <Link href="/master-report" className="inline-block rounded-full bg-[#D4AF37] px-8 py-3.5 font-medium text-[#0B1120] transition-all duration-300 hover:-translate-y-1 hover:text-[#0B1120] hover:shadow-[0_8px_30px_rgba(212,175,55,.3)] active:scale-95">
            免费排盘，看看你的出厂配置
          </Link>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center" aria-hidden="true">
          <p className="text-xs tracking-[0.3em] text-[#475569]">SCROLL</p>
          <div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-[#475569] to-transparent" />
        </div>
      </section>

      <section className="px-4 py-24 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-center text-2xl tracking-wide md:text-3xl">核心服务</h2>
          <p className="mb-12 text-center text-sm text-[#94A3B8] md:text-base">从多个维度理解自己，选择适合你的入口</p>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-7 [scrollbar-width:none]">
            {services.map((service) => (
              <Link
                data-service-card="true"
                key={service.href}
                href={service.href}
                className="group w-[280px] flex-none snap-start rounded-2xl border border-[#334155]/50 bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/90 p-6 shadow-[0_14px_45px_rgba(0,0,0,.22)] transition-all duration-300 hover:-translate-y-2 hover:border-[#D4AF37]/30 hover:shadow-[0_18px_50px_rgba(0,0,0,.34)] md:w-[320px]"
              >
                {service.icon}
                <h3 className="mb-2 text-lg font-medium transition-colors group-hover:text-[#D4AF37]">{service.title}</h3>
                <p className="mb-5 line-clamp-3 text-sm leading-[1.8] text-[#94A3B8]">{service.desc}</p>
                <span className="inline-flex items-center text-sm text-[#D4AF37]">了解更多 <Arrow /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0F172A]/55 px-4 py-24 md:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-3 text-center text-2xl tracking-wide md:text-3xl">报告预览</h2>
          <p className="mb-12 text-center text-sm text-[#94A3B8]">一份让你感到「被看穿」的灵魂级分析</p>
          <div className="space-y-3">
            {reportChapters.map((chapter) => (
              <details key={chapter.num} className="group overflow-hidden rounded-xl border border-[#1E293B] transition-colors open:border-[#334155]">
                <summary className="flex cursor-pointer list-none items-center gap-4 p-4 text-left transition-colors hover:bg-[#1E293B]/30 [&::-webkit-details-marker]:hidden">
                  <span className="font-mono text-sm text-[#D4AF37]">{chapter.num}</span>
                  <span className="flex-1 font-medium">{chapter.title}</span>
                  <span className="text-[#94A3B8] transition-transform duration-300 group-open:rotate-180" aria-hidden="true">⌄</span>
                </summary>
                <div className="border-t border-[#1E293B] px-4 pb-4 text-sm leading-[1.8] text-[#94A3B8]">
                  <p className="pt-3">{chapter.desc}</p>
                  <p className="mt-3 rounded-lg bg-[#1E293B]/40 p-3 text-xs italic text-[#CBD5E1]">「{chapter.intro}」</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-[#1E293B] bg-gradient-to-b from-[#1E293B]/40 to-transparent p-6 text-center md:p-8">
            <p className="mb-3 text-sm tracking-[0.2em] text-[#D4AF37]">SOULCODE · 灵魂解码</p>
            <h3 className="mb-3 text-xl">个人生命使命解读报告</h3>
            <p className="mb-7 text-sm text-[#94A3B8]">基于七大古老智慧系统 · AI 深度融合</p>
            <div className="space-y-4 text-left text-sm leading-[1.8] text-[#CBD5E1]">
              {reportHighlights.map(([title, text]) => (
                <div key={title} className="flex gap-3">
                  <span className="mt-0.5 text-[#D4AF37]">◆</span>
                  <p><span className="text-[#D4AF37]">{title}：</span>{text}</p>
                </div>
              ))}
            </div>
            <Link href="/master-report" className="mt-7 inline-block text-sm text-[#D4AF37] hover:underline">查看完整报告示例 →</Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-xl tracking-wide md:text-2xl">更多探索</h2>
          <p className="mb-8 text-center text-sm text-[#64748B]">从不同维度认识自己</p>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [scrollbar-width:none]">
            {moreExplore.map((item) => (
              <Link
                data-explore-card="true"
                key={item.href}
                href={item.href}
                className="w-[140px] flex-none snap-start rounded-xl border border-[#334155]/30 bg-[#1E293B]/50 p-4 text-center transition-all duration-300 hover:border-[#D4AF37]/20 hover:bg-[#1E293B]"
              >
                <span className="mb-2 block text-3xl" aria-hidden="true">{item.emoji}</span>
                <h3 className="mb-1 text-sm font-medium">{item.title}</h3>
                <p className="text-xs text-[#64748B]">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#0B1120] via-[#0F172A] to-[#0B1120] px-4 py-24 md:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 sm:flex-row sm:items-start">
          <div className="flex h-28 w-28 flex-none items-center justify-center overflow-hidden rounded-full border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#1E293B] to-[#334155] text-3xl" role="img" aria-label="创始人头像占位">🧘</div>
          <div className="text-center sm:text-left">
            <h2 className="mb-4 text-xl md:text-2xl">关于光明喜舍</h2>
            <p className="line-clamp-4 text-sm leading-[1.8] text-[#94A3B8] md:text-base">
              2016 年起深入研习心理学人格理论、东方传统文化与人类图体系。心理学为基、人类图为骨、传统文化为脉，让多个维度彼此印证，呈现一份真正完整的自我认知报告。目前在大理 · 银桥持续深耕。
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,.08)_0%,transparent_70%)]" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="mb-4 text-2xl md:text-3xl">准备好发现真实的自己了吗？</h2>
          <p className="mb-8 text-sm text-[#94A3B8] md:text-base">输入出生信息，即可获得一份专属于你的深度自我认知报告</p>
          <Link href="/master-report" className="inline-block rounded-full bg-[#D4AF37] px-8 py-3.5 font-medium text-[#0B1120] transition-all duration-300 hover:-translate-y-1 hover:text-[#0B1120] hover:shadow-[0_8px_30px_rgba(212,175,55,.3)]">
            免费排盘，看看你的出厂配置
          </Link>
          <p className="mt-4 text-xs text-[#475569]">🔒 出生信息仅用于排盘，绝不外泄</p>
        </div>
      </section>
    </div>
  );
}
