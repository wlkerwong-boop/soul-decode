/**
 * HD引擎v6.4 — 88°太阳弧精确设计日计算 + 分钟级精度 + Intl 时区换算（含历史夏令时）
 */
const sw = require('@fusionstrings/swisseph-wasm');
const activation = require('@it-healer/human-design-calculator/src/activation');
const typeModule = require('@it-healer/human-design-calculator/src/type');

const PN = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','NorthNode'];
const PI = [0,1,2,3,4,5,6,7,8,9,11];
const SIG = {'Generator':'满足','Manifesting Generator':'满足','Projector':'成功','Manifestor':'平静','Reflector':'惊喜'};
const NS = {'Generator':'挫败','Manifesting Generator':'挫败','Projector':'苦涩','Manifestor':'愤怒','Reflector':'失望'};
const AC = ['Head','Ajna','Throat','G','Ego','Sacral','Solar Plexus','Spleen','Root'];

// 当地时间 → UTC Date。用 Node 内置 Intl 求目标时刻的时区偏移（含历史夏令时），
// 替换原 TZ_OFFSET 固定表（固定表对历史日期会错，如 LA 冬令时为 -8 而非 -7）。
function localToUtc(y, m, d, h, mi, tz) {
  var zone = tz || 'Asia/Shanghai';
  var guessUtc = Date.UTC(y, m - 1, d, h, mi || 0);
  try {
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
    });
    var parts = {};
    fmt.formatToParts(new Date(guessUtc)).forEach(function (p) { parts[p.type] = parseInt(p.value, 10); });
    var asIfUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour % 24, parts.minute, parts.second);
    return new Date(guessUtc - (asIfUtc - guessUtc));
  } catch (e) {
    // 非法时区名兜底北京时间（UTC+8，无夏令时）
    return new Date(guessUtc - 8 * 3600000);
  }
}

function sunLonAt(jd) { return sw.swe_calc_ut(jd, 0, 4).longitude; }

function findDesignJD(pJd) {
  var pLon = sunLonAt(pJd);
  var target = (pLon - 88 + 360) % 360;
  var guess = pJd - 88; // 近似
  // 二分查找：在guess±3天范围内找太阳经度=target±0.5°的时刻
  var lo = guess - 5, hi = guess + 5;
  for (var iter = 0; iter < 50; iter++) {
    var mid = (lo + hi) / 2;
    var mLon = sunLonAt(mid);
    var diff = ((mLon - target + 540) % 360) - 180;
    if (Math.abs(diff) < 0.0001) break;
    if (diff > 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

function getGates(jd) {
  var gates = {};
  PI.forEach(function(pid, i) {
    try {
      var r = sw.swe_calc_ut(jd, pid, 4);
      var act = activation.getActivation(r.longitude);
      gates[PN[i]] = {gate: act.gate, line: act.line};
    } catch(e) { gates[PN[i]] = {gate: 1, line: 1}; }
  });
  gates['Earth'] = {gate: ((gates['Sun'].gate + 31) % 64) + 1, line: gates['Sun'].line};
  return gates;
}

function calc(y, m, d, h, mi, tz) {
  var utc = localToUtc(y, m, d, h, mi, tz);
  // 浮点小时：分钟参与行星位置计算（分钟级精度）
  var utcH = utc.getUTCHours() + utc.getUTCMinutes() / 60 + utc.getUTCSeconds() / 3600;
  var jd = sw.swe_julday(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), utcH, 1);
  
  var pG = getGates(jd);
  var designJd = findDesignJD(jd);
  var dG = getGates(designJd);

  var allSet = new Set();
  Object.keys(pG).forEach(function(k) { allSet.add(pG[k].gate); });
  Object.keys(dG).forEach(function(k) { allSet.add(dG[k].gate); });

  var gSet = new Set(Array.from(allSet));
  var chs = typeModule.getChannels(gSet) || [];
  var ctrSet = typeModule.getDefinedCenters(chs) || new Set();
  
  // Jovian Archive规则: 如果有2个以上闸门在同一个中心,该中心也算定义
  var GATE_CENTER_MAP = {
    1:'G',2:'G',3:'Sacral',4:'Ajna',5:'Sacral',6:'SolarPlexus',7:'G',8:'Throat',9:'Sacral',
    10:'G',11:'Ajna',12:'Throat',13:'G',14:'Sacral',15:'G',16:'Throat',17:'Ajna',18:'Spleen',
    19:'Root',20:'Throat',21:'Ego',22:'SolarPlexus',23:'Throat',24:'Ajna',25:'G',26:'Ego',
    27:'Sacral',28:'Spleen',29:'Sacral',30:'SolarPlexus',31:'Throat',32:'Spleen',33:'Throat',
    34:'Sacral',35:'Throat',36:'SolarPlexus',37:'SolarPlexus',38:'Root',39:'Root',40:'Ego',
    41:'Root',42:'Sacral',43:'Ajna',44:'Spleen',45:'Throat',46:'G',47:'Ajna',48:'Spleen',
    49:'SolarPlexus',50:'Spleen',51:'Ego',52:'Root',53:'Root',54:'Root',55:'SolarPlexus',
    56:'Throat',57:'Spleen',58:'Root',59:'Sacral',60:'Root',61:'Head',62:'Throat',63:'Head',64:'Head',
  };
  var gateCounts = {};
  allSet.forEach(function(g) {
    var c = GATE_CENTER_MAP[g];
    if (c) { gateCounts[c] = (gateCounts[c] || 0) + 1; }
  });
  Object.keys(gateCounts).forEach(function(c) {
    if (gateCounts[c] >= 3) { ctrSet.add(c); }
  });
  
  var type = typeModule.getType(chs, ctrSet, gSet) || 'Reflector';

  var defCtrs = AC.filter(function(c) { return ctrSet.has(c); });
  var profile = pG['Sun'].line + '/' + dG['Sun'].line;
  var cc = defCtrs.length;

  return {
    type: type,
    strategy: type==='Generator'?'等待回应':type==='Manifesting Generator'?'等待回应并告知':type==='Projector'?'等待被邀请':type==='Manifestor'?'告知他人':'等待28天月亮周期',
    authority: getAuthority(defCtrs, cc),
    profile: profile,
    definition: cc>=5?'Quadruple Split':cc===4?'Triple Split':cc===3?'Split':cc===0?'None':'Single',
    incarnationCross: '—',
    signature: SIG[type] || '—',
    notSelfTheme: NS[type] || '—',
    definedCenters: defCtrs,
    undefinedCenters: AC.filter(function(c){return !ctrSet.has(c);}),
    centerDefinition: (function(){var o={};AC.forEach(function(c){o[c]=ctrSet.has(c);});return o;})(),
    activatedGates: Array.from(allSet).sort(function(a,b){return a-b;}),
    channels: chs,
    circuitries: [],
  };
}

function getAuthority(dc, cnt) {
  if (dc.indexOf('Solar Plexus')>=0) return '情绪型权威';
  if (dc.indexOf('Sacral')>=0) return '荐骨权威';
  if (dc.indexOf('Spleen')>=0) return '直觉型权威';
  if (dc.indexOf('Ego')>=0&&dc.indexOf('G')>=0&&dc.indexOf('Throat')>=0) return '自我投射权威';
  if (cnt===0) return '月亮周期权威（Lunar）';
  return '外在权威';
}

module.exports = {
  calculateBodygraph: function(ds, ts, tz, lat, lon) {
    var p=ds.split(/[-T]/), tp=ts.split(':');
    var h = tp.length>=1?parseInt(tp[0],10):12;
    var mi = tp.length>=2?parseInt(tp[1],10)||0:0;
    return calc(parseInt(p[0],10),parseInt(p[1],10),parseInt(p[2],10),h,mi,tz);
  },
  // 仅供测试：当地时间→UTC 换算（Intl，含历史夏令时）
  _localToUtc: localToUtc,
};
