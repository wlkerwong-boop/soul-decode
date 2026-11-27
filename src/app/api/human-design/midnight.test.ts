import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import * as hd from '@/lib/hd';
import { POST } from './route';

describe('human design birth time', () => {
  afterEach(() => vi.restoreAllMocks());
  it('passes midnight to the chart engine', async () => {
    const calculate = vi.spyOn(hd, 'calculateBodygraph').mockResolvedValue({} as never);
    vi.spyOn(hd, 'assertHumanDesignResult').mockImplementation(() => {});
    const response = await POST(new NextRequest('http://localhost/api/human-design', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({year:'1990',month:'5',day:'15',hour:'00',location:'云南'})}));
    expect(response.status).toBe(200);
    expect(calculate).toHaveBeenCalledWith('1990-05-15','00:00','Asia/Shanghai',expect.any(Number),expect.any(Number));
  });
});
