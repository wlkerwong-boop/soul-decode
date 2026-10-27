export const runtime = 'nodejs';

// Legacy gift codes were static and their redemption state was process-local.
// Do not claim a code unlocked access until a persistent redemption service exists.
export async function POST() {
  return Response.json(
    { valid: false, message: '免费码服务维护中，请使用已发放的测试账号登录。' },
    { status: 410 },
  );
}
