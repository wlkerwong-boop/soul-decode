// ═══════════════════════════════════════════════════════
// 九宫姓名学 · 全维引擎 v4
// 基于docx原始文档 + PDF + Excel 逐条对照修正
// ═══════════════════════════════════════════════════════

// ── 康熙字典 ──
let kangxi: Map<string,number> | null = null;
export async function loadKangxi(): Promise<void> {
  if (kangxi) return;
  const r = await fetch('/data/kangxi-strokes.json');
  kangxi = new Map(Object.entries(await r.json()));
}

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
  const r = radicalStroke(char);
  if (r > 0) {
    const rest = char.replace(/^[氵扌忄犭王礻衤月艹辶阝]/,'').replace(/阝$/,'');
    return r + (rest ? (kangxi?.get(rest) ?? 10) : 0);
  }
  return kangxi?.get(char) ?? 10;
}

// ── 基础工具 ──
const WX = ['水','木','木','火','火','土','土','金','金','水'];
export const wx = (n:number)=>WX[n%10];
const mod9 = (n:number)=>{let r=n%9;return r<=0?r+9:r;};
const digitSum = (n:number)=>{let s=String(n);while(s.length>1)s=String([...s].reduce((a,b)=>a+ +b,0));return +s;};

// ── 十大能量列表(文档原文:天格→帝旺,人格/地格/总格→冠带) ──
const ENERGY = ['帝旺','临官','冠带','长生','养','胎','绝','死','病','衰'];
function tianEnergy(n:number):string { // 天格:个位→帝旺(position 0)
  const d=n%10; return ENERGY[(10-d)%10];
}
function otherEnergy(n:number):string { // 人格/地格/总格:个位→冠带(position 2)
  const d=n%10; return ENERGY[(12-d)%10];
}

// ── 气场名 ──
const QI: Record<number,string> = {1:'晦暗',2:'享成',3:'争夺',4:'付出',5:'名望',6:'入库',7:'升格',8:'开拓',9:'转变'};
const QI_DESC: Record<string,string> = {
  '晦暗':'隐藏·危机·暗财·低调','享成':'天助·贵人·懒散·回报','争夺':'竞争·起伏·官司·团结',
  '付出':'耕耘·奉献·只出不进·置产','名望':'光芒·知名度·新事物·上层贵人',
  '入库':'财气·收成·劫财·守成','升格':'成长·提升·官司·承接',
  '开拓':'新方向·压力·假象·突破','转变':'转型·扭转·变动·调整'
};

// ── 岁值星(文档原文:虚岁尾数→10种星) ──
const SUIZHI = ['依附星(合伙星)','权星(带动星)','空亡星(红鸾星)','车星(动力星)','田宅星(口舌星)','倦怠星(守成星)','驿马星(奔驰星)','孤星(开发星)','机运星(天喜星)','五鬼星(贪婪星)'];
const SZ_DESC = ['合伙创业佳，注意对象','掌权机会，带动组织','思绪易断，婚嫁怀孕佳','忙碌奔波，防意外','置产修屋，靠嘴吃饭','守成为主，储存能量','奔驰远行','独立开拓，合作难','贵人相助','忌贪忌投机'];

// ── 局差 ──
const JU_DESC = ['经营自己，求稳定平安','紧跟贵人，不可独闯','兢兢业业，白手起家','福禄双全，用心惜福','志向远大，求功名'];
const ZHI_DESC = ['文曲星·隐藏深沉','权星·掌权欲望','辅星·文书辅助','车星·动力活力','福临星·口舌宣传','库星·稳定守成','驿马星·奔驰远行','孤星·开发独立','金贵星·机运成果','精灵星·变化悟性'];

// ── 管理IQ ──
const MGT: Record<number,[string,number,string]> = {
  1:['流水型',60,'模仿型'],2:['林木型',75,'稳健培植型'],3:['太阳型',70,'魅力型'],
  4:['月亮型',80,'民粹型'],5:['天空型',90,'管理天才'],6:['地上型',70,'复合型'],
  7:['高山型',65,'扎实型'],8:['急风型',80,'迅雷型'],9:['火炎型',60,'自我型'],
};

// ── 90年运势(Excel原文) ──
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

// ══════════ 主计算 ══════════
export interface JiugongFull {
  name:string;year:number;month:number;day:number;
  strokes:number[];total:number;
  tian:number;ren:number;di:number;zong:number;wai:number;
  tianWx:string;renWx:string;diWx:string;
  xuAge:number;mainNum:number;
  ju:number;zhi:number;juDesc:string;zhiDesc:string;
  mgtType:string;mgtScore:number;mgtDesc:string;
  marriageType:string;marriageDesc:string;
  wealthType:string;wealthDesc:string;
  pathType:string;pathDesc:string;
  ageStar:string;ageStarDesc:string;
  upperQi:string;selfQi:string;lowerQi:string;outerQi:string;
  tianE:string;renE:string;diE:string;zongE:string;
  upperColl:number[];selfColl:number[];lowerColl:number[];
  groups:{name:string;ages:string;gua:string;koujue:string;jie:string}[];
  yearMap:{age:number;year:number;group:string;gua:string;koujue:string;jie:string}[];
}

export function calcFull(name:string,year:number,month:number,day:number):JiugongFull {
  const chars=Array.from(name), strokes=chars.map(getStroke), total=strokes.reduce((a,b)=>a+b,0);
  
  // 五格
  const isDouble = strokes.length>=4;
  const tian = isDouble ? strokes[0]+strokes[1] : strokes[0]+1;
  const ren = isDouble ? strokes[1]+(strokes[2]||1) : strokes[0]+(strokes[1]||1);
  const di = strokes.length>=3 ? strokes[1]+strokes[2] : (strokes[1]||1)+1;
  const zong = total;
  const wai = zong-ren+1;
  
  // 虚岁
  const now=new Date(), birth=new Date(year,month-1,day);
  let age=now.getFullYear()-birth.getFullYear();
  if(now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate()))age--;
  const xuAge=age+1;
  
  // 主数(文档:当年年份-1111,位数相加)
  const mainNum = digitSum(now.getFullYear()-1111);
  
  // 四大关系气场(文档:主数-各格,不够减+9)
  const upperQiNum=mod9(mainNum-tian), selfQiNum=mod9(mainNum-ren), lowerQiNum=mod9(mainNum-di), outerQiNum=mod9(mainNum-zong);
  const upperQi=QI[upperQiNum]||'名望', selfQi=QI[selfQiNum]||'名望', lowerQi=QI[lowerQiNum]||'名望', outerQi=QI[outerQiNum]||'名望';
  
  // 能量(文档修正:天格→帝旺,其它→冠带)
  const tianE=tianEnergy(tian), renE=otherEnergy(ren), diE=otherEnergy(di), zongE=otherEnergy(zong);
  
  // 碰撞(每10年一次,从能量位开始)
  const colTian = ENERGY.indexOf(tianE), colRen = ENERGY.indexOf(renE), colDi = ENERGY.indexOf(diE);
  const upperColl=Array.from({length:9},(_,i)=>colTian+1+i*10).filter(n=>n<=90);
  const selfColl=Array.from({length:9},(_,i)=>colRen+1+i*10).filter(n=>n<=90);
  const lowerColl=Array.from({length:9},(_,i)=>colDi+1+i*10).filter(n=>n<=90);
  
  // 局差/质数
  const tens=Math.floor(total/10),ones=total%10;let ju=Math.abs(tens-ones);
  if(ju>4)ju=(Math.min(tens,ones)+9)-Math.max(tens,ones);
  const zhi=total%10;
  
  // 管理IQ(名字第二字笔画)
  const mgtKey=(strokes[1]??strokes[0])>9?digitSum(strokes[1]??strokes[0]):(strokes[1]??strokes[0]);
  const [mgtType,mgtScore,mgtDesc]=MGT[mgtKey]||['流水型',60,''];
  
  // 五行生克辅助
  const wxOrd=(w:string)=>({木:1,火:2,土:3,金:4,水:5}as Record<string,number>)[w]||0;
  const gen=(wxOrd(wx(ren))-wxOrd(wx(di))+5)%5;
  const tianWx=wx(tian),renWx2=wx(ren),diWx2=wx(di);
  
  // 婚姻
  const mar=gen===0?['双象','第一次缘份易断，需理性抉择']:gen===1||gen===3?['旺象','主动奉献，疼爱对方，易找到中意伴侣']:gen===2||gen===4?['淡象','较自恋，易被宠爱，婚期较晚']:['破象','波折较多，需用心经营'];
  
  // 财运
  const wea=gen===0?['库平','从商格，说话不清不楚']:gen===2||gen===4?['库旺','守得住财，成功企业家多为此型']:gen===1||gen===3?['库泄','花钱享受型，钱如流水']:['库破','不大破不罢休，忌投机'];
  const diff=Math.abs(ren-di);
  const pi=diff===0?0:diff<=1||diff>=9?1:diff<=3||diff>=7?2:3;
  const paths:[string,string][]=[['名气暗财','靠知名度，大起大落'],['能力正财','实力派，脚踏实地'],['机运正财','贵气，靠人际关系'],['机运暗财','受栽培，吸金强']];
  
  // 岁值星
  const szIdx=xuAge%10;
  
  // 90年运势卷轴(PDF+Excel:总格个位数决定起始组,直接映射0→专注运)
  const startGroup=zong%10;
  const ageNames=['1-9岁','10-18岁','19-27岁','28-36岁','37-45岁','46-54岁','55-63岁','64-72岁','73-81岁','82-90岁'];
  const groups=Array.from({length:10},(_,i)=>GROUPS[(startGroup+i)%10]).map((g,i)=>({...g,ages:ageNames[i]}));
  
  // 逐年运势映射
  const yearMap=Array.from({length:90},(_,i)=>{const gIdx=Math.floor(i/9);const gi=(startGroup+gIdx)%10;return{age:i+1,year:year+i,group:GROUPS[gi].name,gua:GROUPS[gi].gua,koujue:GROUPS[gi].koujue,jie:GROUPS[gi].jie};});
  
  return{name,year,month,day,strokes,total,tian,ren,di,zong,wai,tianWx:wx(tian),renWx:wx(ren),diWx:wx(di),
    xuAge,mainNum,ju,zhi,juDesc:JU_DESC[ju],zhiDesc:ZHI_DESC[zhi],
    mgtType,mgtScore,mgtDesc:`${mgtType}·${mgtDesc}`,
    marriageType:mar[0],marriageDesc:mar[1],wealthType:wea[0],wealthDesc:wea[1],
    pathType:paths[pi][0],pathDesc:paths[pi][1],
    ageStar:SUIZHI[szIdx],ageStarDesc:SZ_DESC[szIdx],
    upperQi,selfQi,lowerQi,outerQi,
    tianE,renE,diE,zongE,
    upperColl,selfColl,lowerColl,
    groups,yearMap};
}
