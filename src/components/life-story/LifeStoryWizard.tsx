'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthContext';
import {
  createEmptyLifeStory,
  LIFE_SCRIPT_RESULT_KEY,
  LIFE_STORY_DRAFT_KEY,
  LIFE_STORY_THEMES,
  type LifeScriptSummary,
  type LifeStoryEvent,
  type LifeStoryProfile,
  validateLifeStory,
} from '@/lib/life-story';
import './life-story.css';

const STEPS = [
  { label: '我的起点', note: '从哪里来' },
  { label: '我的路', note: '走过什么' },
  { label: '我的门槛', note: '怎样选择' },
  { label: '我的此刻', note: '现在要什么' },
] as const;

const THEME_LABELS: Record<(typeof LIFE_STORY_THEMES)[number], string> = {
  family: '家庭',
  education: '求学',
  career: '工作 / 事业',
  relationship: '关系',
  health: '健康与节奏',
  finance: '财务',
  move: '迁移',
  other: '其他',
};

const inputClass = 'life-story-input';
const textAreaClass = 'life-story-input life-story-input--area';

function updateObjectSection<K extends 'origin' | 'lifePath' | 'present'>(
  setStory: React.Dispatch<React.SetStateAction<LifeStoryProfile>>,
  section: K,
  key: string,
  value: string,
) {
  setStory((current) => ({
    ...current,
    [section]: { ...current[section], [key]: value },
  }));
}

function Field({
  label,
  hint,
  value,
  onChange,
  multiline = true,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="life-story-field">
      <span className="life-story-label">{label}</span>
      {hint && <span className="life-story-hint">{hint}</span>}
      {multiline ? (
        <textarea className={textAreaClass} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      ) : (
        <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

export default function LifeStoryWizard() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [story, setStory] = useState<LifeStoryProfile>(() => createEmptyLifeStory());
  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState<LifeScriptSummary | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIFE_STORY_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LifeStoryProfile;
        if (parsed?.version === 1 && Array.isArray(parsed.events)) {
          // This effect hydrates state from the browser-only draft store after SSR.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setStory({ ...createEmptyLifeStory(), ...parsed, consent: { ...createEmptyLifeStory().consent, ...parsed.consent } });
          setNotice('已恢复上次保存在本机的草稿。');
        }
      }
    } catch {
      setNotice('本机草稿读取失败，你仍可以继续填写。');
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(LIFE_STORY_DRAFT_KEY, JSON.stringify(story));
    } catch {
      // Do not echo the draft or interrupt the writing flow when storage is full.
    }
  }, [story]);

  const progress = useMemo(() => `${Math.min(step + 1, STEPS.length)} / ${STEPS.length}`, [step]);

  const updateSection = (section: 'origin' | 'lifePath' | 'present', key: string, value: string) => {
    updateObjectSection(setStory, section, key, value);
    setErrors([]);
  };

  const addEvent = () => {
    if (story.events.length >= 8) return;
    setStory((current) => ({
      ...current,
      events: [
        ...current.events,
        {
          id: `event-${Date.now()}`,
          theme: 'other',
          title: '',
          whatHappened: '',
          choiceMade: '',
          meaningNow: '',
        },
      ],
    }));
    setErrors([]);
  };

  const updateEvent = (id: string, patch: Partial<LifeStoryEvent>) => {
    setStory((current) => ({
      ...current,
      events: current.events.map((event) => (event.id === id ? { ...event, ...patch } : event)),
    }));
    setErrors([]);
  };

  const removeEvent = (id: string) => {
    setStory((current) => ({ ...current, events: current.events.filter((event) => event.id !== id) }));
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(LIFE_STORY_DRAFT_KEY);
    } catch {
      // 页面状态仍然可以清空。
    }
    setStory(createEmptyLifeStory());
    setSummary(null);
    setStep(0);
    setErrors([]);
    setNotice('已删除本机草稿。');
  };

  const saveBeforeLogin = () => {
    try {
      localStorage.setItem(LIFE_STORY_DRAFT_KEY, JSON.stringify(story));
      sessionStorage.setItem('life_story_return_step', String(step));
    } catch {
      // 登录仍可继续，页面重新打开时不会带入未保存内容。
    }
    router.push('/auth/login?next=%2Flife-story');
  };

  const birthProfileFromLastReport = () => {
    try {
      const raw = localStorage.getItem('last_master_report');
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.data ?? null;
    } catch {
      return null;
    }
  };

  const requestSummary = async () => {
    setErrors([]);
    const validation = validateLifeStory(story);
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }
    if (!isLoggedIn) {
      saveBeforeLogin();
      return;
    }

    setBusy(true);
    setNotice('正在把你的经历整理成一面可校正的镜子……');
    try {
      const response = await fetch('/api/life-script/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lifeStory: validation.value, birthProfile: birthProfileFromLastReport() }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        setErrors(body.errors || ['总结暂时无法生成，请检查填写内容。']);
        return;
      }
      setSummary(body.summary);
      setStep(4);
      setNotice('这是可修改的工作稿。请先确认它是否准确，再进入双路径模拟。');
    } catch {
      setErrors(['网络暂时不可用，请稍后重试。']);
    } finally {
      setBusy(false);
    }
  };

  const updateSummaryArray = (key: keyof Pick<LifeScriptSummary, 'strengths' | 'patterns' | 'tensions' | 'openQuestions'>, value: string) => {
    setSummary((current) => (current ? { ...current, [key]: value.split('\n').map((line) => line.trim()).filter(Boolean) } : current));
  };

  const requestScript = async () => {
    if (!summary) return;
    setBusy(true);
    setErrors([]);
    setNotice('正在生成两条可能路径，并整理 7 天行动卡……');
    try {
      const response = await fetch('/api/life-script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lifeStory: story,
          birthProfile: birthProfileFromLastReport(),
          confirmedSummary: summary,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        setErrors([body.error || '剧本暂时无法生成，请稍后重试。']);
        return;
      }
      try {
        sessionStorage.setItem(LIFE_SCRIPT_RESULT_KEY, JSON.stringify(body.result));
      } catch {
        setErrors(['结果暂时无法保存在本机，请清理浏览器空间后重试。']);
        return;
      }
      router.push('/life-story/result');
    } catch {
      setErrors(['网络暂时不可用，请稍后重试。']);
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (step === 2 && story.events.length === 0) {
      setErrors(['请至少添加一个关键事件，再继续。']);
      return;
    }
    setErrors([]);
    setStep((current) => Math.min(current + 1, 3));
  };

  const back = () => {
    setErrors([]);
    setStep((current) => Math.max(current - 1, 0));
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="life-story-grid">
          <Field label="成长家庭" hint="你愿意怎样描述家里的气氛、角色和相处方式？" value={story.origin.family} onChange={(value) => updateSection('origin', 'family', value)} placeholder="例如：家里重视稳定，我较早学会照顾别人的感受。" />
          <Field label="成长环境" hint="城市、乡村、文化或时代背景，哪些塑造了你？" value={story.origin.environment} onChange={(value) => updateSection('origin', 'environment', value)} />
          <Field label="家庭资源" hint="包括支持、教育、关系、经济或你后来建立的资源。" value={story.origin.resources || ''} onChange={(value) => updateSection('origin', 'resources', value)} />
          <Field label="重要迁移" hint="搬家、出国、换城市或进入新圈子，都可以写。" value={story.origin.migrations || ''} onChange={(value) => updateSection('origin', 'migrations', value)} />
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="life-story-grid">
          <Field label="求学经历" hint="哪些选择、老师或阶段改变了你？" value={story.lifePath.education || ''} onChange={(value) => updateSection('lifePath', 'education', value)} />
          <Field label="工作 / 事业" hint="你走过哪些道路？现在还认同它们吗？" value={story.lifePath.career || ''} onChange={(value) => updateSection('lifePath', 'career', value)} />
          <Field label="关系与家庭" hint="重要关系、婚姻、朋友或家庭角色怎样影响你？" value={story.lifePath.relationships || ''} onChange={(value) => updateSection('lifePath', 'relationships', value)} />
          <Field label="健康与生活节奏" hint="只写你主动愿意分享的生活观察，不需要诊断或隐私细节。" value={story.lifePath.health || ''} onChange={(value) => updateSection('lifePath', 'health', value)} />
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="life-story-events">
          {story.events.length === 0 && <div className="life-story-empty">还没有事件。先添加一件你现在回看仍有意义的事。</div>}
          {story.events.map((event, index) => (
            <article className="life-story-event" key={event.id}>
              <div className="life-story-event-heading">
                <span>门槛 {String(index + 1).padStart(2, '0')}</span>
                <button type="button" className="life-story-text-button" onClick={() => removeEvent(event.id)}>移除</button>
              </div>
              <div className="life-story-event-meta">
                <label className="life-story-field"><span className="life-story-label">主题</span><select className={inputClass} value={event.theme} onChange={(e) => updateEvent(event.id, { theme: e.target.value as LifeStoryEvent['theme'] })}>{LIFE_STORY_THEMES.map((theme) => <option key={theme} value={theme}>{THEME_LABELS[theme]}</option>)}</select></label>
                <label className="life-story-field"><span className="life-story-label">年份（可选）</span><input className={inputClass} type="number" min="1900" max={new Date().getFullYear() + 1} value={event.year || ''} onChange={(e) => updateEvent(event.id, { year: e.target.value ? Number(e.target.value) : undefined })} /></label>
              </div>
              <Field label="这件事是什么？" value={event.title} onChange={(value) => updateEvent(event.id, { title: value })} multiline={false} placeholder="例如：一次换城市、失去、转行或重新开始" />
              <Field label="发生了什么？" value={event.whatHappened} onChange={(value) => updateEvent(event.id, { whatHappened: value })} />
              <Field label="当时你做了什么选择？" value={event.choiceMade || ''} onChange={(value) => updateEvent(event.id, { choiceMade: value })} />
              <Field label="现在回看，它意味着什么？" value={event.meaningNow || ''} onChange={(value) => updateEvent(event.id, { meaningNow: value })} />
            </article>
          ))}
          <button type="button" className="life-story-secondary-button" onClick={addEvent} disabled={story.events.length >= 8}>＋ 添加关键事件（最多 8 件）</button>
        </div>
      );
    }

    return (
      <div className="life-story-grid">
        <Field label="我此刻的状态" hint="这是生成总结的必填项：你现在身处怎样的阶段？" value={story.present.status} onChange={(value) => updateSection('present', 'status', value)} placeholder="例如：我正在重新安排工作与家庭的节奏。" />
        <Field label="未解决的问题" value={story.present.unresolved || ''} onChange={(value) => updateSection('present', 'unresolved', value)} />
        <Field label="我想保留的东西" value={story.present.preserve || ''} onChange={(value) => updateSection('present', 'preserve', value)} />
        <Field label="我想改变的东西" value={story.present.change || ''} onChange={(value) => updateSection('present', 'change', value)} />
        <Field label="未来三年愿望" value={story.present.hopes || ''} onChange={(value) => updateSection('present', 'hopes', value)} />
        <label className="life-story-consent"><input type="checkbox" checked={story.consent.reflectiveSimulation} onChange={(event) => setStory((current) => ({ ...current, consent: { reflectiveSimulation: event.target.checked, confirmedAt: event.target.checked ? new Date().toISOString() : '' } }))} /><span>我理解这是一份反思性模拟，不是命运判决；我会把它当作自我观察与行动讨论的材料。</span></label>
      </div>
    );
  };

  return (
    <main className="life-story-shell">
      <div className="life-story-orbit" aria-hidden="true" />
      <header className="life-story-header">
        <a className="life-story-back" href="/master-report">← 回到出生画像</a>
        <div className="life-story-eyebrow">SOULCODE · LIFE STORY LAB</div>
        <h1>把报告放回真实人生</h1>
        <p>出生画像只是起点。你亲自走过的路、做过的选择和此刻想改变的方向，才是剧本真正可以被校正的部分。</p>
        <div className="life-story-value-strip" aria-label="开始前说明">
          <div><strong>8–12 分钟</strong><span>四段填写，可随时暂停</span></div>
          <div><strong>双路径</strong><span>得到一份总结与两条可讨论的可能性</span></div>
          <div><strong>反思实验</strong><span>草稿只保存在当前浏览器</span></div>
        </div>
      </header>

      <section className="life-story-panel" aria-label="人生总结向导">
        <div className="life-story-progress-row"><span>人生总结向导</span><span>{progress}</span></div>
        <div className="life-story-progress" aria-label={`当前步骤 ${progress}`}>{STEPS.map((item, index) => <div className={`life-story-progress-item ${index === step ? 'is-active' : ''} ${index < step ? 'is-done' : ''}`} key={item.label}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.label}</strong><small>{item.note}</small></div>)}</div>

        {step < 4 ? (
          <>
            <div className="life-story-step-heading"><span className="life-story-step-index">0{step + 1}</span><div><h2>{STEPS[step].label}</h2><p>{step === 0 ? '不需要写得完整，先从你愿意说的部分开始。' : step === 1 ? '这些不是简历，而是你如何成为现在这个人的线索。' : step === 2 ? '门槛不等于失败，它们是看见应对模式的入口。' : '把模糊的感受说出来，才有机会变成可行动的选择。'}</p></div></div>
            {renderStep()}
            {errors.length > 0 && <div className="life-story-errors" role="alert">{errors.map((error) => <div key={error}>· {error}</div>)}</div>}
            {notice && <div className="life-story-notice" aria-live="polite">{notice}</div>}
            <div className="life-story-actions"><button type="button" className="life-story-secondary-button" onClick={clearDraft}>删除本地草稿</button><div className="life-story-action-group">{step > 0 && <button type="button" className="life-story-secondary-button" onClick={back}>上一步</button>}{step < 3 ? <button type="button" className="life-story-primary-button" onClick={next}>继续 →</button> : <button type="button" className="life-story-primary-button" onClick={requestSummary} disabled={busy}>{busy ? '整理中…' : '生成我的人生总结 →'}</button>}</div></div>
          </>
        ) : (
          <div className="life-story-confirmation">
            <div className="life-story-step-heading"><span className="life-story-step-index">05</span><div><h2>先校正，再进入人生模拟</h2><p>以下内容是根据你填写的经历整理出的工作稿。任何一句不准确，都可以直接改掉。</p></div></div>
            {summary && <div className="life-story-summary-editor"><Field label="一句话总览" value={summary.headline} onChange={(value) => setSummary({ ...summary, headline: value })} multiline={false} />{(['strengths', 'patterns', 'tensions', 'openQuestions'] as const).map((key) => <Field key={key} label={{ strengths: '你已经拥有的力量', patterns: '可能重复的应对模式', tensions: '此刻的拉扯', openQuestions: '值得继续追问的问题' }[key]} hint="每行一条，可直接修改" value={summary[key].join('\n')} onChange={(value) => updateSummaryArray(key, value)} />)}</div>}
            <div className="life-story-source-note"><strong>来源边界</strong><span>用户经历 · 当前选择 · 可选出生画像 · AI 推演</span><p>“不改变路径”和“主动改变路径”都是可讨论的可能性，不是对你的定论。</p></div>
            {errors.length > 0 && <div className="life-story-errors" role="alert">{errors.map((error) => <div key={error}>· {error}</div>)}</div>}
            {notice && <div className="life-story-notice" aria-live="polite">{notice}</div>}
            <div className="life-story-actions"><button type="button" className="life-story-secondary-button" onClick={() => setStep(3)}>← 修改原始经历</button><button type="button" className="life-story-primary-button" onClick={requestScript} disabled={busy}>{busy ? '生成中…' : '确认并进入双路径模拟 →'}</button></div>
          </div>
        )}
      </section>
      <p className="life-story-footnote">你的草稿只保存在当前浏览器；删除草稿即可移除本机副本。健康、法律、投资和关系重大决定，请咨询相应专业人士。</p>
    </main>
  );
}
