interface ErrorMessageProps {
  /** Friendly, already-humanized message. Nothing renders when empty/null. */
  message?: string | null;
  /** "banner" for section-level errors, "inline" for under a field. */
  variant?: "banner" | "inline";
}

/**
 * Renders a friendly error. Field-level validation uses the "inline" variant;
 * non-field / request errors use the "banner" variant.
 */
export function ErrorMessage({ message, variant = "banner" }: ErrorMessageProps) {
  if (!message) return null;

  if (variant === "inline") {
    return (
      <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
        {message}
      </p>
    );
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <svg
        className="mt-0.5 h-4 w-4 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}
