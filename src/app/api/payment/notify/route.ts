// No merchant integration is active. Never acknowledge unverified notifications.
export async function POST() {
  return new Response('Payment service unavailable', { status: 503 });
}

export async function GET() {
  return new Response('Payment service unavailable', { status: 503 });
}
