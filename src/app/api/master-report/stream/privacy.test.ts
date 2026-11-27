import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import * as hd from '@/lib/hd';
import * as astrology from '@/lib/astrology';
import * as depth from '@/lib/report-depth';
import { POST } from './route';

describe('report generation logging', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
  it('does not log birth details or IP when an upstream request fails', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'fake-key');
    vi.spyOn(hd, 'calculateBodygraph').mockResolvedValue({} as never);
    vi.spyOn(hd, 'assertHumanDesignResult').mockImplementation(() => {});
    vi.spyOn(astrology, 'calcPlanetPositions').mockResolvedValue({} as never);
    vi.spyOn(depth, 'buildPersonalReportSegments').mockReturnValue([{id:'test',prompt:'',maxTokens:10}] as never);
    vi.spyOn(depth, 'buildPersonalReportDataDeclaration').mockReturnValue('');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('upstream unavailable')));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const r = await POST(new NextRequest('http://localhost/api/master-report/stream', {method:'POST', headers:{'Content-Type':'application/json','x-forwarded-for':'192.0.2.17'}, body:JSON.stringify({year:'1990',month:'5',day:'15',hour:'0',minute:'0',city:'昆明',location:'云南',gender:'男'})}));
    await r.text();
    const lines=log.mock.calls.flat().join(' ');
    expect(lines).toContain('status=error');
    expect(lines).not.toContain('192.0.2.17');
    expect(lines).not.toContain('1990-5-15');
    expect(lines).not.toContain('昆明');
    expect(lines).not.toContain('男');
  });
});
