import { NextRequest, NextResponse } from 'next/server';

import { buildDeterministicSummary } from '../../../../lib/life-script-ai';
import { validateLifeStory } from '../../../../lib/life-story';

export const runtime = 'nodejs';

const noStoreHeaders = { 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateLifeStory(body?.lifeStory);

    if (!validation.ok) {
      return NextResponse.json({ ok: false, errors: validation.errors }, { status: 400, headers: noStoreHeaders });
    }

    return NextResponse.json(
      { ok: true, summary: buildDeterministicSummary(validation.value) },
      { status: 200, headers: noStoreHeaders },
    );
  } catch {
    return NextResponse.json(
      { ok: false, errors: ['请求格式不正确，请重新提交人生总结。'] },
      { status: 400, headers: noStoreHeaders },
    );
  }
}
