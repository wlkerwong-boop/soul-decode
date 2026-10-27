import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import * as hd from '@/lib/hd';
import * as depth from '@/lib/report-depth';
import * as lifecycle from '@/lib/lifecycle';
import { POST } from './route';
afterEach(()=>{vi.restoreAllMocks(); vi.unstubAllEnvs();});
const req=(body:object)=>new NextRequest('http://localhost/api/master-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
it('marks a missing hour unknown and uses noon only as an approximation',async()=>{
 const context=vi.spyOn(lifecycle,'buildLifeContext'); const bazi=vi.spyOn(depth,'calculateReportBazi');
 vi.spyOn(hd,'calculateBodygraph').mockResolvedValue({} as never); vi.spyOn(hd,'assertHumanDesignResult').mockImplementation(()=>{}); vi.stubEnv('DEEPSEEK_API_KEY','');
 await POST(req({year:'1990',month:'5',day:'15',hour:'',minute:'0'}));
 expect(context).toHaveBeenCalledWith(expect.objectContaining({timeConfidence:'unknown'})); expect(bazi).toHaveBeenCalledWith(1990,5,15,12,0);
});
it('rejects impossible dates',async()=>{
 const r=await POST(req({year:'2001',month:'2',day:'30',hour:'0'})); expect(r.status).toBe(400);
});
