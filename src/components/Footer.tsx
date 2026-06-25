export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">灵魂解码</h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li><a href="/" className="hover:text-[var(--text-accent)] transition-colors">首页</a></li>
              <li><a href="/mbti" className="hover:text-[var(--text-accent)] transition-colors">MBTI性格</a></li>
              <li><a href="/astrology" className="hover:text-[var(--text-accent)] transition-colors">星座占星</a></li>
              <li><a href="/health" className="hover:text-[var(--text-accent)] transition-colors">身心健康</a></li>
              <li><a href="/tcm" className="hover:text-[var(--text-accent)] transition-colors">中医通鉴</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">深度探索</h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li><a href="/dharma" className="hover:text-[var(--text-accent)] transition-colors">☸ 法藏文库</a></li>
              <li><a href="/tools" className="hover:text-[var(--text-accent)] transition-colors">🧰 亲子工具</a></li>
              <li><a href="/admin" className="hover:text-[var(--text-accent)] transition-colors">梅花易数</a></li>
              <li><a href="/payment" className="hover:text-[var(--text-accent)] transition-colors">💎 会员中心</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">关于我们</h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li>AI深度解读 + 真实八字排盘</li>
              <li>融合心理学与东方智慧</li>
              <li>大理 · 银桥</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">联系</h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li>微信公众号：光明喜舍</li>
              <li>小红书：@光明喜舍</li>
              <li>抖音：@光明喜舍</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--border-color)] pt-6 text-center">
          <p className="text-sm text-[var(--text-secondary)]">灵魂解码 · 用AI看见真实的自己</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">
            基于真实八字算法排盘 · 信息仅用于生成本报告 · 不存储
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-2 opacity-40">
            © 2026 光明喜舍 · 滇ICP备号-1
          </p>
        </div>
      </div>
    </footer>
  );
}
