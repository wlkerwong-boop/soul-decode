'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface NavbarProps {
  logo?: React.ReactNode;
  links?: { label: string; href: string }[];
  cta?: { label: string; href: string };
  className?: string;
}

const NAV_SCROLL_THRESHOLD = 100;

export const Navbar: React.FC<NavbarProps> = ({
  logo,
  links = [],
  cta,
  className = '',
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > NAV_SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[var(--navbar-height)] transition-all duration-500 ease-out ${
          scrolled ? 'shadow-lg' : ''
        } ${className}`}
        style={{
          background: scrolled ? 'var(--color-navbar-bg)' : 'transparent',
          backdropFilter: scrolled ? 'var(--color-navbar-blur)' : 'none',
          WebkitBackdropFilter: scrolled ? 'var(--color-navbar-blur)' : 'none',
          borderBottom: scrolled
            ? '1px solid var(--color-border)'
            : '1px solid transparent',
        }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 text-lg font-bold tracking-wide z-50">
            {logo || <span className="text-[var(--color-accent)]">JiànJǐ</span>}
          </a>

          {/* Links — desktop */}
          {links.length > 0 && (
            <ul className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--color-accent)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {/* CTA + hamburger */}
          <div className="flex items-center gap-4">
            {cta && (
              <a
                href={cta.href}
                className="hidden md:inline-flex items-center rounded-[var(--radius-full)] bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-[var(--color-primary)] transition-all duration-[var(--transition-base)] hover:bg-[var(--color-accent-light)] hover:shadow-[0_0_20px_var(--color-accent)]"
              >
                {cta.label}
              </a>
            )}
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center md:hidden z-50"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen overlay menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
          style={{
            background: 'var(--color-bg)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          }}
        >
          <ul className="flex flex-col items-center gap-6">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {cta && (
              <li className="mt-4">
                <a
                  href={cta.href}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center rounded-[var(--radius-full)] bg-[var(--color-accent)] px-8 py-3 text-lg font-semibold text-[var(--color-primary)]"
                >
                  {cta.label}
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;
