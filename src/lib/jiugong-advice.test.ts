import { beforeAll, describe, expect, it } from 'vitest';
import { calculateJiugongV6, type JiugongFull } from '../server/jiugong-v6';
import { selectYearEnvironment, type YearEnvironment } from './jiugong-environment';
import {
  buildJiugongAdvice,
  JIUGONG_STRATEGIES,
  type AdviceTopic,
} from './jiugong-advice';

let gold: JiugongFull;
let environment: YearEnvironment;

describe('jiugong advice', () => {
  beforeAll(async () => {
    gold = await calculateJiugongV6(
      { name: '王献科', year: 1973, month: 6, day: 5 },
      new Date('2026-07-29T12:00:00+08:00'),
    );
    environment = selectYearEnvironment(gold, 2026)!;
  });

  it('contains the approved 3×9 strategy copy library', () => {
    const entries = Object.values(JIUGONG_STRATEGIES)
      .flatMap((strategies) => Object.values(strategies));
    expect(entries).toHaveLength(27);
    expect(new Set(entries)).toHaveLength(27);
  });

  it.each<AdviceTopic>(['career', 'wealth', 'love', 'house', 'health'])(
    'builds %s advice from the selected API year',
    (topic) => {
      const advice = buildJiugongAdvice(gold, environment, topic);

      expect(advice.context).toEqual({
        year: 2026,
        ageStar: environment.ageStar,
        group: environment.group.name,
        collisions: environment.collisions,
      });
      expect(advice.text).toContain('2026年');
      expect(advice.text).toContain(environment.group.name);
      expect(advice.text.length).toBeGreaterThan(80);
    },
  );
});
