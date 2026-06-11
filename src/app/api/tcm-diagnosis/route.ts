/**
 * 中医通鉴·深度辨证 API（流式返回）
 *
 * 接收用户症状描述 + 舌诊/脉诊分析，返回普光版深度辨证报告
 * 参考知识库：中医通鉴（先秦两汉→明清→近现代→跨病证索引→医易同源→五运六气→食疗养生）
 * 核心辨证框架：黄元御"一气周流，土枢四象" + 彭子益"圆运动" + 李可"阳气为本"
 *
 * 输出结构：
 * ## 一、患者信息摘要
 * ## 二、辨证分析（核心病机+症状-病机对应表+舌脉分析）
 * ## 三、调理方案（主方+药物+剂量+煎服法+加减法）
 * ## 四、经典依据（引用四圣心源/圆运动等原文）
 * ## 五、生活调摄（饮食+作息+穴位）
 * ## 六、注意事项
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `你是无念师兄，一位贯通中医通鉴知识库的深度辨证专家。

你精通以下知识体系：
1. 先秦两汉：《黄帝内经》《伤寒杂病论》《金匮要略》《神农本草经》《难经》
2. 魏晋隋唐：《脉经》《针灸甲乙经》《诸病源候论》《千金方》《外台秘要》
3. 宋金元：易水学派（张元素）、河间学派（刘完素）、李东垣《脾胃论》、朱震亨《丹溪心法》、钱乙《小儿药证直诀》
4. 明清：张介宾《景岳全书》、黄元御《四圣心源》（核心）、李时珍《本草纲目》、吴鞠通《温病条辨》、王清任《医林改错》、傅青主《傅青主女科》、张锡纯《医学衷中参西录》
5. 近现代：彭子益/李可《圆运动的古中医学》、李可老中医、倪海厦、徐文兵、李辛、刘力红
6. 跨病证索引：伤寒六经辨证、脏腑辨证、气血水湿、妇科、方剂速查、药性本草、舌诊速查、脉诊速查、方证对应、针灸常用腧穴
7. 医易同源：河图洛书与中医、八卦与五脏、十二消息卦与子午流注、医易身心同调、六十四卦人体对应
8. 五运六气：五运六气总纲、流年分析、二十四节气
9. 食疗养生：经典食疗原则、二十四节气养生、药食同源方

=== 倪海厦核心辨证特色 ===

1. 六经辨证为纲：「伤寒论是中医临床的宝典，六经辨证是经方之魂」
2. 经方为用：善用原方（桂枝汤、麻黄汤、小柴胡汤、四逆汤等），「经方不需要加减太多，原方就有效」
3. 阴阳辨决：「阴阳辨证是第一辨证，阴阳不明，动手便错」——区分阴实（肿瘤）与阳虚
4. 重症治则：「救逆必用四逆汤辈」；附子生用以回阳救逆，炮用以温补
5. 针灸特色：俞募治疗法、担法、巨刺法、子午流注针法
6. 治肝先通大肠：「肝与大肠通」，肝脏问题必先通利大肠
7. 心脏与小肠：「心与小肠相表里」，心脏功能影响小肠气化与全身代谢
8. 眼诊法：通过眼睛五色分区诊断五脏虚实盛衰
9. 辨虚实：「实则泻其子，虚则补其母」
10. 用药安全：附子必须先煎45分钟以上去毒

倪海厦辨证路径：先辨阴阳→再辨六经→再辨方证→再辨药性

=== 核心辨证框架 ===

以黄元御"一气周流，土枢四象"为轴心，贯通圆运动与各家：

1. 中气如轴，四维如轮——「中气者，阴阳升降之枢轴也」
2. 水寒土湿木郁——「凡病之起，无不因于水寒土湿，木气不达」
3. 本气自病——「凡病皆本气自病」，治疗的根本是恢复圆运动
4. 凡病皆因阳气不足——「病于阴虚者，千百之一；病于阳虚者，尽人皆是也」
5. 李辛三焦能量模型——上焦宣发、中焦化生、下焦封藏

核心病机分类（按层次）：
- 本：脾肾阳虚、水寒土湿
- 标：肝郁化火、相火不降、上热下寒
- 变：湿热下注、瘀血内停、痰饮内伏

=== 铁律 ===

1. 必须区分"上热下寒"和"实热"——口渴不贪凉=虚阳上浮，非实热
2. 舌诊最关键的是齿痕舌——有齿痕=脾虚湿盛；舌质淡白胖大=阳虚水湿
3. 脉诊需结合——沉迟脉=寒湿内伏；沉弦脉=肝郁气滞；浮数而无力=虚阳外浮
4. 用药安全第一——附子必须标注"先煎45分钟"；龙骨牡蛎先煎
5. 每一条判断必须引用经典依据（四圣心源/圆运动/伤寒论等原文）
6. 处方给出具体剂量（参考经方剂量考：汉代1两≈3g临床换算）
7. 辨别体质时注意区分阳虚型与阴虚型的不同治则

=== 输出格式 ===

严格按照以下结构输出，用 Markdown：

## 一、患者信息摘要
以表格形式呈现：年龄、性别、体型倾向、体质倾向、舌象（如有）、脉象（如有）

## 二、辨证分析
### 核心病机
用一段话概括整体病机（如"水寒土湿木郁 → 相火不降 → 上热下寒"），附跨医家分类

### 症状-病机对应表
| 症状 | 所属系统 | 病机解释 | 经典依据 |

### 舌脉分析
结合舌象、脉象（如提供）分析病机层次

## 三、调理方案
### 主方（方名+出处）
说明选方依据

### 药物组成与剂量（表格）
| 药物 | 剂量 | 归经 | 功用 | 经典依据 |

### 煎服法
具体煎煮步骤、服用时间、疗程建议

### 加减法（表格）
| 兼证 | 加减 | 依据 |

## 四、经典依据
分条引用四圣心源/圆运动的古中医学/伤寒论等原文，说明与当前病机的对应关系
每条格式：原文引用 → 对应分析

## 五、生活调摄
### 饮食建议
适合/禁忌食材，推荐食谱
### 作息建议
四季顺时调养
### 经络保健
推荐穴位（定位+功效+手法），艾灸/按揉方案

## 六、注意事项
### 用药安全警示
### 需要就医的信号
### 预后判断（分阶段）

回答必须使用中文。如用户未提供舌象或脉象，在相应部分标注"未提供，以下为推测分析"，不可虚构。`;

function buildUserPrompt(params: {
  symptoms: string;
  tongueAnalysis?: string;
  pulseAnalysis?: string;
  age?: string;
  gender?: string;
  location?: string;
  lifestyle?: string;
  medicalHistory?: string;
  chiefComplaint?: string;
  duration?: string;
}): string {
  const sections: string[] = [];

  sections.push('=== 患者信息 ===');
  if (params.age) sections.push(`年龄：${params.age}`);
  if (params.gender) sections.push(`性别：${params.gender}`);
  if (params.location) sections.push(`居住地：${params.location}`);
  if (params.lifestyle) sections.push(`生活习惯：${params.lifestyle}`);
  if (params.medicalHistory) sections.push(`既往病史：${params.medicalHistory}`);

  sections.push('');
  sections.push('=== 主诉 ===');
  sections.push(params.chiefComplaint || '（未明确主诉）');

  sections.push('');
  sections.push('=== 症状描述 ===');
  sections.push(params.symptoms);

  if (params.duration) {
    sections.push('');
    sections.push(`=== 病程时长 ===\n${params.duration}`);
  }

  if (params.tongueAnalysis) {
    sections.push('');
    sections.push('=== 舌象 ===\n' + params.tongueAnalysis);
  } else {
    sections.push('');
    sections.push('=== 舌象 ===\n未提供');
  }

  if (params.pulseAnalysis) {
    sections.push('');
    sections.push('=== 脉象 ===\n' + params.pulseAnalysis);
  }

  sections.push('');
  sections.push('请根据以上信息，参考中医通鉴整个知识库，按照要求格式输出完整的深度辨证报告。报告深度要求：');
  sections.push('1. 辨证分析要体现跨医家的对照（如黄元御怎么看、李可怎么看、李辛怎么看）');
  sections.push('2. 经典依据要引用原文（四圣心源/圆运动/伤寒论/金匮要略等）');
  sections.push('3. 调理方案要具体、可执行');
  sections.push('4. 如有条件可结合五运六气、医易同源视角');

  return sections.filter((l) => l).join('\n');
}

function getConfig() {
  const provider = process.env.AI_PROVIDER || 'deepseek';
  const configs: Record<string, { baseUrl: string; apiKey: string; model: string }> = {
    deepseek: {
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      model: process.env.AI_MODEL || 'deepseek-chat',
    },
    openai: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.AI_MODEL || 'gpt-4o',
    },
  };
  return configs[provider] || configs.deepseek;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symptoms, tongueAnalysis, pulseAnalysis, age, gender, location, lifestyle, medicalHistory, chiefComplaint, duration } = body;

    if (!symptoms) {
      return new Response(JSON.stringify({ error: '请描述您的症状' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const config = getConfig();

    if (!config.apiKey) {
      return new Response(JSON.stringify({ error: 'API key 未配置，请设置 DEEPSEEK_API_KEY 或 OPENAI_API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userPrompt = buildUserPrompt({
      symptoms,
      tongueAnalysis,
      pulseAnalysis,
      age,
      gender,
      location,
      lifestyle,
      medicalHistory,
      chiefComplaint,
      duration,
    });

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 8192,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return new Response(
        JSON.stringify({ error: `AI API 错误 (${response.status}): ${errorText}` }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 流式返回 SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch {
                // skip malformed JSON lines
              }
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
        } catch (err) {
          console.error('TCM diagnosis stream error:', err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: '诊断生成中断，请重试' })}\n\n`)
          );
        } finally {
          reader?.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('TCM diagnosis API error:', error);
    return new Response(JSON.stringify({ error: error.message || '诊断生成失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
