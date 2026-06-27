// Check what DE version the ephemeris files contain
const sw = require('sweph');
const path = require('path');

// Set path to our ephemeris files
sw.set_ephe_path(path.resolve(__dirname, 'ephemeris'));
console.log('Ephemeris path set to:', path.resolve(__dirname, 'ephemeris'));

// Get current file data to see which DE version
try {
  const data = sw.get_current_file_data();
  console.log('File data:', JSON.stringify(data, null, 2));
} catch(e) {
  console.log('get_current_file_data error:', e.message);
}

// Try a simple calc with SEFLG_SWIEPH
const c = sw.constants;
const jd = sw.julday(1982, 1, 27, 2 - 8, c.SE_GREG_CAL); // 王献科 UTC
console.log('Julian Day:', jd);

// Test with Moshier first
try {
  const r1 = sw.calc_ut(jd, c.SE_SUN, c.SEFLG_MOSEPH);
  console.log('Moshier Sun:', r1.data.longitude, r1.data.longitudeSpeed);
} catch(e) {
  console.log('Moshier error:', e.message);
}

// Test with Swiss ephemeris
try {
  const r2 = sw.calc_ut(jd, c.SE_SUN, c.SEFLG_SWIEPH);
  console.log('SWIEPH Sun:', r2.data.longitude, r2.data.longitudeSpeed);
  console.log('SWIEPH return code:', r2.returnCode);
} catch(e) {
  console.log('SWIEPH error:', e.message);
}

// Test with SEFLG_SPEED added
try {
  const r3 = sw.calc_ut(jd, c.SE_SUN, c.SEFLG_SWIEPH | c.SEFLG_SPEED);
  console.log('SWIEPH+SPEED Sun:', r3.data.longitude, r3.data.longitudeSpeed);
  console.log('SWIEPH+SPEED return code:', r3.returnCode);
} catch(e) {
  console.log('SWIEPH+SPEED error:', e.message);
}
