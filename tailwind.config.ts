import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1220",
          900: "#101B2D",
          800: "#16233A",
          700: "#1F314D",
          600: "#2B4066",
          500: "#3D5680"
        },
        accent: {
          DEFAULT: "#2F6FED",
          light: "#5B8DF5",
          dark: "#1E4FB8"
        },
        good: {
          DEFAULT: "#16A34A",
          bg: "#ECFDF3"
        },
        warn: {
          DEFAULT: "#D97706",
          bg: "#FFFBEB"
        },
        bad: {
          DEFAULT: "#DC2626",
          bg: "#FEF2F2"
        },
        surface: "#F6F8FB",
        line: "#E4E9F2"
      },
      fontFamily: {
        display: ["Segoe UI", "sans-serif"],
        body: ["Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 27, 45, 0.06), 0 1px 1px rgba(16, 27, 45, 0.04)"
      }
    }
  },
  plugins: []
};

export default config;
