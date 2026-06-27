// Full comparison: jd-88 vs findDesignDate, Moshier vs SWIEPH, with/without North Node
const path = require('path');
const sw = require('sweph');
const { getActivation } = require('@it-healer/human-design-calculator/src/activation');
const typeModule = require('@it-healer/human-design-calculator/src/type');

const c = sw.constants;

const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','NorthNode'];
const PIDS = [c.SE_SUN, c.SE_MOON, c.SE_MERCURY, c.SE_VENUS, c.SE_MARS, c.SE_JUPITER, c.SE_SATURN, c.SE_URANUS, c.SE_NEPTUNE, c.SE_PLUTO, c.SE_TRUE_NODE];

// Set ephemeris path
sw.set_ephe_path(path.resolve(__dirname, 'ephemeris'));

function TZ(tz) {
  return {'America/Los_Angeles':-7,'America/New_York':-4,'Europe/London':0,'Europe/Paris':1,'Australia/Sydney':10,'Asia/Tokyo':9,'Asia/Shanghai':8,'Asia/Chongqing':8}[tz] || 8;
}

function toUTC(y, m, d, h, tz) {
  const offset = TZ(tz);
  let utcH = h - offset;
  let utcY = y, utcM = m, utcD = d;
  let utcHr = utcH;
  if (utcH < 0) { utcHr += 24; utcD -= 1;
    if (utcD < 1) { utcM -= 1; if (utcM < 1) { utcM = 12; utcY -= 1; }
      const dim = [31,28,31,30,31,30,31,31,30,31,30,31]; utcD = dim[utcM-1]; } }
  if (utcH >= 24) { utcHr -= 24; utcD += 1;
    if (utcD > 31) { utcM += 1; utcD = 1; if (utcM > 12) { utcM = 1; utcY += 1; } } }
  return {y: utcY, m: utcM, d: utcD, h: utcHr};
}

function julday(y, m, d, h) {
  return sw.julday(y, m, d, h, c.SE_GREG_CAL);
}

/** Binary search for design date (88° retrograde sun) */
function findDesignDate(birthJD, flag) {
  const birthSunLong = sw.calc_ut(birthJD, c.SE_SUN, flag).data[0];
  let low = birthJD - 96, high = birthJD - 84;
  const TARGET = 88.0, TOL = 0.00001, MAX = 100;
  for (let i = 0; i < MAX; i++) {
    const mid = (low + high) / 2;
    const midSunLong = sw.calc_ut(mid, c.SE_SUN, flag).data[0];
    let diff = Math.abs(birthSunLong - midSunLong);
    if (diff > 180) diff = 360 - diff;
    if (diff > TARGET - TOL && diff < TARGET + TOL) return mid;
    if (diff > TARGET) low = mid; else high = mid;
  }
  throw new Error('Design date not found');
}

function getGates(jd, flag, includeNN) {
  const gates = {};
  const planets = includeNN ? PLANETS : PLANETS.slice(0, 10);
  const pids = includeNN ? PIDS : PIDS.slice(0, 10);
  pids.forEach((pid, i) => {
    const r = sw.calc_ut(jd, pid, flag);
    if (r.error) throw new Error(r.error);
    const act = getActivation(r.data[0]);
    gates[planets[i]] = {gate: act.gate, line: act.line, longitude: r.data[0]};
  });
  gates['Earth'] = {gate: ((gates['Sun'].gate + 31) % 64) + 1, line: gates['Sun'].line};
  if (includeNN && gates['NorthNode']) {
    gates['SouthNode'] = {gate: ((gates['NorthNode'].gate + 31) % 64) + 1, line: gates['NorthNode'].line};
  }
  return gates;
}

function computeHD(jdP, jdD, flag, includeNN, label) {
  const pGates = getGates(jdP, flag, includeNN);
  const dGates = getGates(jdD, flag, includeNN);
  
  const allSet = new Set();
  Object.keys(pGates).forEach(k => allSet.add(pGates[k].gate));
  Object.keys(dGates).forEach(k => allSet.add(dGates[k].gate));
  
  const gSet = new Set(allSet);
  const chs = typeModule.getChannels(gSet) || [];
  const ctrSet = typeModule.getDefinedCenters(chs) || new Set();
  const type = typeModule.getType(chs, ctrSet, gSet) || 'Reflector';
  const profile = `${pGates['Sun'].line}/${dGates['Sun'].line}`;
  const defCtrs = Array.from(ctrSet);
  
  return { label, type, profile, activatedGates: Array.from(allSet).sort((a,b)=>a-b), definedCenters: defCtrs,
    pSun: `${pGates['Sun'].gate}.${pGates['Sun'].line}`,
    dSun: `${dGates['Sun'].gate}.${dGates['Sun'].line}`,
    designJD: jdD };
}

function testPerson(y, m, d, h, tz, name, expected) {
  const utc = toUTC(y, m, d, h, tz);
  const birthJD = julday(utc.y, utc.m, utc.d, utc.h);
  
  console.log(`\n╔═══════════════════════════════════════════════════╗`);
  console.log(`║ ${name.padEnd(49)}║`);
  console.log(`║ ${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} ${h}:00 ${tz.padEnd(22)}║`);
  console.log(`║ 期望: ${expected.padEnd(40)}║`);
  console.log(`╚═══════════════════════════════════════════════════╝`);
  console.log(`Birth JD: ${birthJD}`);
  
  // Method A: jd-88 with Moshier (current hd-engine-v6)
  const jdD_simple = birthJD - 88;
  const mA = computeHD(birthJD, jdD_simple, c.SEFLG_MOSEPH, false, 'A) jd-88 + Moshier(noNN)');
  
  // Method B: jd-88 with SWIEPH
  const mB = computeHD(birthJD, jdD_simple, c.SEFLG_SWIEPH, false, 'B) jd-88 + SWIEPH(noNN)');
  
  // Method C: findDesignDate + Moshier
  const jdD_designM = findDesignDate(birthJD, c.SEFLG_MOSEPH);
  const mC = computeHD(birthJD, jdD_designM, c.SEFLG_MOSEPH, false, 'C) designDate + Moshier(noNN)');
  
  // Method D: findDesignDate + SWIEPH (most correct approach, no NN)
  const jdD_designS = findDesignDate(birthJD, c.SEFLG_SWIEPH);
  const mD = computeHD(birthJD, jdD_designS, c.SEFLG_SWIEPH, false, 'D) designDate + SWIEPH(noNN)');
  
  // Method E: findDesignDate + SWIEPH with NorthNode
  const mE = computeHD(birthJD, jdD_designS, c.SEFLG_SWIEPH, true, 'E) designDate + SWIEPH(+NN)');
  
  // Method F: findDesignDate + SWIEPH+SPEED with NorthNode (matches @it-healer exactly)
  const jdD_designS2 = findDesignDate(birthJD, c.SEFLG_SWIEPH | c.SEFLG_SPEED);
  const mF = computeHD(birthJD, jdD_designS2, c.SEFLG_SWIEPH | c.SEFLG_SPEED, true, 'F) designDate + SWIEPH+SPEED(+NN)');
  
  const results = [mA, mB, mC, mD, mE, mF];
  results.forEach(r => {
    const match = r.type + ' ' + r.profile === expected ? '✅' : '❌';
    console.log(`  ${r.label}: ${r.type} ${r.profile} ${match}`);
    console.log(`    Personal Sun: ${r.pSun}, Design Sun: ${r.dSun}, Design JD: ${r.designJD.toFixed(6)}`);
    console.log(`    Centers: [${r.definedCenters.join(', ')}]`);
  });
  
  console.log(`  ── Design JD comparisons ──`);
  console.log(`    jd-88:                   ${jdD_simple.toFixed(6)}`);
  console.log(`    designDate(Moshier):     ${jdD_designM.toFixed(6)} (diff: ${((jdD_designM - jdD_simple)*24*60).toFixed(2)} min)`);
  console.log(`    designDate(SWIEPH):      ${jdD_designS.toFixed(6)} (diff: ${((jdD_designS - jdD_simple)*24*60).toFixed(2)} min)`);
}

const people = [
  [1982, 1, 27, 2, 'Asia/Shanghai', '王献科', 'Generator 5/1'],
  [1982, 10, 28, 12, 'Asia/Shanghai', '张晓霞', 'Manifesting Generator 3/5'],
  [2010, 12, 4, 19, 'Asia/Shanghai', '王一斐', 'Projector 1/4'],
  [2017, 7, 23, 10, 'Asia/Shanghai', '王一如', 'Generator 1/1'],
  [2015, 6, 4, 19, 'America/Los_Angeles', '王一然', 'Reflector 3/1'],
];

people.forEach(p => testPerson(...p));
