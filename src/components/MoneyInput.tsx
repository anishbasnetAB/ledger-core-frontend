import { useId } from "react";
import { ErrorMessage } from "./ErrorMessage";

interface MoneyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Inline validation/field error message. */
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Optional blur handler, useful for normalizing on blur. */
  onBlur?: () => void;
}

/**
 * Text input specialized for money. It is intentionally a text field (not
 * type="number") so the value stays an exact string — we never let the browser
 * coerce it into a float. We lightly filter keystrokes to digits and one dot.
 */
export function MoneyInput({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder = "0.00",
  disabled,
  onBlur,
}: MoneyInputProps) {
  const id = useId();

  function handleChange(raw: string) {
    // Allow only digits and a single decimal point; strip everything else.
    let cleaned = raw.replace(/[^\d.]/g, "");
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned =
        cleaned.slice(0, firstDot + 1) +
        cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    onChange(cleaned);
  }

  return (
    <div>
      <label htmlFor={id} className="label-base">
        {label}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400"
          aria-hidden="true"
        >
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={`input-base pl-7 ${error ? "input-error" : ""}`}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {helperText && !error && <p className="helper-text">{helperText}</p>}
      <span id={`${id}-error`}>
        <ErrorMessage message={error} variant="inline" />
      </span>
    </div>
  );
}
