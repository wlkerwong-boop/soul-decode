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

function authorityGuide(authority: string) {
  if (authority.includes('情绪')) return '重要决定不在情绪高点拍板，至少经过一晚，再用平稳后的感受确认。';
  if (authority.includes('荐骨')) return '把问题问成可以回答“是/否”的具体问题，先听身体回应，再讨论执行方式。';
  if (authority.includes('直觉')) return '尊重当下第一瞬间的身体直觉，不用连续追问把已经出现的信号问乱。';
  return '先确认对方真正的内在反馈，再进入任务安排。';
}

function interactionEntry(member: CompatibilityMember) {
  const type = member.hd?.type || '';
  if (type === 'Projector') return '先承认对方观察到的重点，再提出一个清晰、可拒绝的邀请。';
  if (type === 'Manifesting Generator') return '先给出要回应的情境，再允许对方调整顺序，不把跳步误解成不认真。';
  if (type === 'Generator') return '先让对方对具体事项产生回应，再安排投入量和完成时间。';
  return '先说明情境和边界，再邀请对方表达自己的进入方式。';
}

/** Reliable, data-first report used when the external model is unavailable. */
export function buildLocalCompatibilityReport(members: CompatibilityMember[], type: string) {
  const family = type === 'family';
  const details = members.map(memberData);
  const allChannels = new Map<string, string[]>();
  members.forEach((member) => (member.hd?.channels || []).forEach((channel) => {
    allChannels.set(channel, [...(allChannels.get(channel) || []), member.label]);
  }));
  const repeatedChannels = [...allChannels.entries()].filter(([, owners]) => owners.length > 1);
  const elementTotals = members.reduce<Record<string, number>>((totals, member) => {
    for (const element of elementOrder) totals[element] = (totals[element] || 0) + (member.elementDistribution[element] || 0);
    return totals;
  }, {});
  const relationName = family ? '家庭' : '关系双方';
  const parents = family ? members.slice(0, 2) : members.slice(0, 1);
  const children = family ? members.slice(2) : members.slice(1);
  const practice = family
    ? '家庭不是让每个人变得一样，而是让不同节奏的人拥有可以反复使用的沟通接口。'
    : '关系不是给彼此打分，而是把差异变成可以协商的互动方式。';

  const pairAdvice = (a: CompatibilityMember, b: CompatibilityMember) => {
    const sharedChannel = (a.hd?.channels || []).find(channel => (b.hd?.channels || []).includes(channel));
    const projectorPresent = a.hd?.type === 'Projector' || b.hd?.type === 'Projector';
    return `${a.label}进入关系时${interactionEntry(a)}${b.label}进入关系时${interactionEntry(b)}${sharedChannel ? `两人的数据中共同出现${sharedChannel}，适合把“我以为您应该懂”改成一次明确复述。` : '当前数据未显示两人拥有相同完整通道，因此不要把“彼此相似”当作默认前提。'}${projectorPresent ? '关系中若出现投射者，要给其恢复和被看见的空间，不以全家统一节奏衡量价值。' : ''}`;
  };

  const pairRows: string[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      pairRows.push(`| ${members[i].label} × ${members[j].label} | ${members[i].hd?.type || '—'} × ${members[j].hd?.type || '—'} | ${pairAdvice(members[i], members[j])} |`);
    }
  }
  const childRows = children.map(child => {
    const parentNames = parents.map(parent => parent.label).join('、');
    return `| ${child.label} | ${child.hd?.type || '数据暂缺'} / ${child.hd?.profile || '—'} / ${child.hd?.authority || '—'} | ${parentNames}先${interactionEntry(child)} | ${authorityGuide(child.hd?.authority || '')} |`;
  }).join('\n');
  const siblingRows = children.length > 1
    ? children.slice(0, -1).flatMap((child, index) => children.slice(index + 1).map(other => `| ${child.label} × ${other.label} | ${child.hd?.type || '—'} × ${other.hd?.type || '—'} | 先分别确认各自需求，再谈谁让谁；不使用年龄、成绩或速度做价值排序。 |`)).join('\n')
    : '| 暂无 | — | 当前成员不足以形成姐妹关系段落。 |';
  const repeatedText = repeatedChannels.length
    ? repeatedChannels.map(([channel, owners]) => `${channel}（${owners.join('、')}）`).join('；')
    : '本次没有发现多人重复的完整通道';

  return `# ${relationName}合盘报告

> 本报告先锁定可核验的排盘数据，再把差异翻译成日常沟通方式。它不是给家人排序，也不是为关系下结论。

## 0. ${family ? '家庭' : '双方'}排盘数据声明

本报告只使用本次请求中计算得到的八字与人类图字段。它不把推测当成事实；没有输入的数据不作延伸判断。

| 成员 | 八字四柱 | 人类图类型 | 角色 | 权威 | 关键通道 | 五行重心 |
|---|---|---|---|---|---|---|
${members.map((member, index) => { const d = details[index]; return `| ${member.label} | ${member.bazi} | ${d.type} | ${d.profile} | ${d.authority} | ${d.channels} | ${d.elements} |`; }).join('\n')}

## 1. 一家人的整体动力

${family ? `这个家有 ${members.filter(m => m.hd?.type === 'Generator' || m.hd?.type === 'Manifesting Generator').length} 位能量型成员，以及 ${members.filter(m => m.hd?.type === 'Projector').length} 位投射者。前者适合在具体事项上等待身体回应，后者需要先被看见、被邀请，再投入观察与引导。家庭会议不能只采用一种速度。` : '双方需要把“我认为对方应该懂”改成可以重复确认的沟通接口。'}

整体五行统计为：**${elementText(elementTotals)}**。这只是四柱天干与地支的可见元素计数，不等同于完整旺衰结论；它适合观察家庭当前的表达倾向，不适合给任何人贴标签。

## 2. 关系地图：先看差异，再谈互补

本次重复出现的完整通道：**${repeatedText}**。重复通道可以作为互相理解的入口，但不能自动证明双方在所有事情上想法一致；真正需要核验的仍是当下的回应、情绪和边界。

| 关系对 | 类型差异 | 互动重点 |
|---|---|---|
${pairRows.join('\n')}

## 3. 夫妻/核心关系：把差异变成分工

${parents.length >= 2 ? `${parents[0].label}与${parents[1].label}的核心协作，不是让两个人用同一种方式做事，而是先分别确认“愿不愿意”，再决定“谁来推进”。${pairAdvice(parents[0], parents[1])}` : '关系双方先确认共同目标，再约定各自的回应方式和复盘时间。'}

建议把共同事项拆成三步：

1. **定方向**：只说目标、边界和截止时间，不立刻分配全部细节。
2. **听回应**：分别询问“您愿意承担哪一部分”，不要用沉默代替同意。
3. **定复盘**：约定下一次检查时间，执行中允许调整，不把一次改变理解成失败。

## 4. 亲子关系：先连接，再要求

| 孩子 | 当前数据 | 家长先做什么 | 关键提醒 |
|---|---|---|---|
${childRows || '| 暂无 | — | 当前报告没有提供亲子成员。 | — |'}

家长可以把一次教育对话固定成四句：**“我看见了什么” → “我猜你现在可能怎样” → “您愿意先做哪一步” → “我们什么时候再看一次”**。这套顺序既保留边界，也给孩子留下真实回应的空间。

## 5. 姐妹关系：避免把差异变成排名

| 关系对 | 类型组合 | 建议 |
|---|---|---|
${siblingRows}

## 6. 每个人的相处密钥

${members.map((member, index) => { const d = details[index]; const isProjector = d.type === 'Projector'; return `### ${member.label}

- **被看见的方式**：${isProjector ? '先承认其观察和判断，再提出具体、可拒绝的邀请；不要用连续催促代替邀请。' : '先给出清晰情境和可回应的问题，再等待其身体的真实反馈。'}
- **冲突触发点**：${d.authority.includes('情绪') ? '情绪波峰时被要求立即表态。' : d.authority.includes('荐骨') ? '没有时间回应就被迫做决定。' : '在没有说明标准时被要求配合。'}
- **决策接口**：${authorityGuide(d.authority)}
- **修复动作**：先复述对方的重点，再用一句可执行的话确认下一步；当天只解决一个最小问题。
- **本次数据依据**：八字${member.bazi}；人类图${d.type}、${d.profile}、${d.authority}、通道${d.channels}。`; }).join('\n\n')}

## 7. 家庭沟通与养育话术

| 场景 | 不要说 | 可以说 |
|---|---|---|
| 对方迟迟不行动 | “您怎么又拖延？” | “这件事您现在有回应吗？如果没有，我们晚一点再约一个时间。” |
| 对方情绪上来 | “这有什么好生气的？” | “我先听您把感受说完，等您平稳后我们再决定。” |
| 孩子拒绝学习 | “不学以后就落后。” | “妈妈也觉得这事没劲，我们来看看哪部分值得做。” |
| 需要改变安排 | “我都安排好了，您照做就行。” | “现在有两个方案，您先说更能接受哪一个。” |
| 发生误解 | “您根本没听我说。” | “我听到的是……我理解对了吗？” |
| 需要承担责任 | “这都是您的问题。” | “我们把事实和下一步分开看，先确定谁在什么时候做什么。” |

## 8. 家庭实践建议

- **每天 10 分钟**：每个人说一句事实和一句感受；完成标准是每个人都说过，不要求当场解决所有问题。
- **每周一次**：由一名成员主持复盘，只回答“本周什么做得好、什么带来压力、下周只改哪一件事”。
- **每月一次**：把共同目标拆成一个可见成果，记录“谁提供了什么支持”，不只记录输赢。
- **发生冲突时**：先暂停 20 分钟，恢复后使用“事实—感受—请求”三句式，不使用人格判断和旧账堆叠。

### 30天家庭练习

| 周次 | 练习 | 完成标准 |
|---|---|---|
| 第1周 | 每次提出要求前，先说清情境和选择 | 一周内至少记录3次“先说明、后请求” |
| 第2周 | 练习等待回应，不把沉默当同意 | 重要决定至少保留一次重新确认 |
| 第3周 | 为投射者安排恢复时间，为能量型成员安排回应时间 | 每个人都能说出自己的合适节奏 |
| 第4周 | 召开一次家庭复盘，把一个冲突改写成下一次可用话术 | 形成一张家庭沟通卡 |

## 9. 最终寄语

${practice}

请把本报告当作一张互动地图：${members.map((member) => member.label).join('、')}不需要证明谁更正确，只需要知道彼此从哪里进入、在哪里暂停、怎样重新开始。真正有效的合盘，不是预测关系结局，而是让下一次对话比上一次更清楚。

## 10. 使用边界与免责声明

仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议。
`;
}
