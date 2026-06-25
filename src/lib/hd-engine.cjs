/**
 * 人类图计算引擎 — 直接调用 @it-healer/bodygraph
 * 独立JS文件，绕开TS/CJS兼容问题
 */
const bodygraphCalc = require('@it-healer/human-design-calculator/src/bodygraph');
const sweph = require('sweph');
const { DateTime } = require('luxon');
const path = require('path');

// 城市→经纬度映射
const CITY_COORDS = {
  '北京': { lat: 39.9042, lon: 116.4074 },
  '上海': { lat: 31.2304, lon: 121.4737 },
  '广州': { lat: 23.1292, lon: 113.2644 },
  '深圳': { lat: 22.5431, lon: 114.0579 },
};

function getCoords(location) {
  if (!location) return { lat: 39.9042, lon: 116.4074 };
  for (const [city, c] of Object.entries(CITY_COORDS)) {
    if (location.includes(city)) return c;
  }
  return { lat: 39.9042, lon: 116.4074 };
}

async function calculateHD(body) {
  const { year, month, day, hour = '12', location } = body;
  
  const { lat, lon } = getCoords(location);
  const dateStr = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const timeStr = `${String(hour).padStart(2, '0')}:30`;
  const tz = 'Asia/Shanghai';
  
  // Set ephemeris path
  const ephePath = path.join(process.cwd(), 'node_modules/@it-healer/human-design-calculator/ephemeris');
  try { sweph.swe_set_ephe_path(ephePath); } catch (e) {}
  
  // Calculate bodygraph
  const result = await bodygraphCalc.calculateBodygraph(dateStr, timeStr, tz, lat, lon, ephePath);
  return result;
}

module.exports = { calculateHD };
