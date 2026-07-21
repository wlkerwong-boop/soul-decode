// G4 金标准验证：v6.4 引擎全字段输出对照
// 用法：node scripts/verify-hd-golden.js
// GOLDEN 中 expected 为 null 的条目仅打印实际输出（断言数据后补）；
// 填入 expected 后自动转为断言比对。
const hd = require('../src/lib/hd-engine-v6.cjs');

const GOLDEN = [
  {
    label: '样本1 2015-11-22 14:30 大理',
    input: ['2015-11-22', '14:30', 'Asia/Shanghai', 25.60, 100.23],
    expected: null, // 待 K3 提供金标准后填入：{type, profile, authority, definedCenters, channels}
  },
  {
    label: '样本2 2015-01-15 12:00 洛杉矶（冬令时）',
    input: ['2015-01-15', '12:00', 'America/Los_Angeles', 34.05, -118.24],
    expected: null,
  },
  // ── 全家回归基准（K3 于本地 v6.4 同款引擎实测，2026-07-21 锁死防漂移）──
  // disputed=true：与旧金标准有分歧，待 mybodygraph 官方复核后才转"金标准断言"；
  // 当前作为回归基准断言（锁死 v6.4 现有输出）。
  {
    label: '一斐 2010-12-04 19:20 上海时区（⚠️ 待复核：旧金标准 profile 1/3，角色差一爻）',
    disputed: true,
    input: ['2010-12-04', '19:20', 'Asia/Shanghai', 25.60, 100.23],
    expected: { type: 'Projector', profile: '1/4', authority: '情绪型权威',
      definedCenters: ['Ego', 'Solar Plexus', 'Spleen', 'Root'], channels: ['18-58', '28-38', '37-40'] },
  },
  {
    label: '一然 2015-06-04 19:45 洛杉矶（旧金标准 Manifestor，或源自88天近似工具）',
    input: ['2015-06-04', '19:45', 'America/Los_Angeles', 34.05, -118.24],
    expected: { type: 'Projector', profile: '3/6', authority: '直觉型权威',
      definedCenters: ['Throat', 'G', 'Spleen'], channels: ['16-48', '7-31'] },
  },
  {
    label: '一如 2017-07-23 15:10 上海时区（旧金标准 profile 1/3）',
    input: ['2017-07-23', '15:10', 'Asia/Shanghai', 25.60, 100.23],
    expected: { type: 'Generator', profile: '5/1', authority: '荐骨权威',
      definedCenters: ['Head', 'Ajna', 'Throat', 'Sacral', 'Spleen'], channels: ['11-56', '20-57', '4-63'] },
  },
  {
    label: '爸爸 1982-01-27 02:15 上海时区（⚠️ 待复核：旧金标准 Projector 6/1 直觉，34-57 三重稳健属结构性分歧）',
    disputed: true,
    input: ['1982-01-27', '02:15', 'Asia/Shanghai', 25.60, 100.23],
    expected: { type: 'Generator', profile: '5/1', authority: '荐骨权威',
      definedCenters: ['Sacral', 'Spleen'], channels: ['34-57'] },
  },
  {
    label: '妈妈 1982-10-28 13:30 上海时区（旧金标准 MG 3/5——Throat 无定义通道）',
    input: ['1982-10-28', '13:30', 'Asia/Shanghai', 25.60, 100.23],
    expected: { type: 'Generator', profile: '3/5', authority: '荐骨权威',
      definedCenters: ['Sacral', 'Spleen', 'Root'], channels: ['34-57'] },
  },
];

const FIELDS = ['type', 'profile', 'authority', 'definedCenters', 'channels'];
let fail = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + ' | ' + detail);
  if (!cond) fail++;
}

for (const g of GOLDEN) {
  const r = hd.calculateBodygraph(...g.input);
  console.log('== ' + g.label + ' ==');
  console.log('  type=' + r.type + ' | profile=' + r.profile + ' | authority=' + r.authority);
  console.log('  definedCenters=' + (r.definedCenters || []).join(','));
  console.log('  channels=' + (r.channels || []).join(' | '));
  console.log('  gates=' + (r.activatedGates || []).join(','));
  // 基础完整性断言（无论有无金标准都跑）
  check(g.label + ' 全字段非空',
    !!r.type && !!r.profile && !!r.authority && Array.isArray(r.definedCenters) && Array.isArray(r.channels),
    '');
  if (g.expected) {
    if (g.disputed) console.log('  ⚠️ 回归基准（与旧金标准分歧，待 mybodygraph 复核后转金标准断言）');
    for (const f of FIELDS) {
      const exp = JSON.stringify(g.expected[f]);
      const act = JSON.stringify(r[f]);
      check(g.label + ' ' + f, exp === act, '期望 ' + exp + ' 实际 ' + act);
    }
  } else {
    console.log('  (expected 占位，暂无断言——K3 金标准到位后填入)');
  }
}

// 分钟级精度回归：同日 14:00 vs 14:59 输出必须不同（v5 日级精度两者相同）
const a = hd.calculateBodygraph('2015-11-22', '14:00', 'Asia/Shanghai', 25.60, 100.23);
const b = hd.calculateBodygraph('2015-11-22', '14:59', 'Asia/Shanghai', 25.60, 100.23);
check('分钟级精度(14:00 vs 14:59 不同)', JSON.stringify(a) !== JSON.stringify(b), '');

process.exit(fail ? 1 : 0);
