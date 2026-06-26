/**
 * 预计算星历表 v4 — 瑞士星历 + 正确HD闸门映射
 * 
 * 关键修正：
 * 1. 使用 sweph 包 + SEFLG_SWIEPH (flag=2) 替代 Moshier (flag=4)
 * 2. 使用 @it-healer/human-design-calculator 的 getActivation() 正确映射
 *    - HD闸门起始于宝瓶座2°（偏移58°）
 *    - GATE_ORDER 表将64个位置正确映射到HD闸门编号
 */
const sweph = require('sweph');
const { getActivation } = require('@it-healer/human-design-calculator/src/activation');
const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '../public/planet-gates.json');
const START = 1900, END = 2100;
const PLANET_IDS = [0,1,2,3,4,5,6,7,8,9]; // Sun, Moon, ..., Pluto

// 瑞士星历 (2) + 速度 (256)
const IFLAG = 2 | 256;

function main() {
  console.log(`Precomputing ephemeris ${START}-${END} with Swiss Ephemeris + HD mapping...`);
  
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
              const act = getActivation(r.data[0]); // longitude
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
  
  // === 验证测试：王献科 1982-01-27 ===
  console.log('\n═══════════ 验证测试 ═══════════');
  const testKey = '1982-01-27';
  const td = table[testKey];
  if (!td) { console.log('❌ Test date not found'); return; }
  
  const gates = [];
  for (let i = 0; i < 10; i++) gates.push(td[i*2]);
  console.log(`Birth (${testKey}): [${gates.join(', ')}]`);
  
  // Design date: 88天前
  const designDate = new Date(Date.UTC(1982, 0, 27) - 88 * 86400000);
  const dk = `${designDate.getUTCFullYear()}-${String(designDate.getUTCMonth()+1).padStart(2,'0')}-${String(designDate.getUTCDate()).padStart(2,'0')}`;
  const dd = table[dk];
  if (!dd) { console.log('❌ Design date not found'); return; }
  
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
  console.log(`匹配: ${matched.length}/${dingxin.length} ${matched.length === dingxin.length ? '🎉 完全一致！' : ''}`);
  if (missing.length) console.log(`缺失: ${missing.join(',')}`);
  if (extra.length) console.log(`多余: ${extra.join(',')}`);
  
  // 引擎类型推断
  const planets = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  const lines = [];
  for (let i = 0; i < 10; i++) lines.push(td[i*2+1]);
  
  const pSunGate = gates[0], pSunLine = lines[0];
  const dSunGate = dgates[0], dSunLine = lines[0];
  const profile = Math.min(pSunLine, 6) + '/' + Math.min(dSunLine, 6);
  
  // Simple type inference
  const sacralGates = [5,9,14,27,29,34,42,59];
  const motorToThroat = [21,45,5,34,57,20,10,35,36,30,41,49,19,55,39,53,58,52];
  const hasSacral = allGates.some(g => sacralGates.includes(g));
  const hasMotorToThroat = allGates.some(g => motorToThroat.includes(g));
  const type = hasSacral ? (hasMotorToThroat ? 'Manifesting Generator' : 'Generator') : (hasMotorToThroat ? 'Manifestor' : 'Projector');
  
  console.log(`\n推断类型: ${type}`);
  console.log(`推断人生角色: ${profile}`);
  console.log(`鼎新类型: Generator (Sacral)`);
  console.log(`鼎新人声角色: 5/1`);
}

main();
