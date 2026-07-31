'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
export interface HeroSectionProps {
  /** Background image URL. */
  bgImage: string;
  /** Optional overlay gradient stops (defaults to primary→transparent). */
  overlayFrom?: string;
  overlayTo?: string;
  /** Main heading. */
  title: string;
  /** Subtitle below the main heading. */
  subtitle?: string;
  /** CTA capsule button. */
  cta?: {
    label: string;
    href: string;
    /** Secondary CTA alongside the primary. */
    secondary?: { label: string; href: string };
  };
  /** Optional class. */
  className?: string;
  /** Content vertical alignment: center (default) | bottom | top */
  align?: 'top' | 'center' | 'bottom';
}

/* ------------------------------------------------------------------ */
/*  Animation helper                                                   */
/* ------------------------------------------------------------------ */
const fadeSlideUp: React.CSSProperties = {
  opacity: 0,
  animation: 'fadeSlideUp 0.8s ease-out 0.2s forwards',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export const HeroSection: React.FC<HeroSectionProps> = ({
  bgImage,
  overlayFrom,
  overlayTo,
  title,
  subtitle,
  cta,
  className = '',
  align = 'center',
}) => {
  const alignMap: Record<string, string> = {
    top: 'justify-start pt-28',
    center: 'justify-center',
    bottom: 'justify-end pb-20',
  };

  return (
    <section
      className={`relative flex min-h-screen w-full items-center overflow-hidden ${alignMap[align]} ${className}`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Keyframe definition injected once per page — safe to repeat */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Overlay gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${overlayFrom || 'var(--color-primary)'}, ${overlayTo || 'transparent'})`,
          opacity: 0.7,
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h1
          className="mb-5 text-4xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl"
          style={fadeSlideUp}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[var(--color-text-muted)] sm:text-xl"
            style={{
              opacity: 0,
              animation: 'fadeSlideUp 0.8s ease-out 0.45s forwards',
            }}
          >
            {subtitle}
          </p>
        )}

        {cta && (
          <div
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            style={{
              opacity: 0,
              animation: 'fadeSlideUp 0.8s ease-out 0.7s forwards',
            }}
          >
            <a
              href={cta.href}
              className="inline-flex items-center rounded-[var(--radius-full)] bg-[var(--color-accent)] px-8 py-3.5 text-base font-semibold text-[var(--color-primary)] transition-all duration-[var(--transition-base)] hover:bg-[var(--color-accent-light)] hover:shadow-[0_0_30px_var(--color-accent)] hover:scale-105"
            >
              {cta.label}
            </a>
            {cta.secondary && (
              <a
                href={cta.secondary.href}
                className="inline-flex items-center rounded-[var(--radius-full)] border border-[var(--color-border)] px-8 py-3.5 text-base font-medium text-[var(--color-text)] transition-all duration-[var(--transition-base)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {cta.secondary.label}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
