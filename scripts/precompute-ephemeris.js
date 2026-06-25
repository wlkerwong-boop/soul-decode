/**
 * 预计算星历表生成脚本
 * 用本机瑞士星历(swisseph)计算1900-2100年每月1日的行星位置
 * 输出: src/data/ephemeris/ephemeris-table.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLI = path.join(__dirname, '../node_modules/@it-healer/human-design-calculator/src/index.js');
const OUT_DIR = path.join(__dirname, '../src/data/ephemeris');
const OUT_FILE = path.join(OUT_DIR, 'ephemeris-table.json');
const COLS = 5; // only precompute Sun, Moon, Mercury, Venus, Mars

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  
  const table = {};
  let count = 0;
  
  // Only compute key dates: 1st of each month for 1900-2100
  for (let year = 1900; year <= 2100; year++) {
    for (let month = 1; month <= 12; month++) {
      const dateStr = `01.${String(month).padStart(2,'0')}.${year}`;
      try {
        const cmd = `node "${CLI}" ${dateStr} 12:00 Asia/Shanghai 39.9 116.4`;
        const output = execSync(cmd, { timeout: 10000, encoding: 'utf-8' });
        const match = output.match(/\{[\s\S]*\}/);
        if (!match) continue;
        
        const data = JSON.parse(match[0]);
        const pers = data.personality || {};
        const gates = {
          Sun: pers.Sun?.gate || 0,
          Moon: pers.Moon?.gate || 0,
          Mercury: pers.Mercury?.gate || 0,
          Venus: pers.Venus?.gate || 0,
          Mars: pers.Mars?.gate || 0,
        };
        table[`${year}-${month}`] = gates;
        count++;
      } catch(e) {
        // skip failures
      }
    }
    if (year % 25 === 0) console.log(`  Year ${year}: ${count} records so far`);
  }
  
  fs.writeFileSync(OUT_FILE, JSON.stringify(table));
  console.log(`\n✅ Done! ${count} records written to ${OUT_FILE}`);
  console.log(`File size: ${(fs.statSync(OUT_FILE).size / 1024).toFixed(1)} KB`);
}

main();
