'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';

export default function Nav() {
  const { user, isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileNavOpen(false);
  };

  const displayName = user?.nickname || (user?.phone ? user.phone.slice(0, 3) + '****' + user.phone.slice(-4) : '');

  const navLinks = [
    { href: '/daily', label: '🌅 每日' },
    { href: '/human-design', label: '🧬 人类图' },
    { href: '/health', label: '身心健康' },
    { href: '/compatibility', label: '💞 关系合盘' },
    { href: '/mbti', label: 'MBTI性格' },
    { href: '/astrology', label: '星座占星' },
    { href: '/tcm', label: '中医通鉴' },
    { href: '/dharma', label: '☸ 法藏' },
    { href: '/tools', label: '🧰 亲子工具' },
    { href: '/payment', label: '💎 会员' },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 px-4 md:px-6 py-3 md:py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <span className="gradient-text text-lg md:text-xl font-bold tracking-wider">✦ 灵魂解码</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6 text-sm text-[var(--text-secondary)] overflow-x-auto scrollbar-hide whitespace-nowrap">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[var(--text-accent)] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <span className="opacity-30">·</span>
          <span className="text-xs opacity-50 hidden lg:inline">八字排盘 · AI深度解读</span>

          {/* User Section */}
          {isLoggedIn ? (
            <div className="relative ml-2" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-accent)] text-[var(--text-accent)] text-sm font-medium hover:bg-[rgba(74,124,111,0.12)] transition-colors"
              >
                <span>{displayName}</span>
                <span className="text-xs opacity-60">{menuOpen ? '▲' : '▼'}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl py-2 z-50">
                  <a
                    href="/my"
                    className="block px-4 py-2 text-sm hover:bg-[var(--bg-highlight)] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    📁 我的档案
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[var(--bg-highlight)] transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/auth/login"
              className="px-4 py-1.5 rounded-lg bg-[var(--text-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              登录
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="md:hidden text-2xl text-[var(--text-secondary)] p-1"
          aria-label="菜单"
        >
          {mobileNavOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden mt-3 pb-4 border-t border-[var(--border-color)] pt-3">
          <div className="flex flex-col gap-2 px-2">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-highlight)] transition-colors"
                onClick={() => setMobileNavOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-[var(--border-color)] my-2" />
            {isLoggedIn ? (
              <>
                <div className="px-3 py-2 text-sm text-[var(--text-accent)] font-medium">
                  {displayName}
                </div>
                <a
                  href="/my"
                  className="px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-highlight)]"
                  onClick={() => setMobileNavOpen(false)}
                >
                  📁 我的档案
                </a>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm text-red-500 text-left hover:bg-[var(--bg-highlight)]"
                >
                  退出登录
                </button>
              </>
            ) : (
              <a
                href="/auth/login"
                className="px-4 py-2 rounded-lg bg-[var(--text-accent)] text-white text-sm font-medium text-center"
                onClick={() => setMobileNavOpen(false)}
              >
                登录
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
