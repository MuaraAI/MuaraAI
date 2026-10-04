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
        background: "#F8FAFC",
        foreground: "#0B253A",
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F0F7FA",
          hover: "#F8FAFC",
          active: "#EDF2F7",
        },
        border: {
          DEFAULT: "#E2E8F0",
          ocean: "#D1E2EC",
          subtle: "#F1F5F9",
          active: "#CBD5E1",
        },
        muara: {
          ocean: "#0369A1",
          "ocean-light": "#0284C7",
          "ocean-dark": "#075985",
          cyan: "#0284C7",
          "cyan-light": "#38BDF8",
          sky: "#E0F2FE",
          mist: "#F0F7FA",
          ink: "#0B253A",
          slate: "#476175",
        },
      },
      boxShadow: {
        ocean: "0 10px 30px -10px rgba(11, 37, 58, 0.06), 0 2px 6px -1px rgba(11, 37, 58, 0.04)",
        "ocean-lg": "0 20px 40px -15px rgba(11, 37, 58, 0.08), 0 4px 12px -2px rgba(11, 37, 58, 0.04)",
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
