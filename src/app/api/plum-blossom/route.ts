/**
 * 梅花易数起卦 API
 * 
 * 根据出生日期或流年起卦，返回本卦/变卦/互卦/体用/六亲/纳甲/世应
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  divinateByDate,
  divinateByYear,
  divinateByNumbers,
  getTrigramEmoji,
  PlumBlossomResult,
} from '@/lib/plum-blossom';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, year, month, day, hour, targetYear, num1, num2 } = body;

    let result: PlumBlossomResult;

    switch (type) {
      case 'date':
        // 根据出生日期起卦
        if (!year || !month || !day) {
          return NextResponse.json({ error: '需要完整的出生日期' }, { status: 400 });
        }
        result = divinateByDate(
          parseInt(year),
          parseInt(month),
          parseInt(day),
          hour ? parseInt(hour) : undefined,
        );
        break;

      case 'year':
        // 根据流年起卦
        if (!year || !month || !day || !targetYear) {
          return NextResponse.json({ error: '需要出生日期和目标年份' }, { status: 400 });
        }
        result = divinateByYear(
          parseInt(year),
          parseInt(month),
          parseInt(day),
          parseInt(targetYear),
          hour ? parseInt(hour) : undefined,
        );
        break;

      case 'numbers':
        // 根据两个数字起卦
        if (num1 === undefined || num2 === undefined) {
          return NextResponse.json({ error: '需要两个数字' }, { status: 400 });
        }
        result = divinateByNumbers(num1, num2);
        break;

      default:
        // 默认用当前日期流年起卦
        const now = new Date();
        result = divinateByDate(
          now.getFullYear(),
          now.getMonth() + 1,
          now.getDate(),
          now.getHours(),
        );
    }

    // 清理输出 - 只返回可序列化的数据
    return NextResponse.json({
      success: true,
      hexagram: {
        // 本卦
        primary: {
          name: result.primary.name,
          code: result.primary.code,
          upper: result.primary.upper,
          lower: result.primary.lower,
          judgment: result.primary.judgment,
          lines: result.primary.lines,
        },
        // 变卦
        changing: result.changing ? {
          name: result.changing.name,
          code: result.changing.code,
          upper: result.changing.upper,
          lower: result.changing.lower,
          judgment: result.changing.judgment,
        } : null,
        // 互卦
        mutual: result.mutual ? {
          name: result.mutual.name,
          code: result.mutual.code,
          upper: result.mutual.upper,
          lower: result.mutual.lower,
          judgment: result.mutual.judgment,
        } : null,
        // 体用
        bodyTrigram: result.bodyTrigram,
        useTrigram: result.useTrigram,
        bodyUseRelation: result.bodyUseRelation,
        movingLine: result.movingLine,
        // 京氏易
        sixRelations: result.sixRelations,
        shiYing: result.shiYing,
        nayinStem: result.nayinStem,
        nayinBranch: result.nayinBranch,
        // 综合
        interpretation: result.interpretation,
      },
    });
  } catch (error: any) {
    console.error('起卦失败:', error);
    return NextResponse.json(
      { error: error.message || '起卦失败' },
      { status: 500 },
    );
  }
}
