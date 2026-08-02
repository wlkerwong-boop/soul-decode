import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer';

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

/** 启动 Puppeteer Browser（puppeteer 自带 Chromium，无需系统安装） */
async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--single-process',
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

      const filename = `人生总览报告_${new Date().toISOString().slice(0, 10)}.pdf`;
      const res = new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          // ASCII fallback avoids the Fetch Headers ByteString limit; RFC 5987
          // preserves the original Chinese filename in capable clients.
          'Content-Disposition': `attachment; filename="soulcode-report.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
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
