type Point = { x: number; y: number; shape: string; w: number; h: number };

const COLORS = {
  paper: '#FBF8F2',
  paperDeep: '#F3EBDD',
  ink: '#332D26',
  muted: '#766C60',
  faint: '#A09689',
  gold: '#A8843C',
  line: '#D8CCBC',
  defined: '#EAD9B9',
};

const esc = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const text = (x: number, y: number, value: unknown, opts: string = '') =>
  `<text x="${x}" y="${y}" ${opts}>${esc(value)}</text>`;

const centers: Record<string, Point> = {
  Head: { x: 200, y: 15, shape: 'triangle-down', w: 60, h: 35 },
  Ajna: { x: 200, y: 70, shape: 'diamond', w: 60, h: 40 },
  Throat: { x: 200, y: 135, shape: 'triangle', w: 80, h: 40 },
  G: { x: 200, y: 200, shape: 'diamond', w: 50, h: 35 },
  Ego: { x: 285, y: 225, shape: 'square', w: 30, h: 25 },
  Sacral: { x: 200, y: 275, shape: 'square', w: 55, h: 40 },
  'Solar Plexus': { x: 270, y: 310, shape: 'triangle', w: 40, h: 30 },
  Spleen: { x: 115, y: 270, shape: 'triangle', w: 40, h: 30 },
  Root: { x: 200, y: 365, shape: 'square', w: 50, h: 40 },
};

const centerNames: Record<string, string> = {
  Head: '顶轮', Ajna: '眉心', Throat: '喉咙', G: 'G中心', Ego: '意志',
  Sacral: '荐骨', 'Solar Plexus': '情绪', Spleen: '脾脏', Root: '根部',
};

const gateCenter: Record<number, string> = {
  61: 'Head', 63: 'Head', 64: 'Head', 4: 'Ajna', 11: 'Ajna', 17: 'Ajna', 24: 'Ajna', 43: 'Ajna', 47: 'Ajna',
  8: 'Throat', 12: 'Throat', 16: 'Throat', 20: 'Throat', 23: 'Throat', 31: 'Throat', 33: 'Throat', 35: 'Throat', 45: 'Throat', 56: 'Throat', 62: 'Throat',
  1: 'G', 2: 'G', 7: 'G', 10: 'G', 13: 'G', 15: 'G', 25: 'G', 46: 'G', 21: 'Ego', 26: 'Ego', 40: 'Ego', 51: 'Ego',
  3: 'Sacral', 5: 'Sacral', 6: 'Sacral', 9: 'Sacral', 14: 'Sacral', 27: 'Sacral', 29: 'Sacral', 34: 'Sacral', 42: 'Sacral', 59: 'Sacral',
  19: 'Solar Plexus', 22: 'Solar Plexus', 30: 'Solar Plexus', 36: 'Solar Plexus', 37: 'Solar Plexus', 49: 'Solar Plexus', 55: 'Solar Plexus',
  18: 'Spleen', 28: 'Spleen', 32: 'Spleen', 44: 'Spleen', 48: 'Spleen', 50: 'Spleen', 57: 'Spleen',
  39: 'Root', 41: 'Root', 52: 'Root', 53: 'Root', 54: 'Root', 58: 'Root', 60: 'Root',
};

const channels: Record<string, [string, string]> = {
  '1-8': ['G', 'Throat'], '2-14': ['G', 'Sacral'], '3-60': ['Sacral', 'Root'], '4-63': ['Sacral', 'Head'], '5-15': ['Sacral', 'G'], '6-59': ['Sacral', 'Solar Plexus'],
  '7-31': ['G', 'Throat'], '9-52': ['Sacral', 'Root'], '10-20': ['G', 'Throat'], '10-34': ['G', 'Sacral'], '11-56': ['Ajna', 'Throat'], '12-22': ['Throat', 'Solar Plexus'],
  '13-33': ['G', 'Throat'], '16-48': ['Throat', 'Spleen'], '17-62': ['Ajna', 'Throat'], '18-58': ['Spleen', 'Root'], '19-49': ['Root', 'Solar Plexus'], '20-34': ['Throat', 'Sacral'],
  '21-45': ['Ego', 'Throat'], '23-43': ['Throat', 'Ajna'], '24-61': ['Ajna', 'Head'], '25-51': ['G', 'Ego'], '26-44': ['Ego', 'Spleen'], '27-50': ['Sacral', 'Spleen'],
  '28-38': ['Spleen', 'Root'], '29-46': ['Sacral', 'G'], '30-41': ['Solar Plexus', 'Root'], '32-54': ['Spleen', 'Root'], '35-36': ['Throat', 'Solar Plexus'], '37-40': ['Solar Plexus', 'Ego'],
  '39-55': ['Root', 'Solar Plexus'], '42-53': ['Sacral', 'Root'], '47-64': ['Ajna', 'Head'], '57-34': ['Spleen', 'Sacral'], '59-6': ['Sacral', 'Solar Plexus'],
};

const gateOffset: Record<number, [number, number]> = {
  61: [0, -12], 63: [0, 12], 64: [0, 0], 11: [-20, -12], 17: [20, -12], 24: [-20, 12], 43: [20, 12], 47: [0, 0],
  8: [-30, -15], 12: [30, -15], 16: [-30, 0], 20: [30, 0], 23: [-30, 15], 31: [30, 15], 33: [0, -15], 35: [0, 15],
  1: [-12, -12], 2: [12, -12], 7: [-12, 12], 10: [12, 12], 13: [0, -12], 15: [0, 12], 21: [0, -12], 26: [0, 12], 40: [0, 0], 51: [0, 0],
  3: [-20, -15], 4: [20, -15], 5: [-20, 0], 6: [20, 0], 9: [-20, 15], 14: [20, 15], 27: [0, -15], 29: [0, 15], 34: [0, 0], 42: [0, 0], 59: [0, 0],
  19: [-12, -10], 22: [12, -10], 30: [-12, 10], 36: [12, 10], 37: [0, -10], 49: [0, 10], 18: [-12, -10], 28: [12, -10], 32: [-12, 10], 44: [12, 10], 48: [0, -10], 50: [0, 10], 57: [0, 0],
  39: [-15, -15], 41: [15, -15], 52: [-15, 0], 53: [15, 0], 54: [-15, 15], 58: [15, 15], 60: [0, 0],
};

const point = (p: Point) => ({ x: p.x, y: p.y + p.h / 2 });
const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const mx = Math.abs(b.x - a.x) / 1.5;
  const my = Math.abs(b.y - a.y) / 3;
  return `M${a.x},${a.y} C${a.x + mx},${a.y - my} ${b.x - mx},${b.y + my} ${b.x},${b.y}`;
};
const centerPath = (p: Point) => {
  if (p.shape === 'triangle') return `M${p.x},${p.y + p.h}L${p.x - p.w / 2},${p.y}L${p.x + p.w / 2},${p.y}Z`;
  if (p.shape === 'triangle-down') return `M${p.x},${p.y}L${p.x - p.w / 2},${p.y + p.h}L${p.x + p.w / 2},${p.y + p.h}Z`;
  if (p.shape === 'diamond') return `M${p.x},${p.y}L${p.x + p.w / 2},${p.y + p.h / 2}L${p.x},${p.y + p.h}L${p.x - p.w / 2},${p.y + p.h / 2}Z`;
  return `M${p.x - p.w / 2},${p.y}L${p.x + p.w / 2},${p.y}L${p.x + p.w / 2},${p.y + p.h}L${p.x - p.w / 2},${p.y + p.h}Z`;
};

export function humanDesignSvg(hd: any): string | null {
  if (!hd) return null;
  const defined = new Set<string>(hd.definedCenters || []);
  const normalizeChannel = (value: string) => value.split('-').map(Number).sort((a, b) => a - b).join('-');
  const active = new Set<string>((hd.channels || []).map(normalizeChannel));
  const inactive = Object.entries(channels).filter(([key]) => !active.has(normalizeChannel(key)));
  const activePaths = (hd.channels || []).filter((key: string) => channels[key] || Object.keys(channels).some((candidate) => normalizeChannel(candidate) === normalizeChannel(key))).map((key: string) => {
    const entry = channels[key] || channels[Object.keys(channels).find((candidate) => normalizeChannel(candidate) === normalizeChannel(key)) || ''];
    if (!entry) return '';
    const [a, b] = entry;
    return `<path d="${curve(point(centers[a]), point(centers[b]))}" fill="none" stroke="${COLORS.gold}" stroke-width="4" stroke-linecap="round" opacity=".9"/>`;
  }).join('');
  const inactivePaths = inactive.map(([, [a, b]]) => `<path d="${curve(point(centers[a]), point(centers[b]))}" fill="none" stroke="#D8D0C4" stroke-width="1.1" stroke-dasharray="3,5" stroke-linecap="round"/>`).join('');
  const shapes = Object.entries(centers).map(([name, p]) => `<path d="${centerPath(p)}" fill="${defined.has(name) ? COLORS.defined : '#FAF7F1'}" stroke="${defined.has(name) ? '#6E5A36' : '#A09689'}" stroke-width="${defined.has(name) ? 2.5 : 1}" stroke-linejoin="round"/>`).join('');
  const gates = (hd.activatedGates || []).map((gate: number) => {
    const name = gateCenter[gate]; const p = name && centers[name]; const offset = gateOffset[gate];
    if (!p || !offset) return '';
    return text(p.x + offset[0], p.y + p.h / 2 + offset[1], gate, `text-anchor="middle" fill="${COLORS.ink}" font-size="10.5" font-weight="700" font-family="Songti SC, PingFang SC, sans-serif"`);
  }).join('');
  const labels = Object.entries(centers).map(([name, p]) => text(p.x, name === 'Root' ? p.y - 6 : p.y + p.h + 13, centerNames[name], `text-anchor="middle" fill="${defined.has(name) ? COLORS.ink : COLORS.muted}" font-size="8.5" font-family="Songti SC, PingFang SC, sans-serif"`)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 430"><rect width="400" height="430" rx="14" fill="${COLORS.paper}"/>${text(22, 28, 'BODYGRAPH · 人类图', `fill="${COLORS.gold}" font-size="10" font-weight="700" letter-spacing="2" font-family="Songti SC, PingFang SC, sans-serif"`)}${text(378, 28, '九大中心 · 通道 · 闸门', `text-anchor="end" fill="${COLORS.muted}" font-size="9" font-family="Songti SC, PingFang SC, sans-serif"`)}<g transform="translate(0 22)">${inactivePaths}${activePaths}${shapes}${gates}${labels}</g>${text(37, 410, '● 已定义', `fill="${COLORS.muted}" font-size="9" font-family="Songti SC, PingFang SC, sans-serif"`)}${text(105, 410, '○ 开放', `fill="${COLORS.muted}" font-size="9" font-family="Songti SC, PingFang SC, sans-serif"`)}</svg>`;
}

const elementColors: Record<string, string> = { 木: '#75A88A', 火: '#D85D4D', 土: '#B98738', 金: '#B5AA98', 水: '#5D87B7' };
const elementOrder = ['木', '火', '土', '金', '水'];
const elementByCharacter: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

export function baziSvg(bazi: any): string | null {
  if (!bazi) return null;
  const pillars = bazi.pillars || [];
  const elements = bazi.ganElements || bazi.elements || [];
  const distribution = bazi.elementDistribution || pillars.flatMap((pillar: string) => String(pillar || '').split('')).reduce((out: Record<string, number>, character: string) => {
    const element = elementByCharacter[character];
    if (element) out[element] = (out[element] || 0) + 1;
    return out;
  }, {});
  const cols = pillars.map((pillar: string, i: number) => {
    const stem = String(pillar || '').slice(0, 1); const branch = String(pillar || '').slice(1, 2); const color = elementColors[elements[i]] || COLORS.gold;
    const x = 36 + i * 134;
    return `<g><rect x="${x}" y="96" width="116" height="34" rx="7" fill="${i === 2 ? '#F3E7CB' : '#F1E8DA'}" stroke="${i === 2 ? COLORS.gold : '#D7C9B6'}"/><text x="${x + 58}" y="119" text-anchor="middle" fill="${COLORS.muted}" font-size="10" font-weight="700" font-family="Songti SC, PingFang SC, sans-serif">${['年柱', '月柱', '日柱', '时柱'][i]}</text><rect x="${x}" y="140" width="116" height="62" rx="9" fill="${COLORS.paper}" stroke="${color}" stroke-width="${i === 2 ? 2.5 : 1.5}"/><text x="${x + 58}" y="181" text-anchor="middle" fill="${color}" font-size="31" font-weight="700" font-family="Songti SC, PingFang SC, sans-serif">${esc(stem || '—')}</text><text x="${x + 58}" y="220" text-anchor="middle" fill="${COLORS.faint}" font-size="9" font-family="Songti SC, PingFang SC, sans-serif">天干</text><rect x="${x}" y="230" width="116" height="48" rx="9" fill="#FCFAF5" stroke="#D7C9B6"/><text x="${x + 58}" y="262" text-anchor="middle" fill="${COLORS.ink}" font-size="24" font-family="Songti SC, PingFang SC, sans-serif">${esc(branch || '—')}</text></g>`;
  }).join('');
  const legend = elementOrder.map((el, i) => {
    const val = Number(distribution[el] || 0); const total = Object.values(distribution).reduce((a: number, b: any) => a + Number(b || 0), 0) || 1; const pct = Math.round((val / total) * 100);
    return `<circle cx="${104 + i * 106}" cy="292" r="4" fill="${elementColors[el]}"/>${text(113 + i * 106, 296, `${el} ${pct}%`, `fill="${COLORS.muted}" font-size="9" font-family="Songti SC, PingFang SC, sans-serif"`)}`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 330"><rect width="640" height="330" rx="14" fill="${COLORS.paper}"/>${text(24, 28, 'FOUR PILLARS · 八字四柱', `fill="${COLORS.gold}" font-size="10" font-weight="700" letter-spacing="2" font-family="Songti SC, PingFang SC, sans-serif"`)}${text(616, 28, '日主 · 五行 · 四柱', `text-anchor="end" fill="${COLORS.faint}" font-size="9" font-family="Songti SC, PingFang SC, sans-serif"`)}${text(320, 66, '日主', `text-anchor="middle" fill="${COLORS.muted}" font-size="10" font-family="Songti SC, PingFang SC, sans-serif"`)}${text(320, 93, bazi.dayMaster || '—', `text-anchor="middle" fill="${COLORS.ink}" font-size="24" font-weight="700" font-family="Songti SC, PingFang SC, sans-serif"`)}${cols}${text(36, 296, '五行分布', `fill="${COLORS.muted}" font-size="9" font-family="Songti SC, PingFang SC, sans-serif"`)}${legend}</svg>`;
}

export function ziweiSvg(ziwei: any): string | null {
  if (!ziwei?.palaces?.length) return null;
  const names = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];
  const positions = [[0,0],[1,0],[2,0],[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3],[0,2],[0,1]];
  const cells = names.map((name, i) => {
    const p = ziwei.palaces[i] || { stars: [] }; const [col, row] = positions[i]; const x = col * 130 + 5; const y = row * 105 + 5;
    const palaceName = p.name || name;
    const starNames = (p.stars || []).map((star: any) => typeof star === 'string' ? star : star?.name).filter(Boolean);
    const stars = starNames.slice(0, 3).join('、');
    return `<rect x="${x}" y="${y}" width="120" height="95" rx="6" fill="${i === 0 ? '#F3E7CB' : COLORS.paper}" stroke="${i === 0 ? COLORS.gold : COLORS.line}" stroke-width="${i === 0 ? 2 : 1}"/>${text(x + 60, y + 20, palaceName, `text-anchor="middle" fill="${i === 0 ? COLORS.gold : COLORS.ink}" font-size="12" font-weight="700" font-family="Songti SC, PingFang SC, sans-serif"`)}${text(x + 60, y + 43, stars || '无主星', `text-anchor="middle" fill="${COLORS.muted}" font-size="10" font-family="Songti SC, PingFang SC, sans-serif"`)}${text(x + 60, y + 61, starNames.slice(3, 6).join('、'), `text-anchor="middle" fill="${COLORS.muted}" font-size="9" font-family="Songti SC, PingFang SC, sans-serif"`)}`;
  }).join('');
  const h = ziwei.horoscope || {};
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 430"><rect width="520" height="430" rx="14" fill="${COLORS.paper}"/>${text(22, 28, 'TWELVE PALACES · 紫微斗数', `fill="${COLORS.gold}" font-size="10" font-weight="700" letter-spacing="2" font-family="Songti SC, PingFang SC, sans-serif"`)}<rect x="135" y="110" width="250" height="210" rx="12" fill="#F5EBDD" stroke="#DCC9AA"/>${text(260, 195, '命盘信息', `text-anchor="middle" fill="${COLORS.gold}" font-size="15" font-weight="700" font-family="Songti SC, PingFang SC, sans-serif"`)}${text(260, 220, h.mingZhu ? `命主：${h.mingZhu}` : '十二宫命盘', `text-anchor="middle" fill="${COLORS.muted}" font-size="11" font-family="Songti SC, PingFang SC, sans-serif"`)}${text(260, 242, h.shenZhu ? `身主：${h.shenZhu}` : '', `text-anchor="middle" fill="${COLORS.muted}" font-size="11" font-family="Songti SC, PingFang SC, sans-serif"`)}${text(260, 264, h.wuXing ? `五行局：${h.wuXing}` : '', `text-anchor="middle" fill="${COLORS.muted}" font-size="11" font-family="Songti SC, PingFang SC, sans-serif"`)}${cells}${text(260, 422, '默认展示主要星曜 · 详细信息见报告正文', `text-anchor="middle" fill="${COLORS.faint}" font-size="9" font-family="Songti SC, PingFang SC, sans-serif"`)}</svg>`;
}
