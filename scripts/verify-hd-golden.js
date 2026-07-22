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
  // ── 全家金标准（K3 最终版 2026-07-21：爸爸/一然/一斐经 myBodyGraph 官方图逐字认证）──
  // 引擎 v6.6（+南交）被动匹配本基准；禁止改基准迁就引擎
  // earth: [personality, design] 闸门.爻线，经 _debugGates 断言
  {
    label: '一斐 2010-12-04 19:20 上海时区',
    input: ['2010-12-04', '19:20', 'Asia/Shanghai', 25.60, 100.23],
    expected: { type: 'Manifesting Generator', profile: '1/4', authority: '情绪型权威',
      definedCenters: ['Head', 'Ajna', 'Throat', 'G', 'Sacral', 'Solar Plexus', 'Spleen', 'Root'],
      channels: ['18-58', '28-38', '35-36', '4-63', '5-15'] },
    earth: ['35.1', '63.4'],
  },
  {
    label: '一然 2015-06-04 19:45 洛杉矶',
    input: ['2015-06-04', '19:45', 'America/Los_Angeles', 34.05, -118.24],
    expected: { type: 'Projector', profile: '3/6', authority: '直觉型权威',
      definedCenters: ['Throat', 'Spleen'], channels: ['16-48'] },
    earth: ['5.3', '64.6'],
  },
  {
    label: '一如 2017-07-23 15:10 上海时区',
    input: ['2017-07-23', '15:10', 'Asia/Shanghai', 25.60, 100.23],
    expected: { type: 'Generator', profile: '5/1', authority: '荐骨权威',
      definedCenters: ['Head', 'Ajna', 'Throat', 'Sacral', 'Spleen', 'Root'],
      channels: ['11-56', '20-57', '3-60', '4-63'] },
    earth: ['60.5', '28.1'],
  },
  {
    label: '爸爸 1982-01-27 02:15 上海时区',
    input: ['1982-01-27', '02:15', 'Asia/Shanghai', 25.60, 100.23],
    expected: { type: 'Generator', profile: '5/1', authority: '荐骨权威',
      definedCenters: ['Head', 'Ajna', 'Sacral', 'Spleen'], channels: ['24-61', '34-57'] },
    earth: ['31.5', '24.1'],
  },
  {
    label: '妈妈 1982-10-28 13:30 上海时区',
    input: ['1982-10-28', '13:30', 'Asia/Shanghai', 25.60, 100.23],
    expected: { type: 'Generator', profile: '3/5', authority: '荐骨权威',
      definedCenters: ['Sacral', 'Spleen', 'Root'], channels: ['27-50', '28-38', '34-57'] },
    earth: ['27.3', '41.5'],
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
    for (const f of FIELDS) {
      const exp = JSON.stringify(g.expected[f]);
      const act = JSON.stringify(r[f]);
      check(g.label + ' ' + f, exp === act, '期望 ' + exp + ' 实际 ' + act);
    }
    if (g.earth) {
      const dbg = hd._debugGates(g.input[0], g.input[1], g.input[2]);
      const pE = dbg.personality.Earth, dE = dbg.design.Earth;
      check(g.label + ' Earth(P)', (pE.gate + '.' + pE.line) === g.earth[0],
        '期望 ' + g.earth[0] + ' 实际 ' + pE.gate + '.' + pE.line);
      check(g.label + ' Earth(D)', (dE.gate + '.' + dE.line) === g.earth[1],
        '期望 ' + g.earth[1] + ' 实际 ' + dE.gate + '.' + dE.line);
    }
    if (g.officialNote) console.log('  📌 ' + g.officialNote);
  } else {
    console.log('  (expected 占位，暂无断言——K3 金标准到位后填入)');
  }
}

// 分钟级精度回归：同日 14:00 vs 14:59 输出必须不同（v5 日级精度两者相同）
const a = hd.calculateBodygraph('2015-11-22', '14:00', 'Asia/Shanghai', 25.60, 100.23);
const b = hd.calculateBodygraph('2015-11-22', '14:59', 'Asia/Shanghai', 25.60, 100.23);
check('分钟级精度(14:00 vs 14:59 不同)', JSON.stringify(a) !== JSON.stringify(b), '');

process.exit(fail ? 1 : 0);
