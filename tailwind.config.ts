import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-tertiary": "var(--bg-tertiary)",
        "bg-hover": "var(--bg-hover)",
        "bg-active": "var(--bg-active)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "border-color": "var(--border-color)",
        "border-light": "var(--border-light)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-muted": "var(--accent-muted)",
        "code-bg": "var(--code-bg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
