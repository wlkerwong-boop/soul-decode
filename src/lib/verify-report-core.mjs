/**
 * verify-report-core.mjs — 报告事实层校验核心（P0 任务3 + K3 加固 §三·五）
 *
 * 单份实现，两个入口共用：
 *  - scripts/verify-report.mjs（CLI：验收/人工扫描）
 *  - 报告生成 route（fail-closed：校验不过 → 报错重生成，禁止带病交付）
 *
 * 校验规则：
 *  V1 声明通道条数 == 实际列出条数（病灶#1）
 *  V2 每条通道的中心连接与 hd-channels-map 一致（病灶#2）；通道不得写成"爻"（病灶#3）
 *  V3 定义状态不得自相矛盾（病灶#4）
 *  V4 个人报告 vs 引擎真值逐字段一致（type/profile/authority/channels/八字四柱，T1 跨轨）
 *  V5 年柱符合立春派口径（病灶#5）
 *  V6（加固）「## 0. 排盘数据声明」节与引擎 JSON 恒等（通道带中心映射 + 四柱齐全；
 *      标题兼容个人/家庭/双方三种；全报告必须恰好 1 次引擎注入声明节，且含注入标记，防 AI 重复写）
 *
 * 真数据纪律：核心只做纯文本/数据比对，不含任何真实出生数据。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeInlineReportHeadings } from './normalize-inline-report-headings.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 打包进 .next 后 __dirname 指向产物目录（源相对路径失效），按候选链回退到进程 cwd 的仓库路径
// （pm2 以 cwd=/root/soulcode 运行，部署时 git pull 后 src/data/ 在仓库内）。CLI/vitest 走源路径。
const MAP_CANDIDATES = [
  path.resolve(__dirname, '../data/hd-channels-map.json'),
  path.resolve(process.cwd(), 'src/data/hd-channels-map.json'),
];
const MAP_PATH = MAP_CANDIDATES.find((p) => fs.existsSync(p));
if (!MAP_PATH) {
  throw new Error(`verify-report-core: 找不到 hd-channels-map.json（候选: ${MAP_CANDIDATES.join(', ')}）`);
}

// ---------- 通道映射表装载 ----------
const channelMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));
const ENTRIES = channelMap.channels;

/** 闸门号对 → 条目（双向归一化） */
const BY_GATE_PAIR = new Map();
for (const entry of ENTRIES) {
  const a = Math.min(entry.gateA, entry.gateB);
  const b = Math.max(entry.gateA, entry.gateB);
  BY_GATE_PAIR.set(`${a}-${b}`, entry);
}

function normalizeChannelKey(key) {
  if (typeof key !== 'string') return null;
  const parts = key.split('-').map((n) => parseInt(n, 10));
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return null;
  return `${Math.min(parts[0], parts[1])}-${Math.max(parts[0], parts[1])}`;
}

function lookupChannel(key) {
  const normalized = normalizeChannelKey(key);
  if (!normalized) return null;
  return BY_GATE_PAIR.get(normalized) || null;
}

const NARRATIVE_ENGLISH_WHITELIST = new Set([
  'Generator', 'Manifesting', 'Projector', 'Manifestor', 'Reflector', 'Sacral', 'Splenic', 'Emotional',
  'Head', 'Ajna', 'Spleen', 'Root', 'Solar', 'Plexus', 'Throat', 'Ego', 'G',
  'SoulCode', 'AI', 'HD', 'PDF', 'Word', 'DOCX',
]);

const COUPLE_FAMILY_TERMS = [
  '孩子', '亲子', '父母', '家长会', '育儿', '子女', '儿女', '家庭财务', '家庭动作',
];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function memberPillars(member) {
  return String(member?.bazi || '').split(/\s+/).filter(Boolean);
}

function memberDayPillar(member) {
  return memberPillars(member)[2] || '';
}

function memberDayStem(member) {
  return memberDayPillar(member).slice(0, 1);
}

function reportSectionCounts(reportText) {
  const counts = new Map();
  for (const match of reportText.matchAll(/^##\s*(\d+)[.、．]\s+.*$/gm)) {
    const number = match[1];
    counts.set(number, (counts.get(number) || 0) + 1);
  }
  return counts;
}

function findEnglishTokens(reportText) {
  return [...new Set((reportText.match(/\b[A-Za-z][A-Za-z-]{2,}\b/g) || [])
    .filter((token) => !NARRATIVE_ENGLISH_WHITELIST.has(token)))];
}

function splitReportSentences(reportText) {
  const sentences = [];
  const boundaryPattern = /[。！？\n]/g;
  let start = 0;
  let match;
  while ((match = boundaryPattern.exec(reportText)) !== null) {
    const text = reportText.slice(start, match.index).trim();
    if (text) sentences.push({ text, offset: start });
    start = match.index + match[0].length;
  }
  const tail = reportText.slice(start).trim();
  if (tail) sentences.push({ text: tail, offset: start });
  return sentences;
}

function nearestMemberLabelBefore(text, index, members) {
  let nearest = null;
  for (const member of members) {
    const label = String(member.label || '');
    if (!label) continue;
    const labelIndex = text.lastIndexOf(label, index);
    if (labelIndex >= 0 && (!nearest || labelIndex > nearest.index)) {
      nearest = { label, index: labelIndex };
    }
  }
  return nearest?.label || null;
}

function memberAttributeMentionsInSentence(sentence, members, pattern, acceptMatch = () => true) {
  const mentions = [];
  for (const match of sentence.text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (!acceptMatch(match, sentence.text)) continue;
    const precedingText = sentence.text.slice(0, index + match[0].length);
    const memberLabel = nearestMemberLabelBefore(precedingText, precedingText.length, members);
    if (!memberLabel) continue;
    mentions.push({ memberLabel, match, evidence: sentence.text });
  }
  return mentions;
}

function channelMentionsInSentence(sentence, members) {
  return memberAttributeMentionsInSentence(
    sentence,
    members,
    /(\d{1,2}-\d{1,2})(?:\s*通道)?/g,
    (match, sentenceText) => {
      if (!lookupChannel(match[1])) return false;
      const index = match.index ?? 0;
      const channelContext = sentenceText.slice(Math.max(0, index - 24), index + match[0].length + 24);
      return /通道|相连|相接|连接|关联|拥有|独有|关键|有/.test(channelContext);
    },
  ).map((mention) => ({
    channel: mention.match[1],
    memberLabel: mention.memberLabel,
    evidence: mention.evidence,
  }));
}

function findUnauthorizedGenderPronoun(reportText) {
  const pronounPattern = /他|她/g;
  const allowedWords = ['他人', '他们', '她们', '他的', '她的'];
  for (const match of reportText.matchAll(pronounPattern)) {
    const index = match.index ?? 0;
    const before = reportText[index - 1] || '';
    const following = reportText.slice(index);
    if (before === '其' || allowedWords.some((word) => following.startsWith(word))) continue;
    return reportText.slice(Math.max(0, index - 12), Math.min(reportText.length, index + 12));
  }
  return null;
}

function reportClauseAt(reportText, index) {
  const separators = ['，', '。', '；', '！', '？', '\n'];
  const start = Math.max(...separators.map((separator) => reportText.lastIndexOf(separator, index - 1) + 1));
  const end = Math.min(...separators
    .map((separator) => reportText.indexOf(separator, index))
    .filter((position) => position >= 0), reportText.length);
  return reportText.slice(start, end);
}

function isMetaphoricalChildMention(reportText, index) {
  const clause = reportClauseAt(reportText, index);
  return /(?:当成|当作|视为|看作)[^。！？\n]{0,30}孩子|(?:像|好像|仿佛|如同)[^。！？\n]{0,20}孩子/.test(clause);
}

// 中心名英文 → 映射表中文（V2 用）
const CENTER_EN_CN = {
  'Head': '头脑/Head', 'Ajna': '逻辑/Ajna', 'Throat': '喉咙', 'G': 'G',
  'Ego': '意志力', 'Sacral': '荐骨', 'Solar Plexus': '情绪', 'Spleen': '脾', 'Root': '根部',
};

// ---------- 核心校验 ----------

/** 返回 issues 数组；空数组 = 通过 */
export function verifyReportText(reportText, truth = null) {
  reportText = normalizeInlineReportHeadings(reportText);
  const issues = [];
  const fail = (rule, message, evidence = '') => issues.push({ rule, message, evidence });

  // ---- V1 通道条数 ----
  const declaredMatches = [...reportText.matchAll(/(?:定义通道|激活通道|通道)[共]?\s*(\d+)\s*条/g)];
  const listedChannels = new Set();
  const listedPattern = /(\d{1,2}-\d{1,2})/g;
  let m;
  while ((m = listedPattern.exec(reportText)) !== null) {
    const [a, b] = m[1].split('-').map(Number);
    if (a >= 1 && a <= 64 && b >= 1 && b <= 64) listedChannels.add(m[1]);
  }
  for (const dm of declaredMatches) {
    const declared = parseInt(dm[1], 10);
    const actual = truth?.hd?.channels?.length ?? listedChannels.size;
    if (declared !== actual) {
      fail('V1', `通道条数声明 ${declared} 条 ≠ 实际 ${actual} 条`,
        `声明位置: "${dm[0]}"；实际列表: ${[...listedChannels].join(', ') || '(空)'}`);
    }
  }

  // ---- V2 通道-中心连接 + 爻误写 ----
  const connectPattern = /(\d{1,2}-\d{1,2})\s*通道?\s*(?:连接|连到|连通|连|↔)\s*(?:([\u4e00-\u9fff/]+)中心?)\s*(?:与|和|↔|及)?\s*([\u4e00-\u9fff/]+)中心?/g;
  while ((m = connectPattern.exec(reportText)) !== null) {
    const entry = lookupChannel(m[1]);
    if (!entry) { fail('V2', `通道 ${m[1]} 不在映射表内`, m[0]); continue; }
    const gotCenters = [m[2], m[3]].map((c) => (c || '').replace(/中心/g, '').trim());
    const expected = new Set([entry.centerA.replace(/[（(].*?[)）]/g, ''), entry.centerB.replace(/[（(].*?[)）]/g, '')]);
    const expectedCn = new Set([...expected].map((c) => CENTER_EN_CN[c] || c));
    const ok = gotCenters.every((c) => expected.has(c) || expectedCn.has(c));
    if (!ok) {
      fail('V2', `通道 ${m[1]} 中心连接错误: 报告 ${gotCenters.join('/')}，映射表应为 ${[...expectedCn].join('/')}`, `原文: "${m[0]}"`);
    }
  }
  const linePattern = /(\d{1,2})\s*爻\s*(?:连接|连到|连)\s*[A-Za-z\u4e00-\u9fff]+/g;
  while ((m = linePattern.exec(reportText)) !== null) {
    fail('V3b', `通道描述把闸门写成"爻": "${m[0]}"`, '通道连的是闸门不是爻');
  }

  // ---- V3 定义状态自相矛盾 ----
  const contradictionPatterns = /未(?:被)?完全定义|未定义|未被定义/;
  const defRe = /定义通道/g;
  while ((m = defRe.exec(reportText)) !== null) {
    const ctx = reportText.slice(Math.max(0, m.index - 100), m.index + 200);
    if (contradictionPatterns.test(ctx)) {
      fail('V3', '定义状态自相矛盾: 定义通道附近出现"未完全定义/未定义"', ctx.slice(0, 120) + '…');
    }
  }

  // ---- V4 跨轨一致性（引擎真值） ----
  if (truth) {
    const t = truth.hd || truth;
    const typeCandidates = ['Manifesting Generator', 'Generator', 'Projector', 'Manifestor', 'Reflector'];
    const foundTypes = typeCandidates.filter((tp) => reportText.includes(tp));
    if (t.type && foundTypes.length && !reportText.includes(t.type)) {
      fail('V4', `人类图类型与引擎不一致: 报告含 ${foundTypes.join('/')}，引擎=${t.type}`);
    }
    if (t.profile && !reportText.includes(t.profile)) {
      fail('V4', `人生角色与引擎不一致: 报告缺 ${t.profile}`);
    }
    if (t.authority && !reportText.includes(t.authority)) {
      fail('V4', `内在权威与引擎不一致: 报告缺 "${t.authority}"`);
    }
    if (Array.isArray(t.channels)) {
      for (const ch of t.channels) {
        const variants = [ch, ch.split('-').reverse().join('-')];
        if (!variants.some((v) => reportText.includes(v))) {
          fail('V4', `通道 ${ch} 未在报告中出现（引擎真值）`);
        }
      }
    }
    if (t.bazi?.pillars) {
      for (const pillar of t.bazi.pillars) {
        if (!reportText.includes(pillar)) {
          fail('V4', `八字四柱 ${pillar} 未在报告中出现（引擎真值）`);
        }
      }
    }
  }

  // ---- V5 立春派年柱 ----
  const expectYear = truth?.bazi?.pillars?.[0] || truth?.expectedYear;
  if (expectYear && !reportText.includes(expectYear)) {
    fail('V5', `年柱与立春派口径不一致: 报告未含 ${expectYear}（金标准）`);
  }
  const contradict = truth?.bazi?.contradictYear;
  if (contradict && reportText.includes(contradict)) {
    fail('V5', `年柱出现春节派口径 ${contradict}（应为 ${expectYear}）`);
  }

  // ---- V6（加固）声明节 vs 引擎 JSON ----
  if (truth) {
    // 兼容个人（排盘数据声明）/家庭（家庭排盘数据声明）/双人（双方排盘数据声明）三种标题
    const headingRe = /##\s*0[.、．]\s*(?:家庭排盘数据声明|双方排盘数据声明|排盘数据声明)/g;
    const headings = [...reportText.matchAll(headingRe)];
    if (headings.length === 0) {
      fail('V6', '报告缺少「## 0. 排盘数据声明」节（应引擎注入）');
    } else {
      if (headings.length > 1) {
        fail('V6', `声明节出现 ${headings.length} 次（应恰好 1 次引擎注入；AI 重复写声明节 = 违反 K3 加固条款 ①）`,
          headings.map((h) => `位置 ${h.index}: "${h[0]}"`).join('；'));
      }
      const sec = reportText.match(/##\s*0[.、．]\s*(?:家庭排盘数据声明|双方排盘数据声明|排盘数据声明)([\s\S]*?)(?=##\s*1[.、．]|$)/);
      const section = sec ? sec[1] : '';
      if (!section.includes('由系统依据排盘数据直接生成')) {
        fail('V6', '声明节缺少引擎注入标记「由系统依据排盘数据直接生成」（疑似 AI 重写版声明节）');
      }
      const t = truth.hd || truth;
      if (Array.isArray(t.channels)) {
        for (const ch of t.channels) {
          const entry = lookupChannel(ch);
          if (!entry) continue;
          const expectText = `${ch}（${entry.gateA}(${entry.centerA}) ↔ ${entry.gateB}(${entry.centerB})`;
          const expectTextAlt = `${ch.split('-').reverse().join('-')}（${entry.gateB}(${entry.centerB}) ↔ ${entry.gateA}(${entry.centerA})`;
          if (!section.includes(expectText) && !section.includes(expectTextAlt)) {
            fail('V6', `声明节通道 ${ch} 未带映射表中心描述`, `期望 "${expectText}"`);
          }
        }
      }
      if (t.bazi?.pillars) {
        for (const pillar of t.bazi.pillars) {
          if (!section.includes(pillar)) fail('V6', `声明节缺八字四柱 ${pillar}`);
        }
      }
    }
  }

  // ---- V7（P1）成员级数据对账：正文不得改写声明节中的事实 ----
  if (truth && Array.isArray(truth.members) && truth.members.length) {
    const members = truth.members;
    const membersByLabel = new Map(members.map((member) => [member.label, member]));
    const dayStems = members.map(memberDayStem).filter(Boolean);

    if (new Set(dayStems).size > 1 && /相同(?:的)?日柱天干/.test(reportText)) {
      fail('V7', '正文声称双方日柱天干相同，但声明节中的日柱天干并不相同', `实际日柱：${members.map((member) => `${member.label}=${memberDayPillar(member)}`).join('；')}`);
    }

    for (const sentence of splitReportSentences(reportText)) {
      for (const mention of memberAttributeMentionsInSentence(sentence, members, /角色(?:是|为|：|:)\s*([1-6]\/[1-6])/g)) {
        const member = membersByLabel.get(mention.memberLabel);
        const expectedProfile = String(member?.hd?.profile || '');
        if (expectedProfile && mention.match[1] !== expectedProfile) {
          fail('V7', `${mention.memberLabel}的角色 ${mention.match[1]} 与声明 ${expectedProfile} 不一致`, mention.match[0]);
        }
      }

      for (const mention of memberAttributeMentionsInSentence(sentence, members, /五行(?:俱全|齐全|完整|齐备)/g)) {
        const member = membersByLabel.get(mention.memberLabel);
        const missingElements = ['金', '木', '水', '火', '土'].filter((element) => !(Number(member?.elementDistribution?.[element]) > 0));
        if (missingElements.length) {
          fail('V7', `${mention.memberLabel}的正文五行结论与声明不一致：缺少${missingElements.join('、')}却称“五行齐全”`, mention.evidence);
        }
      }

      for (const mention of channelMentionsInSentence(sentence, members)) {
        const member = membersByLabel.get(mention.memberLabel);
        const expectedChannels = new Set(member?.hd?.channels || []);
        const normalized = normalizeChannelKey(mention.channel);
        if (normalized && ![...expectedChannels].some((channel) => normalizeChannelKey(channel) === normalized)) {
          fail('V7', `${mention.memberLabel}被正文分配了声明中不存在的通道 ${mention.channel}`, mention.evidence);
        }
      }

      for (const mention of memberAttributeMentionsInSentence(sentence, members, /日柱(?:是|为|：|:)\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/g)) {
        const member = membersByLabel.get(mention.memberLabel);
        const expectedDayPillar = memberDayPillar(member);
        if (expectedDayPillar && mention.match[1] !== expectedDayPillar) {
          fail('V7', `${mention.memberLabel}的日柱 ${mention.match[1]} 与声明 ${expectedDayPillar} 不一致`, mention.match[0]);
        }
      }
    }

    const hasJiaDayMaster = dayStems.includes('甲');
    const hasGengDayMaster = dayStems.includes('庚');
    if (hasJiaDayMaster && hasGengDayMaster) {
      const jiaGengContext = reportText.match(/[^\n。]{0,80}庚金克甲木[^\n。]{0,80}/)?.[0] || '';
      if (jiaGengContext && /正官/.test(jiaGengContext) && !/七杀/.test(jiaGengContext)) {
        fail('V8', '庚金克甲木在甲木日主语境中应使用“七杀”，不得写成“正官”', jiaGengContext);
      }
    }
  }

  // ---- V8（P1）术语、语言与模块话术纯度 ----
  if (truth?.compatibilityType) {
    const englishTokens = findEnglishTokens(reportText);
    if (englishTokens.length) {
      fail('V8', `正文出现未翻译英文单词：${englishTokens.join('、')}`, englishTokens.join(', '));
    }

    if (truth.compatibilityType === 'couple' || truth.compatibilityType === 'friend') {
      for (const term of COUPLE_FAMILY_TERMS) {
        const termPattern = new RegExp(escapeRegExp(term), 'g');
        const hasNonExemptMatch = [...reportText.matchAll(termPattern)]
          .some((match) => !(term === '孩子' && isMetaphoricalChildMention(reportText, match.index ?? 0)));
        if (hasNonExemptMatch) {
          fail('V8', `情侣/朋友报告命中家庭化话术：${term}`, term);
        }
      }
      const unauthorizedPronoun = findUnauthorizedGenderPronoun(reportText);
      if (unauthorizedPronoun) {
        fail('V8', '情侣/朋友报告出现未授权性别代词，应统一使用成员标签', unauthorizedPronoun);
      }
    }
  }

  // ---- V9（P1）结构兜底：章节唯一、免责声明唯一、总字数上限 ----
  if (truth?.compatibilityType) {
    const sectionCounts = reportSectionCounts(reportText);
    for (const [number, count] of sectionCounts.entries()) {
      if (count > 1) fail('V9', `章节编号 ${number} 出现 ${count} 次，应保持唯一`, `## ${number}`);
    }

    const disclaimer = '仅供自我观察与关系沟通参考，不构成医疗、法律、教育或投资建议';
    const disclaimerCount = reportText.split(disclaimer).length - 1;
    if (disclaimerCount !== 1) {
      fail('V9', `免责声明出现 ${disclaimerCount} 次，应恰好 1 次`, disclaimer);
    }

    if (reportText.length > 18000) {
      fail('V9', `报告正文 ${reportText.length} 字符，超过 18000 字数上限`, `length=${reportText.length}`);
    }

    if (truth.compatibilityType === 'couple' || truth.compatibilityType === 'friend') {
      const expectedHeadings = [
        ['1', '一眼看懂这段关系'],
        ['2', '三个核心关系命题'],
        ['3', '三个真实互动场景'],
        ['4', '关系实践计划'],
        ['5', '最终总结与使用边界'],
      ];
      for (const [number, title] of expectedHeadings) {
        const count = [...reportText.matchAll(new RegExp(`^##\\s*${number}[.、．]\\s*${escapeRegExp(title)}\\s*$`, 'gm'))].length;
        if (count !== 1) fail('V9', `情侣/朋友章节「${number}. ${title}」出现 ${count} 次，应恰好 1 次`);
      }
    }
  }

  return issues;
}

/** 便捷入口：给 route 用，抛出带 issues 的错误 */
export function assertReportVerified(reportText, truth = null) {
  const issues = verifyReportText(reportText, truth);
  if (issues.length) {
    const err = new Error(`报告事实层校验未通过（${issues.length} 处），禁止带病交付`);
    err.issues = issues;
    err.name = 'ReportVerifyError';
    throw err;
  }
  return true;
}

/** 内置病灶样本自检（证明脚本有效） */
export function runDefectSamples() {
  const samples = [
    ['病灶#1 通道条数', '## 0. 排盘数据声明\n激活通道共 6 条：10-34、23-43、35-36、4-63、5-15。', /V1/],
    ['病灶#2 中心连接', '35-36 通道连接情绪中心与脾中心，象征无常与危机。', /V2/],
    ['病灶#3 爻误写', '20 爻连接 Throat、57 爻连接 Spleen，构成脑波通道。', /V3b/],
    ['病灶#4 定义矛盾', '您有定义通道：24-61、34-57。不过这两条通道都未被完全定义。', /V3/],
  ];
  let pass = 0;
  for (const [name, text, rule] of samples) {
    const issues = verifyReportText(text);
    const hit = issues.some((i) => rule.test(i.rule));
    console.log(`${hit ? '✓' : '✗'} ${name}: ${hit ? '扫出病灶' : '漏检!'}`);
    if (hit) pass++;
  }
  console.log(`病灶样本自检: ${pass}/${samples.length} 命中（V5 用真实锚点数据在服务器侧跑）`);
  return pass === samples.length;
}
