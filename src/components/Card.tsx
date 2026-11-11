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
      className={`workspace-panel ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 panel-header px-5 py-5 sm:px-7 sm:py-6">
          <div>
            {title && (
              <h2 className="panel-title">{title}</h2>
            )}
            {description && (
              <p className="panel-description">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className="panel-body px-5 py-6 sm:px-7 sm:py-7">{children}</div>
    </section>
  );
}
