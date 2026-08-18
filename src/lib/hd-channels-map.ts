/**
 * 人类图通道映射表查表工具（任务1：映射表常量化）
 *
 * 数据源：src/data/hd-channels-map.json（K3 权威版 2026-08-18，dsh 只落码不创作不改名）。
 * 引擎输出 channels 为升序 key（如 "10-34"、"23-43"），映射表 key 为 K3 原始书写序（如 "34-10"、"43-23"），
 * 查表一律按闸门号对（gateA/gateB）归一化匹配，与书写顺序无关。
 *
 * 纪律：报告 prompt 中通道描述只准引用本工具输出，禁止 AI 自行描述"X 通道连接 Y 中心"。
 */
import channelMap from '../data/hd-channels-map.json';

export interface ChannelMapEntry {
  key: string;
  gateA: number;
  centerA: string;
  gateB: number;
  centerB: string;
  name: string;
  circuit: string;
}

const ENTRIES: ChannelMapEntry[] = (channelMap as { channels: ChannelMapEntry[] }).channels;

// 闸门号对 → 条目（双向归一化，如 {10,34} 命中 34-10）
const BY_GATE_PAIR = new Map<string, ChannelMapEntry>();
for (const entry of ENTRIES) {
  const a = Math.min(entry.gateA, entry.gateB);
  const b = Math.max(entry.gateA, entry.gateB);
  BY_GATE_PAIR.set(`${a}-${b}`, entry);
}

/** 规范化任意通道 key 为升序（如 "34-10" → "10-34"），无法解析返回 null */
export function normalizeChannelKey(key: string): string | null {
  const parts = key.split('-').map((n) => parseInt(n, 10));
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return null;
  return `${Math.min(parts[0], parts[1])}-${Math.max(parts[0], parts[1])}`;
}

/** 按引擎输出的通道 key 查映射表（任意书写序均可）；查不到返回 null */
export function lookupChannel(key: string): ChannelMapEntry | null {
  const normalized = normalizeChannelKey(key);
  if (!normalized) return null;
  return BY_GATE_PAIR.get(normalized) || null;
}

/** 通道两端描述，如 "34(荐骨) ↔ 20(喉咙)"（K3 原文序） */
export function describeChannelEndpoints(entry: ChannelMapEntry): string {
  return `${entry.gateA}(${entry.centerA}) ↔ ${entry.gateB}(${entry.centerB})`;
}

/**
 * 把引擎输出的通道数组转为"只引用映射表"的描述文本，供报告 prompt 注入。
 * 例：["10-34","23-43"] → "10-34（34荐骨↔10G 探索的通道）、23-43（43逻辑/Ajna↔23喉咙 架构/天才到疯子的通道）"
 * 映射表缺项：原样列出 key 并标注"映射表缺项"，不编造中心连接（fail-closed 由校验脚本兜底）。
 */
export function describeChannels(channels: string[] | undefined | null): string {
  if (!channels || channels.length === 0) return '无完整通道';
  return channels
    .map((key) => {
      const entry = lookupChannel(key);
      if (!entry) return `${key}（映射表缺项，勿自行描述）`;
      return `${key}（${describeChannelEndpoints(entry)} ${entry.name}）`;
    })
    .join('、');
}

/** 校验用：判断某通道 key 是否在映射表内（用于 verify-report） */
export function isChannelInMap(key: string): boolean {
  return lookupChannel(key) !== null;
}

/** 供 verify-report 使用的全表快照（gateA/gateB 归一化升序 key → 条目） */
export function channelMapSnapshot(): Record<string, ChannelMapEntry> {
  const snapshot: Record<string, ChannelMapEntry> = {};
  for (const entry of ENTRIES) {
    const a = Math.min(entry.gateA, entry.gateB);
    const b = Math.max(entry.gateA, entry.gateB);
    snapshot[`${a}-${b}`] = entry;
  }
  return snapshot;
}
