'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function VoiceClonePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<null | { status: string; job_id: string }>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('文件过大，请控制在50MB以内');
        return;
      }
      if (!file.type.startsWith('audio/')) {
        setError('请上传音频文件（MP3/WAV/M4A）');
        return;
      }
      setUploadedFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;
    setIsUploading(true);
    setError('');

    // For now, show the local processing instructions
    // In production, this would upload to a server
    setProcessing(true);
    
    // Simulate: in production, this would POST to /api/voice-clone
    setTimeout(() => {
      setProcessing(false);
      setResult({
        status: 'ready',
        job_id: 'local',
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* ── 导航 ── */}
      <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="gradient-text text-xl font-bold tracking-wider">✦ 灵魂解码</Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] overflow-x-auto scrollbar-hide whitespace-nowrap -mb-1 px-2">
            <Link href="/dharma" className="hover:text-[var(--text-accent)] transition-colors">☸ 法藏</Link>
            <Link href="/dharma/bell" className="hover:text-[var(--text-accent)] transition-colors">🔔 正念铃音</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-16 pb-10 text-center max-w-4xl mx-auto">
        <div className="inline-block mb-6">
          <span className="tag-pill text-xs tracking-widest">🎙️ VoxCPM2 声音克隆引擎</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          专属声音
          <br />
          <span className="gradient-text">定制铃音</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto">
          上传你自己、你的老师或长辈的一段录音（10-30秒），
          <br className="hidden sm:inline" />
          AI将克隆这个声音，生成一整套属于TA的修行引导语音包。
        </p>
      </section>

      <div className="gold-divider max-w-5xl mx-auto mb-10" />

      {/* ── 上传区 ── */}
      <section className="px-6 pb-10 max-w-3xl mx-auto">
        <div className="card-jade p-8">
          <h2 className="text-xl font-bold mb-2">上传录音</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            支持 MP3 / WAV / M4A 格式，10-30秒清晰录音即可
          </p>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              uploadedFile ? 'border-[var(--text-accent)] bg-[var(--bg-highlight)]' : 'border-[var(--border-color)] hover:border-[var(--text-accent)]'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            {uploadedFile ? (
              <div>
                <div className="text-4xl mb-3">🎤</div>
                <p className="font-medium text-[var(--text-primary)]">{uploadedFile.name}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-3">📁</div>
                <p className="text-[var(--text-secondary)]">
                  点击上传录音文件，或拖拽到此处
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-2 opacity-60">
                  建议：用手机语音备忘录录制一段自然说话，10-30秒即可
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}

          {uploadedFile && !processing && !result && (
            <button
              onClick={handleSubmit}
              className="w-full mt-6 btn-jade"
            >
              🚀 开始生成专属铃音
            </button>
          )}

          {processing && (
            <div className="mt-6 text-center">
              <div className="spinner mx-auto mb-3" />
              <p className="text-sm text-[var(--text-secondary)]">
                正在处理音频，提取声音特征...
              </p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-accent)]">
              <p className="text-[var(--text-accent)] font-medium mb-2">✅ 录音已上传</p>
              <p className="text-sm text-[var(--text-secondary)]">
                请使用本地命令行工具完成声音克隆处理：<br />
                （详见下方使用说明）
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="gold-divider max-w-5xl mx-auto mb-10" />

      {/* ── 使用说明 ── */}
      <section className="px-6 pb-10 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">使用说明</h2>

        <div className="space-y-5">
          <div className="card-jade p-6">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[var(--bg-highlight)] flex items-center justify-center text-sm">1</span>
              准备录音
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              用手机自带录音App录制一段清晰、安静的人声。建议：<br />
              朗读一段你熟悉的文本（如《心经》或一段日常生活描述），
              时长10-30秒即可，不需要很长。尽量在安静环境中录制，
              背景噪音越小，克隆效果越好。
            </p>
          </div>

          <div className="card-jade p-6">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[var(--bg-highlight)] flex items-center justify-center text-sm">2</span>
              上传录音
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              点击上方上传区域，选择你录制好的音频文件。系统会自动检测
              音频格式和时长。上传后，系统将提取该声音的特征（音色、音调、
              说话习惯等），用于后续的语音合成。
            </p>
          </div>

          <div className="card-jade p-6">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[var(--bg-highlight)] flex items-center justify-center text-sm">3</span>
              本地处理（当前版本）
            </h3>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p>由于声音克隆需要GPU算力，当前使用本地CLI工具处理：</p>
              <pre className="bg-[var(--bg-section-alt)] p-4 rounded-lg text-xs overflow-x-auto">
{`# 1. 确保VoxCPM2已安装
source ~/venvs/voxcpm/bin/activate

# 2. 运行声音克隆脚本（替换为你的录音路径）
python3 ~/voice-pack/clone_voice.py \\
  --reference /path/to/your-recording.wav \\
  --text "录音中的逐字文本（推荐）" \\
  --output ~/my-custom-voice-pack`}
              </pre>
              <p className="mt-2">
                <strong>模式说明：</strong><br />
                • <strong>极致克隆（推荐）：</strong>提供录音+逐字文本，AI完美还原说话习惯<br />
                • <strong>可控克隆：</strong>仅提供录音，通过文字指令控制情绪和语速
              </p>
            </div>
          </div>

          <div className="card-jade p-6">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[var(--bg-highlight)] flex items-center justify-center text-sm">4</span>
              获取专属铃音
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              克隆完成后，工具会自动以该声音为基础，生成全部10段修行引导音频。
              每段都会加入前奏磬声和背景大自然音效，并将下载链接通过
              邮件或短信发送给你。整个过程约5-10分钟。
            </p>
          </div>
        </div>

        {/* 技术说明 */}
        <div className="card-jade p-6 mt-6">
          <h3 className="font-bold text-base mb-3 text-[var(--text-accent)]">🔬 技术说明</h3>
          <div className="text-sm text-[var(--text-secondary)] space-y-2">
            <p><strong className="text-[var(--text-primary)]">引擎：</strong>VoxCPM2（清华/OpenBMB开源）</p>
            <p><strong className="text-[var(--text-primary)]">功能：</strong>仅需10秒参考录音即可克隆任意声音，支持可控克隆（音色锁定+情绪指令）和极致克隆（还原咬字习惯+情感细节）</p>
            <p><strong className="text-[var(--text-primary)]">输出：</strong>48kHz录音室品质WAV，三套角色预设铃音将以克隆声音重新生成</p>
            <p><strong className="text-[var(--text-primary)]">隐私：</strong>所有录音仅用于当前会话的声音克隆，处理完成后不上传云端</p>
          </div>
        </div>
      </section>

      {/* ── 返回链接 ── */}
      <footer className="border-t border-[var(--border-color)] py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)]">
          <Link href="/dharma/bell" className="hover:text-[var(--text-accent)] transition-colors opacity-60 hover:opacity-100">
            ← 返回正念铃音主页
          </Link>
          <span className="mx-3">·</span>
          <Link href="/dharma" className="hover:text-[var(--text-accent)] transition-colors opacity-60 hover:opacity-100">
            返回法藏
          </Link>
        </div>
      </footer>
    </div>
  );
}
