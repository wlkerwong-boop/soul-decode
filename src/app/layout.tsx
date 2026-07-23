import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '自我认知与成长测评 — 发现真实的自己',
  description: '多维人格分析 · 天赋识别 · 成长路径规划。融合心理学与传统文化智慧，用数据看清自己。',
  keywords: ['人格测评', '大五人格', 'MBTI', '自我认知', '成长规划', '天赋测试', '人类图', '八字排盘'],
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
        {/* Google Fonts: Inter (English) + Noto Sans SC (Chinese) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+SC:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a2e" />
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
