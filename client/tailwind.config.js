/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "var(--bg-primary)",
        bgSurface: "var(--bg-surface)",
        navy900: "var(--navy-900)",
        slate700: "var(--slate-700)",
        slate400: "var(--slate-400)",
        borderDefault: "var(--border)",
        accent: "var(--accent)",
        riskStandard: "var(--risk-standard)",
        riskAttention: "var(--risk-attention)",
        riskHigh: "var(--risk-high)",
      },
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
        md: "6px",
        lg: "6px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
}
