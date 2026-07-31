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
      className={`border-t border-[var(--color-border)] bg-[var(--color-bg-alt)] ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {/* Grid: about column + link columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="mb-3 text-lg font-bold text-[var(--color-accent)]">
              {brand}
            </h4>
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
              {description}
            </p>

            {/* Social links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="mt-5 flex gap-3">
                {socialLinks.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors duration-[var(--transition-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    aria-label={s.label}
                  >
                    {s.icon || (s.label.length <= 4 ? s.label : s.label.slice(0, 2))}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
