import type { Metadata } from 'next';
import './globals.css';
import '@/components/shared/theme.css';
import { AuthProvider } from '@/components/AuthContext';
import AppNav from '@/components/AppNav';
import { Footer } from '@/components/shared';

export const metadata: Metadata = {
  title: '自我认知与成长测评 — 发现真实的自己',
  description: '多维人格分析 · 天赋识别 · 成长路径规划。融合心理学与传统文化智慧，用数据看清自己。',
  keywords: ['人格测评', '大五人格', 'MBTI', '自我认知', '成长规划', '天赋测试', '人类图', '八字排盘'],
  openGraph: {
  title: '灵魂解码 — 您的生命使命解读报告',
  description: '一份让您感到"被看穿"的灵魂级分析报告。八字排盘 · 能量曲线 · AI深度解读',
    type: 'website',
    locale: 'zh_CN',
    siteName: '灵魂解码',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-theme="soulcode">
      <head>
        {/* 🔒 固定 CSS @layer 优先级顺序（防浏览器扩展注入 @layer 声明破坏 Tailwind 层序） */}
        <style>{`@layer theme, base, components, utilities;`}</style>
        {/* 霞鹜文楷 CDN 字体 — 用于标题和正文（jsdelivr NPM 路径，官方文档指定） */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chinese-fonts/lxgwwenkai/dist/LXGWWenKai-Regular/result.css" />
        <link rel="preconnect" href="https://chinese-font.netlify.app" crossOrigin="anonymous" />
        {/* 系统字体降级 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FBF7F0" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased" data-site="soulcode">
        <AuthProvider>
          <div className="gradient-bg min-h-screen flex flex-col">
            <div className="soulcode-global-nav">
              <AppNav />
            </div>
            <main className="flex-1">
              {children}
            </main>
            <Footer
              brand="灵魂解码"
              description="灵魂解码 · 用 AI 看见真实的自己"
              columns={[
                {
                  title: '探索',
                  links: [
                    { label: '人生总览', href: '/master-report' },
                    { label: '人类图排盘', href: '/human-design' },
                    { label: '每日运势', href: '/daily' },
                  ],
                },
                {
                  title: '联系与家族站点',
                  links: [
                    { label: '关系合盘', href: '/compatibility' },
                    { label: 'MBTI 性格', href: '/mbti' },
                    { label: 'Stella 教育智囊', href: 'https://www.stella-aiedu.com' },
                    { label: '见己学园 · 即将上线', href: '#' },
                  ],
                },
              ]}
              socialLinks={[
                { label: '微信公众号：光明喜舍', href: '#' },
                { label: '小红书：@光明喜舍', href: '#' },
                { label: '抖音：@光明喜舍', href: '#' },
              ]}
              copyright="© 2026 光明喜舍 · 大理 · 银桥"
            />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
