import citiesData from '@/data/cities.json';

interface ProvinceInfo {
  cities: string[];
  tags: string[];
  description: string;
}

interface CitiesDatabase {
  cities: Record<string, ProvinceInfo>;
}

const db = citiesData as CitiesDatabase;

/**
 * 根据地点字符串匹配城市/省份的文化性格标签
 */
export function lookupCity(query: string): ProvinceInfo | null {
  if (!query) return null;

  const normalized = query.trim().toLowerCase();

  // 精确匹配省份或城市名
  for (const [province, info] of Object.entries(db.cities)) {
    if (province.toLowerCase().includes(normalized)) {
      return info;
    }
    for (const city of info.cities) {
      if (city.toLowerCase().includes(normalized)) {
        return info;
      }
    }
  }

  // 模糊匹配 - 输入可能包含省份名
  for (const [province, info] of Object.entries(db.cities)) {
    if (normalized.includes(province.toLowerCase())) {
      return info;
    }
    for (const city of info.cities) {
      if (normalized.includes(city.toLowerCase())) {
        return info;
      }
    }
  }

  return null;
}

/**
 * 获取所有省份列表（用于前端选择器）
 */
export function getProvinceList(): string[] {
  return Object.keys(db.cities);
}

/**
 * 获取某省份的城市列表
 */
export function getCitiesByProvince(province: string): string[] {
  return db.cities[province]?.cities || [];
}
