/**
 * Human Design 计算引擎 v2
 * 使用 @swisseph/node 精准星历
 */

let sweInstance: any = null;

async function getSwe(): Promise<any> {
  if (sweInstance) return sweInstance;
  const mod = await import('@swisseph/node');
  sweInstance = mod;
  return sweInstance;
}

// 64 gates → 能量中心映射
const GATE_TO_CENTER: Record<number, string> = {
  1:'G',2:'G',3:'Sacral',4:'Sacral',5:'Sacral',6:'Sacral',7:'G',8:'Throat',
  9:'Sacral',10:'G',11:'Ajna',12:'Throat',13:'G',14:'Sacral',15:'G',16:'Throat',
  17:'Ajna',18:'Spleen',19:'Solar Plexus',20:'Throat',21:'Ego',22:'Solar Plexus',
  23:'Throat',24:'Ajna',25:'G',26:'Ego',27:'Sacral',28:'Spleen',29:'Sacral',
  30:'Solar Plexus',31:'Throat',32:'Spleen',33:'Throat',34:'Sacral',35:'Throat',
  36:'Solar Plexus',37:'Solar Plexus',38:'Spleen',39:'Root',40:'Ego',41:'Root',
  42:'Sacral',43:'Throat',44:'Spleen',45:'Throat',46:'Sacral',47:'Ajna',
  48:'Spleen',49:'Solar Plexus',50:'Ego',51:'Ego',52:'Root',53:'Root',
  54:'Root',55:'Solar Plexus',56:'Throat',57:'Spleen',58:'Root',59:'Sacral',
  60:'Root',61:'Ajna',62:'Throat',63:'Ajna',64:'Ajna',
};

// 通道（闸门对）
const CHANNELS: [number, number][] = [
  [1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],
  [10,34],[11,56],[12,22],[13,33],[16,48],[17,62],[18,58],[19,49],
  [20,34],[21,45],[23,43],[24,61],[25,51],[26,44],[27,50],[28,38],
  [29,46],[30,41],[32,54],[35,36],[37,40],[39,55],[42,53],[47,64],
  [57,34],[59,6],
];

export interface HDResult {
  type: string; strategy: string; authority: string; profile: string;
  definition: string; incarnationCross: string; signature: string;
  notSelfTheme: string; definedCenters: string[]; undefinedCenters: string[];
  centerDefinition: Record<string, boolean>; activatedGates: number[];
  channels: string[]; circuitries: string[];
  personality?: Record<string, { gate: number; line: number; longitude: number }>;
  design?: Record<string, { gate: number; line: number; longitude: number }>;
}

function longitudeToGateAndLine(lon: number): { gate: number; line: number } {
  const deg = ((lon % 360) + 360) % 360;
  const gate = Math.floor(deg / 5.625) + 1;
  const line = Math.floor(((deg % 5.625) / 5.625) * 6) + 1;
  return { gate: Math.min(Math.max(gate, 1), 64), line: Math.min(Math.max(line, 1), 6) };
}

export async function calculateHumanDesign(
  year: number, month: number, day: number,
  hour: number, lat: number, lon: number, tz: string = 'Asia/Shanghai'
): Promise<HDResult> {
  const swe = await getSwe();

  // Birth date in local time → UTC
  const localDate = new Date(year, month - 1, day, hour || 12, 0, 0);
  const jd = swe.dateToJulianDay(localDate);

  // Design date: 88 days before birth (approximately)
  const designDate = new Date(localDate.getTime() - 88 * 24 * 60 * 60 * 1000);
  const jdDesign = swe.dateToJulianDay(designDate);

  const PLANET_IDS: Record<string, number> = {
    Sun: 0, Moon: 1, Mercury: 2, Venus: 3, Mars: 4,
    Jupiter: 5, Saturn: 6, Uranus: 7, Neptune: 8, Pluto: 9,
    NorthNode: 10,
  };

  const flags = swe.CalculationFlag?.Moshier || 0;
  const personality: Record<string, any> = {};
  const design: Record<string, any> = {};

  for (const [name, id] of Object.entries(PLANET_IDS)) {
    try {
      const pos = swe.calculatePosition(jd, id, flags);
      const lonDeg = pos.longitude || 0;
      const { gate, line } = longitudeToGateAndLine(lonDeg);
      personality[name] = { gate, line, longitude: lonDeg };
    } catch { continue; }
  }

  // Design: sun, moon, mercury, venus, mars, jupiter, north node
  for (const name of ['Sun','Moon','Mercury','Venus','Mars','Jupiter','NorthNode']) {
    try {
      const id = PLANET_IDS[name];
      const pos = swe.calculatePosition(jdDesign, id, flags);
      const lonDeg = pos.longitude || 0;
      const { gate, line } = longitudeToGateAndLine(lonDeg);
      design[name] = { gate, line, longitude: lonDeg };
    } catch { continue; }
  }

  // Earth and South Node = opposite of Sun and North Node
  if (personality.Sun) {
    const earthLon = (personality.Sun.longitude + 180) % 360;
    personality.Earth = { ...longitudeToGateAndLine(earthLon), longitude: earthLon };
  }
  if (personality.NorthNode) {
    const southLon = (personality.NorthNode.longitude + 180) % 360;
    personality.SouthNode = { ...longitudeToGateAndLine(southLon), longitude: southLon };
  }
  if (design.Sun) {
    const earthLon = (design.Sun.longitude + 180) % 360;
    design.Earth = { ...longitudeToGateAndLine(earthLon), longitude: earthLon };
  }
  if (design.NorthNode) {
    const southLon = (design.NorthNode.longitude + 180) % 360;
    design.SouthNode = { ...longitudeToGateAndLine(southLon), longitude: southLon };
  }

  // Collect all activated gates
  const gateSet = new Set<number>();
  for (const data of [...Object.values(personality), ...Object.values(design)]) {
    if (data?.gate) gateSet.add(data.gate);
  }
  const allGates = [...gateSet].sort((a, b) => a - b);

  // Determine center definitions
  const centerDefs: Record<string, boolean> = {
    Head: false, Ajna: false, Throat: false, G: false,
    Ego: false, Sacral: false, 'Solar Plexus': false,
    Spleen: false, Root: false,
  };
  for (const gate of allGates) {
    const center = GATE_TO_CENTER[gate];
    if (center && center in centerDefs) centerDefs[center] = true;
  }

  const definedCenters = Object.entries(centerDefs).filter(([,v]) => v).map(([k]) => k);
  const undefinedCenters = Object.entries(centerDefs).filter(([,v]) => !v).map(([k]) => k);

  // Type
  let type = 'Projector';
  if (definedCenters.length === 0) type = 'Reflector';
  else if (centerDefs.Sacral && centerDefs.Throat) type = 'Manifesting Generator';
  else if (centerDefs.Sacral) type = 'Generator';
  else if (centerDefs.Ego || centerDefs.Throat) type = 'Manifestor';

  const strategies: Record<string, string> = {
    'Generator': '等待回应', 'Manifesting Generator': '等待回应，快速启动',
    'Projector': '等待被邀请', 'Manifestor': '告知他人', 'Reflector': '等待一个月亮周期',
  };

  // Authority
  let authority = '环境型权威';
  if (centerDefs['Solar Plexus']) authority = '情绪型权威（等待情绪清明）';
  else if (centerDefs.Spleen) authority = '直觉型权威（当下直觉）';
  else if (centerDefs.Sacral) authority = '荐骨型权威（身体回应）';
  else if (centerDefs.Ego) authority = '意志型权威（自我决定）';
  else if (centerDefs.G) authority = 'G中心权威（自我对话）';

  // Profile (Personality Sun line / Design Sun line)
  const pSunLine = personality.Sun?.line || 1;
  const dSunLine = design.Sun?.line || 1;
  const profile = `${pSunLine}/${dSunLine}`;

  // Definition
  const definedCount = definedCenters.length;
  let definition = '无定义';
  if (definedCount <= 1) definition = '无定义';
  else if (definedCount <= 3) definition = '单一';
  else if (definedCount <= 5) definition = '分裂';
  else definition = '三重分裂';

  // Channels
  const activeChannels: string[] = [];
  for (const [g1, g2] of CHANNELS) {
    if (allGates.includes(g1) && allGates.includes(g2)) {
      activeChannels.push(`${g1}-${g2}`);
    }
  }

  // Incarnation Cross
  const sunGate = personality.Sun?.gate || 1;
  const earthGate = personality.Earth?.gate || ((sunGate + 31) % 64) + 1;
  const crossName = `右角度交叉（${sunGate}/${earthGate}）`;

  const signatures: Record<string, string> = {
    'Generator': '满足', 'Manifesting Generator': '满足',
    'Projector': '成功', 'Manifestor': '平静', 'Reflector': '惊喜',
  };
  const notSelf: Record<string, string> = {
    'Generator': '挫败', 'Manifesting Generator': '挫败',
    'Projector': '苦涩', 'Manifestor': '愤怒', 'Reflector': '失望',
  };

  return {
    type,
    strategy: strategies[type] || type,
    authority,
    profile,
    definition,
    incarnationCross: crossName,
    signature: signatures[type] || '满足',
    notSelfTheme: notSelf[type] || '挫败',
    definedCenters,
    undefinedCenters,
    centerDefinition: centerDefs,
    activatedGates: allGates,
    channels: activeChannels,
    circuitries: [],
    personality: Object.fromEntries(Object.entries(personality).map(([k,v]) => [k, { gate: v.gate, line: v.line, longitude: v.longitude }])),
    design: Object.fromEntries(Object.entries(design).map(([k,v]) => [k, { gate: v.gate, line: v.line, longitude: v.longitude }])),
  };
}
