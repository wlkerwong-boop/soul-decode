import Link from 'next/link';

export default function PaymentPage() {
  return (
    <main className="inner-page min-h-[70vh] flex items-center justify-center px-4 py-16 pt-nav">
      <div className="card-jade max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold gradient-text mb-4">付费功能暂未开放</h1>
        <p className="text-sm leading-7 text-[var(--text-secondary)] mb-6">
          当前是朋友试用阶段。网站尚未接入真实支付与会员权益，请勿转账或购买。
          您可以先生成生命蓝图，并从报告页下载 Word 文档。
        </p>
        <Link href="/master-report" className="btn-jade inline-flex items-center justify-center px-6 py-3 text-sm">
          前往生命蓝图
        </Link>
      </div>
    </main>
  );
}
