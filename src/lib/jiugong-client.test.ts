import { describe, expect, it, vi } from 'vitest';
import { requestJiugongV6 } from './jiugong-client';

const input = { name: '李明', year: 1988, month: 3, day: 12 };
const result = { name: '李明', total: 15, ju: 4 };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('requestJiugongV6', () => {
  it('uses /api/jiugong/v6 as the only calculation endpoint', async () => {
    const fetcher = vi.fn(async () => jsonResponse({ success: true, data: result }));

    const received = await requestJiugongV6(input, fetcher);

    expect(received).toEqual(result);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith('/api/jiugong/v6', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  });

  it('surfaces API failure without creating a local fallback', async () => {
    const fetcher = vi.fn(async () => jsonResponse({
      error: '排盘暂时不可用，请稍后重试',
    }, 500));

    await expect(requestJiugongV6(input, fetcher)).rejects.toThrow(
      '排盘暂时不可用，请稍后重试',
    );
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
