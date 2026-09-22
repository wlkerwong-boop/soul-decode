import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const wizardSource = readFileSync(new URL('../../components/life-story/LifeStoryWizard.tsx', import.meta.url), 'utf8');

describe('life story wizard page contract', () => {
  it('exposes the four reflective steps and local draft controls', () => {
    expect(wizardSource).toContain('我的起点');
    expect(wizardSource).toContain('我的路');
    expect(wizardSource).toContain('我的门槛');
    expect(wizardSource).toContain('我的此刻');
    expect(wizardSource).toContain('LIFE_STORY_DRAFT_KEY');
    expect(wizardSource).toContain('删除本地草稿');
  });

  it('keeps the experience framed as a reflective simulation', () => {
    expect(wizardSource).toContain('不是命运判决');
    expect(wizardSource).toContain('把报告放回真实人生');
    expect(wizardSource).toContain('/api/life-script/summary');
    expect(wizardSource).toContain('/api/life-script/generate');
  });

  it('explains the time, output, and save boundary before users start', () => {
    expect(wizardSource).toContain('8–12 分钟');
    expect(wizardSource).toContain('双路径');
    expect(wizardSource).toContain('当前浏览器');
    expect(wizardSource).toContain('反思实验');
  });

  it('lets guests see the reflective summary before asking them to log in', () => {
    const summarySection = wizardSource.slice(wizardSource.indexOf('const requestSummary'), wizardSource.indexOf('const updateSummaryArray'));
    const scriptSection = wizardSource.slice(wizardSource.indexOf('const requestScript'), wizardSource.indexOf('const next'));

    expect(summarySection).not.toContain('saveBeforeLogin();');
    expect(summarySection).toContain("setNotice('正在把你的经历整理成一面可校正的镜子……');");
    expect(wizardSource).toContain('先免费查看人生总结');
    expect(scriptSection).toContain('saveBeforeLogin();');
    expect(wizardSource).toContain('确认工作稿后登录');
  });

  it('offers a privacy-safe companion mode without creating a shared room', () => {
    expect(wizardSource).toContain("get('mode') === 'companion'");
    expect(wizardSource).toContain('朋友同行');
    expect(wizardSource).toContain('各自完成');
    expect(wizardSource).toContain('邀请朋友一起完成');
    expect(wizardSource).toContain('buildLifeStoryCompanionInviteText');
    expect(wizardSource).not.toContain('roomId');
  });
});
