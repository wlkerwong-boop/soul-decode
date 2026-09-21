export const BIOGRAPHY_CATEGORIES = [
  'birth',
  'family',
  'education',
  'career',
  'relationship',
  'health',
  'move',
  'role',
  'other',
] as const;

export const BIOGRAPHY_SOURCE_GRADES = ['official', 'primary', 'reputable', 'biography', 'secondary'] as const;
export const BIOGRAPHY_DISTINCTIVENESS = ['high', 'medium', 'low'] as const;
export const BIOGRAPHY_REVIEW_LABELS = ['match', 'mismatch', 'neutral', 'unscorable'] as const;

export type BiographyCategory = (typeof BIOGRAPHY_CATEGORIES)[number];
export type BiographySourceGrade = (typeof BIOGRAPHY_SOURCE_GRADES)[number];
export type BiographyDistinctiveness = (typeof BIOGRAPHY_DISTINCTIVENESS)[number];
export type BiographyReviewLabel = (typeof BIOGRAPHY_REVIEW_LABELS)[number];

export interface BiographyFact {
  id: string;
  personId: string;
  eventYear?: number;
  category: BiographyCategory;
  description: string;
  sourceUrl: string;
  sourceGrade: BiographySourceGrade;
  distinctiveness: BiographyDistinctiveness;
  preRegistered: boolean;
}

export interface BiographyReview {
  factId: string;
  label: BiographyReviewLabel;
  reviewerId?: string;
  note?: string;
}

export interface BiographyValidationScore {
  personId: string;
  counts: Record<BiographyReviewLabel | 'total', number>;
  weights: {
    total: number;
    reviewed: number;
    match: number;
    mismatch: number;
    neutral: number;
    unscorable: number;
  };
  observedFitScore: number | null;
  coveragePercent: number;
  unscorablePercent: number;
  contradictionPercent: number;
}

export type BiographyFactValidation =
  | { ok: true; value: BiographyFact[] }
  | { ok: false; errors: string[] };

const MAX_FACTS = 100;
const MAX_TEXT_LENGTH = 600;
const DISTINCTIVENESS_WEIGHT: Record<BiographyDistinctiveness, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isHttpUrl = (value: unknown): value is string =>
  typeof value === 'string' && /^https?:\/\/[^\s]+$/i.test(value);

const isOneOf = <T extends readonly string[]>(values: T, value: unknown): value is T[number] =>
  typeof value === 'string' && values.includes(value);

function normalizeFacts(input: unknown): BiographyFact[] {
  if (!Array.isArray(input)) throw new Error('传记事实必须是数组。');
  return input as BiographyFact[];
}

export function validateBiographyFacts(input: unknown): BiographyFactValidation {
  const errors: string[] = [];
  let facts: BiographyFact[];

  try {
    facts = normalizeFacts(input);
  } catch (error) {
    return { ok: false, errors: [error instanceof Error ? error.message : '传记事实格式不正确。'] };
  }

  if (facts.length === 0) errors.push('至少需要一条预登记传记事实。');
  if (facts.length > MAX_FACTS) errors.push(`传记事实最多 ${MAX_FACTS} 条。`);

  const ids = new Set<string>();
  for (const rawFact of facts) {
    if (!isRecord(rawFact)) {
      errors.push('传记事实格式不正确。');
      continue;
    }

    const id = rawFact.id;
    const idLabel = typeof id === 'string' && id.trim() ? id : '未命名';
    if (ids.has(idLabel)) errors.push(`事实 ID 不得重复：${idLabel}。`);
    if (typeof id === 'string' && id.trim()) ids.add(id);

    if (!isNonEmptyText(rawFact.personId)) errors.push(`事实 ${idLabel} 必须填写 personId。`);
    if (!isNonEmptyText(rawFact.description)) errors.push(`事实 ${idLabel} 必须填写中性描述。`);
    if (isNonEmptyText(rawFact.description) && rawFact.description.length > MAX_TEXT_LENGTH) {
      errors.push(`事实 ${idLabel} 的描述不能超过 ${MAX_TEXT_LENGTH} 字。`);
    }
    if (!isHttpUrl(rawFact.sourceUrl)) errors.push(`事实 ${idLabel} 的来源链接必须是 http(s) URL。`);
    if (!isOneOf(BIOGRAPHY_CATEGORIES, rawFact.category)) errors.push(`事实 ${idLabel} 的类别不受支持。`);
    if (!isOneOf(BIOGRAPHY_SOURCE_GRADES, rawFact.sourceGrade)) errors.push(`事实 ${idLabel} 的来源等级不受支持。`);
    if (!isOneOf(BIOGRAPHY_DISTINCTIVENESS, rawFact.distinctiveness)) errors.push(`事实 ${idLabel} 的区分度不受支持。`);
    if (rawFact.preRegistered !== true) errors.push(`事实 ${idLabel} 必须在报告生成前登记。`);

    if (
      rawFact.eventYear !== undefined &&
      (typeof rawFact.eventYear !== 'number' || !Number.isInteger(rawFact.eventYear) || rawFact.eventYear < 1800 || rawFact.eventYear > new Date().getFullYear() + 1)
    ) {
      errors.push(`事实 ${idLabel} 的年份必须在 1800 年至明年之间。`);
    }
  }

  if (errors.length > 0) return { ok: false, errors: Array.from(new Set(errors)) };
  return { ok: true, value: facts };
}

function assertValidReviews(facts: BiographyFact[], reviews: BiographyReview[]) {
  const factIds = new Set(facts.map((fact) => fact.id));
  const reviewCounts = new Map<string, number>();

  for (const review of reviews) {
    if (!factIds.has(review.factId)) throw new Error(`盲评引用了不存在的事实：${review.factId}。`);
    if (!BIOGRAPHY_REVIEW_LABELS.includes(review.label)) throw new Error(`盲评标签不受支持：${review.label}。`);
    reviewCounts.set(review.factId, (reviewCounts.get(review.factId) || 0) + 1);
  }

  if (reviews.length !== facts.length || facts.some((fact) => reviewCounts.get(fact.id) !== 1)) {
    throw new Error('每条事实都必须有且只有一条盲评标签。');
  }
}

export function scoreBiographyReview(facts: BiographyFact[], reviews: BiographyReview[]): BiographyValidationScore {
  const validation = validateBiographyFacts(facts);
  if (!validation.ok) throw new Error(validation.errors.join('；'));
  assertValidReviews(validation.value, reviews);

  const firstPersonId = validation.value[0].personId;
  if (validation.value.some((fact) => fact.personId !== firstPersonId)) {
    throw new Error('一次盲评只能包含同一 personId 的传记事实。');
  }

  const reviewByFact = new Map(reviews.map((review) => [review.factId, review]));
  const counts: BiographyValidationScore['counts'] = {
    total: facts.length,
    match: 0,
    mismatch: 0,
    neutral: 0,
    unscorable: 0,
  };
  const weights: BiographyValidationScore['weights'] = {
    total: 0,
    reviewed: 0,
    match: 0,
    mismatch: 0,
    neutral: 0,
    unscorable: 0,
  };

  for (const fact of validation.value) {
    const weight = DISTINCTIVENESS_WEIGHT[fact.distinctiveness];
    const label = reviewByFact.get(fact.id)!.label;
    counts[label] += 1;
    weights.total += weight;
    weights[label] += weight;
    if (label !== 'unscorable') weights.reviewed += weight;
  }

  const scoreDenominator = weights.match + weights.mismatch + weights.neutral;
  return {
    personId: firstPersonId,
    counts,
    weights,
    observedFitScore: scoreDenominator === 0 ? null : Math.round((weights.match / scoreDenominator) * 100),
    coveragePercent: weights.total === 0 ? 0 : Math.round((weights.reviewed / weights.total) * 100),
    unscorablePercent: weights.total === 0 ? 0 : Math.round((weights.unscorable / weights.total) * 100),
    contradictionPercent: weights.reviewed === 0 ? 0 : Math.round((weights.mismatch / weights.reviewed) * 100),
  };
}
