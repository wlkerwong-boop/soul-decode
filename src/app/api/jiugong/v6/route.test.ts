import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

function requestOf(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/jiugong/v6', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/jiugong/v6', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the v6 gold result for valid input', async () => {
    const response = await POST(requestOf({
      name: '王献科',
      year: 1973,
      month: 6,
      day: 5,
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      engine: 'jiugong-v6',
      data: { total: 33, ju: 0 },
    });
  });

  it.each([
    { name: '', year: 1973, month: 6, day: 5 },
    { name: '王献科', year: 1899, month: 6, day: 5 },
    { name: '王献科', year: 1973, month: 2, day: 30 },
    { name: '王献科', year: 1973, month: 13, day: 5 },
  ])('rejects invalid input without echoing private fields', async (body) => {
    const response = await POST(requestOf(body));
    const text = await response.text();

    expect(response.status).toBe(400);
    if (body.name) expect(text).not.toContain(body.name);
    expect(text).not.toContain(String(body.year));
  });

  it('does not write the request or result to console logs', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await POST(requestOf({ name: '王献科', year: 1973, month: 6, day: 5 }));

    expect(log).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
