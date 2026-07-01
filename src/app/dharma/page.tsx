'use client';

import { useState } from 'react';
import Link from 'next/link';

type Tab = 'jiru' | 'jingang' | 'tcm';

export default function DharmaPage() {
  const [tab, setTab] = useState<Tab>('jiru');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  // TCM diagnosis state
  const [symptoms, setSymptoms] = useState('');
  const [tcmAnswer, setTcmAnswer] = useState('');
  const [tcmLoading, setTcmLoading] = useState(false);

  const ask = async (api: string) => {
    if (!question.trim()) return;
    setLoading(true); setAnswer('');
    try {
      const r = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const d = await r.json();
      setAnswer(d.answer || d.error || '未获取到回答');
    } catch {
      setAnswer('请求失败，请稍后再试');
    }
    setLoading(false);
  };

  const diagnose = async () => {
    if (!symptoms.trim()) return;
    setTcmLoading(true); setTcmAnswer('');
    try {
      const r = await fetch('/api/health-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });
      const d = await r.json();
      setTcmAnswer(d.content || d.error || '诊断失败');
    } catch {
      setTcmAnswer('请求失败');
    }
    setTcmLoading(false);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <section className="px-6 pt-16 pb-8 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">☸ <span className="gradient-text">法藏</span></h1>
        <p className="text-lg text-[var(--text-secondary)] mb-2">寂如师父开示 · 金刚老师讲记 · 中医智慧</p>
      </section>

      <div className="flex justify-center gap-2 mb-8 px-4 flex-wrap">
        {[
          { k: 'jiru' as Tab, l: '🧘 寂如师', d: 'RAG问答' },
          { k: 'jingang' as Tab, l: '💎 金刚老师', d: '内容银行RAG' },
          { k: 'tcm' as Tab, l: '🌿 中医辨证', d: '四圣心源·舌诊' },
        ].map(t => (
          <button key={t.k} onClick={() => { setTab(t.k); setAnswer(''); setQuestion(''); }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.k ? 'bg-gradient-to-r from-[var(--text-accent)] to-emerald-500 text-white shadow-md'
              : 'bg-[var(--bg-highlight)] text-[var(--text-secondary)] border border-[var(--border-color)]'
            }`}>
            <div>{t.l}</div>
            <div className="text-[10px] opacity-60">{t.d}</div>
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* ── 寂如师 ── */}
        {tab === 'jiru' && (
          <div className="space-y-6">
            <QABox title="向寂如师父开示提问"
              desc="基于寂如师父真实开示的AI问答。输入修行或生活中的困惑。"
              placeholder="例如：如何面对内心的恐惧？什么是真正的放下？"
              question={question} setQuestion={setQuestion}
              loading={loading} answer={answer}
              onAsk={() => ask('/api/dharma-qa')} />
            <InfoBox>
              <p>寂如师父开示内容库：约 630 万字，含 500+ 场腾讯会议录播转写。</p>
              <p className="mt-1">数据来源：寂如师菠萝讲堂 2022-2025 年开示录音转写。</p>
            </InfoBox>
          </div>
        )}

        {/* ── 金刚老师 ── */}
        {tab === 'jingang' && (
          <div className="space-y-6">
            <QABox title="向金刚老师讲记提问"
              desc="基于金刚老师内容银行 326 个主题的AI问答。第一人称「金刚式」解读。"
              placeholder="例如：什么是君子？如何破解内卷？圆觉经讲什么？"
              question={question} setQuestion={setQuestion}
              loading={loading} answer={answer}
              onAsk={() => ask('/api/jingang-qa')} />
            <div className="grid grid-cols-2 gap-2">
              {[
                { t: '论语解毒', n: '001-050' }, { t: '论语解毒', n: '051-100' },
                { t: '论语解毒', n: '101-150' }, { t: '论语解毒', n: '151-200' },
                { t: '论语解毒', n: '201-250' }, { t: '论语解毒', n: '251-300' },
                { t: '论语解毒', n: '301-376' }, { t: '问答版', n: '301-355' },
                { t: '道德经俯览', n: '中·下' },
              ].map(i => (
                <div key={i.t+i.n} className="p-2.5 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] text-xs">
                  <span className="font-medium">{i.t}</span>
                  <span className="text-[var(--text-tertiary)] ml-1">#{i.n}</span>
                </div>
              ))}
            </div>
            <InfoBox>
              <p>金刚老师内容银行：326 个主题，约 13.5 万字，已接入 RAG 智能问答。</p>
              <p className="mt-1">基于《论语解毒》核心课程，每主题含【社会现状】→【金刚解读】。</p>
              <p className="mt-1">完整讲记含圆觉经、金刚辨经、解疑答惑等 389 个文件（2.0GB）。</p>
            </InfoBox>
          </div>
        )}

        {/* ── 中医辨证 ── */}
        {tab === 'tcm' && (
          <div className="space-y-6">
            {/* 辨证诊断 */}
            <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <h2 className="text-lg font-bold mb-2">🩺 AI辨证诊断</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                基于《四圣心源》一气周流理论和《圆运动的古中医学》，输入症状进行中医辨证。
              </p>
              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                placeholder="例如：口干但不欲饮、入睡困难、手脚冰凉、大便不成形、舌边有齿痕……"
                rows={3}
                className="w-full input-jade text-sm p-3 rounded-xl resize-none mb-3" />
              <button onClick={diagnose} disabled={tcmLoading || !symptoms.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--text-accent)] to-emerald-500 text-white font-medium text-sm hover:shadow-lg transition-all disabled:opacity-40">
                {tcmLoading ? '⏳ 辨证中...' : '开始辨证'}
              </button>
              {tcmAnswer && (
                <div className="mt-4 p-4 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-color)]">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: tcmAnswer.replace(/\n/g, '<br/>') }} />
                </div>
              )}
            </div>

            {/* 经典文库 */}
            <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <h2 className="text-lg font-bold mb-2">📚 经典文库</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { t: '🔬 舌诊速查', u: '/tcm/tcm-data/06-跨病证索引/07-舌诊速查.html' },
                  { t: '📖 四圣心源（黄元御）', u: '/tcm/tcm-data/04-明清/02-四圣心源（黄元御）.html' },
                  { t: '🔄 圆运动的古中医学', u: '/tcm/tcm-data/05-近现代/01-圆运动的古中医学（彭子益-李可）.html' },
                  { t: '🔢 河图洛书与中医', u: '/tcm/tcm-data/09-医易同源/02-河图洛书与中医.html' },
                  { t: '⛩️ 八宫筮法与中医', u: '/tcm/tcm-data/09-医易同源/08-京氏易八宫/02-八宫筮法与中医诊断.html' },
                  { t: '👨‍⚕️ 李可老中医', u: '/tcm/tcm-data/05-近现代/02-李可老中医.html' },
                  { t: '📋 索引总纲', u: '/tcm/tcm-data/00-索引总纲.html' },
                  { t: '🍵 食疗养生', u: '/tcm/tcm-data/07-食疗养生/' },
                ].map(item => (
                  <a key={item.u} href={item.u} target="_blank"
                    className="p-3 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] hover:border-[var(--text-accent)]/30 transition-all text-sm">
                    {item.t}
                  </a>
                ))}
              </div>
            </div>

            <InfoBox>
              <p>中医版块基于《四圣心源》（黄元御）一气周流理论，结合《圆运动的古中医学》（彭子益）。</p>
              <p className="mt-1">AI辨证以"中气为轴，四维为轮"为核心框架，区分上热下寒与实热，齿痕舌辨识脾虚湿盛。</p>
              <p className="mt-1">经典文库含 15 个分类、50+ 篇结构化文章。</p>
            </InfoBox>
          </div>
        )}
      </div>

      <footer className="border-t border-[var(--border-color)] py-8 px-6 text-center text-sm text-[var(--text-secondary)]">
        <Link href="/" className="hover:text-[var(--text-accent)] transition-colors">← 返回首页</Link>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function QABox({ title, desc, placeholder, question, setQuestion, loading, answer, onAsk }: {
  title: string; desc: string; placeholder: string;
  question: string; setQuestion: (s: string) => void;
  loading: boolean; answer: string; onAsk: () => void;
}) {
  return (
    <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">{desc}</p>
      <div className="flex gap-2">
        <input value={question} onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onAsk()}
          placeholder={placeholder}
          className="flex-1 input-jade text-sm py-2.5 px-4 rounded-xl" />
        <button onClick={onAsk} disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--text-accent)] to-emerald-500 text-white font-medium text-sm hover:shadow-lg transition-all disabled:opacity-40">
          {loading ? '⏳' : '提问'}
        </button>
      </div>
      {answer && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--bg-highlight)] border border-[var(--border-color)]">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--bg-highlight)]/50 border border-[var(--border-color)] text-xs text-[var(--text-tertiary)]">
      {children}
    </div>
  );
}
