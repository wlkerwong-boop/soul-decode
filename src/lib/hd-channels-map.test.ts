import { describe, expect, it } from 'vitest';
import {
  describeChannels,
  isChannelInMap,
  lookupChannel,
  normalizeChannelKey,
} from './hd-channels-map';

describe('hd-channels-map（任务1 映射表常量化）', () => {
  it('normalizes engine ascending keys and arbitrary K3 ordering', () => {
    expect(normalizeChannelKey('10-34')).toBe('10-34');
    expect(normalizeChannelKey('34-10')).toBe('10-34');
    expect(normalizeChannelKey('23-43')).toBe('23-43');
    expect(normalizeChannelKey('not-a-channel')).toBeNull();
  });

  it('looks up by gate pair regardless of writing order', () => {
    expect(lookupChannel('34-10')?.name).toBe('探索的通道');
    expect(lookupChannel('10-34')?.name).toBe('探索的通道');
    expect(lookupChannel('35-36')?.name).toBe('无常/危机的通道');
    expect(lookupChannel('99-88')).toBeNull();
  });

  it('修正病灶#2：35-36 连接情绪中心与喉咙中心（非脾中心）', () => {
    const entry = lookupChannel('35-36')!;
    expect(entry.centerA).toBe('喉咙');
    expect(entry.centerB).toBe('情绪');
  });

  it('修正病灶#3：20-57 连接的是闸门 20 与 57（非爻）', () => {
    const entry = lookupChannel('20-57')!;
    expect(entry.gateA).toBe(20);
    expect(entry.gateB).toBe(57);
    expect(entry.centerA).toBe('喉咙');
    expect(entry.centerB).toBe('脾');
  });

  it('describeChannels 只输出映射表字段，缺项不编造', () => {
    expect(describeChannels(['10-34', '23-43'])).toBe(
      '10-34（34(荐骨) ↔ 10(G) 探索的通道）、23-43（43(逻辑/Ajna) ↔ 23(喉咙) 架构/天才到疯子的通道）',
    );
    expect(describeChannels(['99-88'])).toContain('映射表缺项');
    expect(describeChannels([])).toBe('无完整通道');
    expect(describeChannels(undefined)).toBe('无完整通道');
  });

  it('全表 36 条均在映射表内（含王家重点核对通道）', () => {
    const familyKeys = ['18-58', '28-38', '35-36', '4-63', '5-15', '34-57', '16-48', '20-57', '24-61', '27-50', '11-56', '3-60'];
    for (const key of familyKeys) {
      expect(isChannelInMap(key), `${key} 应在映射表内`).toBe(true);
    }
  });
});
