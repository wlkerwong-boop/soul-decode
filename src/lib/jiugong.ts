// 九宫姓名学核心计算引擎
// 基于河图洛书五格三才体系

// ── 汉字笔画字典（常用字康熙笔画）──
const STROKE_MAP: Record<string, number> = {
  '一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,
  '王':4,'玉':5,'李':7,'张':11,'刘':15,'陈':16,'杨':13,'赵':14,'黄':12,'周':8,
  '吴':7,'徐':10,'孙':10,'胡':11,'朱':6,'高':10,'林':8,'何':7,'郭':15,'马':10,
  '罗':20,'梁':11,'宋':7,'郑':19,'谢':17,'韩':17,'唐':10,'冯':12,'于':3,'董':15,
  '萧':19,'程':12,'曹':10,'袁':10,'邓':19,'许':11,'傅':12,'沈':8,'曾':12,'彭':12,
  '吕':7,'苏':22,'卢':16,'蒋':17,'蔡':17,'贾':10,'丁':2,'魏':18,'薛':19,'叶':15,
  '阎':16,'余':7,'潘':16,'杜':7,'戴':18,'夏':10,'钟':17,'汪':8,'田':5,'任':6,
  '姜':9,'范':15,'方':4,'石':5,'姚':9,'谭':19,'廖':14,'邹':17,'熊':14,'金':8,
  '陆':16,'郝':14,'孔':4,'白':5,'崔':11,'康':11,'毛':4,'邱':12,'秦':10,'江':7,
  '史':5,'顾':21,'侯':9,'邵':12,'孟':8,'龙':16,'万':15,'段':9,'雷':13,'钱':16,
  '汤':12,'尹':4,'易':8,'常':11,'武':8,'乔':12,'贺':12,'赖':16,'龚':22,'文':4,
  '明':8,'华':14,'伟':11,'芳':10,'敏':11,'静':16,'丽':19,'强':12,'磊':15,'军':9,
  '洋':10,'勇':9,'艳':24,'杰':8,'娟':10,'涛':18,'超':12,'秀':7,'霞':17,'玲':10,
  '平':5,'刚':10,'桂':10,'英':11,'婷':12,'慧':15,'琳':13,'宇':6,'浩':11,'然':12,
  '博':12,'文':4,'彬':11,'君':7,'峰':10,'毅':15,'恒':10,'志':7,'宏':7,'辉':15,
  '飞':9,'翔':12,'龙':16,'凤':14,'麒':19,'麟':23,'鹏':19,'鲲':19,'鸿':17,'雁':15,
  '春':9,'夏':10,'秋':9,'冬':5,'晨':11,'曦':20,'旭':6,'阳':17,'月':4,'星':9,
  '雪':11,'雨':8,'云':12,'雷':13,'风':9,'霜':17,'露':20,'虹':9,'霓':16,'霞':17,
  '天':4,'地':6,'山':3,'水':4,'火':4,'海':11,'江':7,'河':9,'湖':13,'川':3,
  '树':16,'花':10,'草':10,'梅':11,'兰':23,'竹':6,'菊':14,'松':8,'柏':9,'柳':9,
  '子':3,'女':3,'儿':8,'小':3,'大':3,'中':4,'国':11,'家':10,'人':2,'心':4,
  '光':6,'明':8,'德':15,'仁':4,'义':13,'礼':18,'智':12,'信':9,'善':12,'美':9,
  '和':8,'平':5,'安':6,'乐':15,'福':14,'寿':14,'喜':12,'庆':15,'吉':6,'祥':11,
  '雅':12,'若':11,'如':6,'意':13,'思':9,'想':13,'知':8,'道':16,'行':6,'为':12,
  '我':7,'你':7,'他':5,'们':10,'这':11,'那':7,'什':4,'么':3,'怎':9,'样':15,
  '东':8,'西':6,'南':9,'北':5,'前':9,'后':9,'左':5,'右':5,'上':3,'下':3,
  '日':4,'月':4,'年':6,'时':10,'分':4,'秒':9,'今':4,'昨':9,'明':8,'天':4,
  '是':9,'有':6,'不':4,'在':6,'了':2,'来':8,'去':5,'出':5,'进':11,'回':6,
  '可':5,'以':5,'要':9,'会':13,'能':10,'用':5,'对':14,'好':6,'很':9,'都':14,
  '说':14,'看':9,'见':7,'听':22,'闻':14,'问':11,'答':12,'讲':17,'读':22,'写':15,
  '话':13,'言':7,'语':14,'诗':13,'词':12,'歌':14,'曲':6,'画':8,'书':10,'字':6,
  '学':16,'校':10,'师':10,'生':5,'课':15,'考':6,'试':13,'题':18,'习':11,'数':15,
  '理':12,'化':4,'物':8,'科':9,'技':8,'工':3,'农':13,'商':11,'医':15,'药':19,
  '爱':13,'情':12,'恨':10,'喜':12,'怒':8,'哀':9,'乐':15,'忧':15,'愁':13,'思':9,
  '金':8,'木':4,'水':4,'火':4,'土':3,'石':5,'玉':5,'珠':11,'宝':20,'银':14,
  '红':9,'黄':12,'蓝':20,'绿':14,'青':8,'紫':11,'黑':12,'白':5,'灰':6,'彩':11,
  '身':7,'体':23,'头':16,'手':4,'足':7,'眼':11,'耳':6,'口':3,'鼻':14,'舌':6,
};

// 获取汉字笔画（不在字典中的字按结构估算）
function getStroke(char: string): number {
  if (STROKE_MAP[char]) return STROKE_MAP[char];
  // 不在字典中，按 Unicode 范围估算
  const code = char.charCodeAt(0);
  if (code >= 0x4e00 && code <= 0x9fff) return 10; // 中文字默认 10 画
  return 1; // 非中文
}

// ── 五格计算 ──
export interface WuGe {
  tian: number;   // 天格：姓笔画+1
  ren: number;    // 人格：姓笔画+名首字笔画
  di: number;     // 地格：名笔画和
  zong: number;   // 总格：全名笔画和
  wai: number;    // 外格：总格-人格+1
  sancai: string; // 三才配置描述
}

// 五行映射（1-5: 木火土金水，按个位数映射）
const WUXING = ['水','木','木','火','火','土','土','金','金','水'];

function calcWuGe(name: string): WuGe {
  const chars = [...name.replace(/\s/g, '')];
  if (chars.length < 2) {
    return { tian: 1, ren: 1, di: 1, zong: 1, wai: 1, sancai: '水火土' };
  }
  
  const xing = chars[0];           // 姓
  const mingStrokes = chars.slice(1).map(getStroke);
  const mingSum = mingStrokes.reduce((a,b)=>a+b, 0);
  const mingFirst = mingStrokes[0];
  
  const tian = getStroke(xing) + 1;
  const ren = getStroke(xing) + mingFirst;
  const di = mingSum;
  const zong = getStroke(xing) + mingSum;
  const wai = zong - ren + 1;
  
  // 三才：天格/人格/地格的五行
  const tc = WUXING[tian % 10];
  const rc = WUXING[ren % 10];
  const dc = WUXING[di % 10];
  
  // 三才生克简评
  let sancaiDesc = '';
  const wxOrder = { '木':1,'火':2,'土':3,'金':4,'水':5 };
  const tIdx = wxOrder[tc as keyof typeof wxOrder] || 0;
  const rIdx = wxOrder[rc as keyof typeof wxOrder] || 0;
  const dIdx = wxOrder[dc as keyof typeof wxOrder] || 0;
  
  // 天→人
  if ((tIdx + 1) % 5 + 1 === rIdx) sancaiDesc = '天生人，长辈提携';
  else if (tIdx === rIdx) sancaiDesc = '天人比和，根基稳固';
  else if ((rIdx + 1) % 5 + 1 === tIdx) sancaiDesc = '人克天，独立开创';
  else sancaiDesc = '天人调和';
  
  return { tian, ren, di, zong, wai, sancai: `${tc}${rc}${dc} · ${sancaiDesc}` };
}

// ── 岁值星 ──
const SUIZHI_STARS = [
  { star: '将星', desc: '岁值逢0：掌兵权，统御四方。今年适合担任领导角色，大胆决策。' },
  { star: '权星', desc: '岁值逢1：掌权力，称为带动星。今年有机会升职掌权，把握表现机会。' },
  { star: '空亡星', desc: '岁值逢2：逢红鸾，思绪波动。今年容易有判断失误，适合静心内省、接触宗教哲学。' },
  { star: '车星', desc: '岁值逢3：掌动力使命，活力速度。今年行动力强，适合开拓新领域、启动新项目。' },
  { star: '田宅星', desc: '岁值逢4：掌传达使命，福星高照。今年口舌能力强，适合宣传推广、公开表达。贵人多助。' },
  { star: '库星', desc: '岁值逢5：掌积蓄功能。今年适合积累沉淀，稳扎稳打，不宜冒进。财库有望充实。' },
  { star: '孤星', desc: '岁值逢6：掌孤独思考。今年适合独处充电、深入研究。不要勉强社交，独处的力量最大。' },
  { star: '破军星', desc: '岁值逢7：破旧立新。今年是打破旧模式的好时机，转变方向、断舍离。变动中藏着机会。' },
  { star: '贵星', desc: '岁值逢8：贵人来助。今年人缘运佳，容易遇到提携你的贵人。多社交、多展示自己。' },
  { star: '文星', desc: '岁值逢9：文昌星动。今年学运昌隆，适合学习进修、写作创作。考试运佳。' },
];

function calcSuiZhi(year: number): { xuSui: number; star: string; desc: string } {
  const currentYear = new Date().getFullYear();
  const xuSui = currentYear - year + 1;
  const tail = xuSui % 10;
  const s = SUIZHI_STARS[tail];
  return { xuSui, star: s.star, desc: s.desc };
}

// ── 九宫气场计算 ──
// 九宫排列（洛书）：4 9 2 / 3 5 7 / 8 1 6
const JIUGONG_GRID = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

// 九宫含义
const JIUGONG_MEANINGS: Record<number, { name: string; desc: string }> = {
  1: { name: '坎宫·水', desc: '智慧之源，代表流动与变通。此宫强者善于随机应变，但需防心思过重。' },
  2: { name: '坤宫·土', desc: '包容之德，代表接纳与承载。此宫强者心胸宽广，但需防优柔寡断。' },
  3: { name: '震宫·木', desc: '行动之力，代表开创与决断。此宫强者行动力超群，但需防冲动冒进。' },
  4: { name: '巽宫·木', desc: '传播之风，代表沟通与影响。此宫强者善于表达，但需防言多必失。' },
  5: { name: '中宫·土', desc: '太极之心，代表平衡与核心。此宫强者处变不惊，掌控全局。' },
  6: { name: '乾宫·金', desc: '领导之尊，代表权威与决断。此宫强者天生领袖，但需防刚愎自用。' },
  7: { name: '兑宫·金', desc: '喜悦之情，代表人际与分享。此宫强者人缘极佳，但需防过度依赖他人。' },
  8: { name: '艮宫·土', desc: '坚守之志，代表稳定与专注。此宫强者持之以恒，但需防固步自封。' },
  9: { name: '离宫·火', desc: '光明之象，代表热情与创造。此宫强者光芒四射，但需防三分钟热度。' },
};

// 数字缩简到个位数
function reduceNum(n: number): number {
  while (n > 9) {
    n = n.toString().split('').reduce((a,b)=>a+parseInt(b), 0);
  }
  return n;
}

function calcJiuGong(name: string, year: number): number[][] {
  const totalStroke = [...name.replace(/\s/g,'')].reduce((a,c)=>a+getStroke(c), 0);
  // 气场数：姓名笔画直接相加再缩减
  const qi = reduceNum(totalStroke);
  
  // 构建九宫气场：以人格所在宫位为中心扩散
  const grid = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  
  // 人格数（姓+名首字）
  const chars = [...name.replace(/\s/g,'')];
  const renGe = chars.length >= 2 ? getStroke(chars[0]) + getStroke(chars[1]) : totalStroke;
  const renNum = reduceNum(renGe);
  
  // 将气场填入九宫
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const base = JIUGONG_GRID[i][j];
      grid[i][j] = reduceNum(base + totalStroke + year % 100);
    }
  }
  
  return grid;
}

// 找到人格在九宫中的位置
function findRengePosition(grid: number[][], renNum: number): [number, number] {
  // 找与人格数相同或最近的宫位
  let best: [number,number] = [1,1];
  let bestDist = Infinity;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const dist = Math.abs(grid[i][j] % 9 - renNum % 9);
      if (dist < bestDist) {
        bestDist = dist;
        best = [i, j];
      }
    }
  }
  return best;
}

// ── 十大特质（总格个位数）──
const TEZHI_TYPES: Record<number, { name: string; desc: string; element: string }> = {
  0: { name: '将星', desc: '紫微家族。掌统御使命，类似元帅。有领导力，格局大，适合做管理者。', element: '金' },
  1: { name: '权星', desc: '紫金家族。掌管理使命，类似皇帝。有掌权欲望，带动力特别强。', element: '木' },
  2: { name: '相星', desc: '司文家族。掌辅佐使命，类似宰相。能说能写，完美规划型。', element: '木' },
  3: { name: '车星', desc: '追风家族。掌动力使命，活力十足，行动派。适合开拓型工作。', element: '火' },
  4: { name: '田宅星', desc: '福临家族。掌传达使命，口舌能力好，容易有贵人相助。', element: '火' },
  5: { name: '库星', desc: '禄存家族。掌积蓄功能，财运好，善于积累。踏实稳健型。', element: '土' },
  6: { name: '孤星', desc: '天梁家族。掌孤独思考，研究型人才。独处中产出惊人洞察。', element: '土' },
  7: { name: '破军星', desc: '破军家族。掌破旧立新，勇于突破传统。变革者，创业者。', element: '金' },
  8: { name: '贵星', desc: '天相家族。掌贵人来助，人缘好，容易得到帮助。社交型。', element: '金' },
  9: { name: '文星', desc: '文昌家族。掌文采风流，学习力强，适合教育/写作/学术。', element: '水' },
};

// ── 主入口 ──
export interface JiugongResult {
  wuge: WuGe;
  jiugong: number[][];
  jiugongLabels: { row: number; col: number; num: number; name: string; desc: string }[];
  tezhi: { number: number; name: string; desc: string; element: string };
  suizhi: { xuSui: number; star: string; desc: string };
  rengePosition: [number, number];
  totalStroke: number;
}

export function calcJiugong(name: string, year: number, month?: number, day?: number): JiugongResult {
  const wuge = calcWuGe(name);
  const jiugong = calcJiuGong(name, year);
  const suizhi = calcSuiZhi(year);
  const total = [...name.replace(/\s/g,'')].reduce((a,c)=>a+getStroke(c), 0);
  const zongNum = wuge.zong % 10;
  const tezhi = TEZHI_TYPES[zongNum] || TEZHI_TYPES[5];
  const chars = [...name.replace(/\s/g,'')];
  const renFirst = chars.length >= 2 ? getStroke(chars[0]) + getStroke(chars[1]) : total;
  const renNum = reduceNum(renFirst);
  const rengePos = findRengePosition(jiugong, renNum);
  
  const jiugongLabels = jiugong.flatMap((row, i) =>
    row.map((num, j) => {
      const baseNum = JIUGONG_GRID[i][j];
      const meaning = JIUGONG_MEANINGS[baseNum] || { name: `宫${baseNum}`, desc: '' };
      return { row: i, col: j, num, name: meaning.name, desc: meaning.desc };
    })
  );
  
  return { wuge, jiugong, jiugongLabels, tezhi, suizhi, rengePosition: rengePos, totalStroke: total };
}

// ── 90年运势卷轴数据 ──
export function calcLifeScroll(name: string, year: number): { age: number; star: string; keyword: string }[] {
  const suizhiStars = SUIZHI_STARS.map(s => s.star);
  const keywords = ['起步','积累','上升','突破','稳定','转折','沉淀','收获','转型','圆满'];
  return Array.from({length: 90}, (_, i) => ({
    age: i + 1,
    star: suizhiStars[(year + i) % 10],
    keyword: keywords[i % 10],
  }));
}
