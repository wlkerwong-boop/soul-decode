import { describe, expect, it } from 'vitest';
import { takeSseLines } from './sse';

describe('SSE line buffering', () => {
  it('keeps an incomplete final line until the next chunk', () => {
    expect(takeSseLines('data: {"content":"a"}\ndata: {"content":"b"}')).toEqual({
      lines: ['data: {"content":"a"}'],
      remainder: 'data: {"content":"b"}',
    });
  });

  it('flushes the final line when the upstream stream closes', () => {
    expect(takeSseLines('data: {"content":"b"}', true)).toEqual({
      lines: ['data: {"content":"b"}'],
      remainder: '',
    });
  });
});
