/**
 * HD引擎v5 — 全内联版（零外部依赖，Vercel兼容）
 * 预计算星历表 + 内联所有HD计算逻辑
 */
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');

// ── 1. 加载预计算星历表 ──
let GATES_TABLE = {};
try {
  GATES_TABLE = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/ephemeris/planet-gates.json'), 'utf-8')
  );
} catch (e) {}

const PLANET_NAMES = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const PLANET_GATE_RANGES = [1,2,11,12,21,22,31,32,41,42]; // rough month=>gate for fallback

// ── 2. 通道→中心映射 ──
const CHANNEL_CENTERS = {
  '1-8':['G','Throat'],'2-14':['G','Sacral'],'3-60':['Sacral','Root'],
  '4-63':['Sacral','Ajna'],'5-15':['Sacral','G'],'6-59':['Sacral','Sacral'],
  '7-31':['G','Throat'],'9-52':['Sacral','Root'],'10-20':['Throat','Throat'],
  '10-34':['Throat','Sacral'],'11-56':['Ajna','Throat'],'12-22':['Throat','Solar Plexus'],
  '13-33':['G','Throat'],'16-48':['Throat','Spleen'],'17-62':['Ajna','Throat'],
  '18-58':['Spleen','Root'],'19-49':['Solar Plexus','Solar Plexus'],
  '20-34':['Throat','Sacral'],'21-45':['Ego','Throat'],'23-43':['Throat','Ajna'],
  '24-61':['Ajna','Head'],'25-51':['G','Ego'],'26-44':['Ego','Spleen'],
  '27-50':['Sacral','Ego'],'28-38':['Spleen','Root'],'29-46':['Sacral','Sacral'],
  '30-41':['Solar Plexus','Root'],'32-54':['Spleen','Root'],'35-36':['Throat','Solar Plexus'],
  '37-40':['Solar Plexus','Ego'],'39-55':['Root','Solar Plexus'],
  '42-53':['Sacral','Root'],'47-64':['Ajna','Ajna'],'57-34':['Spleen','Sacral'],
  '59-6':['Sacral','Sacral'],
};

// 闸门→谐波闸门（通道的另一个端点）
const HARMONIC = {
  1:[8],2:[14],3:[60],4:[63],5:[15],6:[59],7:[31],8:[1],9:[52],
  10:[20,34],11:[56],12:[22],13:[33],14:[2],15:[5],16:[48],
  17:[62],18:[58],19:[49],20:[10,34],21:[45],22:[12],23:[43],
  24:[61],25:[51],26:[44],27:[50],28:[38],29:[46],30:[41],
  31:[7],32:[54],33:[13],34:[10,20,57],35:[36],36:[35],37:[40],
  38:[28],39:[55],40:[37],41:[30],42:[53],43:[23],44:[26],
  45:[21],46:[29],47:[64],48:[16],49:[19],50:[27],51:[25],
  52:[9],53:[42],54:[32],55:[39],56:[11],57:[34],58:[18],
  59:[6],60:[3],61:[24],62:[17],63:[4],64:[47],
};

// 无外部依赖的闸门激活
function getActivation(longitude) {
  const deg = ((longitude % 360) + 360) % 360;
  const gate = Math.floor(deg / 5.625) + 1;
  const line = Math.floor(((deg % 5.625) / 5.625) * 6) + 1;
  return { gate: Math.min(Math.max(gate, 1), 64), line: Math.min(Math.max(line, 1), 6), longitude: deg };
}

function getOpposite(gate) { return ((gate + 31) % 64) + 1; }

function dateToKey(year, month, day) {
  return year + '-' + String(month).padStart(2,'0') + '-' + String(day).padStart(2,'0');
}

function getPlanetGates(year, month, day) {
  const key = dateToKey(year, month, day);
  const packed = GATES_TABLE[key];
  if (packed && packed.length >= 20) {
    const gates = [];
    const lines = [];
    for (let i = 0; i < 10; i++) { gates.push(packed[i*2]); lines.push(packed[i*2+1]); }
    return { gates, lines };
  }
  // Fallback
  const approx = [279, 100, 180, 220, 60, 150, 290, 300, 310, 240];
  const speeds = [0.9856, 13.176, 1.383, 1.383, 0.524, 0.083, 0.033, 0.012, 0.006, 0.005];
  const dayOfYear = Math.floor((Date.UTC(year, month-1, day) - Date.UTC(2000, 0, 1)) / 86400000);
  const gates = approx.map((a, i) => Math.floor(((a + speeds[i] * dayOfYear) % 360 + 360) % 360 / 5.625) + 1);
  return { gates, lines: gates.map(() => 1) };
}

// ── 3. 主计算函数 ──
async function calculateBodygraph(dateStr, timeStr, tz, lat, lon) {
  const localDt = DateTime.fromISO(dateStr + 'T' + timeStr, { zone: tz });
  if (!localDt.isValid) throw new Error('Invalid date/time');
  
  const birth = localDt.toUTC();
  const design = localDt.minus({ days: 88 }).toUTC();
  
  const birthData = getPlanetGates(birth.year, birth.month, birth.day);
  const designData = getPlanetGates(design.year, design.month, design.day);
  
  const personality = {};
  const designObj = {};
  
  PLANET_NAMES.forEach((name, i) => {
    const g = birthData.gates[i];
    const l = birthData.lines[i];
    // Convert back to longitude: gate center + line offset
    const baseLon = (g - 1) * 5.625 + (l - 1) * 0.9375 + 0.46875;
    personality[name] = getActivation(baseLon);
    
    const dg = designData.gates[i];
    const dl = designData.lines[i];
    const dLon = (dg - 1) * 5.625 + (dl - 1) * 0.9375 + 0.46875;
    designObj[name] = getActivation(dLon);
  });
  
  // Earth = opposite of Sun
  const sunG = birthData.gates[0]; const sunL = birthData.lines[0];
  const earthLon = ((sunG - 1) * 5.625 + (sunL - 1) * 0.9375 + 0.46875 + 180) % 360;
  personality.Earth = getActivation(earthLon);
  const dsg = designData.gates[0]; const dsl = designData.lines[0];
  const dEarthLon = ((dsg - 1) * 5.625 + (dsl - 1) * 0.9375 + 0.46875 + 180) % 360;
  designObj.Earth = getActivation(dEarthLon);
  
  // Collect all gates
  const allGates = new Set();
  for (const data of [...Object.values(personality), ...Object.values(designObj)]) {
    if (data && data.gate) allGates.add(data.gate);
  }
  const gates = [...allGates].sort((a,b) => a-b);
  
  // Find channels from harmonic gates
  const channels = [];
  const gateArr = [...allGates];
  for (const gate of gateArr) {
    const harmonics = HARMONIC[gate] || [];
    for (const h of harmonics) {
      if (allGates.has(h)) {
        const key = Math.min(gate, h) + '-' + Math.max(gate, h);
        if (!channels.includes(key)) channels.push(key);
      }
    }
  }
  channels.sort();
  
  // Defined centers
  const centersSet = new Set();
  for (const ch of channels) {
    const pair = CHANNEL_CENTERS[ch];
    if (pair) { centersSet.add(pair[0]); centersSet.add(pair[1]); }
  }
  
  const allCenters = ['Head','Ajna','Throat','G','Ego','Sacral','Solar Plexus','Spleen','Root'];
  const definedCenters = allCenters.filter(c => centersSet.has(c));
  const undefinedCenters = allCenters.filter(c => !centersSet.has(c));
  
  // Type
  let type = 'Reflector';
  if (channels.length > 0) {
    const hasSacral = centersSet.has('Sacral');
    // Check if motor connects to throat
    const motorGates = [21,45,5,34,57,20,10,35,36,30,41,49,19,55,39,53,58,52];
    const hasMotorToThroat = motorGates.some(g => allGates.has(g)) && centersSet.has('Throat');
    if (hasSacral) type = hasMotorToThroat ? 'Manifesting Generator' : 'Generator';
    else type = hasMotorToThroat ? 'Manifestor' : 'Projector';
  }
  
  // Authority
  let authority = 'Lunar';
  if (centersSet.has('Solar Plexus')) authority = 'Solar Plexus';
  else if (centersSet.has('Sacral')) authority = 'Sacral';
  else if (centersSet.has('Spleen')) authority = 'Spleen';
  else if (centersSet.has('Ego') || (centersSet.has('G') && centersSet.has('Throat'))) authority = 'Self Projected';
  else if (centersSet.has('Head') || centersSet.has('Ajna')) authority = 'Outer Authority';
  
  // Profile (from Sun lines)
  const pSunLine = personality.Sun ? personality.Sun.line : 1;
  const dSunLine = designObj.Sun ? designObj.Sun.line : 1;
  const profile = Math.min(pSunLine, 6) + '/' + Math.min(dSunLine, 6);
  
  // Definition
  let definition = 'None';
  if (channels.length === 0) definition = 'None';
  else if (channels.length <= 1) definition = 'Single';
  else if (channels.length <= 3) definition = 'Split';
  else definition = 'Triple Split';
  
  // Strategy & Signature
  const props = {
    'Manifestor': { strategy: '告知他人', signature: '平静', notSelf: '愤怒' },
    'Generator': { strategy: '等待回应', signature: '满足', notSelf: '挫败' },
    'Manifesting Generator': { strategy: '等待回应，快速启动', signature: '满足', notSelf: '挫败' },
    'Projector': { strategy: '等待被邀请', signature: '成功', notSelf: '苦涩' },
    'Reflector': { strategy: '等待一个月亮周期', signature: '惊喜', notSelf: '失望' },
  };
  const p = props[type] || props.Generator;
  
  return {
    type,
    strategy: p.strategy,
    authority,
    profile,
    definition,
    incarnationCross: '右角度交叉（' + (personality.Sun?.gate || 1) + '/' + (personality.Earth?.gate || 1) + '）',
    signature: p.signature,
    notSelfTheme: p.notSelf,
    definedCenters,
    undefinedCenters,
    centerDefinition: Object.fromEntries(allCenters.map(c => [c, centersSet.has(c)])),
    activatedGates: gates,
    channels,
    personality,
    design: designObj,
  };
}

module.exports = { calculateBodygraph };
