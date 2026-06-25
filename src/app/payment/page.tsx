'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { markReportPaid } from '@/lib/access-control';
import ShareCard from '@/components/ShareCard';

type PaymentStep = 'choose' | 'paying' | 'success' | 'fail';

const plans = [
  {
    id: 'full-report',
    name: '灵魂解码完整报告',
    price: 9.9,
    desc: '解锁全部8大维度深度解读 + PDF导出',
    popular: false,
  },
  {
    id: 'compatibility',
    name: '关系合盘',
    price: 19.9,
    desc: '双人八字匹配分析 + 关系时间线',
    popular: false,
  },
  {
    id: 'monthly',
    name: '月卡会员',
    price: 29,
    desc: '无限次数生成报告 + AI无限追问',
    popular: true,
  },
  {
    id: 'yearly',
    name: '年卡会员',
    price: 199,
    desc: '月卡全部权益 + 优先体验新功能',
    popular: false,
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>('full-report');
  const [step, setStep] = useState<PaymentStep>('choose');
  const [showShare, setShowShare] = useState(false);

  const currentPlan = plans.find(p => p.id === selectedPlan);

  const handlePay = (method: 'wechat' | 'alipay') => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setStep('paying');

    // Simulate payment
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      if (success) {
        markReportPaid('report-' + Date.now(), 'bazi');
        // Record membership
        if (selectedPlan === 'monthly') {
          localStorage.setItem('soul_decode_membership', JSON.stringify({
            active: true,
            plan: 'monthly',
            startedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }));
        } else if (selectedPlan === 'yearly') {
          localStorage.setItem('soul_decode_membership', JSON.stringify({
            active: true,
            plan: 'yearly',
            startedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          }));
        }
        setStep('success');
        window.dispatchEvent(new Event('user-login'));
      } else {
        setStep('fail');
      }
    }, 2000);
  };

  if (showShare) {
    return (
      <div className="min-h-[70vh] px-4 py-12 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold gradient-text mb-2">📸 分享你的报告</h1>
          <p className="text-sm text-[var(--text-secondary)]">保存到相册，分享给朋友</p>
        </div>
        <ShareCard />
        <div className="text-center mt-8">
          <button
            onClick={() => setShowShare(false)}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
          >
            ← 返回
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-sm text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold gradient-text mb-2">{currentPlan?.name || '支付成功'}!</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8">
            已解锁全部内容，开始探索吧
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/my')}
              className="btn-jade"
            >
              查看我的报告
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="px-6 py-3 rounded-xl border border-[var(--border-color)] text-sm font-medium hover:border-[var(--text-accent)] transition-all"
            >
              📸 分享给朋友
            </button>
            <button
              onClick={() => router.push('/')}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
            >
              ← 返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'fail') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-sm text-center">
          <div className="text-5xl mb-4">😅</div>
          <h1 className="text-2xl font-bold mb-2">支付未成功</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8">
            别担心，你的账户没有被扣款，请重试
          </p>
          <button
            onClick={() => setStep('choose')}
            className="btn-jade"
          >
            重新选择支付方式
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] px-4 py-8 md:py-16 max-w-3xl mx-auto">
      <div className="text-center mb-8 md:mb-12">
        <div className="text-4xl mb-3">💎</div>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">选择你的方案</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          解锁全部维度，看见真实的自己
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {plans.map(plan => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`card-jade p-5 md:p-6 cursor-pointer transition-all relative ${
              selectedPlan === plan.id
                ? 'border-[var(--text-accent)] ring-1 ring-[var(--text-accent)]'
                : 'hover:border-[var(--border-accent)]'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#4a7c6f] to-[#c9a06e] text-white text-[10px] font-bold">
                推荐
              </span>
            )}
            <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)] mb-1">{plan.name}</h3>
            <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">
              ¥{plan.price}
              {plan.id === 'monthly' && <span className="text-xs text-[var(--text-secondary)] font-normal"> / 月</span>}
              {plan.id === 'yearly' && <span className="text-xs text-[var(--text-secondary)] font-normal"> / 年</span>}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{plan.desc}</p>
          </div>
        ))}
      </div>

      {/* Payment buttons */}
      {selectedPlan && step === 'choose' && (
        <div className="space-y-3 max-w-sm mx-auto">
          <p className="text-sm text-center text-[var(--text-secondary)] mb-2">
            支付 <span className="font-bold text-[var(--text-primary)]">¥{currentPlan?.price}</span>
          </p>
          <button
            onClick={() => handlePay('wechat')}
            className="w-full py-3.5 rounded-xl bg-[#07c160] text-white font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span>💚</span> 微信支付
          </button>
          <button
            onClick={() => handlePay('alipay')}
            className="w-full py-3.5 rounded-xl bg-[#1677ff] text-white font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span>💙</span> 支付宝支付
          </button>
          <p className="text-[10px] text-center text-[var(--text-secondary)] opacity-40 mt-2">
            * 演示版支付模拟，实际支付需接入微信/支付宝商户号
          </p>
        </div>
      )}

      {step === 'paying' && (
        <div className="text-center py-16">
          <div className="cosmic-loader mx-auto mb-6">
            <div className="cosmic-ring cosmic-ring-1" />
            <div className="cosmic-ring cosmic-ring-2" />
            <div className="cosmic-center">⏳</div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">处理中…</p>
        </div>
      )}
    </div>
  );
}
