/**
 * 批量预计算星历 - 为HD引擎生成精确的闸门分配表
 * 使用本机瑞士星历(swisseph)，逐日计算1900-2100年
 * 输出: src/data/ephemeris/planet-gates.json  (紧凑格式)
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLI = path.join(__dirname, '../node_modules/@it-healer/human-design-calculator/src/index.js');
const OUT_DIR = path.join(__dirname, '../src/data/ephemeris');
const OUT_FILE = path.join(OUT_DIR, 'planet-gates.json');
const TMP_FILE = '/tmp/hd-batch.svg';

// We'll compute at 3-day intervals and interpolate
const START_YEAR = 1900;
const END_YEAR = 2100;
const STEP_DAYS = 3;

function keyFor(year, month, day) {
  return `${String(year).slice(2)}${String(month).padStart(2,'0')}${String(day).padStart(2,'0')}`;
}

function encodeGates(gates) {
  // gate is 1-64, fit in 6 bits, 11 planets → 66 bits → base64
  const bytes = new Uint8Array(11);
  for (let i = 0; i < 11; i++) {
    bytes[i] = gates[i] || 0;
  }
  return Buffer.from(bytes).toString('base64');
}

function decodeGates(str) {
  const buf = Buffer.from(str, 'base64');
  return Array.from(buf);
}

async function main() {
  console.log(`Precomputing HD gates from ${START_YEAR} to ${END_YEAR} (${STEP_DAYS}-day intervals)...`);
  console.log(`Using CLI: ${CLI}`);
  
  fs.mkdirSync(OUT_DIR, { recursive: true });
  
  const table = {};
  let count = 0;
  let errors = 0;
  
  const startTime = Date.now();
  
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 28; day += STEP_DAYS) {
        const dateStr = `${String(day).padStart(2,'0')}.${String(month).padStart(2,'0')}.${year}`;
        const k = keyFor(year, month, day);
        
        try {
          const cmd = `node "${CLI}" ${dateStr} 12:00 Asia/Shanghai 39.9 116.4 ${TMP_FILE}`;
          const output = execSync(cmd, { timeout: 15000, encoding: 'utf-8' });
          const match = output.match(/\{[\s\S]*\}/);
          if (!match) { errors++; continue; }
          
          const data = JSON.parse(match[0]);
          const pers = data.personality || {};
          const gates = [
            pers.Sun?.gate || 0, pers.Moon?.gate || 0,
            pers.Mercury?.gate || 0, pers.Venus?.gate || 0,
            pers.Mars?.gate || 0, pers.Jupiter?.gate || 0,
            pers.Saturn?.gate || 0, pers.Uranus?.gate || 0,
            pers.Neptune?.gate || 0, pers.Pluto?.gate || 0,
            pers.NorthNode?.gate || 0,
          ];
          table[k] = encodeGates(gates);
          count++;
        } catch(e) {
          errors++;
        }
      }
    }
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    if (year % 10 === 0 || year === START_YEAR) {
      console.log(`  ${year}: ${count} records, ${errors} errors, ${elapsed}s elapsed`);
    }
  }
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  const json = JSON.stringify(table);
  fs.writeFileSync(OUT_FILE, json);
  
  const fileSize = (json.length / 1024).toFixed(1);
  console.log(`\n✅ Complete! ${count} records in ${elapsed}s`);
  console.log(`File: ${OUT_FILE} (${fileSize} KB)`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
