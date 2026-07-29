import type { JiugongFull } from '../server/jiugong-v6';
import type { YearEnvironment } from './jiugong-environment';

export type AdviceTopic = 'career' | 'wealth' | 'love' | 'house' | 'health';

type StrategyMap = Record<string, string>;

export const JIUGONG_STRATEGIES: {
  upper: StrategyMap;
  self: StrategyMap;
  lower: StrategyMap;
} = {
  upper: {
    晦暗: '低调安分，不可投机，注意形象',
    享成: '经营上层，感恩回报，不可懒散',
    争夺: '团结和解，息事宁人，避免诉讼',
    付出: '深耕内部，不宜扩张，可置产',
    名望: '求新事物，经营上层人际关系',
    入库: '求财禄，提升产品价值',
    升格: '稳健成长，防官司，原有基础发展',
    开拓: '开拓新方向，找财气旺者合作',
    转变: '转型调整，扭转乾坤',
  },
  self: {
    晦暗: '控制脾气，和气生财，暗财滚滚',
    享成: '五鬼运财，不可倦怠',
    争夺: '忌贪，重大决策三思',
    付出: '财不露白，勿投资',
    名望: '本业财富，多做多得',
    入库: '收账时机，保存实力',
    升格: '钱财重叠，由一为二',
    开拓: '借力使力，防破财',
    转变: '调整心态，顺应转变',
  },
  lower: {
    晦暗: '小心交友，防意外，留意属下',
    享成: '周边贵人，授权属下',
    争夺: '易有纷争，激励团队',
    付出: '训练属下，防人才流失',
    名望: '得人才，结婚佳',
    入库: '管账为主，花钱置产',
    升格: '授权为主，防合伙拆伙',
    开拓: '招募新人，勿投资',
    转变: '调整团队，去芜存菁',
  },
};

export interface AdviceResult {
  topic: AdviceTopic;
  text: string;
  context: {
    year: number;
    ageStar: string;
    group: string;
    collisions: YearEnvironment['collisions'];
  };
}

const TOPIC_OPENING: Record<AdviceTopic, (data: JiugongFull) => string> = {
  career: (data) => `事业以“${data.mainFunc}”为主轴，${data.mainFuncDesc}`,
  wealth: (data) => `财运底盘为“${data.wealthPalace}”，通路提示：${data.wealthPath}`,
  love: (data) => `关系底色为“${data.marriage}”，${data.marriageDesc}`,
  house: (data) => `居住与资产安排宜结合“${data.wealthPalace}”的节奏，${data.wealthPalaceDesc}`,
  health: (data) => `身心安排可参考人格五行“${data.renWx}”与当年能量，但不替代专业医疗判断`,
};

const TOPIC_FOCUS: Record<AdviceTopic, string> = {
  career: '优先看上层机会与团队承接，重大动作先验证资源和支持。',
  wealth: '优先守住现金流与风险边界，不因短期情绪追逐高波动机会。',
  love: '把沟通、边界和共同决定放在前面，避免用猜测替代确认。',
  house: '先核对长期负担、真实需求与合同细节，再决定置产或调整。',
  health: '保持规律作息、适量活动和必要检查；出现不适及时寻求专业帮助。',
};

function collisionText(environment: YearEnvironment): string {
  const active = [
    environment.collisions.upper && '上层',
    environment.collisions.self && '自我',
    environment.collisions.lower && '下层',
  ].filter(Boolean);
  return active.length
    ? `本年处于${active.join('、')}碰撞期，重要决定宜留出复核与缓冲。`
    : '本年未命中三类碰撞期，仍应按实际条件稳健推进。';
}

export function buildJiugongAdvice(
  data: JiugongFull,
  environment: YearEnvironment,
  topic: AdviceTopic,
): AdviceResult {
  const upper = JIUGONG_STRATEGIES.upper[environment.upperQi] || '顺势而为';
  const self = JIUGONG_STRATEGIES.self[environment.selfQi] || '保持稳定';
  const lower = JIUGONG_STRATEGIES.lower[environment.lowerQi] || '保持团队稳定';
  const text = [
    `${environment.year}年（虚岁${environment.age}）${TOPIC_OPENING[topic](data)}。`,
    `岁值星为${environment.ageStar}；当前处于【${environment.group.name}】，年度卷轴提示“${environment.jiedu}”。`,
    TOPIC_FOCUS[topic],
    `上层策略：${upper}；自我策略：${self}；下层策略：${lower}。`,
    collisionText(environment),
  ].join('');

  return {
    topic,
    text,
    context: {
      year: environment.year,
      ageStar: environment.ageStar,
      group: environment.group.name,
      collisions: environment.collisions,
    },
  };
}
