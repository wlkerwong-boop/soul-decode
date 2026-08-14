import type { CompatibilityMember } from './compatibility-depth';

const elementOrder = ['木', '火', '土', '金', '水'];

function elementText(distribution: Record<string, number>) {
  return elementOrder.map((element) => `${element}${distribution[element] || 0}`).join('、');
}

function memberData(member: CompatibilityMember) {
  const hd = member.hd;
  const dayMaster = member.bazi.split(' ')[2]?.slice(0, 1) || '—';
  return {
    dayMaster,
    type: hd?.type || '数据暂缺',
    profile: hd?.profile || '数据暂缺',
    authority: hd?.authority || '数据暂缺',
    channels: hd?.channels?.join('、') || '无完整通道',
    elements: elementText(member.elementDistribution),
  };
}

/** Reliable data-first report used when the external model is unavailable. */
export function buildLocalCompatibilityReport(members: CompatibilityMember[], type: string) {
  const family = type === 'family';
  const details = members.map(memberData);
  const allChannels = new Map<string, string[]>();
  members.forEach((member, index) => (member.hd?.channels || []).forEach((channel) => {
    allChannels.set(channel, [...(allChannels.get(channel) || []), members[index].label]);
  }));
  const repeatedChannels = [...allChannels.entries()].filter(([, owners]) => owners.length > 1);
  const elementTotals = members.reduce<Record<string, number>>((totals, member) => {
    for (const element of elementOrder) totals[element] = (totals[element] || 0) + (member.elementDistribution[element] || 0);
    return totals;
  }, {});
  const relationName = family ? '家庭' : '关系双方';
  const practice = family
    ? '家庭不是让每个人变得一样，而是让不同节奏的人拥有可以反复使用的沟通接口。'
    : '关系不是给彼此打分，而是把差异变成可以协商的互动方式。';

  return `# ${relationName}合盘报告

> 本版为数据优先的完整合盘报告：先保证排盘数据、结构和行动建议完整，再等待外部模型恢复后进行语言润色。

## 0. ${family ? '家庭' : '双方'}排盘数据声明

本报告只使用本次请求中计算得到的八字与人类图字段。它不把推测当成事实；没有输入的数据不作延伸判断。

| 成员 | 八字四柱 | 人类图类型 | 角色 | 权威 | 关键通道 | 五行重心 |
|---|---|---|---|---|---|---|
${members.map((member, index) => { const d = details[index]; return `| ${member.label} | ${member.bazi} | ${d.type} | ${d.profile} | ${d.authority} | ${d.channels} | ${d.elements} |`; }).join('\n')}

## 1. 能量结构对照表

${members.map((member, index) => { const d = details[index]; return `- **${member.label}**：${d.type}、${d.profile}、${d.authority}；八字日主为${d.dayMaster}，五行统计为${d.elements}。沟通时应先尊重其决策节奏，再讨论任务本身。`; }).join('\n')}

整体五行统计为：**${elementText(elementTotals)}**。这只是输入柱干支的可见元素计数，不等同于完整旺衰结论；它适合用来观察家庭当前的表达倾向，不适合用来给任何人贴标签。

## 2. 关系密码

${repeatedChannels.length ? `本次数据中重复出现的通道为：${repeatedChannels.map(([channel, owners]) => `**${channel}（${owners.join('、')}）**`).join('；')}。它说明这些成员在相关主题上更容易互相理解，也更容易形成“我以为您应该懂”的期待。` : '本次数据没有发现多人重复的完整通道，因此不把个体通道误写成共享通道。差异本身就是本家庭需要练习的沟通材料。'}

人类图类型的差异提示不同的能量使用方式：${members.filter(m => m.hd?.type === 'Projector').map(m => m.label).join('、') || '本次没有识别到投射者'}更需要被看见与被邀请；${members.filter(m => m.hd?.type && m.hd.type !== 'Projector').map(m => m.label).join('、') || '其他成员'}更适合在有回应或明确任务后投入行动。这里描述的是互动入口，不是能力高低。

## 3. 每个人的相处密钥

${members.map((member, index) => { const d = details[index]; const isProjector = d.type === 'Projector'; return `### ${member.label}\n\n- **被看见的方式**：${isProjector ? '先承认其观察和判断，再提出具体请求；不要用连续催促代替邀请。' : '先给出清晰情境和可回应的问题，再等待其身体或情绪的真实反馈。'}\n- **冲突触发点**：${d.authority.includes('情绪') ? '情绪波峰时被要求立即表态。' : d.authority.includes('荐骨') ? '没有时间回应就被迫做决定。' : '在没有说明标准时被要求配合。'}\n- **修复动作**：先复述对方的重点，再用一句可执行的话确认下一步；当天只解决一个最小问题。\n- **本次数据依据**：八字${member.bazi}；人类图${d.type}、${d.profile}、${d.authority}、通道${d.channels}。`; }).join('\n\n')}

## 4. ${family ? '亲子沟通与养育话术' : '关系沟通与修复话术'}

| 场景 | 不要说 | 可以说 |
|---|---|---|
| 对方迟迟不行动 | “您怎么又拖延？” | “这件事您现在有回应吗？如果没有，我们晚一点再约一个时间。” |
| 对方情绪上来 | “这有什么好生气的？” | “我先听您把感受说完，等您平稳后我们再决定。” |
| 孩子拒绝学习 | “不学以后就落后。” | “妈妈也觉得这事没劲，我们来看看哪部分值得做。” |
| 需要改变安排 | “我都安排好了，您照做就行。” | “现在有两个方案，您先说更能接受哪一个。” |
| 发生误解 | “您根本没听我说。” | “我听到的是……我理解对了吗？” |
| 需要承担责任 | “这都是您的问题。” | “我们把事实和下一步分开看，先确定谁在什么时候做什么。” |

## 5. ${family ? '家庭实践建议' : '关系实践建议'}

- **每日**：安排一次不超过 10 分钟的“只说事实和感受”时间，不在这段时间解决所有问题。完成标准是每个人都说出一句真实感受。
- **每周**：由一名成员主持家庭/关系复盘，固定回答三个问题：本周什么做得好、什么让人有压力、下周只改哪一件事。
- **每月**：把共同目标拆成一个可见成果；完成后记录“谁提供了什么支持”，不只记录结果。
- **冲突时**：先暂停 20 分钟，恢复后用“事实—感受—请求”三句式，不使用人格判断和旧账堆叠。

## 6. 最终寄语

${practice}

请把本报告当作一张互动地图：${members.map((member) => member.label).join('、')}不需要证明谁更正确，只需要知道彼此从哪里进入、在哪里暂停、怎样重新开始。真正有效的合盘，不是预测关系结局，而是让下一次对话比上一次更清楚。

## 7. 使用边界与免责声明

仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议。
`;
}
