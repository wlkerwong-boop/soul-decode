/**
 * 预计算星历表 — 用@it-healer激活逻辑
 * 输出: src/data/ephemeris/planet-gates.json
 */
const sweph = require('sweph');
const activation = require('@it-healer/human-design-calculator/src/activation');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../src/data/ephemeris');
const OUT_FILE = path.join(OUT_DIR, 'planet-gates.json');
const START = 1900;
const END = 2100;
const PLANET_IDS = [0,1,2,3,4,5,6,7,8,9];
const PLANET_NAMES = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

function main() {
  console.log('Precomputing with activation logic...');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  
  const table = {};
  let count = 0;
  const startTime = Date.now();
  
  for (let year = START; year <= END; year++) {
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 31; day++) {
        const testDate = new Date(Date.UTC(year, month - 1, day));
        if (testDate.getUTCMonth() !== month - 1) continue;
        
        const jd = sweph.julday(year, month, day, 12.0, 1);
        const gates = [];
        
        for (let pi = 0; pi < PLANET_IDS.length; pi++) {
          try {
            const r = sweph.calc_ut(jd, PLANET_IDS[pi], 4);
            if (r && r.data) {
              const act = activation.getActivation(r.data[0]);
              gates.push(act ? act.gate : 0);
            } else { gates.push(0); }
          } catch { gates.push(0); }
        }
        
        const key = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        table[key] = gates;
        count++;
      }
    }
    if (year % 25 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      console.log(`  ${year}: ${count} days, ${elapsed}s`);
    }
  }
  
  const json = JSON.stringify(table);
  fs.writeFileSync(OUT_FILE, json);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\n✅ ${count} entries in ${elapsed}s, ${(json.length/1024).toFixed(1)} KB`);
}

main();
