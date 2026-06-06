'use client';

import { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

const STAR_COLORS = [
  '#ffffff',
  '#c9a96e',
  '#e0c88a',
  '#a8c8e8',
  '#f0e6c0',
];

const CONSTELLATIONS = [
  // 北斗七星-like formation
  [
    { x: 0.15, y: 0.12 }, { x: 0.18, y: 0.15 }, { x: 0.22, y: 0.13 },
    { x: 0.25, y: 0.10 }, { x: 0.28, y: 0.08 }, { x: 0.32, y: 0.09 },
    { x: 0.35, y: 0.11 },
  ],
  // A cross-like formation
  [
    { x: 0.65, y: 0.08 }, { x: 0.65, y: 0.18 }, { x: 0.65, y: 0.28 },
    { x: 0.58, y: 0.18 }, { x: 0.72, y: 0.18 },
  ],
  // A triangle
  [
    { x: 0.80, y: 0.82 }, { x: 0.88, y: 0.78 }, { x: 0.84, y: 0.88 },
  ],
  // Diamond
  [
    { x: 0.10, y: 0.85 }, { x: 0.15, y: 0.80 }, { x: 0.20, y: 0.85 },
    { x: 0.15, y: 0.90 },
  ],
];

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let stars: Star[] = [];

    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx!.scale(dpr, dpr);

      // Regenerate stars on resize
      const numStars = Math.floor((window.innerWidth * window.innerHeight) / 4000);
      stars = Array.from({ length: Math.max(numStars, 80) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.3,
        opacity: Math.random() * 0.6 + 0.1,
        speed: Math.random() * 0.15 + 0.02,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      }));
      starsRef.current = stars;
    }

    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking for parallax effect
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse);

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      timeRef.current += 1;

      ctx.clearRect(0, 0, w, h);

      // Draw stars
      for (const star of stars) {
        const parallaxX = (mx - w / 2) / w * star.speed * 20;
        const parallaxY = (my - h / 2) / h * star.speed * 20;

        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        const x = star.x + parallaxX;
        const y = star.y + parallaxY;

        // Glow effect for larger stars
        if (star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(x, y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201, 169, 110, ${alpha * 0.08})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw constellation lines (subtle)
      ctx.strokeStyle = 'rgba(201, 169, 110, 0.04)';
      ctx.lineWidth = 0.5;

      for (const points of CONSTELLATIONS) {
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const px = points[i].x * w;
          const py = points[i].y * h;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Very subtle nebula clouds
      const gradient1 = ctx.createRadialGradient(
        w * 0.7 + Math.sin(timeRef.current * 0.001) * 50,
        h * 0.3, 0,
        w * 0.7, h * 0.3, w * 0.25,
      );
      gradient1.addColorStop(0, 'rgba(60, 30, 80, 0.015)');
      gradient1.addColorStop(1, 'rgba(60, 30, 80, 0)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, w, h);

      const gradient2 = ctx.createRadialGradient(
        w * 0.2 + Math.cos(timeRef.current * 0.0015) * 30,
        h * 0.7, 0,
        w * 0.2, h * 0.7, w * 0.15,
      );
      gradient2.addColorStop(0, 'rgba(80, 50, 30, 0.012)');
      gradient2.addColorStop(1, 'rgba(80, 50, 30, 0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    />
  );
}
