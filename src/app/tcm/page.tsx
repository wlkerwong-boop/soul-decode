'use client';

import { useState } from 'react';
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
    details: '15课完整蒸馏。核心内容：六经辨证总纲、太阳中风/伤寒分野、桂枝汤类加减、麻黄汤类、阳明腑实/经热、承气汤类、少阳病与柴胡类方、三阴病与危重救逆。特色：倪师"水液压力"解痛、腹诊小便辨虚实、附骨脉与阴实癌症观。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/shanghanlun.md',
    screenshotUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/screenshot-evidence.md',
    keyPoints: ['六经辨证总纲', '太阳中风/伤寒分野', '桂枝汤类加减15方', '麻黄汤与大青龙', '阳明腑实承气汤', '少阳和解小柴胡', '太阴少阴厥阴救逆'],
  },
  {
    id: 'jinkui',
    icon: '🌿',
    title: '金匮要略',
    subtitle: '杂病辨治·妇科·痰饮水气·胸痹虚劳',
    screenshots: 656,
    description: '杂病辨治精要，涵盖妇科、痰饮水气、胸痹心痛、虚劳血痹等临床常见病证。',
    details: '杂病辨治精要，涵盖妇科、痰饮水气、胸痹心痛、虚劳血痹等。倪师以六经统百病，教人"万变不离其宗"——面对复杂杂病，回归六经辨证，找到核心病机。656张截图覆盖金匮板书、针灸实操、病机图及方药组合。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/jingui.md',
    screenshotUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/jingui-screenshot-evidence.md',
    keyPoints: ['妇人杂病辨治', '痰饮与水气', '胸痹心痛', '虚劳血痹', '五脏风寒', '外科痈疽', '六经统杂病'],
  },
  {
    id: 'huangdi',
    icon: '☯️',
    title: '黄帝内经',
    subtitle: '阴阳五行·脏腑经络·五运六气',
    screenshots: 272,
    description: '中医理论根基，阴阳五行学说、脏腑经络体系、五运六气推演与天人合一思想。',
    details: '中医理论根基——阴阳五行、脏腑经络、五运六气。倪师以内经为体、伤寒为用，强调"上工治未病"。272张截图覆盖内经板书、PPT、五运六气图、脏腑经络及脉诊图示。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/huangdi.md',
    screenshotUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/huangdi-screenshot-evidence.md',
    keyPoints: ['阴阳五行学说', '脏腑经络体系', '五运六气推演', '天人合一思想', '四时调神', '病机十九条', '诊法/脉法'],
  },
  {
    id: 'shennong',
    icon: '🌾',
    title: '神农本草',
    subtitle: '药性归经·单味药讲解·配伍禁忌',
    screenshots: 127,
    description: '单味药药性归经深度讲解，四气五味升降浮沉，临床配伍禁忌与用药心法。',
    details: '单味药药性归经深度讲解。倪师用药特点：药简力专、重视炮制、强调"药性就是药之个性"。本草课程中附大量板书讲解四气五味、升降浮沉、配伍禁忌及临床心法。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/bencao.md',
    screenshotUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/bencao-screenshot-evidence.md',
    keyPoints: ['四气五味', '升降浮沉', '归经理论', '炮制方法', '配伍禁忌', '单味药精讲', '临床用药心法'],
  },
  {
    id: 'zhenjiu',
    icon: '📍',
    title: '针灸',
    subtitle: '经络腧穴·配穴思路·实操手法',
    screenshots: 501,
    description: '十二正经与奇经八脉腧穴定位，配穴法则与临床实操手法，子午流注应用。',
    details: '十二正经与奇经八脉腧穴精讲。倪师针灸特色：俞募治疗法、担法、巨刺法、子午流注针法。强调"针灸实按"——不背书架子，重实操。501张截图覆盖穴位定位、针刺手法、艾灸操作及经络循行。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/acupuncture.md',
    screenshotUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/acupuncture-screenshot-evidence.md',
    keyPoints: ['十二正经经穴', '奇经八脉', '俞募配穴', '担法/巨刺法', '子午流注', '井荥输经合', '艾灸实操'],
  },
  {
    id: 'tianji',
    icon: '🔮',
    title: '天纪',
    subtitle: '易经八卦·紫微斗数·阳宅风水',
    screenshots: 527,
    description: '易经八卦哲学、紫微斗数命理推演、阳宅风水布局，天地人三才贯通。',
    details: '易经八卦哲学、紫微斗数命理推演、阳宅风水布局。"天纪者，天地之纪也。"倪师以易理通医理，以天纪证人纪。527张截图覆盖易经六十四卦、紫微斗数星盘、阳宅九宫布局、八宅明镜等。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/tianji.md',
    screenshotUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/tianji-screenshot-evidence.md',
    keyPoints: ['易经八卦哲学', '紫微斗数推演', '阳宅风水布局', '命宫四化', '八宅明镜', '河图洛书数理', '天地人三才'],
  },
  {
    id: 'zhongjing',
    icon: '📜',
    title: '仲景心法',
    subtitle: '经方心法·病机推演·眼诊',
    screenshots: 68,
    description: '仲景经方心法精粹，病机推演逻辑链条，独特眼诊技法与临床辨证思路。',
    details: '仲景心法传讲——经方心法、病机推演、眼诊技法。倪师总结"经方之魂不在方，在法"。68张截图覆盖病机推演白板、方药组合、脏腑关系及眼诊分区图。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/zhongjing-xinfa.md',
    screenshotUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/zhongjing-xinfa-screenshot-evidence.md',
    keyPoints: ['经方心法', '病机推演', '眼诊五轮', '脏腑关系图', '方药组合逻辑', '重症/癌症眼诊', '经方剂量考'],
  },
  {
    id: 'linchuang',
    icon: '🏥',
    title: '临床案例',
    subtitle: '倪师医案·肿瘤/心肝肾案例',
    screenshots: 88,
    description: '倪海厦真实临床医案，涵盖肿瘤、心脏病、肝病、肾病等重大疑难病症。',
    details: '人纪临床案例/倪师医案课程。真实临床记录：肿瘤（乳癌、肝癌、肺癌）、心脏病、肾病（尿毒症）、红斑性狼疮等重大疑难病症。倪师"以案说法"，每案均附方剂、剂量及辨证思路全链条。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/clinical-cases.md',
    screenshotUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/clinical-cases-screenshot-evidence.md',
    keyPoints: ['肿瘤医案', '心脏病案例', '肝病/肾病', '乳癌/狼疮', '经方实战', '疑难杂症', '辨证链条'],
  },
  {
    id: 'bagang',
    icon: '⚖️',
    title: '八纲辨证',
    subtitle: '表里寒热虚实阴阳',
    screenshots: 0,
    description: '八纲辨证纲领：表里定位病位深浅，寒热定性病证属性，虚实判断邪正盛衰，阴阳总括全局。',
    details: '八纲辨证纲领：表里定位病位深浅，寒热定性病证属性，虚实判断邪正盛衰，阴阳总括全局。33张代表画面覆盖八纲辨证课程关键帧、字幕证据及四诊合参图示。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/bagang.md',
    screenshotUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/bagang-screenshot-evidence.md',
    keyPoints: ['表的辨证', '里的辨证', '寒热鉴别', '虚实判断', '阴阳总纲', '四诊合参', '八纲与六经'],
  },
  {
    id: 'fuyang',
    icon: '☀️',
    title: '扶阳论坛',
    subtitle: '阳气为本·附子用法',
    screenshots: 37,
    description: '扶阳学派核心思想，阳气为生命之本，附子配伍应用心法及扶阳救逆临证经验。',
    details: '扶阳论坛课程蒸馏。扶阳学派核心——"阳气者，若天与日"。倪师强调"阳主阴从"，善用附子、生硫磺等温阳攻毒之品。37张截图覆盖白板板书、PPT、病例幻灯片及阴阳水火既济图。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/fuyang.md',
    screenshotUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/fuyang-screenshot-evidence.md',
    keyPoints: ['阳气为本', '附子配伍', '生硫磺应用', '阴阳虚实', '重症/尿毒症', '救逆心法', '水火既济'],
  },
  {
    id: 'yijinjing',
    icon: '🧘',
    title: '易筋经',
    subtitle: '五脏逼毒法·文式武式功法',
    screenshots: 28,
    description: '中医导引术，五脏逼毒法排除脏腑浊气，文式武式易筋经功法强身健体。',
    details: '倪师易筋经——中医导引术的最高体现。五脏逼毒法（嘘、呵、呼、呬、吹、嘻六字诀）+ 文式/武式易筋经。28张截图覆盖五脏逼毒动作示范、文式易筋经12势、武式易筋经姿势及呼吸发音要领。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/yijinjing.md',
    screenshotUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/yijinjing-screenshot-evidence.md',
    keyPoints: ['五脏逼毒法', '六字诀', '文式易筋经', '武式易筋经', '呼吸心法', '养生功法', '导引术'],
  },
  {
    id: 'liangdong',
    icon: '🎙️',
    title: '梁冬对话倪师',
    subtitle: '国学堂访谈',
    screenshots: 0,
    description: '著名主持人梁冬深度对话倪海厦，畅谈中医文化、经方智慧与现代医学反思。',
    details: '梁冬深度对话倪海厦（国学堂节目）。谈中医文化复兴、经方智慧、中西医差异、正统中医学习路径、六经辨证入门。第1集原音轨尾部损坏，转写覆盖可解码的48.1分钟。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/liangdong.md',
    screenshotUrl: '',
    keyPoints: ['中医科学性', '中西医差异', '经方入门', '学习路径', '中医文化复兴', '倪师心路', '正统中医传承'],
  },
  {
    id: 'stanford',
    icon: '🎓',
    title: '斯坦福演讲',
    subtitle: '中医科学性',
    screenshots: 0,
    description: '倪海厦在斯坦福大学的专题演讲，阐述中医的科学性、经方疗效与现代医学的互补。',
    details: '倪海厦斯坦福大学专题演讲。向西方精英阐述：中医的科学性（不是经验医学，是实验医学）、经方的可重复性疗效、中医药现代化方向、中西医互补模式。',
    githubUrl: 'https://github.com/JuneYaooo/nihaisha-nishi-tcm/blob/main/references/stanford.md',
    screenshotUrl: '',
    keyPoints: ['中医科学性', '经方可重复性', '西医互补', '中医药现代化', '海外传播', '倪师思想精粹'],
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
  const [selectedModule, setSelectedModule] = useState<typeof modules[0] | null>(null);

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
            <p className="text-sm text-[var(--text-secondary)]">点击模块查看详细内容与板书索引</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod, i) => (
              <div
                key={mod.id}
                onClick={() => setSelectedModule(mod)}
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

        {/* ── 模块详情弹窗 ──────────────────────────────────── */}
        {selectedModule && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedModule(null)}
          >
            <div
              className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-[var(--text-accent)]/30 bg-[var(--bg-card)] p-8 scrollbar-hide"
              onClick={e => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setSelectedModule(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-lg"
              >
                ✕
              </button>

              {/* 头部 */}
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 shrink-0"
                  style={{ borderColor: 'rgba(201, 169, 110, 0.3)', background: 'rgba(201, 169, 110, 0.1)' }}
                >
                  {selectedModule.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-accent)] mb-1">{selectedModule.title}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{selectedModule.subtitle}</p>
                </div>
              </div>

              {/* 详细描述 */}
              <div className="mb-6 p-5 rounded-xl bg-[var(--bg-deep)] border border-[var(--border-color)]">
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">{selectedModule.details}</p>
              </div>

              {/* 知识要点 */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[var(--text-accent)] mb-3">📌 核心知识要点</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedModule.keyPoints.map((point, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-[var(--text-accent)]/8 border border-[var(--text-accent)]/15 text-xs text-[var(--text-primary)]">
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              {/* 截图信息 */}
              {selectedModule.screenshots > 0 && (
                <div className="mb-6 p-4 rounded-xl border border-[var(--border-color)] bg-black/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">📸</span>
                    <span className="text-sm font-bold text-[var(--text-accent)]">{selectedModule.screenshots} 张板书截图</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    每张截图对应课程视频中的板书、PPT或实操画面，可溯源至具体课次和时间点。
                  </p>
                </div>
              )}

              {/* 外部链接 */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--border-color)]">
                <a
                  href={selectedModule.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-accent)] hover:border-[var(--text-accent)]/30 transition-all"
                >
                  📄 查看完整课程蒸馏
                  <span className="text-sm">↗</span>
                </a>
                {selectedModule.screenshotUrl && (
                  <a
                    href={selectedModule.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-accent)] hover:border-[var(--text-accent)]/30 transition-all"
                  >
                    🖼️ 浏览板书截图索引
                    <span className="text-sm">↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

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
