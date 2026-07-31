'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface FeatureCardItem {
  /** Unique key. */
  id: string;
  /** SVG icon as a React node (inline). */
  icon: React.ReactNode;
  /** Card title. */
  title: string;
  /** Card description. */
  description: string;
}

export interface FeatureCardGridProps {
  /** Array of feature cards. */
  items: FeatureCardItem[];
  /** Optional section heading above the grid. */
  heading?: string;
  /** Optional section subheading. */
  subheading?: string;
  /** Optional class. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Single Card                                                        */
/* ------------------------------------------------------------------ */
export const FeatureCard: React.FC<
  FeatureCardItem & { index?: number }
> = ({ icon, title, description, index = 0 }) => {
  const animationDelay = `${0.1 + index * 0.1}s`;

  return (
    <div
      className="group relative rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 transition-all duration-[var(--transition-base)] hover:-translate-y-1.5 hover:border-[var(--color-border-hover)] hover:shadow-[0_8px_30px_var(--color-card-shadow)]"
      style={{
        opacity: 0,
        animation: `fadeSlideUp 0.6s ease-out ${animationDelay} forwards`,
      }}
    >
      {/* Icon */}
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] transition-transform duration-[var(--transition-base)] group-hover:scale-110">
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-3 text-xl font-semibold text-[var(--color-text)]">
        {title}
      </h3>

      {/* Description */}
      <p className="mb-6 text-sm leading-relaxed text-[var(--color-text-muted)]">
        {description}
      </p>

      {/* Arrow indicator */}
      <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] transition-all duration-[var(--transition-base)] group-hover:gap-2">
        了解更多
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="transition-transform duration-[var(--transition-base)] group-hover:translate-x-0.5"
        >
          <path d="M6 4l4 4-4 4" />
        </svg>
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Grid Container                                                     */
/* ------------------------------------------------------------------ */
export const FeatureCardGrid: React.FC<FeatureCardGridProps> = ({
  items,
  heading,
  subheading,
  className = '',
}) => {
  return (
    <section
      className={`bg-[var(--color-bg)] px-6 py-20 lg:px-10 ${className}`}
    >
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        {(heading || subheading) && (
          <div className="mb-14 text-center">
            {heading && (
              <h2 className="mb-3 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mx-auto max-w-xl text-lg text-[var(--color-text-muted)]">
                {subheading}
              </p>
            )}
          </div>
        )}

        {/* Cards grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <FeatureCard key={item.id} {...item} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCardGrid;
