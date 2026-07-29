import type {
  JiugongFull,
  JiugongInput,
} from '../server/jiugong-v6';

type Fetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export async function requestJiugongV6(
  input: JiugongInput,
  fetcher: Fetcher = fetch,
): Promise<JiugongFull> {
  const response = await fetcher('/api/jiugong/v6', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || '排盘暂时不可用，请稍后重试');
  }
  return payload.data;
}
