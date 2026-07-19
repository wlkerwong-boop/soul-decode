export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">灵魂解码</h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li><a href="/" className="hover:text-[var(--text-accent)] transition-colors">首页</a></li>
              <li><a href="/master-report" className="hover:text-[var(--text-accent)] transition-colors">人生总览</a></li>
              <li><a href="/human-design" className="hover:text-[var(--text-accent)] transition-colors">人类图排盘</a></li>
              <li><a href="/daily" className="hover:text-[var(--text-accent)] transition-colors">每日运势</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">深度探索</h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li><a href="/compatibility" className="hover:text-[var(--text-accent)] transition-colors">❤️ 关系合盘</a></li>
              <li><a href="/mbti" className="hover:text-[var(--text-accent)] transition-colors">MBTI性格</a></li>
              <li><a href="/admin" className="hover:text-[var(--text-accent)] transition-colors">管理后台</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">关于我们</h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li>八字 + 人类图 + 占星 + 紫微 + 五运六气</li>
              <li>七系统AI深度融合解读</li>
              <li>Jovian Archive认证HD引擎</li>
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
            © 2026 光明喜舍
          </p>
        </div>
      </div>
    </footer>
  );
}
