import { NextRequest, NextResponse } from 'next/server';
import { createWordReportBuffer } from '@/lib/word-report';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const report = typeof body.report === 'string' ? body.report.trim() : '';
    if (!report) return NextResponse.json({ error: '报告内容为空' }, { status: 400 });
    if (report.length > 400_000) return NextResponse.json({ error: '报告内容过长' }, { status: 413 });

    const buffer = await createWordReportBuffer(report, body.meta || {}, body.charts || {});
    const filename = `人生总览_${body.meta?.year || 'report'}.docx`;
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Word report generation failed:', error);
    return NextResponse.json({ error: 'Word 文档生成失败，请稍后重试' }, { status: 500 });
  }
}
