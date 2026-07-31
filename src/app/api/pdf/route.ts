import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer-core';

// macOS 系统 Chrome 路径
const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Linux 常见 Chrome/Chromium 路径（阿里云服务器）
const LINUX_CHROMES = [
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
];

const ALLOWED_ORIGIN = 'https://aisoulcode.cn';

/** 设置 CORS 头 */
function setCors(response: NextResponse, origin: string | null) {
  if (origin === ALLOWED_ORIGIN || origin?.endsWith('.aisoulcode.cn')) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    // 开发环境或本地
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
}

/** 查找可用的 Chrome 可执行文件 */
function findChromePath(): string {
  const { platform } = process;
  if (platform === 'darwin') return MAC_CHROME;

  // Linux: 尝试各路径
  const { execSync } = require('child_process');
  for (const path of LINUX_CHROMES) {
    try {
      execSync(`test -x "${path}"`, { stdio: 'ignore' });
      return path;
    } catch {}
  }
  // 回退: 用 which
  try {
    return execSync('which chromium-browser || which chromium || which google-chrome', { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('未找到 Chrome/Chromium 浏览器。请安装 chromium-browser。');
  }
}

/** 启动 Puppeteer Browser */
async function launchBrowser(): Promise<Browser> {
  const chromePath = findChromePath();
  return puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
    ],
  });
}

/** 重试包装 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < maxRetries) await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw lastErr;
}

export async function OPTIONS(req: NextRequest) {
  const res = NextResponse.json({}, { status: 204 });
  setCors(res, req.headers.get('origin'));
  return res;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');

  try {
    const body = await req.json();
    const { html, url } = body;

    if (!html && !url) {
      const res = NextResponse.json(
        { error: '请提供 html 或 url 参数' },
        { status: 400 }
      );
      setCors(res, origin);
      return res;
    }

    let browser: Browser | null = null;

    try {
      // 启动浏览器（仅服务器端运行时可用）
      if (typeof window !== 'undefined') {
        throw new Error('Puppeteer 只能在服务端运行');
      }

      browser = await withRetry(() => launchBrowser());
      const page = await browser.newPage();

      // 设置视口为 A4 近似尺寸
      await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });

      if (html) {
        // 直接设置 HTML 内容
        await page.setContent(html, {
          waitUntil: 'load',
          timeout: 30000,
        });
      } else if (url) {
        // 导航到 URL
        await page.goto(url, {
          waitUntil: 'load',
          timeout: 30000,
        });
      }

      // 等待图表渲染（SVG 和 Canvas）
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          // 等待所有图片加载
          const imgs = Array.from(document.images);
          const pending = imgs.filter(img => !img.complete);
          if (pending.length === 0) {
            // 额外等待 ECharts 等渲染完成
            setTimeout(resolve, 1000);
            return;
          }
          let loaded = 0;
          pending.forEach(img => {
            img.addEventListener('load', () => {
              loaded++;
              if (loaded === pending.length) setTimeout(resolve, 1000);
            });
            img.addEventListener('error', () => {
              loaded++;
              if (loaded === pending.length) setTimeout(resolve, 1000);
            });
          });
        });
      });

      // 生成 A4 PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
        displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate: `
          <div style="width:100%;font-size:8px;color:#999;text-align:center;padding:0 15mm;">
            <span style="float:left;">灵魂解码 · aisoulcode.cn</span>
            <span style="float:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></span>
          </div>
        `,
        preferCSSPageSize: true,
      });

      await browser.close();

      const res = new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="人生总览报告_${new Date().toISOString().slice(0, 10)}.pdf"`,
          'Content-Length': String(pdfBuffer.length),
        },
      });
      setCors(res, origin);
      return res;

    } finally {
      if (browser) {
        try { await browser.close(); } catch {}
      }
    }

  } catch (error: any) {
    console.error('[pdf] 生成失败:', error.message);
    const res = NextResponse.json(
      {
        error: 'PDF 生成失败',
        message: error.message || '未知错误',
        hint: error.message?.includes('Chrome') || error.message?.includes('chromium')
          ? '服务器未安装 Chromium。请运行: apt-get install -y chromium-browser'
          : undefined,
      },
      { status: 500 }
    );
    setCors(res, origin);
    return res;
  }
}
