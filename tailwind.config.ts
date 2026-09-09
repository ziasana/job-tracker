import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F0F2F5",
        card: "#FFFFFF",
        ink: "#050505",
        hairline: "#DADDE1",
        muted: "#65676B",
        positive: "#42B72A",
        pending: "#F7B928",
        negative: "#FA383E",
        fb: {
          DEFAULT: "#1877F2",
          hover: "#166FE5",
          light: "#E7F3FF",
        },
      },
      fontFamily: {
        sans: [
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        fb: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
