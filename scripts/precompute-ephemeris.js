/**
 * 预计算星历表 v2 — 存闸门+爻线
 */
const sweph = require('sweph');
const activation = require('@it-healer/human-design-calculator/src/activation');
const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '../src/data/ephemeris/planet-gates.json');
const START = 1900, END = 2100;
const PLANET_IDS = [0,1,2,3,4,5,6,7,8,9];

function main() {
  console.log('Precomputing with gate+line...');
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  
  const table = {};
  let count = 0;
  const startTime = Date.now();
  
  for (let year = START; year <= END; year++) {
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 31; day++) {
        const d = new Date(Date.UTC(year, month - 1, day));
        if (d.getUTCMonth() !== month - 1) continue;
        
        const jd = sweph.julday(year, month, day, 12.0, 1);
        const gates = [];
        const lines = [];
        
        for (let pi = 0; pi < PLANET_IDS.length; pi++) {
          try {
            const r = sweph.calc_ut(jd, PLANET_IDS[pi], 4);
            if (r && r.data) {
              const act = activation.getActivation(r.data[0]);
              gates.push(act ? act.gate : 0);
              lines.push(act ? act.line : 0);
            } else { gates.push(0); lines.push(0); }
          } catch { gates.push(0); lines.push(0); }
        }
        
        const key = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        // Format: [g1,l1,g2,l2,...] = [gate1,line1,gate2,line2,...]
        const packed = [];
        for (let i = 0; i < 10; i++) { packed.push(gates[i]); packed.push(lines[i]); }
        table[key] = packed;
        count++;
      }
    }
    if (year % 25 === 0) console.log(`  ${year}: ${count} days, ${((Date.now()-startTime)/1000).toFixed(0)}s`);
  }
  
  const json = JSON.stringify(table);
  fs.writeFileSync(OUT_FILE, json);
  console.log(`\n✅ ${count} entries, ${(json.length/1024).toFixed(1)} KB, ${((Date.now()-startTime)/1000).toFixed(0)}s`);
}

main();
