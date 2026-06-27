// Compare Moshier vs SWIEPH for all planets at a given date
const sw = require('sweph');
const path = require('path');

sw.set_ephe_path(path.resolve(__dirname, 'ephemeris'));
const c = sw.constants;

const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const PIDS = [c.SE_SUN, c.SE_MOON, c.SE_MERCURY, c.SE_VENUS, c.SE_MARS, c.SE_JUPITER, c.SE_SATURN, c.SE_URANUS, c.SE_NEPTUNE, c.SE_PLUTO];

function calcHD(jd, flag) {
  const PN = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  const { getActivation } = require('@it-healer/human-design-calculator/src/activation');
  const typeModule = require('@it-healer/human-design-calculator/src/type');
  
  const gates = {};
  PIDS.forEach((pid, i) => {
    const r = sw.calc_ut(jd, pid, flag);
    if (r.error) throw new Error(r.error);
    const act = getActivation(r.data[0]);
    gates[PLANETS[i]] = {gate: act.gate, line: act.line, longitude: r.data[0]};
  });
  gates['Earth'] = {gate: ((gates['Sun'].gate + 31) % 64) + 1, line: gates['Sun'].line};
  
  const allSet = new Set();
  Object.keys(gates).forEach(k => allSet.add(gates[k].gate));
  
  const gSet = new Set(allSet);
  const chs = typeModule.getChannels(gSet) || [];
  const ctrSet = typeModule.getDefinedCenters(chs) || new Set();
  const type = typeModule.getType(chs, ctrSet, gSet) || 'Reflector';
  
  // Personal gates (self) - Sun, Earth, North Node, South Node
  // Design gates (unconscious) - from 88 days before
  // Profile: Conscious Sun line / Unconscious Sun line
  
  return {
    type,
    profile: `${gates['Sun'].line}/${1}`,  // simplified - just sun line for now
    sunGate: gates['Sun'].gate,
    sunLine: gates['Sun'].line,
    sunLongitude: gates['Sun'].longitude,
  };
}

function calcFullHD(jd, jdDesign, flag) {
  const { getActivation } = require('@it-healer/human-design-calculator/src/activation');
  const typeModule = require('@it-healer/human-design-calculator/src/type');

  // Personal (conscious) gates
  const pGates = {};
  PIDS.forEach((pid, i) => {
    const r = sw.calc_ut(jd, pid, flag);
    if (r.error) throw new Error(r.error);
    const act = getActivation(r.data[0]);
    pGates[PLANETS[i]] = {gate: act.gate, line: act.line, longitude: r.data[0]};
  });
  pGates['Earth'] = {gate: ((pGates['Sun'].gate + 31) % 64) + 1, line: pGates['Sun'].line};
  
  // Design (unconscious) gates - 88 days before birth
  const dGates = {};
  PIDS.forEach((pid, i) => {
    const r = sw.calc_ut(jdDesign, pid, flag);
    if (r.error) throw new Error(r.error);
    const act = getActivation(r.data[0]);
    dGates[PLANETS[i]] = {gate: act.gate, line: act.line, longitude: r.data[0]};
  });
  dGates['Earth'] = {gate: ((dGates['Sun'].gate + 31) % 64) + 1, line: dGates['Sun'].line};
  
  const allSet = new Set();
  Object.keys(pGates).forEach(k => allSet.add(pGates[k].gate));
  Object.keys(dGates).forEach(k => allSet.add(dGates[k].gate));
  
  const gSet = new Set(allSet);
  const chs = typeModule.getChannels(gSet) || [];
  const ctrSet = typeModule.getDefinedCenters(chs) || new Set();
  const type = typeModule.getType(chs, ctrSet, gSet) || 'Reflector';
  
  const profile = `${pGates['Sun'].line}/${dGates['Sun'].line}`;
  
  return {
    type,
    profile,
    personality: pGates,
    design: dGates,
    activatedGates: Array.from(allSet).sort((a,b)=>a-b),
    channels: chs,
    definedCenters: Array.from(ctrSet),
  };
}

// Test a single date
const jdTest = sw.julday(1982, 1, 27, 2 - 8, c.SE_GREG_CAL);
const jdDesignTest = jdTest - 88;

console.log('=== 王献科 (1982-01-27 02:00 山东) ===');
console.log('JD:', jdTest, 'Design JD:', jdDesignTest);

console.log('\n--- Moshier (flag=4) ---');
const m = calcFullHD(jdTest, jdDesignTest, c.SEFLG_MOSEPH);
console.log('Type:', m.type, 'Profile:', m.profile);

console.log('\n--- SWIEPH + DE431 .se1 (flag=2) ---');
const s = calcFullHD(jdTest, jdDesignTest, c.SEFLG_SWIEPH);
console.log('Type:', s.type, 'Profile:', s.profile);

// Compare planet positions
console.log('\n--- Position Differences (Moshier vs SWIEPH) ---');
PLANETS.forEach((name, i) => {
  const diff = Math.abs(m.personality[name].longitude - s.personality[name].longitude);
  const diffArcsec = diff * 3600;
  if (diffArcsec > 0.001) {
    console.log(`${name}: diff=${diffArcsec.toFixed(6)} arcsec, mosGate=${m.personality[name].gate}/${m.personality[name].line}, swiGate=${s.personality[name].gate}/${s.personality[name].line}`);
  }
});
