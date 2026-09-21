import { NextRequest, NextResponse } from 'next/server';

import {
  scoreBiographyReview,
  validateBiographyFacts,
  type BiographyReview,
} from '../../../lib/biography-validation';

export const runtime = 'nodejs';

const noStoreHeaders = { 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const factsValidation = validateBiographyFacts(body?.facts);

    if (!factsValidation.ok) {
      return NextResponse.json({ ok: false, errors: factsValidation.errors }, { status: 400, headers: noStoreHeaders });
    }
    if (!Array.isArray(body?.reviews)) {
      return NextResponse.json({ ok: false, errors: ['盲评标签必须是数组。'] }, { status: 400, headers: noStoreHeaders });
    }

    const score = scoreBiographyReview(factsValidation.value, body.reviews as BiographyReview[]);
    return NextResponse.json({ ok: true, score }, { status: 200, headers: noStoreHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : '传记盲评数据格式不正确。';
    return NextResponse.json({ ok: false, errors: [message] }, { status: 400, headers: noStoreHeaders });
  }
}
