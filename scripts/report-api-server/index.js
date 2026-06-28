/**
 * 七系统融合报告生成 API 服务
 * 运行在阿里云服务器，无Vercel 10s超时限制
 * PM2管理，端口3003
 */
const express = require('express');
const app = express();
app.use(express.json({limit:'10mb'}));

const PORT = 3003;
const API_KEY = "sk-c2c7afa08ffe493cb6b980995227d079";
const AI_BASE = "https://api.deepseek.com/v1";

// ===== 八字 =====
function calcBazi(y, m, d, h) {
  try {
    const { Solar } = require('lunar-javascript');
    const solar = Solar.fromYmdHms(y, m, d, h, 0, 0);
    const lunar = solar.getLunar();
    const pillars = [
      lunar.getYearInGanZhiExact(), lunar.getMonthInGanZhiExact(),
      lunar.getDayInGanZhiExact(), lunar.getTimeInGanZhi()
    ];
    const dm = lunar.getDayGan();
    const el = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
    return { pillars, dayMaster: `${dm}（${el[dm]}）` };
  } catch (e) { return null; }
}

// ===== 人类图(v6.3 带Jovian校准) =====
function calcHD(y, m, d, h, tz) {
  try {
    const mod = require('./hd-engine-v6.cjs');
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ts = `${String(h).padStart(2,'0')}:00`;
    return mod.calculateBodygraph(ds, ts, tz, 0, 0);
  } catch (e) { return null; }
}

// ===== 紫微斗数 =====
function calcZW(y, m, d, h, g) {
  try {
    const iztro = require('iztro');
    const ti = Math.floor((h + 1) / 2) % 12;
    const ds = `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const r = iztro.astro.bySolar(ds, ti, g, true, 'zh-CN');
    if (!r?.palaces) return null;
    return {
      palaces: r.palaces.map(p => ({
        name: p.name,
        stars: [...(p.majorStars||[]).map(s=>typeof s==='object'?s.name:s),
                 ...(p.minorStars||[]).map(s=>typeof s==='object'?s.name:s)].filter(Boolean),
      })),
    };
  } catch (e) { return null; }
}

// ===== 占星 =====
function calcZodiac(y, m, d) {
  const signs = ['摩羯','水瓶','双鱼','白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手'];
  const doy = Math.floor((Date.UTC(y,m-1,d)-Date.UTC(y,0,0))/86400000);
  const idx = Math.floor((doy-(y%4===0&&(y%100!==0||y%400===0)?79:80))/30.44);
  return { sunSign: (idx>=0&&idx<12)?signs[idx]:'未知', zodiac: `${(idx>=0&&idx<12)?signs[idx]:'未知'}座` };
}

// ===== 五运六气 =====
function calcWY(y) {
  const stem = '庚辛壬癸甲乙丙丁戊己'[(y-4)%10];
  const branch = '子丑寅卯辰巳午未申酉戌亥'[(y-4)%12];
  const yun = {甲:'土运',乙:'金运',丙:'水运',丁:'木运',戊:'火运',己:'土运',庚:'金运',辛:'水运',壬:'木运',癸:'火运'};
  const qi = {子:'少阴君火',丑:'太阴湿土',寅:'少阳相火',卯:'阳明燥金',辰:'太阳寒水',巳:'厥阴风木',
              午:'少阴君火',未:'太阴湿土',申:'少阳相火',酉:'阳明燥金',戌:'太阳寒水',亥:'厥阴风木'};
  return { stem, branch, wuyun: `${stem}年→${yun[stem]}`, liuqi: `${branch}年→${qi[branch]}` };
}

// ===== 流年 =====
function calcLN(y) {
  const s = '甲乙丙丁戊己庚辛壬癸', b = '子丑寅卯辰巳午未申酉戌亥';
  const cy = new Date().getFullYear();
  return `出生：${s[(y-4)%10]}${b[(y-4)%12]}年 | 流年：${s[(cy-4)%10]}${b[(cy-4)%12]}年（${cy}年）`;
}

// ===== 主API =====
app.post('/api/master-report', async (req, res) => {
  try {
    const { year, month, day, hour, gender } = req.body;
    const y=+year, m=+month, d=+day, h=hour!==undefined?+hour:12, g=gender==='女'?'女':'男';
    const now = new Date();
    const age = now.getFullYear() - y - (now.getMonth()+1<m||(now.getMonth()+1===m&&now.getDate()<d)?1:0);

    // 并行算所有系统
    const [bazi, hd, zw, zodiac, wy, ln] = await Promise.all([
      Promise.resolve(calcBazi(y,m,d,h)),
      Promise.resolve(calcHD(y,m,d,h,'Asia/Shanghai')),
      Promise.resolve(calcZW(y,m,d,h,g)),
      Promise.resolve(calcZodiac(y,m,d)),
      Promise.resolve(calcWY(y)),
      Promise.resolve(calcLN(y)),
    ]);

    // 构建提示词
    const prompt = `你是一位修炼数十年的命理导师，精通八字命理、人类图(Human Design)、西方占星、紫微斗数、五运六气、流年运势、人生规划七大体系。

【核心要求】
- 你写的是「人生传记」而非「算法报告」——每个数据点都要转化成具体的人生场景和可操作建议
- 七系统必须交叉印证，找到内在联系，不能分段罗列
- 语言要像长辈跟孩子谈心——温暖、直接、有力，绝不回避尖锐话题

【输出规范】
- 总字数：5000-8000字
- 每个分析维度不能少于400字
- 每个维度结尾必须有一句可以立即执行的具体建议
- 最后必须有「一句话点睛」

【铁律】
1. 禁止使用：「让我们来看看」「首先」「其次」「在当今这个时代」「值得一提的是」「总的来说」「综上所述」
2. 每个数据必须对应具体人生场景
3. 必须对数据不足的部分标注「基于现有信息」

请为一位${age}岁的${g}性撰写人生总览报告。

【一、八字命盘】
四柱：${bazi?.pillars?.join(' ')||'无'}
日主：${bazi?.dayMaster||'无'}

${hd ? `【二、人类图】
类型：${hd.type} | 角色：${hd.profile}
权威：${hd.authority} | 策略：${hd.strategy}
签名：${hd.signature} | 非自我：${hd.notSelfTheme}
定义中心：${(hd.definedCenters||[]).join('、')||'无'}
未定义：${(hd.undefinedCenters||[]).join('、')||'无'}
通道：${(hd.channels||[]).join('、')||'无'}
激活闸门：${(hd.activatedGates||[]).join('、')||'无'}` : '【二、人类图】数据暂缺'}

${zw ? `【三、紫微斗数】
${zw.palaces.map(p => `${p.name}宫：${p.stars.slice(0,5).join('、')||'无主星'}`).join('\n')}` : '【三、紫微斗数】数据暂缺'}

【四、西方占星】
太阳星座：${zodiac?.zodiac||'无'}

【五、五运六气】
${wy?.wuyun||'无'} | ${wy?.liuqi||'无'}

【六、流年运势】
${ln||'无'}

【七、报告结构】
请按以下七个维度撰写，每个维度不少于400字：
1. 天性禀赋与人格底色（八字日主+人类图类型+星座交叉印证）
2. 事业天赋与财富格局
3. 人际关系与情感模式
4. 学习成长与灵性发展
5. 健康体质与五运六气
6. 人生关键节点与风险提示（结合流年大运）
7. 给${age}岁${g}性的终极建议`;

    // 调DeepSeek V4 Pro（无时间限制！）
    const dsRes = await fetch(`${AI_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-v4-pro',
        messages: [
          { role: 'system', content: '你是修炼数十年的命理导师，精通八字命理、人类图、西方占星、紫微斗数、五运六气、流年运势、人生规划七大体系。你的报告要写成「人生传记」而非「算法报告」。语言要像长辈跟孩子谈心——温暖、直接、有力。总字数6000-8000字。禁止AI套话。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 12000,
        temperature: 0.8,
      }),
    });
    const dsData = await dsRes.json();
    const report = dsData?.choices?.[0]?.message?.content || '';

    res.json({
      success: true,
      report,
      data: {
        bazi: bazi ? { pillars: bazi.pillars, dayMaster: bazi.dayMaster } : null,
        hd: hd ? { type: hd.type, profile: hd.profile, authority: hd.authority, channels: hd.channels } : null,
        ziwei: zw ? { palaces: zw.palaces } : null,
        zodiac, wuyun: wy, liunian: ln,
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.listen(PORT, '0.0.0.0', () => console.log(`Report API running on port ${PORT}`));
