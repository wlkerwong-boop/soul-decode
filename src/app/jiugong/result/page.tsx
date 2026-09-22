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
      <main className="inner-page gradient-bg min-h-screen px-4 py-16 pt-nav">
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
    <main className="inner-page gradient-bg min-h-screen px-4 py-8 pt-nav print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-5xl">
        {data.unknownChars && data.unknownChars.length > 0 && (
          <div className="mb-5 rounded-2xl border border-amber-400/60 bg-amber-50 px-5 py-4 print:hidden" role="alert">
            <p className="text-sm font-bold text-amber-900">
              ⚠️ 名字中有以下字暂未收录于康熙笔画库
            </p>
            <p className="mt-1.5 text-xs leading-6 text-amber-800">
              「{data.unknownChars.join('、')}」的笔画为部首估算，当前报告仅供参考。
            </p>
            <p className="mt-1 text-[11px] leading-5 text-amber-700">
              建议人工核对康熙字典繁体笔画后，以准确笔画重新排盘，或咨询程天相九宫学理专业人士。
            </p>
          </div>
        )}

        <header className="relative overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)]/85 px-6 py-9 text-center shadow-xl backdrop-blur sm:px-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
          <p className="text-[10px] font-semibold tracking-[0.32em] text-[var(--color-primary)]">
            JIUGONG · LIFE TREND
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            {data.name}的九宫人生趋势报告
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs leading-6 text-[var(--text-secondary)]">
            程天相九宫学理 · 康熙正体笔画 · 六章完整人生说明书
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
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--text-primary)] px-6 py-3 text-xs font-semibold text-[var(--bg-card)] transition-transform hover:-translate-y-0.5 print:hidden"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            下载 PDF 报告
          </button>
          <p className="mt-3 text-[10px] leading-4 text-[var(--text-tertiary)] print:hidden">
            完整六章报告 · 保存为 PDF 后适合打印与分享
          </p>
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
