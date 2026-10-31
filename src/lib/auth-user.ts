export interface SupabaseUserLike {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    nickname?: string;
    avatar_url?: string;
  };
}

export interface AppUser {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string;
  registerTime: string;
  loginTime: string;
}

export function toAppUser(user: SupabaseUserLike): AppUser {
  const email = user.email ?? '';
  const nickname = user.user_metadata?.nickname?.trim() || email.split('@')[0] || '新用户';

  return {
    id: user.id,
    email,
    nickname,
    avatarUrl: user.user_metadata?.avatar_url || undefined,
    registerTime: user.created_at,
    loginTime: user.last_sign_in_at || user.created_at,
  };
}
