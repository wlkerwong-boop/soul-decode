import { describe, expect, it } from 'vitest';
import { normalizeEmail, translateAuthError, validateRegistration } from './email-auth';

describe('邮箱认证规则', () => {
  it('规范化常见邮箱地址', () => {
    expect(normalizeEmail('  Parent.QQ@QQ.COM ')).toBe('parent.qq@qq.com');
    expect(normalizeEmail('Student@gmail.com')).toBe('student@gmail.com');
  });

  it('拒绝无效邮箱和弱密码', () => {
    expect(validateRegistration({
      email: 'not-an-email',
      password: '12345678',
      confirmPassword: '12345678',
      nickname: '星星',
    })).toBe('请输入有效的邮箱地址');
    expect(validateRegistration({
      email: 'parent@163.com',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
      nickname: '星星',
    })).toBe('密码至少 8 位，且必须同时包含字母和数字');
  });

  it('拒绝两次密码不一致', () => {
    expect(validateRegistration({
      email: 'parent@outlook.com',
      password: 'soulcode2026',
      confirmPassword: 'soulcode2027',
      nickname: '星星',
    })).toBe('两次输入的密码不一致');
  });

  it('把认证服务错误转换为中文提示', () => {
    expect(translateAuthError('Invalid login credentials')).toBe('邮箱或密码不正确');
    expect(translateAuthError('Email not confirmed')).toBe('请先前往邮箱完成验证');
    expect(translateAuthError('User already registered')).toBe('该邮箱已注册，请直接登录');
    expect(translateAuthError('over_email_send_rate_limit')).toBe('验证邮件发送过于频繁，请稍后再试');
  });
});
