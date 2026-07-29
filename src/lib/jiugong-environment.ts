import type { JiugongFull } from '../server/jiugong-v6';

type JiugongYear = JiugongFull['years'][number];

export interface YearEnvironment extends JiugongYear {
  group: JiugongFull['groups'][number];
  collisions: {
    upper: boolean;
    self: boolean;
    lower: boolean;
  };
  strategies: {
    upper: string;
    self: string;
    lower: string;
    outer: string;
  };
}

export function selectYearEnvironment(
  data: JiugongFull,
  year: number,
): YearEnvironment | null {
  const selected = data.years.find((item) => item.year === year);
  if (!selected) return null;

  const group = data.groups[Math.floor((selected.age - 1) / 9)];
  if (!group) return null;

  return {
    ...selected,
    group,
    collisions: {
      upper: data.upperColl.includes(selected.age),
      self: data.selfColl.includes(selected.age),
      lower: data.lowerColl.includes(selected.age),
    },
    strategies: {
      upper: data.xiangStrategy?.[selected.upperQi]?.upper || '',
      self: data.xiangStrategy?.[selected.selfQi]?.self || '',
      lower: data.xiangStrategy?.[selected.lowerQi]?.lower || '',
      outer: data.xiangStrategy?.[selected.outerQi]?.outer || '',
    },
  };
}
