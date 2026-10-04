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
        background: "#F7FAFC",
        foreground: "#072033",
        secondary: "#3B5A70",
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F0F7FB",
          hover: "#F7FAFC",
          active: "#EDF2F7",
        },
        stroke: "#D9E5ED",
        border: {
          DEFAULT: "#D9E5ED",
          ocean: "#D9E5ED",
          subtle: "#F0F7FB",
          active: "#CBD5E1",
        },
        muara: {
          ocean: "#0369A1",
          "ocean-dark": "#075985",
          "ocean-light": "#0284C7",
          cyan: "#0369A1",
          sky: "#F0F7FB",
          mist: "#F7FAFC",
          ink: "#072033",
          slate: "#3B5A70",
        },
        status: {
          success: "#0D9488",
          warning: "#D97706",
          danger: "#E11D48",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "18px",
        xl: "28px",
        full: "9999px",
      },
      boxShadow: {
        diffusion: "0 12px 32px -8px rgba(7, 32, 51, 0.05), 0 2px 6px -1px rgba(7, 32, 51, 0.03)",
        lift: "0 20px 40px -10px rgba(7, 32, 51, 0.08), 0 4px 12px -2px rgba(7, 32, 51, 0.04)",
        ocean: "0 12px 32px -8px rgba(7, 32, 51, 0.05), 0 2px 6px -1px rgba(7, 32, 51, 0.03)",
        "ocean-lg": "0 20px 40px -10px rgba(7, 32, 51, 0.08), 0 4px 12px -2px rgba(7, 32, 51, 0.04)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
