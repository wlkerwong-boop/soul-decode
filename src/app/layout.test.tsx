import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('SoulCode root layout', () => {
  it('sets the site theme on the server-rendered body', () => {
    const source = readFileSync(resolve(__dirname, 'layout.tsx'), 'utf8');

    expect(source).toContain('<body className="antialiased" data-site="soulcode">');
  });
});
