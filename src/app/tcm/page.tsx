'use client';

import Link from 'next/link';
import CosmicBackground from '@/components/CosmicBackground';

// ── 模块数据 ──────────────────────────────────────────────────
const modules = [
  {
    id: 'shanghan',
    icon: '🔥',
    title: '伤寒论',
    subtitle: '六经辨证·经方方证·398条原文精讲',
    screenshots: 649,
    description: '张仲景《伤寒论》原文逐条精讲，六经辨证体系完整拆解，经方方证对应与加减化裁。',
  },
  {
    id: 'jinkui',
    icon: '🌿',
    title: '金匮要略',
    subtitle: '杂病辨治·妇科·痰饮水气·胸痹虚劳',
    screenshots: 656,
    description: '杂病辨治精要，涵盖妇科、痰饮水气、胸痹心痛、虚劳血痹等临床常见病证。',
  },
  {
    id: 'huangdi',
    icon: '☯️',
    title: '黄帝内经',
    subtitle: '阴阳五行·脏腑经络·五运六气',
    screenshots: 272,
    description: '中医理论根基，阴阳五行学说、脏腑经络体系、五运六气推演与天人合一思想。',
  },
  {
    id: 'shennong',
    icon: '🌾',
    title: '神农本草',
    subtitle: '药性归经·单味药讲解·配伍禁忌',
    screenshots: 127,
    description: '单味药药性归经深度讲解，四气五味升降浮沉，临床配伍禁忌与用药心法。',
  },
  {
    id: 'zhenjiu',
    icon: '📍',
    title: '针灸',
    subtitle: '经络腧穴·配穴思路·实操手法',
    screenshots: 501,
    description: '十二正经与奇经八脉腧穴定位，配穴法则与临床实操手法，子午流注应用。',
  },
  {
    id: 'tianji',
    icon: '🔮',
    title: '天纪',
    subtitle: '易经八卦·紫微斗数·阳宅风水',
    screenshots: 527,
    description: '易经八卦哲学、紫微斗数命理推演、阳宅风水布局，天地人三才贯通。',
  },
  {
    id: 'zhongjing',
    icon: '📜',
    title: '仲景心法',
    subtitle: '经方心法·病机推演·眼诊',
    screenshots: 68,
    description: '仲景经方心法精粹，病机推演逻辑链条，独特眼诊技法与临床辨证思路。',
  },
  {
    id: 'linchuang',
    icon: '🏥',
    title: '临床案例',
    subtitle: '倪师医案·肿瘤/心肝肾案例',
    screenshots: 88,
    description: '倪海厦真实临床医案，涵盖肿瘤、心脏病、肝病、肾病等重大疑难病症。',
  },
  {
    id: 'bagang',
    icon: '⚖️',
    title: '八纲辨证',
    subtitle: '表里寒热虚实阴阳',
    screenshots: 0,
    description: '八纲辨证纲领：表里定位病位深浅，寒热定性病证属性，虚实判断邪正盛衰，阴阳总括全局。',
  },
  {
    id: 'fuyang',
    icon: '☀️',
    title: '扶阳论坛',
    subtitle: '阳气为本·附子用法',
    screenshots: 37,
    description: '扶阳学派核心思想，阳气为生命之本，附子配伍应用心法及扶阳救逆临证经验。',
  },
  {
    id: 'yijinjing',
    icon: '🧘',
    title: '易筋经',
    subtitle: '五脏逼毒法·文式武式功法',
    screenshots: 28,
    description: '中医导引术，五脏逼毒法排除脏腑浊气，文式武式易筋经功法强身健体。',
  },
  {
    id: 'liangdong',
    icon: '🎙️',
    title: '梁冬对话倪师',
    subtitle: '国学堂访谈',
    screenshots: 0,
    description: '著名主持人梁冬深度对话倪海厦，畅谈中医文化、经方智慧与现代医学反思。',
  },
  {
    id: 'stanford',
    icon: '🎓',
    title: '斯坦福演讲',
    subtitle: '中医科学性',
    screenshots: 0,
    description: '倪海厦在斯坦福大学的专题演讲，阐述中医的科学性、经方疗效与现代医学的互补。',
  },
];

// ── 图标背景色映射 ────────────────────────────────────────────
function getCardAccent(index: number): string {
  const colors = [
    'rgba(201, 169, 110, 0.08)',
    'rgba(74, 222, 128, 0.06)',
    'rgba(96, 165, 250, 0.06)',
    'rgba(251, 146, 60, 0.06)',
    'rgba(192, 132, 252, 0.06)',
    'rgba(244, 114, 182, 0.06)',
  ];
  return colors[index % colors.length];
}

function getIconBorder(index: number): string {
  const colors = [
    'rgba(201, 169, 110, 0.25)',
    'rgba(74, 222, 128, 0.2)',
    'rgba(96, 165, 250, 0.2)',
    'rgba(251, 146, 60, 0.2)',
    'rgba(192, 132, 252, 0.2)',
    'rgba(244, 114, 182, 0.2)',
  ];
  return colors[index % colors.length];
}

export default function TCMPage() {
  return (
    <div className="relative min-h-screen">
      <CosmicBackground />

      <div className="relative z-10 gradient-bg min-h-screen">
        {/* ── 导航 ──────────────────────────────────────────── */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-[var(--text-accent)] text-xl font-bold tracking-wider">
              ✦ 灵魂解码
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <Link href="/my" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              📁 档案
            </Link>
            <Link href="/health" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              身心健康
            </Link>
            <Link href="/mbti" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              MBTI性格
            </Link>
            <Link href="/astrology" className="hover:text-[var(--text-accent)] transition-colors hidden sm:inline">
              星座占星
            </Link>
            <span className="opacity-50 hidden md:inline">·</span>
            <span className="opacity-50 hidden md:inline">倪海厦 · 人纪课程</span>
          </div>
        </nav>

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="px-6 pt-16 pb-8 text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6">
            <span className="tag-pill text-xs tracking-widest">倪海厦 · 人纪系列课程蒸馏</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            中医通鉴
            <br />
            <span className="text-[var(--text-accent)]">知识库</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto mb-4">
            系统整理倪海厦先生人纪系列五套课程（针灸、神农本草、黄帝内经、伤寒论、金匮要略）
            <br className="hidden sm:inline" />
            融合 <span className="text-[var(--text-primary)]">板书截图证据索引</span>，构建可溯源的中医知识体系
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="tag-pill">📖 伤寒论 398条</span>
            <span className="tag-pill">🌿 经方 280+首</span>
            <span className="tag-pill">📍 腧穴 360+穴</span>
            <span className="tag-pill">🌾 本草 200+味</span>
            <span className="tag-pill">📊 截图 2,900+张</span>
          </div>
        </section>

        {/* ── 金色分隔 ─────────────────────────────────────── */}
        <div className="gold-divider max-w-5xl mx-auto mb-12" />

        {/* ── 模块卡片网格 ──────────────────────────────────── */}
        <section className="px-6 pb-16 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">课程模块</h2>
            <p className="text-sm text-[var(--text-secondary)]">点击模块可查看详细内容与板书索引</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod, i) => (
              <div
                key={mod.id}
                className="group p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--text-accent)]/40 transition-all duration-300 cursor-pointer"
              >
                {/* 图标 */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 border"
                  style={{
                    background: getCardAccent(i),
                    borderColor: getIconBorder(i),
                  }}
                >
                  {mod.icon}
                </div>

                {/* 标题与副标题 */}
                <h3 className="text-lg font-bold mb-1 text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-[var(--text-accent)] mb-3 leading-relaxed">
                  {mod.subtitle}
                </p>

                {/* 描述 */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-2">
                  {mod.description}
                </p>

                {/* 底部信息 */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                  {mod.screenshots > 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">
                      📸 <span className="text-[var(--text-accent)]">{mod.screenshots}</span> 张板书截图
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-secondary)] opacity-40">
                      音频/视频课程
                    </span>
                  )}
                  <span className="text-xs text-[var(--text-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                    查看详情 →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 金色分隔 ─────────────────────────────────────── */}
        <div className="gold-divider max-w-5xl mx-auto mb-12" />

        {/* ── CTA 区域 ──────────────────────────────────────── */}
        <section className="px-6 pb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">
            开始你的<span className="text-[var(--text-accent)]">中医辨证</span>之旅
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 max-w-xl mx-auto">
            基于倪海厦经方心法，通过AI十问问诊进行智能辨证分析，
            <br />
            匹配对应经方与调理方案，溯源板书截图证据
          </p>
          <Link
            href="/health/assessment"
            className="btn-gold inline-flex items-center justify-center px-10 py-4 text-lg font-bold tracking-wide"
            style={{ width: 'auto' }}
          >
            ✦ 开始AI辨证
          </Link>
          <div className="mt-4">
            <Link
              href="/tcm-assessment"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors underline underline-offset-2"
            >
              传统十问辨证（免登录） →
            </Link>
          </div>
        </section>

        {/* ── 底部 ──────────────────────────────────────────── */}
        <footer className="border-t border-[var(--border-color)] py-8 px-6">
          <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)] opacity-40">
            <p>中医通鉴知识库 · 倪海厦人纪系列课程蒸馏</p>
            <p className="mt-1">板书截图来源于人纪课程录像，版权归倪海厦先生所有</p>
            <p className="mt-2">
              <Link href="/" className="hover:text-[var(--text-accent)] transition-colors opacity-30 hover:opacity-60">
                ← 返回首页
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
