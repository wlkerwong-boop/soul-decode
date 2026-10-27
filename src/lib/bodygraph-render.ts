import { CENTER_GEOMETRY, CHANNEL_PAIRS, GATE_CENTER, GATE_POINTS, GATE_RADIUS } from './bodygraph-geometry';

type Input = { definedCenters?: string[]; activatedGates?: number[]; channels?: string[] };
const names: Record<string, string> = {
  head: 'Head', ajna: 'Ajna', throat: 'Throat', g: 'G', heart: 'Ego',
  sacral: 'Sacral', spleen: 'Spleen', 'solar-plexus': 'Solar Plexus', root: 'Root',
};
const fills: Record<string, string> = {
  head: '#e8c66f', ajna: '#91b7a0', throat: '#c9a27e', g: '#edcd72',
  heart: '#d98878', sacral: '#df8d7e', spleen: '#c6a17f',
  'solar-plexus': '#c6a17f', root: '#c6a17f',
};

/** Generate a self-contained SVG from calculated facts; no birth data leaves the app. */
export function renderBodygraph(input: Input, print = false): string {
  const active = new Set((input.activatedGates || []).filter(g => Number.isInteger(g) && g >= 1 && g <= 64));
  const defined = new Set(input.definedCenters || []);
  const lines = CHANNEL_PAIRS.map(([a,b]) => {
    const p = GATE_POINTS[a], q = GATE_POINTS[b];
    const x = (p.x + q.x) / 2, y = (p.y + q.y) / 2;
    const base = `<line data-channel="${a}-${b}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="#c7bcb0" stroke-width="4.8"/>`;
    const half = (gate: number, other: number, v: typeof p) => active.has(gate)
      ? `<line data-half="${gate}-${other}" x1="${v.x}" y1="${v.y}" x2="${x}" y2="${y}" stroke="#785c38" stroke-width="4.8"/>` : '';
    return base + half(a,b,p) + half(b,a,q);
  }).join('');
  const centers = CENTER_GEOMETRY.map(c => {
    const isDefined = defined.has(names[c.id]);
    const points = c.points.map(p => `${p.x},${p.y}`).join(' ');
    return `<polygon data-center-shape="${names[c.id]}" data-defined="${isDefined}" points="${points}" fill="${isDefined ? fills[c.id] : '#fffdf9'}" stroke="#746c61" stroke-width="2" stroke-linejoin="round"/>`;
  }).join('');
  const gates = Object.entries(GATE_POINTS).map(([key,p]) => {
    const gate = Number(key), isActive = active.has(gate);
    return `<g data-gate="${gate}" data-center="${names[GATE_CENTER[gate]]}" data-active="${isActive}"><circle cx="${p.x}" cy="${p.y}" r="${GATE_RADIUS}" fill="${isActive ? '#6d5134' : '#fffdf9'}" stroke="${isActive ? '#6d5134' : '#a69b8c'}" stroke-width="1.1"/><text x="${p.x}" y="${p.y + 2.7}" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="700" fill="${isActive ? '#fff' : '#514940'}">${gate}</text></g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 676" role="img" aria-label="人类图，展示九大中心、通道及六十四闸门"><rect width="432" height="676" rx="16" fill="${print ? '#fff' : '#fbf8f2'}"/><text x="216" y="25" text-anchor="middle" fill="#806b4d" font-family="sans-serif" font-size="12" letter-spacing="2">BODYGRAPH · 人类图</text><g transform="translate(0 36)">${lines}${centers}${gates}</g><text x="216" y="664" text-anchor="middle" fill="#766c60" font-family="sans-serif" font-size="10">深色闸门与线段为已激活 · 有色中心为已定义</text></svg>`;
}
