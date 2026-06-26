const hd = require(__dirname + '/../src/lib/hd-engine-v5.cjs');

// Test cases from family
const tests = [
  { name:'王献科(父)', date:'1982-01-27', time:'02:00', tz:'Asia/Shanghai', lat:36.45, lon:115.98 },
  { name:'张晓霞(母)', date:'1982-10-28', time:'12:00', tz:'Asia/Shanghai', lat:30.5, lon:114.3 },
  { name:'王一斐(长女)', date:'2010-12-04', time:'19:00', tz:'Asia/Shanghai', lat:22.5, lon:114.1 },
];

for (const t of tests) {
  const r = hd.calculateBodygraph(t.date, t.time, t.tz, t.lat, t.lon);
  const gates = (r.activatedGates||[]).sort((a,b)=>a-b);
  console.log(`\n=== ${t.name} ===`);
  console.log(`类型: ${r.type}`);
  console.log(`权威: ${r.authority}`);
  console.log(`人生角色: ${r.profile}`);
  console.log(`定义中心: ${(r.definedCenters||[]).join(', ')}`);
  console.log(`闸门(${gates.length}): ${gates.join(',')}`);
  console.log(`通道: ${(r.channels||[]).join(',')}`);
}
console.log('\n✅ Done');
