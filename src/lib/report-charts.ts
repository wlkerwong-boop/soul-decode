import { renderBodygraph } from './bodygraph-render';

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

export function humanDesignSvg(hd: any): string | null {
  return hd ? renderBodygraph(hd, true) : null;
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
