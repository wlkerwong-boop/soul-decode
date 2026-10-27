import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import * as hd from '@/lib/hd';
import * as astrology from '@/lib/astrology';
import * as depth from '@/lib/report-depth';
import { POST } from './route';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it('separates streamed chapters even when the model omits surrounding newlines', async () => {
  vi.stubEnv('DEEPSEEK_API_KEY', 'test-only');
  vi.spyOn(hd, 'calculateBodygraph').mockResolvedValue({} as never);
  vi.spyOn(hd, 'assertHumanDesignResult').mockImplementation(() => {});
  vi.spyOn(astrology, 'calcPlanetPositions').mockResolvedValue({} as never);
  vi.spyOn(depth, 'buildPersonalReportDataDeclaration').mockReturnValue('');
  vi.spyOn(depth, 'buildPersonalReportSegments').mockReturnValue([
    {id:'one',prompt:'',maxTokens:10}, {id:'two',prompt:'',maxTokens:10}
  ]);
  vi.spyOn(depth, 'finalizePersonalReport').mockImplementation((s) => s);
  const chunks = ['## 1. 第一章\n正文', '## 2. 第二章\n正文'];
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async () =>
    new Response('data: ' + JSON.stringify({choices:[{delta:{content:chunks.shift()}}]}) + '\n\n')
  ));
  const response = await POST(new NextRequest('http://localhost/api/master-report/stream', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({year:'1990',month:'5',day:'15',hour:'10'})
  }));
  const output = await response.text();
  const text = output.split('\n').filter(s => s.startsWith('data: ')).map(s => JSON.parse(s.slice(6)).content || '').join('');
  expect(text).toContain('正文\n\n## 2. 第二章');
});
