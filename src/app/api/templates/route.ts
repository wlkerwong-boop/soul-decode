/**
 * 深度对话提示词模板 API
 *
 * 返回基于用户心理学的分层提示词模板
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  PROMPT_TEMPLATES,
  CATEGORY_INFO,
  getTemplatesByLevel,
  getRecommendedTemplates,
  TemplateCategory,
} from '@/data/prompt-templates';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const level = url.searchParams.get('level') || 'free';
  const category = url.searchParams.get('category') as TemplateCategory | null;
  const recommend = url.searchParams.get('recommend');

  if (recommend === 'true') {
    const hasReport = url.searchParams.get('hasReport') === 'true';
    const hasPaid = url.searchParams.get('hasPaid') === 'true';
    return NextResponse.json({
      success: true,
      templates: getRecommendedTemplates(hasReport, hasPaid),
    });
  }

  let templates = level === 'all'
    ? PROMPT_TEMPLATES
    : getTemplatesByLevel(level as any);

  if (category) {
    templates = templates.filter(t => t.category === category);
  }

  return NextResponse.json({
    success: true,
    categories: CATEGORY_INFO,
    templates,
    total: templates.length,
  });
}
