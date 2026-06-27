#!/usr/bin/env node
/**
 * Gate-level analysis: Compare v6 engine (Moshier WASM) vs SWIEPH (DE431)
 * for all 5 family members. Includes planet-by-planet gate data.
 */

// ---- v6 engine ----
const swWasm = require('@fusionstrings/swisseph-wasm');
const activation = require('@it-healer/human-design-calculator/src/activation');
const typeModule = require('@it-healer/human-design-calculator/src/type');

// ---- Native sweph ----
const path = require('path');
const sw = require('sweph');
sw.set_ephe_path(path.resolve(__dirname, 'ephemeris'));
const c = sw.constants;

const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const PIDS_NAT = [c.SE_SUN, c.SE_MOON, c.SE_MERCURY, c.SE_VENUS, c.SE_MARS, c.SE_JUPITER, c.SE_SATURN, c.SE_URANUS, c.SE_NEPTUNE, c.SE_PLUTO];

const TZ_OFFSET = {
  'America/Los_Angeles':-7,'America/New_York':-4,'Europe/London':0,
  'Europe/Paris':1,'Australia/Sydney':10,'Asia/Tokyo':9,'Asia/Shanghai':8,
};

// Gate boundary lookup: each gate spans ~5.625° (360/64)
// Gate N covers [(N-1)*5.625, N*5.625) degrees in the Rave Cosmology
// But @it-healer uses a specific mapping - let's use getActivation to determine
// For boundary analysis, we check how close a longitude is to the next/previous gate

function getGateBoundaries(gate) {
  // Each gate spans 5.625° starting from 0°
  const start = (gate - 1) * 5.625;
  const end = gate * 5.625;
  return { start, end };
}

function distanceToBoundary(longitude, gate) {
  // Normalize longitude to 0-360
  const lon = ((longitude % 360) + 360) % 360;
  const { start, end } = getGateBoundaries(gate);
  return {
    distToStart: Math.abs(lon - start),
    distToEnd: Math.abs(lon - end),
    // Also check wrap-around
    distToStartWrapped: Math.abs(lon - (start < 0 ? start + 360 : start)),
    distToEndWrapped: Math.abs(lon - (end > 360 ? end - 360 : end)),
  };
}

function toUTC(y, m, d, h, tz) {
  const offset = TZ_OFFSET[tz] || 8;
  let utcH = h - offset;
  let utcY = y, utcM = m, utcD = d, utcHr = utcH;
  if (utcH < 0) { utcHr += 24; utcD -= 1;
    if (utcD < 1) { utcM -= 1; if (utcM < 1) { utcM = 12; utcY -= 1; }
      const dim = [31,28,31,30,31,30,31,31,30,31,30,31]; utcD = dim[utcM-1]; } }
  if (utcH >= 24) { utcHr -= 24; utcD += 1;
    if (utcD > 31) { utcM += 1; utcD = 1; if (utcM > 12) { utcM = 1; utcY += 1; } } }
  return {y: utcY, m: utcM, d: utcD, h: utcHr};
}

function calcPerson(y, m, d, h, tz, name) {
  const utc = toUTC(y, m, d, h, tz);
  
  // WASM engine JD
  const jdWasm = swWasm.swe_julday(utc.y, utc.m, utc.d, utc.h, 1);
  // Native sweph JD
  const jdNat = sw.julday(utc.y, utc.m, utc.d, utc.h, c.SE_GREG_CAL);
  
  const jdD = jdWasm - 88; // Design date = birth - 88 days
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`  ${name} (${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} ${h}:00 ${tz})`);
  console.log(`  UTC: ${utc.y}-${String(utc.m).padStart(2,'0')}-${String(utc.d).padStart(2,'0')} ${utc.h}:00`);
  console.log(`  WASM JD: ${jdWasm.toFixed(6)},  Native JD: ${jdNat.toFixed(6)}`);
  console.log(`${'='.repeat(80)}`);

  function getGatesWasm(jd) {
    const gates = {};
    [0,1,2,3,4,5,6,7,8,9].forEach(function(pid, i) {
      const r = swWasm.swe_calc_ut(jd, pid, 4);
      const act = activation.getActivation(r.longitude);
      gates[PLANETS[i]] = {gate: act.gate, line: act.line, longitude: r.longitude};
    });
    gates['Earth'] = {gate: ((gates['Sun'].gate + 31) % 64) + 1, line: gates['Sun'].line,
      longitude: ((gates['Sun'].longitude + 180) % 360)};
    return gates;
  }

  function getGatesNat(jd) {
    const gates = {};
    PIDS_NAT.forEach(function(pid, i) {
      const r = sw.calc_ut(jd, pid, c.SEFLG_SWIEPH | c.SEFLG_SPEED);
      const act = activation.getActivation(r.data[0]);
      gates[PLANETS[i]] = {gate: act.gate, line: act.line, longitude: r.data[0]};
    });
    gates['Earth'] = {gate: ((gates['Sun'].gate + 31) % 64) + 1, line: gates['Sun'].line,
      longitude: ((gates['Sun'].longitude + 180) % 360)};
    return gates;
  }

  // Personal gates (birth moment)
  const pWasm = getGatesWasm(jdWasm);
  const pNat  = getGatesNat(jdNat);
  
  // Design gates (88 days before birth)
  const dWasm = getGatesWasm(jdD);
  const dNat = getGatesNat(jdNat - 88);

  // Collect all gates
  const allWasm = new Set();
  Object.keys(pWasm).forEach(k => allWasm.add(pWasm[k].gate));
  Object.keys(dWasm).forEach(k => allWasm.add(dWasm[k].gate));
  
  const allNat = new Set();
  Object.keys(pNat).forEach(k => allNat.add(pNat[k].gate));
  Object.keys(dNat).forEach(k => allNat.add(dNat[k].gate));

  // Compute HD from WASM data
  const gSetW = new Set([...allWasm]);
  const chsW = typeModule.getChannels(gSetW) || [];
  const ctrW = typeModule.getDefinedCenters(chsW) || new Set();
  const typeW = typeModule.getType(chsW, ctrW, gSetW) || 'Reflector';
  const profileW = `${pWasm['Sun'].line}/${dWasm['Sun'].line}`;

  // Compute HD from native data
  const gSetN = new Set([...allNat]);
  const chsN = typeModule.getChannels(gSetN) || [];
  const ctrN = typeModule.getDefinedCenters(chsN) || new Set();
  const typeN = typeModule.getType(chsN, ctrN, gSetN) || 'Reflector';
  const profileN = `${pNat['Sun'].line}/${dNat['Sun'].line}`;

  console.log(`\n  结果对比:`);
  console.log(`  引擎(v6/Moshier): ${typeW} ${profileW}`);
  console.log(`    Defined Centers: [${[...ctrW].join(', ')}]`);
  console.log(`    Channels: [${chsW.join(', ')}]`);
  console.log(`  SWIEPH+DE431:      ${typeN} ${profileN}`);
  console.log(`    Defined Centers: [${[...ctrN].join(', ')}]`);
  console.log(`    Channels: [${chsN.join(', ')}]`);

  console.log(`\n  ┌─────────────────────────────────────────────────────────────────────────────┐`);
  console.log(`  │ 行星        │ v6/Moshier        │ SWIEPH+DE431      │ 差异(arcsec) │ 边界距离 │`);
  console.log(`  ├─────────────────────────────────────────────────────────────────────────────┤`);

  // Personal gates comparison
  const allBodies = [...PLANETS, 'Earth'];
  let hasBoundaryIssues = false;
  
  allBodies.forEach(body => {
    if (body === 'Earth') {
      // Earth is derived from Sun, always matches
      const w = pWasm['Sun'];
      const n = pNat['Sun'];
      const eGate = ((w.gate + 31) % 64) + 1;
      console.log(`  │ Earth(派生) │ Gate ${String(eGate).padEnd(5)}     │ Gate ${String(eGate).padEnd(5)}     │     0.00      │   -   │`);
      return;
    }
    
    const w = pWasm[body];
    const n = pNat[body];
    if (!w || !n) return;
    
    let diffArcsec = Math.abs(w.longitude - n.longitude) * 3600;
    if (diffArcsec > 180*3600) diffArcsec = 360*3600 - diffArcsec;
    
    // Calculate distance to gate boundaries
    const bd = distanceToBoundary(w.longitude, w.gate);
    const minDistDeg = Math.min(
      isFinite(bd.distToStart) ? bd.distToStart : Infinity,
      isFinite(bd.distToEnd) ? bd.distToEnd : Infinity
    );
    const minDistArcmin = minDistDeg * 60;
    
    const boundaryFlag = minDistDeg < 0.1 ? ' ⚠ BOUNDARY' : '';
    if (minDistDeg < 0.1) hasBoundaryIssues = true;
    
    const sameGate = w.gate === n.gate;
    const sameLine = w.line === n.line;
    const gateFlag = sameGate ? ' ' : '⚠';
    const lineFlag = sameLine ? ' ' : '⚠';
    
    console.log(`  │ ${body.padEnd(11)}│ Gate${gateFlag} ${String(w.gate).padEnd(2)}.${w.line} ${w.longitude.toFixed(4).padEnd(8)} │ Gate${gateFlag} ${String(n.gate).padEnd(2)}.${n.line} ${n.longitude.toFixed(4).padEnd(8)} │ ${diffArcsec.toFixed(4).padEnd(10)} │ ${minDistArcmin.toFixed(2)}'${boundaryFlag} │`);
  });

  console.log(`  └─────────────────────────────────────────────────────────────────────────────┘`);

  // Design gates
  console.log(`\n  ── Design Gates (88天前) ──`);
  console.log(`  ┌─────────────────────────────────────────────────────────────────────────────┐`);
  console.log(`  │ 行星        │ v6/Moshier        │ SWIEPH+DE431      │ 差异(arcsec) │ 边界距离 │`);
  console.log(`  ├─────────────────────────────────────────────────────────────────────────────┤`);

  allBodies.forEach(body => {
    if (body === 'Earth') {
      const w = dWasm['Sun'];
      const n = dNat['Sun'];
      const eGate = ((w.gate + 31) % 64) + 1;
      console.log(`  │ Earth(派生) │ Gate ${String(eGate).padEnd(5)}     │ Gate ${String(eGate).padEnd(5)}     │     0.00      │   -   │`);
      return;
    }
    
    const w = dWasm[body];
    const n = dNat[body];
    if (!w || !n) return;
    
    let diffArcsec = Math.abs(w.longitude - n.longitude) * 3600;
    if (diffArcsec > 180*3600) diffArcsec = 360*3600 - diffArcsec;
    
    const bd = distanceToBoundary(w.longitude, w.gate);
    const minDistDeg = Math.min(
      isFinite(bd.distToStart) ? bd.distToStart : Infinity,
      isFinite(bd.distToEnd) ? bd.distToEnd : Infinity
    );
    const minDistArcmin = minDistDeg * 60;
    
    const boundaryFlag = minDistDeg < 0.1 ? ' ⚠ BOUNDARY' : '';
    if (minDistDeg < 0.1) hasBoundaryIssues = true;
    
    const sameGate = w.gate === n.gate;
    const sameLine = w.line === n.line;
    const gateFlag = sameGate ? ' ' : '⚠';
    
    console.log(`  │ ${body.padEnd(11)}│ Gate${gateFlag} ${String(w.gate).padEnd(2)}.${w.line} ${w.longitude.toFixed(4).padEnd(8)} │ Gate${gateFlag} ${String(n.gate).padEnd(2)}.${n.line} ${n.longitude.toFixed(4).padEnd(8)} │ ${diffArcsec.toFixed(4).padEnd(10)} │ ${minDistArcmin.toFixed(2)}'${boundaryFlag} │`);
  });

  console.log(`  └─────────────────────────────────────────────────────────────────────────────┘`);

  // Gate differences between engines
  const wasmGatesSorted = [...allWasm].sort((a,b)=>a-b);
  const natGatesSorted = [...allNat].sort((a,b)=>a-b);
  
  const onlyInWasm = wasmGatesSorted.filter(g => !allNat.has(g));
  const onlyInNat = natGatesSorted.filter(g => !allWasm.has(g));
  
  if (onlyInWasm.length > 0 || onlyInNat.length > 0) {
    console.log(`\n  ⚠⚠⚠ 闸门差异! ⚠⚠⚠`);
    if (onlyInWasm.length > 0) console.log(`  仅在v6引擎中: [${onlyInWasm.join(', ')}]`);
    if (onlyInNat.length > 0) console.log(`  仅在SWIEPH中:  [${onlyInNat.join(', ')}]`);
  } else {
    console.log(`\n  ✅ 闸门集完全一致`);
    console.log(`  激活闸门(${wasmGatesSorted.length}): [${wasmGatesSorted.join(', ')}]`);
  }

  // Check if any planet is near boundary in both engines
  console.log(`\n  ── 边界分析 (距离闸门边界<0.1°视为临界) ──`);
  allBodies.forEach(body => {
    if (body === 'Earth') return;
    const w = pWasm[body];
    const n = pNat[body];
    if (!w || !n) return;
    
    // Check WASM position vs boundaries
    const bdW = distanceToBoundary(w.longitude, w.gate);
    const minW = Math.min(bdW.distToStart, bdW.distToEnd);
    
    // Check NAT position vs boundaries  
    const bdN = distanceToBoundary(n.longitude, n.gate);
    const minN = Math.min(bdN.distToStart, bdN.distToEnd);
    
    if (minW < 0.2 || minN < 0.2) {
      console.log(`  ${body}(人格): v6距边界${(minW*60).toFixed(2)}', SWIEPH距边界${(minN*60).toFixed(2)}', 差异${(Math.abs(w.longitude-n.longitude)*3600).toFixed(4)}"`);
    }
  });

  allBodies.forEach(body => {
    if (body === 'Earth') return;
    const w = dWasm[body];
    const n = dNat[body];
    if (!w || !n) return;
    
    const bdW = distanceToBoundary(w.longitude, w.gate);
    const minW = Math.min(bdW.distToStart, bdW.distToEnd);
    const bdN = distanceToBoundary(n.longitude, n.gate);
    const minN = Math.min(bdN.distToStart, bdN.distToEnd);
    
    if (minW < 0.2 || minN < 0.2) {
      console.log(`  ${body}(设计): v6距边界${(minW*60).toFixed(2)}', SWIEPH距边界${(minN*60).toFixed(2)}', 差异${(Math.abs(w.longitude-n.longitude)*3600).toFixed(4)}"`);
    }
  });
}

// All 5 people
calcPerson(1982, 1, 27, 2, 'Asia/Shanghai', '王献科');
calcPerson(1982, 10, 28, 12, 'Asia/Shanghai', '张晓霞');
calcPerson(2010, 12, 4, 19, 'Asia/Shanghai', '王一斐');
calcPerson(2017, 7, 23, 10, 'Asia/Shanghai', '王一如');
calcPerson(2015, 6, 4, 19, 'America/Los_Angeles', '王一然');
