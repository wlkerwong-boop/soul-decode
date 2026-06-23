// 先贤人物数据 - 用于精神坐标定位器匹配
// 按六大阵营分类，每个人物带匹配标签

export interface SageFigure {
  id: number;
  name: string;
  stars: number;
  dynasty: string;
  camp: string;
  description: string; // 一句话简介
  keywords: string[]; // 匹配关键词：性格/兴趣/特质
  slogan: string; // 宣传栏金句
  imageHint: string; // 人物照片来源建议
}

export const sageFigures: SageFigure[] = [
  // ═══ 阵营一：华夏文明溯源 ═══
  {
    id: 1, name: '伏羲', stars: 2, dynasty: '远古传说',
    camp: '华夏文明溯源',
    description: '观察天地、画八卦，为华夏文明打下第一块基石',
    keywords: ['好奇心', '观察力', '爱分享', '喜欢探索', '乐于助人', '喜欢手工'],
    slogan: '多观察、多尝试，每个人都能为身边人带来光亮',
    imageHint: '汉代画像石拓片/伏羲女娲图',
  },
  {
    id: 2, name: '女娲', stars: 2, dynasty: '远古传说',
    camp: '华夏文明溯源',
    description: '炼石补天的大地母亲，温柔而坚定的守护者',
    keywords: ['善良', '细心', '照顾他人', '有爱心', '有责任感', '温柔'],
    slogan: '温柔不等于软弱，愿意守护他人就是最强大的力量',
    imageHint: '汉代画像石拓片/女娲画像',
  },
  {
    id: 3, name: '炎帝（神农）', stars: 2, dynasty: '远古传说',
    camp: '华夏文明溯源',
    description: '尝百草、教农耕，以身试险的实干家',
    keywords: ['勇于尝试', '不怕失败', '喜欢自然', '种植物', '有毅力', '大胆'],
    slogan: '真正的勇敢不是无所畏惧，而是明知有风险依然为集体前行',
    imageHint: '历代帝王圣贤名臣大儒遗像',
  },
  {
    id: 4, name: '黄帝', stars: 2, dynasty: '远古传说',
    camp: '华夏文明溯源',
    description: '华夏共祖，包容各部、凝聚力量的领导者',
    keywords: ['有领导力', '善于协调', '有大局观', '组织能力强', '公平', '包容'],
    slogan: '包容与统筹，是凝聚集体的力量',
    imageHint: '山东武氏祠汉代画像石',
  },

  // ═══ 阵营二：中华文明立国基石 ═══
  {
    id: 5, name: '周公旦', stars: 3, dynasty: '西周',
    camp: '中华文明立国基石',
    description: '制礼作乐、辅佐成王，谦逊克制的政治家',
    keywords: ['公平公正', '做事认真', '待人谦和', '有规则意识', '负责任'],
    slogan: '手握权力依然谦逊克制，以规则守护所有人',
    imageHint: '历代帝王圣贤名臣像',
  },
  {
    id: 6, name: '秦始皇', stars: 3, dynasty: '秦代',
    camp: '中华文明立国基石',
    description: '统一六国，推行标准化改革的大一统开创者',
    keywords: ['喜欢整理', '有规划', '想改变现状', '执行力强', '有雄心'],
    slogan: '目光长远、敢于突破困局，才能完成旁人做不到的事',
    imageHint: '故宫南薰殿旧藏秦始皇像',
  },
  {
    id: 7, name: '毛泽东', stars: 4, dynasty: '近现代',
    camp: '中华文明立国基石',
    description: '新中国缔造者，扎根大地、独立思考的革命家',
    keywords: ['有理想', '独立', '乐观', '不服输', '体恤他人', '爱读书'],
    slogan: '宏大理想扎根脚下土地，困境中坚守初心',
    imageHint: '官方标准照',
  },

  // ═══ 阵营三：大国国防科技脊梁 ═══
  {
    id: 8, name: '钱学森', stars: 4, dynasty: '近现代',
    camp: '大国国防科技脊梁',
    description: '中国航天之父，放弃美国优厚待遇毅然归国',
    keywords: ['想当科学家', '意志坚定', '抵挡诱惑', '有梦想', '爱钻研'],
    slogan: '再优厚的外物，也比不上内心的理想与故土',
    imageHint: '新华社标准照',
  },
  {
    id: 9, name: '邓稼先', stars: 4, dynasty: '近现代',
    camp: '大国国防科技脊梁',
    description: '两弹元勋，隐姓埋名28年扎根戈壁',
    keywords: ['默默坚持', '不在意表扬', '长期做一件事', '踏实', '不浮躁'],
    slogan: '伟大不一定站在聚光灯下，默默坚守同样能撑起家国',
    imageHint: '新华社标准照',
  },
  {
    id: 10, name: '郭永怀', stars: 4, dynasty: '近现代',
    camp: '大国国防科技脊梁',
    description: '两弹一星烈士，用生命保护绝密资料',
    keywords: ['严谨', '认真', '在乎集体', '危机中靠得住', '有责任心'],
    slogan: '平日里扎实的积累，危难时就是保护集体的铠甲',
    imageHint: '新华社标准照',
  },
  {
    id: 11, name: '黄旭华', stars: 4, dynasty: '近现代',
    camp: '大国国防科技脊梁',
    description: '中国核潜艇之父，隐姓埋名三十载',
    keywords: ['能静下心', '有定力', '喜欢思考', '长期坚持', '冷静'],
    slogan: '长久孤独的坚守，终能成就长远事业',
    imageHint: '新华社标准照',
  },

  // ═══ 阵营四：民生济世安邦 ═══
  {
    id: 12, name: '袁隆平', stars: 4, dynasty: '当代',
    camp: '民生济世安邦',
    description: '杂交水稻之父，一生扎根田间的实干家',
    keywords: ['喜欢种植物', '珍惜粮食', '做事踏实', '不浮躁', '有爱心'],
    slogan: '最伟大的梦想扎根泥土，日复一日的坚持就能化解苦难',
    imageHint: '新华社标准照',
  },

  // ═══ 阵营五：云南乡土楷模 ═══
  {
    id: 13, name: '杨善洲', stars: 3, dynasty: '当代',
    camp: '云南乡土楷模',
    description: '保山原地委书记，退休后22年种树荒山变林海',
    keywords: ['热爱家乡', '环保', '不攀比', '朴素', '公平', '有毅力'],
    slogan: '不必远赴远方，脚下家乡就值得终身守护',
    imageHint: '新华社标准照',
  },
  {
    id: 14, name: '张桂梅', stars: 3, dynasty: '当代',
    camp: '云南乡土楷模',
    description: '华坪女高校长，帮助2000名山区女孩走出大山',
    keywords: ['珍惜读书', '有教育理想', '帮助他人', '有毅力', '善良'],
    slogan: '温柔的善意拥有巨大力量，负重也可以为他人撑伞',
    imageHint: '新华社标准照',
  },

  // ═══ 阵营六 · 文脉传声 ═══
  {
    id: 15, name: '屈原', stars: 3, dynasty: '战国·楚',
    camp: '文脉传声',
    description: '楚辞创始人，宁折不弯的理想主义者',
    keywords: ['正直', '敢说真话', '有原则', '有才华', '爱写作', '重感情'],
    slogan: '宁可孤独，也不随波逐流',
    imageHint: '屈原画像/明代圣贤像赞',
  },
  {
    id: 16, name: '司马迁', stars: 4, dynasty: '西汉',
    camp: '文脉传声',
    description: '《史记》作者，忍辱负重完成千古史书',
    keywords: ['有毅力', '答应的事做到', '有恒心', '爱历史', '有才华'],
    slogan: '用一支笔，对抗一个时代',
    imageHint: '司马迁画像',
  },
  {
    id: 17, name: '陶渊明', stars: 3, dynasty: '东晋',
    camp: '文脉传声',
    description: '田园诗派创始人，不为五斗米折腰',
    keywords: ['喜欢安静', '爱自然', '不喜欢跟风', '享受独处', '简单'],
    slogan: '采菊东篱下，悠然做自己',
    imageHint: '陶渊明画像/明代人物画',
  },
  {
    id: 18, name: '李白', stars: 3, dynasty: '唐代',
    camp: '文脉传声',
    description: '诗仙，浪漫主义的巅峰代表',
    keywords: ['有想象力', '自信', '喜欢交友', '爱自由', '有才华'],
    slogan: '仰天大笑出门去，我辈岂是蓬蒿人',
    imageHint: '唐代人物画/李白像',
  },
  {
    id: 19, name: '杜甫', stars: 4, dynasty: '唐代',
    camp: '文脉传声',
    description: '诗圣，心系苍生的现实主义诗人',
    keywords: ['善良', '关心他人', '有同理心', '爱思考', '有才华'],
    slogan: '安得广厦千万间，大庇天下寒士俱欢颜',
    imageHint: '杜甫画像',
  },
  {
    id: 20, name: '苏轼', stars: 4, dynasty: '北宋',
    camp: '文脉传声',
    description: '全能文豪，豁达乐观的生活家',
    keywords: ['心态好', '多才多艺', '幽默', '乐观', '喜欢美食'],
    slogan: '一蓑烟雨任平生',
    imageHint: '苏轼画像',
  },
  {
    id: 21, name: '李清照', stars: 4, dynasty: '宋代',
    camp: '文脉传声',
    description: '千古第一女词人，才华与风骨并存',
    keywords: ['有才气', '坚强', '有主见', '爱写作', '有原则'],
    slogan: '生当作人杰，死亦为鬼雄',
    imageHint: '李清照画像/历代女性人物画',
  },
  {
    id: 22, name: '文天祥', stars: 4, dynasty: '南宋',
    camp: '文脉传声',
    description: '留取丹心照汗青的民族英雄',
    keywords: ['说到做到', '有骨气', '正直', '坚持底线', '勇敢'],
    slogan: '人生自古谁无死，留取丹心照汗青',
    imageHint: '文天祥画像',
  },

  // ═══ 阵营六 · 格物求真 ═══
  {
    id: 23, name: '鲁班', stars: 3, dynasty: '春秋',
    camp: '格物求真',
    description: '工匠祖师，发明了锯子、墨斗等工具',
    keywords: ['喜欢动手', '爱发明', '有创意', '喜欢手工', '爱拆东西'],
    slogan: '草叶能划手，也能划开一个新世界',
    imageHint: '民间木版年画鲁班像',
  },
  {
    id: 24, name: '墨子', stars: 3, dynasty: '战国',
    camp: '格物求真',
    description: '墨家创始人，科学家兼和平主义者',
    keywords: ['爱思考', '有正义感', '喜欢科学', '有创意', '有原则'],
    slogan: '兼爱非攻，科学止战',
    imageHint: '明代圣贤像赞墨子像',
  },
  {
    id: 25, name: '张衡', stars: 3, dynasty: '东汉',
    camp: '格物求真',
    description: '发明地动仪的天文学家',
    keywords: ['爱天文', '爱科学', '有创意', '好奇心强', '喜欢观察'],
    slogan: '观天知地，一个仪器测千里',
    imageHint: '张衡画像',
  },
  {
    id: 26, name: '祖冲之', stars: 4, dynasty: '南北朝',
    camp: '格物求真',
    description: '将圆周率精确到小数点后7位的数学家',
    keywords: ['爱数学', '喜欢精确', '有耐心', '做事认真', '爱钻研'],
    slogan: '把π算到7位数，这就是坚持的力量',
    imageHint: '祖冲之画像',
  },
  {
    id: 27, name: '沈括', stars: 3, dynasty: '北宋',
    camp: '格物求真',
    description: '《梦溪笔谈》作者，宋代科学通才',
    keywords: ['什么都爱学', '喜欢记录', '好奇心', '爱读书', '爱观察'],
    slogan: '处处留心皆学问，做生活的记录者',
    imageHint: '沈括画像',
  },
  {
    id: 28, name: '毕昇', stars: 3, dynasty: '北宋',
    camp: '格物求真',
    description: '活字印刷术发明者，改变知识传播方式',
    keywords: ['有创意', '喜欢动手', '爱发明', '喜欢想办法'],
    slogan: '用泥巴刻字，改变了全世界的知识传播',
    imageHint: '毕昇画像/印刷插图',
  },
  {
    id: 29, name: '李时珍', stars: 4, dynasty: '明代',
    camp: '格物求真',
    description: '《本草纲目》作者，中医药学集大成者',
    keywords: ['爱自然', '喜欢植物', '有毅力', '做事踏实', '有钻研精神'],
    slogan: '走遍千山万水，尝遍百草只为济世救人',
    imageHint: '李时珍采药图',
  },
  {
    id: 30, name: '徐光启', stars: 3, dynasty: '明代',
    camp: '格物求真',
    description: '明代科学家，中西科学交流的先驱',
    keywords: ['爱学习', '喜欢新知识', '有远见', '爱农业', '有钻研精神'],
    slogan: '学贯中西，用科学改变农业',
    imageHint: '徐光启画像',
  },
  {
    id: 31, name: '宋应星', stars: 3, dynasty: '明代',
    camp: '格物求真',
    description: '《天工开物》作者，记录古代技术的百科全书',
    keywords: ['爱记录', '喜欢技术', '有观察力', '爱动手', '有工匠精神'],
    slogan: '每一个匠人，都是文明的书写者',
    imageHint: '宋应星画像',
  },

  // ═══ 阵营六 · 山河立心 ═══
  {
    id: 32, name: '张骞', stars: 3, dynasty: '西汉',
    camp: '山河立心',
    description: '丝绸之路开拓者，出使西域十三年',
    keywords: ['勇敢', '爱冒险', '有探索精神', '意志坚定', '有好奇心'],
    slogan: '每一步都是未知，但每一步都在开拓文明',
    imageHint: '张骞出使西域图',
  },
  {
    id: 33, name: '班超', stars: 3, dynasty: '东汉',
    camp: '山河立心',
    description: '投笔从戎，经营西域三十一年的外交家',
    keywords: ['有勇气', '敢行动', '有谋略', '果断', '有领导力'],
    slogan: '投笔从戎，以勇气改写人生',
    imageHint: '班超画像',
  },
  {
    id: 34, name: '玄奘', stars: 4, dynasty: '唐代',
    camp: '山河立心',
    description: '西行取经的信念行者，伟大的翻译家',
    keywords: ['有信念', '意志坚定', '爱学习', '有毅力', '爱冒险'],
    slogan: '心之所向，虽千万里亦往矣',
    imageHint: '玄奘负笈图',
  },
  {
    id: 35, name: '鉴真', stars: 3, dynasty: '唐代',
    camp: '山河立心',
    description: '六次东渡日本，双目失明仍不放弃的文化使者',
    keywords: ['有毅力', '不放弃', '有信念', '勇敢', '有耐心'],
    slogan: '六次东渡，失明也挡不住传播文化的脚步',
    imageHint: '鉴真坐像',
  },
  {
    id: 36, name: '徐霞客', stars: 4, dynasty: '明代',
    camp: '山河立心',
    description: '一生行走天下的地理学家、旅行家',
    keywords: ['爱冒险', '爱旅行', '爱自然', '有好奇心', '爱户外'],
    slogan: '大丈夫当朝碧海而暮苍梧',
    imageHint: '徐霞客画像/游记插图',
  },
  {
    id: 37, name: '郦道元', stars: 3, dynasty: '北魏',
    camp: '山河立心',
    description: '《水经注》作者，中国古代地理学先驱',
    keywords: ['爱地理', '爱观察', '有考据精神', '喜欢记录', '有学问'],
    slogan: '为天下水脉立传，为后世行旅指路',
    imageHint: '郦道元画像/水经注古本',
  },
  {
    id: 38, name: '郑和', stars: 4, dynasty: '明代',
    camp: '山河立心',
    description: '七下西洋的航海家，世界航海史上的壮举',
    keywords: ['爱冒险', '有航海梦想', '有远见', '勇敢', '有领导力'],
    slogan: '七下西洋，和平航行三十国',
    imageHint: '郑和像/航海图',
  },
  {
    id: 39, name: '柳宗元', stars: 3, dynasty: '唐代',
    camp: '山河立心',
    description: '唐代文学家，"永州八记"山水散文奠基人',
    keywords: ['爱写作', '喜欢山水', '有才华', '善于观察', '有想象力'],
    slogan: '山水之间，有最纯粹的文字',
    imageHint: '柳宗元画像/唐代文人画',
  },

  // ═══ 阵营六 · 仁心济世 ═══
  {
    id: 40, name: '扁鹊', stars: 3, dynasty: '战国',
    camp: '仁心济世',
    description: '望闻问切四诊法奠基人，中医祖师',
    keywords: ['善于观察', '有爱心', '爱医学', '细心', '乐于助人'],
    slogan: '望闻问切，四招看透你的身体',
    imageHint: '战国扁鹊诊脉图',
  },
  {
    id: 41, name: '华佗', stars: 3, dynasty: '东汉',
    camp: '仁心济世',
    description: '外科鼻祖，发明麻沸散的外科医生',
    keywords: ['有创意', '敢于创新', '爱发明', '有勇气', '有爱心'],
    slogan: '一剂麻沸散，千年外科梦',
    imageHint: '华佗为关公刮骨疗毒图',
  },
  {
    id: 42, name: '范仲淹', stars: 3, dynasty: '北宋',
    camp: '仁心济世',
    description: '"先天下之忧而忧"的名臣',
    keywords: ['有理想', '有格局', '有爱心', '有担当', '正直'],
    slogan: '先天下之忧而忧，后天下之乐而乐',
    imageHint: '范仲淹画像',
  },
  {
    id: 43, name: '包拯', stars: 3, dynasty: '北宋',
    camp: '仁心济世',
    description: '"包青天"，以刚正不阿闻名',
    keywords: ['正直', '公平', '勇敢', '有原则', '不怕得罪人'],
    slogan: '铁面无私，正义从不缺席',
    imageHint: '包拯画像/戏曲形象',
  },
  {
    id: 44, name: '孙思邈', stars: 4, dynasty: '唐代',
    camp: '仁心济世',
    description: '药王，《千金要方》作者',
    keywords: ['有爱心', '爱医学', '喜欢钻研', '乐于助人', '有恒心'],
    slogan: '人命至重，有贵千金',
    imageHint: '孙思邈画像/药王像',
  },
  {
    id: 45, name: '林则徐', stars: 3, dynasty: '清代',
    camp: '仁心济世',
    description: '虎门销烟的民族英雄',
    keywords: ['有骨气', '勇敢', '爱国', '有担当', '有原则'],
    slogan: '苟利国家生死以，岂因祸福避趋之',
    imageHint: '林则徐画像',
  },
  {
    id: 46, name: '钱乙', stars: 3, dynasty: '宋代',
    camp: '仁心济世',
    description: '儿科之祖，专为儿童治病的医生',
    keywords: ['有爱心', '喜欢孩子', '有耐心', '善良', '乐于助人'],
    slogan: '用最温柔的手，治最脆弱的生命',
    imageHint: '钱乙画像/宋代医书插图',
  },

  // ═══ 阵营六 · 风骨守志 ═══
  {
    id: 47, name: '苏武', stars: 3, dynasty: '西汉',
    camp: '风骨守志',
    description: '北海牧羊19年持节不屈的使节',
    keywords: ['有毅力', '有骨气', '坚持到底', '不放弃', '勇敢'],
    slogan: '十九年牧羊，手中的汉节从未放下',
    imageHint: '苏武牧羊图',
  },
  {
    id: 48, name: '岳飞', stars: 4, dynasty: '南宋',
    camp: '风骨守志',
    description: '精忠报国的抗金名将',
    keywords: ['爱国', '勇敢', '有忠诚', '有担当', '有毅力'],
    slogan: '精忠报国，热血从未凉',
    imageHint: '岳飞画像',
  },
  {
    id: 49, name: '于谦', stars: 3, dynasty: '明代',
    camp: '风骨守志',
    description: '北京保卫战的民族英雄',
    keywords: ['勇敢', '有担当', '有骨气', '临危不乱', '坚定'],
    slogan: '粉身碎骨浑不怕，要留清白在人间',
    imageHint: '于谦画像',
  },
  {
    id: 50, name: '海瑞', stars: 3, dynasty: '明代',
    camp: '风骨守志',
    description: '明代第一清官，以刚正廉洁著称',
    keywords: ['正直', '清廉', '有原则', '不贪心', '公平'],
    slogan: '宁可清贫，也不拿不该拿的一分钱',
    imageHint: '海瑞画像',
  },
  {
    id: 51, name: '顾炎武', stars: 3, dynasty: '明末清初',
    camp: '风骨守志',
    description: '"天下兴亡，匹夫有责"的提出者',
    keywords: ['有担当', '有家国情怀', '爱学习', '有原则', '有骨气'],
    slogan: '天下兴亡，匹夫有责',
    imageHint: '顾炎武画像',
  },
  {
    id: 52, name: '朱自清', stars: 3, dynasty: '近现代',
    camp: '风骨守志',
    description: '宁可饿死不领美国救济粮的散文家',
    keywords: ['有骨气', '有原则', '有才华', '爱写作', '清廉'],
    slogan: '饿死也不低头，一个文人的骨气',
    imageHint: '朱自清照片',
  },
  {
    id: 53, name: '文天祥', stars: 4, dynasty: '南宋',
    camp: '风骨守志',
    description: '留取丹心照汗青（侧重民族气节）',
    keywords: ['有骨气', '说到做到', '有原则', '勇敢', '坚持到底'],
    slogan: '人生自古谁无死，留取丹心照汗青',
    imageHint: '文天祥画像',
  },

  // ═══ 阵营六 · 匠心造物 ═══
  {
    id: 54, name: '李春', stars: 3, dynasty: '隋代',
    camp: '匠心造物',
    description: '赵州桥设计建造者，千年不倒的奇迹',
    keywords: ['喜欢建造', '有匠心', '有创意', '喜欢数学', '喜欢动手'],
    slogan: '一桥飞架1400年，石头也有匠心',
    imageHint: '赵州桥照片/李春画像',
  },
  {
    id: 55, name: '王羲之', stars: 4, dynasty: '东晋',
    camp: '匠心造物',
    description: '书圣，《兰亭集序》千古绝唱',
    keywords: ['爱书法', '有才气', '有耐心', '做事专注', '有艺术感'],
    slogan: '一字千金，书法的极致',
    imageHint: '王羲之像/兰亭序摹本',
  },
  {
    id: 56, name: '顾恺之', stars: 3, dynasty: '东晋',
    camp: '匠心造物',
    description: '东晋大画家，"传神写照"理论奠基人',
    keywords: ['爱画画', '有艺术感', '有想象力', '有创意', '善于观察'],
    slogan: '画龙点睛，传神在阿堵中',
    imageHint: '顾恺之《女史箴图》/画像',
  },
  {
    id: 57, name: '陆羽', stars: 4, dynasty: '唐代',
    camp: '匠心造物',
    description: '茶圣，《茶经》作者', 
    keywords: ['爱茶', '喜欢自然', '有匠心', '有钻研精神', '爱安静'],
    slogan: '一叶一世界，茶香飘千年',
    imageHint: '陆羽煮茶图',
  },
  {
    id: 58, name: '黄道婆', stars: 3, dynasty: '元代',
    camp: '匠心造物',
    description: '棉纺织技术革新家，改变百姓穿衣',
    keywords: ['有创意', '喜欢手工', '爱发明', '有匠心', '乐于助人'],
    slogan: '一枝纺车，温暖千万家',
    imageHint: '黄道婆像/棉纺织图',
  },
  {
    id: 59, name: '计成', stars: 3, dynasty: '明代',
    camp: '匠心造物',
    description: '《园冶》作者，中国园林艺术集大成者',
    keywords: ['爱自然', '有艺术感', '有创意', '喜欢设计', '善于观察'],
    slogan: '虽由人作，宛自天开',
    imageHint: '计成像/明代园林图',
  },
  {
    id: 60, name: '梅兰芳', stars: 3, dynasty: '近现代',
    camp: '匠心造物',
    description: '京剧表演艺术大师，有民族气节的艺术家',
    keywords: ['有艺术感', '有才华', '有骨气', '有匠心', '有原则'],
    slogan: '台上的风华绝代，台下的十年苦功',
    imageHint: '梅兰芳剧照',
  },
];

// 匹配用的辅助函数
export function matchByKeywords(preferredKeywords: string[]): SageFigure[] {
  const scored = sageFigures.map(figure => {
    const score = figure.keywords.filter(kw => 
      preferredKeywords.some(pk => kw.includes(pk) || pk.includes(kw))
    ).length;
    return { figure, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.figure);
}

export function getFigureById(id: number): SageFigure | undefined {
  return sageFigures.find(f => f.id === id);
}

export const camps = [
  { id: 'camp1', name: '华夏文明溯源', count: 4, icon: '🌄' },
  { id: 'camp2', name: '中华文明立国基石', count: 3, icon: '🏛️' },
  { id: 'camp3', name: '大国国防科技脊梁', count: 4, icon: '🚀' },
  { id: 'camp4', name: '民生济世安邦', count: 1, icon: '🌾' },
  { id: 'camp5', name: '云南乡土楷模', count: 2, icon: '🏔️' },
  { id: 'camp6a', name: '文脉传声', count: 8, icon: '📖' },
  { id: 'camp6b', name: '格物求真', count: 9, icon: '🔬' },
  { id: 'camp6c', name: '山河立心', count: 8, icon: '🗺️' },
  { id: 'camp6d', name: '仁心济世', count: 7, icon: '💊' },
  { id: 'camp6e', name: '风骨守志', count: 7, icon: '🎋' },
  { id: 'camp6f', name: '匠心造物', count: 7, icon: '🔨' },
];
