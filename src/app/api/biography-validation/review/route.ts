import { NextRequest, NextResponse } from 'next/server';

import { getBlindReviewFacts } from '../../../../data/biography-validation-study';
import { scoreBiographyReview, type BiographyReview } from '../../../../lib/biography-validation';

export const runtime = 'nodejs';

const noStoreHeaders = {
  'Cache-Control': 'no-store',
  'CDN-Cache-Control': 'no-store',
  'Surrogate-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const facts = getBlindReviewFacts(body?.sampleId);
    if (!facts) {
      return NextResponse.json({ ok: false, errors: ['匿名样本不存在。'] }, { status: 400, headers: noStoreHeaders });
    }
    if (!Array.isArray(body?.reviews)) {
      return NextResponse.json({ ok: false, errors: ['盲评标签必须是数组。'] }, { status: 400, headers: noStoreHeaders });
    }

    const score = scoreBiographyReview(facts, body.reviews as BiographyReview[]);
    return NextResponse.json(
      { ok: true, score: { ...score, personId: 'anonymous' } },
      { status: 200, headers: noStoreHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '盲评数据格式不正确。';
    return NextResponse.json({ ok: false, errors: [message] }, { status: 400, headers: noStoreHeaders });
  }
}
