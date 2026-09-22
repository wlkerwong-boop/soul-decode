export type LifeStatus = 'alive' | 'deceased' | 'unknown';
export type TimeConfidence = 'exact' | 'approximate' | 'hour_only' | 'unknown';
export type LifeMode = 'current' | 'historical' | 'uncertain';

export interface LifeContext {
  status: LifeStatus;
  mode: LifeMode;
  birthDate: string;
  deathDate?: string;
  analysisDate: string;
  age: number | null;
  ageLabel: string;
  timeConfidence: TimeConfidence;
  notices: string[];
}

export interface BuildLifeContextInput {
  birthDate: string;
  deathDate?: string;
  analysisDate?: string | Date;
  lifeStatus?: LifeStatus | string;
  timeConfidence?: TimeConfidence | string;
}

const TIME_CONFIDENCE_LABELS: Record<TimeConfidence, string> = {
  exact: '精确',
  approximate: '约数',
  hour_only: '仅知时辰',
  unknown: '未知',
};

function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(value);
  if (!match) throw new Error(`Invalid calendar date: ${value}`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function formatDateOnly(value: string | Date): string {
  const date = parseDateOnly(value);
  return date.toISOString().slice(0, 10);
}

function normalizeStatus(value: string | undefined): LifeStatus {
  if (value === 'deceased' || value === '已故' || value === '死者') return 'deceased';
  if (value === 'unknown' || value === '未知') return 'unknown';
  return 'alive';
}

function normalizeTimeConfidence(value: string | undefined): TimeConfidence {
  if (value === 'approximate' || value === '约数') return 'approximate';
  if (value === 'hour_only' || value === '仅知时辰') return 'hour_only';
  if (value === 'unknown' || value === '未知') return 'unknown';
  return 'exact';
}

function ageOnDate(birthDate: Date, endDate: Date): number {
  let age = endDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayNotReached =
    endDate.getUTCMonth() < birthDate.getUTCMonth() ||
    (endDate.getUTCMonth() === birthDate.getUTCMonth() && endDate.getUTCDate() < birthDate.getUTCDate());
  if (birthdayNotReached) age -= 1;
  return Math.max(0, age);
}

export function getTimeConfidenceLabel(confidence: TimeConfidence): string {
  return TIME_CONFIDENCE_LABELS[confidence];
}

export function getLifeModeInstruction(context: LifeContext): string {
  if (context.mode === 'historical') {
    return '这是已故人物的历史回顾模式：只讨论已发生的人生主题与公开事实，不得生成面向当前年份的未来规划、健康建议或在世行动安排。';
  }
  if (context.mode === 'uncertain') {
    return '生命周期状态未知：不得断言对象在世或已故；避免使用需要确认当前现实状态的年龄、健康和未来叙事。';
  }
  return '这是在世对象的当前人生模式：可以讨论截至分析日期的现实处境和未来行动，但不得把命理解释写成确定事实。';
}

export function buildLifeContext(input: BuildLifeContextInput): LifeContext {
  const status = normalizeStatus(input.lifeStatus);
  const timeConfidence = normalizeTimeConfidence(input.timeConfidence);
  const birthDate = formatDateOnly(input.birthDate);
  const analysisDate = formatDateOnly(input.analysisDate || new Date());
  const parsedBirthDate = parseDateOnly(birthDate);
  const parsedAnalysisDate = parseDateOnly(analysisDate);
  const deathDate = input.deathDate ? formatDateOnly(input.deathDate) : undefined;
  const parsedDeathDate = deathDate ? parseDateOnly(deathDate) : undefined;
  const notices: string[] = [];

  let age: number | null;
  let ageLabel: string;
  let mode: LifeMode;

  if (status === 'deceased') {
    mode = 'historical';
    if (parsedDeathDate) {
      age = ageOnDate(parsedBirthDate, parsedDeathDate);
      ageLabel = `享年：${age}岁（已故）`;
    } else {
      age = null;
      ageLabel = '生命周期状态：已故（享年待补）';
      notices.push('已故人物缺少去世日期：无法计算享年。');
    }
  } else if (status === 'unknown') {
    mode = 'uncertain';
    age = ageOnDate(parsedBirthDate, parsedAnalysisDate);
    ageLabel = `年龄：${age}岁（生命周期状态未知）`;
    notices.push('生命周期状态未知：不得生成确定的在世或已故叙事。');
  } else {
    mode = 'current';
    age = ageOnDate(parsedBirthDate, parsedAnalysisDate);
    ageLabel = `当前年龄：${age}岁`;
  }

  if (timeConfidence === 'approximate') {
    notices.push('出生时刻为约数：宫位、时柱和其他分钟敏感结论仅作参考。');
  } else if (timeConfidence === 'hour_only') {
    notices.push('仅知出生时辰：分钟敏感结论不可作为精确验证。');
  } else if (timeConfidence === 'unknown') {
    notices.push('出生时刻未知：人类图、紫微斗数时辰和其他时刻敏感结论不可作为精确验证。');
  }

  return {
    status,
    mode,
    birthDate,
    deathDate,
    analysisDate,
    age,
    ageLabel,
    timeConfidence,
    notices,
  };
}
