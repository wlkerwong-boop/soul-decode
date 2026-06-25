/**
 * 人类图计算 — 委托给 hd-engine-v5.cjs
 */
export interface HDResult {
  type: string; strategy: string; authority: string;
  profile: string; definition: string; incarnationCross: string;
  signature: string; notSelfTheme: string;
  definedCenters: string[]; undefinedCenters: string[];
  centerDefinition: Record<string, boolean>;
  activatedGates: number[]; channels: string[]; circuitries: string[];
}

export function calculateHumanDesign(
  year: number, month: number, day: number, hour: number
): HDResult {
  const mod = require('./hd-engine-v5.cjs');
  const ds = `${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const ts = `${String(hour||12).padStart(2,'0')}:00`;
  return mod.calculateBodygraph(ds, ts, 'Asia/Shanghai', 39.9, 116.4);
}
