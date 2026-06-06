/**
 * 生命路径数字计算（Numerology）
 * 
 * 规则：将出生年月日的所有数字相加，直到得到个位数（或11/22主数）
 * 示例：1982年1月27日 = 1+9+8+2+0+1+2+7 = 30 → 3+0 = 3
 */

function sumDigits(num: number): number {
  return String(num).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
}

function reduceToRoot(num: number): number {
  // 主数 11、22、33 不继续化简
  if (num === 11 || num === 22 || num === 33) return num;
  if (num < 10) return num;
  return reduceToRoot(sumDigits(num));
}

export interface NumericResult {
  lifePathNumber: number;
  isMasterNumber: boolean;
  rawSum: number;
}

export function calculateLifePathNumber(year: number, month: number, day: number): NumericResult {
  const daySum = sumDigits(day);
  const monthSum = sumDigits(month);
  const yearSum = sumDigits(year);

  const total = daySum + monthSum + yearSum;
  const root = reduceToRoot(total);

  return {
    lifePathNumber: root,
    isMasterNumber: [11, 22, 33].includes(root),
    rawSum: total,
  };
}

/**
 * 生命路径数字核心特质
 */
export const lifePathMeanings: Record<number, { title: string; keyword: string; essence: string }> = {
  1: { title: '开创者', keyword: '独立', essence: '天生的领导者，独立自主，开创精神。你的使命是活出独特的自我，引领他人走向新方向。' },
  2: { title: '调和者', keyword: '合作', essence: '天生的外交家，敏感细腻，善于合作。你的使命是搭建桥梁，创造和谐。' },
  3: { title: '表达者', keyword: '创造', essence: '天生的创作者，充满灵感与表达欲。你的使命是用你的声音、文字或艺术感染世界。' },
  4: { title: '建造者', keyword: '秩序', essence: '天生的实干家，务实可靠，以秩序创造价值。你的使命是建立稳定的系统与结构。' },
  5: { title: '探索者', keyword: '自由', essence: '天生的冒险家，渴望自由与变化。你的使命是突破边界，体验生命的多样性。' },
  6: { title: '守护者', keyword: '责任', essence: '天生的疗愈者，充满爱与责任。你的使命是照顾、治愈和美化这个世界。' },
  7: { title: '智者', keyword: '真理', essence: '天生的思想家，深度内省，追求真理。你的使命是探寻深层智慧，揭示隐藏的知识。' },
  8: { title: '成就者', keyword: '力量', essence: '天生的管理者，商业嗅觉敏锐，执行力超群。你的使命是掌握力量，创造物质世界的丰盛。' },
  9: { title: '博爱者', keyword: '智慧', essence: '天生的哲学家，心怀天下，以智慧服务众生。你的使命是超越小我，为更大的善而活。' },
  11: { title: '灵感者', keyword: '启示', essence: '天生的高我通道，拥有极强的直觉与灵性天赋。你的使命是将高维灵感带入物质世界，照亮他人。' },
  22: { title: '建造大师', keyword: '显化', essence: '拥有将宏大愿景落地的非凡能力。你的使命是将梦想化为现实，建造造福世人的伟大工程。' },
  33: { title: '导师', keyword: '慈爱', essence: '宇宙级的疗愈力量，无条件的爱与智慧的化身。你的使命是通过爱与教导，提升集体意识。' },
};
