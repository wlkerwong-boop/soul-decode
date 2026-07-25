// IPIP-50 大五人格题库（International Personality Item Pool, Public Domain）
// 来源: https://ipip.ori.org/New_IPIP-50-item-scale.htm
// 中文翻译: 小舍得译，参考 IPIP 官方中文译本措辞

export interface IPIP50Question {
  id: number;
  text: string;           // 中文题目
  textEn: string;         // 英文原文
  dimension: 'E' | 'A' | 'C' | 'N' | 'O';
  reversed: boolean;      // true = 反向计分
}

export const ipip50Questions: IPIP50Question[] = [
  // ═══ E 外向性 Extraversion (10题) ═══
  { id: 1, text: '我是聚会中的活跃分子', textEn: 'Am the life of the party.', dimension: 'E', reversed: false },
  { id: 2, text: '我话不多', textEn: "Don't talk a lot.", dimension: 'E', reversed: true },
  { id: 3, text: '我在人群中感到自在', textEn: 'Feel comfortable around people.', dimension: 'E', reversed: false },
  { id: 4, text: '我喜欢待在幕后', textEn: 'Keep in the background.', dimension: 'E', reversed: true },
  { id: 5, text: '我会主动发起对话', textEn: 'Start conversations.', dimension: 'E', reversed: false },
  { id: 6, text: '我没什么可说的', textEn: 'Have little to say.', dimension: 'E', reversed: true },
  { id: 7, text: '我会在聚会上和很多不同的人交谈', textEn: 'Talk to a lot of different people at parties.', dimension: 'E', reversed: false },
  { id: 8, text: '我不喜欢引起别人注意', textEn: "Don't like to draw attention to myself.", dimension: 'E', reversed: true },
  { id: 9, text: '我不介意成为众人瞩目的焦点', textEn: "Don't mind being the center of attention.", dimension: 'E', reversed: false },
  { id: 10, text: '我在陌生人面前比较安静', textEn: 'Am quiet around strangers.', dimension: 'E', reversed: true },

  // ═══ A 宜人性 Agreeableness (10题) ═══
  { id: 11, text: '我不太关心别人', textEn: 'Feel little concern for others.', dimension: 'A', reversed: true },
  { id: 12, text: '我对人感兴趣', textEn: 'Am interested in people.', dimension: 'A', reversed: false },
  { id: 13, text: '我会出言不逊', textEn: 'Insult people.', dimension: 'A', reversed: true },
  { id: 14, text: '我能体会他人的感受', textEn: "Sympathize with others' feelings.", dimension: 'A', reversed: false },
  { id: 15, text: '我对别人的问题不感兴趣', textEn: "Am not interested in other people's problems.", dimension: 'A', reversed: true },
  { id: 16, text: '我心肠软', textEn: 'Have a soft heart.', dimension: 'A', reversed: false },
  { id: 17, text: '我对他人不太感兴趣', textEn: 'Am not really interested in others.', dimension: 'A', reversed: true },
  { id: 18, text: '我会花时间帮助别人', textEn: 'Take time out for others.', dimension: 'A', reversed: false },
  { id: 19, text: '我能感受到别人的情绪', textEn: "Feel others' emotions.", dimension: 'A', reversed: false },
  { id: 20, text: '我让人感到自在舒适', textEn: 'Make people feel at ease.', dimension: 'A', reversed: false },

  // ═══ C 尽责性 Conscientiousness (10题) ═══
  { id: 21, text: '我总是做好准备', textEn: 'Am always prepared.', dimension: 'C', reversed: false },
  { id: 22, text: '我把东西乱放', textEn: 'Leave my belongings around.', dimension: 'C', reversed: true },
  { id: 23, text: '我注重细节', textEn: 'Pay attention to details.', dimension: 'C', reversed: false },
  { id: 24, text: '我常把事情弄得一团糟', textEn: 'Make a mess of things.', dimension: 'C', reversed: true },
  { id: 25, text: '我会立即处理待办事务', textEn: 'Get chores done right away.', dimension: 'C', reversed: false },
  { id: 26, text: '我常忘记把东西放回原位', textEn: 'Often forget to put things back in their proper place.', dimension: 'C', reversed: true },
  { id: 27, text: '我喜欢井井有条', textEn: 'Like order.', dimension: 'C', reversed: false },
  { id: 28, text: '我会逃避责任', textEn: 'Shirk my duties.', dimension: 'C', reversed: true },
  { id: 29, text: '我按照计划行事', textEn: 'Follow a schedule.', dimension: 'C', reversed: false },
  { id: 30, text: '我对工作要求精益求精', textEn: 'Am exacting in my work.', dimension: 'C', reversed: false },

  // ═══ N 神经质 Neuroticism / 情绪稳定性 (10题) ═══
  // 注意：IPIP 原量表标为 Emotional Stability（情绪稳定性），此处转化为神经质维度
  // 高分 = 情绪波动大 / 易焦虑（高神经质）
  { id: 31, text: '我容易感到压力', textEn: 'Get stressed out easily.', dimension: 'N', reversed: false },
  { id: 32, text: '我大多数时候很放松', textEn: 'Am relaxed most of the time.', dimension: 'N', reversed: true },
  { id: 33, text: '我容易担忧', textEn: 'Worry about things.', dimension: 'N', reversed: false },
  { id: 34, text: '我很少情绪低落', textEn: 'Seldom feel blue.', dimension: 'N', reversed: true },
  { id: 35, text: '我很容易受到干扰', textEn: 'Am easily disturbed.', dimension: 'N', reversed: false },
  { id: 36, text: '我容易心烦意乱', textEn: 'Get upset easily.', dimension: 'N', reversed: false },
  { id: 37, text: '我的情绪变化很大', textEn: 'Change my mood a lot.', dimension: 'N', reversed: false },
  { id: 38, text: '我的情绪波动频繁', textEn: 'Have frequent mood swings.', dimension: 'N', reversed: false },
  { id: 39, text: '我容易烦躁', textEn: 'Get irritated easily.', dimension: 'N', reversed: false },
  { id: 40, text: '我常常感到忧郁', textEn: 'Often feel blue.', dimension: 'N', reversed: false },

  // ═══ O 开放性 Openness to Experience (10题) ═══
  { id: 41, text: '我的词汇量丰富', textEn: 'Have a rich vocabulary.', dimension: 'O', reversed: false },
  { id: 42, text: '我难以理解抽象的概念', textEn: 'Have difficulty understanding abstract ideas.', dimension: 'O', reversed: true },
  { id: 43, text: '我充满生动的想象力', textEn: 'Have a vivid imagination.', dimension: 'O', reversed: false },
  { id: 44, text: '我对抽象概念不感兴趣', textEn: 'Am not interested in abstract ideas.', dimension: 'O', reversed: true },
  { id: 45, text: '我有很多出色的想法', textEn: 'Have excellent ideas.', dimension: 'O', reversed: false },
  { id: 46, text: '我不太有想象力', textEn: 'Do not have a good imagination.', dimension: 'O', reversed: true },
  { id: 47, text: '我理解事物很快', textEn: 'Am quick to understand things.', dimension: 'O', reversed: false },
  { id: 48, text: '我会使用有难度的词汇', textEn: 'Use difficult words.', dimension: 'O', reversed: false },
  { id: 49, text: '我会花时间反思思考', textEn: 'Spend time reflecting on things.', dimension: 'O', reversed: false },
  { id: 50, text: '我脑子里总是充满想法', textEn: 'Am full of ideas.', dimension: 'O', reversed: false },
];

export interface BigFiveScores {
  E: number;  // 外向性 10-50
  A: number;  // 宜人性 10-50
  C: number;  // 尽责性 10-50
  N: number;  // 神经质 10-50
  O: number;  // 开放性 10-50
}

export interface BigFiveResult {
  dimension: 'E' | 'A' | 'C' | 'N' | 'O';
  label: string;
  labelEn: string;
  score: number;       // 原始分 10-50
  level: '低' | '中低' | '中等' | '中高' | '高';
  description: string; // 一句话解读
}

const dimensionMeta: Record<string, { label: string; labelEn: string }> = {
  E: { label: '外向性', labelEn: 'Extraversion' },
  A: { label: '宜人性', labelEn: 'Agreeableness' },
  C: { label: '尽责性', labelEn: 'Conscientiousness' },
  N: { label: '神经质', labelEn: 'Neuroticism' },
  O: { label: '开放性', labelEn: 'Openness' },
};

/** 计分：对各维度分别求和（反向题已翻转） */
export function calculateBigFive(answers: Record<number, number>): BigFiveScores {
  const scores: BigFiveScores = { E: 0, A: 0, C: 0, N: 0, O: 0 };

  for (const q of ipip50Questions) {
    const raw = answers[q.id] ?? 3; // 未作答默认中间值
    const score = q.reversed ? 6 - raw : raw;
    scores[q.dimension] += score;
  }

  return scores;
}

/** 根据原始分返回等级（10-50） */
function getLevel(score: number): '低' | '中低' | '中等' | '中高' | '高' {
  if (score <= 22) return '低';
  if (score <= 28) return '中低';
  if (score <= 36) return '中等';
  if (score <= 42) return '中高';
  return '高';
}

/** 生成各维度解读 */
function getDescription(dimension: string, score: number, level: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    E: {
      '高': '你精力充沛，喜欢与人交往，在社交场合中如鱼得水。独处太久可能会让你感到压抑。',
      '中高': '你比较喜欢社交，能在人群中自如表达，但也偶尔需要独处的空间来恢复精力。',
      '中等': '你在社交与独处之间保持平衡——既享受与人相处的乐趣，也珍视自己的私人空间。',
      '中低': '你偏向安静内敛，更喜欢小圈子深度交流而非大场面社交。独处是你恢复能量的主要方式。',
      '低': '你是一个安静的内向者，在独处中获得能量。你更享受一对一的深度对话，而非喧闹的群体活动。',
    },
    A: {
      '高': '你富有同理心，乐于助人，愿意花时间理解他人的感受。你在人际关系中温暖而有耐心。',
      '中高': '你比较善解人意，通常愿意合作和妥协，在人际关系中表现出较多的关心和理解。',
      '中等': '你在关心他人和保持自我之间取得了平衡。你会帮助别人，但也知道何时需要照顾自己。',
      '中低': '你比较务实直接，不会轻易被他人情绪影响。你倾向于理性分析问题而非感情用事。',
      '低': '你习惯用逻辑和理性来处理事情，不太容易被他人情绪左右。你更看重事实和效率，而非人际和谐。',
    },
    C: {
      '高': '你做事有条不紊，追求卓越，喜欢计划和秩序。可靠和自律是你的标志。',
      '中高': '你做事比较有条理，大多数时候能按时完成任务，对自己的承诺比较负责。',
      '中等': '你在计划与灵活之间找到了平衡。你会安排重要的事，也允许自己偶尔随性。',
      '中低': '你喜欢灵活变通，不太喜欢被严格的日程框住。有时可能会拖延，但你的适应能力很强。',
      '低': '你崇尚自由和即兴，不喜欢被规则和计划束缚。你可能更依赖直觉和灵感来驱动行动。',
    },
    N: {
      '高': '你情绪敏感，容易感到压力和焦虑。你对环境的波动反应较大，但也意味着你具有敏锐的感受力。',
      '中高': '你比较容易感受到负面情绪，有时会为小事担忧。你的情绪雷达比较灵敏。',
      '中等': '你的情绪状态基本稳定，虽然偶尔会有起伏，但大多数时间能保持平和心态。',
      '中低': '你情绪比较稳定，面对压力时能保持冷静。你在逆境中展现出较好的心理韧性。',
      '低': '你情绪非常稳定，泰山崩于前而色不变。你天生就有较强的心理缓冲能力，很少陷入焦虑。',
    },
    O: {
      '高': '你对世界充满好奇心，喜欢探索新思想和新体验。创造力、想象力和求知欲是你的核心特质。',
      '中高': '你比较开放，愿意尝试新事物，对艺术和思想领域有较为浓厚的兴趣。',
      '中等': '你在传统与创新之间保持平衡。你既欣赏熟悉的安全感，也对新体验抱有适度的好奇心。',
      '中低': '你比较务实，更看重实际可行的方案而非天马行空的想法。你更喜欢熟悉和可预测的事物。',
      '低': '你脚踏实地，倾向于依赖已证实的经验而非抽象理论。你更喜欢具体和实在的任务。',
    },
  };
  return descriptions[dimension]?.[level] ?? '';
}

/** 生成完整结果数组 */
export function getBigFiveResults(scores: BigFiveScores): BigFiveResult[] {
  const dimensions: Array<'E' | 'A' | 'C' | 'N' | 'O'> = ['E', 'A', 'C', 'N', 'O'];
  return dimensions.map(dim => {
    const score = scores[dim];
    const level = getLevel(score);
    return {
      dimension: dim,
      label: dimensionMeta[dim].label,
      labelEn: dimensionMeta[dim].labelEn,
      score,
      level,
      description: getDescription(dim, score, level),
    };
  });
}

/** 免责声明 */
export const BIGFIVE_DISCLAIMER =
  '本测评基于 IPIP-50（International Personality Item Pool）科学量表，常模为成人样本，未成年人结果仅供趋势参考。本测评为自我认识工具，非临床心理诊断。';
