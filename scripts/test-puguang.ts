/** 普光师兄人类图测试 */
import { calculateHumanDesign } from '../src/lib/human-design';

async function main() {
  const result = await calculateHumanDesign(1982, 1, 27, 2, 36.45, 115.98);
  console.log(JSON.stringify({
    type: result.type,
    strategy: result.strategy,
    authority: result.authority,
    profile: result.profile,
    definition: result.definition,
    incarnationCross: result.incarnationCross,
    signature: result.signature,
    notSelf: result.notSelfTheme,
    definedCenters: result.definedCenters,
    undefinedCenters: result.undefinedCenters,
    gateCount: result.activatedGates.length,
    gates: result.activatedGates,
    channels: result.channels,
    personalitySun: result.personality?.Sun,
    personalityMoon: result.personality?.Moon,
    designSun: result.design?.Sun,
  }, null, 2));
}
main().catch(console.error);
