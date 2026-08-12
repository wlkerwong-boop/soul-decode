import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

type ReportMeta = {
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

const thinBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLORS.line },
};

function inlineRuns(text: string, bold = false): TextRun[] {
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
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorders,
    rows: rows.map((row, rowIndex) => new TableRow({
      children: row.map((cell) => new TableCell({
        borders: thinBorders,
        shading: rowIndex === 0 ? { type: ShadingType.CLEAR, fill: COLORS.pale } : undefined,
        width: { size: Math.floor(100 / Math.max(row.length, 1)), type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          spacing: { before: 60, after: 60, line: 280 },
          children: inlineRuns(cell, rowIndex === 0),
        })],
      })),
    })),
  });
}

function metadataParagraph(meta: ReportMeta) {
  const birth = [meta.year, meta.month && `${meta.month}月`, meta.day && `${meta.day}日`, meta.hour && `${meta.hour}时${meta.minute || '0'}分`]
    .filter(Boolean).join('');
  const place = [meta.location, meta.city].filter(Boolean).join(' ');
  const parts = [birth && `出生时间：${birth}`, place && `出生地点：${place}`, meta.gender && `性别：${meta.gender}`].filter(Boolean);
  return parts.length ? new Paragraph({
    spacing: { before: 0, after: 260, line: 280 },
    children: [new TextRun({ text: parts.join('　·　'), color: COLORS.muted, size: 20 })],
  }) : null;
}

/** Convert the report markdown to a stable, readable Word document. */
export async function createWordReportBuffer(report: string, meta: ReportMeta = {}) {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: 'SOULCODE · LIFE READING', allCaps: true, color: COLORS.gold, size: 18, characterSpacing: 80 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: '人生总览报告', bold: true, color: COLORS.ink, size: 42, font: 'STSongti-SC' })],
    }),
  ];
  const metaLine = metadataParagraph(meta);
  if (metaLine) children.push(metaLine);

  const lines = report.replace(/\r\n/g, '\n').split('\n');
  let index = 0;
  while (index < lines.length) {
    const raw = lines[index];
    const line = raw.trim();
    if (!line) { index++; continue; }

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
        pageBreakBefore: level === 1,
        spacing: { before: level === 1 ? 360 : 220, after: 100, line: 300 },
        children: [new TextRun({ text: heading[2].replace(/\*\*/g, '').replace(/__/g, ''), bold: true, color: level === 1 ? COLORS.gold : COLORS.ink })],
      }));
      index++;
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
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
    title: '人生总览报告',
    description: 'SoulCode 灵魂解码人生总览报告',
    styles: {
      default: {
        document: {
          run: { font: 'STSongti-SC', size: 22, color: COLORS.ink },
          paragraph: { spacing: { line: 320, after: 120 } },
        },
        heading1: { run: { font: 'STSongti-SC', size: 30, bold: true, color: COLORS.gold }, paragraph: { spacing: { before: 360, after: 140 } } },
        heading2: { run: { font: 'STSongti-SC', size: 26, bold: true, color: COLORS.ink }, paragraph: { spacing: { before: 240, after: 100 } } },
        heading3: { run: { font: 'STSongti-SC', size: 23, bold: true, color: COLORS.gold }, paragraph: { spacing: { before: 180, after: 80 } } },
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
