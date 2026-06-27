// Debug sweph calc_ut return value
const sw = require('sweph');
const path = require('path');

sw.set_ephe_path(path.resolve(__dirname, 'ephemeris'));

const c = sw.constants;
const jd = sw.julday(1982, 1, 27, 2 - 8, c.SE_GREG_CAL);
console.log('JD:', jd);

// Full dump
const r = sw.calc_ut(jd, c.SE_SUN, c.SEFLG_MOSEPH);
console.log('Type:', typeof r);
console.log('Keys:', Object.keys(r));
console.log('Full result:', JSON.stringify(r, null, 2));

// Also test with callback-style (if swisseph-like)
try {
  const r2 = sw.calc_ut(jd, c.SE_SUN, c.SEFLG_SWIEPH | c.SEFLG_SPEED);
  console.log('\nSWIEPH result:', JSON.stringify(r2, null, 2));
} catch(e) {
  console.log('SWIEPH error:', e.message, e.stack);
}

// Check version
console.log('Version:', sw.version());
