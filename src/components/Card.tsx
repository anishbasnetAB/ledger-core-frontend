import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  /** Optional short text under the title. */
  description?: string;
  /** Optional element rendered on the right of the header (e.g. a badge). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * The base surface used across the app. Keeps spacing, borders and shadows
 * consistent so every section looks like part of the same product.
 */
export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-card ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}
