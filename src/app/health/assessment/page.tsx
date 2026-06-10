'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CosmicBackground from '@/components/CosmicBackground';

const SYMPTOM_EXAMPLE = `例如：
头痛：太阳穴两侧胀痛，下午加重，持续3天
胃胀：饭后上腹部胀满，打嗝后减轻，持续2周
失眠：入睡困难，凌晨1-3点易醒，多梦，持续1个月
大便：大便不成形，黏腻，每日1-2次`;

const TONGUE_GUIDE_STEPS = [
  '在自然光下拍摄，避免偏色',
  '嘴巴自然张开，舌头自然伸出（不要用力）',
  '分别拍：舌面、舌底、舌侧各一张，共3张',
  '拍摄前30分钟内不要进食或喝有色饮品',
];

export default function HealthAssessmentPage() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [tongueAnalysis, setTongueAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = symptoms.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/health-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          age: age || undefined,
          gender: gender || undefined,
          location: location || undefined,
          lifestyle: lifestyle || undefined,
          tongueAnalysis: tongueAnalysis || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '评测请求失败，请稍后重试');
      }

      if (!data.content) {
        throw new Error('AI返回结果为空，请重新提交');
      }

      // 将结果存入 sessionStorage 供结果页读取
      sessionStorage.setItem('health-diagnosis-result', data.content);
      router.push('/health/result');
    } catch (err: any) {
      setError(err.message || '网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <CosmicBackground />
      <div className="relative z-10 gradient-bg min-h-screen py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-10">
            <Link href="/health" className="text-sm text-[var(--text-accent)] hover:underline mb-4 inline-block">
              ← 返回健康评测介绍
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              身心同调 · <span className="text-[var(--text-accent)]">AI辨证</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              请尽量详细地描述您的情况，信息越完整，辨证越精准
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-red-400 text-sm">
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <div>
                  <p>{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="underline mt-1 inline-block hover:text-red-300"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 症状描述 */}
            <section className="p-6 md:p-8 rounded-xl border border-[var(--border-color)] bg-black/40 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-[var(--text-accent)] mb-2">
                📋 症状描述 <span className="text-red-400">*</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                请按照「部位 + 性质 + 时间规律」的格式描述，参考下方示例
              </p>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder={SYMPTOM_EXAMPLE}
                rows={8}
                className="input-gold resize-y font-mono text-sm leading-relaxed"
                disabled={loading}
              />
            </section>

            {/* 个人信息 */}
            <section className="p-6 md:p-8 rounded-xl border border-[var(--border-color)] bg-black/40 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-[var(--text-accent)] mb-4">
                👤 基本信息
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                以下信息有助于AI更精准地辨证（选填）
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">年龄</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="例如：32"
                    min={0}
                    max={150}
                    className="input-gold"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">性别</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="input-gold"
                    disabled={loading}
                  >
                    <option value="">请选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">居住地</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="例如：广东广州（南方潮湿）"
                    className="input-gold"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">生活习惯</label>
                  <input
                    type="text"
                    value={lifestyle}
                    onChange={(e) => setLifestyle(e.target.value)}
                    placeholder="例如：熬夜较多，喜食生冷，久坐"
                    className="input-gold"
                    disabled={loading}
                  />
                </div>
              </div>
            </section>

            {/* 舌诊指导 */}
            <section className="p-6 md:p-8 rounded-xl border border-[var(--border-color)] bg-black/40 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-[var(--text-accent)] mb-2">
                👅 舌诊辅助（选填）
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-1">
                舌象是中医辨证的重要依据，如有条件请上传舌苔照片
              </p>

              {/* 拍摄指导 */}
              <div className="mt-4 p-4 rounded-lg border border-[var(--text-accent)]/20 bg-[var(--text-accent)]/5">
                <h3 className="text-sm font-bold text-[var(--text-accent)] mb-2">📸 拍摄指南</h3>
                <ul className="space-y-1.5">
                  {TONGUE_GUIDE_STEPS.map((step, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-[var(--text-accent)] shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 文字描述舌象（临时方案，后续改为图片上传） */}
              <div className="mt-4">
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  或用文字描述您的舌象
                </label>
                <textarea
                  value={tongueAnalysis}
                  onChange={(e) => setTongueAnalysis(e.target.value)}
                  placeholder="例如：舌质淡红，舌边有齿痕，苔白腻，舌下静脉青紫"
                  rows={3}
                  className="input-gold resize-y text-sm"
                  disabled={loading}
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">
                  📷 照片上传功能即将上线，届时可直接拍摄上传
                </p>
              </div>
            </section>

            {/* 提交按钮 */}
            <div className="text-center">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="btn-gold max-w-md mx-auto flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>AI正在辨证分析中...</span>
                  </>
                ) : (
                  <span>✦ 提交评测 ✦</span>
                )}
              </button>
              {!isFormValid && !loading && (
                <p className="text-xs text-red-400 mt-2">请至少描述您的症状后再提交</p>
              )}
              {loading && (
                <p className="text-xs text-[var(--text-secondary)] mt-3 animate-pulse">
                  正在融合中医通鉴数据库进行辨证分析，请耐心等待...
                </p>
              )}
            </div>
          </form>

          {/* 底部链接 */}
          <div className="text-center mt-12 pb-8">
            <Link href="/tcm" className="text-sm text-[var(--text-accent)] hover:underline">
              📖 查看中医通鉴知识库
            </Link>
            <span className="text-[var(--border-color)] mx-3">|</span>
            <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
