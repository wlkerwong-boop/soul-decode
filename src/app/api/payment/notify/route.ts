/**
 * 支付回调通知 — 微信/支付宝服务器回调
 * 当用户完成支付后，微信/支付宝会POST到此处
 */
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // 记录回调日志
    console.log('[Payment Notify] Received:', body);

    // TODO: 验证签名（微信/支付宝）
    // TODO: 更新订单状态
    // TODO: 解锁用户权益

    // 返回成功（微信/支付宝要求特定格式）
    return new Response('success', { status: 200 });
  } catch (error) {
    console.error('[Payment Notify] Error:', error);
    return new Response('fail', { status: 500 });
  }
}

// 微信使用GET方式验证
export async function GET(request: NextRequest) {
  return new Response('Payment notify endpoint ready', { status: 200 });
}
