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

import { useEffect } from "react";
import "./homepage.css";

export default function HomePage() {
  useEffect(() => {
    document.body.setAttribute("data-site", "soulcode");
    const nav = document.getElementById("nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <>
      <nav className="nav" id="nav">
        <a className="nav-logo" href="/">Soul<em>Code</em></a>
        <div className="nav-links">
          <a href="#services">服务</a>
          <a href="#report">报告</a>
          <a href="#about">关于</a>
          <a className="nav-cta" href="#report">开始测评</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="hero-bg" style={{ backgroundImage: "url('/assets/homepage/soulcode-hero.png')" }} />
        <div className="hero-veil" />
        <div className="hero-content">
          <p className="hero-kicker">七系统融合 · AI 深度解读</p>
          <h1 className="hero-title">7 大古老系统，1 份只属于您的报告</h1>
          <p className="hero-sub">八字 · 人类图 · 占星 · 紫微斗数 · 五运六气 · MBTI · 中医体质——七个维度交叉印证，AI 深度融合解读。不是七份报告，是一份完整的您。</p>
          <a className="hero-cta" href="/master-report">免费排盘，看看您的出厂配置 →</a>
          <p className="hero-note">🔒 出生信息仅用于排盘，绝不外泄</p>
        </div>
        <div className="hero-scroll">向下探索</div>
      </header>

      {/* 核心服务 */}
      <section className="section" id="services">
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="section-kicker">核心服务</p>
            <h2 className="section-title">三条路径，抵达同一个您</h2>
          </div>
          <div className="cards">
            <a className="card reveal" href="/master-report">
              <div className="card-img" style={{ backgroundImage: "url('/assets/homepage/card-seven-systems.png')" }} />
              <div className="card-body">
                <h3 className="card-title">人生总览</h3>
                <p className="card-text">七个维度交叉印证，生成您的专属生命蓝图。</p>
                <span className="card-link">了解更多 <span>→</span></span>
              </div>
            </a>
            <a className="card reveal" href="/jiugong">
              <div className="card-img" style={{ backgroundImage: "url('/assets/homepage/card-jiugong.png')" }} />
              <div className="card-body">
                <h3 className="card-title">九宫学理</h3>
                <p className="card-text">东方智慧为骨，照见当下的位置与方向。</p>
                <span className="card-link">了解更多 <span>→</span></span>
              </div>
            </a>
            <a className="card reveal" href="/human-design">
              <div className="card-img" style={{ backgroundImage: "url('/assets/homepage/card-assessment.png')" }} />
              <div className="card-body">
                <h3 className="card-title">人类图排盘</h3>
                <p className="card-text">从一个问题开始，轻轻推开自我认知的门。</p>
                <span className="card-link">了解更多 <span>→</span></span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 报告预览 */}
      <section className="section" id="report" style={{ background: "var(--bg-soft)" }}>
        <div className="section-inner">
          <div className="report">
            <div className="report-img reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/homepage/report-cover.png" alt="七系统融合报告封面" />
            </div>
            <div className="report-copy reveal">
              <p className="section-kicker">报告预览</p>
              <h2 className="report-title">一份让您感到“被看穿”的灵魂级分析</h2>
              <ul className="report-text report-list">
                <li>✦ <strong>核心天赋：</strong>看见您与生俱来的优势，以及最适合发挥它们的方向。</li>
                <li>✦ <strong>人生角色：</strong>理解您在不同关系与人生阶段中的独特位置。</li>
                <li>✦ <strong>能量曲线：</strong>读懂您的能量起伏，知道何时蓄力、何时行动。</li>
                <li>✦ <strong>决策策略：</strong>找到符合您内在机制的选择方式，不再被外界声音牵引。</li>
              </ul>
              <a className="report-cta" href="/master-report">深度图文报告，含七大系统交叉分析 →</a>
            </div>
          </div>
        </div>
      </section>

      {/* 更多探索 */}
      <section className="section">
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="section-kicker">更多探索</p>
            <h2 className="section-title">沿途的风景</h2>
          </div>
          <div className="explore-track reveal">
            <a className="explore-card" href="/mbti">
              <span className="explore-ico">🧠</span>
              <span className="explore-name">大五人格测评</span>
            </a>
            <a className="explore-card" href="/human-design">
              <span className="explore-ico">🧬</span>
              <span className="explore-name">人类图解析</span>
            </a>
            <a className="explore-card" href="/human-design">
              <span className="explore-ico">🔮</span>
              <span className="explore-name">八字命盘</span>
            </a>
            <a className="explore-card" href="/compatibility">
              <span className="explore-ico">❤️</span>
              <span className="explore-name">关系合盘</span>
            </a>
            <a className="explore-card" href="/dharma">
              <span className="explore-ico">📖</span>
              <span className="explore-name">法藏</span>
            </a>
            <a className="explore-card" href="/tools">
              <span className="explore-ico">🌟</span>
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
          <div className="about about-text-only reveal">
            <div>
              <p className="about-text">2016 年起深入研习心理学人格理论、东方传统文化与人类图体系。多维度测评融合并非简单堆叠——心理学为基、人类图为骨、传统文化为脉。多个维度交叉印证，才是一份真正完整的自我认知报告。目前在大理 · 银桥持续深耕。</p>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
