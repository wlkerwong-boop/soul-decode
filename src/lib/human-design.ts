/**
 * 人类图计算引擎 — 精简TypeScript包装
 * 实际计算委托给 hd-engine.cjs (sweph瑞士星历)
 */

const hdEngine = require('./hd-engine.cjs');

export interface HDResult {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnationCross: string;
  signature: string;
  notSelfTheme: string;
  definedCenters: string[];
  undefinedCenters: string[];
  centerDefinition: Record<string, boolean>;
  activatedGates: number[];
  channels: string[];
  circuitries: string[];
}

export async function calculateHumanDesign(
  year: number, month: number, day: number,
  hour: number, lat: number, lon: number
): Promise<HDResult> {
  return hdEngine.calculateHD({
    year: String(year),
    month: String(month),
    day: String(day),
    hour: String(hour || 12),
    location: '',
  });
}
