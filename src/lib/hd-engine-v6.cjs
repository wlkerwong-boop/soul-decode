/**
 * HD引擎v6 — 运行时精确计算版
 * 使用 @fusionstrings/swisseph-wasm (纯WASM, 无C++依赖, Vercel兼容)
 * + @it-healer/human-design-calculator 做闸门映射(基于区分的科学GATE_ORDER)
 */

const sw = require('@fusionstrings/swisseph-wasm');
const activation = require('@it-healer/human-design-calculator/src/activation');
const typeModule = require('@it-healer/human-design-calculator/src/type');

const TZ_OFFSET = {
  'America/Los_Angeles':-7,'America/New_York':-4,'Europe/London':0,
  'Europe/Paris':1,'Australia/Sydney':10,'Asia/Tokyo':9,'Asia/Shanghai':8,
};

const PN = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const TYPE_STRAT = {'Generator':'等待回应','Manifesting Generator':'等待回应并快速启动','Projector':'等待被邀请','Manifestor':'告知他人','Reflector':'等待28天月亮周期'};
const SIG = {'Generator':'满足','Manifesting Generator':'满足','Projector':'成功','Manifestor':'平静','Reflector':'惊喜'};
const NS = {'Generator':'挫败','Manifesting Generator':'挫败','Projector':'苦涩','Manifestor':'愤怒','Reflector':'失望'};
const ALL_CENTERS = ['Head','Ajna','Throat','G','Ego','Sacral','Solar Plexus','Spleen','Root'];

function calc(y, m, d, h, tz) {
  var offset = TZ_OFFSET[tz] || 8;
  var utcH = h - offset;
  var utcY = y, utcM = m, utcD = d;
  if (utcH < 0) { utcH += 24; utcD -= 1;
    if (utcD < 1) { utcM -= 1; if (utcM < 1) { utcM = 12; utcY -= 1; }
      var dim = [31,28,31,30,31,30,31,31,30,31,30,31]; utcD = dim[utcM-1]; } }
  if (utcH >= 24) { utcH -= 24; utcD += 1;
    if (utcD > 31) { utcM += 1; utcD = 1; if (utcM > 12) { utcM = 1; utcY += 1; } } }
  var jd = sw.swe_julday(utcY, utcM, utcD, utcH, 1);

  function getGates(jd) {
    var gates = {};
    [0,1,2,3,4,5,6,7,8,9].forEach(function(pid, i) {
      var r = sw.swe_calc_ut(jd, pid, 4);
      var act = activation.getActivation(r.longitude);
      gates[PN[i]] = {gate: act.gate, line: act.line};
    });
    gates['Earth'] = {gate: ((gates['Sun'].gate + 31) % 64) + 1, line: gates['Sun'].line};
    return gates;
  }

  var pG = getGates(jd);
  var dG = getGates(jd - 88);

  var allSet = new Set();
  Object.keys(pG).forEach(function(k) { allSet.add(pG[k].gate); });
  Object.keys(dG).forEach(function(k) { allSet.add(dG[k].gate); });

  var gSet = new Set(Array.from(allSet));
  var chs = typeModule.getChannels(gSet) || [];
  var ctrSet = typeModule.getDefinedCenters(chs) || new Set();
  var type = typeModule.getType(chs, ctrSet, gSet) || 'Reflector';

  var ctrDef = {};
  ALL_CENTERS.forEach(function(c) { ctrDef[c] = ctrSet.has(c); });
  var defCtrs = ALL_CENTERS.filter(function(c) { return ctrSet.has(c); });
  var undefCtrs = ALL_CENTERS.filter(function(c) { return !ctrSet.has(c); });
  var profile = pG['Sun'].line + '/' + dG['Sun'].line;
  var cc = defCtrs.length;
  var def = cc >= 5 ? 'Quadruple Split' : cc === 4 ? 'Triple Split' : cc === 3 ? 'Split' : cc === 0 ? 'None' : 'Single';

  return {
    type: type,
    strategy: TYPE_STRAT[type] || '—',
    authority: getAuthority(defCtrs),
    profile: profile,
    definition: def,
    incarnationCross: '右角度交叉',
    signature: SIG[type] || '—',
    notSelfTheme: NS[type] || '—',
    definedCenters: defCtrs,
    undefinedCenters: undefCtrs,
    centerDefinition: ctrDef,
    activatedGates: Array.from(allSet).sort(function(a,b){return a-b;}),
    channels: chs,
    circuitries: [],
  };
}

function getAuthority(ctrs) {
  if (ctrs.indexOf('Solar Plexus') >= 0) return '情绪型权威（等待情绪清明）';
  if (ctrs.indexOf('Sacral') >= 0) return '荐骨权威（身体回应）';
  if (ctrs.indexOf('Spleen') >= 0) return '直觉型权威（当下即知）';
  if (ctrs.indexOf('Ego') >= 0 && ctrs.indexOf('G') >= 0 && ctrs.indexOf('Throat') >= 0) return '自我投射权威';
  if (ctrs.length === 0) return '月亮周期权威（Lunar）';
  return '外在权威';
}

module.exports = {
  calculateBodygraph: function(dateStr, timeStr, tz, lat, lon) {
    var parts = dateStr.split(/[-T]/);
    var timeParts = timeStr.split(':');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var d = parseInt(parts[2], 10);
    var h = timeParts.length >= 1 ? parseInt(timeParts[0], 10) : 12;
    return calc(y, m, d, h, tz);
  }
};
