export type RelationshipKey = 'upper' | 'self' | 'lower' | 'outer';

export interface SourceRule {
  id: string;
  sourceIds: string[];
  relationship: RelationshipKey;
  field: 'qi';
  match: string;
  interpretation: string;
  strengths: string[];
  risks: string[];
  actions: string[];
}

const QI_RULES: Record<string, Omit<SourceRule, 'id' | 'relationship' | 'field' | 'match'>> = {
  晦暗: {
    sourceIds: ['JG-SRC-021', 'JG-SRC-022'],
    interpretation: '外部可见度下降，适合收敛锋芒、整理基础，并以守住信用和形象为先。',
    strengths: ['适合发现被热闹掩盖的问题', '低调积累比公开扩张更容易保存实力'],
    risks: ['投机或强行表现容易放大负面评价', '信息不透明时容易凭情绪判断'],
    actions: ['减少未经验证的新投入', '重要表达先核对事实、对象和后果'],
  },
  享成: {
    sourceIds: ['JG-SRC-021', 'JG-SRC-022'],
    interpretation: '过去积累开始产生回报，重点是承接、感恩与持续经营，而不是把成果视为理所当然。',
    strengths: ['既有关系和经验容易转化为支持', '适合复用已验证的方法'],
    risks: ['安逸会让优势停止增长', '只享受成果而忽视回报关系会消耗信用'],
    actions: ['盘点成果来自哪些人和基础', '保留有效做法并安排下一轮投入'],
  },
  争夺: {
    sourceIds: ['JG-SRC-021', 'JG-SRC-022'],
    interpretation: '资源、位置或意见容易出现竞争，需要先处理边界和规则，再决定是否正面投入。',
    strengths: ['能看清真正重要的资源和立场', '适合通过协商重建秩序'],
    risks: ['逞强、贪多或诉讼式对抗会增加成本', '关系摩擦可能遮蔽原目标'],
    actions: ['重大决定设置第二次复核', '优先谈清权责、证据和退出条件'],
  },
  付出: {
    sourceIds: ['JG-SRC-021', 'JG-SRC-022'],
    interpretation: '资源向外流动，适合训练、建设和完成责任，但不宜把付出误当成必然回报。',
    strengths: ['适合培养能力和稳固基础', '长期建设容易留下可复用资产'],
    risks: ['投入过量会挤压现金、精力或团队稳定', '没有边界的帮助容易形成消耗'],
    actions: ['为每项投入设定预算和验收点', '优先建设可沉淀、可复用的能力'],
  },
  名望: {
    sourceIds: ['JG-SRC-021', 'JG-SRC-022'],
    interpretation: '被看见和被评价的机会增加，适合经营专业认可，但名声必须由真实能力承接。',
    strengths: ['专业成果更容易被传播', '适合建立可信的公开表达'],
    risks: ['只求曝光会形成虚名', '承诺超过交付能力会反噬信用'],
    actions: ['集中展示最有证据的成果', '公开承诺前先确认交付资源'],
  },
  入库: {
    sourceIds: ['JG-SRC-021', 'JG-SRC-022'],
    interpretation: '资源趋向凝聚和储存，适合回收、结算、提升价值，并把分散成果归入稳定系统。',
    strengths: ['适合收款、沉淀客户或整理资产', '容易看见真实可留存的价值'],
    risks: ['只进不理会造成库存或负担', '把短期进账误判为长期能力'],
    actions: ['完成应收、合同和资产盘点', '把新增资源安排到明确用途'],
  },
  升格: {
    sourceIds: ['JG-SRC-021', 'JG-SRC-022'],
    interpretation: '角色、责任或资源层级可能提高，机会能否成立取决于原有基础和承接能力。',
    strengths: ['适合承担更高标准的职责', '既有成果容易获得正式认可'],
    risks: ['基础不足时升格会变成压力', '权责不清容易引发争议'],
    actions: ['先补齐能力、流程和证明材料', '确认新角色的权限、责任与支持'],
  },
  开拓: {
    sourceIds: ['JG-SRC-021', 'JG-SRC-022'],
    interpretation: '新方向和新连接增加，适合小步验证，而不是在信息不足时重仓扩张。',
    strengths: ['容易接触新市场、新人和新方法', '适合建立第二条选择路径'],
    risks: ['冲动扩张会分散原有资源', '把新鲜感误当成真实机会'],
    actions: ['用小规模试点验证需求', '保留原有基本盘和退出方案'],
  },
  转变: {
    sourceIds: ['JG-SRC-021', 'JG-SRC-022'],
    interpretation: '旧结构进入调整期，关键是辨认必须改变的部分，并为转换过程保留缓冲。',
    strengths: ['适合修正长期不合用的模式', '变化能释放新的组合空间'],
    risks: ['情绪化推翻一切会失去可用基础', '拖延必要调整会扩大成本'],
    actions: ['区分必须保留、停止和试验的事项', '分阶段转换并设置复盘日期'],
  },
};

const RELATIONSHIPS: RelationshipKey[] = ['upper', 'self', 'lower', 'outer'];

export const JIUGONG_SOURCE_RULES: readonly SourceRule[] = RELATIONSHIPS.flatMap(
  (relationship) => Object.entries(QI_RULES).map(([match, rule]) => ({
    id: `qi-${relationship}-${match}`,
    relationship,
    field: 'qi' as const,
    match,
    ...rule,
  })),
);
