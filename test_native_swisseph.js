// Test with native swisseph package ephemeris files
const path = require('path');

// Use swisseph native package directly
let sw;
try {
  sw = require('swisseph');
  console.log('swisseph loaded successfully');
} catch(e) {
  console.log('swisseph not available:', e.message);
  process.exit(1);
}

const ephePath = path.resolve(__dirname, 'node_modules', 'swisseph', 'ephe');
console.log('Ephemeris path:', ephePath);
sw.swe_set_ephe_path(ephePath);

// Check version
console.log('swisseph version check done');

// Calculate for 王献科
const { getActivation } = require('@it-healer/human-design-calculator/src/activation');
const typeModule = require('@it-healer/human-design-calculator/src/type');

const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','NorthNode'];
const PIDS = [sw.SE_SUN, sw.SE_MOON, sw.SE_MERCURY, sw.SE_VENUS, sw.SE_MARS, sw.SE_JUPITER, sw.SE_SATURN, sw.SE_URANUS, sw.SE_NEPTUNE, sw.SE_PLUTO, sw.SE_TRUE_NODE];

function julday(y,m,d,h) {
  let jd = 0;
  sw.swe_julday(y, m, d, h, sw.SE_GREG_CAL, (r) => { jd = r; });
  return jd;
}

function calcUT(jd, pid, flag) {
  let result = { longitude: 0, latitude: 0, distance: 0, longitudeSpeed: 0 };
  sw.swe_calc_ut(jd, pid, flag, (body) => {
    result = { longitude: body.longitude, latitude: body.latitude, distance: body.distance, longitudeSpeed: body.longitudeSpeed };
  });
  return result;
}

// Test 王献科
const utc = {y:1982,m:1,d:27,h:2-8}; // UTC
const birthJD = julday(utc.y, utc.m, utc.d, utc.h);
console.log('Birth JD:', birthJD);

// Get sun position with swisseph
const sunPos = calcUT(birthJD, sw.SE_SUN, sw.SEFLG_SPEED);
console.log('Sun longitude (swisseph):', sunPos.longitude);
console.log('Sun speed:', sunPos.longitudeSpeed);
