'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/components/AuthContext';
import {
  buildChallengeSummary,
  createEmptyChallengeProgress,
  LIFE_CHALLENGE_PROGRESS_KEY,
  recordChallengeResponse,
  TEN_CHALLENGES,
  type ChallengeProgress,
} from '@/lib/life-challenges';
import './life-story.css';

export default function TenChallenges() {
  const { isLoggedIn } = useAuth();
  const [progress, setProgress] = useState<ChallengeProgress>(() => createEmptyChallengeProgress());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choiceId, setChoiceId] = useState('');
  const [reflection, setReflection] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState('');
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIFE_CHALLENGE_PROGRESS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChallengeProgress;
        if (parsed?.version === 1 && parsed.responses) {
          // Hydrate browser-only progress after the initial SSR render.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setProgress({ ...createEmptyChallengeProgress(), ...parsed });
        }
      }
    } catch {
      setError('本机进度读取失败，你仍然可以重新开始。');
    } finally {
      hydrated.current = true;
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(LIFE_CHALLENGE_PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // 不把用户的反思内容写入日志，也不打断当前体验。
    }
  }, [progress]);

  const challenge = TEN_CHALLENGES[currentIndex];
  const completedCount = Object.keys(progress.responses).length;
  const existing = challenge ? progress.responses[challenge.id] : undefined;
  const summary = useMemo(() => buildChallengeSummary(progress), [progress]);

  useEffect(() => {
    if (!challenge) return;
    // Synchronize the editable controls with the selected challenge's saved response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoiceId(existing?.choiceId || '');
    setReflection(existing?.reflection || '');
    setError('');
  }, [currentIndex, challenge, existing?.choiceId, existing?.reflection]);

  const saveCurrent = () => {
    if (!challenge || !choiceId) {
      setError('先选择一个回应，再进入下一关。');
      return false;
    }
    const recorded = recordChallengeResponse(progress, {
      challengeId: challenge.id,
      choiceId,
      reflection,
      completedAt: new Date().toISOString(),
    });
    if (!recorded.ok) {
      setError(recorded.errors[0]);
      return false;
    }
    setProgress(recorded.value);
    return true;
  };

  const next = () => {
    if (!saveCurrent()) return;
    if (currentIndex === TEN_CHALLENGES.length - 1) {
      setFinished(true);
      return;
    }
    setCurrentIndex((index) => index + 1);
  };

  const previous = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((index) => index - 1);
  };

  const restart = () => {
    if (!window.confirm('确定要清除十重考验的本机进度吗？')) return;
    try { localStorage.removeItem(LIFE_CHALLENGE_PROGRESS_KEY); } catch {}
    setProgress(createEmptyChallengeProgress());
    setCurrentIndex(0);
    setFinished(false);
    setChoiceId('');
    setReflection('');
    setError('本机进度已清除。');
  };

  if (!loaded) return <main className="life-story-shell"><div className="life-story-result-loading">正在打开十重考验……</div></main>;

  if (finished) {
    return (
      <main className="life-story-shell">
        <div className="life-story-orbit" aria-hidden="true" />
        <section className="life-story-panel life-challenge-finish">
          <a className="life-story-back" href="/life-story/result">← 回到双路径人生模拟</a>
          <div className="life-story-eyebrow">SOULCODE · TEN REFLECTIVE CHALLENGES</div>
          <h1>你完成了十重考验</h1>
          <p className="life-challenge-lead">不是闯过十道关，而是看见自己在十个瞬间如何回应。真正的改变从回到日常之后开始。</p>
          <div className="life-script-result-kicker">你的回应倾向</div>
          <div className="life-script-summary-grid"><div><h3>可以观察到的模式</h3><ul className="life-script-list">{summary.patterns.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>接下来 7 天</h3><ul className="life-script-list">{summary.nextActions.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
          <div className="life-script-disclaimer"><strong>使用边界</strong><p>反思性游戏，不是命运判决，也不是对人格、健康或未来的诊断。</p><p>如果体验引发强烈不适，请先暂停体验，与可信任的人或专业人士沟通。</p></div>
          {error && <div className="life-story-notice">{error}</div>}
          <div className="life-story-actions"><a className="life-story-secondary-button" href="/life-story">重新做人生总结</a><button type="button" className="life-story-secondary-button" onClick={restart}>清除并重新开始</button></div>
        </section>
      </main>
    );
  }

  return (
    <main className="life-story-shell">
      <div className="life-story-orbit" aria-hidden="true" />
      <header className="life-story-header">
        <a className="life-story-back" href="/life-story/result">← 回到双路径人生模拟</a>
        <div className="life-story-eyebrow">SOULCODE · TEN REFLECTIVE CHALLENGES</div>
        <h1>十重考验</h1>
        <p>这是受到吕洞宾故事启发的现代反思游戏。每一关只有一个选择场景，可以随时暂停；它不是对历史故事的复原，也不是命运判决。</p>
      </header>
      <section className="life-story-panel life-challenge-panel">
        <div className="life-story-progress-row"><span>十重考验 · {completedCount} / 10</span><span>{isLoggedIn ? '已登录 · 本机自动保存' : '本机自动保存'}</span></div>
        <div className="life-challenge-progress-bar"><span style={{ width: `${(completedCount / TEN_CHALLENGES.length) * 100}%` }} /></div>
        <div className="life-challenge-stage"><span>第 {currentIndex + 1} 关 · {challenge.axis}</span><span>可暂停</span></div>
        <h2>{challenge.title}</h2>
        <p className="life-challenge-scenario">{challenge.scenario}</p>
        <div className="life-challenge-question">{challenge.question}</div>
        <div className="life-challenge-choice-list">{challenge.choices.map((choice) => <button type="button" className={`life-challenge-choice ${choiceId === choice.id ? 'is-selected' : ''}`} key={choice.id} onClick={() => { setChoiceId(choice.id); setError(''); }}><span className="life-challenge-choice-mark">{choiceId === choice.id ? '✓' : '○'}</span><span>{choice.label}</span></button>)}</div>
        <label className="life-story-field life-challenge-reflection"><span className="life-story-label">如果愿意，写下你为什么这样选</span><span className="life-story-hint">可留空。不是作文，只给未来的自己留一句线索。</span><textarea className="life-story-input life-story-input--area" maxLength={800} value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="我注意到自己的第一反应是……" /></label>
        {error && <div className="life-story-errors" role="alert">· {error}</div>}
        <div className="life-story-actions"><button type="button" className="life-story-secondary-button" onClick={previous} disabled={currentIndex === 0}>← 上一关</button><div className="life-story-action-group"><button type="button" className="life-story-secondary-button" onClick={() => setError('已暂停。你的进度会保存在当前浏览器。')}>暂停体验</button><button type="button" className="life-story-primary-button" onClick={next}>{currentIndex === TEN_CHALLENGES.length - 1 ? '完成十重考验' : '下一关 →'}</button></div></div>
      </section>
      <p className="life-story-footnote">进度只保存在当前浏览器。若内容触发强烈不适，请暂停体验，不要把它当作医疗、法律、投资或关系决定的唯一依据。</p>
    </main>
  );
}
