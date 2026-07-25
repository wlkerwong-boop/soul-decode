// ═══════════════════════════════════════
// 九宫姓名学 · 精准计算引擎 v2
// 基于康熙字典笔画 + 标准五格剖象法 + 90年运势
// ═══════════════════════════════════════

// ── 部首特殊笔画映射（必须优先于本字查询）──
// 这些部首在康熙字典中以繁体部首计算笔画
const RADICAL_MAP: Record<string, { pattern: string; strokes: number; pos: 'left'|'right'|'any' }> = {
  '氵': { pattern: '氵', strokes: 4, pos: 'left' },   // 水部 → 4
  '扌': { pattern: '扌', strokes: 4, pos: 'left' },   // 手部 → 4
  '忄': { pattern: '忄', strokes: 4, pos: 'left' },   // 心部 → 4
  '犭': { pattern: '犭', strokes: 4, pos: 'left' },   // 犬部 → 4
  '王': { pattern: '王', strokes: 5, pos: 'left' },   // 玉部 → 5（仅部首位置）
  '礻': { pattern: '礻', strokes: 5, pos: 'left' },   // 示部 → 5
  '衤': { pattern: '衤', strokes: 6, pos: 'left' },   // 衣部 → 6
  '月': { pattern: '月', strokes: 6, pos: 'left' },   // 肉部 → 6（仅部首位置）
  '艹': { pattern: '艹', strokes: 6, pos: 'any' },    // 艸部 → 6
  '辶': { pattern: '辶', strokes: 7, pos: 'any' },    // 辵部 → 7
  '阝L':{ pattern: '阝', strokes: 8, pos: 'left' },   // 阜部(左耳) → 8
  '阝R':{ pattern: '阝', strokes: 7, pos: 'right' },  // 邑部(右耳) → 7
};

// ── 康熙字典笔画数据（从 CSV 构建，运行时加载）──
let kangxiMap: Map<string, number> | null = null;

// 数字笔画映射
const DIGIT_STROKES: Record<string, number> = {
  '一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,
  '零':13,'百':6,'千':3,'万':15,'亿':15,
};

// ========== 笔画查询 ==========

/** 获取单个汉字的康熙笔画 */
function getKangxiStroke(char: string): number {
  // 0. 数字直接返回
  if (DIGIT_STROKES[char]) return DIGIT_STROKES[char];
  
  // 1. 查康熙字典
  if (kangxiMap && kangxiMap.has(char)) {
    return kangxiMap.get(char)!;
  }
  
  // 2. fallback: Unicode 范围估算
  const code = char.charCodeAt(0);
  if (code >= 0x4e00 && code <= 0x9fff) return 10;
  return 1;
}

/** 处理部首特殊笔画——拆分一个字为部首+剩余部分 */
function decomposeChar(char: string): { radical: string; remainder: string } | null {
  if (char.length !== 1) return null;
  
  // 检查左偏旁
  for (const [key, rule] of Object.entries(RADICAL_MAP)) {
    if (key === '阝R') continue; // 右耳单独处理
    if (rule.pos === 'left' && char.startsWith(rule.pattern)) {
      return { radical: rule.pattern, remainder: char.slice(1) };
    }
    if (rule.pos === 'any' && char.includes(rule.pattern)) {
      const idx = char.indexOf(rule.pattern);
      return { radical: rule.pattern, remainder: char.slice(0, idx) + char.slice(idx + rule.pattern.length) };
    }
  }
  
  // 右耳旁
  if (char.endsWith('阝')) {
    return { radical: '阝R', remainder: char.slice(0, -1) };
  }
  
  return null;
}

/** 获取部首笔画（含特殊规则） */
function getRadicalStroke(radicalKey: string): number {
  const rule = Object.values(RADICAL_MAP).find(r => r.pattern === radicalKey.replace('R',''));
  if (!rule) return 0;
  if (radicalKey === '阝R') return 7;  // 右耳=7
  if (radicalKey === '阝L') return 8;  // 左耳=8
  return rule.strokes;
}

/** 获取姓名中某个字的准确笔画（含部首拆分） */
export function getStroke(char: string): number {
  // 先尝试部首拆分
  const decomp = decomposeChar(char);
  if (decomp) {
    const radStroke = getRadicalStroke(decomp.radical);
    const remStroke = kangxiMap?.get(decomp.remainder) ?? getKangxiStroke(decomp.remainder);
    return radStroke + remStroke;
  }
  return getKangxiStroke(char);
}

// ========== 五格计算 ==========

export interface WuGe {
  tian: number; ren: number; di: number; zong: number; wai: number;
  tianWx: string; renWx: string; diWx: string;
  sancai: string;
  renGeNum: number; // 人格数理（个位缩简）
}

const WUXING_MAP = ['水','木','木','火','火','土','土','金','金','水'];
function getWuxing(n: number): string { return WUXING_MAP[n % 10]; }

export function calcWuGe(name: string): WuGe {
  const chars = [...name.replace(/\s/g, '')];
  if (chars.length < 2) {
    return { tian: 1, ren: 1, di: 1, zong: 1, wai: 1, tianWx:'水',renWx:'水',diWx:'水', sancai:'数据不足', renGeNum: 1 };
  }
  
  const isSingleSurname = true; // 默认单姓处理，复姓需额外判断
  const hasDoubleGivenName = chars.length >= 3;
  
  const surname = chars[0];                    // 姓
  const surnameStroke = getStroke(surname);
  const givenStrokes = chars.slice(1).map(getStroke);
  const givenSum = givenStrokes.reduce((a,b)=>a+b, 0);
  const givenFirst = givenStrokes[0];
  const givenLast = givenStrokes[givenStrokes.length - 1];
  
  // 天格: 单姓=姓+1, 复姓=姓两字之和
  const tian = surnameStroke + 1;
  
  // 人格: 单姓=姓+名首字, 复姓=姓末字+名首字
  const ren = surnameStroke + givenFirst;
  
  // 地格: 双字名=两字和, 单字名=名+1
  const di = hasDoubleGivenName ? givenSum : givenFirst + 1;
  
  // 总格: 全名笔画和
  const zong = surnameStroke + givenSum;
  
  // 外格: 单姓双名=总格-人格+1, 单姓单名=2, 复姓双名=姓首字+名末字
  const wai = hasDoubleGivenName ? zong - ren + 1 : 2;
  
  // 五行
  const tianWx = getWuxing(tian);
  const renWx = getWuxing(ren);
  const diWx = getWuxing(di);
  
  // 三才简评
  const wxOrder: Record<string,number> = {'木':1,'火':2,'土':3,'金':4,'水':5};
  const t = wxOrder[tianWx]||0, r = wxOrder[renWx]||0, d = wxOrder[diWx]||0;
  let sancai = `${tianWx}${renWx}${diWx} · `;
  if ((t+1)%5+1===r) sancai += '天生人，长辈提携';
  else if (t===r) sancai += '天人比和，根基稳固';
  else if ((r+1)%5+1===t) sancai += '人克天，独立开创';
  else sancai += '需调和天地';
  
  return { tian, ren, di, zong, wai, tianWx, renWx, diWx, sancai, renGeNum: ren % 10 || 10 };
}

// ========== 岁值星 ==========
const SUIZHI: Array<{star:string;desc:string}> = [
  {star:'将星',desc:'掌统御使命。今年适合担任领导角色，大胆决策。'},
  {star:'权星',desc:'带动星，掌权力。冥冥中碰到掌握权力的机会，把握表现。'},
  {star:'空亡星',desc:'逢红鸾，思绪波动。容易判断失误，适合静心内省。'},
  {star:'车星',desc:'追风家族，掌动力使命。活力速度，适合开拓新领域。'},
  {star:'田宅星',desc:'福临家族，掌传达。口舌能力强，贵人多助。'},
  {star:'库星',desc:'禄存家族，掌积蓄。财运好，善于积累，稳扎稳打。'},
  {star:'孤星',desc:'天梁家族，掌孤独思考。研究型人才，独处中产出洞察。'},
  {star:'破军星',desc:'破军家族，破旧立新。勇于突破传统，变革之年。'},
  {star:'贵星',desc:'天相家族，贵人来助。人缘运佳，多社交多展示。'},
  {star:'文星',desc:'文昌家族，文采风流。学运昌隆，适合学习进修。'},
];

export function calcSuiZhi(birthYear: number) {
  const xuSui = new Date().getFullYear() - birthYear + 1;
  const s = SUIZHI[xuSui % 10];
  return { xuSui, star: s.star, desc: s.desc };
}

// ========== 十大特质（总格个位数） ==========
const TEZHI: Record<number,{number:number;name:string;desc:string;element:string}> = {
  0:{number:0,name:'将星',desc:'紫微家族，统御使命。格局大，天生领袖。',element:'金'},
  1:{number:1,name:'权星',desc:'紫金家族，管理使命。有掌权欲望，带动力强。',element:'木'},
  2:{number:2,name:'相星',desc:'司文家族，辅佐使命。能说能写，完美规划。',element:'木'},
  3:{number:3,name:'车星',desc:'追风家族，动力使命。活力十足，行动派。',element:'火'},
  4:{number:4,name:'田宅星',desc:'福临家族，传达使命。口舌好，贵人助。',element:'火'},
  5:{number:5,name:'库星',desc:'禄存家族，积蓄功能。财运好，踏实稳健。',element:'土'},
  6:{number:6,name:'孤星',desc:'天梁家族，孤独思考。研究型，洞察力惊人。',element:'土'},
  7:{number:7,name:'破军星',desc:'破军家族，破旧立新。变革者，创业家。',element:'金'},
  8:{number:8,name:'贵星',desc:'天相家族，贵人来助。人缘好，社交型。',element:'金'},
  9:{number:9,name:'文星',desc:'文昌家族，文采风流。学习力强，学术型。',element:'水'},
};

export function calcTeZhi(zongGe: number) {
  return TEZHI[zongGe % 10] || TEZHI[5];
}

// ========== 九宫气场 ==========
const JIUGONG_BASE = [[4,9,2],[3,5,7],[8,1,6]];
const JIUGONG_NAME: Record<number,string> = {
  1:'坎·水',2:'坤·土',3:'震·木',4:'巽·木',
  5:'中·土',6:'乾·金',7:'兑·金',8:'艮·土',9:'离·火'
};

export function calcJiuGong(name: string, birthYear: number): {grid:number[][];renPos:[number,number];labels:any[]} {
  const chars = [...name.replace(/\s/g,'')];
  const totalStroke = chars.reduce((a,c)=>a+getStroke(c), 0);
  const renGe = chars.length>=2 ? getStroke(chars[0])+getStroke(chars[1]) : totalStroke;
  const renNum = (renGe-1)%9+1; // 1-9
  
  const grid = JIUGONG_BASE.map(row => row.map(n => ((n + totalStroke + birthYear%100 -1)%9)+1));
  
  // 找人格位置
  let best:[number,number]=[1,1], bestDist=Infinity;
  for(let i=0;i<3;i++) for(let j=0;j<3;j++) {
    const d=Math.abs(grid[i][j]-renNum);
    if(d<bestDist){bestDist=d;best=[i,j];}
  }
  
  const labels = grid.flatMap((row,i)=>row.map((n,j)=>({
    row:i,col:j,num:n,baseNum:JIUGONG_BASE[i][j],name:JIUGONG_NAME[JIUGONG_BASE[i][j]]||''
  })));
  
  return {grid,renPos:best,labels};
}

// ========== 90年运势（从 Excel 数据构建） ==========
export interface LifeYear {
  age: number;
  group: string;
  trend: string;
  chance: string;
  yuncheng: string;
  gua: string;
  koujue: string;
  jiedu: string;
}

let life90Data: LifeYear[] | null = null;

export function setLife90Data(data: LifeYear[]) { life90Data = data; }

export function getLifeYear(age: number): LifeYear | null {
  if (!life90Data || age < 1 || age > 90) return null;
  return life90Data[age - 1];
}

export function getLifeDecade(age: number): LifeYear[] {
  if (!life90Data) return [];
  const start = Math.floor((age-1)/9)*9;
  return life90Data.slice(start, start+9);
}

// ========== 主入口 ==========
export interface JiugongResult {
  wuge: WuGe;
  jiugong: {grid:number[][];renPos:[number,number];labels:any[]};
  tezhi: {number:number;name:string;desc:string;element:string};
  suizhi: {xuSui:number;star:string;desc:string};
  totalStroke: number;
  lifeDecade: LifeYear[];
}

export function calcJiugong(name: string, year: number): JiugongResult {
  const wuge = calcWuGe(name);
  const jiugong = calcJiuGong(name, year);
  const suizhi = calcSuiZhi(year);
  const total = [...name.replace(/\s/g,'')].reduce((a,c)=>a+getStroke(c), 0);
  const tezhi = calcTeZhi(wuge.zong);
  const lifeDecade = getLifeDecade(suizhi.xuSui);
  
  return { wuge, jiugong, tezhi, suizhi, totalStroke: total, lifeDecade };
}

/** 加载康熙字典数据 */
export async function loadKangxiDict(): Promise<void> {
  if (kangxiMap) return;
  const resp = await fetch('/data/kangxi-strokes.json');
  const data: Record<string,number> = await resp.json();
  kangxiMap = new Map(Object.entries(data));
}

/** 加载90年运势数据 */
export async function loadLife90Data(): Promise<void> {
  if (life90Data) return;
  const resp = await fetch('/data/jiugong-life90.json');
  life90Data = await resp.json();
}
