import { describe, expect, it } from 'vitest';
import { createWordReportBuffer } from './word-report';

describe('createWordReportBuffer', () => {
  it('embeds the packaged CJK font instead of relying on system fonts', async () => {
    const buffer = await createWordReportBuffer('## 1. 中文合盘\n\n这是一段中文。', {
      reportTitle: '情侣合盘报告',
      fileStem: '情侣合盘报告',
    });
    const zipDirectory = buffer.toString('latin1');

    expect(zipDirectory).toContain('word/fonts/SoulCode CJK.odttf');
    expect(zipDirectory).toContain('word/fontTable.xml');
  });

  it('does not leave an inline heading marker in the exported document', async () => {
    const buffer = await createWordReportBuffer('上一段结论。## 4. 关系全景\n\n正文。', {
      reportTitle: '情侣合盘报告',
    });
    const documentXml = buffer.toString('latin1');

    expect(documentXml).not.toContain('## 4.');
  });
});
