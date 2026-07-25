// ═══════════════════════════════════════════════════════
// 九宫姓名学 · 全维引擎 v4
// 金标准: 程天相九宫学理 + docx原文 + Excel数据
// ═══════════════════════════════════════════════════════

// ── 康熙字典笔画库 ──
// 优先从外部 JSON 加载, 失败时使用内嵌常用字兜底

let kangxi: Map<string,number> | null = null;
export async function loadKangxi(): Promise<void> {
  if (kangxi) return;
  try {
    const r = await fetch('/data/kangxi-strokes.json');
    if (r.ok) { kangxi = new Map(Object.entries(await r.json())); return; }
  } catch {}
}

function fallbackStroke(char: string): number {
  // 部首特殊字直接映射
  const DIRECT: Record<string,number> = {'氵':4,'扌':4,'忄':4,'犭':4,'王':5,'礻':5,'衤':6,'月':6,'艹':6,'辶':7,'阝':7};
  if (DIRECT[char]) return DIRECT[char];
  const code = char.charCodeAt(0);
  if (code >= 0x4e00 && code <= 0x9fff) return 10; // 中文字默认10画
  return 1;
}

// ── 复姓列表 ──
const COMPOUND_SURNAMES = new Set([
  '欧阳','司马','诸葛','上官','夏侯','皇甫','公孙','仲孙','钟离','宇文','长孙','慕容',
  '司徒','司空','百里','东郭','南门','呼延','尉迟','南宫','万俟','西门','东门','羊舌',
  '微生','梁丘','左丘','漆雕','乐正','端木','巫马','公西','澹台','公冶','宗政','濮阳',
  '淳于','单于','太叔','申屠','公良','轩辕','令狐','段干','谷梁','公羊',
]);

// ── 部首特殊规则 ──
function radicalStroke(char: string): number {
  if (char.startsWith('氵')||char.startsWith('扌')||char.startsWith('忄')||char.startsWith('犭')) return 4;
  if (char.startsWith('王')||char.startsWith('礻')) return 5;
  if (char.startsWith('衤')||char.startsWith('月')||char.startsWith('艹')) return 6;
  if (char.startsWith('辶')) return 7;
  if (char.startsWith('阝')) return 8;
  if (char.endsWith('阝')) return 7;
  return 0;
}

export function getStroke(char: string): number {
  // 先查外部康熙字典
  if (kangxi?.has(char)) return kangxi.get(char)!;
  // 部首拆分
  const r = radicalStroke(char);
  if (r > 0) {
    const rest = char.replace(/^[氵扌忄犭王礻衤月艹辶阝]/,'').replace(/阝$/,'');
    const restStroke = rest ? getStroke(rest) : 0;
    return r + (restStroke || 10);
  }
  return kangxi?.get(char) ?? fallbackStroke(char);
}

// ── 基础工具 ──
const WX = ['水','木','木','火','火','土','土','金','金','水'];
export const wx = (n:number)=>WX[n%10];
const mod9 = (n:number)=>{let r=((n%9)+9)%9;return r===0?9:r;};
const digitSum = (n:number)=>{let s=String(Math.abs(n));while(s.length>1)s=String([...s].reduce((a,b)=>a+ +b,0));return +s;};

// ── 十大能量 ──
const ENERGY = ['帝旺','临官','冠带','长生','养','胎','绝','死','病','衰'];
export const ENERGY_DESC: Record<string,string> = {
  '胎':'酝酿期 · 谷底也是转机 · 被动中孕育新开始',
  '养':'吸收期 · 得助力在人际 · 根基成长 · 防投机',
  '长生':'成长期 · 贵人相助 · 人和为贵 · 适合行动',
  '冠带':'成熟期 · 自我意识强 · 流年关键看冠带 · 宜守成',
  '临官':'发展期 · 动力十足 · 创业升官看基础 · 宜扩张',
  '帝旺':'巅峰期 · 高亢天助 · 若负债后运筑高台 · 防贪',
  '衰':'倦怠期 · 回收守成 · 防变动 · 休息充电',
  '病':'波折期 · 病变最乱 · 冷静检查 · 调整步伐',
  '死':'破灭期 · 脆弱时刻 · 死绝常有鬼来撞 · 外地贵人',
  '绝':'谷底期 · 空洞结束 · 一切变量九宫管 · 置之死地而后生',
};
function tianEnergy(n:number):string { const d=n%10; return ENERGY[(10-d)%10]; }
function otherEnergy(n:number):string { const d=n%10; return ENERGY[(12-d)%10]; }

// ── 气场名 ──
const QI: Record<number,string> = {1:'晦暗',2:'享成',3:'争夺',4:'付出',5:'名望',6:'入库',7:'升格',8:'开拓',9:'转变'};
export const QI_DESC: Record<string,string> = {
  '晦暗':'隐藏·危机·暗财·低调','享成':'天助·贵人·懒散·回报','争夺':'竞争·起伏·官司·团结',
  '付出':'耕耘·奉献·只出不进·置产','名望':'光芒·知名度·新事物·上层贵人',
  '入库':'财气·收成·劫财·守成','升格':'成长·提升·官司·承接',
  '开拓':'新方向·压力·假象·突破','转变':'转型·扭转·变动·调整'
};

// ── 流年策略 ──
export const STRATEGY: Record<string,{upper:string;self:string;lower:string;outer:string}> = {
  '晦暗':{upper:'低调安分，维持伦理，不可投机',self:'控制脾气，和气生财，暗财滚滚',lower:'小心交友，防意外',outer:'外部暗流，宜静不宜动'},
  '享成':{upper:'经营上层，感恩回报，不可懒散',self:'五鬼运财，不可倦怠',lower:'周边贵人，授权属下',outer:'外部贵人相助'},
  '争夺':{upper:'团结和解，息事宁人，避免诉讼',self:'忌贪，重大决策三思',lower:'易有纷争，激励团队',outer:'外部竞争激烈'},
  '付出':{upper:'深耕内部，不宜扩张，可置产',self:'财不露白，勿投资',lower:'训练属下，防人才流失',outer:'外部机会少'},
  '名望':{upper:'求新事物，经营上层人际关系',self:'本业财富，多做多得',lower:'得人才，结婚佳',outer:'外部知名度提升'},
  '入库':{upper:'求财禄，提升产品价值',self:'收账时机，保存实力',lower:'管账为主，花钱置产',outer:'外部财气旺'},
  '升格':{upper:'稳健成长，防官司，原有基础发展',self:'钱财重叠，由一为二',lower:'授权为主，防合伙拆伙',outer:'外部有提升机会'},
  '开拓':{upper:'开拓新方向，找财气旺者合作',self:'借力使力，防破财',lower:'招募新人，勿投资',outer:'外部有新方向'},
  '转变':{upper:'转型调整，扭转乾坤',self:'调整心态，顺势而为',lower:'调整团队，适应变化',outer:'外部平稳'},
};

// ── 岁值星 ──
const SUIZHI = ['依附星(合伙星)','权星(带动星)','空亡星(红鸾星)','车星(动力星)','田宅星(口舌星)','倦怠星(守成星)','驿马星(奔驰星)','孤星(开发星)','机运星(天喜星)','五鬼星(贪婪星)'];
const SZ_DESC = ['攀附合作，合伙创业佳，注意对象','掌权机会，带动组织，宜把握升官','思绪易断，宗教洗礼，婚嫁怀孕佳','忙碌奔波，交通工具问题多，防意外','置产修屋，口舌是非，靠嘴吃饭者佳','倦怠守成，宜守不宜攻，储存能量','奔驰远行，稳定长程奔波，不易疲惫','独立开拓，靠自己，合作难，感情波折','机运贵人，长辈牵线，天喜星动','多变杂乱，是非小人，忌贪忌投机'];

// ── 局差/质数 ──
const JU_DESC = ['经营自己，求稳定平安，需靠山名气','紧跟贵人，不可独闯，跟随得第一','兢兢业业，白手起家，劳碌得天下','福禄双全，用心惜福，士农工商皆宜','志向远大，只羡王权，求功名'];
const JU_ADVICE = ['需名气靠山，不可意气用事','紧跟贵人，自己第一，不可独闯','白手起家，劳碌不可安逸','福报深厚，用心惜福坚持','志向远大，放下宗教执念'];
const ZHI_DESC = ['文曲星·隐藏深沉，智慧财富，需合作','权星·掌权欲望，带动力强，适合领导','辅星·文书辅助，能说能写，完美规划','车星·动力活力，速度行动，外向开拓','福临星·口舌宣传，天助人助，先天能讲','库星·稳定守成，适合管理财务','驿马星·奔驰远行，适合外乡发展','孤星·开发独立，刚毅开拓，自我性强','金贵星·机运成果，与官家有缘','精灵星·变化悟性，起伏大，聪明脾气大'];

// ── 管理IQ ──
const MGT_MAP: Record<number,[string,number,string]> = {
  1:['流水型',60,'模仿型管理，需样板可学习'],2:['林木型',75,'稳健培植型，经验累积'],
  3:['太阳型',70,'魅力型，光芒四射，自我推销'],4:['月亮型',80,'民粹型，影响力大，乱中崛起'],
  5:['天空型',90,'容纳型，管理天才，白手起家'],6:['地上型',70,'复合型，配合度高，潜藏管理'],
  7:['高山型',65,'扎实型，副手/幕后，时间愈长愈稳'],8:['急风型',80,'迅雷型，再生快，雷厉风行'],
  9:['火炎型',60,'自我型，专业性管理，不按理出牌'],
};

// ── 90年运势卷轴 ──
const GROUPS = [
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

// ══════════ 五行生克解读 ══════════
function wuxingRelation(a:string, b:string): '生'|'克'|'平' {
  if (a===b) return '平';
  const order: Record<string,number> = {'木':1,'火':2,'土':3,'金':4,'水':5};
  const ai=order[a]||0, bi=order[b]||0;
  if ((ai+1)%5+1===bi) return '生'; // a生b
  if ((bi+1)%5+1===ai) return '克'; // a克b
  return '克'; // 反克也算克
}

function xinggeDesc(tianWx:string, renWx:string): string {
  const rel = wuxingRelation(tianWx, renWx);
  const map: Record<string,Record<string,string>> = {
    '木':{'生':'木生火：主观倔强，自信独立，适合教育行业','平':'木木比和：自我意识强，独立自主','克':'木克土：擅企划，固执，外乡缘佳'},
    '火':{'生':'火生土：外柔内倔，保护主义，工作能力强','平':'火火比和：热情主动，感染力强','克':'火克金：多思多虑，谨慎，双重性格'},
    '土':{'生':'土生金：稳定保守，善于承接，重情面','平':'土土比和：稳重踏实，包容力强','克':'土克水：乐天，爱幻想，生意人多'},
    '金':{'生':'金生水：善于思考，耐力足，沟通能力强','平':'金金比和：刚毅果断，执行力强','克':'金克木：主观果断，不信邪，创新'},
    '水':{'生':'水生木：聪明多变化，善于借力','平':'水水比和：灵活变通，适应力强','克':'水克火：感性热诚，学习力强，易情绪化'},
  };
  return map[tianWx]?.[rel==='生'?'生':rel==='平'?'平':'克'] ?? `${tianWx}${rel==='生'?'生':'克'}${renWx}`;
}

// ══════════ 主入口 ══════════
export interface JiugongFull {
  name:string;year:number;month:number;day:number;
  strokes:number[];total:number;
  tian:number;ren:number;di:number;zong:number;wai:number;
  tianWx:string;renWx:string;diWx:string;
  xuAge:number;mainNum:number;
  ju:number;zhi:number;juDesc:string;juAdvice:string;zhiDesc:string;
  secondStroke:number;
  mgtType:string;mgtScore:number;mgtDesc:string;
  thinkFunc:string;actionFunc:string;xinggeDetail:string;
  marriageType:string;marriageDesc:string;marriageDetail:string;
  wealthType:string;wealthDesc:string;wealthAdvice:string;
  pathType:string;pathDesc:string;
  ageStar:string;ageStarDesc:string;
  upperQi:string;selfQi:string;lowerQi:string;outerQi:string;
  tianE:string;renE:string;diE:string;zongE:string;
  upperColl:number[];selfColl:number[];lowerColl:number[];
  groups:{name:string;ages:string;gua:string;koujue:string;jie:string}[];
  yearMap:{age:number;year:number;group:string;gua:string;koujue:string;jie:string}[];
  strategy:{upper:string;self:string;lower:string;outer:string};
}

export function calcFull(name:string,year:number,month:number,day:number):JiugongFull {
  const raw = name.replace(/\s/g,'');

  // ── 复姓检测 ──
  let surnameStrokes: number[], givenStrokes: number[];
  const isCompound = [...COMPOUND_SURNAMES].some(s => raw.startsWith(s));
  if (isCompound) {
    const compoundName = [...COMPOUND_SURNAMES].find(s => raw.startsWith(s))!;
    const compoundLen = compoundName.length;
    surnameStrokes = [...compoundName].map(getStroke);
    givenStrokes = [...raw.slice(compoundLen)].map(getStroke);
  } else {
    surnameStrokes = [getStroke(raw[0])];
    givenStrokes = [...raw.slice(1)].map(getStroke);
  }

  const strokes = [...surnameStrokes, ...givenStrokes];
  const total = strokes.reduce((a,b)=>a+b,0);
  const surnameTotal = surnameStrokes.reduce((a,b)=>a+b,0);

  // ── 五格计算 ──
  let tian:number, ren:number, di:number;
  if (isCompound) {
    tian = surnameTotal;
    ren = surnameStrokes[surnameStrokes.length-1] + (givenStrokes[0]||1);
    di = givenStrokes.length >= 2 ? givenStrokes[0]+givenStrokes[1] : (givenStrokes[0]||1)+1;
  } else if (strokes.length >= 3) {
    // 单姓+双字名
    tian = surnameStrokes[0] + 1;
    ren = surnameStrokes[0] + givenStrokes[0];
    di = givenStrokes.length >= 2 ? givenStrokes[0]+givenStrokes[1] : givenStrokes[0]+1;
  } else {
    // 单姓+单字名
    tian = surnameStrokes[0] + 1;
    ren = surnameStrokes[0] + (givenStrokes[0]||1);
    di = (givenStrokes[0]||1) + 1;
  }
  const zong = total;
  const wai = zong - ren + 1;

  // 五行
  const tianWx=wx(tian), renWx=wx(ren), diWx=wx(di);

  // ── 虚岁 ──
  const now=new Date(), birth=new Date(year,month-1,day);
  let age=now.getFullYear()-birth.getFullYear();
  if(now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate()))age--;
  const xuAge=age+1;

  // ── 主数 ──
  const mainNum = digitSum(now.getFullYear()-1111);

  // ── 四大关系气场 ──
  const upperQiNum=mod9(mainNum-tian), selfQiNum=mod9(mainNum-ren), lowerQiNum=mod9(mainNum-di), outerQiNum=mod9(mainNum-zong);
  const upperQi=QI[upperQiNum]||'名望', selfQi=QI[selfQiNum]||'名望', lowerQi=QI[lowerQiNum]||'名望', outerQi=QI[outerQiNum]||'名望';

  // ── 能量 ──
  const tianE=tianEnergy(tian), renE=otherEnergy(ren), diE=otherEnergy(di), zongE=otherEnergy(zong);

  // ── 碰撞 ──
  const colTian = ENERGY.indexOf(tianE), colRen = ENERGY.indexOf(renE), colDi = ENERGY.indexOf(diE);
  const upperColl=Array.from({length:9},(_,i)=>colTian+1+i*10).filter(n=>n<=90);
  const selfColl=Array.from({length:9},(_,i)=>colRen+1+i*10).filter(n=>n<=90);
  const lowerColl=Array.from({length:9},(_,i)=>colDi+1+i*10).filter(n=>n<=90);

  // ── 局差/质数 ──
  const tens=Math.floor(total/10),ones=total%10;let ju=Math.abs(tens-ones);
  if(ju>4)ju=(Math.min(tens,ones)+9)-Math.max(tens,ones);
  const zhi=total%10;

  // ── 第二字笔画(管理IQ) ──
  const secondStroke = strokes.length>=2 ? strokes[1] : (strokes[0]||10);
  const mgtKey = secondStroke>9 ? digitSum(secondStroke) : secondStroke;
  const [mgtType,mgtScore,mgtDescRaw] = MGT_MAP[mgtKey]||['流水型',60,''];
  const mgtDesc = `${mgtType}·${mgtDescRaw}`;

  // ── 五行性格 ──
  const thinkFunc = `${tianWx}${wuxingRelation(tianWx,renWx)==='生'?'生':wuxingRelation(tianWx,renWx)==='平'?'平':'克'}${renWx}`;
  const actionFunc = `${renWx}${wuxingRelation(renWx,diWx)==='生'?'生':wuxingRelation(renWx,diWx)==='平'?'平':'克'}${diWx}`;
  const xinggeDetail = xinggeDesc(tianWx, renWx);

  // ── 婚姻 ──
  const ren2di = wuxingRelation(renWx, diWx);
  let marriageType:string, marriageDesc:string, marriageDetail:string;
  if (renWx===diWx) {
    marriageType='双象';marriageDesc='第一次缘份易断，需理性抉择';marriageDetail='人格与地格同五行：平双或阴阳双象。双方气场相近，但第一次缘分容易断，需要更多的理性沟通与抉择。';
  } else if (ren2di==='生') {
    marriageType='旺象';marriageDesc='主动奉献，疼爱对方，易找到中意伴侣';marriageDetail=`${renWx}生${diWx}：人格生地格，旺象。你主动付出、疼爱对方，感情中较为主导，容易遇到中意的伴侣。但需防感情转移。`;
  } else if (wuxingRelation(diWx, renWx)==='生') {
    marriageType='淡象';marriageDesc='较自恋，易被宠爱，婚期较晚';marriageDetail=`${diWx}生${renWx}：地格生人格，淡象。你较被动接受，容易被对方宠爱，但也容易自恋。婚期可能较晚，需防房中冷淡。`;
  } else {
    marriageType='破象';marriageDesc='波折较多，需用心经营';
    marriageDetail=`${renWx}克${diWx}：人格克地格，破象。感情中波折较多，需早婚或异地，避免聚少离多。建议用心经营，互相包容。`;
  }

  // ── 财运 ──
  let wealthType:string, wealthDesc:string, wealthAdvice:string;
  if (renWx===diWx) {
    wealthType='库平';wealthDesc='从商格，说话不清不楚，价码模糊';wealthAdvice='适合从商，谈判时注意语言清晰，价码明确。';
  } else if (ren2di==='生') {
    wealthType='库泄';wealthDesc='花钱享受型，钱如流水，需记账定存';wealthAdvice='钱如流水，建议记账、定期存款、购买保险，防过度消费。';
  } else if (wuxingRelation(diWx, renWx)==='生') {
    wealthType='库旺';wealthDesc='守得住财，成功企业家多为此型';wealthAdvice='守财能力好，适合投资理财，但忌贪心冒进。';
  } else {
    wealthType='库破';wealthDesc='不大破不罢休，忌投机';
    const wxOrders: Record<string,number> = {木:1,火:2,土:3,金:4,水:5};
    const ri=wxOrders[renWx]||0, di=wxOrders[diWx]||0;
    if ((ri+1)%5+1===di) wealthAdvice='人格生地格，表面旺实则泄财，需记账定存。';
    else if ((di+1)%5+1===ri) wealthAdvice='地格生人格，虽有外财但留不住，投资需谨慎。';
    else wealthAdvice='忌投机，流年不好时绝不可大投资。稳健理财，保本为先。';
  }
  // 财库通路
  const diff=Math.abs(ren-di);
  let pathType:string, pathDesc:string;
  if (diff===0) { pathType='名气暗财';pathDesc='靠知名度，敢冒险，大起大落。适合利用名声变现。'; }
  else if (diff<=1||diff>=9) { pathType='能力正财';pathDesc='白手起家，攀附合作，易得贵人资助。赚钱能力强。'; }
  else if (diff<=3||diff>=7) { pathType='机运正财';pathDesc='贵气，靠人际关系，从商与官家打交道。'; }
  else { pathType='机运暗财';pathDesc='受栽培，吸金强，适合金融娱乐行业。'; }

  // ── 岁值星 ──
  const szIdx=xuAge%10;

  // ── 90年运势 ──
  const startGroup=zong%10;
  const ageNames=['1-9岁','10-18岁','19-27岁','28-36岁','37-45岁','46-54岁','55-63岁','64-72岁','73-81岁','82-90岁'];
  const groups=Array.from({length:10},(_,i)=>GROUPS[(startGroup+i)%10]).map((g,i)=>({...g,ages:ageNames[i]}));
  const yearMap=Array.from({length:90},(_,i)=>{
    const gIdx=Math.floor(i/9);
    const gi=(startGroup+gIdx)%10;
    return {age:i+1,year:year+i,group:GROUPS[gi].name,gua:GROUPS[gi].gua,koujue:GROUPS[gi].koujue,jie:GROUPS[gi].jie};
  });

  // ── 策略 ──
  const strategy = STRATEGY[selfQi] || STRATEGY['名望'];

  return {name,year,month,day,strokes,total,tian,ren,di,zong,wai,tianWx,renWx,diWx,
    xuAge,mainNum,ju,zhi,juDesc:JU_DESC[ju],juAdvice:JU_ADVICE[ju],zhiDesc:ZHI_DESC[zhi],
    secondStroke,mgtType,mgtScore,mgtDesc,
    thinkFunc,actionFunc,xinggeDetail,
    marriageType,marriageDesc,marriageDetail,
    wealthType,wealthDesc,wealthAdvice,
    pathType,pathDesc,
    ageStar:SUIZHI[szIdx],ageStarDesc:SZ_DESC[szIdx],
    upperQi,selfQi,lowerQi,outerQi,
    tianE,renE,diE,zongE,
    upperColl,selfColl,lowerColl,
    groups,yearMap,strategy};
}
