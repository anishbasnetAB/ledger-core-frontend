/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand green ramp, built from the project palette (004B23 -> CCFF33).
        // 50/100/200 are computed tints toward white for light backgrounds —
        // the source palette has no pastel end of its own.
        brand: {
          50: "#f9ffe7",
          100: "#f0ffc2",
          200: "#e1ff89",
          300: "#ccff33",
          400: "#9ef01a",
          500: "#70e000",
          600: "#38b000",
          700: "#008000",
          800: "#007200",
          900: "#006400",
          950: "#004b23",
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
