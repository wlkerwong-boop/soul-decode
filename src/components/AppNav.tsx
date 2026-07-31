'use client';

import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/shared';
import { useAuth } from '@/components/AuthContext';

const NAV_LINKS = [
  { label: '✦ 人生总览', href: '/master-report' },
  { label: '📜 九宫学理', href: '/jiugong' },
  { label: '🧬 人类图排盘', href: '/human-design' },
  { label: '🌅 每日运势', href: '/daily' },
];

export default function AppNav() {
  const { user, isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.nickname || (user?.phone ? user.phone.slice(0, 3) + '****' + user.phone.slice(-4) : '');
  const handleLogout = () => { logout(); setMenuOpen(false); };

  return (
    <div className="relative">
      <Navbar
        logo={<span className="text-[var(--color-accent)] text-lg font-bold tracking-wider">✦ 灵魂解码</span>}
        links={NAV_LINKS}
      />

      {/* Auth controls overlay (right side, inline with navbar) */}
      <div className="fixed right-6 top-0 z-50 flex h-[var(--navbar-height)] items-center gap-3 lg:right-10">
        {isLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-color)] text-[var(--color-accent)] text-xs font-medium hover:bg-[rgba(212,175,55,0.12)] transition-colors"
            >
              <span>{displayName}</span>
              <span className="text-[10px] opacity-60">{menuOpen ? '▲' : '▼'}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl py-2 z-50">
                <a href="/my" className="block px-4 py-2 text-xs hover:bg-[var(--bg-highlight)] transition-colors" onClick={() => setMenuOpen(false)}>📁 我的档案</a>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-[var(--bg-highlight)] transition-colors">退出登录</button>
              </div>
            )}
          </div>
        ) : (
          <a href="/auth/login" className="px-4 py-1.5 rounded-[var(--radius-full)] bg-[var(--color-accent)] text-[var(--color-primary)] text-xs font-medium hover:bg-[var(--color-accent-light)] transition-colors">登录</a>
        )}
      </div>
    </div>
  );
}
