import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '灵魂解码 — 你的生命使命解读报告',
  description: '输入出生日期与地点，基于真实八字排盘+AI深度解读，生成一份直击核心的个人使命与天赋解码报告。融合心理学原型、生命数字学与东方智慧。',
  openGraph: {
    title: '灵魂解码 — 你的生命使命解读报告',
    description: '一份让你感到"被看穿"的灵魂级分析报告。八字排盘 · 能量曲线 · AI深度解读',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
