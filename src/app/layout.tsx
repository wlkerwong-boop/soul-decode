import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '灵魂解码 — AI八字排盘·人生使命解读报告',
  description: '输入出生日期，基于真实八字算法排盘+AI深度解读，生成你的生命使命与天赋解码报告。融合心理学原型、东方命理与AI技术。免费体验。',
  keywords: ['八字排盘', 'AI算命', '命理解读', '天赋测试', '人生使命', 'MBTI性格', '能量K线', '灵魂解码'],
  openGraph: {
    title: '灵魂解码 — 你的生命使命解读报告',
    description: '一份让你感到"被看穿"的灵魂级分析报告。八字排盘 · 能量曲线 · AI深度解读',
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
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4a7c6f" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <div className="gradient-bg min-h-screen flex flex-col">
            <Nav />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
