import { getDetailedBazi } from '../src/lib/bazi-enhanced';

// 普光师兄 (山东, 1982-01-27 02:00)
console.log("=== 普光师兄 ===");
const r1 = getDetailedBazi(1982, 1, 27, 2);
console.log(JSON.stringify({pillars:r1.pillars, dayMaster:r1.dayMaster, elementDist:r1.elementDistribution, mingGong:r1.mingGong, daYun: {startAge:r1.daYun.startAge, yunCount:r1.daYun.yun.length}}, null, 2));
console.log("详细:", JSON.stringify(r1.detail.map(d => ({pillar:d.pillar, gan:d.gan, zhi:d.zhi, shiShen:d.shiShenGan, hideGan:d.hideGan, diShi:d.diShi, xunKong:d.xunKong})), null, 2));

// 二女儿 (LA, 2015-06-04 19:00 PDT/UTC-7)
console.log("\n=== 二女儿(LA出生) ===");
const r2 = getDetailedBazi(2015, 6, 4, 19, 0, "America/Los_Angeles");
console.log(JSON.stringify({pillars:r2.pillars, dayMaster:r2.dayMaster, elementDist:r2.elementDistribution, mingGong:r2.mingGong}, null, 2));
console.log("详细:", JSON.stringify(r2.detail.map(d => ({pillar:d.pillar, gan:d.gan, zhi:d.zhi, shiShen:d.shiShenGan, hideGan:d.hideGan, diShi:d.diShi, xunKong:d.xunKong})), null, 2));
