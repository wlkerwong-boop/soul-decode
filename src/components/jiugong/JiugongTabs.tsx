'use client';

import { useMemo, useReducer, useRef, useEffect } from 'react';
import type { JiugongFull } from '../../server/jiugong-v6';
import {
  buildJiugongAdvice,
  type AdviceTopic,
} from '../../lib/jiugong-advice';
import {
  selectYearEnvironment,
  type YearEnvironment,
} from '../../lib/jiugong-environment';
import { buildRelationshipDetails } from '../../lib/jiugong-relationships';
import {
  createJiugongViewState,
  reduceJiugongViewState,
  type JiugongTab,
} from './jiugong-view-state';

const TAB_OPTIONS: { key: JiugongTab; label: string; kicker: string }[] = [
  { key: 'traits', label: '特质分析', kicker: '看见底色' },
  { key: 'environment', label: '经营环境', kicker: '读懂时势' },
  { key: 'analysis', label: '经营分析', kicker: '落到行动' },
];

const TOPIC_OPTIONS: { key: AdviceTopic; label: string; icon: string }[] = [
  { key: 'career', label: '工作事业', icon: '业' },
  { key: 'wealth', label: '财运', icon: '财' },
  { key: 'love', label: '感情', icon: '情' },
  { key: 'house', label: '房子', icon: '居' },
  { key: 'health', label: '健康', icon: '养' },
];

function PanelTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 border-b border-[var(--border-color)]/70 pb-5">
      <p className="mb-2 text-[10px] font-semibold tracking-[0.28em] text-[var(--color-primary)]">
        {eyebrow}
      </p>
      <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)]/70 bg-[var(--bg-highlight)]/70 p-4">
      <p className="text-[10px] tracking-[0.16em] text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-1 font-serif text-lg font-semibold text-[var(--text-primary)]">{value}</p>
      {detail && <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{detail}</p>}
    </div>
  );
}

function TraitsPanel({ data }: { data: JiugongFull }) {
  return (
    <section>
      <PanelTitle
        eyebrow="01 · NATURE"
        title="先天结构，不是命运判词"
        description="从局、质、星运与五行关系中，看见你惯常如何思考、行动、经营资源。"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="局" value={`局差 ${data.ju}`} detail={data.juDesc} />
        <Metric label="质" value={`${data.zhi} · ${data.zhiName}`} detail={data.zhiDesc} />
        <Metric label="星运" value={data.xingyunName} detail={`${data.total} 画总格`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)]/80 p-5">
          <p className="text-xs font-semibold text-[var(--text-primary)]">格局详解</p>
          <p className="mt-3 whitespace-pre-line text-xs leading-6 text-[var(--text-secondary)]">
            {data.juFull}
          </p>
        </div>
        <div className="space-y-3">
          <Metric
            label="管理风格"
            value={`${data.mgtType} · ${data.mgtScore}`}
            detail={data.mgtDesc}
          />
          <Metric
            label="财富通路"
            value={data.wealthPalace}
            detail={`${data.wealthPath}；${data.wealthPalaceDesc}`}
          />
          <Metric label="关系底色" value={data.marriage} detail={data.marriageDesc} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric
          label="思想功能 · 天→人"
          value={data.thinkRel}
          detail={data.wxThinkFull || data.thinkDesc}
        />
        <Metric
          label="行动功能 · 人→地"
          value={data.actionRel}
          detail={data.wxActionFull || data.actionDesc}
        />
      </div>
    </section>
  );
}

function CollisionBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] ${
      active
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-700'
        : 'border-[var(--border-color)] text-[var(--text-tertiary)]'
    }`}>
      {active ? '碰撞期' : '平稳期'} · {label}
    </span>
  );
}

function EnvironmentPanel({
  data,
  environment,
  year,
  onYearChange,
  interactive = true,
}: {
  data: JiugongFull;
  environment: YearEnvironment;
  year: number;
  onYearChange: (year: number) => void;
  interactive?: boolean;
}) {
  const currentRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (interactive) currentRowRef.current?.scrollIntoView({ block: 'center' });
  }, [interactive, year]);

  const relationshipDetails = useMemo(
    () => buildRelationshipDetails(data, environment),
    [data, environment],
  );

  const relations = [
    ['上层', environment.upperQi, environment.upperEnergy, environment.strategies.upper],
    ['自我', environment.selfQi, environment.selfEnergy, environment.strategies.self],
    ['下层', environment.lowerQi, environment.lowerEnergy, environment.strategies.lower],
    ['对外', environment.outerQi, environment.outerEnergy, environment.strategies.outer],
  ];

  return (
    <section>
      <div className="flex flex-col gap-4 border-b border-[var(--border-color)]/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <PanelTitle
          eyebrow="02 · TIMING"
          title={`${year} 年 · 经营环境`}
          description="选择年份，查看线上 v6 返回的当年气场、岁值星、碰撞状态与九年运组。"
        />
        {interactive && (
          <label className="mb-6 shrink-0 text-xs text-[var(--text-secondary)]">
            <span className="mb-1.5 block">分析年份</span>
            <select
              aria-label="分析年份"
              value={year}
              onChange={(event) => onYearChange(Number(event.target.value))}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)]"
            >
              {data.years.map((item) => (
                <option key={item.year} value={item.year}>
                  {item.year} · 虚岁{item.age}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {relations.map(([label, qi, energy, strategy]) => (
          <Metric key={label} label={`${label}关系`} value={`${qi} · ${energy}`} detail={strategy} />
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/[0.06] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            {environment.ageStar}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            虚岁 {environment.age} · 【{environment.group.name}】
          </span>
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--text-primary)]">{environment.jiedu}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CollisionBadge active={environment.collisions.upper} label="上层" />
          <CollisionBadge active={environment.collisions.self} label="自我" />
          <CollisionBadge active={environment.collisions.lower} label="下层" />
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-4">
          <h3 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
            个人年度四层关系详解
          </h3>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-[var(--text-secondary)]">
            以下内容把当年气场与姓名形成的个人结构合并解释。四层分别回答：环境在说什么、为什么与你有关、优势和风险在哪里，以及今年具体怎么做。
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {relationshipDetails.map((detail) => (
            <article
              key={detail.key}
              className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)]/80 p-5"
            >
              <h4 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
                {detail.title}
              </h4>
              <p className="mt-2 text-xs leading-6 text-[var(--text-secondary)]">{detail.meaning}</p>

              <div className="mt-4 space-y-4 text-xs leading-6">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">为什么这样判断</p>
                  <p className="mt-1 text-[var(--text-secondary)]">{detail.annualContext}</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">与你的个人结构如何结合</p>
                  <p className="mt-1 text-[var(--text-secondary)]">{detail.personalFit}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-500/[0.07] p-3">
                    <p className="font-semibold text-emerald-800">有利表现</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-[var(--text-secondary)]">
                      {detail.strengths.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-amber-500/[0.08] p-3">
                    <p className="font-semibold text-amber-800">需要留意</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-[var(--text-secondary)]">
                      {detail.risks.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">行动建议</p>
                  <ol className="mt-1 list-decimal space-y-1 pl-4 text-[var(--text-secondary)]">
                    {detail.actions.map((item) => <li key={item}>{item}</li>)}
                  </ol>
                </div>
              </div>
              <p className="mt-4 border-t border-[var(--border-color)]/60 pt-3 text-[10px] text-[var(--text-tertiary)]">
                学理依据：{detail.sourceIds.join('、')}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-3 font-serif text-lg font-semibold text-[var(--text-primary)]">
          九十年运势卷轴
        </h3>
        <div
          data-jiugong-years
          className="max-h-[52vh] overflow-auto rounded-2xl border border-[var(--border-color)]"
        >
          <table className="min-w-[680px] text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[var(--bg-card)] text-[var(--text-tertiary)]">
              <tr>
                {['年龄', '年份', '气场', '能量', '卦象', '口诀', '解读'].map((heading) => (
                  <th key={heading} className="px-3 py-2.5 font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.years.map((item) => {
                const active = item.year === year;
                return (
                  <tr
                    key={item.year}
                    ref={active ? currentRowRef : undefined}
                    className={`border-t border-[var(--border-color)]/60 ${
                      active ? 'bg-[var(--color-primary)]/10' : 'hover:bg-[var(--bg-highlight)]'
                    }`}
                  >
                    <td className="px-3 py-2 font-semibold">{item.age}</td>
                    <td className="px-3 py-2">{item.year}</td>
                    <td className="px-3 py-2">{item.chance}</td>
                    <td className="px-3 py-2">{item.yun}</td>
                    <td className="px-3 py-2 font-semibold">{item.gua}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{item.koujue}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{item.jiedu}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function AnalysisPanel({
  data,
  environment,
  topic,
  onTopicChange,
  interactive = true,
}: {
  data: JiugongFull;
  environment: YearEnvironment;
  topic: AdviceTopic;
  onTopicChange: (topic: AdviceTopic) => void;
  interactive?: boolean;
}) {
  const advice = useMemo(
    () => buildJiugongAdvice(data, environment, topic),
    [data, environment, topic],
  );

  return (
    <section>
      <PanelTitle
        eyebrow="03 · ACTION"
        title="把趋势变成可执行的提醒"
        description={`当前建议以 ${environment.year} 年的线上 v6 气场、碰撞、岁值星和【${environment.group.name}】为依据。`}
      />
      {interactive && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label="事务问询">
          {TOPIC_OPTIONS.map((option) => {
            const active = option.key === topic;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                onClick={() => onTopicChange(option.key)}
                className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                  active
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg shadow-emerald-900/10'
                    : 'border-[var(--border-color)] bg-[var(--bg-highlight)] text-[var(--text-secondary)] hover:-translate-y-0.5'
                }`}
              >
                <span className="block font-serif text-lg">{option.icon}</span>
                <span className="mt-1 block text-xs font-semibold">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div
        data-testid="advice-answer"
        className="mt-4 rounded-[1.75rem] border border-[var(--color-primary)]/25 bg-gradient-to-br from-[var(--color-primary)]/[0.10] to-transparent p-5 sm:p-7"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-[0.12em] text-[var(--color-primary)]">
            {TOPIC_OPTIONS.find((item) => item.key === topic)?.label} · 年度建议
          </p>
          <span className="text-[10px] text-[var(--text-tertiary)]">确定性文案 · 不调用 AI</span>
        </div>
        <p className="mt-4 text-sm leading-8 text-[var(--text-primary)]">{advice.text}</p>
      </div>
    </section>
  );
}

export function JiugongTabs({ data }: { data: JiugongFull }) {
  const currentYear = new Date().getFullYear();
  const initialYear = data.years.some((item) => item.year === currentYear)
    ? currentYear
    : data.years[0].year;
  const [state, dispatch] = useReducer(
    reduceJiugongViewState,
    initialYear,
    createJiugongViewState,
  );
  const environment = selectYearEnvironment(data, state.year)
    || selectYearEnvironment(data, initialYear);

  if (!environment) return null;

  return (
    <>
      <div className="print:hidden">
        <div
          className="mb-4 grid grid-cols-3 gap-1 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/80 p-1.5 shadow-sm backdrop-blur"
          role="tablist"
          aria-label="九宫报告章节"
        >
          {TAB_OPTIONS.map((option) => {
            const active = option.key === state.tab;
            return (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => dispatch({ type: 'select-tab', tab: option.key })}
                className={`rounded-xl px-2 py-3 text-center transition-all ${
                  active
                    ? 'bg-[var(--text-primary)] text-[var(--bg-card)] shadow-md'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)]'
                }`}
              >
                <span className="block text-[9px] tracking-[0.12em] opacity-60">{option.kicker}</span>
                <span className="mt-0.5 block text-xs font-semibold sm:text-sm">{option.label}</span>
              </button>
            );
          })}
        </div>

        <div className="card-jade p-5 sm:p-7" role="tabpanel">
          {state.tab === 'traits' && <TraitsPanel data={data} />}
          {state.tab === 'environment' && (
            <EnvironmentPanel
              data={data}
              environment={environment}
              year={state.year}
              onYearChange={(year) => dispatch({ type: 'select-year', year })}
            />
          )}
          {state.tab === 'analysis' && (
            <AnalysisPanel
              data={data}
              environment={environment}
              topic={state.topic}
              onTopicChange={(topic) => dispatch({ type: 'select-topic', topic })}
            />
          )}
        </div>
      </div>

      <div className="jiugong-print-report space-y-8">
        <TraitsPanel data={data} />
        <EnvironmentPanel
          data={data}
          environment={environment}
          year={state.year}
          onYearChange={() => undefined}
          interactive={false}
        />
        <AnalysisPanel
          data={data}
          environment={environment}
          topic={state.topic}
          onTopicChange={() => undefined}
          interactive={false}
        />
      </div>
    </>
  );
}
