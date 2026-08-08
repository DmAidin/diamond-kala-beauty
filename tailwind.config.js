/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "rgb(var(--color-base) / <alpha-value>)",
          panel: "rgb(var(--color-base-panel) / <alpha-value>)",
          raised: "rgb(var(--color-base-raised) / <alpha-value>)",
          line: "rgb(var(--color-base-line) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--color-gold) / <alpha-value>)",
          soft: "rgb(var(--color-gold-soft) / <alpha-value>)",
          dim: "rgb(var(--color-gold-dim) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)",
          faint: "rgb(var(--color-ink-faint) / <alpha-value>)",
        },
        signal: {
          ok: "rgb(var(--color-signal-ok) / <alpha-value>)",
          warn: "rgb(var(--color-signal-warn) / <alpha-value>)",
          bad: "rgb(var(--color-signal-bad) / <alpha-value>)",
        },
        teal: "rgb(var(--color-teal) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        trace: "linear-gradient(90deg, transparent 0%, rgba(212,162,76,0.5) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};
