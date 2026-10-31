import { expect, it } from 'vitest';
import { verifyReportText } from './verify-report-core.mjs';
it('flags an individual narrative that contradicts the engine center count', () => {
 const truth={hd:{definedCenters:['Head','Ajna','Throat','G','Solar Plexus','Spleen','Root']}};
 const issues=verifyReportText('您的六个定义中心里，情绪中心有定义。',truth);
 expect(issues.some(x=>x.rule==='CENTER_COUNT')).toBe(true);
});
it('accepts the correct center count', () => {
 const truth={hd:{definedCenters:['Head','Ajna','Throat','G','Solar Plexus','Spleen','Root']}};
 const issues=verifyReportText('您的七个定义中心里，情绪中心有定义。',truth);
 expect(issues.some(x=>x.rule==='CENTER_COUNT')).toBe(false);
});
