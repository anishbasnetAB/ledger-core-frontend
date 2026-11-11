/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ui: {
          50: "var(--surface-soft)",
          100: "var(--surface-soft)",
          200: "var(--line)",
          300: "var(--line)",
          400: "var(--ink-soft)",
          500: "var(--ink-soft)",
          600: "var(--ink-soft)",
          700: "var(--ink)",
          800: "var(--ink)",
          900: "var(--ink)",
        },
        // Saturated forest actions with readable green tints for supporting UI.
        brand: {
          50: "#effaf3",
          100: "#dff3e7",
          200: "#b8e6c9",
          300: "#84c9a0",
          400: "#40a977",
          500: "#138658",
          600: "#087546",
          700: "#075d39",
          800: "#0c4b32",
          900: "#0c3d2d",
          950: "#072c21",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 24, 40, 0.04), 0 1px 3px 0 rgba(16, 24, 40, 0.06)",
        "card-hover":
          "0 4px 8px -2px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)",
      },
    },
  },
  plugins: [],
};
