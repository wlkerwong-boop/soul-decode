/**
 * 梅花易数·起卦引擎
 *
 * 基于日期时间和数字起卦，计算本卦、变卦、互卦、体用生克
 */
export type Trigram = {
  name: string;       // 卦名
  symbol: string;     // 卦符 (三爻)
  element: string;    // 五行
  nature: string;     // 卦象
  direction: string;  // 方位
};

export type Hexagram = {
  name: string;
  code: number;       // 64卦序号
  upper: Trigram;
  lower: Trigram;
  lines: boolean[];   // 6爻，true=阳，false=阴
  judgment: string;   // 卦辞简释
};

export type PlumBlossomResult = {
  primary: Hexagram;          // 本卦
  changing: Hexagram | null;  // 变卦
  mutual: Hexagram | null;    // 互卦
  bodyTrigram: Trigram;       // 体卦
  useTrigram: Trigram;        // 用卦
  bodyUseRelation: string;    // 体用生克关系
  movingLine: number;         // 动爻位置(1-6)
  yearElement: string;        // 当年五行
  interpretation: string;     // 综合解读
  // 新增：京氏易体系
  sixRelations: string[];     // 六亲 (6爻对应的六亲)
  shiYing: { shi: number; ying: number };  // 世应位置
  nayinStem: string[];        // 纳甲天干
  nayinBranch: string[];      // 纳甲地支
};

// 八卦定义 (先天八卦序)
const TRIGRAMS: Trigram[] = [
  { name: '乾', symbol: '☰', element: '金', nature: '天', direction: '西北' },
  { name: '兑', symbol: '☱', element: '金', nature: '泽', direction: '西' },
  { name: '离', symbol: '☲', element: '火', nature: '火', direction: '南' },
  { name: '震', symbol: '☳', element: '木', nature: '雷', direction: '东' },
  { name: '巽', symbol: '☴', element: '木', nature: '风', direction: '东南' },
  { name: '坎', symbol: '☵', element: '水', nature: '水', direction: '北' },
  { name: '艮', symbol: '☶', element: '土', nature: '山', direction: '东北' },
  { name: '坤', symbol: '☷', element: '土', nature: '地', direction: '西南' },
];

// 先天八卦数 (乾1兑2离3震4巽5坎6艮7坤8)
const TRIGRAM_NUM: Record<string, number> = {
  '乾': 1, '兑': 2, '离': 3, '震': 4, '巽': 5, '坎': 6, '艮': 7, '坤': 8,
};

// 64卦名与卦辞 (按先天序)
const HEXAGRAM_NAMES: Record<number, { name: string; judgment: string }> = {
  1: { name: '乾为天', judgment: '元亨利贞。天行健，君子以自强不息。' },
  2: { name: '坤为地', judgment: '元亨，利牝马之贞。地势坤，君子以厚德载物。' },
  3: { name: '水雷屯', judgment: '元亨利贞。勿用有攸往，利建侯。' },
  4: { name: '山水蒙', judgment: '亨。匪我求童蒙，童蒙求我。' },
  5: { name: '水天需', judgment: '有孚，光亨，贞吉。利涉大川。' },
  6: { name: '天水讼', judgment: '有孚窒惕，中吉，终凶。利见大人，不利涉大川。' },
  7: { name: '地水师', judgment: '贞，丈人吉，无咎。' },
  8: { name: '水地比', judgment: '吉。原筮元永贞，无咎。不宁方来，后夫凶。' },
  9: { name: '风天小畜', judgment: '亨。密云不雨，自我西郊。' },
  10: { name: '天泽履', judgment: '履虎尾，不咥人，亨。' },
  11: { name: '地天泰', judgment: '小往大来，吉亨。' },
  12: { name: '天地否', judgment: '否之匪人，不利君子贞，大往小来。' },
  13: { name: '天火同人', judgment: '同人于野，亨。利涉大川，利君子贞。' },
  14: { name: '火天大有', judgment: '元亨。' },
  15: { name: '地山谦', judgment: '亨，君子有终。' },
  16: { name: '雷地豫', judgment: '利建侯行师。' },
  17: { name: '泽雷随', judgment: '元亨利贞，无咎。' },
  18: { name: '山风蛊', judgment: '元亨，利涉大川。先甲三日，后甲三日。' },
  19: { name: '地泽临', judgment: '元亨利贞。至于八月有凶。' },
  20: { name: '风地观', judgment: '盥而不荐，有孚颙若。' },
  21: { name: '火雷噬嗑', judgment: '亨，利用狱。' },
  22: { name: '山火贲', judgment: '亨。小利有攸往。' },
  23: { name: '山地剥', judgment: '不利有攸往。' },
  24: { name: '地雷复', judgment: '亨。出入无疾，朋来无咎。' },
  25: { name: '天雷无妄', judgment: '元亨利贞。其匪正有眚，不利有攸往。' },
  26: { name: '山天大畜', judgment: '利贞，不家食吉，利涉大川。' },
  27: { name: '山雷颐', judgment: '贞吉。观颐，自求口实。' },
  28: { name: '泽风大过', judgment: '栋桡，利有攸往，亨。' },
  29: { name: '坎为水', judgment: '习坎，有孚，维心亨，行有尚。' },
  30: { name: '离为火', judgment: '利贞，亨。畜牝牛，吉。' },
  31: { name: '泽山咸', judgment: '亨，利贞，取女吉。' },
  32: { name: '雷风恒', judgment: '亨，无咎，利贞，利有攸往。' },
  33: { name: '天山遁', judgment: '亨，小利贞。' },
  34: { name: '雷天大壮', judgment: '利贞。' },
  35: { name: '火地晋', judgment: '康侯用锡马蕃庶，昼日三接。' },
  36: { name: '地火明夷', judgment: '利艰贞。' },
  37: { name: '风火家人', judgment: '利女贞。' },
  38: { name: '火泽睽', judgment: '小事吉。' },
  39: { name: '水山蹇', judgment: '利西南，不利东北。利见大人，贞吉。' },
  40: { name: '雷水解', judgment: '利西南，无所往，其来复吉。有攸往，夙吉。' },
  41: { name: '山泽损', judgment: '有孚，元吉，无咎，可贞，利有攸往。' },
  42: { name: '风雷益', judgment: '利有攸往，利涉大川。' },
  43: { name: '泽天夬', judgment: '扬于王庭，孚号有厉。告自邑，不利即戎，利有攸往。' },
  44: { name: '天风姤', judgment: '女壮，勿用取女。' },
  45: { name: '泽地萃', judgment: '亨。王假有庙，利见大人，亨，利贞。' },
  46: { name: '地风升', judgment: '元亨，用见大人，勿恤，南征吉。' },
  47: { name: '泽水困', judgment: '亨，贞，大人吉，无咎。有言不信。' },
  48: { name: '水风井', judgment: '改邑不改井，无丧无得，往来井井。' },
  49: { name: '泽火革', judgment: '已日乃孚，元亨利贞，悔亡。' },
  50: { name: '火风鼎', judgment: '元吉，亨。' },
  51: { name: '震为雷', judgment: '亨。震来虩虩，笑言哑哑。震惊百里，不丧匕鬯。' },
  52: { name: '艮为山', judgment: '艮其背，不获其身，行其庭，不见其人，无咎。' },
  53: { name: '风山渐', judgment: '女归吉，利贞。' },
  54: { name: '雷泽归妹', judgment: '征凶，无攸利。' },
  55: { name: '雷火丰', judgment: '亨，王假之，勿忧，宜日中。' },
  56: { name: '火山旅', judgment: '旅小亨，旅贞吉。' },
  57: { name: '巽为风', judgment: '小亨，利有攸往，利见大人。' },
  58: { name: '兑为泽', judgment: '亨，利贞。' },
  59: { name: '风水涣', judgment: '亨。王假有庙，利涉大川，利贞。' },
  60: { name: '水泽节', judgment: '亨。苦节不可贞。' },
  61: { name: '风泽中孚', judgment: '豚鱼吉，利涉大川，利贞。' },
  62: { name: '雷山小过', judgment: '亨，利贞，可小事，不可大事。飞鸟遗之音。' },
  63: { name: '水火既济', judgment: '亨小，利贞。初吉终乱。' },
  64: { name: '火水未济', judgment: '亨。小狐汔济，濡其尾，无攸利。' },
};

// 体用生克关系
const BODY_USE_RELATIONS: Record<string, Record<string, string>> = {
  '木': { '木': '比和，吉', '火': '体生用，泄气', '土': '体克用，劳心', '金': '用克体，凶', '水': '用生体，吉' },
  '火': { '木': '用生体，吉', '火': '比和，吉', '土': '体生用，泄气', '金': '体克用，劳心', '水': '用克体，凶' },
  '土': { '木': '用克体，凶', '火': '用生体，吉', '土': '比和，吉', '金': '体生用，泄气', '水': '体克用，劳心' },
  '金': { '木': '体克用，劳心', '火': '用克体，凶', '土': '用生体，吉', '金': '比和，吉', '水': '体生用，泄气' },
  '水': { '木': '体生用，泄气', '火': '体克用，劳心', '土': '用克体，凶', '金': '用生体，吉', '水': '比和，吉' },
};

/**
 * 数字转八卦
 * 先天数: 乾1兑2离3震4巽5坎6艮7坤8
 */
function numToTrigram(num: number): Trigram {
  const idx = ((num - 1) % 8 + 8) % 8;
  return TRIGRAMS[idx];
}

/**
 * 根据上卦和下卦计算64卦序号
 */
function calcHexagramCode(upperIdx: number, lowerIdx: number): number {
  // 先天八卦序: 乾1兑2离3震4巽5坎6艮7坤8
  // 64卦中，上卦定前8卦一组，下卦定组内位置
  return (upperIdx - 1) * 8 + lowerIdx;
}

/**
 * 根据两个三爻卦生成六爻卦
 */
function combineTrigrams(upper: Trigram, lower: Trigram): { lines: boolean[]; code: number } {
  const upperIdx = TRIGRAM_NUM[upper.name];
  const lowerIdx = TRIGRAM_NUM[lower.name];

  // 6爻: 从下往上，1-3为下卦，4-6为上卦
  const lines: boolean[] = [];

  // 下卦三爻 (从下往上: 初爻、二爻、三爻)
  const lowerBits = lowerIdx - 1; // 0-7
  lines.push(Boolean(lowerBits & 0x01)); // 初爻
  lines.push(Boolean(lowerBits & 0x02)); // 二爻
  lines.push(Boolean(lowerBits & 0x04)); // 三爻

  // 上卦三爻 (四爻、五爻、上爻)
  const upperBits = upperIdx - 1;
  lines.push(Boolean(upperBits & 0x01)); // 四爻
  lines.push(Boolean(upperBits & 0x02)); // 五爻
  lines.push(Boolean(upperBits & 0x04)); // 上爻

  const code = calcHexagramCode(upperIdx, lowerIdx);
  return { lines, code };
}

/**
 * 获取互卦 (取本卦的2-4爻为下卦，3-5爻为上卦)
 */
function getMutualHexagram(lines: boolean[]): { upper: Trigram; lower: Trigram; code: number } {
  // 互卦下卦: 本卦的2、3、4爻
  const lowerBits = (lines[1] ? 0x01 : 0) | (lines[2] ? 0x02 : 0) | (lines[3] ? 0x04 : 0);
  // 互卦上卦: 本卦的3、4、5爻
  const upperBits = (lines[2] ? 0x01 : 0) | (lines[3] ? 0x02 : 0) | (lines[4] ? 0x04 : 0);

  const lower = TRIGRAMS[lowerBits % 8];
  const upper = TRIGRAMS[upperBits % 8];
  const code = calcHexagramCode(upperBits % 8 + 1, lowerBits % 8 + 1);

  return { upper, lower, code };
}

/**
 * 根据日期起卦（年月日时四数）
 */
export function divinateByDate(birthYear: number, birthMonth: number, birthDay: number, birthHour?: number): PlumBlossomResult {
  // 上卦: 年+月+日 之和除以8取余
  const upperNum = (birthYear + birthMonth + birthDay) % 8 || 8;
  // 下卦: 年+月+日+时 之和除以8取余
  const lowerNum = (birthYear + birthMonth + birthDay + (birthHour || 0)) % 8 || 8;
  // 动爻: 年+月+日+时 之和除以6取余
  const movingLine = ((birthYear + birthMonth + birthDay + (birthHour || 0)) % 6) || 6;

  return buildReading(upperNum, lowerNum, movingLine);
}

/**
 * 根据流年起卦（用于流年详批）
 */
export function divinateByYear(birthYear: number, birthMonth: number, birthDay: number, targetYear: number, birthHour?: number): PlumBlossomResult {
  const upperNum = (birthYear + birthMonth + birthDay) % 8 || 8;
  const lowerNum = (targetYear + birthMonth + birthDay) % 8 || 8;
  const movingLine = ((targetYear + birthMonth + birthDay + (birthHour || 0)) % 6) || 6;

  return buildReading(upperNum, lowerNum, movingLine);
}

/**
 * 根据两个自定义数字起卦
 */
export function divinateByNumbers(num1: number, num2: number): PlumBlossomResult {
  const upperNum = num1 % 8 || 8;
  const lowerNum = num2 % 8 || 8;
  const movingLine = ((num1 + num2) % 6) || 6;

  return buildReading(upperNum, lowerNum, movingLine);
}

/**
 * 构建完整的梅花易数解读
 */
function buildReading(upperNum: number, lowerNum: number, movingLine: number): PlumBlossomResult {
  const upperTrigram = numToTrigram(upperNum);
  const lowerTrigram = numToTrigram(lowerNum);

  // 本卦
  const { lines, code: primaryCode } = combineTrigrams(upperTrigram, lowerTrigram);
  const primaryHex = HEXAGRAM_NAMES[primaryCode] || { name: '未知', judgment: '' };

  // 变卦 (动爻阴阳互变)
  const changedLines = [...lines];
  changedLines[movingLine - 1] = !changedLines[movingLine - 1];

  // 计算变卦的上下卦
  const changedLowerBits = (changedLines[0] ? 0x01 : 0) | (changedLines[1] ? 0x02 : 0) | (changedLines[2] ? 0x04 : 0);
  const changedUpperBits = (changedLines[3] ? 0x01 : 0) | (changedLines[4] ? 0x02 : 0) | (changedLines[5] ? 0x04 : 0);
  const changedLower = TRIGRAMS[changedLowerBits % 8];
  const changedUpper = TRIGRAMS[changedUpperBits % 8];
  const changedCode = calcHexagramCode(changedUpperBits % 8 + 1, changedLowerBits % 8 + 1);
  const changedHex = HEXAGRAM_NAMES[changedCode] || { name: '未知', judgment: '' };

  const changingHexagram: Hexagram = {
    name: changedHex.name,
    code: changedCode,
    upper: changedUpper,
    lower: changedLower,
    lines: changedLines,
    judgment: changedHex.judgment,
  };

  // 互卦
  const mutual = getMutualHexagram(lines);
  const mutualHex = HEXAGRAM_NAMES[mutual.code] || { name: '未知', judgment: '' };
  const mutualHexagram: Hexagram = {
    name: mutualHex.name,
    code: mutual.code,
    upper: mutual.upper,
    lower: mutual.lower,
    lines: [...Array(6)].map((_, i) => {
      const bits = (i < 3 ? mutual.lower : mutual.upper);
      const idx = (i < 3 ? 0x01 : 0x01) << (i % 3);
      return Boolean(bits ? 1 : 0);
    }),
    judgment: mutualHex.judgment,
  };

  // 体用生克: 动爻所在的卦为用卦，另一个为体卦
  const bodyInUpper = movingLine >= 4; // 上卦4-6爻
  const bodyTrigram = bodyInUpper ? upperTrigram : lowerTrigram;
  const useTrigram = bodyInUpper ? lowerTrigram : upperTrigram;
  const bodyUseRelation = BODY_USE_RELATIONS[bodyTrigram.element]?.[useTrigram.element] || '未知';

  // 综合解读
  const bodyUseDesc = bodyUseRelation.includes('吉') ? '吉，顺势而为' :
    bodyUseRelation.includes('凶') ? '凶，需谨慎行事' :
    bodyUseRelation.includes('泄气') ? '付出较多，但有益成长' :
    bodyUseRelation.includes('劳心') ? '劳心费力，但可掌控' : '平和稳定';

  const interpretation = `本卦「${primaryHex.name}」→ 变卦「${changedHex.name}」，${movingLine}爻动。体卦为${bodyTrigram.name}（${bodyTrigram.element}），用卦为${useTrigram.name}（${useTrigram.element}），体用关系：${bodyUseRelation}。${bodyUseDesc}。`;

  // === 京氏易：世应定位 ===
  // 八纯卦世在上爻(6)，应在三爻(3)
  // 一世卦世在初爻(1)，应在四爻(4)
  // 二世卦世在二爻(2)，应在五爻(5)
  // 三世卦世在三爻(3)，应在六爻(6)
  // 四世卦世在四爻(4)，应在初爻(1)
  // 五世卦世在五爻(5)，应在二爻(2)
  // 游魂卦世在四爻(4)，应在初爻(1)
  // 归魂卦世在三爻(3)，应在六爻(6)
  const guaGroup = Math.floor((primaryCode - 1) / 8); // 0-7
  const guaPos = ((primaryCode - 1) % 8); // 0-7 在组内位置
  let shiPos = 6; // default: 八纯
  let yingPos = 3;
  if (guaPos === 0) { shiPos = 6; yingPos = 3; }       // 八纯
  else if (guaPos === 1) { shiPos = 1; yingPos = 4; }  // 一世
  else if (guaPos === 2) { shiPos = 2; yingPos = 5; }  // 二世
  else if (guaPos === 3) { shiPos = 3; yingPos = 6; }  // 三世
  else if (guaPos === 4) { shiPos = 4; yingPos = 1; }  // 四世
  else if (guaPos === 5) { shiPos = 5; yingPos = 2; }  // 五世
  else if (guaPos === 6) { shiPos = 4; yingPos = 1; }  // 游魂
  else if (guaPos === 7) { shiPos = 3; yingPos = 6; }  // 归魂

  // === 京氏易：纳甲（天干地支配卦） ===
  // 乾纳甲壬，坤纳乙癸，艮纳丙，兑纳丁，坎纳戊，离纳己，震纳庚，巽纳辛
  const NAYIN_GAN: Record<string, string[]> = {
    '乾': ['甲', '壬'], '坤': ['乙', '癸'], '艮': ['丙', '丙'],
    '兑': ['丁', '丁'], '坎': ['戊', '戊'], '离': ['己', '己'],
    '震': ['庚', '庚'], '巽': ['辛', '辛'],
  };
  // 地支纳甲 (阳卦顺行，阴卦逆行)
  const NAYIN_ZHI: Record<string, string[]> = {
    '乾': ['子', '寅', '辰', '午', '申', '戌'],
    '坤': ['未', '巳', '卯', '丑', '亥', '酉'],
    '震': ['子', '寅', '辰', '午', '申', '戌'],
    '巽': ['丑', '亥', '酉', '未', '巳', '卯'],
    '坎': ['寅', '辰', '午', '申', '戌', '子'],
    '离': ['卯', '丑', '亥', '酉', '未', '巳'],
    '艮': ['辰', '午', '申', '戌', '子', '寅'],
    '兑': ['巳', '卯', '丑', '亥', '酉', '未'],
  };

  const upperName = bodyInUpper ? upperTrigram.name : lowerTrigram.name; // 用上卦定纳甲
  const ganList = NAYIN_GAN[upperName] || ['甲', '甲'];
  const zhiList = NAYIN_ZHI[upperName] || ['子', '寅', '辰', '午', '申', '戌'];

  const nayinStems = lines.map((_, i) => {
    const trigramName = i < 3 ? lowerTrigram.name : upperTrigram.name;
    return (NAYIN_GAN[trigramName] || ['甲'])[i < 3 ? 0 : 1];
  });
  const nayinBranches = lines.map((_, i) => {
    const trigramName = i < 3 ? lowerTrigram.name : upperTrigram.name;
    return (NAYIN_ZHI[trigramName] || ['子', '寅', '辰', '午', '申', '戌'])[i];
  });

  // === 京氏易：六亲 ===
  // 以卦宫五行 (上卦五行) 为"我"，与各爻纳甲地支五行比较
  const ZHI_WUXING: Record<string, string> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水',
  };
  const guaElement = bodyTrigram.element; // 体卦五行 = "我"
  const SIX_RELATIONS: Record<string, string> = {
    'same': '兄弟', 'generateMe': '父母', 'iGenerate': '子孙',
    'controlMe': '官鬼', 'iControl': '妻财',
  };

  const getRelation = (zhi: string): string => {
    const el = ZHI_WUXING[zhi] || '土';
    // 五行生克定六亲
    const ganKe = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
    const ganSheng = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    if (el === guaElement) return '兄弟';
    if (ganSheng[guaElement] === el) return '子孙';
    if (ganSheng[el] === guaElement) return '父母';
    if (ganKe[guaElement] === el) return '妻财';
    if (ganKe[el] === guaElement) return '官鬼';
    return '兄弟';
  };

  const sixRelations = nayinBranches.map(zhi => getRelation(zhi));

  return {
    primary: {
      name: primaryHex.name,
      code: primaryCode,
      upper: upperTrigram,
      lower: lowerTrigram,
      lines,
      judgment: primaryHex.judgment,
    },
    changing: changingHexagram,
    mutual: mutualHexagram,
    bodyTrigram,
    useTrigram,
    bodyUseRelation,
    movingLine,
    yearElement: '',
    interpretation,
    sixRelations,
    shiYing: { shi: shiPos, ying: yingPos },
    nayinStem: nayinStems,
    nayinBranch: nayinBranches,
  };
}

/**
 * 获取八卦对应的Emoji
 */
export function getTrigramEmoji(name: string): string {
  const map: Record<string, string> = {
    '乾': '☰', '兑': '☱', '离': '☲', '震': '☳',
    '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷',
  };
  return map[name] || '✦';
}
