export const CHART_ATLAS_COLORS = {
  paper: '#FFFDF9',
  paperDeep: '#F5EDE0',
  ink: '#332D26',
  muted: '#766C60',
  faint: '#A09689',
  gold: '#A8843C',
  goldSoft: '#E9D9B8',
  elements: {
    金: '#B88927',
    木: '#5E8D68',
    水: '#4B83A5',
    火: '#B86B58',
    土: '#9A7351',
  } as Record<string, string>,
} as const;

export function formatPillar(pillar: string) {
  const chars = (pillar || '').trim().split('');
  return { stem: chars[0] || '', branch: chars[1] || '' };
}

export function getVisibleStars(stars: string[] = [], limit = 3) {
  return stars.filter(Boolean).slice(0, Math.max(0, limit));
}

export function getElementPercent(
  distribution: Record<string, number> = {},
  key: string,
) {
  const values = Object.values(distribution).map((value) => Number(value) || 0);
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!total) return 0;
  return Math.round(((Number(distribution[key]) || 0) / total) * 100);
}
