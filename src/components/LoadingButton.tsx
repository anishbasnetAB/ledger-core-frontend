import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: Variant;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: "button-primary",
  secondary: "button-secondary",
  ghost: "button-ghost",
  danger: "button-danger",
};

/**
 * A consistent button with a built-in loading spinner. Disabled while loading
 * to prevent double submits.
 */
export function LoadingButton({
  loading = false,
  variant = "primary",
  children,
  className = "",
  disabled,
  ...rest
}: LoadingButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`action-button inline-flex items-center justify-center gap-2 ${VARIANTS[variant]} ${className}`}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
