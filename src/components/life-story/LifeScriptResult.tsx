'use client';

import { useEffect, useState } from 'react';

import {
  LIFE_SCRIPT_RESULT_KEY,
  type LifeScriptResult as LifeScriptResultData,
} from '@/lib/life-story';
import { buildLifeStoryCompanionInviteText, buildSafeLifeStoryShareText } from '@/lib/life-story-growth';
import './life-story.css';

const SOURCE_LABELS: Record<string, string> = {
  birthProfile: '出生画像',
  lifeStory: '用户经历',
  currentChoice: '当前选择',
  inference: 'AI 推演',
};

function isStoredResult(value: unknown): value is LifeScriptResultData {
  if (!value || typeof value !== 'object') return false;
  const result = value as Record<string, unknown>;
  const summary = result.summary as Record<string, unknown> | undefined;
  const paths = result.paths;
  return Boolean(
    summary && typeof summary.headline === 'string' &&
    Array.isArray(summary.strengths) && Array.isArray(summary.patterns) &&
    Array.isArray(summary.tensions) && Array.isArray(summary.openQuestions) &&
    Array.isArray(paths) && paths.length === 2 &&
    paths.every((path) => path && typeof path === 'object' && ((path as Record<string, unknown>).type === 'continuity' || (path as Record<string, unknown>).type === 'change')) &&
    typeof result.disclaimer === 'string',
  );
}

function List({ items }: { items: string[] }) {
  return <ul className="life-script-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default function LifeScriptResult() {
  const [result, setResult] = useState<LifeScriptResultData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [shareNotice, setShareNotice] = useState('');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LIFE_SCRIPT_RESULT_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      // This effect hydrates a short-lived browser session payload after SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isStoredResult(parsed)) setResult(parsed);
    } catch {
      setResult(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return <main className="life-story-shell"><div className="life-story-result-loading">正在打开你的路径地图……</div></main>;
  }

  if (!result) {
    return (
      <main className="life-story-shell">
        <section className="life-story-missing">
          <span className="life-story-eyebrow">SOULCODE · LIFE STORY LAB</span>
          <h1>这张地图已经离开本机</h1>
          <p>结果只在当前浏览器短暂保存，可能是会话过期或你清理了浏览器数据。你可以重新填写人生总结。</p>
          <a className="life-story-primary-button" href="/life-story">重新填写人生总结</a>
        </section>
      </main>
    );
  }

  const continuity = result.paths.find((path) => path.type === 'continuity');
  const change = result.paths.find((path) => path.type === 'change');

  const shareResult = async () => {
    const shareText = buildSafeLifeStoryShareText(result, `${window.location.origin}/life-story`);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'SoulCode · 人生路径练习卡', text: shareText });
        setShareNotice('已打开系统分享。');
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareNotice('复制成功，可以发给你信任的人。');
        return;
      }
      throw new Error('share-unavailable');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setShareNotice('已取消分享。');
        return;
      }
      setShareNotice('当前浏览器暂不支持分享，请继续在本页完成行动。');
    }
  };

  const shareCompanionInvite = async () => {
    const inviteText = buildLifeStoryCompanionInviteText(`${window.location.origin}/life-story`);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'SoulCode · 朋友同行人生总结', text: inviteText });
        setShareNotice('已打开朋友同行邀请。');
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteText);
        setShareNotice('朋友同行邀请已复制，可以发给你信任的人。');
        return;
      }
      throw new Error('share-unavailable');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setShareNotice('已取消分享。');
        return;
      }
      setShareNotice('当前浏览器暂不支持分享，请复制浏览器地址后邀请朋友。');
    }
  };

  return (
    <main className="life-story-shell">
      <div className="life-story-orbit" aria-hidden="true" />
      <header className="life-story-header">
        <a className="life-story-back" href="/life-story">← 回到人生总结</a>
        <div className="life-story-eyebrow">SOULCODE · LIFE STORY LAB</div>
        <h1>你的双路径人生模拟</h1>
        <p>这不是替你决定未来，而是把“继续沿用旧模式”和“主动做出小改变”放在同一张桌上，方便你看见取舍。</p>
      </header>

      <section className="life-story-panel life-script-result-panel">
        <div className="life-script-result-kicker">01 · 你的当前画像</div>
        <h2 className="life-script-headline">{result.summary.headline}</h2>
        <div className="life-script-summary-grid">
          <div><h3>你已经拥有的力量</h3><List items={result.summary.strengths} /></div>
          <div><h3>可能重复的应对模式</h3><List items={result.summary.patterns} /></div>
          <div><h3>此刻的拉扯</h3><List items={result.summary.tensions} /></div>
          <div><h3>值得继续追问</h3><List items={result.summary.openQuestions} /></div>
        </div>

        <div className="life-script-divider" />
        <div className="life-script-result-kicker">02 · 两种可能路径</div>
        <div className="life-script-path-grid">
          {[continuity, change].filter(Boolean).map((path) => (
            <article className={`life-script-path life-script-path--${path!.type}`} key={path!.type}>
              <div className="life-script-path-label">{path!.type === 'continuity' ? '不改变路径' : '主动改变路径'}</div>
              <h2>{path!.title}</h2>
              <p className="life-script-premise">{path!.premise}</p>
              <div className="life-script-column"><h3>可以观察的信号</h3><List items={path!.signals} /></div>
              <div className="life-script-column"><h3>需要留意的风险</h3><List items={path!.risks} /></div>
              <div className="life-script-column"><h3>可以打开的机会</h3><List items={path!.opportunities} /></div>
              <div className="life-script-actions-card"><h3>7 天行动</h3><List items={path!.actions} /></div>
            </article>
          ))}
        </div>

         <div className="life-script-source-row"><strong>来源标签</strong>{result.sourceLabels.map((label) => <span key={label}>{SOURCE_LABELS[label] || label}</span>)}</div>
         <div className="life-script-disclaimer"><strong>请这样使用它</strong><p>不是命运判决。{result.disclaimer}</p><p>把它当作一份可被现实修正的观察稿：先选一个小行动，七天后用真实反馈更新你的判断。</p></div>
         <div className="life-script-next-step">
           <div><h3>把行动带回现实</h3><p>先挑一个你愿意承担的 7 天行动；如果这张地图对你有帮助，可以分享一张不包含私密经历的摘要。</p></div>
           <div className="life-script-next-step-actions"><button type="button" className="life-story-secondary-button" onClick={shareResult}>分享一张安全摘要</button><button type="button" className="life-story-secondary-button" onClick={shareCompanionInvite}>邀请朋友一起完成</button><a className="life-story-primary-button" href="/life-story/challenges">进入十重考验 →</a></div>
           <a className="life-story-companion-link" href="/life-story?mode=companion">先独立体验朋友同行模式 →</a>
           {shareNotice && <p className="life-story-notice" aria-live="polite">{shareNotice}</p>}
         </div>
         <div className="life-story-actions"><a className="life-story-secondary-button" href="/master-report">回看出生画像</a><a className="life-story-secondary-button" href="/life-story">再做一次人生总结</a></div>
       </section>
      <p className="life-story-footnote">如果内容触发了强烈不适，请先暂停体验，和可信任的人或专业人士沟通。重大健康、法律、投资和关系决定不应只依据本模拟。</p>
    </main>
  );
}
