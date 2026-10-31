import { NextRequest, NextResponse } from 'next/server';

import { generateLifeScript } from '../../../../lib/life-script-ai';
import { validateLifeStory } from '../../../../lib/life-story';

export const runtime = 'nodejs';

const noStoreHeaders = { 'Cache-Control': 'no-store' };

function validSummary(value: unknown): value is Parameters<typeof generateLifeScript>[2] {
  if (!value || typeof value !== 'object') return false;
  const summary = value as Record<string, unknown>;
  const arrays = ['strengths', 'patterns', 'tensions', 'openQuestions'];
  return (
    typeof summary.headline === 'string' &&
    summary.headline.trim().length > 0 &&
    arrays.every((key) => Array.isArray(summary[key]) && summary[key].length > 0 && summary[key].every((item) => typeof item === 'string'))
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateLifeStory(body?.lifeStory);

    if (!validation.ok) {
      return NextResponse.json({ ok: false, errors: validation.errors }, { status: 400, headers: noStoreHeaders });
    }
    if (!validSummary(body?.confirmedSummary)) {
      return NextResponse.json(
        { ok: false, errors: ['请先确认人生总结，再生成双路径剧本。'] },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const result = await generateLifeScript(validation.value, body?.birthProfile, body.confirmedSummary);
    return NextResponse.json({ ok: true, result }, { status: 200, headers: noStoreHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message.includes('AI 返回') || message.includes('宿命化') ? 502 : 503;
    return NextResponse.json(
      { ok: false, error: status === 502 ? message : '剧本服务暂时不可用，请稍后重试。' },
      { status, headers: noStoreHeaders },
    );
  }
}
