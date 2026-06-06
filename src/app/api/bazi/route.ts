/**
 * 八字排盘 + 能量曲线 API
 *
 * 瞬时返回，不需要 AI 调用
 */
import { NextRequest, NextResponse } from 'next/server';
import { calculateLifePathNumber } from '@/lib/numerology';
import { getTimePeriod } from '@/lib/time-period';
import { lookupCity } from '@/lib/city';
import { calculateBazi, generateLifeEnergy } from '@/lib/bazi';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, location, gender, timezone } = body;

    if (!year || !month || !day) {
      return NextResponse.json(
        { error: '请填写完整的出生日期' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);

    const hourNum = hour ? parseInt(hour, 10) : undefined;

    // 生命路径数字
    const numerology = calculateLifePathNumber(yearNum, monthNum, dayNum);

    // 出生时辰
    const timePeriod = hour ? getTimePeriod(hourNum!) : null;

    // 城市文化标签
    const cityInfo = location ? lookupCity(location) : null;

    // 八字排盘（瞬时计算）
    const bazi = calculateBazi(yearNum, monthNum, dayNum, hourNum);

    // 能量曲线（瞬时计算，v2升级版）
    const lifeEnergy = generateLifeEnergy(
      yearNum, monthNum, dayNum,
      bazi.dayMasterElement,
      bazi.elementDistribution,
      bazi.pillars,
      bazi.ganElements,
      bazi.zhiElements,
    );

    // 报告 ID
    const reportId = crypto
      .createHash('md5')
      .update(`${year}-${month}-${day}-${hour || '?'}-${location || '?'}`)
      .digest('hex')
      .slice(0, 8);

    return NextResponse.json({
      success: true,
      reportId,
      meta: {
        lifePathNumber: numerology.lifePathNumber,
        isMasterNumber: numerology.isMasterNumber,
        timePeriod: timePeriod
          ? { name: timePeriod.periodName, element: timePeriod.element, energyType: timePeriod.energyType }
          : null,
        cityTags: cityInfo?.tags || [],
      },
      bazi,
      lifeEnergy,
    });
  } catch (error: any) {
    console.error('八字排盘失败:', error);
    return NextResponse.json(
      { error: error.message || '八字排盘失败' },
      { status: 500 }
    );
  }
}
