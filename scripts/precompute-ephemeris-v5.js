/**
 * 预计算星历表 v5 — 瑞士星历 + 包含北交点(True Node)
 * 
 * 现在包含12个天体: [Sun, Moon, Mercury, Venus, Mars, 
 *                     Jupiter, Saturn, Uranus, Neptune, Pluto,
 *                     True Node (Rahu), Chiron]
 * 
 * 输出格式: { "YYYY-MM-DD": [g1,l1,g2,l2,...g12,l12] }
 * 前10个同v4, 第11-12是True Node和Chiron
 */
const sweph = require('sweph');
const { getActivation } = require('@it-healer/human-design-calculator/src/activation');
const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '../public/planet-gates.json');
const START = 1900, END = 2100;
// Sun(0)~Pluto(9) + True Node(11) + Chiron(15)
const PLANET_IDS = [0,1,2,3,4,5,6,7,8,9, 11, 15];
const PLANET_NAMES = ['Sun','Moon','Mercury','Venus','Mars',
                      'Jupiter','Saturn','Uranus','Neptune','Pluto',
                      'TrueNode','Chiron'];

const IFLAG = 2 | 256; // SwissEphemeris | Speed

console.log(`Precomputing ${START}-${END} with Swiss Ephemeris + 12 bodies...`);

const table = {};
let count = 0;
const startTime = Date.now();

for (let year = START; year <= END; year++) {
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 31; day++) {
      const d = new Date(Date.UTC(year, month - 1, day));
      if (d.getUTCMonth() !== month - 1) continue;
      
      const jd = sweph.julday(year, month, day, 12.0, 1);
      const packed = [];
      
      for (let pi = 0; pi < PLANET_IDS.length; pi++) {
        try {
          const r = sweph.calc_ut(jd, PLANET_IDS[pi], IFLAG);
          if (r && r.data) {
            const act = getActivation(r.data[0]);
            packed.push(act.gate);
            packed.push(act.line);
          } else {
            packed.push(0); packed.push(0);
          }
        } catch (e) {
          packed.push(0); packed.push(0);
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
fs.writeFileSync(OUT_FILE, json);

const elapsed = ((Date.now()-startTime)/1000).toFixed(0);
console.log(`\n✅ Done! ${count} entries (${(json.length/1024).toFixed(0)} KB) in ${elapsed}s`);

// 验证
console.log('\n═══ 验证: 王献科 1982-01-27 ═══');
const testKey = '1982-01-27';
const td = table[testKey];
const gates = [];
for (let i = 0; i < 12; i++) gates.push(td[i*2]);

const designDate = new Date(Date.UTC(1982, 0, 27) - 88 * 86400000);
const dk = `${designDate.getUTCFullYear()}-${String(designDate.getUTCMonth()+1).padStart(2,'0')}-${String(designDate.getUTCDate()).padStart(2,'0')}`;
const dd = table[dk];
const dgates = [];
for (let i = 0; i < 12; i++) dgates.push(dd[i*2]);

const allGates = [...new Set([...gates, ...dgates])].sort((a,b)=>a-b);
const dingxin = [11,13,14,24,31,32,34,40,41,44,49,50,57,60,61,62];
const matched = allGates.filter(g => dingxin.includes(g));
const missing = dingxin.filter(g => !allGates.includes(g));
const extra = allGates.filter(g => !dingxin.includes(g));

console.log(`Birth (${testKey}): [${gates.join(',')}]`);
console.log(`  TrueNode gate: ${gates[10]}, Chiron gate: ${gates[11]}`);
console.log(`Design (${dk}): [${dgates.join(',')}]`);
console.log(`  TrueNode gate: ${dgates[10]}, Chiron gate: ${dgates[11]}`);
console.log(`\n总闸门(${allGates.length}): [${allGates.join(',')}]`);
console.log(`匹配: ${matched.length}/${dingxin.length}`);
if (missing.length) console.log(`缺失: ${missing.join(',')}`);
if (extra.length) console.log(`多余: ${extra.join(',')}`);
if (matched.length === dingxin.length) console.log('\n🎉 与鼎新图完全一致！');
