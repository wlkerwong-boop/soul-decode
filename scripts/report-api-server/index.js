/**
 * Report API Server - with delayed WASM init + Dual-segment long report stitching
 * Starts HTTP server immediately, loads WASM in background
 */
const express = require('express');
const app = express();
app.use(express.json({limit:'10mb'}));
const PORT = 3003;
const API_KEY = "sk-c2c7afa08ffe493cb6b980995227d079";
const AI_BASE = "https://api.deepseek.com/v1";

// Start serving immediately
let hdReady = false, hdMod = null;

// Load HD engine in background (WASM takes 5-10s)
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
  const stem = '庚辛壬癸甲乙丙丁戊己'[(y-4)%10];
  const branch = '子丑寅卯辰巳午未申酉戌亥'[(y-4)%12];
  const yun = {甲:'土运',乙:'金运',丙:'水运',丁:'木运',戊:'火运',己:'土运',庚:'金运',辛:'水运',壬:'木运',癸:'火运'};
  const qi = {子:'少阴君火',丑:'太阴湿土',寅:'少阳相火',卯:'阳明燥金',辰:'太阳寒水',巳:'厥阴风木',午:'少阴君火',未:'太阴湿土',申:'少阳相火',酉:'阳明燥金',戌:'太阳寒水',亥:'厥阴风木'};
  return { stem, branch, wuyun: stem+'年→'+yun[stem], liuqi: branch+'年→'+qi[branch] };
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
    body:JSON.stringify({model:'deepseek-v4-pro', messages, max_tokens:16000, temperature:0.7}),
  });
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

// ===== API =====
app.get('/health', (req, res) => res.json({status:'ok', hdReady, uptime:process.uptime()}));

app.post('/api/master-report', async (req, res) => {
  try {
    const { year, month, day, hour, minute, gender, timezone, location } = req.body;
    const y=parseInt(year), m=parseInt(month), d=parseInt(day), h=parseInt(hour), mi=parseInt(minute||'0');
    const g = gender||'男';

    // Beijing time for bazi/ziwei
    const tzo = timezone==='America/Los_Angeles'?-7:timezone==='America/New_York'?-4:timezone==='Europe/London'?0:timezone==='Asia/Tokyo'?9:timezone==='Australia/Sydney'?10:8;
    const bi = (h*60+mi)+(8-tzo)*60;
    const bjH = Math.floor(((bi%1440)+1440)%1440/60);
    const bjD = Math.floor((bi+1440)/1440)-1;

    const [ba, zo, zw, wy, ln] = [calcBazi(y,m,d,bjH), calcZodiac(y,m,d), calcZW(y,m,d,h,g, y,m+((bjH>h||bjD>0)?1:0),d+bjD,bjH), calcWY(y), calcLN(y)];
    let hd = calcHD(y,m,d,h,mi,timezone||'Asia/Shanghai');
    if (!hd) { hd = {type:'计算中',profile:'HD引擎加载中', centers:[], gates:[], channels:[]}; }

    const sysMsg = '你是修炼数十年的命理导师，精通八字、人类图、占星、紫微斗数、五运六气、流年、人生规划七大体系。你的报告像长辈跟孩子谈心——温暖、直接、有力。每个数据点转化为具体人生场景。交叉印证。禁止AI套话。字数6000-8000字。**必须完整生成所有章节，不得截断。**';

    const today = new Date();
    const age = today.getFullYear()-y-(today.getMonth()+1>m||(today.getMonth()+1===m&&today.getDate()>=d)?0:1);
    const userMsg = '请为一位'+age+'岁的'+g+'性出具一份七系统融合人生总览报告。数据如下：\n';
    const dataStr = JSON.stringify({bazi:ba, zodiac:zo, hd:hd, ziwei:zw, wuyun:wy, liunian:ln});

    const prompt = sysMsg+'\n'+userMsg+'\n'+dataStr+'\n\n请按以下7个章节撰写完整报告。每章必须三系统交叉印证+对比表。字数6000-8000字。\n第一章 天性禀赋与人格底色\n第二章 事业天赋与财富格局（含2026流年事业运势表）\n第三章 人际关系与情感模式\n第四章 学习成长与灵性发展\n第五章 健康体质与养生策略（**最重要章节**：先天体质+五运六气+具体养生方案（饮食/起居/运动/环境）+流年健康风险）\n第六章 人生关键节点与风险提示\n第七章 终极建议（两个核心结论+点睛之言）';

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
