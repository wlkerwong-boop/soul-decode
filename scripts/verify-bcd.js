// 复验脚本：模拟 route.ts / stream/route.ts 的数据组装路径
// 用例：2015-05-20 14:37 大理（乙未年，验证 B/C/D）
const { Solar } = require('lunar-javascript');

// ---- calcBazi（与 stream/route.ts 相同）----
function calcBazi(y, m, d, h) {
  const solar = Solar.fromYmdHms(y, m, d, h, 0, 0);
  const lunar = solar.getLunar();
  const pillars = [
    lunar.getYearInGanZhiExact(), lunar.getMonthInGanZhiExact(),
    lunar.getDayInGanZhiExact(), lunar.getTimeInGanZhi()
  ];
  const dayMaster = lunar.getDayGan();
  const elMap = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  return { pillars, dayMaster: `${dayMaster}（${elMap[dayMaster]}）` };
}

// ---- calcWuyunLiuqi（修复后）----
function calcWuyunLiuqi(y) {
  const stem = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'][(y-4) % 10];
  const branch = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][(y-4) % 12];
  const yun = {甲:'土运',乙:'金运',丙:'水运',丁:'木运',戊:'火运',己:'土运',庚:'金运',辛:'水运',壬:'木运',癸:'火运'};
  return { stem, branch, wuyun: `${stem}年 → ${yun[stem]}` };
}

// ---- calcHD（修复后：分钟不取整 + 真实经纬度）----
function calcHD(y, m, d, h, mi, tz, lat, lon) {
  const mod = require('../src/lib/hd-engine-v5.cjs');
  const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const ts = `${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`;
  return mod.calculateBodygraph(ds, ts, tz, lat, lon);
}

// getBirthCoords 的 JS 版（与 cities.ts 同步抽验两个键）
const coords = { '大理市': [25.60, 100.23], '东京': [35.68, 139.69] };

let fail = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + ' | ' + detail);
  if (!cond) fail++;
}

// C: bazi 非空
const bazi = calcBazi(2015, 5, 20, 14);
check('C bazi非空', bazi && Array.isArray(bazi.pillars) && bazi.pillars.length === 4 && !!bazi.dayMaster,
  JSON.stringify(bazi));

// B: 2015 = 乙年金运
const wy = calcWuyunLiuqi(2015);
check('B 2015=乙年金运', wy.stem === '乙' && wy.wuyun.includes('金运') && wy.branch === '未', JSON.stringify(wy));

// D: HD 带分钟 + 真实坐标，结果非空
const hd = calcHD(2015, 5, 20, 14, 37, 'Asia/Shanghai', 25.60, 100.23);
check('D HD非空(14:37 大理)', hd && !!hd.type, hd ? `type=${hd.type} profile=${hd.profile}` : 'null');
const hd2 = calcHD(2015, 5, 20, 8, 0, 'America/Los_Angeles', 34.05, -118.24);
const hd3 = calcHD(2015, 5, 20, 23, 50, 'America/Los_Angeles', 34.05, -118.24);
// v5 引擎为日级精度：分钟参与时区换算，23:50 洛杉矶 → 北京时间为次日，输出应不同
check('D 分钟进入时区换算(LA 08:00 vs 23:50→次日)', JSON.stringify(hd2) !== JSON.stringify(hd3), '跨日输出不同');

process.exit(fail ? 1 : 0);
