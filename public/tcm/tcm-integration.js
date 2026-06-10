/**
 * 中医通鉴 · 用户诊断关联系统
 * 
 * 在每个 /tcm/ 词条页面注入，读取用户已保存的诊断报告，
 * 显示"我的体质分析"浮动面板，并自动关联当前词条内容。
 */

(function() {
  'use strict';

  // ========== 配置 ==========
  const STORAGE_KEY = 'tcm-diagnosis-result';
  const LOCAL_KEY   = 'tcm-diagnosis-local';  // localStorage backup
  const FLOAT_ID    = 'tcm-float-btn';
  const PANEL_ID    = 'tcm-panel';

  // 常见证型关键词映射
  const SYNDROME_KEYWORDS = {
    '水寒土湿':     ['水寒', '土湿', '脾肾阳虚', '寒湿', '温阳', '附子', '干姜', '茯苓', '真武汤', '四逆汤', '黄芽汤', '天魂汤'],
    '脾肾阳虚':     ['脾肾阳虚', '脾阳', '肾阳', '温阳', '附子', '干姜', '四逆', '真武', '虚寒'],
    '痰湿':         ['痰湿', '湿浊', '化痰', '燥湿', '二陈', '温胆', '藿香', '佩兰'],
    '湿热':         ['湿热', '清热利湿', '黄柏', '茵陈', '龙胆', '甘露消毒', '下焦湿热'],
    '肝郁气滞':     ['肝郁', '气滞', '疏肝', '柴胡', '逍遥', '四逆散', '情志', '胁痛'],
    '肝血不足':     ['肝血', '养血', '当归', '白芍', '首乌', '目干', '筋脉'],
    '阴虚火旺':     ['阴虚', '火旺', '滋阴', '降火', '六味', '知柏', '麦冬', '玄参', '盗汗'],
    '气血两虚':     ['气血两虚', '气血不足', '补气养血', '八珍', '归脾', '人参', '黄芪', '当归'],
    '中气不足':     ['中气', '脾虚', '补中益气', '升陷', '黄芪', '人参', '白术'],
    '上热下寒':     ['上热下寒', '引火归元', '交泰', '潜阳', '龙牡', '肉桂'],
    '相火不降':     ['相火', '潜阳', '龙牡', '龙骨', '牡蛎', '引火', '敛降'],
    '湿热下注':     ['湿热下注', '下焦湿热', '黄柏', '泽泻', '萆薢', '车前'],
    '肺气虚':       ['肺气虚', '肺虚', '玉屏风', '补肺', '咳喘', '气虚'],
    '心血不足':     ['心血', '养心', '补心', '归脾', '酸枣仁', '远志'],
  };

  // ========== 初始化 ==========
  function init() {
    // 读取诊断数据
    let diagnosis = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(LOCAL_KEY);
    if (!diagnosis) {
      // 无诊断记录 → 显示轻量级入口
      showAssessmentPrompt();
      return;
    }

    // 保存到 localStorage 做跨session备份
    try { localStorage.setItem(LOCAL_KEY, diagnosis); } catch(e) {}

    // 提取证型关键词
    const syndrome = extractSyndrome(diagnosis);

    // 页面内容关联分析
    const relevance = analyzePageContent(syndrome);

    // 显示浮动按钮和面板
    createFloatingUI(diagnosis, syndrome, relevance);

    // 高亮页面中的相关关键词
    if (relevance.matched) {
      highlightKeywords(relevance.matchedKeywords);
    }
  }

  // ========== 证型提取 ==========
  function extractSyndrome(diagnosis) {
    const found = {};
    for (const [syndrome, keywords] of Object.entries(SYNDROME_KEYWORDS)) {
      let count = 0;
      for (const kw of keywords) {
        const re = new RegExp(kw, 'gi');
        const matches = diagnosis.match(re);
        if (matches) count += matches.length;
      }
      if (count > 0) {
        found[syndrome] = count;
      }
    }
    // 排序
    return Object.entries(found)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }

  // ========== 页面内容关联分析 ==========
  function analyzePageContent(syndrome) {
    if (!syndrome || syndrome.length === 0) {
      return { matched: false, matchedKeywords: [], relevance: 0 };
    }

    const pageText = document.body.innerText || '';
    const matchedKeywords = [];
    let totalMatches = 0;

    for (const s of syndrome) {
      const keywords = SYNDROME_KEYWORDS[s] || [];
      for (const kw of keywords) {
        const re = new RegExp(kw, 'gi');
        const matches = pageText.match(re);
        if (matches) {
          matchedKeywords.push({ keyword: kw, count: matches.length, syndrome: s });
          totalMatches += matches.length;
        }
      }
    }

    // 去重
    const unique = matchedKeywords.filter((item, index, self) => 
      index === self.findIndex(t => t.keyword === item.keyword)
    );

    return {
      matched: unique.length > 0,
      matchedKeywords: unique,
      relevance: totalMatches,
      primarySyndrome: syndrome[0] || '',
    };
  }

  // ========== 创建浮动UI ==========
  function createFloatingUI(diagnosis, syndrome, relevance) {
    // 浮动按钮
    const btn = document.createElement('div');
    btn.id = FLOAT_ID;
    btn.innerHTML = '🧘 我的体质';
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      background: linear-gradient(135deg, #c8a46c, #a8853e);
      color: #1a1a2e;
      padding: 12px 20px;
      border-radius: 30px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(200,164,108,0.4);
      transition: all 0.3s ease;
      border: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      user-select: none;
    `;
    btn.onmouseover = () => { btn.style.transform = 'scale(1.05)'; };
    btn.onmouseout = () => { btn.style.transform = 'scale(1)'; };
    btn.onclick = togglePanel;

    // 关联标签
    if (relevance.matched) {
      const badge = document.createElement('span');
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff6b6b;
        color: white;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: bold;
      `;
      badge.textContent = `${relevance.relevance}处匹配`;
      btn.appendChild(badge);
    }

    document.body.appendChild(btn);

    // 面板
    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 24px;
      z-index: 9998;
      width: 380px;
      max-height: 70vh;
      background: #1a1a2e;
      border: 1px solid #c8a46c40;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
      overflow-y: auto;
      display: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #e0dccd;
      font-size: 13px;
      line-height: 1.6;
    `;

    // 面板内容
    const panelContent = buildPanelContent(diagnosis, syndrome, relevance);
    panel.innerHTML = panelContent;

    document.body.appendChild(panel);
  }

  // ========== 构建面板内容 ==========
  function buildPanelContent(diagnosis, syndrome, relevance) {
    const syndromeDisplay = syndrome.length > 0
      ? syndrome.map(s => `<span style="display:inline-block;background:#c8a46c20;color:#c8a46c;padding:2px 10px;border-radius:12px;margin:3px 4px;font-size:12px;border:1px solid #c8a46c40">${s}</span>`).join('')
      : '<span style="color:#888">未识别</span>';

    const relevanceDisplay = relevance.matched
      ? `<div style="background:#2a1a1a;border-radius:8px;padding:10px;margin:8px 0;border-left:3px solid #c8a46c">
          <div style="color:#c8a46c;font-size:12px;margin-bottom:4px">📖 当前词条与你的体质相关</div>
          <div style="color:#aaa;font-size:11px">涉及 ${relevance.matchedKeywords.length} 个关键词，共 ${relevance.relevance} 处匹配</div>
         </div>`
      : '';

    // 从报告中提取摘要
    const summary = extractSummary(diagnosis);

    return `
      <div style="padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="font-size:16px;font-weight:700;color:#c8a46c">🧘 你的中医分析</div>
          <button onclick="document.getElementById('${PANEL_ID}').style.display='none';document.getElementById('${FLOAT_ID}').style.display='flex'" 
            style="background:none;border:none;color:#666;cursor:pointer;font-size:18px">✕</button>
        </div>

        ${relevanceDisplay}

        <div style="margin:10px 0">
          <div style="color:#888;font-size:11px;margin-bottom:4px">证型倾向</div>
          <div>${syndromeDisplay}</div>
        </div>

        <div style="border-top:1px solid #333;margin:12px 0"></div>

        <div style="color:#ccc;font-size:12px;white-space:pre-wrap;max-height:300px;overflow-y:auto">
          ${summary}
        </div>

        <div style="border-top:1px solid #333;margin:12px 0"></div>

        <div style="display:flex;gap:8px">
          <a href="/tcm-assessment" style="flex:1;text-align:center;padding:8px;background:#c8a46c;color:#1a1a2e;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600">📝 重新评测</a>
          <a href="/tcm-report" style="flex:1;text-align:center;padding:8px;background:#333;color:#c8a46c;border-radius:8px;text-decoration:none;font-size:12px;border:1px solid #c8a46c40">📄 查看完整报告</a>
        </div>
      </div>
    `;
  }

  // ========== 提取报告摘要 ==========
  function extractSummary(diagnosis) {
    // 尝试提取前300字核心摘要
    const clean = diagnosis
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\|.*?\|/g, '')
      .substring(0, 400);
    return clean.substring(0, clean.lastIndexOf('。') + 1) || clean.substring(0, 200) + '...';
  }

  // ========== 切换面板 ==========
  function togglePanel() {
    const panel = document.getElementById(PANEL_ID);
    const btn = document.getElementById(FLOAT_ID);
    if (!panel) return;
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
    btn.style.display = isVisible ? 'flex' : 'none';
  }

  // ========== 高亮关键词 ==========
  function highlightKeywords(matchedKeywords) {
    // 只高亮前5个关键词，避免页面太花哨
    const topKW = matchedKeywords.slice(0, 5);
    for (const { keyword } of topKW) {
      try {
        const re = new RegExp(`(${keyword})`, 'gi');
        // 遍历文本节点
        walkTextNodes(document.body, re, (match) => {
          const span = document.createElement('span');
          span.style.cssText = 'background:#c8a46c30;border-bottom:1px solid #c8a46c;padding:0 2px;border-radius:2px';
          span.textContent = match;
          return span;
        });
      } catch(e) {
        // 跳过有问题的正则
      }
    }
  }

  // ========== 文本节点遍历（用于高亮） ==========
  function walkTextNodes(node, regex, replacer) {
    if (node.nodeType === 3) { // Text node
      const text = node.textContent || '';
      if (!regex.test(text)) return;
      regex.lastIndex = 0;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        parts.push(replacer(match[0]));
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < text.length) {
        parts.push(document.createTextNode(text.slice(lastIndex)));
      }
      if (parts.length > 0) {
        const parent = node.parentNode;
        const fragment = document.createDocumentFragment();
        for (const part of parts) {
          fragment.appendChild(part);
        }
        parent.replaceChild(fragment, node);
      }
    } else if (node.nodeType === 1 && !['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME'].includes(node.tagName)) {
      for (const child of Array.from(node.childNodes)) {
        walkTextNodes(child, regex, replacer);
      }
    }
  }

  // ========== 无诊断记录时的轻量入口 ==========
  function showAssessmentPrompt() {
    const btn = document.createElement('div');
    btn.id = FLOAT_ID;
    btn.innerHTML = '🧘 开始中医评测';
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      background: linear-gradient(135deg, #c8a46c, #a8853e);
      color: #1a1a2e;
      padding: 10px 18px;
      border-radius: 30px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(200,164,108,0.3);
      transition: all 0.3s ease;
      border: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      user-select: none;
    `;
    btn.onmouseover = () => { btn.style.transform = 'scale(1.05)'; };
    btn.onmouseout = () => { btn.style.transform = 'scale(1)'; };
    btn.onclick = () => { window.location.href = '/tcm-assessment'; };
    document.body.appendChild(btn);
  }

  // ========== 启动 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
