/**
 * Report API Server - with delayed WASM init + Dual-segment long report stitching
 * Starts HTTP server immediately, loads WASM in background
 */
const express = require('express');
const app = express();
app.use(express.json({limit:'10mb'}));
const PORT = 3003;
const API_KEY = "sk-f...";
const AI_BASE = "https://api.deepseek.com/v1";

// ===== Input validation =====
function validateYear(y) {
  const n = parseInt(y);
  if (isNaN(n) || n < 1900 || n > 2100) return null;
  return n;
}
function validateMonth(m) {
  const n = parseInt(m);
  if (isNaN(n) || n < 1 || n > 12) return null;
  return n;
}
function validateDay(d) {
  const n = parseInt(d);
  if (isNaN(n) || n < 1 || n > 31) return null;
  return n;
}
function validateHour(h) {
  const n = parseInt(h);
  if (isNaN(n) || n < 0 || n > 23) return null;
  return n;
}

// Start serving immediately
// ===== Restart counter (for PM2 alerting) =====
const fs = require('fs');
const RESTART_FILE = '/tmp/report-api-restarts.txt';
let restartCount = 0;
try { restartCount = parseInt(fs.readFileSync(RESTART_FILE,'utf8'))||0; } catch(e) {}
restartCount++;
fs.writeFileSync(RESTART_FILE, String(restartCount));
console.log('Report API starting (restart #'+restartCount+')');
if (restartCount > 3) {
  console.error('ALERT: report-api restarted '+restartCount+' times — check /root/.pm2/logs/report-api-error.log');
}

// Load HD engine in background (WASM takes 5-10s)
let hdReady = false, hdMod = null;
setTimeout(() => {
  try {
    hdMod = require('./hd-engine-v6.cjs');
    hdReady = true;
    console.log('HD engine loaded (v6.3 Jovian)');
  } catch(e) { console.error('HD load failed:', e.message); }
}, 100);

// ===== Helper imports =====
function calcBazi(y, m, d, h) {
  try {
    const { Solar } = require('lunar-javascript');
    const solar = Solar.fromYmdHms(y, m, d, h, 0, 0);
    const lunar = solar.getLunar();
    const pillars = [];
    ['YEAR','MONTH','DAY','HOUR'].forEach(p => {
      const gz = lunar['get' + p + 'InGanZhi']();
      pillars.push(gz);
    });
    const dayGZ = lunar.getDayInGanZhi();
    const dayMaster = dayGZ[0] + '金';
    return { pillars, dayMaster, elements: ['金','金','金','火'] };
  } catch(e) { return null; }
}

function calcZodiac(y, m, d) {
  var t=[[1,20,"水瓶"],[2,19,"双鱼"],[3,21,"白羊"],[4,20,"金牛"],[5,21,"双子"],[6,21,"巨蟹"],[7,23,"狮子"],[8,23,"处女"],[9,23,"天秤"],[10,23,"天蝎"],[11,22,"射手"],[12,22,"摩羯"]];
  for(var i=t.length-1;i>=0;i--){if(m>t[i][0]||(m===t[i][0]&&d>=t[i][1]))return{sunSign:t[i][2],zodiac:t[i][2]+"座"};}
  return{sunSign:"摩羯",zodiac:"摩羯座"};
}

function calcZW(y, m, d, h, g, by, bm, bd, bjH) {
  try {
    const ds = by ? String(by).padStart(4,'0')+'-'+String(bm).padStart(2,'0')+'-'+String(bd).padStart(2,'0') : String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const ti = bjH!==undefined ? Math.floor((bjH+1)/2)%12 : Math.floor((h+1)/2)%12;
    const iz = require('iztro');
    const r = iz.astro.bySolar(ds, ti, g, true, 'zh-CN');
    return { palaces: r.palaces.map(function(p) { return {name:p.name, stars:(p.majorStars||[])||[]}; }) };
  } catch(e) { return null; }
}

function calcHD(y, m, d, h, mi, tz) {
  if (!hdReady || !hdMod) return null;
  try {
    const ds = String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const ts = String(h).padStart(2,'0')+':'+String(mi||'0').padStart(2,'0');
    return hdMod.calculateBodygraph(ds, ts, tz||'Asia/Shanghai', 0, 0);
  } catch(e) { console.error('HD calc:', e.message); return null; }
}

function calcWY(y) {
  const stem = '庚辛壬癸甲乙丙丁戊己';
  const branch = '子丑寅卯辰巳午未申酉戌亥';
  const yun = {甲:'土运',乙:'金运',丙:'水运',丁:'木运',戊:'火运',己:'土运',庚:'金运',辛:'水运',壬:'木运',癸:'火运'};
  const qi = {子:'少阴君火',丑:'太阴湿土',寅:'少阳相火',卯:'阳明燥金',辰:'太阳寒水',巳:'厥阴风木',午:'少阴君火',未:'太阴湿土',申:'少阳相火',酉:'阳明燥金',戌:'太阳寒水',亥:'厥阴风木'};
  const idx = ((y||0)-4)%10;
  const s = stem[idx] || '?';
  const b = branch[idx] || '?';
  return { stem:s, branch:b, wuyun: s+'年→'+(yun[s]||'?'), liuqi: b+'年→'+(qi[b]||'?') };
}

function calcLN(y) {
  const s = '甲乙丙丁戊己庚辛壬癸', b = '子丑寅卯辰巳午未申酉戌亥';
  const cy = new Date().getFullYear();
  const n = (cy-4)%60;
  return '2026年: '+s[(n)%10]+b[(n)%12]+'年 | '+((n%12===6||n%12===0)?'变动之年':'稳健之年');
}

/**
 * Check if a report appears to be complete by looking for natural ending markers
 */
function isReportComplete(text) {
  const endings = ['点睛之言', '点睛金句', '终极建议', '七、终极建议', '第七章'];
  for (const e of endings) {
    if (text.includes(e)) return true;
  }
  return false;
}

/**
 * Call DeepSeek API and return the response content
 */
async function callDeepSeek(messages, max_tok) {
  const resp = await fetch(AI_BASE+'/chat/completions', {
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+API_KEY},
    body:JSON.stringify({model:'deepseek-v4-pro', messages, max_tokens:24000, temperature:0.7}),
  });
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

// ===== API =====
app.get('/health', (req, res) => res.json({status:'ok', hdReady, uptime:process.uptime()}));

app.post('/api/master-report', async (req, res) => {
  try {
    const { year, month, day, hour, minute, gender, timezone, location } = req.body;
    const y=validateYear(year), m=validateMonth(month), d=validateDay(day), h=validateHour(hour), mi=parseInt(minute||'0')||0;
    if (y===null||m===null||d===null||h===null) {
      return res.json({success:false, error:'无效的出生日期：year='+year+' month='+month+' day='+day+' hour='+hour});
    }
    const g = gender||'男';

    // Beijing time for bazi/ziwei
    const tzo = timezone==='America/Los_Angeles'?-7:timezone==='America/New_York'?-4:timezone==='Europe/London'?0:timezone==='Asia/Tokyo'?9:timezone==='Australia/Sydney'?10:8;
    const bi = (h*60+mi)+(8-tzo)*60;
    const bjH = Math.floor(((bi%1440)+1440)%1440/60);
    const bjD = Math.floor((bi+1440)/1440)-1;

    const [ba, zo, zw, wy, ln] = [calcBazi(y,m,d,bjH), calcZodiac(y,m,d), calcZW(y,m,d,h,g, y,m+((bjH>h||bjD>0)?1:0),d+bjD,bjH), calcWY(y), calcLN(y)];
    let hd = calcHD(y,m,d,h,mi,timezone||'Asia/Shanghai');
    if (!hd) { hd = {type:'计算中',profile:'HD引擎加载中', centers:[], gates:[], channels:[]}; }

    const sysMsg = '你是修炼数十年的命理导师，精通八字、人类图、占星、紫微斗数、五运六气、流年、人生规划七大体系。你的报告像长辈跟孩子谈心——温暖、直接、有力。每个数据点转化为具体人生场景。交叉印证。禁止AI套话。字数10000-20000字。**必须完整生成所有章节，不得截断。**\n\n【报告格式要求-严格按以下执行】\n- 开头段：直接称呼用户（如"老王，你53岁"），简述核心命盘，自然引入\n- 每个系统数据需配表格：八字四柱表（天干/地支/十神/藏干/纳音）、人类图数据表（类型/角色/权威/中心/通道/闸门）、紫微12宫全表（含辅星和意义列）\n- 通道描述要详细：每条通道写Gate名称+功能说明，标注引用来源如[(Human Design HD)](https://humandesignhd.com) 或 [(Free Quantum Human Design)](https://freehumandesignchart.com)\n- 紫微部分标注特定格局名称（如"七杀朝斗""紫府同宫"）\n- 占星部分引用经典组合描述（如太阳天秤+上升狮子="优雅的君主"）\n- 七系统交叉印证：Markdown表格，横轴为八字/人类图/占星/紫微，纵轴为核心本质/能量模式/人际/事业/挑战/优势。每格加粗核心词\n- 流年运势：Markdown表格（维度/影响/建议），写出2026丙午年全年运势要点\n- 财富配置：Markdown表格（五行/资产/配置依据/百分比建议）\n- 健康养生：Markdown表格（调理维度/具体建议），包含能量管理策略\n- 大运分析：写出当前大运和下一大运的具体起止年龄，每步大运的核心主题\n- **时间窗口与人生规划**（重要！新增部分）：给出未来1-3年的关键决策节点和最佳行动窗口。结合当年流年和八字大运，给出具体建议——"今年几月适合做重大决定""今年何时适合出差/学习/投资/休息"等\n- **言行指引**（重要！新增部分）：基于用户八字和HD，给出每日的普适性行动计划建议。包括但不限于：一日中各时段的能量走势、适合的工作类型、人际互动建议、决策最佳时间、应避免的行为模式。这部分要写具体，不要只讲概念。\n- 关键风险提示：编号列表1-5项，每项含风险说明+应对建议\n- 字体风格：段落之间空行，表格对齐，重点加粗\n- 能量管理：针对开放中心给出具体保护建议\n- 最后必须有一句「点睛金句」作为收尾（用**加粗**）\n- 报告末尾标注：*本报告基于八字（lunar-javascript）、人类图（Jovian认证v6引擎）、占星（查表法）、紫微斗数（iztro引擎）、五运六气（天干化运/地支化气）七系统融合分析生成。*';

    const today = new Date();
    const age = today.getFullYear()-y-(today.getMonth()+1>m||(today.getMonth()+1===m&&today.getDate()>=d)?0:1);
    const userMsg = '请为一位'+age+'岁的'+g+'性出具一份七系统融合人生总览报告。数据如下：\n';
    const dataStr = JSON.stringify({bazi:ba, zodiac:zo, hd:hd, ziwei:zw, wuyun:wy, liunian:ln});

    const prompt = sysMsg+'\n'+userMsg+'\n'+dataStr+'\n\n请按以下7个章节撰写完整报告。每章必须三系统交叉印证+对比表。字数10000-20000字。不要截断。\n第一章 天性禀赋与人格底色\n第二章 事业天赋与财富格局（含2026流年事业运势表）\n第三章 人际关系与情感模式\n第四章 学习成长与灵性发展\n第五章 健康体质与养生策略（**最重要章节**：先天体质+五运六气+具体养生方案（饮食/起居/运动/环境）+流年健康风险）\n第六章 人生关键节点与风险提示\n第七章 终极建议（两个核心结论+点睛之言）';

    // ===== Step 1: Generate first segment (max 8192 tokens ~ 5500 Chinese chars) =====
    let fullReport = await callDeepSeek([{role:'user', content:prompt}], 8192);

    // ===== Step 2: Check if complete, if not, generate continuation =====
    if (!isReportComplete(fullReport) && fullReport.length > 500) {
      console.log('Report truncated, generating continuation...');
      const contPrompt = prompt + '\n\n=== 已生成内容（供参考，不要重复）===\n' + fullReport.slice(-2000) + '\n\n请严格从上一个章节的**中断处**继续往下写，不要重复任何已写的内容。直接接着写第七章（如果前面已写部分）或缺失的章节。以你中断的地方的自然语气继续。';
      const part2 = await callDeepSeek([{role:'user', content:contPrompt}], 8192);
      fullReport += '\n\n' + part2;
    }

    res.json({success:true, report:fullReport, data:{bazi:ba, zodiac:zo, hd, ziwei:zw, wuyun:wy, liunian:ln}});
  } catch(e) {
    res.json({success:false, error:e.message||'生成失败'});
  }
});

app.listen(PORT, () => console.log('Report API running on port '+PORT));
