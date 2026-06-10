// 星座与占星模块

export interface ZodiacInfo {
  name: string;
  englishName: string;
  dateRange: string;
  element: string;
  quality: string;
  rulingPlanet: string;
  symbol: string;
  traits: string[];
  description: string;
}

export const zodiacSigns: ZodiacInfo[] = [
  { name: '白羊座', englishName: 'Aries', dateRange: '3月21日-4月19日', element: '火', quality: '开创', rulingPlanet: '火星', symbol: '♈',
    traits: ['勇敢', '直率', '热情', '冲动', '好胜'],
    description: '白羊座是黄道十二宫的第一个星座，象征着开始与新生。你天生具备开拓者的勇气和冲劲，行动力超群，想到就做。你的直率有时候会让人觉得莽撞，但这正是你魅力的来源——你从不过多伪装自己。' },
  { name: '金牛座', englishName: 'Taurus', dateRange: '4月20日-5月20日', element: '土', quality: '固定', rulingPlanet: '金星', symbol: '♉',
    traits: ['稳重', '执着', '务实', '享乐', '固执'],
    description: '金牛座是稳定和坚持的代名词。你脚踏实地，对物质和精神的美都有极高的鉴赏力。一旦确定了目标，你会以惊人的毅力坚持到底。你的固执既是你的盾牌也是你的枷锁——学会放手，是你的人生功课。' },
  { name: '双子座', englishName: 'Gemini', dateRange: '5月21日-6月20日', element: '风', quality: '变动', rulingPlanet: '水星', symbol: '♊',
    traits: ['好奇', '善变', '机智', '社交', '善辩'],
    description: '双子座是信息的收集者和传播者。你天生好奇，对世界充满探索欲，语言天赋极高。你的双重性格让人捉摸不透，但也让你成为最有魅力的对话者。你需要的是深度——在无穷的可能性中找到值得扎根的那一个。' },
  { name: '巨蟹座', englishName: 'Cancer', dateRange: '6月21日-7月22日', element: '水', quality: '开创', rulingPlanet: '月亮', symbol: '♋',
    traits: ['敏感', '顾家', '直觉强', '保护欲', '情绪化'],
    description: '巨蟹座是十二星座中最具母性和保护欲的星座。你有极强的直觉和同理心，能敏锐地感知他人的情绪变化。家对你来说是安身立命的根本。你的敏感是天赋，也是软肋——学会在保护他人的同时保护自己。' },
  { name: '狮子座', englishName: 'Leo', dateRange: '7月23日-8月22日', element: '火', quality: '固定', rulingPlanet: '太阳', symbol: '♌',
    traits: ['自信', '慷慨', '领导力', '骄傲', '热情'],
    description: '狮子座是天生的王者。你自信、耀眼，有一种与生俱来的领袖气质。你的慷慨和热情让周围的人不自觉地被你吸引。你的骄傲是你的王冠，但真正的王者懂得适时低头——谦逊是你最需要学习的功课。' },
  { name: '处女座', englishName: 'Virgo', dateRange: '8月23日-9月22日', element: '土', quality: '变动', rulingPlanet: '水星', symbol: '♍',
    traits: ['细致', '理性', '完美主义', '谦逊', '挑剔'],
    description: '处女座是完美主义的化身。你有着惊人的分析能力和对细节的极致追求，做事的严谨和可靠让人放心。你的谦逊让你从不居功自傲。但你对自己的苛求也常常成为痛苦的来源——学会接纳不完美，是你最大的修行。' },
  { name: '天秤座', englishName: 'Libra', dateRange: '9月23日-10月22日', element: '风', quality: '开创', rulingPlanet: '金星', symbol: '♎',
    traits: ['优雅', '公正', '社交', '犹豫', '追求和谐'],
    description: '天秤座是美的使者和平衡的守护者。你天生具有优雅的气质和卓越的社交能力，追求一切事物的和谐与平衡。你的公正感让你成为天生的调解者。但你对平衡的执着也让你陷入选择困难——学会做出果断的选择。' },
  { name: '天蝎座', englishName: 'Scorpio', dateRange: '10月23日-11月21日', element: '水', quality: '固定', rulingPlanet: '冥王星/火星', symbol: '♏',
    traits: ['深邃', '神秘', '执着', '洞察力', '极端'],
    description: '天蝎座是十二星座中最具深度和力量的星座。你有着洞察人心的锐利目光和不达目的不罢休的惊人意志。你的情感如深海般厚重而神秘。你的极致既是祝福也是诅咒——学会在黑白之间找到灰色地带。' },
  { name: '射手座', englishName: 'Sagittarius', dateRange: '11月22日-12月21日', element: '火', quality: '变动', rulingPlanet: '木星', symbol: '♐',
    traits: ['乐观', '自由', '冒险', '直率', '不拘小节'],
    description: '射手座是自由的追寻者和真理的探索者。你天生乐观，对世界充满好奇和探索欲，热爱自由胜过一切。你的直率和幽默让你成为极好的旅伴。但你逃避责任的倾向是你需要正视的课题——真正的自由源于责任。' },
  { name: '摩羯座', englishName: 'Capricorn', dateRange: '12月22日-1月19日', element: '土', quality: '开创', rulingPlanet: '土星', symbol: '♑',
    traits: ['务实', '有野心', '坚韧', '自律', '保守'],
    description: '摩羯座是成就的攀登者。你有着超乎常人的自律和毅力，为了目标可以付出持续不断的努力。你的务实和稳重让人信赖。但你的严肃和对成就的执着有时会让你错过生活的美好——学会放松和享受当下。' },
  { name: '水瓶座', englishName: 'Aquarius', dateRange: '1月20日-2月18日', element: '风', quality: '固定', rulingPlanet: '天王星', symbol: '♒',
    traits: ['创新', '独立', '博爱', '叛逆', '理性'],
    description: '水瓶座是时代的前瞻者和变革的推动者。你的思维超前，总能看到别人看不到的可能性。你的独立和叛逆让你不受传统束缚。你的博爱让你关心全人类的命运。但你的理性有时让你显得疏离——别忘了情感的温度。' },
  { name: '双鱼座', englishName: 'Pisces', dateRange: '2月19日-3月20日', element: '水', quality: '变动', rulingPlanet: '海王星/木星', symbol: '♓',
    traits: ['有同情心', '直觉强', '有艺术天赋', '敏感', '逃避倾向'],
    description: '双鱼座是梦想家和疗愈者。你拥有十二星座中最丰富的想象力和最深的同理心。你的直觉让你能感知到他人无法感知的微妙能量。你的艺术天赋让你成为天生的创作者。但你的逃避倾向是最需要克服的课题——直面现实比沉浸在幻想中更有力量。' },
];

export function getZodiacByDate(month: number, day: number): ZodiacInfo | undefined {
  const m = month;
  const d = day;
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return zodiacSigns[0];  // 白羊
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return zodiacSigns[1];  // 金牛
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return zodiacSigns[2];  // 双子
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return zodiacSigns[3];  // 巨蟹
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return zodiacSigns[4];  // 狮子
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return zodiacSigns[5];  // 处女
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return zodiacSigns[6]; // 天秤
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return zodiacSigns[7]; // 天蝎
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return zodiacSigns[8]; // 射手
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return zodiacSigns[9];  // 摩羯
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return zodiacSigns[10];  // 水瓶
  if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return zodiacSigns[11];  // 双鱼
  return undefined;
}

export function getChineseZodiac(year: number): string {
  const animals = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊'];
  return animals[year % 12];
}

export function getChineseZodiacElement(year: number): string {
  const elements = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
  return elements[year % 10];
}
