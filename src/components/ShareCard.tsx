'use client';

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

interface ShareCardProps {
  userName?: string;
  pillars?: string;
  tagline?: string;
}

export default function ShareCard({ userName, pillars, tagline }: ShareCardProps) {
  const [size, setSize] = useState<'wechat' | 'xiaohongshu'>('wechat');
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const dimensions = {
    wechat: { width: 1080, height: 1920, label: '朋友圈' },
    xiaohongshu: { width: 1242, height: 1660, label: '小红书' },
  };

  const dim = dimensions[size];
  const scale = 1 / 3; // For preview

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: dim.width,
        height: dim.height,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `灵魂解码-${size}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('导出失败:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Size toggle */}
      <div className="flex gap-2">
        {Object.entries(dimensions).map(([key, d]) => (
          <button
            key={key}
            onClick={() => setSize(key as keyof typeof dimensions)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              size === key
                ? 'bg-[var(--text-accent)] text-white'
                : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-accent)]'
            }`}
          >
            {d.label} {d.width}x{d.height}
          </button>
        ))}
      </div>

      {/* Card Preview */}
      <div
        ref={cardRef}
        style={{
          width: dim.width,
          height: dim.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          background: 'linear-gradient(160deg, #1a1a18 0%, #2a2824 30%, #1a2a24 60%, #2a2218 100%)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '40px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: "'PingFang SC', 'Noto Sans SC', system-ui, sans-serif",
        }}
      >
        {/* Decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74, 124, 111, 0.15), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 160, 110, 0.10), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Top: Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '48px', background: 'linear-gradient(135deg, #4a7c6f, #c9a06e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#e8e6e3', letterSpacing: '2px' }}>灵魂解码</span>
          </div>
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #4a7c6f, #c9a06e, transparent)', marginTop: '16px', width: '60%' }} />
        </div>

        {/* Center: User info */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔮</div>
          <h1 style={{ fontSize: '52px', fontWeight: 700, color: '#e8e6e3', marginBottom: '12px', lineHeight: 1.3 }}>
            {userName || '我的'}灵魂解码
          </h1>
          {pillars && (
            <div style={{ fontSize: '24px', color: '#c9a06e', marginBottom: '20px', fontFamily: 'monospace', letterSpacing: '4px' }}>
              {pillars}
            </div>
          )}
          {tagline && (
            <p style={{ fontSize: '22px', color: '#b0aaa4', lineHeight: 1.6, maxWidth: '80%', margin: '0 auto' }}>
              {tagline}
            </p>
          )}
        </div>

        {/* Bottom: Brand */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', padding: '12px 40px', borderRadius: '50px', border: '1px solid rgba(74, 124, 111, 0.3)', background: 'rgba(74, 124, 111, 0.08)' }}>
            <span style={{ fontSize: '20px', color: '#4a7c6f' }}>◈</span>
            <span style={{ fontSize: '18px', color: '#6a9c8f', marginLeft: '10px' }}>扫码生成你的专属报告</span>
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#6b6258' }}>
            aisoulcode.cn
          </div>
          {/* Simulated QR code placeholder */}
          <div style={{
            width: '80px', height: '80px', margin: '12px auto 0',
            border: '2px solid rgba(74, 124, 111, 0.3)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', color: '#6b6258', background: 'rgba(255,255,255,0.03)'
          }}>
            二维码
          </div>
        </div>
      </div>

      {/* Export */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="btn-jade inline-flex items-center justify-center px-6 py-3 text-sm"
        style={{ width: 'auto' }}
      >
        {exporting ? '生成中…' : '📸 导出为PNG'}
      </button>
    </div>
  );
}
