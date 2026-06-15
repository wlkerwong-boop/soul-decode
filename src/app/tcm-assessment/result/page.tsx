'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TTSReader from '@/components/TTSReader';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import SaveToArchive from '@/components/SaveToArchive';

export default function TcmDiagnosisResultPage() {
  const router = useRouter();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('tcm-diagnosis-result');
    if (!saved) {
      router.replace('/tcm-assessment');
      return;
    }
    setContent(saved);
    setLoading(false);
  }, [router]);

  const handleRestart = () => {
    router.push('/tcm-assessment');
  };

  // Strip markdown for TTS
  const getTTSContent = (text: string) => {
    return text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/>\s/g, '')
      .replace(/- /g, '')
      .replace(/\n{2,}/g, '，')
      .replace(/\n/g, '，');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="relative z-10 text-center">
          <div className="cosmic-loader mx-auto mb-6">
            <div className="cosmic-ring cosmic-ring-1" />
            <div className="cosmic-ring cosmic-ring-2" />
            <div className="cosmic-ring cosmic-ring-3" />
            <div className="cosmic-center">✦</div>
          </div>
          <p className="text-[var(--text-secondary)] loading-pulse">加载报告中...</p>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="relative z-10 min-h-screen py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <span className="tag-pill text-xs tracking-widest mb-4 inline-block">✦ 辨证报告</span>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              中医十问 · <span className="text-[var(--text-accent)]">辨证结果</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              基于中医通鉴数据库 + AI深度解读生成的个性化调理方案
            </p>
          </div>

          {/* 语音朗读 */}
          <div className="flex justify-center mb-8">
            <TTSReader
              text={getTTSContent(content)}
              label="🎧 语音朗读报告"
            />
          </div>

          {/* 报告内容 */}
          <div className="p-6 md:p-10 rounded-xl border border-[var(--border-color)] bg-black/40 backdrop-blur-sm mb-8">
            <MarkdownRenderer content={content} />
          </div>

          {/* 保存到健康档案 */}
          <SaveToArchive
            content={content}
            reportType="health"
            defaultTitle="中医十问·AI辨证分析"
          />

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/tcm-assessment"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--text-accent)] text-[var(--text-accent)] rounded-lg hover:bg-[var(--text-accent)]/10 transition-all"
            >
              📋 重新填写问诊单
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
            <Link href="/health" className="text-sm text-[var(--text-accent)] hover:underline">
              📖 健康评测
            </Link>
            <span className="text-[var(--border-color)] mx-3">|</span>
            <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
              返回首页
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
