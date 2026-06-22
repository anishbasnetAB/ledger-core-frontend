/**
 * Money helpers.
 *
 * Money is always handled as a string in this app. We never parse amounts into
 * JavaScript numbers for arithmetic, because floating point is not safe for
 * currency. These helpers only validate and normalize the string form.
 */

/**
 * Accepts: 0.01, 10.00, 100, 100.5, 100.50
 * Rejects: abc, -10, 0, 0.001, "", whitespace-only, 1.234
 *
 * Rule: optional digits, optional `.` with 1 or 2 decimals, value > 0.
 */
const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

export interface MoneyValidation {
  valid: boolean;
  /** Human-readable reason when invalid. */
  error?: string;
}

/** Validate a raw money input string without mutating it. */
export function validateMoney(raw: string): MoneyValidation {
  const value = raw.trim();
  if (value === "") {
    return { valid: false, error: "Amount is required." };
  }
  if (!MONEY_PATTERN.test(value)) {
    return {
      valid: false,
      error: "Enter a valid amount like 100 or 100.50 (max 2 decimals).",
    };
  }
  // Reject zero / all-zero values such as "0", "0.00" without using floats.
  if (/^0+(\.0{1,2})?$/.test(value)) {
    return { valid: false, error: "Amount must be greater than 0." };
  }
  return { valid: true };
}

/** True when the input is a valid, positive money string. */
export function isValidMoney(raw: string): boolean {
  return validateMoney(raw).valid;
}

/**
 * Normalize a valid money string to exactly two decimals.
 *   100   -> 100.00
 *   100.5 -> 100.50
 * Returns the trimmed input unchanged if it is not valid.
 */
export function normalizeMoney(raw: string): string {
  const value = raw.trim();
  if (!isValidMoney(value)) return value;

  const [whole, fraction = ""] = value.split(".");
  const paddedFraction = (fraction + "00").slice(0, 2);
  // Strip leading zeros on the whole part but keep at least one digit.
  const cleanedWhole = whole.replace(/^0+(?=\d)/, "");
  return `${cleanedWhole}.${paddedFraction}`;
}

/**
 * Display-only formatting for a backend-provided money value. The backend may
 * send a string ("100.00") or a number (100). We format to two decimals purely
 * for presentation of a value the backend already computed — we never do
 * balance arithmetic on the frontend.
 */
export function formatMoneyDisplay(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toFixed(2) : String(value);
  }
  // String: normalize valid money, otherwise show as-is.
  return isValidMoney(value) ? normalizeMoney(value) : value;
}
