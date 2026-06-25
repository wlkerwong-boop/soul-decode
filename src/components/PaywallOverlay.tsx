'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

interface PaywallOverlayProps {
  /** 需要解锁的功能名称 */
  feature: string;
  /** 价格 */
  price?: number;
  /** 是否显示在小容器内 */
  inline?: boolean;
}

export default function PaywallOverlay({ feature, price = 9.9, inline = false }: PaywallOverlayProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    } else {
      router.push('/payment');
    }
  };

  if (inline) {
    return (
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer group"
        onClick={handleClick}
      >
        {/* Blurred content background */}
        <div className="blur-sm select-none opacity-30">
          <div className="h-48 bg-gradient-to-b from-[var(--bg-highlight)] to-transparent" />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px]">
          <div className="text-center p-6">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              解锁完整{feature}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              仅需 ¥{price}，解锁全部8大维度深度解读
            </p>
            <button className="btn-jade inline-flex items-center justify-center px-6 py-2.5 text-sm" style={{ width: 'auto' }}>
              💎 立即解锁
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 cursor-pointer"
      onClick={handleClick}
    >
      <div
        className="card-jade p-8 max-w-sm w-full text-center cursor-default"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-4xl mb-4">💎</div>
        <h2 className="text-xl font-bold gradient-text mb-2">{feature}</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          这是会员专属功能，升级后解锁全部内容
        </p>
        <button
          onClick={handleClick}
          className="btn-jade mb-3"
        >
          {isLoggedIn ? `¥${price} 立即解锁` : '登录后购买'}
        </button>
        <p className="text-xs text-[var(--text-secondary)] opacity-50">
          年卡会员仅需¥199，畅享全部功能
        </p>
      </div>
    </div>
  );
}
