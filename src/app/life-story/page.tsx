import LifeStoryWizard from '@/components/life-story/LifeStoryWizard';

export const metadata = {
  title: '人生总结 · SoulCode',
  description: '把出生画像放回真实经历，生成可讨论、可行动的人生路径模拟。',
};

export default function LifeStoryPage() {
  return <LifeStoryWizard />;
}
