import { NextRequest, NextResponse } from 'next/server';
import { calculateLifePathNumber } from '@/lib/numerology';
import { getTimePeriod } from '@/lib/time-period';
import { lookupCity } from '@/lib/city';
import { buildUserContext } from '@/lib/prompts';
import { generateReportInOneCall } from '@/lib/ai';
import { calculateBazi, generateLifeEnergy } from '@/lib/bazi';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, location, gender, timezone } = body;

    // 参数校验
    if (!year || !month || !day) {
      return NextResponse.json(
        { error: '请填写完整的出生日期' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);

    // 1. 计算生命路径数字
    const numerology = calculateLifePathNumber(yearNum, monthNum, dayNum);

    // 2. 计算出生时辰
    const timePeriod = hour ? getTimePeriod(parseInt(hour, 10)) : null;

    // 3. 匹配城市/地域文化标签
    const cityInfo = location ? lookupCity(location) : null;

    // 🔮 新增：计算真实八字
    const bazi = calculateBazi(yearNum, monthNum, dayNum, hour ? parseInt(hour, 10) : undefined);

    // 📈 新增：生成人生能量曲线
    const lifeEnergy = generateLifeEnergy(yearNum, monthNum, dayNum, bazi.dayMasterElement, bazi.elementDistribution);

    // 4. 构建 AI 上下文（注入八字信息，让AI更精准）
    const userContext = buildUserContext({
      year: yearNum,
      month: monthNum,
      day: dayNum,
      hour: hour ? parseInt(hour, 10) : undefined,
      location,
      gender: gender || undefined,
      timezone: timezone || undefined,
      lifePathNumber: numerology.lifePathNumber,
      isMasterNumber: numerology.isMasterNumber,
      timePeriod: timePeriod
        ? `${timePeriod.periodName}（${timePeriod.timeRange}）— ${timePeriod.energyType}：${timePeriod.description}`
        : null,
      cityTags: cityInfo?.tags || [],
      cityDescription: cityInfo?.description || null,
    });

    // 5. 生成报告
    const reportContent = await generateReportInOneCall(userContext);

    // 6. 生成报告 ID
    const reportId = crypto
      .createHash('md5')
      .update(`${year}-${month}-${day}-${hour || '?'}-${location || '?'}`)
      .digest('hex')
      .slice(0, 8);

    return NextResponse.json({
      success: true,
      reportId,
      report: reportContent,
      meta: {
        lifePathNumber: numerology.lifePathNumber,
        isMasterNumber: numerology.isMasterNumber,
        timePeriod: timePeriod
          ? { name: timePeriod.periodName, element: timePeriod.element, energyType: timePeriod.energyType }
          : null,
        cityTags: cityInfo?.tags || [],
      },
      // 🔮 新增数据
      bazi: {
        pillars: bazi.pillars,
        ganElements: bazi.ganElements,
        zhiElements: bazi.zhiElements,
        zodiac: bazi.zodiac,
        dayMaster: bazi.dayMaster,
        dayMasterElement: bazi.dayMasterElement,
        nayin: bazi.nayin,
        elementDistribution: bazi.elementDistribution,
        summary: bazi.summary,
      },
      lifeEnergy: {
        curve: lifeEnergy.curve,
        turningPoints: lifeEnergy.turningPoints,
        startLuckAge: lifeEnergy.startLuckAge,
        averageEnergy: lifeEnergy.averageEnergy,
      },
    });
  } catch (error: any) {
    console.error('生成报告失败:', error);
    return NextResponse.json(
      { error: error.message || '生成报告时发生错误，请稍后重试' },
      { status: 500 }
    );
  }
}
