'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterProps {
  /** Site name / brand text. */
  brand: string;
  /** Short description for the "about" column. */
  description: string;
  /** Link columns (up to 3). */
  columns?: FooterColumn[];
  /** Copyright text. Defaults to "© {year} {brand}. All rights reserved." */
  copyright?: string;
  /** Social links inline (optional). */
  socialLinks?: { label: string; href: string; icon?: React.ReactNode }[];
  /** Optional class. */
  className?: string;
}

function SocialIcon({ label }: { label: string }) {
  if (label === '微信') {
    return (
      <svg data-social-icon="wechat" aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.2 3C4.7 3 1 6 1 9.8c0 2.1 1.2 4 3 5.3l-.8 2.5 2.9-1.5c1 .3 2 .5 3.1.5h.5a6.6 6.6 0 0 1-.6-2.7c0-3.7 3.4-6.7 7.7-6.7h.4C16 4.7 12.9 3 9.2 3Zm-2.8 4.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm5.5 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
        <path d="M23 13.9c0-3-2.8-5.5-6.2-5.5-3.5 0-6.3 2.5-6.3 5.5s2.8 5.5 6.3 5.5c.8 0 1.7-.1 2.4-.4l2.3 1.2-.6-2c1.3-1 2.1-2.6 2.1-4.3Zm-8.3-.8a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Zm4.3 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Z" />
      </svg>
    );
  }

  if (label === '小红书') {
    return (
      <svg data-social-icon="xiaohongshu" aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M4 7.5h16v9H4zM8 4.5v15M16 4.5v15M4 12h16" />
        <path d="m10.5 9 3 6M13.5 9l-3 6" opacity=".8" />
      </svg>
    );
  }

  if (label.toLowerCase() === 'stella') {
    return (
      <svg data-social-icon="stella" aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="m12 3 2.1 6.2 6.4.1-5.1 3.8 1.9 6.2-5.3-3.6-5.3 3.6 1.9-6.2-5.1-3.8 6.4-.1L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  return <span data-social-icon="fallback" className="text-xs">{label.slice(0, 2)}</span>;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export const Footer: React.FC<FooterProps> = ({
  brand,
  description,
  columns = [],
  copyright,
  socialLinks,
  className = '',
}) => {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`footer border-t border-[var(--color-border)] bg-[var(--color-bg-alt)] ${className}`}
    >
      <div className="footer-inner mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {/* Grid: about column + link columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="footer-brand sm:col-span-2 lg:col-span-1">
            <h4 className="mb-3 text-lg font-bold text-[var(--color-accent)]">
              {brand}
            </h4>
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
              {description}
            </p>

            {/* Social links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="footer-social mt-5 flex gap-3">
                {socialLinks.map((s) => (
                  <a
                    key={`${s.label}-${s.href}`}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn flex h-10 w-10 items-center justify-center rounded-full border border-[#334155] bg-[#1E293B]/75 text-[var(--color-text-muted)] transition-all duration-[var(--transition-fast)] hover:-translate-y-0.5 hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    aria-label={s.label}
                  >
                    {s.icon || <SocialIcon label={s.label} />}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div className="footer-col" key={col.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text)]">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--color-text-muted)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--color-accent)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright bar */}
        <div className="mt-12 border-t border-[var(--color-border)] pt-6 text-center text-xs text-[var(--color-text-dim)]">
          {copyright || `© ${year} ${brand}. All rights reserved.`}
          <p className="mt-2">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">粤ICP备2026087672号-2</a>
            {" "}
            <a href="https://beian.mps.gov.cn/#/query/webSearch?code=44030002015349" target="_blank" rel="noreferrer" className="hover:text-[var(--color-accent)] transition-colors">粤公网安备44030002015349号</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
