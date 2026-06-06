'use client';

import { useRef, useCallback, useEffect } from 'react';

interface ShareCardData {
  pillars: string[];
  ganElements: string[];
  zhiElements: string[];
  zodiac: string;
  dayMaster: string;
  dayMasterElement: string;
  nayin: string[];
  summary: string;
  elementDistribution: Record<string, number>;
  averageEnergy: number;
  birthInfo: string;
}

const ELEMENT_COLORS: Record<string, string> = {
  '木': '#4ade80', '火': '#fb923c', '土': '#eab308', '金': '#d1d5db', '水': '#60a5fa',
};

export default function ReportShareCard({ data, onClose }: { data: ShareCardData; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = 2;
    const w = 800;
    const h = 600;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // --- 背景 ---
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#0a0a0f');
    bg.addColorStop(0.5, '#0f0f1a');
    bg.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 装饰边框
    ctx.strokeStyle = 'rgba(201,169,110,0.25)';
    ctx.lineWidth = 1.5;
    const m = 20;
    ctx.strokeRect(m, m, w - m * 2, h - m * 2);

    // 顶部装饰线
    ctx.strokeStyle = 'rgba(201,169,110,0.15)';
    ctx.beginPath();
    ctx.moveTo(60, 70); ctx.lineTo(w - 60, 70);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(60, h - 65); ctx.lineTo(w - 60, h - 65);
    ctx.stroke();

    // --- 标题 ---
    ctx.fillStyle = '#c9a96e';
    ctx.font = 'bold 26px "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ 灵魂解码 ✦', w / 2, 48);

    // --- 出生信息 ---
    ctx.fillStyle = '#9a9894';
    ctx.font = '14px "PingFang SC", sans-serif';
    ctx.fillText(data.birthInfo, w / 2, 96);

    // --- 八字四柱 ---
    const names = ['年', '月', '日', '时'];
    const gap = 145;
    const startX = 90;
    const cy = 210;

    for (let i = 0; i < 4; i++) {
      const p = data.pillars[i];
      if (p === '--') continue;
      const cx = startX + i * gap;
      const el = data.ganElements[i] !== '—' ? data.ganElements[i] : data.zhiElements[i];
      const color = ELEMENT_COLORS[el] || '#c9a96e';

      // 柱名
      ctx.fillStyle = 'rgba(201,169,110,0.08)';
      roundRect(ctx, cx - 35, cy - 90, 70, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#9a9894';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(names[i] + '柱', cx, cy - 74);

      // 天干
      ctx.fillStyle = color;
      ctx.font = 'bold 48px "PingFang SC", sans-serif';
      ctx.fillText(p.charAt(0), cx, cy + 2);

      // 地支
      ctx.fillStyle = color + 'cc';
      ctx.font = 'bold 34px "PingFang SC", sans-serif';
      ctx.fillText(p.charAt(1), cx, cy + 46);

      // 五行标签
      ctx.fillStyle = color + '33';
      roundRect(ctx, cx - 22, cy + 56, 44, 20, 10);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.font = '12px sans-serif';
      ctx.fillText(el, cx, cy + 72);

      // 纳音
      ctx.fillStyle = 'rgba(154,152,148,0.4)';
      ctx.font = '10px sans-serif';
      ctx.fillText(data.nayin[i], cx, cy + 90);
    }

    // --- 右侧信息 ---
    // 日主
    ctx.fillStyle = 'rgba(201,169,110,0.1)';
    roundRect(ctx, w - 190, 100, 165, 36, 10);
    ctx.fill();
    ctx.fillStyle = '#e0c88a';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`日主 ${data.dayMaster} · ${data.dayMasterElement}`, w - 107, 124);

    // 生肖
    ctx.fillStyle = '#9a9894';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🐯 生肖 · ${data.zodiac}`, 55, 130);

    // --- 五行分布迷你条 ---
    const elements = ['木', '火', '土', '金', '水'];
    const maxCount = Math.max(1, ...Object.values(data.elementDistribution));
    const barStartX = 55;
    const barW = 400;
    const barGap = 75;
    const barH = 10;

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const count = data.elementDistribution[el] || 0;
      const bx = barStartX + i * barGap;
      const by = 278;
      const ratio = count / maxCount;

      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      roundRect(ctx, bx, by, 60, barH, 5);
      ctx.fill();

      ctx.fillStyle = ELEMENT_COLORS[el] || '#666';
      roundRect(ctx, bx, by, 60 * ratio, barH, 5);
      ctx.fill();

      ctx.fillStyle = '#9a9894';
      ctx.textAlign = 'center';
      ctx.fillText(el, bx + 30, by - 6);
      ctx.fillStyle = 'rgba(154,152,148,0.5)';
      ctx.fillText(String(count), bx + 30, by + barH + 16);
    }

    // --- 能量曲线 ---
    const cx1 = 55, cy1 = 330, cw = w - 110, ch = 90;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    roundRect(ctx, cx1, cy1, cw, ch, 10);
    ctx.fill();

    // 网格线
    ctx.strokeStyle = 'rgba(201,169,110,0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 3; i++) {
      const yy = cy1 + (ch / 4) * (i + 1);
      ctx.beginPath();
      ctx.moveTo(cx1 + 5, yy);
      ctx.lineTo(cx1 + cw - 5, yy);
      ctx.stroke();
    }

    // 曲线
    ctx.beginPath();
    ctx.strokeStyle = '#c9a96e';
    ctx.lineWidth = 2.5;
    const midY = cy1 + ch / 2;
    const amp = ch * 0.3;

    for (let x = 0; x <= cw; x += 2) {
      const t = x / cw;
      const wave = Math.sin(t * Math.PI * 5) * Math.sin(t * Math.PI) * amp * 1.2;
      const trend = (t < 0.5 ? t * 2 : (1 - t) * 2) * 10;
      const yy = midY - wave + trend;
      if (x === 0) ctx.moveTo(cx1 + x, yy);
      else ctx.lineTo(cx1 + x, yy);
    }
    ctx.stroke();

    // 平均线
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(201,169,110,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx1 + 5, midY);
    ctx.lineTo(cx1 + cw - 5, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(154,152,148,0.4)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`均值 ${data.averageEnergy}`, cx1 + cw - 5, midY - 8);

    // 标签
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(154,152,148,0.3)';
    ctx.fillText('0岁', cx1 + 5, cy1 + ch + 18);
    ctx.textAlign = 'right';
    ctx.fillText('80岁', cx1 + cw - 5, cy1 + ch + 18);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(154,152,148,0.25)';
    ctx.fillText('— 人生能量曲线 —', cx1 + cw / 2, cy1 + 18);

    // --- 命局简评 ---
    ctx.fillStyle = 'rgba(201,169,110,0.06)';
    roundRect(ctx, 55, 455, cw, 50, 10);
    ctx.fill();
    ctx.fillStyle = '#c9a96e';
    ctx.font = '12px "PingFang SC", sans-serif';
    ctx.textAlign = 'left';
    const s = data.summary.length > 55 ? data.summary.slice(0, 55) + '...' : data.summary;
    ctx.fillText('📜 ' + s, 75, 482);

    // --- 底部 ---
    ctx.fillStyle = 'rgba(154,152,148,0.35)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('soul-decode.vercel.app · AI深度解读', w / 2, h - 38);
  }, [data]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleDownload = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const link = document.createElement('a');
    link.download = `灵魂解码_${data.pillars.filter(p => p !== '--').join('')}.png`;
    link.href = c.toDataURL('image/png');
    link.click();
  }, [data]);

  const handleCopy = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;
    try {
      const blob = await new Promise<Blob>(r => c.toBlob(b => r(b!), 'image/png'));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch {
      handleDownload();
    }
  }, [handleDownload]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <canvas
          ref={canvasRef}
          style={{ width: 400, height: 300, borderRadius: 12 }}
          className="shadow-2xl border border-[var(--gold-light)]/20"
        />
        <div className="flex gap-3">
          <button onClick={handleDownload} className="btn-gold !w-auto !px-6 !py-3 text-sm">
            📥 保存图片
          </button>
          <button onClick={handleCopy}
            className="!w-auto !px-6 !py-3 text-sm rounded-lg font-semibold cursor-pointer transition-all"
            style={{
              background: 'linear-gradient(135deg, #555, #333)',
              color: '#e8e6e3',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            📋 复制到剪贴板
          </button>
          <button onClick={onClose}
            className="!w-auto !px-4 !py-3 text-sm rounded-lg cursor-pointer transition-all"
            style={{
              background: 'transparent',
              color: '#9a9894',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            ✕ 关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
