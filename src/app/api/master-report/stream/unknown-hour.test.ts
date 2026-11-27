import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import * as hd from '@/lib/hd';
import * as astrology from '@/lib/astrology';
import * as depth from '@/lib/report-depth';
import * as lifecycle from '@/lib/lifecycle';
import { POST } from './route';
afterEach(()=>{vi.restoreAllMocks(); vi.unstubAllEnvs();});
it('marks an omitted birth hour unknown rather than exact',async()=>{
 const context=vi.spyOn(lifecycle,'buildLifeContext');
 vi.spyOn(hd,'calculateBodygraph').mockResolvedValue({} as never);
 vi.spyOn(hd,'assertHumanDesignResult').mockImplementation(()=>{});
 vi.spyOn(astrology,'calcPlanetPositions').mockResolvedValue({} as never);
 vi.spyOn(depth,'buildPersonalReportSegments').mockReturnValue([]);
 vi.stubEnv('DEEPSEEK_API_KEY','');
 await POST(new NextRequest('http://localhost/api/master-report/stream',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({year:'1990',month:'5',day:'15',hour:'',minute:'0'})}));
 expect(context).toHaveBeenCalledWith(expect.objectContaining({timeConfidence:'unknown'}));
});
