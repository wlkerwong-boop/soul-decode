/**
 * 支付集成配置 — 准备接入微信/支付宝商户号
 * 
 * 当用户申请到商户号后，填写对应信息即可启用真实支付
 */

export interface PaymentConfig {
  /** 支付提供商：'demo' | 'wechat' | 'alipay' | 'stripe' */
  provider: 'demo' | 'wechat' | 'alipay' | 'stripe';

  wechat?: {
    /** 微信商户号 */
    mchId: string;
    /** 微信商户API密钥 */
    apiKey: string;
    /** 微信支付APPID */
    appId: string;
    /** 回调URL */
    notifyUrl: string;
  };

  alipay?: {
    /** 支付宝商户号 */
    appId: string;
    /** 支付宝私钥 */
    privateKey: string;
    /** 支付宝公钥 */
    alipayPublicKey: string;
    /** 回调URL */
    notifyUrl: string;
  };
}

// ===== 当前配置（演示模式） =====
// 修改 provider 为 'wechat' 或 'alipay' 并填写下方商户信息
// 即可启用真实支付

const config: PaymentConfig = {
  provider: 'demo', // ← 改成 'wechat' 启用微信支付

  wechat: {
    mchId: process.env.NEXT_PUBLIC_WECHAT_MCH_ID || '',
    apiKey: process.env.WECHAT_API_KEY || '',
    appId: process.env.NEXT_PUBLIC_WECHAT_APP_ID || '',
    notifyUrl: 'https://aisoulcode.cn/api/payment/notify',
  },

  alipay: {
    appId: process.env.NEXT_PUBLIC_ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    notifyUrl: 'https://aisoulcode.cn/api/payment/notify',
  },
};

export function getPaymentConfig(): PaymentConfig {
  return config;
}

export function isDemoMode(): boolean {
  return config.provider === 'demo';
}

/**
 * 生成支付订单（当前为模拟）
 * 接入真实支付后，这里将调用微信/支付宝API
 */
export async function createPaymentOrder(params: {
  planId: string;
  amount: number;
  userId: string;
  description: string;
}): Promise<{ success: boolean; orderId: string; payUrl?: string; qrCode?: string }> {
  // 演示模式：直接返回成功
  if (isDemoMode()) {
    return {
      success: true,
      orderId: `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  // 接入真实微信支付
  if (config.provider === 'wechat') {
    // TODO: 调用微信支付统一下单API
    // const result = await wechatPay.unifiedOrder({...})
    throw new Error('微信支付待接入 - 请在PaymentConfig填写商户信息');
  }

  // 接入真实支付宝
  if (config.provider === 'alipay') {
    // TODO: 调用支付宝下单API
    throw new Error('支付宝支付待接入 - 请在PaymentConfig填写商户信息');
  }

  throw new Error('未配置支付方式');
}
