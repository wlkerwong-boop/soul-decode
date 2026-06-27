#!/usr/bin/env node
// Three-engine comparison
const sweph = require('sweph');
const swWasm = require('@fusionstrings/swisseph-wasm');
const activation = require('@it-healer/human-design-calculator/src/activation');
const typeModule = require('@it-healer/human-design-calculator/src/type');

const PEOPLE = [
  ['王献科', 1982, 1, 27, 2, 'Asia/Shanghai'],
  ['张晓霞', 1982, 10, 28, 12, 'Asia/Shanghai'],
  ['王一斐', 2010, 12, 4, 19, 'Asia/Shanghai'],
  ['王一如', 2017, 7, 23, 10, 'Asia/Shanghai'],
  ['王一然', 2015, 6, 4, 19, 'America/Los_Angeles'],
];

const PN = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const OFF = {'America/Los_Angeles':-7,'America/New_York':-4,'Europe/London':0,'Europe/Paris':1,'Australia/Sydney':10,'Asia/Tokyo':9,'Asia/Shanghai':8};

function getJD(y, m, d, h, tz) {
  var uh = h - (OFF[tz] || 8);
  var u = new Date(Date.UTC(y, m-1, d, uh, 0, 0));
  return {
    nat: sweph.julday(u.getUTCFullYear(), u.getUTCMonth()+1, u.getUTCDate(), u.getUTCHours()/24.0, 1),
    wasm: swWasm.swe_julday(u.getUTCFullYear(), u.getUTCMonth()+1, u.getUTCDate(), u.getUTCHours()/24.0, 1)
  };
}

function cGates(jd, eng) {
  var gates = {};
  var ids = [0,1,2,3,4,5,6,7,8,9];
  ids.forEach(function(pid, i) {
    var lon;
    if (eng === 'nat') {
      var r = sweph.calc_ut(jd, pid, 4);
      lon = r.data[0];
    } else {
      var r = swWasm.swe_calc_ut(jd, pid, 4);
      lon = r.longitude;
    }
    var act = activation.getActivation(lon);
    gates[PN[i]] = {gate: act.gate, line: act.line};
  });
  gates['Earth'] = {gate: ((gates['Sun'].gate + 31) % 64) + 1, line: gates['Sun'].line};
  return gates;
}

PEOPLE.forEach(function(p) {
  var name = p[0], y = p[1], m = p[2], d = p[3], h = p[4], tz = p[5];
  console.log('\n=== ' + name + ': ' + y + '-' + m + '-' + d + ' ' + h + ':00 ' + tz + ' ===');
  var jds = getJD(y, m, d, h, tz);
  console.log('JD diff: ' + Math.abs(jds.nat - jds.wasm).toExponential(3));
  
  ['nat', 'wasm'].forEach(function(eng) {
    var jd = eng === 'nat' ? jds.nat : jds.wasm;
    var pG = cGates(jd, eng);
    var dG = cGates(jd - 88, eng);
    var allG = new Set();
    Object.keys(pG).forEach(function(k) { allG.add(pG[k].gate); });
    Object.keys(dG).forEach(function(k) { allG.add(dG[k].gate); });
    var gSet = new Set([].concat(Array.from(allG)));
    var chs = typeModule.getChannels(gSet) || [];
    var ctr = typeModule.getDefinedCenters(chs) || new Set();
    var typ = typeModule.getType(chs, ctr, gSet) || '?';
    var pL = pG['Sun'].line;
    var dL = dG['Sun'].line;
    console.log('  ' + eng + ': ' + typ + ' ' + pL + '/' + dL + ' ctr=[' + Array.from(ctr).join(',') + '] ch=[' + chs.join(',') + ']');
    // Show just diff gates
    var pStr = Object.keys(pG).map(function(k) { return pG[k].gate; }).join(',');
    var dStr = Object.keys(dG).map(function(k) { return dG[k].gate; }).join(',');
    console.log('    pers: ' + pStr);
    console.log('    des:  ' + dStr);
  });
});
