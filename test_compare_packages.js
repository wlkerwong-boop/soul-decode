// Direct comparison: sweph vs swisseph planet positions
const sw = require('sweph');
const path = require('path');

// Use swisseph native
const swiss = require('swisseph');
const ephePath = path.resolve(__dirname, 'node_modules', 'swisseph', 'ephe');
swiss.swe_set_ephe_path(ephePath);

// Use sweph
sw.set_ephe_path(path.resolve(__dirname, 'ephemeris'));
const c = sw.constants;

const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const PIDS = [c.SE_SUN, c.SE_MOON, c.SE_MERCURY, c.SE_VENUS, c.SE_MARS, c.SE_JUPITER, c.SE_SATURN, c.SE_URANUS, c.SE_NEPTUNE, c.SE_PLUTO];
const SWISS_PIDS = [swiss.SE_SUN, swiss.SE_MOON, swiss.SE_MERCURY, swiss.SE_VENUS, swiss.SE_MARS, swiss.SE_JUPITER, swiss.SE_SATURN, swiss.SE_URANUS, swiss.SE_NEPTUNE, swiss.SE_PLUTO];

function sweph_jd(y,m,d,h) { return sw.julday(y,m,d,h,c.SE_GREG_CAL); }
function swiss_jd(y,m,d,h) { let jd=0; swiss.swe_julday(y,m,d,h,swiss.SE_GREG_CAL,(r)=>{jd=r;}); return jd; }

// Test 王献科 and 王一然
const tests = [
  {name:'王献科', y:1982, m:1, d:27, h:2-8},
  {name:'王一然', y:2015, m:6, d:4, h:19-(-7)}, // LA July = -7
];

tests.forEach(t => {
  console.log(`\n=== ${t.name} (UT: ${t.y}-${t.m}-${t.d} ${t.h}h) ===`);
  const swephJD = sweph_jd(t.y, t.m, t.d, t.h);
  const swissJD = swiss_jd(t.y, t.m, t.d, t.h);
  console.log(`sweph JD: ${swephJD}, swiss JD: ${swissJD}, diff: ${(swephJD-swissJD)*86400}s`);
  
  PLANETS.forEach((name, i) => {
    const r1 = sw.calc_ut(swephJD, PIDS[i], c.SEFLG_SWIEPH | c.SEFLG_SPEED);
    let r2 = {data:[0,0,0,0,0,0]};
    swiss.swe_calc_ut(swissJD, SWISS_PIDS[i], swiss.SEFLG_SWIEPH | swiss.SEFLG_SPEED, (body) => {
      r2 = {data:[body.longitude, body.latitude, body.distance, body.longitudeSpeed, body.latitudeSpeed, body.distanceSpeed]};
    });
    const diff = Math.abs(r1.data[0] - r2.data[0]) * 3600;
    if (diff > 0.0001) {
      console.log(`${name}: sweph=${r1.data[0].toFixed(8)}°, swiss=${r2.data[0].toFixed(8)}°, diff=${diff.toFixed(8)} arcsec`);
    }
  });
});
