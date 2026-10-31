import type { Metadata } from 'next';

import BiographyValidationWorkbench from '@/components/biography-validation/BiographyValidationWorkbench';
import { BLIND_SAMPLE_IDS, getBlindBiographySample } from '@/data/biography-validation-study';

export const metadata: Metadata = {
  title: '名人盲评工作台 · SoulCode',
  description: '用匿名样本和预登记事实，完成传记报告的观察吻合度盲评。',
};

export default function BiographyValidationPage() {
  const samples = BLIND_SAMPLE_IDS
    .map((sampleId) => getBlindBiographySample(sampleId))
    .filter((sample): sample is NonNullable<typeof sample> => Boolean(sample));

  return <BiographyValidationWorkbench samples={samples} />;
}
