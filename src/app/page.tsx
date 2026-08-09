"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./homepage.css";

type DailyQuote = { quote: string; source: string };

const selfTools = [
  { name: "人类图解析", description: "看见您的能量与决策方式", href: "/human-design" },
  { name: "大五人格", description: "理解稳定的人格倾向", href: "/bigfive" },
  { name: "MBTI 测评", description: "从一个具体问题开始", href: "/mbti" },
];

export default function HomePage() {
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    fetch("/api/daily-quote")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data?.quote && setDailyQuote({ quote: data.quote, source: data.source }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-site", "soulcode");
    document.body.classList.add("homepage-active", "homepage-motion");
    const nav = document.getElementById("nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

    return () => {
      document.body.classList.remove("homepage-active", "homepage-motion");
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <>
      <nav className="nav" id="nav" aria-label="SoulCode 主导航">
        <div className="shell nav-inner">
          <Link className="brand" href="/" onClick={closeMobileNav}>
            <span className="brand-mark" aria-hidden="true" />
            <span>Soul<em>Code</em></span>
          </Link>
          <button
            className={`nav-toggle${mobileNavOpen ? " is-open" : ""}`}
            type="button"
            aria-label={mobileNavOpen ? "关闭导航菜单" : "打开导航菜单"}
            aria-expanded={mobileNavOpen}
            aria-controls="homepage-nav-links"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className={`nav-links${mobileNavOpen ? " is-open" : ""}`} id="homepage-nav-links">
            <a href="#who" onClick={closeMobileNav}>认识自己</a>
            <Link href="/master-report" onClick={closeMobileNav}>生命蓝图</Link>
            <Link href="/compatibility" onClick={closeMobileNav}>关系解码</Link>
            <a href="#ecosystem" onClick={closeMobileNav}>三站协同</a>
            <Link className="nav-cta" href="/master-report" onClick={closeMobileNav}>开始建立蓝图</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="shell hero-grid">
            <div className="hero-copy reveal">
              <p className="eyebrow">A PERSONAL MAP FOR A CLEARER LIFE</p>
              <h1 id="hero-title">先看见自己，<br /><em>再走近彼此。</em></h1>
              <p className="hero-lead">
                灵魂解码不是把您归类成一个标签，而是把复杂的您，整理成一张可以阅读、可以对话、可以继续成长的生命蓝图。
              </p>
              <div className="actions">
                <Link className="btn" href="/master-report">开始建立我的蓝图</Link>
                <a className="btn ghost" href="#who">我想先了解谁？</a>
              </div>
              <p className="privacy-note">出生信息仅用于生成您的报告 · 结果由您自己保管</p>
            </div>
            <div className="orbit reveal" aria-label="生命蓝图视觉示意">
              <span className="orbit-dot dot-a" />
              <span className="orbit-dot dot-b" />
              <span className="orbit-dot dot-c" />
              <div className="orbit-core">
                <strong>生命<br />蓝图</strong>
                <span>一份属于您的清晰说明</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="who">
          <div className="shell">
            <div className="section-head reveal">
              <div>
                <p className="eyebrow">ONE PROFILE · MANY QUESTIONS</p>
                <h2>您现在最想了解谁？</h2>
              </div>
              <p>不用先选择八字、人类图或人格测评。先从您真正关心的人开始，系统会在后台选择合适的分析依据。</p>
            </div>
            <div className="who-grid">
              <Link className="who-card reveal" href="/master-report">
                <strong>我自己</strong><span>我的优势、节奏、关系方式与下一步</span>
              </Link>
              <Link className="who-card reveal" href="/master-report">
                <strong>我的孩子</strong><span>怎样理解孩子，怎样陪伴他学习与成长</span>
              </Link>
              <Link className="who-card reveal" href="/compatibility">
                <strong>我的伴侣</strong><span>我们为什么靠近，又为什么反复卡住</span>
              </Link>
              <Link className="who-card reveal" href="/compatibility">
                <strong>我的伙伴</strong><span>朋友、合伙人、师生之间如何更好合作</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="section section-tinted" id="paths">
          <div className="shell">
            <div className="section-head reveal">
              <div>
                <p className="eyebrow">A QUIETLY DEEPER JOURNEY</p>
                <h2>从一张卡，走向三条路。</h2>
              </div>
              <p>免费体验让您先获得具体洞察；完整报告、关系解码和成长工具，再把理解变成下一步。</p>
            </div>
            <div className="path-grid">
              <Link className="path-card reveal" data-no="01" href="/master-report">
                <span className="tag">SELF</span><h3>生命蓝图</h3><p>把多套分析体系翻译成您真正看得懂的自我说明。</p>
                <span className="path-arrow">进入蓝图 <span>↗</span></span>
              </Link>
              <Link className="path-card reveal" data-no="02" href="/compatibility">
                <span className="tag">RELATIONSHIP</span><h3>关系解码</h3><p>从“合不合”转向理解彼此的节奏、需要和沟通方式。</p>
                <span className="path-arrow">进入关系解码 <span>↗</span></span>
              </Link>
              <Link className="path-card reveal" data-no="03" href="/tools">
                <span className="tag">GROWTH</span><h3>陪伴成长</h3><p>把对自己的理解交给成长工具，再继续落实到教育与行动。</p>
                <span className="path-arrow">选择成长工具 <span>↗</span></span>
              </Link>
            </div>
          </div>
        </section>

        <section className="section" id="report">
          <div className="shell">
            <div className="preview reveal">
              <div className="preview-intro">
                <p className="eyebrow">A FREE FIRST LOOK</p>
                <h2>先给您三条，真的有用的发现。</h2>
                <p>不是空泛的性格标签，而是能在生活里被您验证的观察。完整报告再把这些线索连接成一张地图。</p>
                <Link className="btn btn-light" href="/master-report">查看我的蓝图</Link>
              </div>
              <div className="report-card">
                <div className="report-top">
                  <div><small>示例 · 一位正在寻找节奏的探索者</small><h3>您的能量更适合“深度之后再行动”</h3></div>
                  <span className="score">86</span>
                </div>
                <div className="signal"><span>独处充电</span><strong>82%</strong><div className="bar"><i style={{ width: "82%" }} /></div></div>
                <div className="signal"><span>结构化表达</span><strong>74%</strong><div className="bar"><i style={{ width: "74%" }} /></div></div>
                <div className="signal"><span>关系敏感度</span><strong>68%</strong><div className="bar"><i style={{ width: "68%" }} /></div></div>
                <p className="sample-note">以上为展示用合成样例，不代表任何真实用户。</p>
              </div>
            </div>
          </div>
        </section>

        <section className="quote-band">
          <div className="shell quote reveal">
            <p className="eyebrow">THE POINT IS NOT TO PREDICT YOU</p>
              <blockquote>{dailyQuote?.quote || "真正重要的，不是“您是什么”，而是当您更清楚自己之后，能不能更温柔、更准确地与人相处。"}</blockquote>
            <cite>— {dailyQuote ? `金刚老师 · ${dailyQuote.source}` : "SoulCode · 灵魂解码"}</cite>
          </div>
        </section>

        <section className="section tools-section" id="tools">
          <div className="shell">
            <div className="section-head reveal">
              <div><p className="eyebrow">ONE QUESTION AT A TIME</p><h2>当您有了具体问题，再选择工具。</h2></div>
              <p>这些工具不是彼此竞争的入口，而是生命蓝图之后的不同观察角度。</p>
            </div>
            <div className="tool-grid">
              {selfTools.map((tool) => (
                <Link className="tool-card reveal" href={tool.href} key={tool.href}>
                  <span className="tool-index">0{selfTools.indexOf(tool) + 1}</span>
                  <strong>{tool.name}</strong><span>{tool.description}</span><b>↗</b>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section ecosystem" id="ecosystem">
          <div className="shell">
            <div className="section-head reveal">
              <div><p className="eyebrow">FROM SEEING TO LIVING</p><h2>一份画像，三种继续。</h2></div>
              <p>三个网站不再互相争夺导航位置，而是在您真正需要下一步时彼此接力。</p>
            </div>
            <div className="ecosystem-grid">
              <div className="eco-card reveal"><span className="eco-mark">WHO</span><h3>SoulCode · 灵魂解码</h3><p>看清自己、孩子、伴侣或伙伴是谁。建立生命蓝图，进入关系解码。</p><div className="pill-row"><span>生命蓝图</span><span>关系解码</span></div></div>
              <a className="eco-card stella reveal" href="https://www.stella-aiedu.com/" target="_blank" rel="noreferrer"><span className="eco-mark">HOW</span><h3>Stella · 教育智囊</h3><p>把对孩子的理解，变成父母能够实践的沟通、反思与教育行动。</p><div className="pill-row"><span>家长课程</span><span>成长工具</span></div></a>
              <a className="eco-card jianji reveal" href="https://jianjixueyuan.com/" target="_blank" rel="noreferrer"><span className="eco-mark">DO</span><h3>见己学园 · Jianji</h3><p>把孩子的学习画像落实为计划、任务、错题复盘和持续成长。</p><div className="pill-row"><span>学习计划</span><span>AI Tutor</span></div></a>
            </div>
            <div className="loop-line reveal"><span>看见</span><i>→</i><span>理解</span><i>→</i><span>陪伴</span><i>→</i><span>成长</span></div>
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="shell about-layout reveal">
            <div className="about-mark" aria-hidden="true">◎</div>
            <div><p className="eyebrow">ABOUT SOULCODE</p><h2>先见己，后见世界和众生。</h2><p>2016 年起深入研习心理学人格理论、东方传统文化与人类图体系。心理学为基、人类图为骨、传统文化为脉，让多个维度彼此印证，呈现一份真正完整的自我认知报告。</p></div>
          </div>
        </section>
      </main>
    </>
  );
}
