// ═══════════════════════════════════════════════════════
// 九宫姓名学 · 全维引擎 v3
// 基于程天相九宫学理 + 康熙字典 + DeepSeek方案
// ═══════════════════════════════════════════════════════

// ── 部首特殊笔画 ──
type RadicalRule = { pattern: string; stroke: number; pos: 'left' | 'right' | 'any' };
const RADICALS: RadicalRule[] = [
  { pattern: '氵', stroke: 4, pos: 'left' }, { pattern: '扌', stroke: 4, pos: 'left' },
  { pattern: '忄', stroke: 4, pos: 'left' }, { pattern: '犭', stroke: 4, pos: 'left' },
  { pattern: '王', stroke: 5, pos: 'left' }, { pattern: '礻', stroke: 5, pos: 'left' },
  { pattern: '衤', stroke: 6, pos: 'left' }, { pattern: '月', stroke: 6, pos: 'left' },
  { pattern: '艹', stroke: 6, pos: 'any' },  { pattern: '辶', stroke: 7, pos: 'any' },
];

let kangxi: Map<string,number> | null = null;

export async function loadKangxi(): Promise<void> {
  if (kangxi) return;
  const r = await fetch('/data/kangxi-strokes.json');
  kangxi = new Map(Object.entries(await r.json()));
}

function radicalStroke(char: string): number {
  for (const r of RADICALS) {
    if (r.pos === 'left' && char.startsWith(r.pattern)) return r.stroke;
    if (r.pos === 'any' && char.includes(r.pattern)) return r.stroke;
  }
  if (char.startsWith('阝')) return 8;
  if (char.endsWith('阝')) return 7;
  return 0;
}

export function getStroke(char: string): number {
  const rad = radicalStroke(char);
  if (rad > 0) {
    const rest = char.replace(/^[氵扌忄犭王礻衤月艹辶阝]/, '').replace(/阝$/, '');
    const restStroke = rest ? (kangxi?.get(rest) ?? 10) : 0;
    return rad + restStroke;
  }
  return kangxi?.get(char) ?? (char.length > 1 ? char.length + 1 : 10);
}

// ── 五行/九宫常用 ──
const WX = ['水','木','木','火','火','土','土','金','金','水'];
export function wx(n: number) { return WX[n % 10]; }
export function mod9(n: number) { let r = n % 9; return r <= 0 ? r + 9 : r; }
export function digitSum(n: number) { let s = String(n); while(s.length>1) s = String(s.split('').reduce((a,b)=>a+ +b,0)); return +s; }

// =========== 数据结构 ===========
export interface JiugongFull {
  name: string; year: number; month: number; day: number;
  total: number; strokes: number[];
  tian: number; ren: number; di: number; zong: number; wai: number;
  tianWx: string; renWx: string; diWx: string;
  xuAge: number;
  ju: number; zhi: number; juDesc: string; zhiDesc: string;
  mgtType: string; mgtScore: number; mgtDesc: string;
  marriageType: string; marriageDesc: string;
  wealthType: string; wealthDesc: string;
  pathType: string; pathDesc: string;
  ageStar: string; ageStarDesc: string;
  upperQi: string; selfQi: string; lowerQi: string; outerQi: string;
  qiDesc: Record<string,string>;
  tianE: string; renE: string; diE: string; zongE: string;
  eDesc: Record<string,string>;
  upperColl: number[]; selfColl: number[]; lowerColl: number[];
  groups: {name:string;ages:string;gua:string;koujue:string;jie:string}[];
}

// =========== 主计算 ===========
const JU_DESC = ['经营自己，求稳定平安，需靠山名气','紧跟贵人，不可独闯，跟随得第一','兢兢业业，白手起家，劳碌得天下','福禄双全，用心惜福，士农工商皆宜','志向远大，只羡王权，求功名'];
const ZHI_DESC = ['文曲星·隐藏深沉，智慧财富','权星·掌权欲望，带动力强','辅星·文书辅助，能说能写','车星·动力活力，速度行动','福临星·口舌宣传，天助人助','库星·稳定守成，管理财务','驿马星·奔驰远行，外乡发展','孤星·开发独立，刚毅开拓','金贵星·机运成果，与官家有缘','精灵星·变化悟性，聪明脾气大'];
const QI_NAME: Record<number,string> = {1:'晦暗',2:'享成',3:'争夺',4:'付出',5:'名望',6:'入库',7:'升格',8:'开拓',9:'转变'};
const QI_DESC: Record<string,string> = {'晦暗':'隐藏·危机·暗财·低调','享成':'天助·贵人·懒散·回报','争夺':'竞争·起伏·官司·团结','付出':'耕耘·奉献·只出不进·置产','名望':'光芒·知名度·新事物·上层贵人','入库':'财气·收成·劫财·守成','升格':'成长·提升·官司·承接','开拓':'新方向·压力·假象·突破','转变':'转型·扭转·变动·调整'};
const ENERGY = ['帝旺','临官','冠带','长生','养','胎','绝','死','病','衰'];
const E_DESC: Record<string,string> = {'胎':'酝酿期·谷底·被动·新开始','养':'吸收期·根基·成长·防投机','长生':'成长期·贵人·人和·行动','冠带':'成熟期·自我·成名·抗性','临官':'发展期·忙碌·升官·扩张','帝旺':'巅峰期·高亢·天助·防贪','衰':'倦怠期·回收·守成·防变','病':'病变期·波折·冷静·检查','死':'破灭期·脆弱·外地贵人·放下','绝':'谷底期·空洞·结束·重生'};
const GROUP_DATA = [
  {name:'专注运',gua:'空相',koujue:'一场好景似源头，竹篮打水一场空',jie:'乱象九年，不能乱换行业，被动可动'},
  {name:'虚名运',gua:'虚名',koujue:'有人送终有人拱，徒有虚名一场空',jie:'求名不求利，不可贪心'},
  {name:'功名运',gua:'功名',koujue:'日月同光有奇迹，但求功名不求利',jie:'奇迹短暂，求名，承接旧业'},
  {name:'组织运',gua:'良臣',koujue:'众星拱月可上任，左右护法得良臣',jie:'依靠组织，不可独闯'},
  {name:'回收运',gua:'因果',koujue:'机运当强论成败，努力回顾前五载',jie:'检验前五年，坚守经营'},
  {name:'巅峰运',gua:'登峰',koujue:'登峰谦卑可造极，求名得名利得利',jie:'最好的运，顺风顺水'},
  {name:'靠山运',gua:'名声',koujue:'机到同时运当前，二郎神边哮天犬',jie:'找大靠山，不可独行'},
  {name:'打拼运',gua:'名望',koujue:'威震九洲是二爷，光芒四射怕引蝶',jie:'靠个人知名度，但需收敛'},
  {name:'小得运',gua:'小得',koujue:'天上星星仙女华，捡到小利得小发',jie:'捡小利，守成为主'},
  {name:'追击运',gua:'两仪',koujue:'阴阳两仪交互替，年初不顺年冬吉',jie:'乘胜追击，前实后虚'},
];
const STAR = {1:'权星(带动星)',2:'空亡星(红鸾星)',3:'车星(动力星)',4:'田宅星(口舌星)',5:'倦怠星(守成星)',6:'驿马星(奔驰星)',7:'孤星(开发星)',8:'机运星(天喜星)',9:'五鬼星(贪婪星)',0:'依附星(合伙星)'};
const STAR_DESC: Record<number,string> = {1:'掌权机会，带动组织',2:'思绪易断，婚嫁怀孕佳',3:'忙碌奔波，防意外',4:'置产修屋，靠嘴吃饭者佳',5:'守成为主，储存能量',6:'奔驰远行',7:'独立开拓，合作难',8:'贵人相助',9:'忌贪忌投机',0:'合伙创业佳'};

function getEnergy(grid: number, type: 'tian'|'other'): string {
  let n = grid % 10; if (n===0) n=10;
  if (type==='tian') return ENERGY[n-1];
  const m = [9,10,1,2,3,4,5,6,7,8][n-1]; // 反向映射
  return ENERGY[m];
}

function getCollisions(grid: number, type: 'tian'|'other'): number[] {
  const e = getEnergy(grid, type);
  const idx = ENERGY.indexOf(e);
  const start = type==='tian' ? idx+1 : ((idx+2)%10)+1;
  return Array.from({length:9},(_,i)=>start+i*10).filter(n=>n<=90);
}

export function calcFull(name: string, year: number, month: number, day: number): JiugongFull {
  const chars = Array.from(name);
  const strokes = chars.map(getStroke);
  const total = strokes.reduce((a,b)=>a+b,0);
  
  // 五格
  const isDouble = strokes.length>=4 && strokes.length<=5; // 简化复姓判断
  const tian = isDouble ? strokes[0]+strokes[1] : strokes[0]+1;
  const ren = isDouble ? strokes[1]+(strokes[2]||1) : strokes[0]+(strokes[1]||1);
  const di = strokes.length>=3 ? strokes[1]+strokes[2] : (strokes[1]||1)+1;
  const zong = total;
  const wai = zong - ren + 1;
  const tianWx=wx(tian), renWx=wx(ren), diWx=wx(di);
  
  // 虚岁
  const now = new Date();
  const birth = new Date(year, month-1, day);
  let age = now.getFullYear()-birth.getFullYear();
  if (now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate())) age--;
  const xuAge = age+1;
  
  // 局差
  const tens = Math.floor(total/10), ones = total%10;
  let ju = Math.abs(tens-ones);
  if (ju>4) ju = (Math.min(tens,ones)+9)-Math.max(tens,ones);
  const zhi = total%10;
  
  // 管理IQ
  const second = strokes[1] ?? strokes[0];
  const mgtMap: Record<number,[string,number,string]> = {
    1:['流水型',60,'模仿型，需样板'],2:['林木型',75,'稳健培植型'],3:['太阳型',70,'魅力型，自我推销'],
    4:['月亮型',80,'民粹型，乱中崛起'],5:['天空型',90,'容纳型，管理天才'],6:['地上型',70,'复合型，配合度高'],
    7:['高山型',65,'扎实型，副手/幕后'],8:['急风型',80,'迅雷型，雷厉风行'],9:['火炎型',60,'自我型，不按理出牌'],
  };
  const mgtN = second>9 ? digitSum(second) : second;
  const [mgtType,mgtScore,mgtDesc] = mgtMap[mgtN]||['流水型',60,''];
  
  // 婚姻
  const wxGen = (a:string,b:string)=>wxOrder(a)-wxOrder(b);
  const wxOrder = (w:string) => ({木:1,火:2,土:3,金:4,水:5} as Record<string,number>)[w]||0;
  const gen = (wxOrder(renWx)-wxOrder(diWx)+5)%5;
  const mar: [string,string] = gen===0 ? ['双象','第一次缘份易断'] :
    gen===1||gen===3 ? ['旺象','主动奉献，易找到中意伴侣'] :
    gen===2||gen===4 ? ['淡象','较自恋，婚期较晚'] : ['破象','波折较多'];
  
  // 财运
  const wea: [string,string] = gen===0 ? ['库平','从商格'] :
    gen===2||gen===4 ? ['库旺','守得住财'] :
    gen===1||gen===3 ? ['库泄','花钱享受型'] : ['库破','不大破不罢休'];
  const diff = Math.abs(ren-di);
  const pathN = diff===0?0:diff<=2||diff>=8?1:diff<=4||diff>=6?2:3;
  const paths: [string,string][] = [['名气暗财','靠知名度，大起大落'],['能力正财','实力派，白手起家'],['机运正财','贵气，靠人际关系'],['机运暗财','受栽培，吸金强']];
  const [pathType,pathDesc] = paths[pathN]||paths[1];
  
  // 岁值星
  const sKey = xuAge%10;
  const ageStar = STAR[sKey]||'';
  const ageStarDesc = STAR_DESC[sKey]||'';
  
  // 四大关系气场
  const mainNum = digitSum(year-1111);
  const upperQiNum=mod9(mainNum-tian), selfQiNum=mod9(mainNum-ren), lowerQiNum=mod9(mainNum-di), outerQiNum=mod9(mainNum-zong);
  const upperQi=QI_NAME[upperQiNum], selfQi=QI_NAME[selfQiNum], lowerQi=QI_NAME[lowerQiNum], outerQi=QI_NAME[outerQiNum];
  
  // 能量
  const tianE=getEnergy(tian,'tian'), renE=getEnergy(ren,'other'), diE=getEnergy(di,'other'), zongE=getEnergy(zong,'other');
  
  // 碰撞
  const upperColl=getCollisions(tian,'tian'), selfColl=getCollisions(ren,'other'), lowerColl=getCollisions(di,'other');
  
  // 90年卷轴
  const gStart = ({0:9,1:0,2:1,3:2,4:3,5:4,6:5,7:6,8:7,9:8} as Record<number,number>)[zong%10]||0;
  const ages = ['1-9岁','10-18岁','19-27岁','28-36岁','37-45岁','46-54岁','55-63岁','64-72岁','73-81岁','82-90岁'];
  const groups = Array.from({length:10},(_,i)=>GROUP_DATA[(gStart+i)%10]).map((g,i)=>({...g,ages:ages[i]}));
  
  return {name,year,month,day,total,strokes,tian,ren,di,zong,wai,tianWx,renWx,diWx,xuAge,ju,zhi,
    juDesc:JU_DESC[ju],zhiDesc:ZHI_DESC[zhi],mgtType,mgtScore,mgtDesc: `${mgtType}·${mgtDesc}`,
    marriageType:mar[0],marriageDesc:mar[1],wealthType:wea[0],wealthDesc:wea[1],pathType,pathDesc,
    ageStar,ageStarDesc,upperQi,selfQi,lowerQi,outerQi,qiDesc:QI_DESC,
    tianE,renE,diE,zongE,eDesc:E_DESC,upperColl,selfColl,lowerColl,groups};
}
