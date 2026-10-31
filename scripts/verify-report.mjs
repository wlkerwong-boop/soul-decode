#!/usr/bin/env node
/**
 * verify-report.mjs — 报告事实层校验 CLI（P0 任务3）
 *
 * 用法：
 *  node scripts/verify-report.mjs <report.md> [--engine-json <engine.json>] [--expect <golden.json>]
 *  node scripts/verify-report.mjs --check-defect-samples   # 内置病灶样本自检
 *
 * 校验核心在 src/lib/verify-report-core.mjs（与报告生成链路共用单份实现，防漂移）。
 * 真数据纪律：孩子/家庭原始出生数据不上 GitHub；测试用脱敏假数据，真数据仅服务器侧跑。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyReportText, runDefectSamples } from '../src/lib/verify-report-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(reportPath, engineJsonPath, expectPath) {
  const reportText = fs.readFileSync(reportPath, 'utf-8');
  let truth = null;
  if (engineJsonPath) truth = JSON.parse(fs.readFileSync(engineJsonPath, 'utf-8'));
  if (expectPath) {
    const expect = JSON.parse(fs.readFileSync(expectPath, 'utf-8'));
    truth = { ...(truth || {}), ...expect };
  }

  const issues = verifyReportText(reportText, truth);
  if (issues.length) {
    console.error(`✗ FAIL ${reportPath} — ${issues.length} 处事实层病灶:`);
    for (const issue of issues) {
      console.error(`  [${issue.rule}] ${issue.message}${issue.evidence ? `\n    ↳ ${issue.evidence}` : ''}`);
    }
    process.exit(1);
  }
  console.log(`✓ PASS ${reportPath} — 事实层校验全绿（V1-V6 通过）`);
}

const args = process.argv.slice(2);
if (args.includes('--check-defect-samples')) {
  process.exit(runDefectSamples() ? 0 : 1);
} else if (args[0] && !args[0].startsWith('-')) {
  const reportPath = path.resolve(args[0]);
  const engineJsonPath = args.includes('--engine-json') ? path.resolve(args[args.indexOf('--engine-json') + 1]) : null;
  const expectPath = args.includes('--expect') ? path.resolve(args[args.indexOf('--expect') + 1]) : null;
  run(reportPath, engineJsonPath, expectPath);
} else {
  console.log(`用法:
  node scripts/verify-report.mjs <report.md> [--engine-json <engine.json>] [--expect <golden.json>]
  node scripts/verify-report.mjs --check-defect-samples`);
  process.exit(2);
}
