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
          <p className="hero-kicker">SOULCODE · 灵魂解码</p>
          <h1 className="hero-title">解码你的生命蓝图</h1>
          <p className="hero-sub">七大系统融合，看见独一无二的你</p>
          <a className="hero-cta" href="#report">生成我的报告</a>
        </div>
        <div className="hero-scroll">向下探索</div>
      </header>

      {/* 核心服务 */}
      <section className="section" id="services">
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="section-kicker">核心服务</p>
            <h2 className="section-title">三条路径，抵达同一个你</h2>
          </div>
          <div className="cards">
            <a className="card reveal" href="#report">
              <div className="card-img" style={{ backgroundImage: "url('/assets/homepage/card-seven-systems.png')" }} />
              <div className="card-body">
                <h3 className="card-title">七系统融合报告</h3>
                <p className="card-text">七个维度交叉印证，生成你的专属生命蓝图。</p>
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
            <a className="card reveal" href="#">
              <div className="card-img" style={{ backgroundImage: "url('/assets/homepage/card-assessment.png')" }} />
              <div className="card-body">
                <h3 className="card-title">单项测评</h3>
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
              <h2 className="report-title">一本只关于你的书</h2>
              <p className="report-text">
                七个系统，七次凝视。当星盘、九宫与心理测评在同一张图上交汇，你会第一次完整地看见自己。手机上也能一键下载 PDF，随时翻阅。
              </p>
              <a className="report-cta" href="/master-report">查看完整报告</a>
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
            <a className="explore-card" href="/dharma">
              <span className="explore-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></svg>
              </span>
              <span className="explore-name">法藏</span>
            </a>
            <a className="explore-card" href="#">
              <span className="explore-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" /></svg>
              </span>
              <span className="explore-name">昌宁活动</span>
            </a>
            <a className="explore-card" href="/daily">
              <span className="explore-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              </span>
              <span className="explore-name">每日运势</span>
            </a>
            <a className="explore-card" href="/compatibility">
              <span className="explore-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="12" r="4" /><circle cx="16" cy="12" r="4" /></svg>
              </span>
              <span className="explore-name">关系合盘</span>
            </a>
            <a className="explore-card" href="/mbti">
              <span className="explore-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3a7 7 0 0 1 7 7c0 2.4-1.2 4.2-2.6 5.6-.9.9-1.4 2.1-1.4 3.4h-6c0-1.3-.5-2.5-1.4-3.4C6.2 14.2 5 12.4 5 10a7 7 0 0 1 7-7z" /><path d="M9 21h6" /></svg>
              </span>
              <span className="explore-name">MBTI 测评</span>
            </a>
          </div>
        </div>
      </section>

      {/* 关于 */}
      <section className="section" id="about" style={{ background: "var(--bg-soft)" }}>
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="section-kicker">关于</p>
            <h2 className="section-title">点亮这盏灯的人</h2>
          </div>
          <div className="about reveal">
            <div className="about-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>
            </div>
            <div>
              <h3 className="about-name">阿宽</h3>
              <p className="about-role">SOULCODE 创始人 · 生命教育探索者</p>
              <p className="about-text">愿每一个人，都能在此照见自己的光。</p>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
