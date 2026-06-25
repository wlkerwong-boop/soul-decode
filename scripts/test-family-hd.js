/**
 * 全家人类图测试脚本
 */
const hd = require('../src/lib/hd-engine-v5.cjs');

async function test(name, date, time, lat, lon, tz) {
  try {
    const r = await hd.calculateBodygraph(date, time, tz, lat, lon);
    console.log('─'.repeat(50));
    console.log(`【${name}】 ${date} ${time} ${tz}`);
    console.log(`类型: ${r.type}  |  权威: ${r.authority}  |  角色: ${r.profile}`);
    console.log(`定义: ${r.definition}  |  签名: ${r.signature}  |  非自我: ${r.notSelfTheme}`);
    console.log(`定义中心: ${r.definedCenters.join(', ') || '无'}`);
    console.log(`开放中心: ${r.undefinedCenters.join(', ') || '无'}`);
    console.log(`闸门(${r.activatedGates.length}): ${r.activatedGates.sort((a,b)=>a-b).join(', ')}`);
    console.log(`通道(${r.channels.length}): ${r.channels.sort().join(', ') || '无'}`);
    console.log(`轮叉: ${r.incarnationCross}`);
  } catch(e) {
    console.log(`【${name}】 ERROR: ${e.message}`);
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║      王献科全家 · 人类图测试报告                      ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  
  // 1. 王献科（普光师兄）- 山东聊城
  await test('王献科（父亲）', '1982-01-27', '02:00', 36.45, 115.98, 'Asia/Shanghai');
  
  // 2. 张晓霞（妻子）- 湖北武汉
  await test('张晓霞（母亲）', '1982-10-28', '12:00', 30.59, 114.31, 'Asia/Shanghai');
  
  // 3. 王一斐（孩子）- 广东深圳
  await test('王一斐', '2010-12-04', '19:00', 22.54, 114.06, 'Asia/Shanghai');
  
  // 4. 王一如（孩子）- 山东青岛
  await test('王一如', '2017-07-23', '10:00', 36.07, 120.38, 'Asia/Shanghai');
  
  // 5. 王一然（孩子） - 美国洛杉矶（时区转换）
  // LA 2015-06-04 19:00 PDT = UTC-7 → China UTC+8
  await test('王一然（LA出生）', '2015-06-04', '19:00', 34.05, -118.24, 'America/Los_Angeles');
  
  console.log('\n✅ 全部完成');
}

main().catch(console.error);
