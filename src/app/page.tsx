"use client";

/**
 * SoulCode 首页 · 海报级重设计（K3 定稿版）
 * ---------------------------------------------------------------
 * 集成说明（给 Codex）：
 * 1. 将 homepage.css 复制为 src/app/homepage.css，并在本文件 import "./homepage.css";
 *    （或并入 globals.css，注意保留 body[data-site] 主题变量块）
 * 2. 将 assets/ 下 5 张图片复制到 public/assets/homepage/
 * 3. 霞鹜文楷 CDN 已在项目 layout 的 <head> 中引入，无需重复添加
 * 4. 零外部组件依赖：纯 CSS + 内联 SVG，不引入 swiper/framer-motion
 * 5. body 需带 data-site="soulcode"（在 layout.tsx 的 <body> 上加，或本文件 useEffect 设置）
 * 6. 下方链接 href 为占位，替换为项目真实路由
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import "./homepage.css";

export default function HomePage() {
  const [dailyQuote, setDailyQuote] = useState<{ quote: string; source: string } | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    fetch("/api/daily-quote")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.quote && setDailyQuote({ quote: d.quote, source: d.source }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-site", "soulcode");
    document.body.classList.add("homepage-active");
    const nav = document.getElementById("nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => {
      document.body.classList.remove("homepage-active");
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <>
      <nav className="nav" id="nav">
        <Link className="nav-logo" href="/" onClick={() => setMobileNavOpen(false)}>Soul<em>Code</em></Link>
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
          <a href="#services" onClick={() => setMobileNavOpen(false)}>认识自己</a>
          <a href="/compatibility" onClick={() => setMobileNavOpen(false)}>关系解码</a>
          <a href="#report" onClick={() => setMobileNavOpen(false)}>报告</a>
          <a href="#about" onClick={() => setMobileNavOpen(false)}>关于</a>
          <a className="nav-cta" href="/master-report" onClick={() => setMobileNavOpen(false)}>开始测评</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero hero-light">
        <div className="hero-bg" />
        <div className="hero-veil" />
        <div className="hero-deco" aria-hidden="true">
          <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <circle cx="180" cy="140" r="2.2" fill="#C9A96A" opacity="0.5" />
            <circle cx="420" cy="90" r="1.5" fill="#C9A96A" opacity="0.4" />
            <circle cx="1180" cy="160" r="2.4" fill="#C9A96A" opacity="0.5" />
            <circle cx="1320" cy="280" r="1.5" fill="#C9A96A" opacity="0.35" />
            <circle cx="300" cy="300" r="1.2" fill="#C9A96A" opacity="0.3" />
            <circle cx="960" cy="120" r="1.8" fill="#C9A96A" opacity="0.45" />
            <circle cx="80" cy="420" r="1.4" fill="#C9A96A" opacity="0.35" />
            <circle cx="1360" cy="520" r="1.8" fill="#C9A96A" opacity="0.4" />
            <path d="M0 720 Q 300 640 560 700 Q 800 750 1080 680 Q 1280 640 1440 690 L 1440 900 L 0 900 Z" fill="#E8DFCF" opacity="0.55" />
            <path d="M0 780 Q 400 720 760 770 Q 1100 810 1440 760 L 1440 900 L 0 900 Z" fill="#DDD2BD" opacity="0.6" />
          </svg>
        </div>
        <div className="hero-content">
          <p className="hero-kicker">SOULCODE · 灵魂解码</p>
          <h1 className="hero-title">解码你的生命蓝图</h1>
          <p className="hero-sub">先看见自己，再理解关系，最后找到下一步</p>
          <a className="hero-cta" href="/master-report">生成我的报告</a>
          <p className="hero-note">🔒 出生信息仅用于生成报告 · 结果由你自己保管</p>
        </div>
        <div className="hero-scroll">向下探索</div>
      </header>

      {/* 核心服务 */}
      <section className="section" id="services">
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="section-kicker">核心服务</p>
            <h2 className="section-title">从认识自己开始，走向更清晰的关系</h2>
            <p className="section-desc">不必一次使用所有工具，先从最接近你当下问题的一步开始。</p>
          </div>
          <div className="cards">
            <a className="card reveal" href="/master-report">
              <div className="card-img" style={{ backgroundImage: "url('/assets/homepage/card-seven-systems.png')" }} />
              <div className="card-body">
                <p className="card-step">01 · 看见自己</p>
                <h3 className="card-title">生命蓝图</h3>
                <p className="card-text">把八字、人类图、人格等系统放回同一份报告，先看懂自己的节奏、优势与盲点。</p>
                <span className="card-link">开始认识自己 <span>→</span></span>
              </div>
            </a>
            <a className="card reveal" href="/compatibility">
              <div className="card-img" style={{ backgroundImage: "url('/assets/homepage/card-jiugong.png')" }} />
              <div className="card-body">
                <p className="card-step">02 · 理解关系</p>
                <h3 className="card-title">关系解码</h3>
                <p className="card-text">从伴侣、亲子到伙伴，看见彼此的差异、互动模式与更有效的相处方向。</p>
                <span className="card-link">理解重要的人 <span>→</span></span>
              </div>
            </a>
            <a className="card reveal" href="/tools">
              <div className="card-img" style={{ backgroundImage: "url('/assets/homepage/card-assessment.png')" }} />
              <div className="card-body">
                <p className="card-step">03 · 找到下一步</p>
                <h3 className="card-title">成长工具</h3>
                <p className="card-text">将认识转化为行动：从一次小测评、一次亲子任务或一份成长计划开始。</p>
                <span className="card-link">选择一件小事开始 <span>→</span></span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 报告预览 */}
      <section className="section report-golden" id="report">
        <div className="section-inner">
          <div className="report">
            <div className="report-img reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/homepage/report-cover.png" alt="七系统融合报告封面" />
            </div>
            <div className="report-copy reveal">
              <p className="section-kicker">报告预览</p>
                <h2 className="report-title">一本只关于你的书</h2>
              <p className="report-text">
                七个系统，七次凝视。当不同的视角在同一份报告里交汇，你会更完整地看见自己的节奏、选择和关系。八字排盘已经纳入生命蓝图，不再需要单独寻找入口。
              </p>
              <a className="report-cta" href="/master-report">查看完整报告</a>
            </div>
          </div>
        </div>
      </section>

      {/* 每日一言 */}
      {dailyQuote && (
        <section className="section quote-section">
          <div className="section-inner">
            <div className="quote-card reveal">
              <div className="quote-mark" aria-hidden="true">“</div>
              <p className="quote-text">{dailyQuote.quote}</p>
              <p className="quote-source">—— 金刚老师 · {dailyQuote.source}</p>
            </div>
          </div>
        </section>
      )}

      {/* 更多探索 */}
      <section className="section">
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="section-kicker">可选工具</p>
            <h2 className="section-title">当你有了具体问题，再选择合适的工具</h2>
            <p className="section-desc">这些工具不是彼此竞争的入口，而是生命蓝图之后的不同观察角度。</p>
          </div>
          <div className="explore-track reveal">
            <a className="explore-card" href="/mbti">
              <span className="explore-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 4a6 6 0 0 1 6 6c0 2.6-1.4 4.4-3 5.4V18h-6v-2.6C7.4 14.4 6 12.6 6 10a6 6 0 0 1 6-6z" /><path d="M9.5 9l1.6 1.6L14 8M9.5 13.5l1.6-1.6L14 14.5" /></svg>
              </span>
              <span className="explore-name">大五人格测评</span>
            </a>
            <a className="explore-card" href="/human-design">
              <span className="explore-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>
              </span>
              <span className="explore-name">人类图解析</span>
            </a>
            <a className="explore-card" href="/compatibility">
              <span className="explore-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="12" r="4" /><circle cx="16" cy="12" r="4" /></svg>
              </span>
              <span className="explore-name">关系合盘</span>
            </a>
            <a className="explore-card" href="/dharma">
              <span className="explore-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></svg>
              </span>
              <span className="explore-name">静心与阅读</span>
              <span className="explore-badge">即将上线</span>
            </a>
            <a className="explore-card" href="/tools">
              <span className="explore-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" /></svg>
              </span>
              <span className="explore-name">点亮星图</span>
              <span className="explore-desc">昌宁茶乡精神图谱共建行动 · 亲子互动工具包</span>
            </a>
          </div>
        </div>
      </section>

      {/* 关于 */}
      <section className="section" id="about" style={{ background: "var(--bg-soft)" }}>
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="section-kicker">关于</p>
            <h2 className="section-title">关于光明喜舍</h2>
          </div>
          <div className="about reveal">
            <div className="about-avatar">
              <span className="text-3xl" role="img" aria-label="创始人头像">🧘</span>
            </div>
            <div>
              <p className="about-text">2016 年起深入研习心理学人格理论、东方传统文化与人类图体系。心理学为基、人类图为骨、传统文化为脉，让多个维度彼此印证，呈现一份真正完整的自我认知报告。目前在大理 · 银桥持续深耕。</p>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
