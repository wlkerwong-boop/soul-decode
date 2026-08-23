import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TableLayoutType,
  TextRun,
  WidthType,
} from 'docx';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeInlineReportHeadings } from './normalize-inline-report-headings';

type ReportChartImages = {
  humanDesign?: string;
  bazi?: string;
  ziwei?: string;
};

type ReportCharts = {
  images?: ReportChartImages;
};

type ReportMeta = {
  reportTitle?: string;
  fileStem?: string;
  year?: string;
  month?: string;
  day?: string;
  hour?: string;
  minute?: string;
  gender?: string;
  city?: string;
  location?: string;
};

const COLORS = {
  ink: '2B2620',
  gold: 'A8843C',
  line: 'E6D9C5',
  pale: 'F7F0E4',
  muted: '776E64',
};

const PACKAGED_DOCX_FONT_PATH = join(process.cwd(), 'public/fonts/noto/NotoSansCJKsc-Regular.otf');
if (!existsSync(PACKAGED_DOCX_FONT_PATH)) {
  throw new Error(`缺少随应用打包的 Word CJK 字体：${PACKAGED_DOCX_FONT_PATH}`);
}

const embeddedFonts = [{ name: 'SoulCode CJK', data: readFileSync(PACKAGED_DOCX_FONT_PATH) }];
const REPORT_FONT_NAME = 'SoulCode CJK';

const REPORT_FONT = {
  ascii: REPORT_FONT_NAME,
  hAnsi: REPORT_FONT_NAME,
  eastAsia: REPORT_FONT_NAME,
  cs: REPORT_FONT_NAME,
};

const thinBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
};

function cleanInlineMarkdown(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

function inlineRuns(text: string, bold = false): TextRun[] {
  text = cleanInlineMarkdown(text);
  const runs: TextRun[] = [];
  const pattern = /(\*\*|__)(.+?)\1/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > last) runs.push(new TextRun({ text: text.slice(last, match.index), bold }));
    runs.push(new TextRun({ text: match[2], bold: true, color: COLORS.ink }));
    last = match.index + match[0].length;
  }
  if (last < text.length) runs.push(new TextRun({ text: text.slice(last), bold }));
  return runs.length ? runs : [new TextRun({ text, bold })];
}

function cleanCell(value: string) {
  return value.trim().replace(/^\*\*|\*\*$/g, '').replace(/^__|__$/g, '');
}

function isTableRow(line: string) {
  return line.trim().startsWith('|') && line.trim().endsWith('|');
}

function isTableDivider(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function tableCells(line: string) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map(cleanCell);
}

function makeTable(rows: string[][]) {
  const columnCount = Math.max(...rows.map(row => row.length), 1);
  const columnWidth = Math.floor(9360 / columnCount);
  const normalizedRows = rows.map((row) => Array.from({ length: columnCount }, (_, index) => row[index] || ''));
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: Array.from({ length: columnCount }, () => columnWidth),
    layout: TableLayoutType.FIXED,
    borders: thinBorders,
    rows: normalizedRows.map((row, rowIndex) => new TableRow({
      children: row.map((cell) => new TableCell({
        borders: thinBorders,
        shading: rowIndex === 0 ? { type: ShadingType.CLEAR, fill: COLORS.pale } : undefined,
        width: { size: columnWidth, type: WidthType.DXA },
        margins: { top: 90, bottom: 90, left: 120, right: 120 },
        children: [new Paragraph({
          spacing: { before: 0, after: 70, line: 280 },
          children: inlineRuns(cell, rowIndex === 0),
        })],
      })),
    })),
  });
}

function metadataParagraph(meta: ReportMeta) {
  const birth = meta.year && meta.month && meta.day
    ? `${meta.year}年${meta.month}月${meta.day}日${meta.hour ? ` ${meta.hour}:${String(meta.minute || '0').padStart(2, '0')}` : ''}`
    : '';
  const place = [...new Set([meta.location, meta.city].filter(Boolean))].join(' ');
  const parts = [birth && `出生时间：${birth}`, place && `出生地点：${place}`, meta.gender && `性别：${meta.gender}`].filter(Boolean);
  return parts.length ? new Paragraph({
    spacing: { before: 0, after: 220, line: 280 },
    children: [new TextRun({ text: parts.join('　·　'), color: COLORS.muted, size: 20 })],
  }) : null;
}

function imageParagraph(dataUrl: string | undefined, width: number, height: number, altText: string) {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:image\/(png|jpe?g|gif|bmp);base64,(.+)$/);
  if (!match) return null;
  const type = match[1] === 'jpg' || match[1] === 'jpeg' ? 'jpg' : match[1] as 'png' | 'gif' | 'bmp';
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 220 },
    children: [new ImageRun({
      type,
      data: Buffer.from(match[2], 'base64'),
      transformation: { width, height },
      altText: { name: altText, description: altText, title: altText },
    })],
  });
}

/** Convert the report markdown to a stable, readable Word document. */
export async function createWordReportBuffer(report: string, meta: ReportMeta = {}, charts: ReportCharts = {}) {
  const reportTitle = meta.reportTitle || '人生总览报告';
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: 'SOULCODE · LIFE READING', allCaps: true, color: COLORS.gold, size: 18, characterSpacing: 80 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: reportTitle, bold: true, color: COLORS.ink, size: 42, font: REPORT_FONT })],
    }),
  ];
  const metaLine = metadataParagraph(meta);
  if (metaLine) children.push(metaLine);

  // The browser captures the already-rendered, authoritative charts as PNGs.
  // Keeping images in the request avoids server-side font differences between
  // macOS and Alibaba Cloud and makes the Word file match the page the user saw.
  const chartItems: Array<[string, string | undefined, number, number]> = [
    ['人类图结构图', charts.images?.humanDesign, 330, 355],
    ['八字四柱图', charts.images?.bazi, 480, 248],
    ['紫微斗数十二宫图', charts.images?.ziwei, 410, 340],
  ];
  const hasCharts = chartItems.some(([, dataUrl]) => Boolean(dataUrl));
  if (hasCharts) {
    children.push(new Paragraph({
      spacing: { before: 80, after: 120, line: 280 },
      children: [new TextRun({ text: '图表速览', bold: true, color: COLORS.gold, size: 24 })],
    }));
  }
  for (const [heading, dataUrl, width, height] of chartItems) {
    const image = imageParagraph(dataUrl, width, height, heading);
    if (!image) continue;
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      keepNext: true,
      spacing: { before: 300, after: 100, line: 300 },
      children: [new TextRun({ text: heading, bold: true, color: COLORS.gold })],
    }));
    children.push(image);
  }

  const lines = normalizeInlineReportHeadings(report.replace(/\r\n/g, '\n')).split('\n');
  let index = 0;
  while (index < lines.length) {
    const raw = lines[index];
    const line = raw.trim();
    if (!line) { index++; continue; }

    if (/^---+$/.test(line)) {
      children.push(new Paragraph({
        spacing: { before: 120, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line, space: 1 } },
      }));
      index++;
      continue;
    }

    if (isTableRow(line) && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const rows: string[][] = [tableCells(line)];
      index += 2;
      while (index < lines.length && isTableRow(lines[index].trim())) {
        rows.push(tableCells(lines[index]));
        index++;
      }
      children.push(makeTable(rows));
      children.push(new Paragraph({ spacing: { after: 140 } }));
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length, 3);
      children.push(new Paragraph({
        heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
        keepNext: true,
        spacing: { before: level === 1 ? 360 : 220, after: 100, line: 300 },
        children: [new TextRun({ text: heading[2].replace(/\*\*/g, '').replace(/__/g, ''), bold: true, color: level === 1 ? COLORS.gold : COLORS.ink })],
      }));
      index++;
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    const quote = line.match(/^>\s*(.*)$/);
    if (quote) {
      children.push(new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: COLORS.pale },
        indent: { left: 220, right: 220 },
        spacing: { before: 100, after: 180, line: 300 },
        children: [new TextRun({ text: cleanInlineMarkdown(quote[1]), color: COLORS.muted, italics: true })],
      }));
      index++;
      continue;
    }
    children.push(new Paragraph({
      style: bullet ? 'List Bullet' : numbered ? 'List Number' : undefined,
      indent: bullet || numbered ? { left: 360, hanging: 180 } : undefined,
      spacing: { before: 0, after: 120, line: 320 },
      children: inlineRuns((bullet || numbered)?.[1] || line),
    }));
    index++;
  }

  const doc = new Document({
    creator: 'SoulCode',
    title: reportTitle,
    description: `SoulCode ${reportTitle}`,
    fonts: embeddedFonts,
    styles: {
      default: {
        document: {
          run: { font: REPORT_FONT, size: 22, color: COLORS.ink },
          paragraph: { spacing: { line: 320, after: 120 } },
        },
        heading1: { run: { font: REPORT_FONT, size: 30, bold: true, color: COLORS.gold }, paragraph: { spacing: { before: 360, after: 140 } } },
        heading2: { run: { font: REPORT_FONT, size: 26, bold: true, color: COLORS.ink }, paragraph: { spacing: { before: 240, after: 100 } } },
        heading3: { run: { font: REPORT_FONT, size: 23, bold: true, color: COLORS.gold }, paragraph: { spacing: { before: 180, after: 80 } } },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 1100, right: 1200, bottom: 1100, left: 1200 } },
      },
      children,
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'SoulCode · aisoulcode.cn', color: COLORS.muted, size: 16 })],
          })],
        }),
      },
    }],
  });
  return Packer.toBuffer(doc);
}
