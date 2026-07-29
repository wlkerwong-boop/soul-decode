'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { JiugongFull } from '../../../server/jiugong-v6';
import { JiugongTabs } from '../../../components/jiugong/JiugongTabs';

export default function JiugongResultPage() {
  const [data, setData] = useState<JiugongFull | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('jiugong-data');
    if (!raw) return;
    let active = true;
    try {
      const parsed = JSON.parse(raw) as JiugongFull;
      queueMicrotask(() => {
        if (active) setData(parsed);
      });
    } catch {
      sessionStorage.removeItem('jiugong-data');
    }
    return () => {
      active = false;
    };
  }, []);

  if (!data) {
    return (
      <main className="gradient-bg min-h-screen px-4 py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center shadow-xl">
          <p className="font-serif text-2xl text-[var(--text-primary)]">还没有本次排盘结果</p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            九宫结果只保存在当前浏览器会话，请先返回输入页完成排盘。
          </p>
          <Link
            href="/jiugong"
            className="mt-6 inline-flex rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            返回九宫排盘
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="gradient-bg min-h-screen px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-5xl">
        <header className="relative overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)]/85 px-6 py-9 text-center shadow-xl backdrop-blur sm:px-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
          <p className="text-[10px] font-semibold tracking-[0.32em] text-[var(--color-primary)]">
            JIUGONG · LIFE TREND
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            {data.name}的九宫人生趋势报告
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs leading-6 text-[var(--text-secondary)]">
            程天相九宫学理 · 康熙正体笔画 · 特质、环境与经营三位一体
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-[11px] text-[var(--text-tertiary)]">
            <span className="rounded-full border border-[var(--border-color)] px-3 py-1">
              {data.year}.{data.month}.{data.day}
            </span>
            <span className="rounded-full border border-[var(--border-color)] px-3 py-1">
              总格 {data.total}
            </span>
            <span className="rounded-full border border-[var(--border-color)] px-3 py-1">
              局差 {data.ju}
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-6 rounded-xl bg-[var(--text-primary)] px-5 py-2.5 text-xs font-semibold text-[var(--bg-card)] transition-transform hover:-translate-y-0.5 print:hidden"
          >
            打印 / 保存 PDF
          </button>
        </header>

        <div className="mt-5">
          <JiugongTabs data={data} />
        </div>

        <footer className="py-8 text-center text-[10px] leading-5 text-[var(--text-tertiary)]">
          本报告仅供学习与自我观察，不构成医疗、投资或人生决定建议。
        </footer>
      </div>
    </main>
  );
}
