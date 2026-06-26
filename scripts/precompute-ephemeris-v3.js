/**
 * 预计算星历表 v3 — 使用 @swisseph/node（瑞士星历，官方原生绑定）
 * MIT / AGPL-3.0-or-later （Swiss Ephemeris bundled）
 * 
 * 对比 v2 的改进：
 * - 使用 Swiss Ephemeris (SEFLG_SWIEPH) 替代 Moshier (SEFLG_MOSEPH)
 * - 精度从 ±0.1° 提升至 ±0.001°
 * 
 * 输出：每日期10大行星的闸门(gate)和爻线(line)，存为紧凑JSON
 *   格式: { "YYYY-MM-DD": [g1,l1,g2,l2,...g10,l10] }
 *   行星顺序: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
 */
const fs = require('fs');
const path = require('path');
const swiss = require('@swisseph/node');

const SE_SUN = 0, SE_MOON = 1, SE_MERCURY = 2, SE_VENUS = 3;
const SE_MARS = 4, SE_JUPITER = 5, SE_SATURN = 6;
const SE_URANUS = 7, SE_NEPTUNE = 8, SE_PLUTO = 9;

const PLANET_IDS = [SE_SUN, SE_MOON, SE_MERCURY, SE_VENUS, SE_MARS,
                    SE_JUPITER, SE_SATURN, SE_URANUS, SE_NEPTUNE, SE_PLUTO];

const PLANET_NAMES = ['Sun','Moon','Mercury','Venus','Mars',
                      'Jupiter','Saturn','Uranus','Neptune','Pluto'];

// 计算标志：瑞士星历 (2) + 速度 (256) = 258
const IFLAG = 2 | 256; // SwissEphemeris | Speed

const OUT_FILE = path.join(__dirname, '../public/planet-gates.json');
const START = 1900, END = 2100;

// 闸门映射：每门5.625°
function longitudeToGateLine(longitude) {
  const deg = ((longitude % 360) + 360) % 360;
  const gate = Math.floor(deg / 5.625) + 1;
  const line = Math.floor(((deg % 5.625) / 5.625) * 6) + 1;
  return {
    gate: Math.min(Math.max(gate, 1), 64),
    line: Math.min(Math.max(line, 1), 6),
    longitude: deg,
  };
}

console.log(`Precomputing ephemeris ${START}-${END} with @swisseph/node (Swiss Ephemeris)...`);

const table = {};
let count = 0;
const startTime = Date.now();

for (let year = START; year <= END; year++) {
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 31; day++) {
      const d = new Date(Date.UTC(year, month - 1, day));
      if (d.getUTCMonth() !== month - 1) continue;
      
      const jd = swiss.julianDay(year, month, day, 12.0, 1);
      const packed = [];
      
      for (let pi = 0; pi < PLANET_IDS.length; pi++) {
        try {
          const result = swiss.calculatePosition(jd, PLANET_IDS[pi], IFLAG);
          if (result && result.longitude !== undefined) {
            const act = longitudeToGateLine(result.longitude);
            packed.push(act.gate);
            packed.push(act.line);
          } else {
            packed.push(0);
            packed.push(0);
          }
        } catch (e) {
          packed.push(0);
          packed.push(0);
        }
      }
      
      const key = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      table[key] = packed;
      count++;
    }
  }
  if (year % 25 === 0) {
    console.log(`  ${year}: ${count} days, ${((Date.now()-startTime)/1000).toFixed(0)}s`);
  }
}

const json = JSON.stringify(table);
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, json);

const elapsed = ((Date.now()-startTime)/1000).toFixed(0);
console.log(`\n✅ Done! ${count} entries (${(json.length/1024).toFixed(0)} KB) in ${elapsed}s`);

// 验证：王献科 1982-01-27
console.log('\n--- 验证测试 ---');
const testKey = '1982-01-27';
const testData = table[testKey];
if (testData) {
  const gates = [];
  for (let i = 0; i < 10; i++) gates.push(testData[i*2]);
  console.log(`Birth (${testKey}): [${gates.join(', ')}]`);
  
  // Design date = 88天前
  const designDate = new Date(Date.UTC(1982, 0, 27) - 88 * 86400000);
  const dk = `${designDate.getUTCFullYear()}-${String(designDate.getUTCMonth()+1).padStart(2,'0')}-${String(designDate.getUTCDate()).padStart(2,'0')}`;
  const dd = table[dk];
  if (dd) {
    const dgates = [];
    for (let i = 0; i < 10; i++) dgates.push(dd[i*2]);
    console.log(`Design (${dk}): [${dgates.join(', ')}]`);
    
    const allGates = [...new Set([...gates, ...dgates])].sort((a,b)=>a-b);
    const dingxin = [11,13,14,24,31,32,34,40,41,44,49,50,57,60,61,62];
    const matched = allGates.filter(g => dingxin.includes(g));
    const missing = dingxin.filter(g => !allGates.includes(g));
    const extra = allGates.filter(g => !dingxin.includes(g));
    
    console.log(`\n我们总闸门(${allGates.length}): [${allGates.join(',')}]`);
    console.log(`鼎新图闸门(${dingxin.length}): [${dingxin.join(',')}]`);
    console.log(`匹配: ${matched.length}/${dingxin.length} ✅`);
    if (missing.length) console.log(`缺失: ${missing.join(',')} ❌`);
    if (extra.length) console.log(`多余: ${extra.join(',')}`);
    if (missing.length === 0) console.log('\n🎉 全部匹配！与鼎新图一致！');
  }
}


