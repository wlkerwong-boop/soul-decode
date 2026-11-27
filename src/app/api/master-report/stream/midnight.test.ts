import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import * as hd from '@/lib/hd';
import * as astrology from '@/lib/astrology';
import * as depth from '@/lib/report-depth';
import { POST } from './route';

describe('master report birth time', () => {
  afterEach(() => vi.restoreAllMocks());
  it('passes midnight to the chart calculation', async () => {
    const bazi = vi.spyOn(depth, 'calculateReportBazi');
    vi.spyOn(hd, 'calculateBodygraph').mockResolvedValue({} as never);
    vi.spyOn(hd, 'assertHumanDesignResult').mockImplementation(() => {});
    vi.spyOn(astrology, 'calcPlanetPositions').mockResolvedValue({} as never);
    vi.spyOn(depth, 'buildPersonalReportSegments').mockReturnValue([]);
    const old = process.env.DEEPSEEK_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
    try {
      await POST(new NextRequest('http://localhost/api/master-report/stream', { method: 'POST', body: JSON.stringify({ year:'1990', month:'5', day:'15', hour:'0', minute:'0', city:'昆明', location:'云南', gender:'男' }), headers:{'Content-Type':'application/json'} }));
      expect(bazi).toHaveBeenCalledWith(1990, 5, 15, 0, 0);
    } finally {
      if (old !== undefined) process.env.DEEPSEEK_API_KEY = old;
    }
  });
});
