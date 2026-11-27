import { expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
it('rejects an impossible date before producing a report', async () => {
 const r=await POST(new NextRequest('http://localhost/api/master-report/stream',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({year:'2001',month:'2',day:'30',hour:'0',minute:'0'})}));
 expect(r.status).toBe(400);
});
