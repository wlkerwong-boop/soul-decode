import { NextRequest, NextResponse } from 'next/server';
import {
  calculateJiugongV6,
  type JiugongInput,
} from '../../../../server/jiugong-v6';

export const runtime = 'nodejs';

class JiugongInputError extends Error {}

function parseInteger(value: unknown): number {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  throw new JiugongInputError();
}

function parseJiugongInput(body: unknown): JiugongInput {
  if (!body || typeof body !== 'object') throw new JiugongInputError();
  const source = body as Record<string, unknown>;
  const name = typeof source.name === 'string' ? source.name.trim() : '';
  const year = parseInteger(source.year);
  const month = parseInteger(source.month);
  const day = parseInteger(source.day);

  if (!/^\p{Script=Han}{2,4}$/u.test(name)) throw new JiugongInputError();
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new JiugongInputError();
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new JiugongInputError();
  }

  return { name, year, month, day };
}

// 接口级内存缓存：确定性计算，同一输入 1 小时内直接返回（防极端链路/重复查询）
const resultCache = new Map<string, { t: number; body: unknown }>();
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX = 500;

export async function POST(request: NextRequest) {
  try {
    const input = parseJiugongInput(await request.json());
    const cacheKey = `${input.name}|${input.year}|${input.month}|${input.day}`;
    const hit = resultCache.get(cacheKey);
    if (hit && Date.now() - hit.t < CACHE_TTL_MS) {
      return NextResponse.json(hit.body);
    }
    const data = await calculateJiugongV6(input);
    const body = { success: true, engine: 'jiugong-v6', data };
    resultCache.set(cacheKey, { t: Date.now(), body });
    if (resultCache.size > CACHE_MAX) {
      // 简单清理：清掉最老的一半
      const entries = [...resultCache.entries()].sort((a, b) => a[1].t - b[1].t);
      for (let i = 0; i < CACHE_MAX / 2; i++) resultCache.delete(entries[i][0]);
    }
    return NextResponse.json(body);
  } catch (error) {
    if (
      error instanceof JiugongInputError
      || error instanceof SyntaxError
    ) {
      return NextResponse.json(
        { error: '请输入有效的姓名和出生日期' },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: '排盘暂时不可用，请稍后重试' },
      { status: 500 },
    );
  }
}
