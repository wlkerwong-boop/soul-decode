'use client';

import React, { useState, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
export interface NavbarProps {
  /** Logo text or React node. Falls back to site title. */
  logo?: React.ReactNode;
  /** Navigation links. If empty, only the logo renders. */
  links?: { label: string; href: string }[];
  /** Call-to-action button (e.g. "预约咨询"). */
  cta?: { label: string; href: string };
  /** Optional class for the outer <nav> wrapper. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const NAV_SCROLL_THRESHOLD = 100;

export const Navbar: React.FC<NavbarProps> = ({
  logo,
  links = [],
  cta,
  className = '',
}) => {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > NAV_SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial read
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-[var(--navbar-height)] transition-all duration-500 ease-out ${
        scrolled
          ? 'shadow-lg'
          : ''
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
        <a href="/" className="flex items-center gap-2 text-lg font-bold tracking-wide">
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

        {/* CTA or spacer */}
        <div className="flex items-center gap-4">
          {cta && (
            <a
              href={cta.href}
              className="inline-flex items-center rounded-[var(--radius-full)] bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-[var(--color-primary)] transition-all duration-[var(--transition-base)] hover:bg-[var(--color-accent-light)] hover:shadow-[0_0_20px_var(--color-accent)]"
            >
              {cta.label}
            </a>
          )}
          {/* Mobile hamburger placeholder */}
          <button
            className="inline-flex items-center md:hidden"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
