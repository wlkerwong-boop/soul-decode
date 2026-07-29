// 九宫学理 · 引擎 v6 — 复姓天格+1, 详细数据来自jiugong-data.ts
import { JU_FULL, XINGYUN as XYN, MGT_FULL, ENERGY_FULL, SUIZHI_FULL, WX_CHAR_FULL, XIANG_STRATEGY_FULL } from './jiugong-data';
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
const S2T: Record<string,string> = {"万":"萬","与":"與","个":"個","习":"習","乡":"鄉","书":"書","云":"雲","产":"產","亲":"親","亿":"億","仅":"僅","仆":"僕","从":"從","仑":"侖","仓":"倉","仪":"儀","们":"們","价":"價","众":"眾","优":"優","会":"會","伟":"偉","传":"傳","伤":"傷","伦":"倫","伪":"偽","体":"體","余":"餘","佣":"傭","侠":"俠","侣":"侶","侦":"偵","侧":"側","侨":"僑","侥":"僥","侯":"侯","债":"債","倾":"傾","偿":"償","储":"儲","儿":"兒","兑":"兌","兴":"興","养":"養","兰":"蘭","关":"關","兽":"獸","内":"內","册":"冊","写":"寫","军":"軍","农":"農","冯":"馮","冲":"沖","决":"決","冻":"凍","净":"淨","凄":"淒","减":"減","几":"幾","凤":"鳳","凯":"凱","击":"擊","刘":"劉","则":"則","刚":"剛","创":"創","别":"彆","剧":"劇","动":"動","勋":"勳","劳":"勞","势":"勢","务":"務","励":"勵","胜":"勝","华":"華","协":"協","单":"單","卖":"賣","卫":"衛","厂":"廠","厅":"廳","历":"歷","厉":"厲","压":"壓","厌":"厭","县":"縣","发":"發","变":"變","叠":"疊","叶":"葉","号":"號","叹":"嘆","吓":"嚇","吗":"嗎","员":"員","启":"啟","呜":"嗚","响":"響","唤":"喚","啸":"嘯","园":"園","围":"圍","图":"圖","圆":"圓","圣":"聖","场":"場","块":"塊","坚":"堅","坛":"壇","坝":"壩","垒":"壘","垦":"墾","堕":"墮","壮":"壯","声":"聲","处":"處","备":"備","复":"復","头":"頭","奋":"奮","奖":"獎","妇":"婦","妈":"媽","孙":"孫","学":"學","宁":"寧","实":"實","审":"審","宪":"憲","宫":"宮","宽":"寬","宾":"賓","对":"對","寻":"尋","导":"導","寿":"壽","将":"將","尘":"塵","尝":"嘗","尧":"堯","层":"層","属":"屬","岁":"歲","岂":"豈","岭":"嶺","岛":"島","峡":"峽","岗":"崗","崭":"嶄","币":"幣","师":"師","帘":"簾","带":"帶","帮":"幫","干":"幹","并":"並","广":"廣","庄":"莊","庆":"慶","庐":"廬","库":"庫","应":"應","庙":"廟","庞":"龐","废":"廢","异":"異","弃":"棄","张":"張","弹":"彈","录":"錄","归":"歸","当":"當","灵":"靈","灿":"燦","烂":"爛","爷":"爺","牵":"牽","犹":"猶","独":"獨","猎":"獵","获":"獲","献":"獻","毕":"畢","疗":"療","监":"監","盘":"盤","卢":"盧","盐":"鹽","盖":"蓋","瞒":"瞞","硕":"碩","码":"碼","矿":"礦","砚":"硯","础":"礎","礼":"禮","社":"社","祈":"祈","祷":"禱","祸":"禍","离":"離","种":"種","积":"積","称":"稱","稳":"穩","穷":"窮","窃":"竊","窑":"窯","窜":"竄","笔":"筆","简":"簡","签":"簽","节":"節","范":"範","荡":"蕩","药":"藥","艺":"藝","苏":"蘇","荣":"榮","落":"落","著":"著","萧":"蕭","蓝":"藍","藏":"藏","虫":"蟲","蛮":"蠻","蝉":"蟬","蜡":"蠟","袭":"襲","补":"補","装":"裝","裤":"褲","观":"觀","觉":"覺","览":"覽","触":"觸","订":"訂","认":"認","记":"記","讲":"講","证":"證","评":"評","识":"識","诉":"訴","诊":"診","词":"詞","诗":"詩","诚":"誠","话":"話","该":"該","详":"詳","语":"語","误":"誤","说":"說","请":"請","诸":"諸","课":"課","谁":"誰","调":"調","谈":"談","谋":"謀","谢":"謝","谷":"穀","财":"財","货":"貨","贪":"貪","购":"購","贮":"貯","贯":"貫","费":"費","贾":"賈","资":"資","赋":"賦","赌":"賭","赏":"賞","赔":"賠","赖":"賴","赚":"賺","赛":"賽","赞":"贊","赵":"趙","趋":"趨","跃":"躍","车":"車","转":"轉","轮":"輪","软":"軟","轻":"輕","轴":"軸","输":"輸","边":"邊","辽":"遼","达":"達","过":"過","运":"運","还":"還","进":"進","远":"遠","连":"連","选":"選","遗":"遺","邓":"鄧","邮":"郵","郑":"鄭","邻":"鄰","郁":"鬱","酸":"酸","铁":"鐵","铜":"銅","银":"銀","铸":"鑄","锁":"鎖","错":"錯","钱":"錢","钟":"鐘","鉴":"鑑","长":"長","门":"門","闭":"閉","问":"問","闹":"鬧","闻":"聞","阅":"閱","队":"隊","阳":"陽","阴":"陰","陈":"陳","陆":"陸","际":"際","险":"險","难":"難","电":"電","风":"風","飒":"颯","飞":"飛","食":"食","饭":"飯","饮":"飲","饱":"飽","饰":"飾","马":"馬","驾":"駕","骑":"騎","骗":"騙","鱼":"魚","鲁":"魯","鸟":"鳥","鸡":"雞","鸭":"鴨","鹅":"鵝","鹤":"鶴","鹂":"鸝","麦":"麥","黄":"黃","黑":"黑","齐":"齊","齿":"齒","龙":"龍","龟":"龜","晓":"曉"};

export function getStroke(c: string): number {
  // 优先繁体
  const trad = S2T[c];
  if (trad && kangxi?.has(trad)) return kangxi.get(trad)!;
  // 整字直接查
  const full = kangxi?.get(c);
  if (full !== undefined) return full;
  // 部首拆分
  const r = radStroke(c);
  if (r>0) { const rest=c.replace(/^[氵扌忄犭王礻衤月艹辶阝]/,'').replace(/阝$/,''); return r+(rest?(kangxi?.get(rest)??10):0); }
  return 10;
}

// ── 基础 ──
const WX=['水','木','木','火','火','土','土','金','金','水'];
const dsum=(n:number)=>{let s=String(n);while(s.length>1)s=String([...s].reduce((a,b)=>a+ +b,0));return +s;};

// ── 十种能量 ──
const YUN=['冠带','临官','帝旺','衰','病','死','绝','胎','养','长生'];
const COLLISION_ENERGY=['帝旺','临官','冠带','长生','养','胎','绝','死','病','衰'];

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
  }[];
}

export interface JiugongInput {
  name:string;
  year:number;
  month:number;
  day:number;
}

// ══════════ 主计算 ══════════
function calcFull(name:string,year:number,month:number,day:number,now=new Date()):JiugongFull {
  const chars=Array.from(name), strokes=chars.map(getStroke), total=strokes.reduce((a,b)=>a+b,0);
  
  // 五格 (复姓天格=姓之和+1)
  const isDouble=strokes.length>=4;
  const tian=isDouble?strokes[0]+strokes[1]+1:strokes[0]+1;
  const ren=isDouble?strokes[1]+(strokes[2]||1):strokes[0]+(strokes[1]||1);
  const di=strokes.length>=3?strokes[1]+strokes[2]:(strokes[1]||1)+1;
  const zong=total,wai=isDouble?zong-ren:zong-ren+1;
  
  // 虚岁
  const birth=new Date(year,month-1,day);
  let age=now.getFullYear()-birth.getFullYear();
  if(now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate()))age--;
  const xuAge=age+1;
  
  // 局差
  const tens=Math.floor(total/10),ones=total%10;
  let ju=Math.abs(tens-ones);if(ju>4)ju=(Math.min(tens,ones)+9)-Math.max(tens,ones);
  
  // 质
  const zhi=total%10,zhiD=ZHI[zhi]||ZHI[5];
  
  // 星运
  const xy=XYN[total];
  
  // 管理IQ — 名字第二字
  const mgtKey=(strokes[1]??strokes[0])>9?dsum(strokes[1]??strokes[0]):(strokes[1]??strokes[0]);
  const mgt=MGT_FULL[mgtKey]||MGT_FULL[1];
  
  // 五行性格
  const tw=WX[tian%10],rw=WX[ren%10],dw=WX[di%10];
  const wxOrder=(a:string)=>({木:1,火:2,土:3,金:4,水:5}as Record<string,number>)[a]||0;
  const wxRel=(a:string,b:string)=>a===b?'平':((wxOrder(b)-wxOrder(a)+5)%5===1?'生':'克');
  const thinkRel=`${rw}${wxRel(rw,tw)}${tw}`,actionRel=`${dw}${wxRel(dw,rw)}${rw}`;
  const thinkDesc=WX_CHAR_FULL[thinkRel]||'';
  const actionDesc=WX_CHAR_FULL[actionRel]||'';
  const gen=(wxOrder(rw)-wxOrder(dw)+5)%5;
  const mainFunc=gen===1||gen===3?'主功能':'副功能';
  const mainFuncDesc=mainFunc==='主功能'?'主动性强、勤劳踏实、白手起家，适合操作流年':'善用头脑、人际关系、机会点，需要合作不能独闯';
  
  // 财富
  const pdiff=Math.abs(ren-di);const pnum=pdiff>4?(Math.min(ren,di)+9)-Math.max(ren,di):pdiff;
  const PATH_DESC=['局平（名气暗财型）：靠专业成名','加1（能力暗财型）：白手起家，财库最旺','加2（能力正财型）：实力派，不能投机','加3（机运暗财型）：受栽培，赚钱无人知','加4（机运正财型）：人际关系为本，适合组织'];
  const PALACE=gen===0?['库平','从商格，说话婉转']:gen===1||gen===3?['库泄','大方型，钱留不住']:gen===4?['库旺','守财型，企业家标配']:['库破','冲动型，冲动时破财'];
  
  // 婚姻
  const mar=gen===0?['双象','势均力敌']:gen===1?['淡象','平淡自然']:gen===4?['旺象','感情兴旺']:['破象','感情有波折'];
  
  // 主数
  const mainNum=dsum(now.getFullYear()-1111);
  
  // 四格气场
  function qiEnergy(n:number,grid:number,age=xuAge):{qi:string;energy:string;gua:string;strategy:string}{
    const qiNum=((n-grid)%9+9)%9;
    const qi=XIANG[qiNum]||'名望';
    const yunIdx=(age-grid%10+10)%10;
    const energy=YUN[yunIdx%10];
    const gua=`${qi}${energy}`;
    const st=XIANG_STRATEGY_FULL[qi]||{upper:'',self:'',lower:'',outer:'',caution:''};
    return{qi,energy,gua,strategy:st.upper};
  }
  const upper=qiEnergy(mainNum,tian),self=qiEnergy(mainNum,ren);
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
  
  return{name,year,month,day,total,tian,ren,di,zong,wai,tianWx:tw,renWx:rw,diWx:dw,xuAge,
    ju,juDesc:JU_DESC[ju],juFull:JU_FULL[ju]||JU_DESC[ju],
    zhi,zhiName:zhiD.name,zhiElement:zhiD.element,zhiDesc:zhiD.desc,zhiFull:zhiD.desc,
    xingyunName:xy?.name||`${total}画`,xingyunFull:xy?.desc||'',
    thinkRel,thinkDesc,actionRel,actionDesc,
    wxThinkFull:WX_CHAR_FULL[thinkRel]||thinkDesc,
    wxActionFull:WX_CHAR_FULL[actionRel]||actionDesc,
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
    groups,years};
}

export async function getJiugongStroke(character:string):Promise<number> {
  await loadJiugongDictionary();
  return getStroke(character);
}

export async function calculateJiugongV6(input:JiugongInput,now=new Date()):Promise<JiugongFull> {
  await loadJiugongDictionary();
  return calcFull(input.name,input.year,input.month,input.day,now);
}
