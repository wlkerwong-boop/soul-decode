import type { JiugongFull } from '../server/jiugong-v6';
import {
  JIUGONG_SOURCE_RULES,
  type RelationshipKey,
} from '../server/data/jiugong-source-rules';
import type { YearEnvironment } from './jiugong-environment';

export interface RelationshipDetail {
  key: RelationshipKey;
  title: string;
  meaning: string;
  annualContext: string;
  personalFit: string;
  strengths: string[];
  risks: string[];
  actions: string[];
  sourceIds: string[];
}

const META: Record<RelationshipKey, { title: string; meaning: string }> = {
  upper: {
    title: '上层关系',
    meaning: '看你与领导、长辈、制度、平台、房屋及能够提供保护和资源的人之间，如何互动与承接机会。',
  },
  self: {
    title: '自我关系',
    meaning: '看你的情绪、企图心、判断节奏与财富承接力，重点不是吉凶，而是当年如何稳定发挥。',
  },
  lower: {
    title: '下层关系',
    meaning: '看团队、属下、执行者、朋友、伴侣及周遭环境如何承接你的想法，也反映行动落地的质量。',
  },
  outer: {
    title: '对外关系',
    meaning: '看客户、合作方、市场、公众和陌生资源带来的机会与影响；本层没有独立碰撞周期。',
  },
};

function values(environment: YearEnvironment, key: RelationshipKey) {
  return {
    qi: environment[`${key}Qi`],
    energy: environment[`${key}Energy`],
    strategy: environment.strategies[key],
  };
}

function personalFit(data: JiugongFull, key: RelationshipKey): string {
  switch (key) {
    case 'upper':
      return `你的天格为${data.tian}（${data.tianWx}），思想关系呈现“${data.thinkRel}”；同时局差${data.ju}的底层发展方式是“${data.juDesc}”。因此你面对领导、长辈和平台时，既要照顾自己的思考反应，也要判断这次机会是否有真实支持，不能只看表面态度。`;
    case 'self':
      return `你的人格为${data.ren}（${data.renWx}），个人质为${data.zhi}·${data.zhiName}，属于“${data.zhiDesc}”；${data.mainFunc}提示“${data.mainFuncDesc}”。这决定你今年不是被动套用一条运势，而是会用自己的动力、判断和惯常节奏去承接同一环境。`;
    case 'lower':
      return `你的地格为${data.di}（${data.diWx}），行动关系是“${data.actionRel}”；管理风格为${data.mgtType}（${data.mgtScore}分，${data.mgtDesc}），关系底色为“${data.marriage}”。因此带团队和处理亲近关系时，要让行动方式、授权尺度与对方承接能力相匹配。`;
    case 'outer':
      return `你的总格为${data.total}，星运是“${data.xingyunName}”，财富通路为“${data.wealthPalace}／${data.wealthPath}”；${data.mainFunc}决定你更适合主动建立机会，还是借助合作与信息来放大机会。对外选择应同时检查曝光、资源和长期留存，不能只凭一时热度。`;
  }
}

function collision(
  environment: YearEnvironment,
  key: RelationshipKey,
): boolean | null {
  return key === 'outer' ? null : environment.collisions[key];
}

export function buildRelationshipDetails(
  data: JiugongFull,
  environment: YearEnvironment,
): RelationshipDetail[] {
  return (Object.keys(META) as RelationshipKey[]).map((key) => {
    const current = values(environment, key);
    const rule = JIUGONG_SOURCE_RULES.find(
      (item) => item.relationship === key && item.match === current.qi,
    );
    const hit = collision(environment, key);
    const annualContext = `${environment.year}年（虚岁${environment.age}），本层气场为“${current.qi}”、能量为“${current.energy}”，岁值星是${environment.ageStar}，处于【${environment.group.name}】。年度卷轴解释为“${environment.jiedu}”。${rule?.interpretation ?? '本层应先核对事实与资源，再判断实际影响。'}${hit === null ? '对外关系只呈现外部机会与影响，不推演独立碰撞。' : hit ? '本年命中本层碰撞期，压力、变化和关系摩擦需要预留缓冲。' : '本年未命中本层碰撞期，仍需按实际资源验证。'}`;
    const strategy = current.strategy || rule?.actions[0] || '先核对事实和资源，再决定行动';

    return {
      key,
      title: META[key].title,
      meaning: META[key].meaning,
      annualContext,
      personalFit: personalFit(data, key),
      strengths: rule?.strengths ?? ['能看清当年环境重点', '可按个人结构安排节奏'],
      risks: [
        ...(rule?.risks ?? ['缺少资料时不作额外推断']),
        ...(hit ? ['碰撞期避免在压力最大时仓促作最终决定'] : []),
      ],
      actions: [strategy, ...(rule?.actions ?? [])]
        .filter((item, index, list) => item && list.indexOf(item) === index)
        .slice(0, 4),
      sourceIds: [...new Set([
        ...(rule?.sourceIds ?? []),
        'JG-SRC-027',
        key === 'outer' ? 'JG-SRC-047' : 'JG-SRC-025',
      ])],
    };
  });
}
