export const LIFE_STORY_VERSION = 1 as const;
export const LIFE_STORY_DRAFT_KEY = 'life_story_draft_v1';
export const LIFE_STORY_SUMMARY_DRAFT_KEY = 'life_story_summary_draft_v1';
export const LIFE_SCRIPT_RESULT_KEY = 'life_script_result_v1';

export const LIFE_STORY_THEMES = [
  'family',
  'education',
  'career',
  'relationship',
  'health',
  'finance',
  'move',
  'other',
] as const;

export type LifeStoryTheme = (typeof LIFE_STORY_THEMES)[number];

export interface LifeStoryEvent {
  id: string;
  year?: number;
  theme: LifeStoryTheme;
  title: string;
  whatHappened: string;
  choiceMade?: string;
  meaningNow?: string;
}

export interface LifeStoryProfile {
  version: typeof LIFE_STORY_VERSION;
  origin: {
    family: string;
    environment: string;
    resources?: string;
    migrations?: string;
  };
  lifePath: {
    education?: string;
    career?: string;
    relationships?: string;
    health?: string;
  };
  events: LifeStoryEvent[];
  present: {
    status: string;
    unresolved?: string;
    preserve?: string;
    change?: string;
    hopes?: string;
  };
  consent: {
    reflectiveSimulation: boolean;
    confirmedAt: string;
  };
}

export interface LifeScriptSummary {
  headline: string;
  strengths: string[];
  patterns: string[];
  tensions: string[];
  openQuestions: string[];
}

export interface LifeScriptPath {
  type: 'continuity' | 'change';
  title: string;
  premise: string;
  signals: string[];
  risks: string[];
  opportunities: string[];
  actions: string[];
}

export interface LifeScriptResult {
  summary: LifeScriptSummary;
  paths: LifeScriptPath[];
  sourceLabels: Array<'birthProfile' | 'lifeStory' | 'currentChoice' | 'inference'>;
  disclaimer: string;
}

export type LifeStoryValidation =
  | { ok: true; value: LifeStoryProfile }
  | { ok: false; errors: string[] };

const MAX_EVENTS = 8;
const MAX_YEAR = new Date().getFullYear() + 1;
const MAX_LENGTHS = {
  origin: 1600,
  path: 2400,
  status: 1200,
  present: 1600,
  eventTitle: 120,
  eventWhat: 1800,
  eventChoice: 1000,
  eventMeaning: 1000,
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const text = (value: unknown): value is string => typeof value === 'string';

const optionalText = (value: unknown): boolean => value === undefined || text(value);

const addLengthError = (errors: string[], label: string, value: unknown, max: number) => {
  if (text(value) && value.length > max) {
    errors.push(`${label}不能超过 ${max} 字。`);
  }
};

const addRequiredTextError = (errors: string[], label: string, value: unknown) => {
  if (!text(value) || value.trim().length === 0) {
    errors.push(`${label}不能为空。`);
  }
};

export function createEmptyLifeStory(): LifeStoryProfile {
  return {
    version: LIFE_STORY_VERSION,
    origin: {
      family: '',
      environment: '',
      resources: '',
      migrations: '',
    },
    lifePath: {
      education: '',
      career: '',
      relationships: '',
      health: '',
    },
    events: [],
    present: {
      status: '',
      unresolved: '',
      preserve: '',
      change: '',
      hopes: '',
    },
    consent: {
      reflectiveSimulation: false,
      confirmedAt: '',
    },
  };
}

export function validateLifeStory(input: unknown): LifeStoryValidation {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ['人生总结数据格式不正确，请重新填写。'] };
  }

  if (input.version !== LIFE_STORY_VERSION) {
    errors.push('人生总结版本不兼容，请重新开始。');
  }

  const origin = isRecord(input.origin) ? input.origin : {};
  const lifePath = isRecord(input.lifePath) ? input.lifePath : {};
  const present = isRecord(input.present) ? input.present : {};
  const consent = isRecord(input.consent) ? input.consent : {};
  const events = Array.isArray(input.events) ? input.events : [];

  addLengthError(errors, '成长家庭', origin.family, MAX_LENGTHS.origin);
  addLengthError(errors, '成长环境', origin.environment, MAX_LENGTHS.origin);
  addLengthError(errors, '家庭资源', origin.resources, MAX_LENGTHS.origin);
  addLengthError(errors, '重要迁移', origin.migrations, MAX_LENGTHS.origin);

  for (const [key, label] of [
    ['education', '求学经历'],
    ['career', '工作或事业经历'],
    ['relationships', '关系与家庭经历'],
    ['health', '健康与生活节奏'],
  ] as const) {
    if (!optionalText(lifePath[key])) {
      errors.push(`${label}格式不正确。`);
    }
    addLengthError(errors, label, lifePath[key], MAX_LENGTHS.path);
  }

  if (!text(present.status) || present.status.trim().length === 0) {
    errors.push('请先填写你此刻的状态。');
  }
  addLengthError(errors, '当前状态', present.status, MAX_LENGTHS.status);
  for (const [key, label] of [
    ['unresolved', '未解决的问题'],
    ['preserve', '想保留的东西'],
    ['change', '想改变的东西'],
    ['hopes', '未来三年愿望'],
  ] as const) {
    if (!optionalText(present[key])) {
      errors.push(`${label}格式不正确。`);
    }
    addLengthError(errors, label, present[key], MAX_LENGTHS.present);
  }

  if (events.length === 0) {
    errors.push('至少记录一个对你有意义的关键事件。');
  }
  if (events.length > MAX_EVENTS) {
    errors.push(`关键事件最多记录 ${MAX_EVENTS} 个。`);
  }

  for (const event of events) {
    if (!isRecord(event)) {
      errors.push('关键事件格式不正确。');
      continue;
    }

    addRequiredTextError(errors, '事件标题', event.title);
    addRequiredTextError(errors, '事件经过', event.whatHappened);
    addLengthError(errors, '事件标题', event.title, MAX_LENGTHS.eventTitle);
    addLengthError(errors, '事件经过', event.whatHappened, MAX_LENGTHS.eventWhat);
    addLengthError(errors, '当时选择', event.choiceMade, MAX_LENGTHS.eventChoice);
    addLengthError(errors, '现在理解', event.meaningNow, MAX_LENGTHS.eventMeaning);

    if (!text(event.id) || event.id.trim().length === 0) {
      errors.push('每个关键事件都需要一个标识。');
    }
    if (!LIFE_STORY_THEMES.includes(event.theme as LifeStoryTheme)) {
      errors.push('关键事件主题不在允许范围内。');
    }
    const year = event.year;
    if (year !== undefined && (typeof year !== 'number' || !Number.isInteger(year) || year < 1900 || year > MAX_YEAR)) {
      errors.push(`关键事件的年份需在 1900 年至明年之间。`);
    }
  }

  if (consent.reflectiveSimulation !== true) {
    errors.push('请确认你了解这是反思性模拟，不是命运判决。');
  }
  if (!text(consent.confirmedAt) || consent.confirmedAt.trim().length === 0) {
    errors.push('请完成反思性模拟确认。');
  }

  if (errors.length > 0) {
    return { ok: false, errors: Array.from(new Set(errors)) };
  }

  return {
    ok: true,
    value: input as unknown as LifeStoryProfile,
  };
}

export function buildSummarySeed(profile: LifeStoryProfile): string {
  const lines = [
    `成长家庭：${profile.origin.family}`,
    `成长环境：${profile.origin.environment || '未填写'}`,
    `家庭资源：${profile.origin.resources || '未填写'}`,
    `重要迁移：${profile.origin.migrations || '未填写'}`,
    `求学经历：${profile.lifePath.education || '未填写'}`,
    `工作或事业经历：${profile.lifePath.career || '未填写'}`,
    `关系与家庭经历：${profile.lifePath.relationships || '未填写'}`,
    `健康与生活节奏：${profile.lifePath.health || '未填写'}`,
    `当前状态：${profile.present.status}`,
    `未解决的问题：${profile.present.unresolved || '未填写'}`,
    `想保留的东西：${profile.present.preserve || '未填写'}`,
    `想改变的东西：${profile.present.change || '未填写'}`,
    `未来三年愿望：${profile.present.hopes || '未填写'}`,
    '关键事件：',
    ...profile.events.map((event) => {
      const year = event.year ? `${event.year}` : '年份未填写';
      return [
        `${year}｜${event.title}｜主题：${event.theme}`,
        `发生了什么：${event.whatHappened}`,
        `当时选择：${event.choiceMade || '未填写'}`,
        `现在理解：${event.meaningNow || '未填写'}`,
      ].join('\n');
    }),
  ];

  return lines.join('\n');
}
