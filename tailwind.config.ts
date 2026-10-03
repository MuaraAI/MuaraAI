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
        background: "#070B14",
        foreground: "#F8FAFC",
        surface: {
          DEFAULT: "#0B132B",
          hover: "#111C38",
          active: "#162347",
        },
        border: {
          DEFAULT: "#1E293B",
          subtle: "#172338",
          active: "#334155",
        },
        muara: {
          cyan: "#06B6D4",
          "cyan-light": "#22D3EE",
          "cyan-dark": "#0891B2",
          navy: "#0A192F",
          deep: "#050914",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
