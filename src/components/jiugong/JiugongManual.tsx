'use client';

import type { JiugongFull } from '../../server/jiugong-v6';

/**
 * 人生说明书（7 章完整报告）
 * 结构对齐老唐《人生解码》report.py 的 7 章骨架：
 *   命盘 / 人格特质 / 婚姻 / 财运 / 流年 / 90 年卷轴
 * 网页版与打印/PDF 版共用本组件（打印由 .jiugong-print-report 承载）。
 */

function Chapter({
  no,
  kicker,
  title,
  description,
  children,
}: {
  no: string;
  kicker: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="manual-chapter rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)]/80 p-6 shadow-sm sm:p-8 print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
      <header className="mb-5 border-b border-[var(--border-color)]/70 pb-4 print:mb-4">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl font-bold text-[var(--color-primary)]">{no}</span>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.28em] text-[var(--color-primary)]">
              {kicker}
            </p>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
              {title}
            </h2>
          </div>
        </div>
        {description && (
          <p className="mt-2 max-w-3xl text-xs leading-6 text-[var(--text-secondary)]">
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

function Sub({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
        <span className="h-px w-4 bg-[var(--color-primary)]" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Prose({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="whitespace-pre-line text-xs leading-6 text-[var(--text-secondary)] sm:text-[13px] sm:leading-7">
      {text}
    </p>
  );
}

function Badge({ children, tone = 'gold' }: { children: React.ReactNode; tone?: 'gold' | 'plain' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        tone === 'gold'
          ? 'bg-[var(--color-primary)] text-white'
          : 'border border-[var(--border-color)] bg-[var(--bg-highlight)] text-[var(--text-secondary)]'
      }`}
    >
      {children}
    </span>
  );
}

/** 章一 · 基本命盘 */
function ChapterBasics({ data }: { data: JiugongFull }) {
  const grids = [
    { name: '天格', value: data.tian, wx: data.tianWx, note: '上层 · 长辈' },
    { name: '人格', value: data.ren, wx: data.renWx, note: '自我' },
    { name: '地格', value: data.di, wx: data.diWx, note: '下层 · 下属' },
    { name: '总格', value: data.zong, wx: data.renWx, note: '对外' },
  ];
  return (
    <Chapter no="一" kicker="CHART" title="基本命盘" description="五格三才与姓名数理结构，是全部推演的起点。">
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)]">
        <table className="min-w-[560px] w-full text-left text-xs">
          <thead className="bg-[var(--bg-highlight)] text-[var(--text-tertiary)]">
            <tr>
              <th className="px-4 py-2.5 font-medium">宫位</th>
              <th className="px-4 py-2.5 font-medium">数理</th>
              <th className="px-4 py-2.5 font-medium">五行</th>
              <th className="px-4 py-2.5 font-medium">定位</th>
            </tr>
          </thead>
          <tbody>
            {grids.map((g) => (
              <tr key={g.name} className="border-t border-[var(--border-color)]/60">
                <td className="px-4 py-2.5 font-semibold text-[var(--text-primary)]">{g.name}</td>
                <td className="px-4 py-2.5">{g.value}</td>
                <td className="px-4 py-2.5">{g.wx}</td>
                <td className="px-4 py-2.5 text-[var(--text-secondary)]">{g.note}</td>
              </tr>
            ))}
            <tr className="border-t border-[var(--border-color)]/60">
              <td className="px-4 py-2.5 font-semibold text-[var(--text-primary)]">外格</td>
              <td className="px-4 py-2.5">{data.wai}</td>
              <td className="px-4 py-2.5" />
              <td className="px-4 py-2.5 text-[var(--text-secondary)]">环境 · 社交</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>总笔画 {data.total} 画</Badge>
        <Badge tone="plain">三才 {data.tianWx}-{data.renWx}-{data.diWx}</Badge>
        <Badge tone="plain">局差 {data.ju}</Badge>
        <Badge tone="plain">质 {data.zhi} · {data.zhiName}</Badge>
      </div>
      {data.zhiTips && data.zhiTips.length > 0 && (
        <p className="mt-4 rounded-2xl bg-[var(--color-primary)]/[0.08] px-4 py-3 text-xs leading-6 text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--color-primary)]">◎ 提示（人生转折关键年）：</span>
          {data.zhiTips.join('、')} 岁
        </p>
      )}
      <p className="mt-4 text-[11px] leading-5 text-[var(--text-tertiary)]">
        用字口径：康熙字典繁体笔画；用名口径：10 岁前本名（此后改名基本无效，容易出现双人格）。五行↔数字取个位数：木1,2｜火3,4｜土5,6｜金7,8｜水9,0（奇阳偶阴）。
      </p>
    </Chapter>
  );
}

/** 章二 · 人格特质分析 */
function ChapterPersonality({ data }: { data: JiugongFull }) {
  return (
    <Chapter
      no="二"
      kicker="PERSONALITY"
      title="人格特质分析"
      description="从局、质、星运与五行关系中，看见您惯常如何思考、行动、经营资源。"
    >
      <Sub title="2.1 人生总纲">
        <div className="space-y-2">
          <p className="text-xs leading-6 text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">局差 {data.ju}：</span>
            {data.juDesc}
          </p>
          <p className="text-xs leading-6 text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">
              质 {data.zhi} · {data.zhiName}（{data.zhiElement}）：
            </span>
            {data.zhiDesc}
          </p>
          {data.zhiMeaning && (
            <p className="rounded-2xl bg-[var(--bg-highlight)] p-3 text-xs leading-6 text-[var(--text-secondary)]">
              ◎ 其意义在告诉你：{data.zhiMeaning}
              {data.zhiCaution && <>；切记：{data.zhiCaution}</>}
            </p>
          )}
          {data.zhiTips && data.zhiTips.length > 0 && (
            <p className="text-xs leading-6 text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                人生转折关键年：
              </span>
              {data.zhiTips.join('、')} 岁
            </p>
          )}
        </div>
      </Sub>

      <Sub title="2.2 特质 · 十大家族">
        <div className="space-y-2">
          {data.zhiFamily ? (
            <p className="text-xs leading-6 text-[var(--text-secondary)]">
              质{data.zhi} · <span className="font-bold text-[var(--text-primary)]">{data.zhiFamily[0]}（{data.zhiFamily[1]}）</span> · {data.zhiFamily[2]}
              {data.motherQi && <>；九宫母气：{data.motherQi}</>}
              <br />◎ 特质：{data.zhiFamily[3]}
            </p>
          ) : (
            <p className="text-xs leading-6 text-[var(--text-secondary)]">质{data.zhi} 对照数据整理中。</p>
          )}
          {(data.zhi === 2 || data.zhi === 3 || data.zhi === 6) && (
            <p className="rounded-xl bg-[var(--color-primary)]/10 px-3 py-2 text-xs leading-6 text-[var(--text-secondary)]">
              ※ 用人提示：{data.zhi === 2 && '能说——适合做大客户沟通；能写——文案功夫特别强。'}
              {data.zhi === 3 && '特别适合做业务。'}
              {data.zhi === 6 && '招聘业务首选，最容易出CEO（尤其36画）。'}
            </p>
          )}
        </div>
      </Sub>

      <Sub title="2.3 人生经营">
        <div className="space-y-2">
          <p className="text-xs leading-6 text-[var(--text-secondary)]">
            代表成功导向的总格星性为「{data.xingyunName}」，属{data.zhiElement}，{data.zhiDesc}。
          </p>
          {data.zhiMeaning && <Prose text={`◎ 其意义在告诉你：${data.zhiMeaning}`} />}
          {data.zhiCaution && <Prose text={`◎ 切记：${data.zhiCaution}`} />}
        </div>
      </Sub>

      <Sub title="2.4 性格 · 思维与行动">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-highlight)]/60 p-4">
            <p className="text-[10px] tracking-[0.16em] text-[var(--text-tertiary)]">思想功能 · 35岁以前为主 · 天→人</p>
            <p className="mt-1.5 text-xs font-semibold text-[var(--text-primary)]">{data.thinkRel}</p>
            <p className="mt-1.5 text-xs leading-6 text-[var(--text-secondary)]">{data.wxThinkFull || data.thinkDesc}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-highlight)]/60 p-4">
            <p className="text-[10px] tracking-[0.16em] text-[var(--text-tertiary)]">行动功能 · 35岁以后为主 · 人→地</p>
            <p className="mt-1.5 text-xs font-semibold text-[var(--text-primary)]">{data.actionRel}</p>
            <p className="mt-1.5 text-xs leading-6 text-[var(--text-secondary)]">{data.wxActionFull || data.actionDesc}</p>
          </div>
        </div>
        <div className="mt-3 space-y-2 rounded-2xl bg-[var(--bg-highlight)]/60 p-4 text-xs leading-6 text-[var(--text-secondary)]">
          <p>
            <span className="font-semibold text-[var(--text-primary)]">主副功能：{data.mainFunc}</span>
            {' '}— {data.mainFuncDesc}
          </p>
          {data.mainFuncAction && <p>动作力：{data.mainFuncAction}</p>}
          {data.mainFuncMethod && <p>处事方法：{data.mainFuncMethod}</p>}
        </div>
      </Sub>

      <Sub title="2.4 事业趋向">
        {data.careerDir ? (
          <div className="space-y-2">
            <p className="text-xs leading-6 text-[var(--text-secondary)]">
              人格 {data.ren} 属{data.renWx} · 个位数 {data.ren % 10} →{' '}
              <span className="font-semibold text-[var(--color-primary)]">{data.careerDir.达人}</span>
            </p>
            <Prose text={`◎ 个性特质：${data.careerDir.特质}`} />
            <Prose text={`◎ 适合职业：${data.careerDir.职业}`} />
            {data.careerHealth && (
              <p className="rounded-2xl bg-[var(--bg-highlight)] p-3 text-xs leading-6 text-[var(--text-secondary)]">
                ◎ 健康提示：{data.careerHealth}
              </p>
            )}
          </div>
        ) : (
          <Prose text="人格五行职业方向对照数据整理中。" />
        )}
      </Sub>

      <Sub title="2.5 上下助力与属下助力">
        <div className="space-y-2 text-xs leading-6 text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">
            ① 箭头法（天格{data.tianWx}—人格{data.renWx}—地格{data.diWx}）
          </p>
          {data.arrowUp && <p>· {data.arrowUp}</p>}
          {data.arrowDown && <p>· {data.arrowDown}</p>}
          {data.arrowSummary && <p>◎ {data.arrowSummary}</p>}
          <p className="font-semibold text-[var(--text-primary)]">
            ② 属下助力：地格 {data.di} → 合并数 {data.subSupportNum}
          </p>
          {data.subSupport && (
            <p>· 要点：{data.subSupport.要点} — {data.subSupport.说明}</p>
          )}
        </div>
      </Sub>

      <Sub title="2.6 星运">
        <div className="space-y-2">
          <p className="text-xs leading-6 text-[var(--text-secondary)]">
            总笔画 {data.total} → <span className="font-semibold text-[var(--text-primary)]">{data.xingyunName}</span>
          </p>
          {data.xingyunPoints && (
            <ul className="list-disc space-y-1 pl-5 text-xs leading-6 text-[var(--text-secondary)]">
              {data.xingyunPoints.map((point) => <li key={point}>{point}</li>)}
            </ul>
          )}
          {data.xingyunTrait && <Prose text={`星座的特质：${data.xingyunTrait}`} />}
          {data.xingyunMeaning && <Prose text={`◎ 其意义是在告诉你：${data.xingyunMeaning}`} />}
          {data.xingyunCaution && <Prose text={`◎ 切记：${data.xingyunCaution}`} />}
          {data.xingyunTips && <Prose text={`◎ 提示：${data.xingyunTips}`} />}
        </div>
      </Sub>
    </Chapter>
  );
}

/** 章三 · 婚姻分析 */
function ChapterMarriage({ data }: { data: JiugongFull }) {
  const m = data.marriageFull;
  const breakAlias = m?.别名;
  return (
    <Chapter no="三" kicker="MARRIAGE" title="婚姻分析" description="以人格与地格的五行关系，看姻缘的起、续、灭与经营之道。">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>婚姻结论 · {data.marriage}{data.marriageSub ? ` · ${data.marriageSub}` : ''}</Badge>
        {data.marriageBreakKey && <Badge tone="plain">克型 {data.marriageBreakKey}</Badge>}
        {breakAlias && <Badge tone="plain">{breakAlias}</Badge>}
      </div>
      <div className="mt-4 space-y-3 text-xs leading-6 text-[var(--text-secondary)] sm:text-[13px] sm:leading-7">
        {m?.总述 && <Prose text={`◎ 总述：${m.总述}`} />}
        {m?.缘起 && <Prose text={`缘起：${m.缘起}`} />}
        {m?.缘续 && <Prose text={`缘续：${m.缘续}`} />}
        {m?.缘灭 && <Prose text={`缘灭：${m.缘灭}`} />}
        {m?.要点 && m.要点.length > 0 && (
          <ul className="list-disc space-y-1 pl-5">
            {m.要点.map((point) => <li key={point}>{point}</li>)}
          </ul>
        )}
        {m?.建议 && <Prose text={`建议：${m.建议}`} />}
        {!m && <Prose text="婚姻宫解读数据整理中。" />}
      </div>
    </Chapter>
  );
}

/** 章四 · 财运分析 */
function ChapterWealth({ data }: { data: JiugongFull }) {
  const ck = data.caiKuFull;
  return (
    <Chapter no="四" kicker="WEALTH" title="财运分析" description="财库通路与财宫形态，看财富的来路与守成之道。">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>财库 · {data.wealthPath.split('：')[0]}</Badge>
        <Badge tone="plain">财宫 · {data.wealthPalace}</Badge>
      </div>
      {ck && (
        <div className="mt-4 space-y-2">
          <Prose text={`◎ ${ck.类型}：${ck.描述}`} />
          {ck.详解 && ck.详解.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-xs leading-6 text-[var(--text-secondary)]">
              {ck.详解.map((line) => <li key={line}>{line}</li>)}
            </ul>
          )}
        </div>
      )}
      {data.caiKuJia3 && (
        <div className="mt-3 rounded-2xl bg-[var(--bg-highlight)]/60 p-4">
          <p className="text-xs font-semibold text-[var(--text-primary)]">机运暗财型 · 八条详解</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-6 text-[var(--text-secondary)]">
            {data.caiKuJia3.map((line) => <li key={line}>{line}</li>)}
          </ul>
          {data.caiKuJia3Note && <Prose text={`※ ${data.caiKuJia3Note}`} />}
        </div>
      )}
      <div className="mt-4 space-y-2">
        <Prose text={`★ 财宫结论：${data.wealthPalace} → ${data.wealthPalaceDesc}`} />
        {data.caigongXie && (
          <ul className="list-disc space-y-1 pl-5 text-xs leading-6 text-[var(--text-secondary)]">
            {data.caigongXie.map((line) => <li key={line}>{line}</li>)}
          </ul>
        )}
        {data.caigongXieNote && <Prose text={`※ ${data.caigongXieNote}`} />}
      </div>
    </Chapter>
  );
}

/** 章五 · 人体自然规律 · 流年运势 */
function ChapterFlow({ data }: { data: JiugongFull }) {
  const aura = [
    { label: '上层 · 天格', key: '上层', qi: data.upperQi, energy: data.upperEnergy, caution: data.upperCaution, note: data.upperNote },
    { label: '自我 · 人格', key: '自我', qi: data.selfQi, energy: data.selfEnergy, caution: data.selfCaution, note: data.selfNote },
    { label: '下层 · 地格', key: '下层', qi: data.lowerQi, energy: data.lowerEnergy, caution: data.lowerCaution, note: data.lowerNote },
    { label: '对外 · 总格', key: '对外', qi: data.outerQi, energy: data.outerEnergy, caution: data.outerCaution, note: data.outerNote },
  ];
  const ln = data.liunianDetail;
  return (
    <Chapter
      no="五"
      kicker="ANNUAL"
      title="人体自然规律 · 流年运势"
      description={`${new Date().getFullYear()} 年（虚岁 ${data.xuAge} 岁）年度运势详批。`}
    >
      <Sub title="5.1 四格气场 · 九大气场">
        <div className="mb-3 rounded-2xl border border-[var(--color-primary)]/25 bg-gradient-to-br from-[var(--color-primary)]/[0.10] to-transparent p-4">
          <p className="text-xs font-bold text-[var(--text-primary)]">◎ 碰撞期（压力运）</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {data.collisions.map((c) => (
              <div key={c.格} className={`rounded-xl p-3 ${c.命中 ? 'bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/40' : 'bg-[var(--bg-highlight)]/70'}`}>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  {c.格}（{c.数}数）{c.命中 && <span className="ml-1 text-[var(--color-primary)]">← 今年虚岁{data.xuAge}正处碰撞期</span>}
                </p>
                {c.解说 && <p className="mt-1 text-xs leading-6 text-[var(--text-secondary)]">◆ 解说：{c.解说}</p>}
                {c.现象 && <p className="text-xs leading-6 text-[var(--text-secondary)]">◆ 碰撞现象：{c.现象}</p>}
                {c.提示 && <p className="text-xs leading-6 text-[var(--text-secondary)]">◆ 提示：{c.提示}</p>}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[var(--text-tertiary)]">
            碰撞期推演口径：往后格数+1 起步、每+9 一遇；往前格数−10、再每−9。各格碰撞虚岁：
            {Object.entries(data.collisionYears).map(([g, ys]) => ` ${g}${ys.join('/')}；`)}
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {aura.map((g) => {
            const qiInfo = data.gridQi?.[g.key]?.[g.qi];
            const enInfo = data.gridEnergy?.[g.key];
            return (
              <div key={g.label} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-highlight)]/50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-[var(--text-primary)]">{g.label}</p>
                  <Badge tone="plain">{g.qi} · {g.energy}</Badge>
                </div>
                {g.label === '对外 · 总格' && data.guaName && (
                  <p className="mt-2 rounded-xl bg-[var(--color-primary)]/10 px-3 py-2 text-xs leading-6 text-[var(--text-primary)]">
                    ◆ 对外卦象：{data.guaName}卦
                    {data.guaKoujue && <> —— {data.guaKoujue}</>}
                    {data.guaShixu && <span className="ml-1 text-[var(--color-primary)]">（实虚卦：前段实/后段虚）</span>}
                  </p>
                )}
                {qiInfo && (
                  <div className="mt-2 space-y-1.5 text-xs leading-6 text-[var(--text-secondary)]">
                    <p className="font-semibold text-[var(--text-primary)]">── 气场解读 ──</p>
                    {qiInfo.解释 && <p>◆ 此象在该格的意义：{qiInfo.解释}</p>}
                    {qiInfo.现象 && <p>◆ 产生现象：{qiInfo.现象}</p>}
                    {qiInfo.操作 && <p>◆ 操作：{qiInfo.操作}</p>}
                    {g.caution && <p>◆ 对策：{g.caution}</p>}
                    {g.note && <p>◆ 注意事项：{g.note}</p>}
                  </div>
                )}
                {enInfo && (
                  <div className="mt-2 space-y-1.5 text-xs leading-6 text-[var(--text-secondary)]">
                    <p className="font-semibold text-[var(--text-primary)]">── 能量解读 ──</p>
                    {enInfo.代表 && <p>◆ {g.key === '对外' ? '对外关系' : `处于${g.key}`}代表：{enInfo.代表}</p>}
                    {enInfo.实例 && <p>◆ 能量容易发生现象：{enInfo.实例}</p>}
                    {(data.internalEnergy as Record<string, unknown> | undefined)?.[g.key] != null && (
                      <p>◆ 内部能量：{String((data.internalEnergy as Record<string, unknown>)[g.key])}</p>
                    )}
                    {g.key === '自我' && (
                      <p className="text-[11px] leading-5 text-[var(--text-tertiary)]">
                        （内部情绪发展：胎=松弛、养=稳定、长生=爆发、冠带=突显本性、临官=横冲、帝旺=高亢、衰=倦怠、病=心乱不稳、死=心静已死、绝=谷底空洞）
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Sub>

      <Sub title="5.2 年度运势详批">
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/[0.06] p-4">
            <p className="text-xs font-bold text-[var(--text-primary)]">
              虚岁 {data.xuAge} 岁值 · 逢{data.ageStar}
            </p>
            <Prose text={data.ageStarFull} />
            {data.suizhiNote && (
              <p className="mt-2 rounded-xl bg-[var(--color-primary)]/10 px-3 py-2 text-xs leading-6 text-[var(--text-secondary)]">
                ※ 注意：{data.suizhiNote}
              </p>
            )}
          </div>
          {ln && (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/70 p-4">
              <p className="text-xs font-bold text-[var(--text-primary)]">
                能量 · {data.liunianState}运（{ln.副名}）
              </p>
              <div className="mt-2 space-y-2 text-xs leading-6 text-[var(--text-secondary)]">
                {ln.磁场 && <p>一、磁场：{ln.磁场}</p>}
                {ln.动能 && <p>二、动能：{ln.动能}</p>}
                {ln.生命力 && <p>三、生命力：{ln.生命力}</p>}
                {ln.心态 && <p>四、心态：{ln.心态}</p>}
                {ln.发展现象 && <p>◎ 发展现象：{ln.发展现象}</p>}
                {ln.运用法则 && <p>◎ 运用法则：{ln.运用法则}</p>}
              </div>
            </div>
          )}
          {data.guaName && (
            <div className="rounded-2xl border border-[var(--color-primary)]/25 bg-gradient-to-br from-[var(--color-primary)]/[0.10] to-transparent p-4">
              <p className="text-xs font-bold text-[var(--text-primary)]">
                流年卦签 · {data.guaName}卦 ＝ {data.guaKoujue}
              </p>
              {data.guaJiedu && <p className="mt-1.5 text-xs leading-6 text-[var(--text-secondary)]">◎ 卦象解读：{data.guaJiedu}</p>}
              {data.guaPositive && <p className="mt-1.5 text-xs leading-6 text-[var(--text-secondary)]">◎ 正向意涵：{data.guaPositive}</p>}
              {data.guaShixu && (
                <p className="mt-1.5 text-xs leading-6 text-[var(--color-primary)]">
                  ◎ 实虚分界：此卦为「实虚卦」——开始转运，本年有分界点；前段是实、后段是虚：上半年宜实做积累、把握转机，下半年守成观察、不宜冒进。
                </p>
              )}
              {data.guaReverse && <p className="mt-1.5 text-xs leading-6 text-[var(--text-secondary)]">◎ 反向思考：{data.guaReverse}（卦签反向）</p>}
              {data.guaRef && (
                <div className="mt-2 rounded-xl bg-white/40 p-3 text-xs leading-6 text-[var(--text-secondary)]">
                  {data.guaRef.口诀 && <p>◆ 口诀参考：{data.guaRef.口诀}</p>}
                  {data.guaRef.意义 && <p>◆ 其意义：{data.guaRef.意义}</p>}
                  {data.guaRef.启示 && <p>◆ 启示：{data.guaRef.启示}</p>}
                  {data.guaRef.切记 && <p className="font-semibold text-[var(--color-primary)]">◆ 切记：{data.guaRef.切记}</p>}
                  {data.guaRef.反向 && <p>◆ 反向：{data.guaRef.反向}</p>}
                </div>
              )}
            </div>
          )}
          {data.annualStrategy && data.annualStrategy.length > 0 && (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/70 p-4">
              <p className="text-xs font-bold text-[var(--text-primary)]">
                年度经营策略（以生日为锚点，共四期）
              </p>
              <div className="mt-2 space-y-2.5">
                {data.annualStrategy.map((s) => (
                  <div key={s.阶段} className="rounded-xl bg-[var(--bg-highlight)]/70 p-3">
                    <p className="text-xs font-semibold text-[var(--color-primary)]">
                      {s.阶段}（{s.月份}）
                    </p>
                    {s.文案.map((text) => (
                      <p key={text.slice(0, 12)} className="mt-1 text-xs leading-6 text-[var(--text-secondary)]">
                        {text}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Sub>
    </Chapter>
  );
}

/** 章六 · 90 年运势卷轴 */
function ChapterScroll({ data }: { data: JiugongFull }) {
  const currentYear = new Date().getFullYear();
  return (
    <Chapter
      no="六"
      kicker="LIFETIME"
      title="人生九十年运势卷轴"
      description={`${data.name} · 虚岁 1–90 岁完整卷轴（卦象版）· ★ = 关键年卦象，▶ = ${new Date().getFullYear()}（虚岁 ${data.xuAge}）当前流年 · 完整版四大关系矩阵可下载电子表格。`}
    >
      <div className="max-h-[56vh] overflow-auto rounded-2xl border border-[var(--border-color)] print:max-h-none print:overflow-visible">
        <table className="min-w-[680px] w-full text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[var(--bg-card)] text-[var(--text-tertiary)] print:bg-white">
            <tr>
              {['年龄', '年份', '气场', '能量', '卦象', '口诀', '解读'].map((heading) => (
                <th key={heading} className="px-3 py-2.5 font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.years.map((item) => {
              const active = item.year === currentYear;
              const flags = `${item.keyYear ? '★' : ''}${active ? '▶' : ''}`;
              return (
                <tr
                  key={item.year}
                  className={`border-t border-[var(--border-color)]/60 ${
                    active ? 'bg-[var(--color-primary)]/10' : ''
                  } ${item.keyYear ? 'font-medium' : ''}`}
                >
                  <td className="px-3 py-2 font-semibold">
                    {flags && <span className={`mr-1 ${item.keyYear ? 'text-[var(--color-primary)]' : ''}`}>{flags}</span>}
                    {item.age}
                  </td>
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
    </Chapter>
  );
}

export function JiugongManual({ data }: { data: JiugongFull }) {
  return (
    <div className="manual-report space-y-5 print:space-y-8">
      <ChapterBasics data={data} />
      <ChapterPersonality data={data} />
      <ChapterMarriage data={data} />
      <ChapterWealth data={data} />
      <ChapterFlow data={data} />
      <ChapterScroll data={data} />
      <p className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-highlight)]/60 px-5 py-4 text-center text-[11px] leading-6 text-[var(--text-tertiary)] print:border-0 print:bg-white">
        注明：人生说明书可以揭开潜藏在你身上的密码，告诉了你的命或业力，但运是可以经营的，如何依此去经营人生才是它的真正价值。
      </p>
    </div>
  );
}
