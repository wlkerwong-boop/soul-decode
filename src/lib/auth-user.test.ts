import { describe, expect, it } from 'vitest';
import { toAppUser } from './auth-user';

describe('Supabase 用户映射', () => {
  it('只暴露个人中心需要的安全字段', () => {
    expect(toAppUser({
      id: 'user-1',
      email: 'parent@qq.com',
      created_at: '2026-08-05T10:00:00.000Z',
      last_sign_in_at: '2026-08-05T11:00:00.000Z',
      user_metadata: { nickname: '星星', avatar_url: 'https://example.com/avatar.png' },
    })).toEqual({
      id: 'user-1',
      email: 'parent@qq.com',
      nickname: '星星',
      avatarUrl: 'https://example.com/avatar.png',
      registerTime: '2026-08-05T10:00:00.000Z',
      loginTime: '2026-08-05T11:00:00.000Z',
    });
  });

  it('昵称为空时使用邮箱前缀', () => {
    expect(toAppUser({
      id: 'user-2',
      email: 'student@gmail.com',
      created_at: '2026-08-05T10:00:00.000Z',
      user_metadata: {},
    }).nickname).toBe('student');
  });
});
