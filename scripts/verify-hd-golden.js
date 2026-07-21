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
  } else {
    console.log('  (expected 占位，暂无断言——K3 金标准到位后填入)');
  }
}

// 分钟级精度回归：同日 14:00 vs 14:59 输出必须不同（v5 日级精度两者相同）
const a = hd.calculateBodygraph('2015-11-22', '14:00', 'Asia/Shanghai', 25.60, 100.23);
const b = hd.calculateBodygraph('2015-11-22', '14:59', 'Asia/Shanghai', 25.60, 100.23);
check('分钟级精度(14:00 vs 14:59 不同)', JSON.stringify(a) !== JSON.stringify(b), '');

process.exit(fail ? 1 : 0);
