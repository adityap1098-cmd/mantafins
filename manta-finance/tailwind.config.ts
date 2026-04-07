import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#6366f1",
          light: "#818cf8",
          bg: "#eef2ff",
        },
        brand: {
          green: "#10b981",
          "green-bg": "#ecfdf5",
          "green-t": "#065f46",
          red: "#ef4444",
          "red-bg": "#fef2f2",
          "red-t": "#991b1b",
          orange: "#f59e0b",
          "orange-bg": "#fffbeb",
          "orange-t": "#92400e",
          blue: "#3b82f6",
          "blue-bg": "#eff6ff",
        },
        surface: {
          DEFAULT: "#ffffff",
          hover: "#f8f9fc",
          page: "#f5f6fa",
        },
        sidebar: {
          DEFAULT: "#0f1729",
          text: "#8a94a6",
        },
        "border-default": "#e8eaef",
        text1: "#1a1d26",
        text2: "#6b7280",
        text3: "#9ca3af",
      },
      fontFamily: {
        sans: ["DM Sans", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        card: "16px",
        input: "10px",
        badge: "6px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 16px rgba(0,0,0,0.06)",
        lg: "0 8px 32px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
