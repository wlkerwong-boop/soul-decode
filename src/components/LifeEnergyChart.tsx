'use client';

/**
 * 人生能量曲线图（K线风格）
 *
 * 将用户的人生运势以K线图风格可视化
 * 红色=高能期，绿色=低能期，曲线平滑过渡
 * 标记关键转折点、大运更替
 */

import { useRef, useEffect, useMemo } from 'react';

interface EnergyPoint {
  age: number;
  year: number;
  energy: number;
  element: string;
  period: string;
  type: string;  // 'high' | 'low' | 'mid'
}

interface TurningPoint {
  year: number;
  age: number;
  label: string;
  significance: 'major' | 'minor';
}

interface LifeEnergyChartProps {
  curve: EnergyPoint[];
  turningPoints: TurningPoint[];
  startLuckAge: number;
  averageEnergy: number;
}

const ELEMENT_COLORS: Record<string, string> = {
  '木': '#4ade80',
  '火': '#fb923c',
  '土': '#eab308',
  '金': '#e0e0e0',
  '水': '#60a5fa',
};

export default function LifeEnergyChart({
  curve,
  turningPoints,
  startLuckAge,
  averageEnergy,
}: LifeEnergyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentYear = new Date().getFullYear();

  const sortedPoints = useMemo(() => {
    return turningPoints
      .filter((p, i, arr) => arr.findIndex(t => t.label === p.label) === i)
      .sort((a, b) => a.age - b.age)
      .slice(0, 12);
  }, [turningPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || curve.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = 280;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // 清除画布
    ctx.clearRect(0, 0, w, h);

    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const minEnergy = 0;
    const maxEnergy = 100;
    const energyRange = maxEnergy - minEnergy;

    // X轴映射
    const minAge = 0;
    const maxAge = 80;
    const ageToX = (age: number) => padding.left + ((age - minAge) / (maxAge - minAge)) * chartW;

    // Y轴映射
    const energyToY = (energy: number) => padding.top + chartH - ((energy - minEnergy) / energyRange) * chartH;

    // === 背景网格 ===
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.06)';
    ctx.lineWidth = 0.5;

    // 水平网格线（能量等级）
    for (let e = 0; e <= 100; e += 20) {
      const y = energyToY(e);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // 标签
      if (e > 0 && e < 100) {
        ctx.fillStyle = 'rgba(154, 152, 148, 0.3)';
        ctx.font = '9px sans-serif';
        ctx.fillText(String(e), 5, y + 3);
      }
    }

    // 能量区背景色带
    const highBandY = energyToY(65);
    const lowBandY = energyToY(35);
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(74, 222, 128, 0.05)');
    gradient.addColorStop(0.35, 'rgba(74, 222, 128, 0.02)');
    gradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.02)');
    gradient.addColorStop(0.65, 'rgba(251, 146, 60, 0.02)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(padding.left, padding.top, chartW, chartH);

    // 高能/低能区标签
    ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
    ctx.font = '10px sans-serif';
    ctx.fillText('高能区', w - padding.right - 45, highBandY - 5);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.fillText('低能区', w - padding.right - 45, lowBandY + 15);

    // === 能量曲线（渐变填充） ===
    const lineGradient = ctx.createLinearGradient(0, 0, 0, h);
    lineGradient.addColorStop(0, '#c9a96e');
    lineGradient.addColorStop(0.3, '#dbb980');
    lineGradient.addColorStop(0.5, '#c9a96e');
    lineGradient.addColorStop(0.7, '#b8944e');
    lineGradient.addColorStop(1, '#a08040');

    // 填充区域
    ctx.beginPath();
    ctx.moveTo(ageToX(curve[0].age), padding.top + chartH);
    for (const point of curve) {
      ctx.lineTo(ageToX(point.age), energyToY(point.energy));
    }
    ctx.lineTo(ageToX(curve[curve.length - 1].age), padding.top + chartH);
    ctx.closePath();

    const fillGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    fillGradient.addColorStop(0, 'rgba(201, 169, 110, 0.25)');
    fillGradient.addColorStop(0.5, 'rgba(201, 169, 110, 0.08)');
    fillGradient.addColorStop(1, 'rgba(201, 169, 110, 0.02)');
    ctx.fillStyle = fillGradient;
    ctx.fill();

    // 主曲线
    ctx.beginPath();
    for (let i = 0; i < curve.length; i++) {
      const x = ageToX(curve[i].age);
      const y = energyToY(curve[i].energy);
      if (i === 0) ctx.moveTo(x, y);
      else {
        const prevX = ageToX(curve[i - 1].age);
        const prevY = energyToY(curve[i - 1].energy);
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    }
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // === 「现在」标记线 ===
    const currentAge = currentYear - curve[0].year + curve[0].age;
    if (currentAge >= 0 && currentAge <= 80) {
      const xNow = ageToX(currentAge);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(xNow, padding.top);
      ctx.lineTo(xNow, padding.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // "现在"标签
      const nowEnergy = curve.find(p => Math.abs(p.age - Math.round(currentAge)) <= 1)?.energy || averageEnergy;
      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('● 现在', xNow - 18, padding.top - 5);
    }

    // === 关键转折点标记 ===
    for (const point of sortedPoints) {
      if (point.age < 0 || point.age > 80) continue;
      const x = ageToX(point.age);
      const y = energyToY(
        curve.find(p => Math.abs(p.age - point.age) <= 2)?.energy || averageEnergy
      );

      const isMajor = point.significance === 'major';
      const markerColor = point.label.includes('高能') ? '#4ade80'
        : point.label.includes('蛰伏') ? '#ef4444'
        : '#c9a96e';

      // 标记点
      ctx.beginPath();
      ctx.arc(x, y, isMajor ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = markerColor;
      ctx.fill();
      ctx.strokeStyle = 'rgba(10, 10, 15, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 标签
      ctx.fillStyle = markerColor;
      ctx.font = isMajor ? 'bold 10px sans-serif' : '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, x, y - (isMajor ? 12 : 10));
      ctx.fillStyle = 'rgba(154, 152, 148, 0.4)';
      ctx.font = '8px sans-serif';
      ctx.fillText(`${point.age}岁`, x, y - (isMajor ? 24 : 20));
    }

    // === X轴 ===
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    ctx.lineTo(w - padding.right, padding.top + chartH);
    ctx.stroke();

    // X轴标签（每5年一个）
    ctx.fillStyle = 'rgba(154, 152, 148, 0.5)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    for (let age = 0; age <= 80; age += 5) {
      const x = ageToX(age);
      ctx.fillText(`${age}岁`, x, h - 8);
    }

    // === 当前年龄高亮 ===
    const nowAge = currentYear - curve[0].year + curve[0].age;
    if (nowAge >= 0 && nowAge <= 80) {
      const nowX = ageToX(nowAge);
      // 当前年龄在X轴的标记
      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('▼', nowX, h - 22);
    }
  }, [curve, turningPoints, startLuckAge, averageEnergy]);

  const currentEnergy = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const point = curve.find(p => p.year === currentYear);
    return point?.energy || averageEnergy;
  }, [curve, averageEnergy]);

  return (
    <div className="life-energy-container">
      {/* 标题 */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-2xl">📈</span>
          <h2 className="text-xl font-bold text-[var(--text-accent)] tracking-wider">
            人生能量K线
          </h2>
          <span className="text-2xl">📈</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] opacity-70">
          从{curve[0]?.year || '出生'}到{curve[curve.length - 1]?.year || '晚年'} · 一生运势曲线
        </p>
      </div>

      {/* 当前能量仪表盘 */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="energy-metric rounded-xl px-5 py-3 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(201,169,110,0.03))',
            border: '1px solid rgba(201,169,110,0.15)',
          }}
        >
          <div className="text-xs text-[var(--text-secondary)] opacity-60 mb-1">当前能量</div>
          <div className="text-2xl font-bold" style={{
            color: currentEnergy > 65 ? '#4ade80' : currentEnergy < 35 ? '#ef4444' : '#c9a96e'
          }}>
            {currentEnergy}
          </div>
          <div className="text-xs text-[var(--text-secondary)] opacity-50">{new Date().getFullYear()}年</div>
        </div>
        <div className="energy-metric rounded-xl px-5 py-3 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(201,169,110,0.03))',
            border: '1px solid rgba(201,169,110,0.15)',
          }}
        >
          <div className="text-xs text-[var(--text-secondary)] opacity-60 mb-1">平均能量</div>
          <div className="text-2xl font-bold text-[var(--text-accent)]">{averageEnergy}</div>
          <div className="text-xs text-[var(--text-secondary)] opacity-50">一生总趋势</div>
        </div>
        <div className="energy-metric rounded-xl px-5 py-3 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(201,169,110,0.03))',
            border: '1px solid rgba(201,169,110,0.15)',
          }}
        >
          <div className="text-xs text-[var(--text-secondary)] opacity-60 mb-1">起运年龄</div>
          <div className="text-2xl font-bold text-[var(--text-accent)]">{startLuckAge}</div>
          <div className="text-xs text-[var(--text-secondary)] opacity-50">大运始</div>
        </div>
      </div>

      {/* Canvas */}
      <div className="chart-wrapper rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(10,10,15,0.6), rgba(10,10,15,0.9))',
          border: '1px solid rgba(201,169,110,0.1)',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '280px' }}
          className="block"
        />
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1 text-[var(--text-secondary)]">
          <span className="w-3 h-0.5 bg-[#c9a96e] inline-block" /> 能量曲线
        </span>
        <span className="flex items-center gap-1 text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-[#4ade80] inline-block" /> 高能转折
        </span>
        <span className="flex items-center gap-1 text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] inline-block" /> 低能转折
        </span>
        <span className="flex items-center gap-1 text-[var(--text-secondary)]">
          <span className="w-3 h-0.5 bg-[#fb923c] inline-block" style={{ borderTop: '2px dashed #fb923c', height: 0 }} /> 现在位置
        </span>
      </div>

      {/* 关键提示 */}
      <div className="mt-6 max-w-xl mx-auto">
        <div
          className="rounded-xl p-4 text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(201,169,110,0.06), rgba(201,169,110,0.02))',
            border: '1px solid rgba(201,169,110,0.1)',
          }}
        >
          <p className="text-[var(--text-secondary)] leading-relaxed">
            📊 曲线越高，代表那个年份的能量越旺，适合行动、决策、开创。
            曲线越低，代表需要内省、积累、等待时机。
            <span className="text-[var(--text-accent)]"> 能量本身无好坏，知时而动，即为天时。</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        .energy-metric {
          min-width: 100px;
        }
        @media (max-width: 480px) {
          .energy-metric {
            min-width: 80px;
            padding-left: 10px;
            padding-right: 10px;
          }
        }
      `}</style>
    </div>
  );
}
