// Full analysis for all 5 family members - Moshier vs SWIEPH
const sw = require('sweph');
const path = require('path');

sw.set_ephe_path(path.resolve(__dirname, 'ephemeris'));
const c = sw.constants;

const { getActivation } = require('@it-healer/human-design-calculator/src/activation');
const typeModule = require('@it-healer/human-design-calculator/src/type');

const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const PIDS = [c.SE_SUN, c.SE_MOON, c.SE_MERCURY, c.SE_VENUS, c.SE_MARS, c.SE_JUPITER, c.SE_SATURN, c.SE_URANUS, c.SE_NEPTUNE, c.SE_PLUTO];

function calcPerson(y, m, d, h, tz, name) {
  const offset = {'America/Los_Angeles':-7,'America/New_York':-4,'Europe/London':0,'Europe/Paris':1,'Australia/Sydney':10,'Asia/Tokyo':9,'Asia/Shanghai':8,'Asia/Chongqing':8}[tz] || 8;
  const utcH = h - offset;
  let utcY = y, utcM = m, utcD = d;
  let utcHr = utcH;
  if (utcH < 0) { utcHr += 24; utcD -= 1;
    if (utcD < 1) { utcM -= 1; if (utcM < 1) { utcM = 12; utcY -= 1; }
      const dim = [31,28,31,30,31,30,31,31,30,31,30,31]; utcD = dim[utcM-1]; } }
  if (utcH >= 24) { utcHr -= 24; utcD += 1;
    if (utcD > 31) { utcM += 1; utcD = 1; if (utcM > 12) { utcM = 1; utcY += 1; } } }
  
  const jd = sw.julday(utcY, utcM, utcD, utcHr, c.SE_GREG_CAL);
  const jdDesign = jd - 88;
  
  function getGates(jd, flag) {
    const gates = {};
    PIDS.forEach((pid, i) => {
      const r = sw.calc_ut(jd, pid, flag);
      if (r.error) throw new Error(`${name}: ${r.error}`);
      const act = getActivation(r.data[0]);
      gates[PLANETS[i]] = {gate: act.gate, line: act.line, longitude: r.data[0]};
    });
    gates['Earth'] = {gate: ((gates['Sun'].gate + 31) % 64) + 1, line: gates['Sun'].line};
    return gates;
  }
  
  function computeHD(jdP, jdD, flag, label) {
    const pGates = getGates(jdP, flag);
    const dGates = getGates(jdD, flag);
    
    const allSet = new Set();
    Object.keys(pGates).forEach(k => allSet.add(pGates[k].gate));
    Object.keys(dGates).forEach(k => allSet.add(dGates[k].gate));
    
    const gSet = new Set(allSet);
    const chs = typeModule.getChannels(gSet) || [];
    const ctrSet = typeModule.getDefinedCenters(chs) || new Set();
    const type = typeModule.getType(chs, ctrSet, gSet) || 'Reflector';
    
    const profile = `${pGates['Sun'].line}/${dGates['Sun'].line}`;
    const defCtrs = Array.from(ctrSet);
    
    return {
      label, type, profile,
      pSun: `${pGates['Sun'].gate}.${pGates['Sun'].line} (${pGates['Sun'].longitude.toFixed(6)}°)`,
      dSun: `${dGates['Sun'].gate}.${dGates['Sun'].line} (${dGates['Sun'].longitude.toFixed(6)}°)`,
      activatedGates: Array.from(allSet).sort((a,b)=>a-b),
      definedCenters: defCtrs,
    };
  }
  
  const mos = computeHD(jd, jdDesign, c.SEFLG_MOSEPH, 'Moshier (WASM)');
  const swi = computeHD(jd, jdDesign, c.SEFLG_SWIEPH, 'SWIEPH+DE431');
  const swi2 = computeHD(jd, jdDesign, c.SEFLG_SWIEPH | c.SEFLG_SPEED, 'SWIEPH+DE431+SPEED');
  
  console.log(`\n=== ${name} (${y}-${m}-${d} ${h}:00 ${tz}) ===`);
  console.log(`  JD: ${jd}, Design JD: ${jdDesign}`);
  console.log(`  Moshier:         ${mos.type} ${mos.profile}`);
  console.log(`    Personal Sun: ${mos.pSun}`);
  console.log(`    Design Sun:   ${mos.dSun}`);
  console.log(`  SWIEPH+DE431:    ${swi.type} ${swi.profile}`);
  console.log(`    Personal Sun: ${swi.pSun}`);
  console.log(`    Design Sun:   ${swi.dSun}`);
  console.log(`  SWIEPH+DE431+SPD:${swi2.type} ${swi2.profile}`);
  
  // Compare activated gates
  const mosGates = mos.activatedGates.join(',');
  const swiGates = swi.activatedGates.join(',');
  if (mosGates !== swiGates) {
    console.log(`  ⚠ Gate diff! Moshier=[${mosGates}] SWIEPH=[${swiGates}]`);
  } else {
    console.log(`  Gates: [${mosGates}]`);
  }
}

// All 5 family members
calcPerson(1982, 1, 27, 2, 'Asia/Shanghai', '王献科');
calcPerson(1982, 10, 28, 12, 'Asia/Shanghai', '张晓霞');
calcPerson(2010, 12, 4, 19, 'Asia/Shanghai', '王一斐');
calcPerson(2017, 7, 23, 10, 'Asia/Shanghai', '王一如');
calcPerson(2015, 6, 4, 19, 'America/Los_Angeles', '王一然');
