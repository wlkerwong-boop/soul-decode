/**
 * 用户反馈/测试数据收集 API
 *
 * POST /api/feedback - 提交反馈
 * GET  /api/feedback - 获取所有反馈数据（需管理密钥）
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 内存存储（服务重启后清零，测试够用）
let feedbackStore: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, feedback, reportId, province, city, birthYear } = body;

    if (!rating && !feedback) {
      return NextResponse.json({ error: '请至少填写评分或反馈内容' }, { status: 400 });
    }

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      rating,
      feedback: feedback || '',
      reportId: reportId || '',
      province: province || '',
      city: city || '',
      birthYear: birthYear || '',
      timestamp: new Date().toISOString(),
    };

    feedbackStore.push(entry);

    return NextResponse.json({ success: true, id: entry.id });
  } catch (e: any) {
    console.error('反馈提交失败:', e);
    return NextResponse.json({ error: '提交失败' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // 简单管理密钥验证
  const key = request.nextUrl.searchParams.get('key');
  if (key !== 'admin2026') {
    return NextResponse.json({ error: '无权访问' }, { status: 403 });
  }

  const format = request.nextUrl.searchParams.get('format');

  if (format === 'csv') {
    // 导出 CSV
    const header = '时间,评分,反馈,报告ID,省份,城市,出生年份\n';
    const rows = feedbackStore.map(e =>
      `"${e.timestamp}","${e.rating}","${(e.feedback || '').replace(/"/g, '""')}","${e.reportId}","${e.province}","${e.city}","${e.birthYear}"`
    ).join('\n');
    return new Response(header + rows, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="soul-decode-feedback-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    total: feedbackStore.length,
    entries: feedbackStore,
  });
}
