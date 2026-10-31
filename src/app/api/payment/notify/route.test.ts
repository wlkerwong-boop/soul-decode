import { expect, test } from 'vitest';
import { GET, POST } from './route';

test('unconfigured payment callback never confirms a transaction', async () => {
  const post = await POST();
  const get = await GET();
  expect(post.status).toBe(503);
  expect(get.status).toBe(503);
  expect(await post.text()).not.toBe('success');
});
