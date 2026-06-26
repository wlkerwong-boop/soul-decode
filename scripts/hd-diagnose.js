/**
 * 人类图精度诊断 — 尝试不同 Design 算法匹配鼎新图
 * 
 * 鼎新图目标闸门(16个): 11,13,14,24,31,32,34,40,41,44,49,50,57,60,61,62
 * 当前引擎(13个): 11,13,14,26,32,34,40,41,44,50,55,57,60
 * 缺失: 24,31,49,61,62
 * 多余: 26,55
 */
const fs = require('fs');
const path = require('path');

// 加载预计算星历表
const table = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../public/planet-gates.json'), 'utf-8'
));

const DINGXIN = [11,13,14,24,31,32,34,40,41,44,49,50,57,60,61,62];

function getPersonality(key) {
  const d = table[key];
  if (!d) return [];
  const gates = [];
  for (let i = 0; i < 10; i++) gates.push(d[i*2]);
  return gates;
}

function getDesign(key) {
  const d = table[key];
  if (!d) return [];
  const gates = [];
  for (let i = 0; i < 10; i++) gates.push(d[i*2]);
  return gates;
}

// Timezone helpers
function toDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function timestampToDateKey(ms) {
  const d = new Date(ms);
  return toDateKey(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

// Birth: 1982-01-27 02:00 CST
// In the engine, tz=Asia/Shanghai means NO conversion (treats input as UTC directly)
// This means birth is at 1982-01-27 02:00:00 UTC

const BIRTH_YEAR = 1982, BIRTH_MONTH = 1, BIRTH_DAY = 27, BIRTH_HOUR = 2;

console.log('═══ 人类图精度诊断 ═══');
console.log('出生: 1982-01-27 02:00 CST');
console.log(`鼎新目标(16): [${DINGXIN.join(',')}]`);
console.log('');

// Method 1: Standard (current) - birthMs = Date.UTC, no tz conversion, 88 days
console.log('--- 方法1: 当前引擎算法 ---');
{
  const birthMs = Date.UTC(BIRTH_YEAR, BIRTH_MONTH-1, BIRTH_DAY, BIRTH_HOUR, 0, 0);
  const pKey = toDateKey(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY);
  const pGates = getPersonality(pKey);
  
  const dKey = timestampToDateKey(birthMs - 88 * 86400000);
  const dGates = getDesign(dKey);
  
  const all = [...new Set([...pGates, ...dGates])].sort((a,b)=>a-b);
  const match = all.filter(g => DINGXIN.includes(g));
  const miss = DINGXIN.filter(g => !all.includes(g));
  const extra = all.filter(g => !DINGXIN.includes(g));
  console.log(`  Design: ${dKey} (88天)`);
  console.log(`  P gates: [${pGates.join(',')}]`);
  console.log(`  D gates: [${dGates.join(',')}]`);
  console.log(`  总(${all.length}): [${all.join(',')}]`);
  console.log(`  匹配: ${match.length}/${DINGXIN.length}, 缺失: ${miss.join(',')}, 多余: ${extra.join(',')}`);
}

// Method 2: Convert birth to UTC first (02:00 CST = 1982-01-26 18:00 UTC)
console.log('\n--- 方法2: 正确UTC转换 ---');
{
  const localMs = Date.UTC(BIRTH_YEAR, BIRTH_MONTH-1, BIRTH_DAY, BIRTH_HOUR, 0, 0);
  const utcMs = localMs - 8 * 3600000; // CST = UTC+8
  const birthUTC = new Date(utcMs);
  const pKey = toDateKey(birthUTC.getUTCFullYear(), birthUTC.getUTCMonth()+1, birthUTC.getUTCDate());
  const pGates = getPersonality(pKey);
  
  const dKey = timestampToDateKey(utcMs - 88 * 86400000);
  const dGates = getDesign(dKey);
  
  const all = [...new Set([...pGates, ...dGates])].sort((a,b)=>a-b);
  const match = all.filter(g => DINGXIN.includes(g));
  const miss = DINGXIN.filter(g => !all.includes(g));
  const extra = all.filter(g => !DINGXIN.includes(g));
  console.log(`  P date: ${pKey}, D date: ${dKey}`);
  console.log(`  总(${all.length}): [${all.join(',')}]`);
  console.log(`  匹配: ${match.length}/${DINGXIN.length}, 缺失: ${miss.join(',')}, 多余: ${extra.join(',')}`);
}

// Method 3: Try different design day offsets (87.5 - 89 days in 0.1 increments)
console.log('\n--- 方法3: 搜索最佳Design天数偏移 ---');
{
  const pKey = toDateKey(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY);
  const pGates = getPersonality(pKey);
  const birthMs = Date.UTC(BIRTH_YEAR, BIRTH_MONTH-1, BIRTH_DAY, BIRTH_HOUR, 0, 0);
  
  let best = { offset: 0, match: 0, all: [], miss: [], extra: [] };
  
  for (let days = 86.5; days <= 89.5; days += 0.1) {
    const dMs = days * 86400000;
    const dKey = timestampToDateKey(birthMs - dMs);
    const dGates = getDesign(dKey);
    
    const all = [...new Set([...pGates, ...dGates])].sort((a,b)=>a-b);
    const match = DINGXIN.filter(g => all.includes(g));
    
    if (match.length >= best.match) {
      const miss = DINGXIN.filter(g => !all.includes(g));
      const extra = all.filter(g => !DINGXIN.includes(g));
      if (match.length > best.match || miss.length < best.miss?.length) {
        best = { offset: days, match: match.length, all, miss, extra, dKey, dGates };
      }
    }
  }
  
  console.log(`  最佳偏移: ${best.offset}天`);
  console.log(`  Design: ${best.dKey}`);
  console.log(`  D gates: [${best.dGates.join(',')}]`);
  console.log(`  总(${best.all.length}): [${best.all.join(',')}]`);
  console.log(`  匹配: ${best.match}/${DINGXIN.length}`);
  console.log(`  缺失: ${best.miss.join(',')}`);
  console.log(`  多余: ${best.extra.join(',')}`);
}

// Method 4: Include True Node (Rahu) - try different offsets with node
console.log('\n--- 方法4: 尝试不同设计天数 + True Node ---');
// True Node is planet index 10 (SE_MEAN_NODE) or 11 (SE_TRUE_NODE)
// Our planet-gates.json only has 10 planets. Let me check if I can compute node gates.
// Actually the node moves ~19.3°/year retrograde. For 1982, the Mean Node was at ~12° Cancer
// Let me calculate manually
{
  // Mean Node position around 1982-01-01: approximately 10-12° Cancer
  const nodeLongitude = 102; // ~12° Cancer (Cancer = 90-120°)
  const { getActivation } = require('@it-healer/human-design-calculator/src/activation');
  const node = getActivation(nodeLongitude);
  console.log(`  北交点(Mean Node) ~12°Cancer = 闸门${node.gate}`);
  
  // South Node = opposite
  const snLongitude = (nodeLongitude + 180) % 360;
  const snAct = getActivation(snLongitude);
  console.log(`  南交点 = 闸门${snAct.gate}`);
  
  // Try adding Node to the personality
  const pKey = toDateKey(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY);
  const pGates = getPersonality(pKey);
  
  // Try best offset from method 3
  const bestOffset = 87.2; // from method 3 output
  const birthMs = Date.UTC(BIRTH_YEAR, BIRTH_MONTH-1, BIRTH_DAY, BIRTH_HOUR, 0, 0);
  const dKey = timestampToDateKey(birthMs - bestOffset * 86400000);
  const dGates = getDesign(dKey);
  
  // Add Node to personality
  const withNode = [...new Set([...pGates, node.gate, snAct.gate, ...dGates])].sort((a,b)=>a-b);
  const matchNode = withNode.filter(g => DINGXIN.includes(g));
  const missNode = DINGXIN.filter(g => !withNode.includes(g));
  const extraNode = withNode.filter(g => !DINGXIN.includes(g));
  console.log(`\n  加入北交点后:`);
  console.log(`  总(${withNode.length}): [${withNode.join(',')}]`);
  console.log(`  匹配: ${matchNode.length}/${DINGXIN.length}`);
  console.log(`  缺失: ${missNode.join(',')}`);
  console.log(`  多余: ${extraNode.join(',')}`);
}

console.log('\n═══ 诊断完成 ═══');
