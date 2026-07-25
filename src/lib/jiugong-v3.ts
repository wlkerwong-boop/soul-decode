// ═══════════════════════════════════════════════════════
// 九宫学理 · 引擎 v5 — 逐条对照技术规格文档修正
// ═══════════════════════════════════════════════════════

let kangxi: Map<string,number> | null = null;
export async function loadKangxi(): Promise<void> {
  if (kangxi) return;
  kangxi = new Map(Object.entries(await (await fetch('/data/kangxi-strokes.json')).json()));
}

// ── 部首 ──
function radStroke(c: string): number {
  if (/^[氵扌忄犭]/.test(c)) return 4; if (/^[王礻]/.test(c)) return 5;
  if (/^[衤月艹]/.test(c)) return 6; if (c.startsWith('辶')) return 7;
  if (c.startsWith('阝')) return 8; if (c.endsWith('阝')) return 7;
  return 0;
}
export function getStroke(c: string): number {
  const r = radStroke(c);
  if (r>0) { const rest=c.replace(/^[氵扌忄犭王礻衤月艹辶阝]/,'').replace(/阝$/,''); return r+(rest?(kangxi?.get(rest)??10):0); }
  return kangxi?.get(c)??10;
}

// ── 基础 ──
const WX=['水','木','木','火','火','土','土','金','金','水'];
const dsum=(n:number)=>{let s=String(n);while(s.length>1)s=String([...s].reduce((a,b)=>a+ +b,0));return +s;};

// ── 流年运势10态 (§9: 冠带→临官→帝旺→衰→病→死→绝→胎→养→长生) ──
const YUN=['冠带','临官','帝旺','衰','病','死','绝','胎','养','长生'];
const YUN_DESC: Record<string,string>={
  '冠带':'发挥本质最大，主动运','临官':'扩大发展，主动运','帝旺':'能量最强也最乱',
  '衰':'守住退守，被动运','病':'变化与乱，需谨慎','死':'终止停顿，不宜妄动',
  '绝':'空窗期，等待时机','胎':'新想法，新的开始','养':'积累培养','长生':'突破期，被动运'
};

// ── 局差 (§3.1) ──
const JU_DESC=['先求稳定与平安，若想更上一层楼要有名气与靠山','今生前程不远求，紧跟贵人得第一','劳劳碌碌皆辛苦，竞竞业业得天下','士农工商我皆通，但求用心和惜福','志向大海一片天，将相王侯皆不限'];

// ── 质 (§3.2: 0=依附星,1=权星,...,8=天喜星,9=五鬼星) ──
const ZHI: Record<number,{name:string;element:string;desc:string}>={
  0:{name:'依附星',element:'阴水',desc:'合作型，攀附力强，适合合伙'},
  1:{name:'权星',element:'阳木',desc:'管理型，掌权欲强，带动力强'},
  2:{name:'相星',element:'阴木',desc:'辅佐型，能说能写，完美规划'},
  3:{name:'车星',element:'阳火',desc:'动力型，活力速度，适合业务'},
  4:{name:'田宅星',element:'阴火',desc:'传达型，口才好，有天助'},
  5:{name:'库星',element:'阳土',desc:'储存型，稳定守成，适合管财'},
  6:{name:'驿马星',element:'阴土',desc:'奔驰型，适合远方，易出CEO'},
  7:{name:'孤星',element:'阳金',desc:'开发型，独立刚毅，开拓力强'},
  8:{name:'天喜星',element:'阴金',desc:'成果型，与官家有缘'},
  9:{name:'五鬼星',element:'阳水',desc:'变化型，破坏与创意并存'},
};

// ── 星运 (§7: 总笔画→星运) ──
const XINGYUN: Record<number,string>={10:'零暗星',11:'接替星',12:'背景星',13:'天机星',14:'孤克星',15:'福寿星',16:'厚重星',17:'刚强星',18:'显达星',19:'辛苦星',20:'暗金星',21:'争权星',22:'秋霜星',23:'旭日星',24:'福德星',25:'资财星',26:'变怪星',27:'增长星',28:'阔达星',29:'智略星',30:'经营星',31:'勇明星',32:'侥幸星',33:'背景星',34:'破家星',35:'温和星',36:'领袖星',37:'威严星',38:'艺术星',39:'权贵星',40:'胆识星',41:'高瞻星',42:'宽厚星',43:'风光星',44:'隐士星',45:'顺境星',46:'散财星',47:'精进星',48:'才艺星',49:'虚浮星',50:'满贯星'};
const XINGYUN_DESC: Record<number,string>={10:'隐而不发，需外力触发',11:'承接旧业，守成有方',12:'借光发亮，最忌独闯',13:'善用天时，随机应变',14:'独立性强，宜专业路线',15:'长寿有福，宜稳守',16:'根基深厚，大器晚成',17:'意志坚定，排除万难',18:'可出名望，宜公众人物',19:'劳碌有成，忌行险侥幸',20:'隐藏光芒，不鸣则已',21:'在斗争中成凤凰，带动力超强',22:'凌厉果断，善用势头',23:'光芒四射，人气旺盛',24:'贵人照顾，绝处逢生',25:'天生财运，善于经营',26:'变化多端，英雄豪杰',27:'与日俱增，稳步上升',28:'心胸宽阔，四海为家',29:'足智多谋，不宜妄动',30:'最会经营财富，最怕思多行少',31:'勇敢果断，迎难而上',32:'运气很好，关键时刻翻转',33:'借光发亮，最忌独闯',34:'破而后立，愈挫愈勇',35:'温文儒雅，亲和力强',36:'最易出CEO，统御四方',37:'不怒自威，令人敬畏',38:'才艺出众，审美独特',39:'有官运，宜掌握权力',40:'胆量过人，敢为人先',41:'高瞻远瞩，格局宏大',42:'宽以待人，得道多助',43:'表面风光，需防暗流',44:'大隐隐于市，内涵深厚',45:'顺风顺水，天时地利',46:'左手进右手出，需理财',47:'精益求精，工匠精神',48:'多才多艺，宜全面发展',49:'浮而不实，需脚踏实地',50:'圆满之象，功成名就'};

// ── 五行生克性格文案 ──
const WX_CHAR: Record<string,string>={
  '火克金':'多思多虑、分析推理、双重性格','金克木':'主观果断、不信邪、喜欢创新',
  '木克土':'擅企划、有计划性、懂得追随','土克水':'乐天爱幻想、善于迎合上意',
  '水克火':'感性热诚、学习力强、变通',
  '木生火':'主观倔强，自信独立，适合教育','火生土':'外柔内倔，保护主义，工作能力强',
  '土生金':'稳定保守，善于承接，重情面','金生水':'善于思考，耐力足，沟通强',
  '水生木':'聪明多变化，善于借力','平':'稳定平和，自我认知清晰'
};

// ── 10组运势完整数据 (§附录A) ──
interface GroupYear { yun:string; gua:string; koujue:string; jiedu:string; chance:string; }
const ALL_GROUPS: {name:string;years:GroupYear[]}[] = [
  {name:'专注运',years:[
    {yun:'胎',chance:'名望',gua:'空相',koujue:'一场好景似源头 竹篮打水一场空',jiedu:'太极运，乱抢乱得一场空'},
    {yun:'养',chance:'入库',gua:'守成',koujue:'问说诸事如何办 只言守成可平安',jiedu:'守成'},
    {yun:'长生',chance:'升格',gua:'无尾',koujue:'呱呱落地袍与冠 定是溥仪或刘禅',jiedu:'做什么都没有结果'},
    {yun:'冠带',chance:'开拓',gua:'破财',koujue:'看似一片好地带 左挖右垦总破财',jiedu:'换就没机会'},
    {yun:'临官',chance:'转变',gua:'翻身',koujue:'鲤鱼龙门新身换 除旧布新得满贯',jiedu:'关键卦，可被动换工作'},
    {yun:'帝旺',chance:'晦暗',gua:'遭忌',koujue:'运上大道气落地 亢龙有悔遭人忌',jiedu:'强出头势必遭忌'},
    {yun:'衰',chance:'享成',gua:'短发',koujue:'老怕空名利不来 中年达官无三载',jiedu:'换了三年也无结果'},
    {yun:'病',chance:'争夺',gua:'赔本',koujue:'安排设计来招亲 赔了夫人又折兵',jiedu:'主动投资必输'},
    {yun:'死',chance:'付出',gua:'放弃',koujue:'放弃一切觅新路 怎知此步会大输',jiedu:'不要放弃，主动都输'},
  ]},
  {name:'虚名运',years:[
    {yun:'绝',chance:'名望',gua:'虚名',koujue:'有人送终有人拱 徒有虚名一场空',jiedu:'九年就是虚名'},
    {yun:'胎',chance:'入库',gua:'套牢',koujue:'秋瑟过后寒冬至 自投罗网难逃脱',jiedu:'任何事都不要做'},
    {yun:'养',chance:'升格',gua:'贪心',koujue:'气压下降非真迹 贪心不足撑破皮',jiedu:'现象是假的'},
    {yun:'长生',chance:'开拓',gua:'奋斗',koujue:'闻鸡起舞见祖荻 图强有成靠自己',jiedu:'能得名难得财'},
    {yun:'冠带',chance:'转变',gua:'追损',koujue:'日正当中我当红 夸父追日饮长空',jiedu:'还是虚名一年白忙'},
    {yun:'临官',chance:'晦暗',gua:'盗取',koujue:'寒夜深深行急急 若非盗取亦投机',jiedu:'心里有邪念没结果'},
    {yun:'帝旺',chance:'享成',gua:'奇迹',koujue:'不管机会排第几 此去前程有奇迹',jiedu:'关键卦，求名不求利'},
    {yun:'衰',chance:'争夺',gua:'能力',koujue:'机会是好也是坏 看我贤能或庸才',jiedu:'能看出一个人的能力'},
    {yun:'病',chance:'付出',gua:'断足',koujue:'交错朋友失双足 借问足下可帮谁',jiedu:'朋友找你合作不要'},
  ]},
  {name:'功名运',years:[
    {yun:'死',chance:'名望',gua:'功名',koujue:'日月同光有奇迹 但求功名不求利',jiedu:'奇迹短暂求名不求利'},
    {yun:'绝',chance:'入库',gua:'包袱',koujue:'引狼入室变包袱 沉迷最爱必大输',jiedu:'所有不同都是引狼入室'},
    {yun:'胎',chance:'升格',gua:'承接',koujue:'承接一切看前例 若是二胎必大吉',jiedu:'旧货可接新货不行'},
    {yun:'养',chance:'开拓',gua:'惊险',koujue:'苦果徐徐布满天 渡得有惊却无险',jiedu:'不好的运慢慢来'},
    {yun:'长生',chance:'转变',gua:'苦成',koujue:'辛苦成长各参半 更上层楼在后段',jiedu:'前面辛苦后面成长'},
    {yun:'冠带',chance:'晦暗',gua:'过气',koujue:'黑夜魑魅飘忽忽 一将功成万骨枯',jiedu:'机会没了，属下易走光'},
    {yun:'临官',chance:'享成',gua:'祖德',koujue:'二品官爵诸君要 祖上有德贵人罩',jiedu:'考验人际关系'},
    {yun:'帝旺',chance:'争夺',gua:'接替',koujue:'加官进爵是天意 死了君王我接替',jiedu:'关键卦，后面十年大运'},
    {yun:'衰',chance:'付出',gua:'回收',koujue:'此段回收财官利 持续努力会升级',jiedu:'前面好最后可得利'},
  ]},
  {name:'组织运',years:[
    {yun:'病',chance:'名望',gua:'良臣',koujue:'众星拱月可上任 左右护法得良臣',jiedu:'找到好人才不能独闯'},
    {yun:'死',chance:'入库',gua:'断头',koujue:'坚守资源在本洲 强行出击必断头',jiedu:'强行出头一定有事'},
    {yun:'绝',chance:'升格',gua:'困滩',koujue:'龙困乾涸难伸展 养精蓄锐勿上滩',jiedu:'依靠组织不独立'},
    {yun:'胎',chance:'开拓',gua:'作梦',koujue:'曙光一现乍见天 就恐造成南柯梦',jiedu:'好像是机会但假象'},
    {yun:'养',chance:'转变',gua:'转机',koujue:'天窗一开新鲜气 仲夏过后大转机',jiedu:'关键卦，8月后马上转'},
    {yun:'长生',chance:'晦暗',gua:'是非',koujue:'暗夜偷生异地喜 奈何回乡满城雨',jiedu:'不能做暗事高调有是非'},
    {yun:'冠带',chance:'享成',gua:'不诚',koujue:'神仙护佑诚心客 枉然独闯难有格',jiedu:'不诚心就没有格局'},
    {yun:'临官',chance:'争夺',gua:'苦渡',koujue:'前有恶煞后有虎 此关渡得真辛苦',jiedu:'辛苦但能过'},
    {yun:'帝旺',chance:'付出',gua:'根基',koujue:'想再多闯新天地 一切成败看根基',jiedu:'看前面的基础'},
  ]},
  {name:'回收运',years:[
    {yun:'衰',chance:'名望',gua:'因果',koujue:'机运当强论成败 努力回顾前五载',jiedu:'前五年经营体现'},
    {yun:'病',chance:'入库',gua:'经营',koujue:'七分利来三分债 坚守经营可旺财',jiedu:'赚七分新亏三分旧'},
    {yun:'死',chance:'升格',gua:'层级',koujue:'龙有龙形虎有步 老鼠最盛在暗处',jiedu:'关键卦，看你的层级'},
    {yun:'绝',chance:'开拓',gua:'未开',koujue:'今想还阳又何奈 只是生门打不开',jiedu:'按兵不动生门未开'},
    {yun:'胎',chance:'转变',gua:'乾坤',koujue:'抛去以往旧包袱 扭转乾坤从头来',jiedu:'天地运要有正气'},
    {yun:'养',chance:'晦暗',gua:'投机',koujue:'黑暗煞神从天降 投得短机亏双空',jiedu:'不要投机'},
    {yun:'长生',chance:'享成',gua:'再生',koujue:'天显神机来相助 求得重生现江湖',jiedu:'天来帮助'},
    {yun:'冠带',chance:'争夺',gua:'忙碌',koujue:'帅喜印来将要旗 一夫当关万人敌',jiedu:'打好基础不可独闯'},
    {yun:'临官',chance:'付出',gua:'奔驰',koujue:'赤兔神驹风和配 日奔千里不觉累',jiedu:'不能休息要跑起来'},
  ]},
  {name:'巅峰运',years:[
    {yun:'帝旺',chance:'名望',gua:'登峰',koujue:'登峰谦卑可造极 求名得名利得利',jiedu:'最好的运，看你成就水平'},
    {yun:'衰',chance:'入库',gua:'忌贪',koujue:'有气无力节节退 贪得无厌必自毁',jiedu:'不可贪心'},
    {yun:'病',chance:'升格',gua:'图利',koujue:'原封不动难相处 转变必有利可图',jiedu:'可激流勇退变现'},
    {yun:'死',chance:'开拓',gua:'野心',koujue:'鹊巢易主鸠来占 野心勃勃速难成',jiedu:'关键卦，横向跨界要慢'},
    {yun:'绝',chance:'转变',gua:'过时',koujue:'飞龙在天已过时 再闯天关必有失',jiedu:'没机会了可转移'},
    {yun:'胎',chance:'晦暗',gua:'求藏',koujue:'昏天暗地事难解 求藏容易求脱难',jiedu:'主动退下来低调'},
    {yun:'养',chance:'享成',gua:'赐福',koujue:'天官赐福在年初 喜事可遇祸不求',jiedu:'可赐福不可解难'},
    {yun:'长生',chance:'争夺',gua:'假象',koujue:'内有困像外有机 恐是一片假象起',jiedu:'所有现象都是假的'},
    {yun:'冠带',chance:'付出',gua:'断后',koujue:'世外桃源似奇迹 忙得前段无后期',jiedu:'不可投资'},
  ]},
  {name:'靠山运',years:[
    {yun:'临官',chance:'名望',gua:'名声',koujue:'机到同时运当前 二郎神边哮天犬',jiedu:'找大靠山大你72倍'},
    {yun:'帝旺',chance:'入库',gua:'努力',koujue:'金银财宝在地底 努力挖掘莫猜疑',jiedu:'经商好从政得支持'},
    {yun:'衰',chance:'升格',gua:'栽培',koujue:'升官机会前等待 求得贵人把我栽',jiedu:'主动要求更上层'},
    {yun:'病',chance:'开拓',gua:'失蹄',koujue:'今日风采不如昔 四战三败马失蹄',jiedu:'不该投资'},
    {yun:'死',chance:'转变',gua:'转世',koujue:'山穷水尽疑无路 柳暗花明又一村',jiedu:'关键卦，看似无路却能救'},
    {yun:'绝',chance:'晦暗',gua:'乌云',koujue:'陷进泥沼无支撑 又逢满天乌云层',jiedu:'90年最不好的一年'},
    {yun:'胎',chance:'享成',gua:'回报',koujue:'前种福田好乐施 感恩回报在此时',jiedu:'只能被动等不能急'},
    {yun:'养',chance:'争夺',gua:'额外',koujue:'纷纷争争外相亲 多得一份苦煞心',jiedu:'不要多得'},
    {yun:'长生',chance:'付出',gua:'突围',koujue:'四面楚歌十面伏 突出重围江东哭',jiedu:'事业会结束'},
  ]},
  {name:'打拼运',years:[
    {yun:'冠带',chance:'名望',gua:'名望',koujue:'威震九洲是二爷 光芒四射怕引蝶',jiedu:'靠知名度，出名七分留三分'},
    {yun:'临官',chance:'入库',gua:'昙花',koujue:'拨得云开见月圆 就怕好景昙花现',jiedu:'昙花一现要低调'},
    {yun:'帝旺',chance:'升格',gua:'强敌',koujue:'更上层楼已艰辛 奈何又现程咬金',jiedu:'上去很难还有人拖后腿'},
    {yun:'衰',chance:'开拓',gua:'退隐',koujue:'缓缓衰退名难再 不如修道或吃斋',jiedu:'要退后放下修身养性'},
    {yun:'病',chance:'转变',gua:'不定',koujue:'多云阵阵不定天 早败年底晚三年',jiedu:'很不稳定的运'},
    {yun:'死',chance:'晦暗',gua:'暗渡',koujue:'暗渡陈仓免遭殃 恶名昭彰在本乡',jiedu:'不能明着做事要低调'},
    {yun:'绝',chance:'享成',gua:'贵人',koujue:'我本无心再期待 怎知贵人要安排',jiedu:'关键卦，有贵人'},
    {yun:'胎',chance:'争夺',gua:'流产',koujue:'烦烦杂杂事生机 要抢必有胎落地',jiedu:'不要去抢，一半就掉'},
    {yun:'养',chance:'付出',gua:'空欢',koujue:'处处天象皆是虚 接得召来空欢喜',jiedu:'被动接来空欢喜'},
  ]},
  {name:'小得运',years:[
    {yun:'长生',chance:'名望',gua:'小得',koujue:'天上星星仙女华 捡到小利得小发',jiedu:'适合局3，捡小利'},
    {yun:'冠带',chance:'入库',gua:'抑制',koujue:'下了金牌压岳飞 冲天之志要收回',jiedu:'要压抑处理好上层'},
    {yun:'临官',chance:'升格',gua:'兼差',koujue:'机会出现有两三 宁可双兼不要转',jiedu:'可兼差不要去转'},
    {yun:'帝旺',chance:'开拓',gua:'无果',koujue:'一片荒凉无边际 种得花果古来稀',jiedu:'不要白手起家守成'},
    {yun:'衰',chance:'转变',gua:'外乡',koujue:'此运不佳会倦怠 往外发展两冬期',jiedu:'停顿时往外发展'},
    {yun:'病',chance:'晦暗',gua:'多病',koujue:'体弱多病真无奈 雪上加霜真无奈',jiedu:'相当不好很难渡过'},
    {yun:'死',chance:'享成',gua:'机运',koujue:'机运贵人南与西 尊上亲下做几许',jiedu:'关键卦，人际好有机会'},
    {yun:'绝',chance:'争夺',gua:'忠诚',koujue:'人生自古谁无死 留取丹心照汗青',jiedu:'要光荣的死可结束'},
    {yun:'胎',chance:'付出',gua:'小利',koujue:'活气出现暗显机 少接无伤造有力',jiedu:'有人造就可得小利'},
  ]},
  {name:'追击运',years:[
    {yun:'养',chance:'名望',gua:'两仪',koujue:'阴阳两仪交互替 年初不顺年冬吉',jiedu:'九年一半好一半不好'},
    {yun:'长生',chance:'入库',gua:'正财',koujue:'暗暗吸收缓缓落 阁内成长赚得多',jiedu:'慢慢赚在里面赚'},
    {yun:'冠带',chance:'升格',gua:'升官',koujue:'盗得玉玺助帝王 获得兵权又加冠',jiedu:'帮到别人得到提升'},
    {yun:'临官',chance:'开拓',gua:'追击',koujue:'春雨绵绵偶晴天 乘胜追击在当前',jiedu:'要追上去主动去追'},
    {yun:'帝旺',chance:'转变',gua:'实虚',koujue:'高峰转变有时机 前段当实后段虚',jiedu:'前实后虚'},
    {yun:'衰',chance:'晦暗',gua:'衰退',koujue:'有人说我是鳌拜 气数将近年底来',jiedu:'越到年底越要注意'},
    {yun:'病',chance:'享成',gua:'变节',koujue:'锦上添花难封侯 变节之心已难收',jiedu:'拿不到更多可能变节'},
    {yun:'死',chance:'争夺',gua:'无依',koujue:'曾经风云功与过 今恐贬官又枷锁',jiedu:'被动低调'},
    {yun:'绝',chance:'付出',gua:'静观',koujue:'不急不忙静观望 守住旧业胜新关',jiedu:'安静观望不闯新'},
  ]},
];

// ══════════ 主入口 ══════════
export interface JiugongFull {
  name:string;year:number;month:number;day:number;total:number;
  tian:number;ren:number;di:number;zong:number;wai:number;
  tianWx:string;renWx:string;diWx:string;xuAge:number;
  ju:number;juDesc:string;zhi:number;zhiName:string;zhiElement:string;zhiDesc:string;
  xingyun:string;xingyunDesc:string;
  thinkRel:string;thinkDesc:string;actionRel:string;actionDesc:string;
  mainFunc:string;mainFuncDesc:string;
  wealthPath:string;wealthPathDesc:string;wealthPalace:string;wealthPalaceDesc:string;
  marriage:string;marriageDesc:string;
  ageStar:string;ageStarDesc:string;
  mainNum:number;
  upperQi:string;upperEnergy:string;upperGua:string;upperStrategy:string;
  selfQi:string;selfEnergy:string;selfGua:string;selfStrategy:string;
  lowerQi:string;lowerEnergy:string;lowerGua:string;lowerStrategy:string;
  outerQi:string;outerEnergy:string;outerGua:string;outerStrategy:string;
  groups:{name:string;ages:string;count:number}[];
  years:{age:number;year:number;group:string;yun:string;chance:string;gua:string;koujue:string;jiedu:string}[];
}

// ── 九象 (§10.3) ──
const XIANG: Record<number,{name:string;type:string}> = {1:{name:'晦暗',type:'副位'},2:{name:'享成',type:'正位'},3:{name:'争夺',type:'副位'},4:{name:'付出',type:'副位'},5:{name:'名望',type:'正位'},6:{name:'入库',type:'副位'},7:{name:'升格',type:'正位'},8:{name:'开拓',type:'正位'},0:{name:'转变',type:'正位'}};
const XIANG_STRATEGY: Record<string,{upper:string;self:string;lower:string;outer:string}>={
  '转变':{upper:'跟上沟通转型方向',self:'抛弃旧包袱扭转乾坤',lower:'引导下属适应变化',outer:'合作关键转折点'},
  '晦暗':{upper:'不宜主动请缨',self:'反思学习',lower:'多关心少强求',outer:'不熟领域别碰'},
  '享成':{upper:'感恩回报',self:'犒赏自己',lower:'大方分享凝聚人心',outer:'巩固合作关系'},
  '争夺':{upper:'需上层支持',self:'能力被考验',lower:'奖惩分明防挖角',outer:'守好基本盘再扩张'},
  '付出':{upper:'付出不求回报',self:'不要放弃',lower:'短期看不到回报',outer:'多付出少计较'},
  '名望':{upper:'展现专业',self:'打造个人品牌',lower:'以身作则',outer:'建立口碑'},
  '入库':{upper:'跟随既有资源',self:'守住老本不宜开创',lower:'给下属安全感',outer:'维护老客户'},
  '升格':{upper:'积极表现',self:'提升自身层级',lower:'栽培人才',outer:'适宜谈判签约'},
  '开拓':{upper:'获授权大胆前进',self:'开拓新领域',lower:'激团队士气',outer:'拓展新合作'},
};

export function calcFull(name:string,year:number,month:number,day:number):JiugongFull {
  const chars=Array.from(name), strokes=chars.map(getStroke), total=strokes.reduce((a,b)=>a+b,0);
  
  // 五格
  const isDouble=strokes.length>=4;
  const tian=isDouble?strokes[0]+strokes[1]:strokes[0]+1;
  const ren=isDouble?strokes[1]+(strokes[2]||1):strokes[0]+(strokes[1]||1);
  const di=strokes.length>=3?strokes[1]+strokes[2]:(strokes[1]||1)+1;
  const zong=total,wai=isDouble?zong-ren:zong-ren+1;
  
  // 虚岁
  const now=new Date(),birth=new Date(year,month-1,day);
  let age=now.getFullYear()-birth.getFullYear();
  if(now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate()))age--;
  const xuAge=age+1;
  
  // 局差
  const tens=Math.floor(total/10),ones=total%10;
  let ju=Math.abs(tens-ones);if(ju>4)ju=(Math.min(tens,ones)+9)-Math.max(tens,ones);
  
  // 质
  const zhi=total%10,zhiD=ZHI[zhi]||ZHI[5];
  
  // 星运
  const xy=XINGYUN[total],xyDesc=XINGYUN_DESC[total]||'';
  
  // 五行性格
  const tw=WX[tian%10],rw=WX[ren%10],dw=WX[di%10];
  const wxRel=(a:string,b:string)=>a===b?'平':((({木:1,火:2,土:3,金:4,水:5}as any)[a]-({木:1,火:2,土:3,金:4,水:5}as any)[b]+5)%5===1?'生':'克');
  const thinkRel=`${tw}${wxRel(tw,rw)}${rw}`,thinkDesc=WX_CHAR[thinkRel]||WX_CHAR[thinkRel.replace('克','').replace('生','')]||'';
  const actionRel=`${rw}${wxRel(rw,dw)}${dw}`,actionDesc=WX_CHAR[actionRel]||'';
  const wxGen=(a:string,b:string)=>(({木:1,火:2,土:3,金:4,水:5}as any)[a]-({木:1,火:2,土:3,金:4,水:5}as any)[b]+5)%5;
  const gen=wxGen(rw,dw);
  const mainFunc=gen===1||gen===3?'主功能':'副功能';
  const mainFuncDesc=mainFunc==='主功能'?'主动性强、勤劳踏实、白手起家，适合操作流年':'善用头脑、人际关系、机会点，需要合作不能独闯';
  
  // 财富
  const pdiff=Math.abs(ren-di);let pnum=pdiff>4?(Math.min(ren,di)+9)-Math.max(ren,di):pdiff;
  const PATH_DESC=['局平（名气暗财型）：靠专业成名','加1（能力暗财型）：白手起家，财库最旺','加2（能力正财型）：实力派，不能投机','加3（机运暗财型）：受栽培，赚钱无人知','加4（机运正财型）：人际关系为本，适合组织'];
  const PALACE=gen===0?['库平','从商格，说话婉转']:gen===1||gen===3?['库泄','大方型，钱留不住']:gen===4?['库旺','守财型，企业家标配']:['库破','冲动型，冲动时破财'];
  
  // 婚姻
  const mar=gen===0?['双象','势均力敌']:gen===1?['淡象','平淡自然']:gen===4?['旺象','感情兴旺']:['破象','感情有波折'];
  
  // 岁值星
  const STAR=['依附星(合伙星)','权星(带动星)','空亡星(红鸾星)','车星(动力星)','田宅星(口舌星)','倦怠星(守成星)','驿马星(奔驰星)','孤星(开发星)','机运星(天喜星)','五鬼星(贪婪星)'];
  const STAR_DESC=['攀附成长，合伙创业','掌权机会，把握表现','宗教机缘，婚嫁怀孕，切忌投机','忙碌奔波，注意交通安全','置产修屋，口舌是非','疲惫倦怠，宜守成','长程奔波，动态工作','独立开拓，难合作','贵人相助，姻缘长辈牵','是非小人，多变'];
  
  // 主数
  const mainNum=dsum(now.getFullYear()-1111);
  
  // 四格气场+能量+卦象
  function qiEnergy(n:number,grid:number,isTian:boolean):{qi:string;energy:string;gua:string;strategy:Record<string,string>}{
    const qiNum = ((mainNum-grid)%9+9)%9; // 0-8
    const qi = XIANG[qiNum]?.name||'名望';
    // 能量(§9:总笔画个位数→冠带，虚岁%10对应)
    const yunIdx=isTian?((xuAge-grid%10+10)%10):((xuAge-grid%10+10+8)%10);
    const energy=YUN[(yunIdx)%10];
    const gua=`${qi}${energy}`;
    const st=XIANG_STRATEGY[qi]||{upper:'',self:'',lower:'',outer:''};
    return{qi,energy,gua,strategy:st};
  }
  const upper=qiEnergy(mainNum,tian,true),self=qiEnergy(mainNum,ren,false),lower=qiEnergy(mainNum,di,false),outer=qiEnergy(mainNum,zong,false);
  
  // 90年运程卷轴(§11.2: 起始组=第6组(巅峰运), 从年龄2起每9年轮换)
  const groups=ALL_GROUPS.map((g,i)=>({name:g.name,ages:`${i*9+1}-${i*9+9}岁`,count:9}));
  // 重新排序: 起始=组5(巅峰运=index 5)，公式: (5 + (age-1)//9) % 10
  const reorderedGroups=Array.from({length:10},(_,i)=>ALL_GROUPS[(5+i)%10]);
  const ages=['1-9岁','10-18岁','19-27岁','28-36岁','37-45岁','46-54岁','55-63岁','64-72岁','73-81岁','82-90岁'];
  const groupOutput=reorderedGroups.map((g,i)=>({name:g.name,ages:ages[i],count:9}));
  
  // 逐年运势
  const years=Array.from({length:90},(_,i)=>{
    const a=i+1;
    const gIdx=(5+Math.floor((a-1)/9))%10;
    const pos=(a-1)%9;
    const g=ALL_GROUPS[gIdx];
    const y=g.years[pos];
    return{age:a,year:year+i,group:g.name,yun:y.yun,chance:y.chance,gua:y.gua,koujue:y.koujue,jiedu:y.jiedu};
  });
  
  return{name,year,month,day,total,tian,ren,di,zong,wai,tianWx:tw,renWx:rw,diWx:dw,xuAge,
    ju,juDesc:JU_DESC[ju],zhi,zhiName:zhiD.name,zhiElement:zhiD.element,zhiDesc:zhiD.desc,
    xingyun:xy||'(待扩充)',xingyunDesc:xyDesc||'具体星运待补充完整数据',
    thinkRel,thinkDesc,actionRel,actionDesc,mainFunc,mainFuncDesc,
    wealthPath:PATH_DESC[pnum],wealthPathDesc:'',wealthPalace:PALACE[0],wealthPalaceDesc:PALACE[1],
    marriage:mar[0],marriageDesc:mar[1],
    ageStar:STAR[xuAge%10],ageStarDesc:STAR_DESC[xuAge%10],
    mainNum,
    upperQi:upper.qi,upperEnergy:upper.energy,upperGua:upper.gua,upperStrategy:upper.strategy.upper,
    selfQi:self.qi,selfEnergy:self.energy,selfGua:self.gua,selfStrategy:self.strategy.self,
    lowerQi:lower.qi,lowerEnergy:lower.energy,lowerGua:lower.gua,lowerStrategy:lower.strategy.lower,
    outerQi:outer.qi,outerEnergy:outer.energy,outerGua:outer.gua,outerStrategy:outer.strategy.outer,
    groups:groupOutput,years};
}
