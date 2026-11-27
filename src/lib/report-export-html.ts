import { marked } from 'marked';

// Keep Markdown syntax (especially blockquotes) while preventing model-supplied HTML.
export function escapeReportHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

export function renderReportMarkdown(report: string) {
  return marked(escapeReportHtml(report), { breaks: true, gfm: true }) as string;
}

export function buildPersonalPdfHtml(report: string, images: Record<string, string | undefined>, title = '人生总览报告') {
  const figures = [
    ['humanDesign', '人类图'],
    ['bazi', '八字排盘'],
    ['ziwei', '紫微斗数'],
  ].flatMap(([key, label]) => images[key]?.startsWith('data:image/png;base64,')
    ? [`<figure><figcaption>${label}</figcaption><img src="${images[key]}" alt="${label}"></figure>`]
    : []);
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>${escapeReportHtml(title)}</title>
  <link rel="stylesheet" href="/fonts/lxgwwenkai/lxgwwenkai-regular.css">
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'LXGW WenKai', 'Noto Serif CJK SC', serif; color: #302b26; font-size: 11pt; line-height: 1.75; }
    .brand { color: #9b7539; font-size: 10pt; letter-spacing: .18em; }
    h1 { font-size: 23pt; color: #8a642f; margin: 5mm 0 8mm; }
    h2 { font-size: 15pt; color: #8a642f; border-bottom: 1px solid #d8c7a8; padding-bottom: 2mm; margin-top: 9mm; break-after: avoid; }
    h3 { font-size: 12pt; color: #765c39; break-after: avoid; }
    p, li { orphans: 2; widows: 2; }
    blockquote { margin: 4mm 0; padding: 1mm 4mm; border-left: 3px solid #c6aa78; background: #f7f2e9; }
    table { border-collapse: collapse; width: 100%; font-size: 9pt; table-layout: fixed; margin: 4mm 0; }
    th, td { border: 1px solid #d6c9b6; padding: 2mm; overflow-wrap: anywhere; vertical-align: top; }
    th { background: #f1e9db; }
    tr, figure { break-inside: avoid; }
    figure { margin: 8mm 0; text-align: center; }
    figcaption { font-size: 11pt; color: #765c39; margin-bottom: 2mm; }
    figure img { display: block; max-width: 100%; max-height: 240mm; margin: 0 auto; object-fit: contain; }
    .charts { break-before: page; }
  </style></head><body><div class="brand">SOULCODE · 灵魂解码</div><h1>${escapeReportHtml(title)}</h1>
  <main>${renderReportMarkdown(report)}</main>${figures.length ? `<section class="charts"><h2>附图 · 排盘图像</h2>${figures.join('')}</section>` : ''}</body></html>`;
}
