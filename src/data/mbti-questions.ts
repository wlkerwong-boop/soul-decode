// MBTI 题库 — 48题精简版
// 每个维度12题，覆盖E/I, S/N, T/F, J/P

export interface MBTIQuestion {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  direction: 'first' | 'second'; // first = 第一选项对应维度第一个字母
  optionA: string; // 对应 direction
  optionB: string; // 对应另一个方向
}

export const mbtiQuestions: MBTIQuestion[] = [
  // === E/I 维度（外向/内向）12题 ===
  { id: 1, text: '在社交聚会后，你通常感到：', dimension: 'EI', direction: 'first', optionA: '精力充沛，想继续互动', optionB: '需要独处来恢复能量' },
  { id: 2, text: '与陌生人交流时，你通常：', dimension: 'EI', direction: 'first', optionA: '很快就能聊起来', optionB: '需要时间才能热络' },
  { id: 3, text: '你更喜欢的周末安排是：', dimension: 'EI', direction: 'second', optionA: '在家安静地看书或做自己的事', optionB: '约朋友出去聚会或参加活动' },
  { id: 4, text: '在工作中，你更倾向于：', dimension: 'EI', direction: 'first', optionA: '和团队一起 brainstorming', optionB: '独自深入思考后再讨论' },
  { id: 5, text: '你如何形容自己的社交风格：', dimension: 'EI', direction: 'first', optionA: '朋友多，交际广', optionB: '朋友少但关系深' },
  { id: 6, text: '当遇到问题时，你首先会：', dimension: 'EI', direction: 'second', optionA: '自己先想办法', optionB: '找人聊聊寻求建议' },
  { id: 7, text: '在会议中，你通常是：', dimension: 'EI', direction: 'first', optionA: '说话较多的一方', optionB: '倾听较多的一方' },
  { id: 8, text: '你更倾向于表达自己的想法：', dimension: 'EI', direction: 'first', optionA: '边说边想，在表达中整理思路', optionB: '先在脑中想清楚再说' },
  { id: 9, text: '在大型活动中，你更喜欢：', dimension: 'EI', direction: 'second', optionA: '待在角落观察', optionB: '融入人群互动' },
  { id: 10, text: '你日常的能量来源更多来自：', dimension: 'EI', direction: 'first', optionA: '与他人的互动', optionB: '独处和内省' },
  { id: 11, text: '别人通常形容你是：', dimension: 'EI', direction: 'first', optionA: '外向开朗', optionB: '安静内敛' },
  { id: 12, text: '在团队合作中，你更偏向：', dimension: 'EI', direction: 'second', optionA: '独立完成任务', optionB: '协作完成任务' },

  // === S/N 维度（实感/直觉）12题 ===
  { id: 13, text: '你更关注的是：', dimension: 'SN', direction: 'first', optionA: '具体的事实和细节', optionB: '整体的概念和可能性' },
  { id: 14, text: '当你学习新东西时，你更喜欢：', dimension: 'SN', direction: 'second', optionA: '了解它的实际应用', optionB: '理解背后的原理和理论' },
  { id: 15, text: '你更倾向于相信：', dimension: 'SN', direction: 'first', optionA: '眼见为实的经验', optionB: '直觉和第六感' },
  { id: 16, text: '在阅读时，你更关注：', dimension: 'SN', direction: 'second', optionA: '字面意思和具体信息', optionB: '言外之意和深层含义' },
  { id: 17, text: '你更偏好哪种类型的对话：', dimension: 'SN', direction: 'first', optionA: '聊实际发生的事和具体经历', optionB: '聊想法、理论和未来的可能性' },
  { id: 18, text: '在解决问题时，你更依赖：', dimension: 'SN', direction: 'first', optionA: '已有的经验和 proven 的方法', optionB: '创新的想法和新的可能性' },
  { id: 19, text: '你更喜欢哪种类型的朋友：', dimension: 'SN', direction: 'second', optionA: '天马行空、充满想象力的人', optionB: '脚踏实地、注重实际的人' },
  { id: 20, text: '描述事物时，你倾向于：', dimension: 'SN', direction: 'first', optionA: '描述具体、精确的细节', optionB: '使用比喻和意象' },
  { id: 21, text: '你更容易记住：', dimension: 'SN', direction: 'first', optionA: '实际发生过的事情', optionB: '自己联想和想象的内容' },
  { id: 22, text: '你对哪种信息更敏感：', dimension: 'SN', direction: 'second', optionA: '实际的变化和具体数据', optionB: '潜在的趋势和模式' },
  { id: 23, text: '做计划时，你更关注：', dimension: 'SN', direction: 'first', optionA: '步骤和细节', optionB: '愿景和方向' },
  { id: 24, text: '你更欣赏哪种说话方式：', dimension: 'SN', direction: 'second', optionA: '简洁明了、直奔主题', optionB: '富有诗意、引人深思' },

  // === T/F 维度（思考/情感）12题 ===
  { id: 25, text: '做重要决策时，你更依赖：', dimension: 'TF', direction: 'first', optionA: '逻辑分析和客观事实', optionB: '个人价值观和对他人的影响' },
  { id: 26, text: '当朋友向你倾诉烦恼时，你首先：', dimension: 'TF', direction: 'second', optionA: '给ta情感支持和理解', optionB: '帮ta分析问题出在哪' },
  { id: 27, text: '你更在意的是：', dimension: 'TF', direction: 'first', optionA: '事情是否正确', optionB: '是否伤害了他人的感受' },
  { id: 28, text: '在争论中，你更倾向于：', dimension: 'TF', direction: 'first', optionA: '坚持逻辑和事实', optionB: '维护和谐的关系' },
  { id: 29, text: '你觉得自己更偏向：', dimension: 'TF', direction: 'second', optionA: '理性大于感性', optionB: '感性大于理性' },
  { id: 30, text: '评价一个人时，你更看重：', dimension: 'TF', direction: 'first', optionA: 'ta的能力和成就', optionB: 'ta的品格和为人' },
  { id: 31, text: '在团队中看到不公平的事时，你首先会：', dimension: 'TF', direction: 'first', optionA: '指出问题和逻辑矛盾', optionB: '安抚受影响的人的情绪' },
  { id: 32, text: '你更倾向于被认为是一个什么样的人：', dimension: 'TF', direction: 'second', optionA: '有同情心、善解人意', optionB: '有原则、公平公正' },
  { id: 33, text: '批评他人时，你更注重：', dimension: 'TF', direction: 'first', optionA: '指出问题本身的错误', optionB: '选择合适的表达方式' },
  { id: 34, text: '你看电影时更容易被什么打动：', dimension: 'TF', direction: 'second', optionA: '故事情感和人物命运', optionB: '剧情逻辑和叙事结构' },
  { id: 35, text: '在团队中你更倾向于扮演什么角色：', dimension: 'TF', direction: 'first', optionA: '冷静的决策者', optionB: '和谐氛围的维护者' },
  { id: 36, text: '你需要做决定时，更常问自己：', dimension: 'TF', direction: 'first', optionA: '这样做合理吗？', optionB: '这样做对大家好吗？' },

  // === J/P 维度（判断/感知）12题 ===
  { id: 37, text: '你更喜欢的工作方式是：', dimension: 'JP', direction: 'first', optionA: '按计划有条不紊地进行', optionB: '保持灵活，随机应变' },
  { id: 38, text: '你的生活空间通常是：', dimension: 'JP', direction: 'first', optionA: '整洁有序，每样东西有固定位置', optionB: '看似混乱但我知道在哪' },
  { id: 39, text: '面对截止日期，你通常：', dimension: 'JP', direction: 'second', optionA: '赶在最后一刻完成', optionB: '提前规划并提前完成' },
  { id: 40, text: '你更偏好哪种旅行方式：', dimension: 'JP', direction: 'first', optionA: '详细规划的行程', optionB: '随心所欲的探索' },
  { id: 41, text: '你更倾向于：', dimension: 'JP', direction: 'second', optionA: '享受当下，不必事事有计划', optionB: '按时间表生活更安心' },
  { id: 42, text: '当计划被打乱时，你通常：', dimension: 'JP', direction: 'first', optionA: '感到不舒服', optionB: '觉得没什么，可以调整' },
  { id: 43, text: '你的工作桌面通常是：', dimension: 'JP', direction: 'first', optionA: '整洁干净', optionB: '堆满了正在处理的东西' },
  { id: 44, text: '在项目管理上，你更偏向：', dimension: 'JP', direction: 'first', optionA: '设定明确的里程碑和时间节点', optionB: '跟着感觉走，灵活调整' },
  { id: 45, text: '你更喜欢的生活节奏是：', dimension: 'JP', direction: 'second', optionA: '悠闲随性', optionB: '规律有序' },
  { id: 46, text: '你如何评价你的决策风格：', dimension: 'JP', direction: 'first', optionA: '倾向于尽快做出决定', optionB: '倾向于保留选择权' },
  { id: 47, text: '对于不确定性，你的态度是：', dimension: 'JP', direction: 'second', optionA: '感到焦虑，想要确定答案', optionB: '感到兴奋，充满可能性' },
  { id: 48, text: '你更常有人说你：', dimension: 'JP', direction: 'first', optionA: '做事有规划', optionB: '做事随性' },
];

// Scoring algorithm
export function calculateMBTI(answers: Record<number, 'A' | 'B'>): string {
  const scores = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };

  for (const q of mbtiQuestions) {
    const answer = answers[q.id];
    if (!answer) continue;

    const isFirst = answer === 'A';
    const selectedFirst = (q.direction === 'first') ? isFirst : !isFirst;

    switch (q.dimension) {
      case 'EI':
        selectedFirst ? scores.E++ : scores.I++;
        break;
      case 'SN':
        selectedFirst ? scores.S++ : scores.N++;
        break;
      case 'TF':
        selectedFirst ? scores.T++ : scores.F++;
        break;
      case 'JP':
        selectedFirst ? scores.J++ : scores.P++;
        break;
    }
  }

  const ei = scores.E >= scores.I ? 'E' : 'I';
  const sn = scores.S >= scores.N ? 'S' : 'N';
  const tf = scores.T >= scores.F ? 'T' : 'F';
  const jp = scores.J >= scores.P ? 'J' : 'P';

  return `${ei}${sn}${tf}${jp}`;
}

export function getDimensionScore(answers: Record<number, 'A' | 'B'>): Record<string, {first:number, second:number}> {
  const scores = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };

  for (const q of mbtiQuestions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const isFirst = answer === 'A';
    const selectedFirst = (q.direction === 'first') ? isFirst : !isFirst;
    switch (q.dimension) {
      case 'EI': selectedFirst ? scores.E++ : scores.I++; break;
      case 'SN': selectedFirst ? scores.S++ : scores.N++; break;
      case 'TF': selectedFirst ? scores.T++ : scores.F++; break;
      case 'JP': selectedFirst ? scores.J++ : scores.P++; break;
    }
  }

  return {
    EI: { first: scores.E, second: scores.I },
    SN: { first: scores.S, second: scores.N },
    TF: { first: scores.T, second: scores.F },
    JP: { first: scores.J, second: scores.P },
  };
}
