/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2a67b2",
        "primary-dark": "#1e4b85",
        "primary-light": "#eef4fb",
        "background-light": "#ffffff",
        "background-dark": "#1a1f23",
        "surface-light": "#ffffff",
        "surface-dark": "#252b32",
        "alert-red": "#dc2626",
        "alert-bg": "#fef2f2",
        "text-main": "#1e293b",
        "text-secondary": "#64748b",
        "border-color": "#e2e8f0",
        "slate-custom": "#f8fafc",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(42, 103, 178, 0.04), 0 2px 4px -1px rgba(42, 103, 178, 0.02)',
        'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
        'toast': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
