'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CosmicBackground from '@/components/CosmicBackground';
import TTSReader from '@/components/TTSReader';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import SaveToArchive from '@/components/SaveToArchive';

export default function TcmReportPage() {
  const router = useRouter();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('tcm-diagnosis-result');
    if (!saved) {
      router.replace('/health');
      return;
    }
    setContent(saved);
    setLoading(false);
  }, [router]);

  // Strip markdown for TTS
  const getTTSContent = (text: string) => {
    return text
      .replace(/#{1,6}\s/g, '')         // remove headings
      .replace(/\*\*/g, '')              // remove bold
      .replace(/\*/g, '')                // remove italic
      .replace(/`([^`]+)`/g, '$1')       // remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove links
      .replace(/>\s/g, '')               // remove blockquote markers
      .replace(/- /g, '')                // remove list markers
      .replace(/\|/g, '，')              // table separators -> comma
      .replace(/\n{2,}/g, '，')          // reduce multiple newlines
      .replace(/\n/g, '，');
  };

  const handlePrint = () => {
    setPrintMode(true);
    // Small delay to let state update, then print
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const handleRestart = () => {
    router.push('/health/assessment');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <CosmicBackground />
        <div className="relative z-10 text-center">
          <div className="cosmic-loader mx-auto mb-6">
            <div className="cosmic-ring cosmic-ring-1" />
            <div className="cosmic-ring cosmic-ring-2" />
            <div className="cosmic-ring cosmic-ring-3" />
            <div className="cosmic-center">✦</div>
          </div>
          <p className="text-[var(--text-secondary)] loading-pulse">加载诊断报告中...</p>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className={`relative min-h-screen ${printMode ? 'print-mode' : ''}`}>
      <CosmicBackground />
      <div className="relative z-10 gradient-bg min-h-screen py-12 px-6">
        <div className="max-w-3xl mx-auto">

          {/* 页面标题 */}
          <div className="text-center mb-8">
            <span className="tag-pill text-xs tracking-widest mb-4 inline-block">✦ 中医诊断报告</span>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              辨证论治 · <span className="text-[var(--text-accent)]">诊断详情</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              基于中医通鉴数据库 + AI辨证论治，深度结构化的个性化诊断报告
            </p>
          </div>

          {/* 操作栏：语音朗读 + 打印 */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <TTSReader
              text={getTTSContent(content)}
              label="🎧 语音朗读报告"
            />
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--text-accent)] hover:text-white transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              打印 / 导出PDF
            </button>
          </div>

          {/* 报告内容 */}
          <div className="p-6 md:p-10 rounded-xl border border-[var(--border-color)] bg-black/40 backdrop-blur-sm mb-8">
            <div className="print-report-area">
              <MarkdownRenderer content={content} />
            </div>
          </div>

          {/* 保存到档案 */}
          <SaveToArchive
            content={content}
            reportType="tcm"
            defaultTitle="中医辨证·AI诊断报告"
          />

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/tcm"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--text-accent)] text-[var(--text-accent)] rounded-lg hover:bg-[var(--text-accent)]/10 transition-all"
            >
              📖 浏览中医通鉴
              <span className="text-lg">→</span>
            </Link>
            <button
              onClick={handleRestart}
              className="px-6 py-3 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--text-accent)] hover:text-white transition-all"
            >
              🔄 重新评测
            </button>
          </div>

          {/* 底部链接 */}
          <div className="text-center pb-8">
            <Link href="/" className="text-sm text-[var(--text-accent)] hover:underline">
              ← 返回首页
            </Link>
            <span className="text-[var(--border-color)] mx-3">|</span>
            <Link href="/health" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
              关于身心同调
            </Link>
          </div>

          {/* 免责声明 */}
          <div className="text-center pb-12">
            <p className="text-xs text-[var(--text-secondary)] opacity-40">
              本报告由AI基于中医经典理论生成，仅供参考，不构成医疗诊断建议。
              <br />
              如有身体不适，请及时就医。
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
