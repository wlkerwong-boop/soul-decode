/** Test HD engine v2 with @swisseph/node */
import { calculateHumanDesign } from '../src/lib/human-design';

async function main() {
  const result = await calculateHumanDesign(1990, 7, 15, 14, 39.9042, 116.4074);
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
    gates: result.activatedGates.length,
    gateList: result.activatedGates,
    channels: result.channels,
    personalitySun: result.personality?.Sun,
    personalityMoon: result.personality?.Moon,
    designSun: result.design?.Sun,
  }, null, 2));
}
main().catch(console.error);
