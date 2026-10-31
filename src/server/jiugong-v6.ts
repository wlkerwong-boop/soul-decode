// 九宫学理 · 引擎 v6 — 复姓天格+1, 详细数据来自jiugong-data.ts
import { JU_FULL, XINGYUN as XYN, MGT_FULL, ENERGY_FULL, SUIZHI_FULL, WX_CHAR_FULL, XIANG_STRATEGY_FULL } from './jiugong-data';
import {
  JU_INDEX, ZHI_FULL, MARRIAGE_TEMPLATES, MARRIAGE_BREAK, PERS_ACTION,
  STAR_TABLE as STAR_TABLE_V2, STAR_FORTUNE_FULL, FOUR_GRID_CE, GUAXIAN_FANXIANG,
  LIUNIAN_DETAIL, CAREER_DIR, CAREER_HEALTH, SUB_SUPPORT, ARROW_TEXT,
  CAIKU_FULL, CAIKU_JIA3, CAIKU_JIA3_NOTE, CAIGONG_XIE, CAIGONG_XIE_NOTE,
  GRID_QI, GRID_ENERGY, SUIZHI_FULL as SUIZHI_FULL_V3, ANNUAL_STRATEGY, GUAXIAN_REF,
  COLLISION_FULL, MOTHER_QI, ZHI_FAMILY, INTERNAL_ENERGY,
} from './jiugong-data-v2';
import kangxiData from './data/kangxi-strokes.json';

let kangxi: Map<string,number> | null = null;
export async function loadJiugongDictionary(): Promise<void> {
  if (kangxi) return;
  kangxi = new Map(Object.entries(kangxiData));
}

// ── 部首 ──
function radStroke(c: string): number {
  if (/^[氵扌忄犭]/.test(c)) return 4; if (/^[王礻]/.test(c)) return 5;
  if (/^[衤月艹]/.test(c)) return 6; if (c.startsWith('辶')) return 7;
  if (c.startsWith('阝')) return 8; if (c.endsWith('阝')) return 7;
  return 0;
}

// ── 简繁映射3666条 ──
const S2T: Record<string,string> = {"万":"萬","与":"與","个":"個","习":"習","乡":"鄉","书":"書","云":"雲","产":"產","亲":"親","亿":"億","仅":"僅","仆":"僕","从":"從","仑":"侖","仓":"倉","仪":"儀","们":"們","价":"價","众":"眾","优":"優","会":"會","伟":"偉","传":"傳","伤":"傷","伦":"倫","伪":"偽","体":"體","余":"餘","佣":"傭","侠":"俠","侣":"侶","侦":"偵","侧":"側","侨":"僑","侥":"僥","侯":"侯","债":"債","倾":"傾","偿":"償","储":"儲","儿":"兒","兑":"兌","兴":"興","养":"養","兰":"蘭","关":"關","兽":"獸","内":"內","册":"冊","写":"寫","军":"軍","农":"農","冯":"馮","冲":"沖","决":"決","冻":"凍","净":"淨","凄":"淒","减":"減","几":"幾","凤":"鳳","凯":"凱","击":"擊","刘":"劉","则":"則","刚":"剛","创":"創","别":"彆","剧":"劇","动":"動","勋":"勳","劳":"勞","势":"勢","务":"務","励":"勵","胜":"勝","华":"華","协":"協","单":"單","卖":"賣","卫":"衛","厂":"廠","厅":"廳","历":"歷","厉":"厲","压":"壓","厌":"厭","县":"縣","发":"發","变":"變","叠":"疊","叶":"葉","号":"號","叹":"嘆","吓":"嚇","吗":"嗎","员":"員","启":"啟","呜":"嗚","响":"響","唤":"喚","啸":"嘯","园":"園","围":"圍","图":"圖","圆":"圓","圣":"聖","场":"場","块":"塊","坚":"堅","坛":"壇","坝":"壩","垒":"壘","垦":"墾","堕":"墮","壮":"壯","声":"聲","处":"處","备":"備","复":"復","头":"頭","奋":"奮","奖":"獎","妇":"婦","妈":"媽","孙":"孫","学":"學","宁":"寧","实":"實","审":"審","宪":"憲","宫":"宮","宽":"寬","宾":"賓","对":"對","寻":"尋","导":"導","寿":"壽","将":"將","尘":"塵","尝":"嘗","尧":"堯","层":"層","属":"屬","岁":"歲","岂":"豈","岭":"嶺","岛":"島","峡":"峽","岗":"崗","崭":"嶄","币":"幣","师":"師","帘":"簾","带":"帶","帮":"幫","干":"幹","并":"並","广":"廣","庄":"莊","庆":"慶","庐":"廬","库":"庫","应":"應","庙":"廟","庞":"龐","废":"廢","异":"異","弃":"棄","张":"張","弹":"彈","录":"錄","归":"歸","当":"當","灵":"靈","灿":"燦","烂":"爛","爷":"爺","牵":"牽","犹":"猶","独":"獨","猎":"獵","获":"獲","献":"獻","毕":"畢","疗":"療","监":"監","盘":"盤","卢":"盧","盐":"鹽","盖":"蓋","瞒":"瞞","硕":"碩","码":"碼","矿":"礦","砚":"硯","础":"礎","礼":"禮","社":"社","祈":"祈","祷":"禱","祸":"禍","离":"離","种":"種","积":"積","称":"稱","稳":"穩","穷":"窮","窃":"竊","窑":"窯","窜":"竄","笔":"筆","简":"簡","签":"簽","节":"節","范":"範","荡":"蕩","药":"藥","艺":"藝","苏":"蘇","荣":"榮","落":"落","著":"著","萧":"蕭","蓝":"藍","藏":"藏","虫":"蟲","蛮":"蠻","蝉":"蟬","蜡":"蠟","袭":"襲","补":"補","装":"裝","裤":"褲","观":"觀","觉":"覺","览":"覽","触":"觸","订":"訂","认":"認","记":"記","讲":"講","证":"證","评":"評","识":"識","诉":"訴","诊":"診","词":"詞","诗":"詩","诚":"誠","话":"話","该":"該","详":"詳","语":"語","误":"誤","说":"說","请":"請","诸":"諸","课":"課","谁":"誰","调":"調","谈":"談","谋":"謀","谢":"謝","谷":"穀","财":"財","货":"貨","贪":"貪","购":"購","贮":"貯","贯":"貫","费":"費","贾":"賈","资":"資","赋":"賦","赌":"賭","赏":"賞","赔":"賠","赖":"賴","赚":"賺","赛":"賽","赞":"贊","赵":"趙","趋":"趨","跃":"躍","车":"車","转":"轉","轮":"輪","软":"軟","轻":"輕","轴":"軸","输":"輸","边":"邊","辽":"遼","达":"達","过":"過","运":"運","还":"還","进":"進","远":"遠","连":"連","选":"選","遗":"遺","邓":"鄧","邮":"郵","郑":"鄭","邻":"鄰","郁":"鬱","酸":"酸","铁":"鐵","铜":"銅","银":"銀","铸":"鑄","锁":"鎖","错":"錯","钱":"錢","钟":"鐘","鉴":"鑑","长":"長","门":"門","闭":"閉","问":"問","闹":"鬧","闻":"聞","阅":"閱","队":"隊","阳":"陽","阴":"陰","陈":"陳","陆":"陸","际":"際","险":"險","难":"難","电":"電","风":"風","飒":"颯","飞":"飛","食":"食","饭":"飯","饮":"飲","饱":"飽","饰":"飾","马":"馬","驾":"駕","骑":"騎","骗":"騙","鱼":"魚","鲁":"魯","鸟":"鳥","鸡":"雞","鸭":"鴨","鹅":"鵝","鹤":"鶴","鹂":"鸝","麦":"麥","黄":"黃","黑":"黑","齐":"齊","齿":"齒","龙":"龍","龟":"龜","晓":"曉","罗":"羅","烨":"燁"};

export function getStroke(c: string): number {
  return getStrokeInfo(c).n;
}

/** 返回笔画数 + 是否完全命中字典（未命中=估算，须前端显著提示） */
export function getStrokeInfo(c: string): { n: number; known: boolean } {
  // 优先繁体
  const trad = S2T[c];
  if (trad && kangxi?.has(trad)) return { n: kangxi.get(trad)!, known: true };
  // 整字直接查
  const full = kangxi?.get(c);
  if (full !== undefined) return { n: full, known: true };
  // 部首拆分（部首已知但余部未知 → 估算，标记 unknown）
  const r = radStroke(c);
  if (r > 0) {
    const rest = c.replace(/^[氵扌忄犭王礻衤月艹辶阝]/, '').replace(/阝$/, '');
    const restN = rest ? kangxi?.get(rest) : undefined;
    if (restN !== undefined) return { n: r + restN, known: true };
    return { n: r + (rest ? 10 : 0), known: false };
  }
  return { n: 10, known: false };
}

// ── 基础 ──
const WX=['水','木','木','火','火','土','土','金','金','水'];
const dsum=(n:number)=>{let s=String(n);while(s.length>1)s=String([...s].reduce((a,b)=>a+ +b,0));return +s;};

// ── 十种能量 ──
const YUN=['冠带','临官','帝旺','衰','病','死','绝','胎','养','长生'];
const COLLISION_ENERGY=['帝旺','临官','冠带','长生','养','胎','绝','死','病','衰'];
// ── 关键年卦象（v3.0：翻身/奇迹/接替/转机/层级/野心/转世/贵人/机运/实虚，卷轴 ★ 标注）──
const KEY_GUAXIAN=['翻身','奇迹','接替','转机','层级','野心','转世','贵人','机运','实虚'];
// ── v4.0 碰撞期推演（《推算碰撞》讲义 6.3：磁场从1起，往后格数+1起步每+9一遇；往前格数-10，再每-9）──
function collisionYearsOf(gridNum:number,maxAge=90):number[]{
  const years=new Set<number>();
  let base=gridNum+1;
  while(base<=maxAge){years.add(base);base+=9;}
  let back=gridNum-10;
  while(back>=1){years.add(back);back-=9;}
  return [...years].sort((a,b)=>a-b);
}
const isCollisionYear=(gridNum:number,xusui:number)=>collisionYearsOf(gridNum).includes(xusui);

// ── 局差简版 ──
const JU_DESC=['先求稳定与平安，更上一层楼需名气靠山','紧跟贵人得第一，不可独闯','兢兢业业得天下，劳碌辛苦','士农工商皆通，用心惜福','志向远大，求功名'];

// ── 质数 ──
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

// ── 九象
const XIANG: Record<number,string> = {1:'晦暗',2:'享成',3:'争夺',4:'付出',5:'名望',6:'入库',7:'升格',8:'开拓',0:'转变'};

// ── 岁值星
const STAR=['依附星(合伙星)','权星(带动星)','空亡星(红鸾星)','车星(动力星)','田宅星(口舌星)','倦怠星(守成星)','驿马星(奔驰星)','孤星(开发星)','机运星(天喜星)','五鬼星(贪婪星)'];
const STAR_DESC=['攀附成长，合伙创业','掌权机会，把握表现','宗教机缘，婚恋孕育，切忌投机','忙碌奔波，注意交通安全','置产修屋，口舌是非','疲惫倦怠，宜守成','长程奔波，动态工作','独立开拓，难合作','贵人相助，姻缘长辈牵','是非小人，多变'];

// ── 10组90年数据(附录A)
const ALL_GROUPS: {name:string;years:{yun:string;chance:string;gua:string;koujue:string;jiedu:string}[]}[] = [
  {name:'专注运',years:[{yun:'胎',chance:'名望',gua:'空相',koujue:'一场好景似源头 竹篮打水一场空',jiedu:'太极运，乱抢乱得一场空'},{yun:'养',chance:'入库',gua:'守成',koujue:'问说诸事如何办 只言守成可平安',jiedu:'守成'},{yun:'长生',chance:'升格',gua:'无尾',koujue:'呱呱落地袍与冠 定是溥仪或刘禅',jiedu:'做什么都没有结果'},{yun:'冠带',chance:'开拓',gua:'破财',koujue:'看似一片好地带 左挖右垦总破财',jiedu:'换就没机会'},{yun:'临官',chance:'转变',gua:'翻身',koujue:'鲤鱼龙门新身换 除旧布新得满贯',jiedu:'关键卦，可被动换工作'},{yun:'帝旺',chance:'晦暗',gua:'遭忌',koujue:'运上大道气落地 亢龙有悔遭人忌',jiedu:'强出头势必遭忌'},{yun:'衰',chance:'享成',gua:'短发',koujue:'老怕空名利不来 中年达官无三载',jiedu:'换了三年也无结果'},{yun:'病',chance:'争夺',gua:'赔本',koujue:'安排设计来招亲 赔了夫人又折兵',jiedu:'主动投资必输'},{yun:'死',chance:'付出',gua:'放弃',koujue:'放弃一切觅新路 怎知此步会大输',jiedu:'不要放弃，主动都输'}]},
  {name:'虚名运',years:[{yun:'绝',chance:'名望',gua:'虚名',koujue:'有人送终有人拱 徒有虚名一场空',jiedu:'九年就是虚名'},{yun:'胎',chance:'入库',gua:'套牢',koujue:'秋瑟过后寒冬至 自投罗网难逃脱',jiedu:'任何事都不要做'},{yun:'养',chance:'升格',gua:'贪心',koujue:'气压下降非真迹 贪心不足撑破皮',jiedu:'现象是假的'},{yun:'长生',chance:'开拓',gua:'奋斗',koujue:'闻鸡起舞见祖荻 图强有成靠自己',jiedu:'能得名难得财'},{yun:'冠带',chance:'转变',gua:'追损',koujue:'日正当中我当红 夸父追日饮长空',jiedu:'还是虚名一年白忙'},{yun:'临官',chance:'晦暗',gua:'盗取',koujue:'寒夜深深行急急 若非盗取亦投机',jiedu:'心里有邪念没结果'},{yun:'帝旺',chance:'享成',gua:'奇迹',koujue:'不管机会排第几 此去前程有奇迹',jiedu:'关键卦，求名不求利'},{yun:'衰',chance:'争夺',gua:'能力',koujue:'机会是好也是坏 看我贤能或庸才',jiedu:'能看出一个人的能力'},{yun:'病',chance:'付出',gua:'断足',koujue:'交错朋友失双足 借问足下可帮谁',jiedu:'朋友找你合作不要'}]},
  {name:'功名运',years:[{yun:'死',chance:'名望',gua:'功名',koujue:'日月同光有奇迹 但求功名不求利',jiedu:'奇迹短暂求名不求利'},{yun:'绝',chance:'入库',gua:'包袱',koujue:'引狼入室变包袱 沉迷最爱必大输',jiedu:'所有不同都是引狼入室'},{yun:'胎',chance:'升格',gua:'承接',koujue:'承接一切看前例 若是二胎必大吉',jiedu:'旧货可接新货不行'},{yun:'养',chance:'开拓',gua:'惊险',koujue:'苦果徐徐布满天 渡得有惊却无险',jiedu:'不好的运慢慢来'},{yun:'长生',chance:'转变',gua:'苦成',koujue:'辛苦成长各参半 更上层楼在后段',jiedu:'前面辛苦后面成长'},{yun:'冠带',chance:'晦暗',gua:'过气',koujue:'黑夜魑魅飘忽忽 一将功成万骨枯',jiedu:'机会没了，属下易走光'},{yun:'临官',chance:'享成',gua:'祖德',koujue:'二品官爵诸君要 祖上有德贵人罩',jiedu:'考验人际关系'},{yun:'帝旺',chance:'争夺',gua:'接替',koujue:'加官进爵是天意 死了君王我接替',jiedu:'关键卦，后面十年大运'},{yun:'衰',chance:'付出',gua:'回收',koujue:'此段回收财官利 持续努力会升级',jiedu:'前面好最后可得利'}]},
  {name:'组织运',years:[{yun:'病',chance:'名望',gua:'良臣',koujue:'众星拱月可上任 左右护法得良臣',jiedu:'找到好人才不能独闯'},{yun:'死',chance:'入库',gua:'断头',koujue:'坚守资源在本洲 强行出击必断头',jiedu:'强行出头一定有事'},{yun:'绝',chance:'升格',gua:'困滩',koujue:'龙困乾涸难伸展 养精蓄锐勿上滩',jiedu:'依靠组织不独立'},{yun:'胎',chance:'开拓',gua:'作梦',koujue:'曙光一现乍见天 就恐造成南柯梦',jiedu:'好像是机会但假象'},{yun:'养',chance:'转变',gua:'转机',koujue:'天窗一开新鲜气 仲夏过后大转机',jiedu:'关键卦，8月后马上转'},{yun:'长生',chance:'晦暗',gua:'是非',koujue:'暗夜偷生异地喜 奈何回乡满城雨',jiedu:'不能做暗事高调有是非'},{yun:'冠带',chance:'享成',gua:'不诚',koujue:'神仙护佑诚心客 枉然独闯难有格',jiedu:'不诚心就没有格局'},{yun:'临官',chance:'争夺',gua:'苦渡',koujue:'前有恶煞后有虎 此关渡得真辛苦',jiedu:'辛苦但能过'},{yun:'帝旺',chance:'付出',gua:'根基',koujue:'想再多闯新天地 一切成败看根基',jiedu:'看前面的基础'}]},
  {name:'回收运',years:[{yun:'衰',chance:'名望',gua:'因果',koujue:'机运当强论成败 努力回顾前五载',jiedu:'前五年经营体现'},{yun:'病',chance:'入库',gua:'经营',koujue:'七分利来三分债 坚守经营可旺财',jiedu:'赚七分新亏三分旧'},{yun:'死',chance:'升格',gua:'层级',koujue:'龙有龙形虎有步 老鼠最盛在暗处',jiedu:'关键卦，看你的层级'},{yun:'绝',chance:'开拓',gua:'未开',koujue:'今想还阳又何奈 只是生门打不开',jiedu:'按兵不动生门未开'},{yun:'胎',chance:'转变',gua:'乾坤',koujue:'抛去以往旧包袱 扭转乾坤从头来',jiedu:'天地运要有正气'},{yun:'养',chance:'晦暗',gua:'投机',koujue:'黑暗煞神从天降 投得短机亏双空',jiedu:'不要投机'},{yun:'长生',chance:'享成',gua:'再生',koujue:'天显神机来相助 求得重生现江湖',jiedu:'天来帮助'},{yun:'冠带',chance:'争夺',gua:'忙碌',koujue:'帅喜印来将要旗 一夫当关万人敌',jiedu:'打好基础不可独闯'},{yun:'临官',chance:'付出',gua:'奔驰',koujue:'赤兔神驹风和配 日奔千里不觉累',jiedu:'不能休息要跑起来'}]},
  {name:'巅峰运',years:[{yun:'帝旺',chance:'名望',gua:'登峰',koujue:'登峰谦卑可造极 求名得名利得利',jiedu:'最好的运，看你成就水平'},{yun:'衰',chance:'入库',gua:'忌贪',koujue:'有气无力节节退 贪得无厌必自毁',jiedu:'不可贪心'},{yun:'病',chance:'升格',gua:'图利',koujue:'原封不动难相处 转变必有利可图',jiedu:'可激流勇退变现'},{yun:'死',chance:'开拓',gua:'野心',koujue:'鹊巢易主鸠来占 野心勃勃速难成',jiedu:'关键卦，横向跨界要慢'},{yun:'绝',chance:'转变',gua:'过时',koujue:'飞龙在天已过时 再闯天关必有失',jiedu:'没机会了可转移'},{yun:'胎',chance:'晦暗',gua:'求藏',koujue:'昏天暗地事难解 求藏容易求脱难',jiedu:'主动退下来低调'},{yun:'养',chance:'享成',gua:'赐福',koujue:'天官赐福在年初 喜事可遇祸不求',jiedu:'可赐福不可解难'},{yun:'长生',chance:'争夺',gua:'假象',koujue:'内有困像外有机 恐是一片假象起',jiedu:'所有现象都是假的'},{yun:'冠带',chance:'付出',gua:'断后',koujue:'世外桃源似奇迹 忙得前段无后期',jiedu:'不可投资'}]},
  {name:'靠山运',years:[{yun:'临官',chance:'名望',gua:'名声',koujue:'机到同时运当前 二郎神边哮天犬',jiedu:'找大靠山大你72倍'},{yun:'帝旺',chance:'入库',gua:'努力',koujue:'金银财宝在地底 努力挖掘莫猜疑',jiedu:'经商好从政得支持'},{yun:'衰',chance:'升格',gua:'栽培',koujue:'升官机会前等待 求得贵人把我栽',jiedu:'主动要求更上层'},{yun:'病',chance:'开拓',gua:'失蹄',koujue:'今日风采不如昔 四战三败马失蹄',jiedu:'不该投资'},{yun:'死',chance:'转变',gua:'转世',koujue:'山穷水尽疑无路 柳暗花明又一村',jiedu:'关键卦，看似无路却能救'},{yun:'绝',chance:'晦暗',gua:'乌云',koujue:'陷进泥沼无支撑 又逢满天乌云层',jiedu:'90年最不好的一年'},{yun:'胎',chance:'享成',gua:'回报',koujue:'前种福田好乐施 感恩回报在此时',jiedu:'只能被动等不能急'},{yun:'养',chance:'争夺',gua:'额外',koujue:'纷纷争争外相亲 多得一份苦煞心',jiedu:'不要多得'},{yun:'长生',chance:'付出',gua:'突围',koujue:'四面楚歌十面伏 突出重围江东哭',jiedu:'事业会结束'}]},
  {name:'打拼运',years:[{yun:'冠带',chance:'名望',gua:'名望',koujue:'威震九洲是二爷 光芒四射怕引蝶',jiedu:'靠知名度，出名七分留三分'},{yun:'临官',chance:'入库',gua:'昙花',koujue:'拨得云开见月圆 就怕好景昙花现',jiedu:'昙花一现要低调'},{yun:'帝旺',chance:'升格',gua:'强敌',koujue:'更上层楼已艰辛 奈何又现程咬金',jiedu:'上去很难还有人拖后腿'},{yun:'衰',chance:'开拓',gua:'退隐',koujue:'缓缓衰退名难再 不如修道或吃斋',jiedu:'要退后放下修身养性'},{yun:'病',chance:'转变',gua:'不定',koujue:'多云阵阵不定天 早败年底晚三年',jiedu:'很不稳定的运'},{yun:'死',chance:'晦暗',gua:'暗渡',koujue:'暗渡陈仓免遭殃 恶名昭彰在本乡',jiedu:'不能明着做事要低调'},{yun:'绝',chance:'享成',gua:'贵人',koujue:'我本无心再期待 怎知贵人要安排',jiedu:'关键卦，有贵人'},{yun:'胎',chance:'争夺',gua:'流产',koujue:'烦烦杂杂事生机 要抢必有胎落地',jiedu:'不要去抢，一半就掉'},{yun:'养',chance:'付出',gua:'空欢',koujue:'处处天象皆是虚 接得召来空欢喜',jiedu:'被动接来空欢喜'}]},
  {name:'小得运',years:[{yun:'长生',chance:'名望',gua:'小得',koujue:'天上星星仙女华 捡到小利得小发',jiedu:'适合局3，捡小利'},{yun:'冠带',chance:'入库',gua:'抑制',koujue:'下了金牌压岳飞 冲天之志要收回',jiedu:'要压抑处理好上层'},{yun:'临官',chance:'升格',gua:'兼差',koujue:'机会出现有两三 宁可双兼不要转',jiedu:'可兼差不要去转'},{yun:'帝旺',chance:'开拓',gua:'无果',koujue:'一片荒凉无边际 种得花果古来稀',jiedu:'不要白手起家守成'},{yun:'衰',chance:'转变',gua:'外乡',koujue:'此运不佳会倦怠 往外发展两冬期',jiedu:'停顿时往外发展'},{yun:'病',chance:'晦暗',gua:'多病',koujue:'体弱多病真无奈 雪上加霜真无奈',jiedu:'相当不好很难渡过'},{yun:'死',chance:'享成',gua:'机运',koujue:'机运贵人南与西 尊上亲下做几许',jiedu:'关键卦，人际好有机会'},{yun:'绝',chance:'争夺',gua:'忠诚',koujue:'人生自古谁无死 留取丹心照汗青',jiedu:'要光荣的死可结束'},{yun:'胎',chance:'付出',gua:'小利',koujue:'活气出现暗显机 少接无伤造有力',jiedu:'有人造就可得小利'}]},
  {name:'追击运',years:[{yun:'养',chance:'名望',gua:'两仪',koujue:'阴阳两仪交互替 年初不顺年冬吉',jiedu:'九年一半好一半不好'},{yun:'长生',chance:'入库',gua:'正财',koujue:'暗暗吸收缓缓落 阁内成长赚得多',jiedu:'慢慢赚在里面赚'},{yun:'冠带',chance:'升格',gua:'升官',koujue:'盗得玉玺助帝王 获得兵权又加冠',jiedu:'帮到别人得到提升'},{yun:'临官',chance:'开拓',gua:'追击',koujue:'春雨绵绵偶晴天 乘胜追击在当前',jiedu:'要追上去主动去追'},{yun:'帝旺',chance:'转变',gua:'实虚',koujue:'高峰转变有时机 前段当实后段虚',jiedu:'前实后虚'},{yun:'衰',chance:'晦暗',gua:'衰退',koujue:'有人说我是鳌拜 气数将近年底来',jiedu:'越到年底越要注意'},{yun:'病',chance:'享成',gua:'变节',koujue:'锦上添花难封侯 变节之心已难收',jiedu:'拿不到更多可能变节'},{yun:'死',chance:'争夺',gua:'无依',koujue:'曾经风云功与过 今恐贬官又枷锁',jiedu:'被动低调'},{yun:'绝',chance:'付出',gua:'静观',koujue:'不急不忙静观望 守住旧业胜新关',jiedu:'安静观望不闯新'}]},
];

// ══════════ 接口 ══════════
export interface JiugongFull {
  name:string;year:number;month:number;day:number;total:number;
  tian:number;ren:number;di:number;zong:number;wai:number;
  tianWx:string;renWx:string;diWx:string;xuAge:number;
  ju:number;juDesc:string;juFull:string;
  zhi:number;zhiName:string;zhiElement:string;zhiDesc:string;zhiFull:string;
  xingyunName:string;xingyunFull:string;
  thinkRel:string;thinkDesc:string;wxThinkFull:string;
  actionRel:string;actionDesc:string;wxActionFull:string;
  mainFunc:string;mainFuncDesc:string;
  wealthPath:string;wealthPalace:string;wealthPalaceDesc:string;
  marriage:string;marriageDesc:string;
  ageStar:string;ageStarDesc:string;ageStarFull:string;
  mgtType:string;mgtScore:number;mgtDesc:string;mgtFull:string;
  mainNum:number;
  upperQi:string;upperEnergy:string;upperGua:string;upperStrategy:string;
  selfQi:string;selfEnergy:string;selfGua:string;selfStrategy:string;
  lowerQi:string;lowerEnergy:string;lowerGua:string;lowerStrategy:string;
  outerQi:string;outerEnergy:string;outerGua:string;outerStrategy:string;
  energyFull:Record<string,string>;
  xiangStrategy:Record<string,{upper:string;self:string;lower:string;outer:string;caution:string}>|null;
  upperColl:number[];selfColl:number[];lowerColl:number[];
  groups:{name:string;ages:string;count:number}[];
  years:{
    age:number;year:number;yun:string;chance:string;gua:string;koujue:string;jiedu:string;
    upperQi:string;upperEnergy:string;
    selfQi:string;selfEnergy:string;
    lowerQi:string;lowerEnergy:string;
    outerQi:string;outerEnergy:string;
    ageStar:string;ageStarDesc:string;
    keyYear?:boolean;              // v3.0 关键年卦象（卷轴 ★ 标注）
  }[];
  // ── v2 增量（2026-08-20 移植老唐 v2.0）──
  marriageSub?:string;                 // 双象细分：平双/阴阳双
  marriageBreakKey?:string;            // 破象克型（如水克火）
  marriageFull?:{总述?:string;缘起?:string;缘续?:string;缘灭?:string;建议?:string;要点?:string[];别名?:string;注意?:string};
  zhiMeaning?:string;zhiCaution?:string;zhiTips?:number[];           // 质三段式
  xingyunPoints?:string[];xingyunTrait?:string;xingyunMeaning?:string;xingyunCaution?:string;xingyunTips?:string;
  careerDir?:{达人:string;特质:string;职业:string};careerHealth?:string;  // 事业趋向
  arrowUp?:string;arrowDown?:string;arrowSummary?:string;             // 上下助力（箭头法）
  subSupportNum?:number;subSupport?:{要点:string;说明:string};        // 属下助力（地格合并数）
  mainFuncAction?:string;mainFuncMethod?:string;                     // 动作力/处事方法
  liunianState?:string;liunianDetail?:{副名:string;磁场?:string;动能?:string;生命力?:string;心态?:string;发展现象?:string;运用法则?:string};
  guaName?:string;guaKoujue?:string;guaJiedu?:string;guaPositive?:string;guaReverse?:string;guaShixu?:boolean;
  upperCaution?:string;upperNote?:string;selfCaution?:string;selfNote?:string;lowerCaution?:string;lowerNote?:string;outerCaution?:string;outerNote?:string;
  caiKuFull?:{类型:string;描述:string;详解:string[]};caiKuJia3?:string[];caiKuJia3Note?:string;
  caigongXie?:string[];caigongXieNote?:string;
  unknownChars:string[];          // 未收录字（笔画为估算，前端须显著提示）
  // ── v3.0 增量（2026-08-22 老唐 v3.0 移植）──
  gridQi?:Record<string,Record<string,{解释?:string;现象?:string;操作?:string}>>; // 5.1 此象在该格的意义/产生现象/操作（上层/自我/下层 × 9象）
  gridEnergy?:Record<string,{代表?:string;实例?:string;碰撞?:string;应变?:string}>; // 5.1 能量解读（4格）
  suizhiNote?:string;             // 5.2 岁值星注意（v3 全文补充）
  annualStrategy?:{阶段:string;标题:string;月份:string;文案:string[]}[];  // 5.2 年度经营策略（生日前后四期）
  guaRef?:{口诀?:string;意义?:string;启示?:string;切记?:string;反向?:string};  // 卦签参考（投机/名望卦）
  // ── v4.0 增量（2026-08-22 老唐 v4.0 移植）──
  zhiFamily?:[string,string,string,string];   // 十大家族：质名/五行/家族/特质描述
  motherQi?:string;                            // 九宫母气（质个位数）
  collisions:{格:string;数:number;命中:boolean;解说:string;现象:string;提示:string}[]; // 四格碰撞期
  collisionYears:Record<string,number[]>;      // 各格碰撞期虚岁全表
  internalEnergy?:Record<string,unknown>;      // 内部能量（上层/自我/下层，第十四课）
}

export interface JiugongInput {
  name:string;
  year:number;
  month:number;
  day:number;
}

// ══════════ 主计算 ══════════
function calcFull(name:string,year:number,month:number,day:number,now=new Date()):JiugongFull {
  const chars=Array.from(name);
  const strokeInfos=chars.map(getStrokeInfo);
  const strokes=strokeInfos.map(s=>s.n);
  const total=strokes.reduce((a,b)=>a+b,0);
  const unknownChars=chars.filter((_,i)=>!strokeInfos[i].known);
  
  // 五格 (复姓天格=姓之和+1)
  const isDouble=strokes.length>=4;
  const tian=isDouble?strokes[0]+strokes[1]+1:strokes[0]+1;
  const ren=isDouble?strokes[1]+(strokes[2]||1):strokes[0]+(strokes[1]||1);
  const di=strokes.length>=3?strokes[1]+strokes[2]:(strokes[1]||1)+1;
  const zong=total,wai=isDouble?zong-ren:zong-ren+1;
  
  // 虚岁：年份口径（九宫只用年份，不按月日打折——老唐 CLI/规则表口径）
  const xuAge=now.getFullYear()-year+1;
  
  // 局差
  const tens=Math.floor(total/10),ones=total%10;
  let ju=Math.abs(tens-ones);if(ju>4)ju=(Math.min(tens,ones)+9)-Math.max(tens,ones);
  
  // 质
  const zhi=total%10,zhiD=ZHI[zhi]||ZHI[5];
  
  // 星运（10–53 查表；超出回退质描述——规则表 §一）
  const xy=XYN[total];
  const xingyunFallback=`${zhiD.name}（${zhiD.element}）：${zhiD.desc}`;
  const xingyunName=xy?.name||xingyunFallback;
  const xingyunFull=xy?.desc||xingyunFallback;
  
  // 管理IQ — 名字第二字
  const mgtKey=(strokes[1]??strokes[0])>9?dsum(strokes[1]??strokes[0]):(strokes[1]??strokes[0]);
  const mgt=MGT_FULL[mgtKey]||MGT_FULL[1];
  
  // 五行作用方向（统一语义：a 对 b 的正向作用；反向作用力记作平——规则表 §一/老唐 relation）
  const tw=WX[tian%10],rw=WX[ren%10],dw=WX[di%10];
  const wxOrder=(a:string)=>({木:1,火:2,土:3,金:4,水:5}as Record<string,number>)[a]||0;
  const wxRel=(a:string,b:string):'生'|'克'|'平'=>{
    if(a===b)return'平';
    const diff=(wxOrder(b)-wxOrder(a)+5)%5;
    if(diff===1)return'生';   // a 生 b
    if(diff===2)return'克';   // a 克 b
    return'平';               // 反向（b 生/克 a）记作平
  };
  // 思想 = 天→人；行动 = 人→地（老唐 analyze_personality）
  const thinkRelWx=wxRel(tw,rw), actionRelWx=wxRel(rw,dw);
  const thinkRel=thinkRelWx==='平'?'平':`${thinkRelWx}(${tw}→${rw})`;
  const actionRel=actionRelWx==='平'?'平':`${actionRelWx}(${rw}→${dw})`;
  const thinkDesc=thinkRelWx==='平'
    ?'天格与人格五行无正向生克（反向作用力记作平），思想与上层磁场平顺自然，不受天格压制亦不借其力。'
    :(WX_CHAR_FULL[`${tw}${thinkRelWx}${rw}`]||'');
  const actionDesc=actionRelWx==='平'
    ?'人格与地格五行无正向生克（反向作用力记作平），行动与下层磁场平顺自然，不压迫下属亦不受其拖累。'
    :(WX_CHAR_FULL[`${rw}${actionRelWx}${dw}`]||'');
  // 主副功能：人→地 生/克=主功能；地→人 生/克=副功能；等同=平功能
  const mainFunc=actionRelWx==='生'||actionRelWx==='克'?'主功能':wxRel(dw,rw)==='生'||wxRel(dw,rw)==='克'?'副功能':'平功能';
  const mainFuncDesc=mainFunc==='主功能'
    ?'主动性强、勤劳踏实、白手起家，适合操作流年'
    :mainFunc==='副功能'
    ?'善用头脑、人际关系、机会点，需要合作不能独闯'
    :'主副功能均衡型，人格与地格五行相同，呈并行线（库平）；既能主动实干也能借力合作，不偏独闯亦不偏依附。';
  
  // 财富（v2 修正：先数字根再差——老唐 analyze_wealth 口径）
  const rd=dsum(ren), dd=dsum(di);
  const pdiff=Math.abs(rd-dd);const pnum=pdiff>4?(Math.min(rd,dd)+9)-Math.max(rd,dd):pdiff;
  const PATH_DESC=['局平（名气暗财型）：靠专业成名','加1（能力暗财型）：白手起家，财库最旺','加2（能力正财型）：实力派，不能投机','加3（机运暗财型）：受栽培，赚钱无人知','加4（机运正财型）：人际关系为本，适合组织'];
  // 财宫：人生地=库泄 / 人克地=库破 / 地生人=库旺 / 其余(含地克人)=库平
  const rDw=wxRel(rw,dw), dRw=wxRel(dw,rw);
  const PALACE=rDw==='生'?['库泄','大方型，钱留不住']:rDw==='克'?['库破','冲动型，冲动时破财']:dRw==='生'?['库旺','守财型，企业家标配']:['库平','从商格，说话婉转'];
  
  // 婚姻（老唐 analyze_marriage：地生人=淡 / 人生地=旺 / 双向克=破·克型 / 等同=双象·平双|阴阳双）
  let mar: [string,string];
  let marriageSub: string|undefined, marriageBreakKey: string|undefined;
  if (dRw==='生') mar=['淡象','平淡自然（地格生人格）'];
  else if (rDw==='生') mar=['旺象','感情兴旺（人格生地格）'];
  else if (dRw==='克') { marriageBreakKey=`${dw}克${rw}`; mar=['破象',`感情有波折（地格${dw}克人格${rw}）`]; }
  else if (rDw==='克') { marriageBreakKey=`${rw}克${dw}`; mar=['破象',`感情有波折（人格${rw}克地格${dw}）`]; }
  else {
    marriageSub = (ren % 2) === (di % 2) ? '平双' : '阴阳双';
    mar=[marriageSub, marriageSub==='平双'?'势均力敌（人格与地格五行等同、阴阳相同）':'势均力敌（人格与地格五行等同、一阴一阳）'];
  }
  
  // 主数
  const mainNum=dsum(now.getFullYear()-1111);
  
  // 四格气场
  // 能量循环（规则表 §二）：天格专用循环 0=帝旺；人/地/总普通循环 0=冠带
  const CYCLE_TIANGAN=['帝旺','衰','病','死','绝','胎','养','长生','冠带','临官'];
  const CYCLE_NORMAL=['冠带','临官','帝旺','衰','病','死','绝','胎','养','长生'];
  function qiEnergy(n:number,grid:number,age=xuAge,isTiange=false):{qi:string;energy:string;gua:string;strategy:string}{
    const qiNum=((n-grid)%9+9)%9;
    const qi=XIANG[qiNum]||'名望';
    const yunIdx=(age-grid%10+10)%10;
    const energy=(isTiange?CYCLE_TIANGAN:CYCLE_NORMAL)[yunIdx%10];
    const gua=`${qi}${energy}`;
    const st=XIANG_STRATEGY_FULL[qi]||{upper:'',self:'',lower:'',outer:'',caution:''};
    return{qi,energy,gua,strategy:st.upper};
  }
  const upper=qiEnergy(mainNum,tian,xuAge,true),self=qiEnergy(mainNum,ren);
  const lower=qiEnergy(mainNum,di),outer=qiEnergy(mainNum,zong);

  // 碰撞周期：恢复 v5 已验收规则（每 10 年一次）
  const tianBaseEnergy=COLLISION_ENERGY[(10-tian%10)%10];
  const renBaseEnergy=COLLISION_ENERGY[(12-ren%10)%10];
  const diBaseEnergy=COLLISION_ENERGY[(12-di%10)%10];
  const collisionAges=(energy:string)=>Array.from(
    {length:9},
    (_,i)=>COLLISION_ENERGY.indexOf(energy)+1+i*10,
  ).filter(n=>n<=90);
  const upperColl=collisionAges(tianBaseEnergy);
  const selfColl=collisionAges(renBaseEnergy);
  const lowerColl=collisionAges(diBaseEnergy);
  
  // 90年卷轴查表
  const SCROLL_LUT = ALL_GROUPS.flatMap(g=>g.years.map(y=>({chance:y.chance,yun:y.yun,gua:y.gua,koujue:y.koujue,jiedu:y.jiedu})));
  const years = Array.from({length:90},(_,i)=>{
    const a=i+1;
    const yearMainNum=dsum((year+i)-1111);
    const qiNum=((yearMainNum-zong)%9+9)%9;
    const qi=XIANG[qiNum]||'名望';
    const yunIdx=(a%10-zong%10+10)%10;
    const energy=YUN[yunIdx%10];
    const row=SCROLL_LUT.find(r=>r.chance===qi&&r.yun===energy)||SCROLL_LUT[0];
    const yearUpper=qiEnergy(yearMainNum,tian,a);
    const yearSelf=qiEnergy(yearMainNum,ren,a);
    const yearLower=qiEnergy(yearMainNum,di,a);
    const yearOuter=qiEnergy(yearMainNum,zong,a);
    return{
      age:a,year:year+i,yun:row.yun,chance:row.chance,gua:row.gua,koujue:row.koujue,jiedu:row.jiedu,
      keyYear:KEY_GUAXIAN.includes(row.gua),
      upperQi:yearUpper.qi,upperEnergy:yearUpper.energy,
      selfQi:yearSelf.qi,selfEnergy:yearSelf.energy,
      lowerQi:yearLower.qi,lowerEnergy:yearLower.energy,
      outerQi:yearOuter.qi,outerEnergy:yearOuter.energy,
      ageStar:STAR[a%10],ageStarDesc:STAR_DESC[a%10],
    };
  });
  
  const ages=['1-9岁','10-18岁','19-27岁','28-36岁','37-45岁','46-54岁','55-63岁','64-72岁','73-81岁','82-90岁'];
  const reordered=ALL_GROUPS.slice(5).concat(ALL_GROUPS.slice(0,5));
  const groups=reordered.map((g,i)=>({name:g.name,ages:ages[i],count:9}));

  // ═══ v2 增量计算（2026-08-20 老唐 v2.0 移植）═══
  const mergeDigits=(n:number)=>{while(n>9)n=[...String(n)].reduce((a,b)=>a+ +b,0);return n;};
  // 婚姻全文模板
  let marriageFull: JiugongFull['marriageFull'];
  if (marriageSub) marriageFull = MARRIAGE_TEMPLATES[marriageSub];
  else if (marriageBreakKey) marriageFull = MARRIAGE_BREAK[marriageBreakKey] || MARRIAGE_TEMPLATES['破'];
  else {
    const mk = mar[0]==='破象'?'破':mar[0]==='淡象'?'淡':mar[0]==='旺象'?'旺':undefined;
    if (mk) marriageFull = MARRIAGE_TEMPLATES[mk];
  }
  // 质三段式（特质/意义/切记/转折年）
  const zfV2 = ZHI_FULL[zhiD.name];
  // 星运详情（要点/特质/意义/切记/提示）
  const stV2 = STAR_TABLE_V2[total];
  const sffV2 = STAR_FORTUNE_FULL[total];
  // 事业趋向（人格五行×个位数）
  const cdV2 = CAREER_DIR[`${rw}:${ren%10}`];
  // 上下助力（箭头法：箭头指向受方——老唐 report 2.5）
  // 天/地 对人格正向生克 → 向内（对方箭头向着你）；反向（人对天/地生克）→ 向外（你的箭头指向对方）
  const relUpV2 = wxRel(tw,rw);       // 天→人 正向
  const relDownV2 = wxRel(dw,rw);     // 地→人 正向
  const upDir = (relUpV2==='生'||relUpV2==='克')?'向内':((wxRel(rw,tw)==='生'||wxRel(rw,tw)==='克')?'向外':'无');
  const downDir = (relDownV2==='生'||relDownV2==='克')?'向内':((wxRel(rw,dw)==='生'||wxRel(rw,dw)==='克')?'向外':'无');
  // 属下助力（地格合并数 1-9）
  const hbV2 = mergeDigits(di);
  // 性格动作力/处事方法
  const paV2 = PERS_ACTION[mainFunc];
  // 流年能量四段法（(虚岁-质)%10）
  const lnStateV2 = YUN[(xuAge - zhi + 10) % 10];
  // 卦签双向（对外总格象+能量 → 90卦 → 正向/反向）
  const outerGuaRec = SCROLL_LUT.find(r=>r.chance===outer.qi&&r.yun===outer.energy)||SCROLL_LUT[0];
  const fxV2 = GUAXIAN_FANXIANG[outerGuaRec.gua];
  // 四格对策/注意事项
  const ceV2 = (x:string)=>FOUR_GRID_CE[x];
  // 财运全文（财库五型详解 + 加3八条 + 库泄/库破七条）
  const ckFullV2 = CAIKU_FULL[pnum];
  const cgXie = (PALACE[0].includes('泄')||PALACE[0].includes('破')) ? CAIGONG_XIE : undefined;

  // ═══ v3.0 增量计算（2026-08-22 老唐 v3.0 移植）═══
  const ageStarV = STAR[xuAge%10];
  // 5.1 四格气场解读：GRID_QI（上/自/下三格 此象意义/现象/操作）+ GRID_ENERGY（4格 代表/实例/碰撞/应变）
  const gridQi = GRID_QI as Record<string, Record<string, {解释?:string;现象?:string;操作?:string}>>;
  const gridEnergy = GRID_ENERGY as Record<string, {代表?:string;实例?:string;碰撞?:string;应变?:string}>;
  // 5.2 岁值星注意（v3 全文补充：键=全角星名，匹配网站的 ageStar 半角格式）
  const szV3Key = Object.keys(SUIZHI_FULL_V3).find(
    (k) => k.replace(/（/g,'(').replace(/）/g,')') === ageStarV,
  );
  const suizhiNote = szV3Key ? SUIZHI_FULL_V3[szV3Key]?.注意 : undefined;
  // 5.2 年度经营策略（生日前后四期：结算期/产值检验期/机会点/附加价值期）
  const annualStrategy = (ANNUAL_STRATEGY as Record<string,{偏移:[number,number];标题:string;文案:string[]}>)
    ? Object.entries(ANNUAL_STRATEGY).map(([stage, s]) => ({
        阶段: stage,
        标题: s.标题,
        月份: `${(month + s.偏移[0] - 1 + 12) % 12 + 1}月~${(month + s.偏移[1] - 1 + 12) % 12 + 1}月`,
        文案: s.文案 as string[],
      }))
    : undefined;
  // 卦签参考（投机卦/名望卦补充：口诀/意义/启示/切记）
  const guaRef = GUAXIAN_REF[outerGuaRec.gua] as {口诀?:string;意义?:string;启示?:string;切记?:string;反向?:string} | undefined;

  // ═══ v4.0 增量计算（2026-08-22 老唐 v4.0 移植）═══
  // 十大家族 + 九宫母气（2.1 特质）
  const zhiFamily = (ZHI_FAMILY as Record<string,[string,string,string,string]>)[zhi];
  const motherQi = (MOTHER_QI as Record<string,string>)[String(((zhi%9)+9)%9 || 9)];
  // 碰撞期（《推算碰撞》讲义 6.3）：四格各自推演，标注当前虚岁是否命中
  const CF = COLLISION_FULL as Record<string,{解说:string;现象:string;提示:string}>;
  const gridDefs:[string,number][]=[['上层',tian],['自我',ren],['下层',di],['对外',zong]];
  const collisions = gridDefs.map(([g,n])=>({
    格:g,数:n,命中:isCollisionYear(n,xuAge),
    解说:CF[g]?.解说||'',现象:CF[g]?.现象||'',提示:CF[g]?.提示||'',
  }));
  const collisionYears:Record<string,number[]> = Object.fromEntries(gridDefs.map(([g,n])=>[g,collisionYearsOf(n)] as [string,number[]]));
  // 内部能量（第十四课：上层/自我/下层）
  const internalEnergy = INTERNAL_ENERGY as Record<string,unknown>;
  
  return{name,year,month,day,total,tian,ren,di,zong,wai,tianWx:tw,renWx:rw,diWx:dw,xuAge,
    ju,juDesc:JU_DESC[ju],juFull:JU_FULL[ju]||JU_DESC[ju],
    zhi,zhiName:zhiD.name,zhiElement:zhiD.element,zhiDesc:zhiD.desc,zhiFull:zhiD.desc,
    xingyunName,xingyunFull,
    thinkRel,thinkDesc,actionRel,actionDesc,
    wxThinkFull: thinkRelWx==='平'?thinkDesc:(WX_CHAR_FULL[`${tw}${thinkRelWx}${rw}`]||thinkDesc),
    wxActionFull: actionRelWx==='平'?actionDesc:(WX_CHAR_FULL[`${rw}${actionRelWx}${dw}`]||actionDesc),
    mainFunc,mainFuncDesc,
    wealthPath:PATH_DESC[pnum],wealthPalace:PALACE[0],wealthPalaceDesc:PALACE[1],
    marriage:mar[0],marriageDesc:mar[1],
    ageStar:STAR[xuAge%10],ageStarDesc:STAR_DESC[xuAge%10],ageStarFull:SUIZHI_FULL[xuAge%10]||STAR_DESC[xuAge%10],
    mgtType:mgt.type,mgtScore:mgt.score,mgtDesc:mgt.desc,mgtFull:mgt.detail,
    mainNum,
    upperQi:upper.qi,upperEnergy:upper.energy,upperGua:upper.gua,upperStrategy:upper.strategy,
    selfQi:self.qi,selfEnergy:self.energy,selfGua:self.gua,selfStrategy:self.strategy,
    lowerQi:lower.qi,lowerEnergy:lower.energy,lowerGua:lower.gua,lowerStrategy:lower.strategy,
    outerQi:outer.qi,outerEnergy:outer.energy,outerGua:outer.gua,outerStrategy:outer.strategy,
    energyFull:ENERGY_FULL,xiangStrategy:XIANG_STRATEGY_FULL,
    upperColl,selfColl,lowerColl,
    groups,years,
    // v2 增量
    marriageSub,marriageBreakKey,marriageFull,
    zhiMeaning:zfV2?.意义,zhiCaution:zfV2?.切记,zhiTips:zfV2?.提示,
    xingyunPoints:stV2?.要点,xingyunTrait:stV2?.特质,
    xingyunMeaning:sffV2?.意义||stV2?.意义,xingyunCaution:sffV2?.切记||stV2?.切记,xingyunTips:sffV2?.提示||stV2?.提示,
    careerDir:cdV2,careerHealth:CAREER_HEALTH[rw],
    arrowUp:ARROW_TEXT[`上:${upDir}`],arrowDown:ARROW_TEXT[`下:${downDir}`],arrowSummary:ARROW_TEXT['总结'],
    subSupportNum:hbV2,subSupport:SUB_SUPPORT[hbV2],
    mainFuncAction:paV2?.动作力,mainFuncMethod:paV2?.处事方法,
    liunianState:lnStateV2,liunianDetail:LIUNIAN_DETAIL[lnStateV2],
    guaName:outerGuaRec.gua,guaKoujue:outerGuaRec.koujue,guaJiedu:outerGuaRec.jiedu,
    guaPositive:fxV2?.正向,guaReverse:fxV2?.反向,guaShixu:outerGuaRec.gua==='实虚',
    upperCaution:ceV2(upper.qi)?.对策,upperNote:ceV2(upper.qi)?.注意事项,
    selfCaution:ceV2(self.qi)?.对策,selfNote:ceV2(self.qi)?.注意事项,
    lowerCaution:ceV2(lower.qi)?.对策,lowerNote:ceV2(lower.qi)?.注意事项,
    outerCaution:ceV2(outer.qi)?.对策,outerNote:ceV2(outer.qi)?.注意事项,
    caiKuFull:ckFullV2,
    caiKuJia3:pnum===3?CAIKU_JIA3:undefined,caiKuJia3Note:pnum===3?CAIKU_JIA3_NOTE:undefined,
    caigongXie:cgXie,caigongXieNote:cgXie?CAIGONG_XIE_NOTE:undefined,
    unknownChars,
    // v3.0 增量
    gridQi,gridEnergy,suizhiNote,annualStrategy,guaRef,
    // v4.0 增量
    zhiFamily,motherQi,collisions,collisionYears,internalEnergy,
};
}

export async function getJiugongStroke(character:string):Promise<number> {
  await loadJiugongDictionary();
  return getStroke(character);
}

export async function calculateJiugongV6(input:JiugongInput,now=new Date()):Promise<JiugongFull> {
  await loadJiugongDictionary();
  return calcFull(input.name,input.year,input.month,input.day,now);
}
