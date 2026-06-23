'use client';

import Link from 'next/link';

const tools = [
  {
    icon: '🧭',
    title: '精神坐标定位器',
    subtitle: '趣味问答 · 找到你的专属先贤榜样',
    desc: '12道选择题，通过生日、性格、兴趣、志向四维匹配，从60位古圣先贤中找到和你最"心灵相通"的那一位。',
    href: '/tools/matching',
    color: 'rgba(74, 124, 111, 0.08)',
    borderColor: 'rgba(74, 124, 111, 0.25)',
    status: 'ready' as const,
  },
  {
    icon: '💬',
    title: '亲子对话卡',
    subtitle: '挑话题 · 和孩子聊先贤',
    desc: '随机出题，4大主题覆盖活动全阶段——破冰相识、深挖理解、草原有感、反思联结。每次刷新出3个开放式问题。',
    href: '/tools/talk',
    color: 'rgba(201, 160, 110, 0.08)',
    borderColor: 'rgba(201, 160, 110, 0.25)',
    status: 'ready' as const,
  },
  {
    icon: '🤖',
    title: '灵魂三问AI练习器',
    subtitle: '用好问题 · 向AI深度探索先贤',
    desc: '教孩子用"灵魂三问"向AI提问——初心、抉择、当下指引。模拟练习+实操记录双模式，线上预备营必备。',
    href: '/tools/ai-3q',
    color: 'rgba(96, 165, 250, 0.08)',
    borderColor: 'rgba(96, 165, 250, 0.25)',
    status: 'ready' as const,
  },
  {
    icon: '🎭',
    title: '抉择剧场·思辨工坊',
    subtitle: '随机翻牌 · 亲子辩论两难选择',
    desc: '每次出一道先贤面临的两难选择，家长和孩子各选一个立场，讨论后看真实历史中的答案。',
    href: '/tools/theatre',
    color: 'rgba(201, 106, 110, 0.08)',
    borderColor: 'rgba(201, 106, 110, 0.25)',
    status: 'soon' as const,
  },
  {
    icon: '📝',
    title: '研学ORID复盘卡',
    subtitle: '每天4步 · 结构化反思当天经历',
    desc: '基于ORID反思法（客观事实→感受反应→深层思考→未来行动）。每天一张，7天后生成完整成长报告。',
    href: '/tools/orid',
    color: 'rgba(130, 106, 201, 0.08)',
    borderColor: 'rgba(130, 106, 201, 0.25)',
    status: 'ready' as const,
  },
  {
    icon: '🌟',
    title: '点亮星图·成长档案',
    subtitle: '个人页面 · 记录孩子的精神成长',
    desc: '专属页面展示匹配先贤、原创诗歌、研学照片、7天ORID复盘和成长雷达图。可打印、可分享，长期保存。',
    href: '/tools/archive',
    color: 'rgba(201, 169, 110, 0.08)',
    borderColor: 'rgba(201, 169, 110, 0.25)',
    status: 'soon' as const,
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="gradient-text text-xl font-bold tracking-wider">
            ✦ 灵魂解码
          </Link>
          <Link href="/dharma" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors">
            ☸ 法藏
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-8 text-center max-w-4xl mx-auto">
        <div className="inline-block mb-6">
          <span className="tag-pill text-xs tracking-widest">亲子互动工具包</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          🧰 点亮星图
          <br />
          <span className="gradient-text">亲子工具包</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto mb-4">
          为「点亮星图·昌宁茶乡精神图谱共建行动」设计的亲子互动工具
          <br className="hidden sm:inline" />
          活动前匹配先贤 · 活动中深度共创 · 活动后复盘成长
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <span className="tag-pill">🧭 精神匹配</span>
          <span className="tag-pill">💬 亲子对话</span>
          <span className="tag-pill">🤖 AI探索</span>
          <span className="tag-pill">🎭 思辨剧场</span>
          <span className="tag-pill">📝 反思复盘</span>
          <span className="tag-pill">🌟 成长档案</span>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="gold-divider max-w-5xl mx-auto mb-12" />

      {/* Tools Grid */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-5">
          {tools.map((tool) => (
            tool.status === 'ready' ? (
              <Link key={tool.href} href={tool.href}>
                <div
                  className="group p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--text-accent)]/40 transition-all duration-300 cursor-pointer"
                  style={{ background: tool.color, borderColor: tool.borderColor }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 border"
                      style={{ background: tool.color, borderColor: tool.borderColor }}
                    >
                      {tool.icon}
                    </div>
                    <span className="tag-pill text-xs text-[var(--text-accent)]">已上线</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-[var(--text-primary)]">{tool.title}</h3>
                  <p className="text-xs text-[var(--text-accent)] mb-3">{tool.subtitle}</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tool.desc}</p>
                </div>
              </Link>
            ) : (
              <div
                key={tool.href}
                className="group p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] opacity-60 cursor-not-allowed"
                style={{ background: tool.color, borderColor: tool.borderColor }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 border"
                    style={{ background: tool.color, borderColor: tool.borderColor }}
                  >
                    {tool.icon}
                  </div>
                  <span className="tag-pill text-xs opacity-60">即将上线</span>
                </div>
                <h3 className="text-lg font-bold mb-1 text-[var(--text-primary)]">{tool.title}</h3>
                <p className="text-xs text-[var(--text-accent)] mb-3">{tool.subtitle}</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tool.desc}</p>
              </div>
            )
          ))}
        </div>
      </section>

      {/* Gold Divider */}
      <div className="gold-divider max-w-5xl mx-auto mb-12" />

      {/* Description */}
      <section className="px-6 pb-12 max-w-3xl mx-auto text-center">
        <h2 className="text-lg font-bold mb-4 gradient-text">✦ 关于这些工具</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          本工具包为「点亮星图·昌宁茶乡精神图谱共建行动」配套设计。<br />
          6个工具覆盖活动前、活动中、活动后三个阶段，<br />
          帮助家长和孩子在研学过程中更好地互动、反思与成长。<br /><br />
          活动信息：2026年8月 · 云南保山昌宁 · 风谷草原
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)]">
          <p>点亮星图 · 昌宁茶乡精神图谱共建行动</p>
          <p className="mt-1">
            <Link href="/" className="hover:text-[var(--text-accent)] transition-colors opacity-60 hover:opacity-100">
              ← 返回首页
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
